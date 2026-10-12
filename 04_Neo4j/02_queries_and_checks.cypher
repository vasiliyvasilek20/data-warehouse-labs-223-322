// Надточиев А.Ф., группа 223-322
// 1. Все учебные узлы, ограничение 25.
MATCH (n:LabEntity) RETURN n.id AS id, labels(n) AS labels LIMIT 25;
// 2. Поиск по устойчивому прикладному идентификатору.
MATCH (n:LabEntity {id:'p03'}) RETURN n.id,n.name;
// 3. Поиск по свойству и по наличию свойства.
MATCH (n:Person:LabEntity {name:'Alex'}) RETURN n.id,n.name;
MATCH (n:LabEntity) WHERE n.name IS NOT NULL RETURN count(n) AS with_name;
// 4. Пара заданных узлов.
MATCH (a:LabEntity {id:'p01'}),(b:LabEntity {id:'p02'}) RETURN a.name,b.name;
// 5. Узлы с исходящей связью заданного типа.
MATCH (n:Person:LabEntity)-[:FAVORITE]->(:Movie:LabEntity) RETURN n.name ORDER BY n.name;
// 6. Соседи Alex, направление FRIENDS не учитывается.
MATCH (:Person:LabEntity {name:'Alex'})-[:FRIENDS]-(a) RETURN a.name ORDER BY a.name;
// 7. Счётчики узлов и связей, проверка требований задания.
MATCH (n:LabEntity) RETURN count(n) AS node_count, count(n)>=10 AS nodes_requirement;
MATCH (:LabEntity)-[r]->(:LabEntity) RETURN count(r) AS edge_count, count(r)>=30 AS edges_requirement;
MATCH (:LabEntity)-[r]->(:LabEntity) RETURN type(r) AS relationship_type,count(r) AS total ORDER BY relationship_type;
// 8. Изолированные узлы.
MATCH (n:LabEntity) WHERE NOT (n)--() RETURN count(n) AS isolated;
// 9. Кратчайший путь по дружбе.
MATCH (a:LabEntity {id:'p01'}),(b:LabEntity {id:'p10'}),p=shortestPath((a)-[:FRIENDS*..10]-(b))
RETURN [n IN nodes(p)|n.name] AS shortest_path,length(p) AS length;
// 10. Все кратчайшие пути, объединение двух типов связей.
MATCH (a:LabEntity {id:'p01'}),(b:LabEntity {id:'p10'}),p=allShortestPaths((a)-[:FRIENDS|KNOWS*..10]-(b))
RETURN [n IN nodes(p)|n.name] AS path,length(p) AS length;
// 11. Обход до двух переходов по FRIENDS; возвращается множество достигнутых узлов.
MATCH (a:LabEntity {id:'p01'})-[:FRIENDS*1..2]-(b:Person) WHERE a<>b
RETURN DISTINCT b.name AS reachable ORDER BY reachable;
// 12. Максимальный прикладной идентификатор Person.
MATCH (n:Person:LabEntity) RETURN n.id,n.name ORDER BY n.id DESC LIMIT 1;
// 13. Удаление изолированного тестового узла, основной граф сохраняется.
CREATE (:LabEntity:LabTemp {id:'temp-isolated',name:'temporary'});
MATCH (n:LabTemp {id:'temp-isolated'}) WHERE NOT (n)--() DELETE n;
MATCH (n:LabEntity) RETURN count(n) AS nodes_after_delete;
// 14. Удаление тестового графа со связью в отдельной метке LabDeleteDemo.
CREATE (a:LabDeleteDemo {id:'demo-a'})-[:DEMO]->(:LabDeleteDemo {id:'demo-b'});
MATCH (n:LabDeleteDemo) DETACH DELETE n;
MATCH (n:LabDeleteDemo) RETURN count(n) AS deletion_demo_remaining;
// 15. Проверка дубликатов и петель.
MATCH (a:LabEntity)-[r]->(b:LabEntity) WITH a.id AS a,b.id AS b,type(r) AS t,count(*) AS c
WHERE c>1 RETURN count(*) AS duplicate_edge_groups;
MATCH (n:LabEntity)-[r]->(n) RETURN count(r) AS self_loops;
// 16. Эквиваленты старых START по внутреннему ID и максимальному ID.
// Внутренние ID используются только в пределах этой учебной проверки.
MATCH (original:LabEntity {id:'p03'}) WITH id(original) AS target_id
MATCH (n:LabEntity) WHERE id(n)=target_id RETURN n.id AS found_by_internal_id;
MATCH (a:LabEntity {id:'p01'}),(b:LabEntity {id:'p02'}) WITH id(a) AS a_id,id(b) AS b_id
MATCH (x:LabEntity),(y:LabEntity) WHERE id(x)=a_id AND id(y)=b_id RETURN x.name,y.name;
MATCH (n:LabEntity) RETURN n.id AS application_id,id(n) AS internal_id ORDER BY internal_id DESC LIMIT 1;
