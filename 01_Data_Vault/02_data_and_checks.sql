-- Надточиев А.Ф., группа 223-322
SET search_path TO lab_dv,public;
SET timezone TO 'UTC';
-- Учебные вымышленные данные. Одна согласованная снимковая партия на момент загрузки.
TRUNCATE stage_rental_item;
INSERT INTO stage_rental_item VALUES
('B1','2026-10-01 10:00+00','SKI_RENTAL','CL-001','Иван Петров','student','RENT-001','Учебный прокат 1','NAD-SN-101','Учебный Snow A','2025-12-01','issued',1,NULL),
('B1','2026-10-01 10:00+00','SKI_RENTAL','CL-002','Анна Иванова','student','RENT-002','Учебный прокат 2','NAD-SN-101','Учебный Snow A','2025-12-01','returned',1,'2026-09-30 08:00+00'),
('B1','2026-10-01 10:00+00','SKI_RENTAL','CL-003','Павел Соколов','student','RENT-003','Учебный прокат 3','NAD-SN-103','Учебный Snow B','2025-12-01','reserved',1,NULL),
('B1','2026-10-01 10:00+00','SKI_RENTAL','CL-001','Иван Петров','student','RENT-001','Учебный прокат 1','NAD-SN-103','Учебный Snow B','2025-12-01','reserved',1,NULL),
('B1','2026-10-01 10:00+00','SKI_RENTAL',NULL,'Неполная запись','student','RENT-001','Учебный прокат 1','NAD-SN-101','Учебный Snow A','2025-12-01','reserved',1,NULL);
SELECT load_batch('B1');
SELECT load_batch('B1');
INSERT INTO stage_rental_item
SELECT 'B2','2026-10-02 10:00+00',record_source,client_code,client_name,client_segment,
rental_number,rental_description,serial_number,equipment_name,purchase_date,'returned',1,'2026-10-02 09:00+00'::timestamptz
FROM stage_rental_item WHERE batch_id='B1' AND client_code='CL-001' AND serial_number='NAD-SN-101';
SELECT load_batch('B2');
SELECT load_batch('B2');
-- Проверка возврата состояния A -> B -> A: третья версия должна сохраниться.
INSERT INTO stage_rental_item
SELECT 'B3','2026-10-03 10:00+00',record_source,client_code,client_name,client_segment,
rental_number,rental_description,serial_number,equipment_name,purchase_date,status,quantity,returned_at
FROM stage_rental_item WHERE batch_id='B1' AND client_code='CL-001' AND serial_number='NAD-SN-101';
SELECT load_batch('B3');
SELECT load_batch('B3');
DO $$ BEGIN
 IF (SELECT count(*) FROM hub_client)<>3 THEN RAISE EXCEPTION 'client count'; END IF;
 IF (SELECT count(*) FROM hub_rental)<>3 THEN RAISE EXCEPTION 'rental count'; END IF;
 IF (SELECT count(*) FROM hub_equipment)<>2 THEN RAISE EXCEPTION 'equipment count'; END IF;
 IF (SELECT count(*) FROM link_rental_item)<>4 THEN RAISE EXCEPTION 'link count'; END IF;
 IF (SELECT count(*) FROM sat_rental_item)<>6 THEN RAISE EXCEPTION 'history count'; END IF;
 IF (SELECT count(*) FROM sat_client)<>3 THEN RAISE EXCEPTION 'unchanged satellite duplicated'; END IF;
 IF (SELECT count(*) FROM rejected_rental_item)<>1 THEN RAISE EXCEPTION 'rejected count'; END IF;
 IF (SELECT count(*) FROM mart_current_rental_item)<>4 THEN RAISE EXCEPTION 'mart count'; END IF;
 IF (SELECT status FROM mart_current_rental_item WHERE client_code='CL-001' AND serial_number='NAD-SN-101')<>'issued' THEN RAISE EXCEPTION 'current version'; END IF;
 IF hash_key('a|b','c')=hash_key('a','b|c') THEN RAISE EXCEPTION 'ambiguous hash serialization'; END IF;
 IF hash_key(NULL::text)=hash_key('') THEN RAISE EXCEPTION 'null equals empty'; END IF;
END $$;
SELECT 'ALL DATA VAULT CHECKS PASSED' AS result;
SELECT 'hub_client' AS object,count(*) FROM hub_client UNION ALL
SELECT 'hub_rental',count(*) FROM hub_rental UNION ALL SELECT 'hub_equipment',count(*) FROM hub_equipment UNION ALL
SELECT 'link_rental_item',count(*) FROM link_rental_item UNION ALL
SELECT 'sat_client',count(*) FROM sat_client UNION ALL
SELECT 'sat_rental',count(*) FROM sat_rental UNION ALL
SELECT 'sat_equipment',count(*) FROM sat_equipment UNION ALL
SELECT 'sat_rental_item',count(*) FROM sat_rental_item UNION ALL
SELECT 'rejected_rental_item',count(*) FROM rejected_rental_item;
SELECT * FROM mart_current_rental_item ORDER BY client_code,serial_number;
SELECT s.load_date,s.status,s.quantity FROM sat_rental_item s
WHERE rental_item_hk=hash_key('CL-001','RENT-001','NAD-SN-101') ORDER BY load_date;
