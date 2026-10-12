-- Надточиев А.Ф., группа 223-322
-- PostgreSQL 16+. Повторный запуск не удаляет существующие данные.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS lab_dv;
SET search_path TO lab_dv, public;
CREATE OR REPLACE FUNCTION hash_key(VARIADIC parts text[]) RETURNS text
LANGUAGE sql IMMUTABLE STRICT AS $$
 SELECT encode(digest(array_to_json(parts)::text, 'sha256'), 'hex')
$$;
CREATE TABLE IF NOT EXISTS stage_submission (
 batch_id text, load_date timestamptz, record_source text,
 student_code text, student_name text, group_code text,
 course_code text, course_name text,
 task_code text, task_name text, deadline date,
 status text, grade integer, submitted_at timestamptz
);
CREATE TABLE IF NOT EXISTS rejected_submission (LIKE stage_submission, reason text);
CREATE TABLE IF NOT EXISTS hub_student (
 student_hk text PRIMARY KEY, student_code text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_course (
 course_hk text PRIMARY KEY, course_code text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_task (
 task_hk text PRIMARY KEY, task_code text NOT NULL UNIQUE,
 load_date timestamptz NOT NULL, record_source text NOT NULL
);
CREATE TABLE IF NOT EXISTS link_submission (
 submission_hk text PRIMARY KEY,
 student_hk text NOT NULL REFERENCES hub_student,
 course_hk text NOT NULL REFERENCES hub_course,
 task_hk text NOT NULL REFERENCES hub_task,
 load_date timestamptz NOT NULL, record_source text NOT NULL,
 UNIQUE(student_hk, course_hk, task_hk)
);
CREATE TABLE IF NOT EXISTS sat_student_lms (
 student_hk text REFERENCES hub_student, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 student_name text, group_code text, PRIMARY KEY(student_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_course_lms (
 course_hk text REFERENCES hub_course, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 course_name text, PRIMARY KEY(course_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_task_lms (
 task_hk text REFERENCES hub_task, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 task_name text, deadline date, PRIMARY KEY(task_hk,load_date)
);
CREATE TABLE IF NOT EXISTS sat_submission_lms (
 submission_hk text REFERENCES link_submission, load_date timestamptz NOT NULL,
 record_source text NOT NULL, hash_diff text NOT NULL,
 status text, grade integer, submitted_at timestamptz,
 PRIMARY KEY(submission_hk,load_date)
);
CREATE OR REPLACE FUNCTION load_batch(p_batch text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO rejected_submission
 SELECT s.*, 'Missing business key or load metadata'
 FROM stage_submission s WHERE batch_id=p_batch
 AND (nullif(btrim(student_code),'') IS NULL OR nullif(btrim(course_code),'') IS NULL
 OR nullif(btrim(task_code),'') IS NULL OR load_date IS NULL OR record_source IS NULL)
 AND NOT EXISTS (SELECT 1 FROM rejected_submission r
   WHERE r.batch_id=s.batch_id AND r.student_code IS NOT DISTINCT FROM s.student_code
   AND r.course_code IS NOT DISTINCT FROM s.course_code AND r.task_code IS NOT DISTINCT FROM s.task_code);
 DROP TABLE IF EXISTS pg_temp.batch_valid;
 CREATE TEMP TABLE batch_valid ON COMMIT DROP AS
 SELECT s.*, hash_key(student_code) student_hk, hash_key(course_code) course_hk,
 hash_key(task_code) task_hk, hash_key(student_code,course_code,task_code) submission_hk
 FROM stage_submission s WHERE batch_id=p_batch
 AND nullif(btrim(student_code),'') IS NOT NULL AND nullif(btrim(course_code),'') IS NOT NULL
 AND nullif(btrim(task_code),'') IS NOT NULL AND load_date IS NOT NULL AND record_source IS NOT NULL;
 INSERT INTO hub_student SELECT DISTINCT ON(student_hk) student_hk,student_code,load_date,record_source
 FROM batch_valid ORDER BY student_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO hub_course SELECT DISTINCT ON(course_hk) course_hk,course_code,load_date,record_source
 FROM batch_valid ORDER BY course_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO hub_task SELECT DISTINCT ON(task_hk) task_hk,task_code,load_date,record_source
 FROM batch_valid ORDER BY task_hk,load_date ON CONFLICT DO NOTHING;
 INSERT INTO link_submission SELECT submission_hk,student_hk,course_hk,task_hk,load_date,record_source
 FROM batch_valid ON CONFLICT DO NOTHING;
 INSERT INTO sat_student_lms
 SELECT DISTINCT ON(b.student_hk) b.student_hk,b.load_date,b.record_source,
 hash_key(b.student_name,b.group_code),b.student_name,b.group_code
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_student_lms s WHERE s.student_hk=b.student_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_student_lms WHERE student_hk=b.student_hk)
 AND s.hash_diff=hash_key(b.student_name,b.group_code))
 ORDER BY b.student_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_course_lms
 SELECT DISTINCT ON(b.course_hk) b.course_hk,b.load_date,b.record_source,hash_key(b.course_name),b.course_name
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_course_lms s WHERE s.course_hk=b.course_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_course_lms WHERE course_hk=b.course_hk)
 AND s.hash_diff=hash_key(b.course_name)) ORDER BY b.course_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_task_lms
 SELECT DISTINCT ON(b.task_hk) b.task_hk,b.load_date,b.record_source,
 hash_key(b.task_name,b.deadline::text),b.task_name,b.deadline
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_task_lms s WHERE s.task_hk=b.task_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_task_lms WHERE task_hk=b.task_hk)
 AND s.hash_diff=hash_key(b.task_name,b.deadline::text)) ORDER BY b.task_hk,b.load_date ON CONFLICT DO NOTHING;
 INSERT INTO sat_submission_lms
 SELECT b.submission_hk,b.load_date,b.record_source,
 hash_key(b.status,b.grade::text,b.submitted_at::text),b.status,b.grade,b.submitted_at
 FROM batch_valid b WHERE NOT EXISTS (
 SELECT 1 FROM sat_submission_lms s WHERE s.submission_hk=b.submission_hk
 AND s.load_date=(SELECT max(load_date) FROM sat_submission_lms WHERE submission_hk=b.submission_hk)
 AND s.hash_diff=hash_key(b.status,b.grade::text,b.submitted_at::text)) ON CONFLICT DO NOTHING;
END $$;
CREATE OR REPLACE VIEW mart_current_submission AS
SELECT st.student_code,ss.student_name,ss.group_code,c.course_code,cs.course_name,
 t.task_code,ts.task_name,rs.status,rs.grade,rs.submitted_at
FROM link_submission l
JOIN hub_student st USING(student_hk) JOIN hub_course c USING(course_hk) JOIN hub_task t USING(task_hk)
JOIN LATERAL (SELECT * FROM sat_student_lms s WHERE s.student_hk=l.student_hk ORDER BY load_date DESC LIMIT 1) ss ON true
JOIN LATERAL (SELECT * FROM sat_course_lms s WHERE s.course_hk=l.course_hk ORDER BY load_date DESC LIMIT 1) cs ON true
JOIN LATERAL (SELECT * FROM sat_task_lms s WHERE s.task_hk=l.task_hk ORDER BY load_date DESC LIMIT 1) ts ON true
JOIN LATERAL (SELECT * FROM sat_submission_lms s WHERE s.submission_hk=l.submission_hk ORDER BY load_date DESC LIMIT 1) rs ON true;
