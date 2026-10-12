-- Надточиев А.Ф., группа 223-322
SET search_path TO lab_dv,public;
SET timezone TO 'UTC';
-- Учебные вымышленные данные. Одна согласованная снимковая партия на момент загрузки.
TRUNCATE stage_submission;
INSERT INTO stage_submission VALUES
('B1','2026-10-01 10:00+00','LMS','ST-001','Иван Петров','223-322','DB','СУБД','DB-PR01','Создание таблиц','2026-10-10','submitted',NULL,'2026-10-01 09:00+00'),
('B1','2026-10-01 10:00+00','LMS','ST-002','Анна Иванова','223-322','DB','СУБД','DB-PR01','Создание таблиц','2026-10-10','graded',5,'2026-10-01 08:00+00'),
('B1','2026-10-01 10:00+00','LMS','ST-003','Павел Соколов','223-322','DB','СУБД','DB-PR02','Запросы SQL','2026-10-15','draft',NULL,NULL),
('B1','2026-10-01 10:00+00','LMS','ST-001','Иван Петров','223-322','DB','СУБД','DB-PR02','Запросы SQL','2026-10-15','draft',NULL,NULL),
('B1','2026-10-01 10:00+00','LMS',NULL,'Неполная запись','223-322','DB','СУБД','DB-PR01','Создание таблиц','2026-10-10','draft',NULL,NULL);
SELECT load_batch('B1');
SELECT load_batch('B1');
INSERT INTO stage_submission
SELECT 'B2','2026-10-02 10:00+00',record_source,student_code,student_name,group_code,
course_code,course_name,task_code,task_name,deadline,'graded',4,submitted_at
FROM stage_submission WHERE batch_id='B1' AND student_code='ST-001' AND task_code='DB-PR01';
SELECT load_batch('B2');
SELECT load_batch('B2');
-- Проверка возврата состояния A -> B -> A: третья версия должна сохраниться.
INSERT INTO stage_submission
SELECT 'B3','2026-10-03 10:00+00',record_source,student_code,student_name,group_code,
course_code,course_name,task_code,task_name,deadline,status,grade,submitted_at
FROM stage_submission WHERE batch_id='B1' AND student_code='ST-001' AND task_code='DB-PR01';
SELECT load_batch('B3');
SELECT load_batch('B3');
DO $$ BEGIN
 IF (SELECT count(*) FROM hub_student)<>3 THEN RAISE EXCEPTION 'student count'; END IF;
 IF (SELECT count(*) FROM hub_course)<>1 THEN RAISE EXCEPTION 'course count'; END IF;
 IF (SELECT count(*) FROM hub_task)<>2 THEN RAISE EXCEPTION 'task count'; END IF;
 IF (SELECT count(*) FROM link_submission)<>4 THEN RAISE EXCEPTION 'link count'; END IF;
 IF (SELECT count(*) FROM sat_submission_lms)<>6 THEN RAISE EXCEPTION 'history count'; END IF;
 IF (SELECT count(*) FROM sat_student_lms)<>3 THEN RAISE EXCEPTION 'unchanged satellite duplicated'; END IF;
 IF (SELECT count(*) FROM rejected_submission)<>1 THEN RAISE EXCEPTION 'rejected count'; END IF;
 IF (SELECT count(*) FROM mart_current_submission)<>4 THEN RAISE EXCEPTION 'mart count'; END IF;
 IF (SELECT status FROM mart_current_submission WHERE student_code='ST-001' AND task_code='DB-PR01')<>'submitted' THEN RAISE EXCEPTION 'current version'; END IF;
 IF hash_key('a|b','c')=hash_key('a','b|c') THEN RAISE EXCEPTION 'ambiguous hash serialization'; END IF;
 IF hash_key(NULL::text)=hash_key('') THEN RAISE EXCEPTION 'null equals empty'; END IF;
END $$;
SELECT 'ALL DATA VAULT CHECKS PASSED' AS result;
SELECT 'hub_student' AS object,count(*) FROM hub_student UNION ALL
SELECT 'hub_course',count(*) FROM hub_course UNION ALL SELECT 'hub_task',count(*) FROM hub_task UNION ALL
SELECT 'link_submission',count(*) FROM link_submission UNION ALL
SELECT 'sat_student_lms',count(*) FROM sat_student_lms UNION ALL
SELECT 'sat_course_lms',count(*) FROM sat_course_lms UNION ALL
SELECT 'sat_task_lms',count(*) FROM sat_task_lms UNION ALL
SELECT 'sat_submission_lms',count(*) FROM sat_submission_lms UNION ALL
SELECT 'rejected_submission',count(*) FROM rejected_submission;
SELECT * FROM mart_current_submission ORDER BY student_code,task_code;
SELECT s.load_date,s.status,s.grade FROM sat_submission_lms s
WHERE submission_hk=hash_key('ST-001','DB','DB-PR01') ORDER BY load_date;
