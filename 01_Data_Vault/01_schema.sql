-- Надточиев А.Ф., группа 223-322
-- PostgreSQL 16+. Повторный запуск не удаляет существующие данные.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS lab_dv;
SET search_path TO lab_dv, public;
CREATE OR REPLACE FUNCTION hash_key(VARIADIC parts text[]) RETURNS text
LANGUAGE sql IMMUTABLE STRICT AS $$
 SELECT encode(public.digest(array_to_json(parts)::text, 'sha256'), 'hex')
$$;
CREATE TABLE IF NOT EXISTS stage_rental_item (
 batch_id text, load_date timestamptz, record_source text,
 client_code text, client_name text, client_segment text,
 rental_number text, rental_description text,
 serial_number text, equipment_name text, purchase_date date,
 status text, quantity integer, returned_at timestamptz
);
CREATE TABLE IF NOT EXISTS rejected_rental_item (LIKE stage_rental_item, reason text);
CREATE TABLE IF NOT EXISTS hub_client (
 client_hk text PRIMARY KEY, client_code text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_rental (
 rental_hk text PRIMARY KEY, rental_number text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_equipment (
 equipment_hk text PRIMARY KEY, serial_number text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS link_rental_item (
 rental_item_hk text PRIMARY KEY,
 client_hk text NOT NULL REFERENCES hub_client,
 rental_hk text NOT NULL REFERENCES hub_rental,
 equipment_hk text NOT NULL REFERENCES hub_equipment,
 load_date timestamptz NOT NULL, record_source text NOT NULL,
 UNIQUE(client_hk, rental_hk, equipment_hk)
);
CREATE TABLE IF NOT EXISTS sat_client (
 client_hk text REFERENCES hub_client, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 client_name text, client_segment text, PRIMARY KEY(client_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_rental (
 rental_hk text REFERENCES hub_rental, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 rental_description text, PRIMARY KEY(rental_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_equipment (
 equipment_hk text REFERENCES hub_equipment, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 equipment_name text, purchase_date date, PRIMARY KEY(equipment_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_rental_item (
 rental_item_hk text REFERENCES link_rental_item, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 status text, quantity integer, returned_at timestamptz,
 PRIMARY KEY(rental_item_hk,load_date)
);
CREATE OR REPLACE FUNCTION load_batch(p_batch text) RETURNS void LANGUAGE plpgsql SET timezone TO 'UTC' SET search_path TO lab_dv,public AS $$
BEGIN
 INSERT INTO rejected_rental_item
 SELECT s.*, 'Missing business key or load metadata'
 FROM stage_rental_item s WHERE batch_id=p_batch
 AND (nullif(btrim(client_code),'') IS NULL OR nullif(btrim(rental_number),'') IS NULL
 OR nullif(btrim(serial_number),'') IS NULL OR load_date IS NULL OR record_source IS NULL)
 AND NOT EXISTS (SELECT 1 FROM rejected_rental_item r
   WHERE r.batch_id=s.batch_id AND r.client_code IS NOT DISTINCT FROM s.client_code
   AND r.rental_number IS NOT DISTINCT FROM s.rental_number AND r.serial_number IS NOT DISTINCT FROM s.serial_number);
 DROP TABLE IF EXISTS pg_temp.batch_valid;
 CREATE TEMP TABLE batch_valid ON COMMIT DROP AS
 SELECT s.*, hash_key(client_code) client_hk, hash_key(rental_number) rental_hk,
 hash_key(serial_number) equipment_hk, hash_key(client_code,rental_number,serial_number) rental_item_hk
 FROM stage_rental_item s WHERE batch_id=p_batch
 AND nullif(btrim(client_code),'') IS NOT NULL AND nullif(btrim(rental_number),'') IS NOT NULL
 AND nullif(btrim(serial_number),'') IS NOT NULL AND load_date IS NOT NULL AND record_source IS NOT NULL;
 INSERT INTO hub_client SELECT DISTINCT ON(client_hk) client_hk,client_code,load_date,record_source
 FROM batch_valid ORDER BY client_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO hub_rental SELECT DISTINCT ON(rental_hk) rental_hk,rental_number,load_date,record_source
 FROM batch_valid ORDER BY rental_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO hub_equipment SELECT DISTINCT ON(equipment_hk) equipment_hk,serial_number,load_date,record_source
 FROM batch_valid ORDER BY equipment_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO link_rental_item SELECT rental_item_hk,client_hk,rental_hk,equipment_hk,load_date,record_source
 FROM batch_valid ON CONFLICT DO NOTHING;
 INSERT INTO sat_client
 SELECT DISTINCT ON(b.client_hk) b.client_hk,b.load_date,b.record_source,
 hash_key(b.client_name,b.client_segment),b.client_name,b.client_segment
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_client s WHERE s.client_hk=b.client_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_client WHERE client_hk=b.client_hk)
 AND s.hash_diff=hash_key(b.client_name,b.client_segment))
 ORDER BY b.client_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_rental
 SELECT DISTINCT ON(b.rental_hk) b.rental_hk,b.load_date,b.record_source,hash_key(b.rental_description),b.rental_description
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_rental s WHERE s.rental_hk=b.rental_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_rental WHERE rental_hk=b.rental_hk)
 AND s.hash_diff=hash_key(b.rental_description)) ORDER BY b.rental_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_equipment
 SELECT DISTINCT ON(b.equipment_hk) b.equipment_hk,b.load_date,b.record_source,
 hash_key(b.equipment_name,b.purchase_date::text),b.equipment_name,b.purchase_date
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_equipment s WHERE s.equipment_hk=b.equipment_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_equipment WHERE equipment_hk=b.equipment_hk)
 AND s.hash_diff=hash_key(b.equipment_name,b.purchase_date::text)) ORDER BY b.equipment_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_rental_item
 SELECT b.rental_item_hk,b.load_date,b.record_source,
 hash_key(b.status,b.quantity::text,b.returned_at::text),b.status,b.quantity,b.returned_at
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_rental_item s WHERE s.rental_item_hk=b.rental_item_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_rental_item WHERE rental_item_hk=b.rental_item_hk)
 AND s.hash_diff=hash_key(b.status,b.quantity::text,b.returned_at::text)) ON CONFLICT DO NOTHING;
END $$;
CREATE OR REPLACE VIEW mart_current_rental_item AS
SELECT st.client_code,ss.client_name,ss.client_segment,c.rental_number,cs.rental_description,
 t.serial_number,ts.equipment_name,rs.status,rs.quantity,rs.returned_at
FROM link_rental_item l
JOIN hub_client st USING(client_hk) JOIN hub_rental c USING(rental_hk) JOIN hub_equipment t USING(equipment_hk)
JOIN LATERAL (SELECT * FROM sat_client s WHERE s.client_hk=l.client_hk ORDER BY load_date DESC LIMIT 1) ss ON true
JOIN LATERAL (SELECT * FROM sat_rental s WHERE s.rental_hk=l.rental_hk ORDER BY load_date DESC LIMIT 1) cs ON true
JOIN LATERAL (SELECT * FROM sat_equipment s WHERE s.equipment_hk=l.equipment_hk ORDER BY load_date DESC LIMIT 1) ts ON true
JOIN LATERAL (SELECT * FROM sat_rental_item s WHERE s.rental_item_hk=l.rental_item_hk ORDER BY load_date DESC LIMIT 1) rs ON true;
