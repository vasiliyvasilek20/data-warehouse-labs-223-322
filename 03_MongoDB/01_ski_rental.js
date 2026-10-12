// Надточиев А.Ф., группа 223-322
// Адаптация предоставленного учебного примера варианта 15.
// Схема коллекций взята из примера; загрузка, CRUD и проверки переработаны.
// Только отдельная учебная база. Все персональные записи вымышлены.
const lab = db.getSiblingDB("nadtochiev_ski_lab");
function requireCheck(condition,message) {
 if (!condition) throw new Error("FAILED: "+message);
 print("PASS: "+message);
}
function seed(collection, documents) {
 const docs=documents.map(document=>{
  const d={...document};
  if (collection==="klient" || collection==="sotrudnik") {
   d.imya="Учебный пользователь "+d._id;
   d.familiya="Пример"; d.otchestvo="";
   d.telefon="DEMO-"+collection+"-"+d._id;
   d.email=collection+"-"+d._id+"@example.invalid";
   if(d.adres!==undefined)d.adres="Учебный адрес "+d._id;
  }
  if (collection==="dokument") {
   d.seriya="DEMO";d.nomer="DEMO-"+d._id;
   d.kem_vydan="Учебный пример";
  }
  if(collection==="uchet_zapis") d.khesh_parolya="demo_only_not_an_authentication_hash";
  return d;
 });
 lab.getCollection(collection).bulkWrite(docs.map(d=>({replaceOne:{filter:{_id:d._id},replacement:d,upsert:true}})));
}
// ========== 1. KATEGORIYA ==========
seed("kategoriya",[
  { _id: 1,  nazvanie: "Горные лыжи",   opisanie: "Лыжи для горнолыжного катания" },
  { _id: 2,  nazvanie: "Беговые лыжи",  opisanie: "Классические и коньковые" },
  { _id: 3,  nazvanie: "Сноуборды",     opisanie: "Для фрирайда и фристайла" },
  { _id: 4,  nazvanie: "Ботинки",       opisanie: "Горнолыжные и сноубордические" },
  { _id: 5,  nazvanie: "Палки",         opisanie: "Лыжные палки" },
  { _id: 6,  nazvanie: "Шлемы",         opisanie: "Защита головы" },
  { _id: 7,  nazvanie: "Очки",          opisanie: "Маски и очки" },
  { _id: 8,  nazvanie: "Перчатки",      opisanie: "Тёплые перчатки" },
  { _id: 9,  nazvanie: "Куртки",        opisanie: "Мембранные куртки" },
  { _id: 10, nazvanie: "Термобельё",    opisanie: "Термоодежда" }
])

// ========== 2. BREND ==========
seed("brend",[
  { _id: 1,  nazvanie: "Rossignol",  strana: "Франция" },
  { _id: 2,  nazvanie: "Atomic",     strana: "Австрия" },
  { _id: 3,  nazvanie: "Fischer",    strana: "Австрия" },
  { _id: 4,  nazvanie: "Head",       strana: "Австрия" },
  { _id: 5,  nazvanie: "Salomon",    strana: "Франция" },
  { _id: 6,  nazvanie: "Burton",     strana: "США" },
  { _id: 7,  nazvanie: "Nike",       strana: "США" },
  { _id: 8,  nazvanie: "Adidas",     strana: "Германия" },
  { _id: 9,  nazvanie: "K2",         strana: "США" },
  { _id: 10, nazvanie: "Decathlon",  strana: "Франция" }
])

// ========== 3. MODEL_INVENTARYA ==========
seed("model_inventarya",[
  { _id: 1,  nazvanie: "Rossignol Hero Elite", kategoriya_id: 1, brend_id: 1, razmer: "165", god: 2023 },
  { _id: 2,  nazvanie: "Atomic Redster S9",    kategoriya_id: 1, brend_id: 2, razmer: "170", god: 2023 },
  { _id: 3,  nazvanie: "Fischer RC4",          kategoriya_id: 1, brend_id: 3, razmer: "160", god: 2022 },
  { _id: 4,  nazvanie: "Salomon S/Max",        kategoriya_id: 2, brend_id: 5, razmer: "180", god: 2023 },
  { _id: 5,  nazvanie: "Burton Custom",        kategoriya_id: 3, brend_id: 6, razmer: "158", god: 2023 },
  { _id: 6,  nazvanie: "Head Raptor",          kategoriya_id: 4, brend_id: 4, razmer: "42",  god: 2022 },
  { _id: 7,  nazvanie: "K2 Mindbender",        kategoriya_id: 1, brend_id: 9, razmer: "172", god: 2023 },
  { _id: 8,  nazvanie: "Rossignol Tactic",     kategoriya_id: 5, brend_id: 1, razmer: "120", god: 2022 },
  { _id: 9,  nazvanie: "Atomic Savor",         kategoriya_id: 6, brend_id: 2, razmer: "M",   god: 2023 },
  { _id: 10, nazvanie: "Nike Therma-FIT",      kategoriya_id: 9, brend_id: 7, razmer: "L",   god: 2023 }
])

// ========== 4. KLIENT ==========
seed("klient",[
  { _id: 1,  imya: "Иван",    familiya: "Петров",   otchestvo: "Сергеевич",  data_rozhdeniya: new Date("1990-05-12"), telefon: "+79001112233", email: "ivan@mail.ru",   adres: "Москва, Ленина 10",        data_registratsii: new Date("2023-11-01") },
  { _id: 2,  imya: "Анна",    familiya: "Смирнова", otchestvo: "Ивановна",   data_rozhdeniya: new Date("1995-08-22"), telefon: "+79002223344", email: "anna@mail.ru",   adres: "СПб, Невский 25",          data_registratsii: new Date("2023-11-05") },
  { _id: 3,  imya: "Сергей",  familiya: "Иванов",   otchestvo: "Петрович",   data_rozhdeniya: new Date("1988-03-15"), telefon: "+79003334455", email: "sergey@mail.ru", adres: "Казань, Баумана 7",        data_registratsii: new Date("2023-11-10") },
  { _id: 4,  imya: "Мария",   familiya: "Козлова",  otchestvo: "Андреевна",  data_rozhdeniya: new Date("1998-12-01"), telefon: "+79004445566", email: "maria@mail.ru",  adres: "Новосибирск, Красный 100", data_registratsii: new Date("2023-12-01") },
  { _id: 5,  imya: "Дмитрий", familiya: "Орлов",    otchestvo: "Викторович", data_rozhdeniya: new Date("1992-07-19"), telefon: "+79005556677", email: "dmitry@mail.ru", adres: "Екатеринбург, Ленина 24",  data_registratsii: new Date("2024-01-15") },
  { _id: 6,  imya: "Ольга",   familiya: "Новикова", otchestvo: "Сергеевна",  data_rozhdeniya: new Date("1985-02-28"), telefon: "+79006667788", email: "olga@mail.ru",   adres: "Москва, Тверская 15",      data_registratsii: new Date("2024-02-01") },
  { _id: 7,  imya: "Павел",   familiya: "Морозов",  otchestvo: "Игоревич",   data_rozhdeniya: new Date("1994-09-09"), telefon: "+79007778899", email: "pavel@mail.ru",  adres: "Сочи, Курортный 33",       data_registratsii: new Date("2024-02-20") },
  { _id: 8,  imya: "Елена",   familiya: "Волкова",  otchestvo: "Дмитриевна", data_rozhdeniya: new Date("1991-11-11"), telefon: "+79008889900", email: "elena@mail.ru",  adres: "Москва, Арбат 5",          data_registratsii: new Date("2024-03-01") },
  { _id: 9,  imya: "Артём",   familiya: "Соколов",  otchestvo: "Олегович",   data_rozhdeniya: new Date("1996-04-04"), telefon: "+79009990011", email: "artem@mail.ru",  adres: "Владивосток, Светланская", data_registratsii: new Date("2024-03-10") },
  { _id: 10, imya: "Ксения",  familiya: "Лебедева", otchestvo: "Павловна",   data_rozhdeniya: new Date("1999-06-30"), telefon: "+79010001122", email: "ksenia@mail.ru", adres: "Краснодар, Красная 155",   data_registratsii: new Date("2024-03-15") }
])

// ========== 5. DOKUMENT ==========
seed("dokument",[
  { _id: 1,  klient_id: 1,  tip_dokumenta: "Паспорт РФ", seriya: "4509", nomer: "123456", kem_vydan: "ОВД Москвы",        data_vydachi: new Date("2010-06-15") },
  { _id: 2,  klient_id: 2,  tip_dokumenta: "Паспорт РФ", seriya: "4010", nomer: "234567", kem_vydan: "ОВД СПб",           data_vydachi: new Date("2015-08-22") },
  { _id: 3,  klient_id: 3,  tip_dokumenta: "Паспорт РФ", seriya: "9201", nomer: "345678", kem_vydan: "ОВД Казани",        data_vydachi: new Date("2008-03-15") },
  { _id: 4,  klient_id: 4,  tip_dokumenta: "Паспорт РФ", seriya: "5002", nomer: "456789", kem_vydan: "ОВД Новосибирска",  data_vydachi: new Date("2018-12-01") },
  { _id: 5,  klient_id: 5,  tip_dokumenta: "Паспорт РФ", seriya: "6503", nomer: "567890", kem_vydan: "ОВД Екатеринбурга", data_vydachi: new Date("2012-07-19") },
  { _id: 6,  klient_id: 6,  tip_dokumenta: "Паспорт РФ", seriya: "4504", nomer: "678901", kem_vydan: "ОВД Москвы",        data_vydachi: new Date("2005-02-28") },
  { _id: 7,  klient_id: 7,  tip_dokumenta: "Паспорт РФ", seriya: "0305", nomer: "789012", kem_vydan: "ОВД Сочи",          data_vydachi: new Date("2014-09-09") },
  { _id: 8,  klient_id: 8,  tip_dokumenta: "Паспорт РФ", seriya: "4506", nomer: "890123", kem_vydan: "ОВД Москвы",        data_vydachi: new Date("2011-11-11") },
  { _id: 9,  klient_id: 9,  tip_dokumenta: "Паспорт РФ", seriya: "0507", nomer: "901234", kem_vydan: "ОВД Владивостока",  data_vydachi: new Date("2016-04-04") },
  { _id: 10, klient_id: 10, tip_dokumenta: "Паспорт РФ", seriya: "0308", nomer: "012345", kem_vydan: "ОВД Краснодара",    data_vydachi: new Date("2019-06-30") }
])

// ========== 6. DOLZHNOST ==========
seed("dolzhnost",[
  { _id: 1,  nazvanie: "Директор",      oklad: 120000.00 },
  { _id: 2,  nazvanie: "Менеджер",      oklad: 70000.00  },
  { _id: 3,  nazvanie: "Оператор",      oklad: 50000.00  },
  { _id: 4,  nazvanie: "Кладовщик",     oklad: 45000.00  },
  { _id: 5,  nazvanie: "Техник",        oklad: 55000.00  },
  { _id: 6,  nazvanie: "Инструктор",    oklad: 60000.00  },
  { _id: 7,  nazvanie: "Администратор", oklad: 65000.00  },
  { _id: 8,  nazvanie: "Бухгалтер",     oklad: 80000.00  },
  { _id: 9,  nazvanie: "Уборщик",       oklad: 30000.00  },
  { _id: 10, nazvanie: "Стажёр",        oklad: 25000.00  }
])

// ========== 7. SOTRUDNIK ==========
seed("sotrudnik",[
  { _id: 1,  imya: "Алексей",  familiya: "Кузнецов", otchestvo: "Петрович",   telefon: "+79101112233", email: "alex@ski.ru",     data_priema: new Date("2020-01-15"), dolzhnost_id: 1 },
  { _id: 2,  imya: "Наталья",  familiya: "Попова",   otchestvo: "Ивановна",   telefon: "+79102223344", email: "nataly@ski.ru",   data_priema: new Date("2021-03-10"), dolzhnost_id: 2 },
  { _id: 3,  imya: "Виктор",   familiya: "Сидоров",  otchestvo: "Алексеевич", telefon: "+79103334455", email: "viktor@ski.ru",   data_priema: new Date("2021-06-20"), dolzhnost_id: 3 },
  { _id: 4,  imya: "Татьяна",  familiya: "Белова",   otchestvo: "Сергеевна",  telefon: "+79104445566", email: "tatyana@ski.ru",  data_priema: new Date("2022-02-01"), dolzhnost_id: 3 },
  { _id: 5,  imya: "Михаил",   familiya: "Громов",   otchestvo: "Олегович",   telefon: "+79105556677", email: "mihail@ski.ru",   data_priema: new Date("2022-09-15"), dolzhnost_id: 5 },
  { _id: 6,  imya: "Ирина",    familiya: "Крылова",  otchestvo: "Викторовна", telefon: "+79106667788", email: "irina@ski.ru",    data_priema: new Date("2023-01-10"), dolzhnost_id: 6 },
  { _id: 7,  imya: "Андрей",   familiya: "Титов",    otchestvo: "Николаевич", telefon: "+79107778899", email: "andrey@ski.ru",   data_priema: new Date("2023-04-05"), dolzhnost_id: 4 },
  { _id: 8,  imya: "Светлана", familiya: "Егорова",  otchestvo: "Андреевна",  telefon: "+79108889900", email: "svetlana@ski.ru", data_priema: new Date("2023-07-01"), dolzhnost_id: 8 },
  { _id: 9,  imya: "Роман",    familiya: "Фомин",    otchestvo: "Дмитриевич", telefon: "+79109990011", email: "roman@ski.ru",    data_priema: new Date("2024-01-20"), dolzhnost_id: 7 },
  { _id: 10, imya: "Юлия",     familiya: "Зайцева",  otchestvo: "Павловна",   telefon: "+79110001122", email: "yulia@ski.ru",    data_priema: new Date("2024-02-15"), dolzhnost_id: 10 }
])

// ========== 8. UCHET_ZAPIS ==========
seed("uchet_zapis",[
  { _id: 1,  sotrudnik_id: 1,  login: "admin",       khesh_parolya: "$2a$10$hash1",  rol: "admin",    aktiven: true  },
  { _id: 2,  sotrudnik_id: 2,  login: "manager1",    khesh_parolya: "$2a$10$hash2",  rol: "manager",  aktiven: true  },
  { _id: 3,  sotrudnik_id: 3,  login: "operator1",   khesh_parolya: "$2a$10$hash3",  rol: "operator", aktiven: true  },
  { _id: 4,  sotrudnik_id: 4,  login: "operator2",   khesh_parolya: "$2a$10$hash4",  rol: "operator", aktiven: true  },
  { _id: 5,  sotrudnik_id: 5,  login: "tehnik1",     khesh_parolya: "$2a$10$hash5",  rol: "operator", aktiven: true  },
  { _id: 6,  sotrudnik_id: 6,  login: "instruktor1", khesh_parolya: "$2a$10$hash6",  rol: "operator", aktiven: true  },
  { _id: 7,  sotrudnik_id: 7,  login: "sklad1",      khesh_parolya: "$2a$10$hash7",  rol: "operator", aktiven: true  },
  { _id: 8,  sotrudnik_id: 8,  login: "buh1",        khesh_parolya: "$2a$10$hash8",  rol: "manager",  aktiven: true  },
  { _id: 9,  sotrudnik_id: 9,  login: "admin2",      khesh_parolya: "$2a$10$hash9",  rol: "admin",    aktiven: false },
  { _id: 10, sotrudnik_id: 10, login: "stajer1",     khesh_parolya: "$2a$10$hash10", rol: "operator", aktiven: true  }
])

// ========== 9. STATUS_INVENTARYA ==========
seed("status_inventarya",[
  { _id: 1,  nazvanie: "Доступно" },
  { _id: 2,  nazvanie: "В прокате" },
  { _id: 3,  nazvanie: "На обслуживании" },
  { _id: 4,  nazvanie: "Списано" },
  { _id: 5,  nazvanie: "Забронировано" },
  { _id: 6,  nazvanie: "Повреждено" },
  { _id: 7,  nazvanie: "На складе" },
  { _id: 8,  nazvanie: "Просрочено" },
  { _id: 9,  nazvanie: "Резерв" },
  { _id: 10, nazvanie: "Утеряно" }
])

// ========== 10. EDINITSA_INVENTARYA ==========
seed("edinitsa_inventarya",[
  { _id: 1,  seriynyy_nomer: "SN-001", model_id: 1,  status_id: 1, data_pokupki: new Date("2023-10-01"), tsena: 45000.00, primechanie: "Новое" },
  { _id: 2,  seriynyy_nomer: "SN-002", model_id: 1,  status_id: 2, data_pokupki: new Date("2023-10-01"), tsena: 45000.00, primechanie: null },
  { _id: 3,  seriynyy_nomer: "SN-003", model_id: 2,  status_id: 1, data_pokupki: new Date("2023-10-05"), tsena: 52000.00, primechanie: null },
  { _id: 4,  seriynyy_nomer: "SN-004", model_id: 3,  status_id: 3, data_pokupki: new Date("2022-11-15"), tsena: 38000.00, primechanie: "Ремонт канта" },
  { _id: 5,  seriynyy_nomer: "SN-005", model_id: 4,  status_id: 1, data_pokupki: new Date("2023-09-20"), tsena: 41000.00, primechanie: null },
  { _id: 6,  seriynyy_nomer: "SN-006", model_id: 5,  status_id: 2, data_pokupki: new Date("2023-12-01"), tsena: 60000.00, primechanie: null },
  { _id: 7,  seriynyy_nomer: "SN-007", model_id: 6,  status_id: 1, data_pokupki: new Date("2022-08-10"), tsena: 25000.00, primechanie: null },
  { _id: 8,  seriynyy_nomer: "SN-008", model_id: 7,  status_id: 5, data_pokupki: new Date("2023-11-11"), tsena: 48000.00, primechanie: "Забронировано" },
  { _id: 9,  seriynyy_nomer: "SN-009", model_id: 8,  status_id: 1, data_pokupki: new Date("2022-12-20"), tsena: 8000.00,  primechanie: null },
  { _id: 10, seriynyy_nomer: "SN-010", model_id: 9,  status_id: 7, data_pokupki: new Date("2023-03-05"), tsena: 12000.00, primechanie: "На складе" }
])

// ========== 11. OBSLUZHIVANIE ==========
seed("obsluzhivanie",[
  { _id: 1,  edinitsa_id: 4,  sotrudnik_id: 5, data_nachala: new Date("2024-03-01"), data_okonchaniya: new Date("2024-03-05"), opisanie: "Заточка кантов",     stoimost: 3000.00 },
  { _id: 2,  edinitsa_id: 1,  sotrudnik_id: 5, data_nachala: new Date("2024-03-10"), data_okonchaniya: new Date("2024-03-12"), opisanie: "Парафин",            stoimost: 1500.00 },
  { _id: 3,  edinitsa_id: 6,  sotrudnik_id: 5, data_nachala: new Date("2024-03-15"), data_okonchaniya: null,                    opisanie: "Замена креплений",    stoimost: 5000.00 },
  { _id: 4,  edinitsa_id: 2,  sotrudnik_id: 5, data_nachala: new Date("2024-03-20"), data_okonchaniya: new Date("2024-03-22"), opisanie: "Чистка скользящей",   stoimost: 2000.00 },
  { _id: 5,  edinitsa_id: 7,  sotrudnik_id: 6, data_nachala: new Date("2024-03-25"), data_okonchaniya: new Date("2024-03-26"), opisanie: "Регулировка ботинок", stoimost: 1000.00 },
  { _id: 6,  edinitsa_id: 8,  sotrudnik_id: 5, data_nachala: new Date("2024-04-01"), data_okonchaniya: null,                    opisanie: "Проверка креплений",  stoimost: 800.00  },
  { _id: 7,  edinitsa_id: 3,  sotrudnik_id: 5, data_nachala: new Date("2024-04-05"), data_okonchaniya: new Date("2024-04-07"), opisanie: "Заточка кантов",     stoimost: 3000.00 },
  { _id: 8,  edinitsa_id: 9,  sotrudnik_id: 6, data_nachala: new Date("2024-04-10"), data_okonchaniya: new Date("2024-04-10"), opisanie: "Замена ручек",        stoimost: 500.00  },
  { _id: 9,  edinitsa_id: 10, sotrudnik_id: 5, data_nachala: new Date("2024-04-15"), data_okonchaniya: null,                    opisanie: "Проверка шлема",      stoimost: 0.00    },
  { _id: 10, edinitsa_id: 5,  sotrudnik_id: 5, data_nachala: new Date("2024-04-20"), data_okonchaniya: new Date("2024-04-21"), opisanie: "Смазка",              stoimost: 1200.00 }
])

// ========== 12. TARIF ==========
seed("tarif",[
  { _id: 1,  nazvanie: "Горные лыжи — час",    kategoriya_id: 1, edinitsa_izmereniya: "chas",    kolichestvo: 1, tsena: 500.00,   deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 2,  nazvanie: "Горные лыжи — сутки",  kategoriya_id: 1, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 2500.00,  deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 3,  nazvanie: "Беговые лыжи — сутки", kategoriya_id: 2, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 1500.00,  deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 4,  nazvanie: "Сноуборд — час",       kategoriya_id: 3, edinitsa_izmereniya: "chas",    kolichestvo: 1, tsena: 600.00,   deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 5,  nazvanie: "Сноуборд — сутки",     kategoriya_id: 3, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 3000.00,  deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 6,  nazvanie: "Ботинки — сутки",      kategoriya_id: 4, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 1000.00,  deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 7,  nazvanie: "Палки — сутки",        kategoriya_id: 5, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 400.00,   deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 8,  nazvanie: "Шлем — сутки",         kategoriya_id: 6, edinitsa_izmereniya: "sutki",   kolichestvo: 1, tsena: 700.00,   deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 9,  nazvanie: "Комплект выходных",    kategoriya_id: 1, edinitsa_izmereniya: "nedelya", kolichestvo: 1, tsena: 8000.00,  deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") },
  { _id: 10, nazvanie: "Комплект недельный",   kategoriya_id: 1, edinitsa_izmereniya: "nedelya", kolichestvo: 1, tsena: 12000.00, deystvuet_s: new Date("2023-11-01"), deystvuet_po: new Date("2025-11-01") }
])

// ========== 13. STATUS_PROKATA ==========
seed("status_prokata",[
  { _id: 1,  nazvanie: "Оформлен" },
  { _id: 2,  nazvanie: "Выдан" },
  { _id: 3,  nazvanie: "Возвращён" },
  { _id: 4,  nazvanie: "Просрочен" },
  { _id: 5,  nazvanie: "Отменён" },
  { _id: 6,  nazvanie: "Продлён" },
  { _id: 7,  nazvanie: "Частично возвращён" },
  { _id: 8,  nazvanie: "Утерян" },
  { _id: 9,  nazvanie: "Повреждён" },
  { _id: 10, nazvanie: "Завершён" }
])

// ========== 14. PROKAT ==========
seed("prokat",[
  {
    _id: 1, klient_id: 1, sotrudnik_id: 3, status_id: 3,
    nachalo_prokata: new Date("2024-01-10T10:00:00Z"),
    plan_okonchaniya: new Date("2024-01-12T10:00:00Z"),
    fakt_okonchaniya: new Date("2024-01-12T09:30:00Z"),
    zalog: 5000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 1, tarif_id: 2, kolichestvo: 1, tsena_fiks: 2500.00 },
      { edinitsa_id: 8, tarif_id: 7, kolichestvo: 1, tsena_fiks: 400.00 }
    ]
  },
  {
    _id: 2, klient_id: 2, sotrudnik_id: 3, status_id: 3,
    nachalo_prokata: new Date("2024-01-15T11:00:00Z"),
    plan_okonchaniya: new Date("2024-01-17T11:00:00Z"),
    fakt_okonchaniya: new Date("2024-01-17T10:45:00Z"),
    zalog: 6000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 2, tarif_id: 2, kolichestvo: 1, tsena_fiks: 2500.00 }
    ]
  },
  {
    _id: 3, klient_id: 3, sotrudnik_id: 4, status_id: 3,
    nachalo_prokata: new Date("2024-01-20T09:00:00Z"),
    plan_okonchaniya: new Date("2024-01-22T09:00:00Z"),
    fakt_okonchaniya: new Date("2024-01-22T09:15:00Z"),
    zalog: 4000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 3, tarif_id: 2, kolichestvo: 1, tsena_fiks: 2500.00 }
    ]
  },
  {
    _id: 4, klient_id: 4, sotrudnik_id: 3, status_id: 4,
    nachalo_prokata: new Date("2024-02-01T12:00:00Z"),
    plan_okonchaniya: new Date("2024-02-05T12:00:00Z"),
    fakt_okonchaniya: null,
    zalog: 5000.00, primechanie: "Просрочен",
    pozitsii: [
      { edinitsa_id: 5, tarif_id: 3, kolichestvo: 1, tsena_fiks: 1500.00 }
    ]
  },
  {
    _id: 5, klient_id: 5, sotrudnik_id: 4, status_id: 3,
    nachalo_prokata: new Date("2024-02-10T14:00:00Z"),
    plan_okonchaniya: new Date("2024-02-12T14:00:00Z"),
    fakt_okonchaniya: new Date("2024-02-12T13:30:00Z"),
    zalog: 7000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 6, tarif_id: 5, kolichestvo: 1, tsena_fiks: 3000.00 }
    ]
  },
  {
    _id: 6, klient_id: 6, sotrudnik_id: 3, status_id: 3,
    nachalo_prokata: new Date("2024-02-15T10:30:00Z"),
    plan_okonchaniya: new Date("2024-02-17T10:30:00Z"),
    fakt_okonchaniya: new Date("2024-02-17T10:00:00Z"),
    zalog: 3000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 7, tarif_id: 6, kolichestvo: 1, tsena_fiks: 1000.00 }
    ]
  },
  {
    _id: 7, klient_id: 7, sotrudnik_id: 4, status_id: 2,
    nachalo_prokata: new Date("2024-03-01T09:30:00Z"),
    plan_okonchaniya: new Date("2024-03-05T09:30:00Z"),
    fakt_okonchaniya: null,
    zalog: 5000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 8, tarif_id: 2, kolichestvo: 1, tsena_fiks: 2500.00 }
    ]
  },
  {
    _id: 8, klient_id: 8, sotrudnik_id: 3, status_id: 2,
    nachalo_prokata: new Date("2024-03-10T15:00:00Z"),
    plan_okonchaniya: new Date("2024-03-12T15:00:00Z"),
    fakt_okonchaniya: null,
    zalog: 2000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 9, tarif_id: 7, kolichestvo: 1, tsena_fiks: 400.00 }
    ]
  },
  {
    _id: 9, klient_id: 9, sotrudnik_id: 4, status_id: 1,
    nachalo_prokata: new Date("2024-03-15T11:00:00Z"),
    plan_okonchaniya: new Date("2024-03-18T11:00:00Z"),
    fakt_okonchaniya: null,
    zalog: 3000.00, primechanie: null,
    pozitsii: [
      { edinitsa_id: 10, tarif_id: 8, kolichestvo: 1, tsena_fiks: 700.00 }
    ]
  },
  {
    _id: 10, klient_id: 10, sotrudnik_id: 3, status_id: 5,
    nachalo_prokata: new Date("2024-03-20T10:00:00Z"),
    plan_okonchaniya: new Date("2024-03-25T10:00:00Z"),
    fakt_okonchaniya: new Date("2024-03-20T10:30:00Z"),
    zalog: 0.00, primechanie: "Отменён клиентом",
    pozitsii: [
      { edinitsa_id: 4, tarif_id: 2, kolichestvo: 1, tsena_fiks: 2500.00 }
    ]
  }
])

// ========== 15. SPOSOB_OPLATY ==========
seed("sposob_oplaty",[
  { _id: 1,  nazvanie: "Наличные" },
  { _id: 2,  nazvanie: "Банковская карта" },
  { _id: 3,  nazvanie: "СБП" },
  { _id: 4,  nazvanie: "Онлайн-перевод" },
  { _id: 5,  nazvanie: "QR-код" },
  { _id: 6,  nazvanie: "Безналичный расчёт" },
  { _id: 7,  nazvanie: "Подарочный сертификат" },
  { _id: 8,  nazvanie: "Рассрочка" },
  { _id: 9,  nazvanie: "Криптовалюта" },
  { _id: 10, nazvanie: "Бонусные баллы" }
])

// ========== 16. PLATEZH ==========
seed("platezh",[
  { _id: 1,  prokat_id: 1,  sposob_id: 2, summa: 2900.00, data_platezha: new Date("2024-01-10T10:05:00Z"), tip_platezha: "arenda" },
  { _id: 2,  prokat_id: 1,  sposob_id: 2, summa: 5000.00, data_platezha: new Date("2024-01-10T10:05:00Z"), tip_platezha: "zalog"  },
  { _id: 3,  prokat_id: 2,  sposob_id: 3, summa: 2500.00, data_platezha: new Date("2024-01-15T11:05:00Z"), tip_platezha: "arenda" },
  { _id: 4,  prokat_id: 3,  sposob_id: 1, summa: 2500.00, data_platezha: new Date("2024-01-20T09:05:00Z"), tip_platezha: "arenda" },
  { _id: 5,  prokat_id: 4,  sposob_id: 2, summa: 1500.00, data_platezha: new Date("2024-02-01T12:05:00Z"), tip_platezha: "arenda" },
  { _id: 6,  prokat_id: 5,  sposob_id: 3, summa: 3000.00, data_platezha: new Date("2024-02-10T14:05:00Z"), tip_platezha: "arenda" },
  { _id: 7,  prokat_id: 6,  sposob_id: 2, summa: 1000.00, data_platezha: new Date("2024-02-15T10:35:00Z"), tip_platezha: "arenda" },
  { _id: 8,  prokat_id: 7,  sposob_id: 3, summa: 2500.00, data_platezha: new Date("2024-03-01T09:35:00Z"), tip_platezha: "arenda" },
  { _id: 9,  prokat_id: 8,  sposob_id: 1, summa: 400.00,  data_platezha: new Date("2024-03-10T15:05:00Z"), tip_platezha: "arenda" },
  { _id: 10, prokat_id: 4,  sposob_id: 2, summa: 500.00,  data_platezha: new Date("2024-02-06T12:00:00Z"), tip_platezha: "shtraf" }
])

// ========== 17. SHTRAF ==========
seed("shtraf",[
  { _id: 1,  prokat_id: 4,  edinitsa_id: 5,  prichina: "Просрочка возврата на 1 день", summa: 500.00,  data_vydachi: new Date("2024-02-06"), oplachen: true  },
  { _id: 2,  prokat_id: 1,  edinitsa_id: 1,  prichina: "Царапина на лыже",             summa: 1000.00, data_vydachi: new Date("2024-01-12"), oplachen: true  },
  { _id: 3,  prokat_id: 2,  edinitsa_id: 2,  prichina: "Повреждение крепления",        summa: 2000.00, data_vydachi: new Date("2024-01-17"), oplachen: false },
  { _id: 4,  prokat_id: 5,  edinitsa_id: 6,  prichina: "Скол на канте",                summa: 1500.00, data_vydachi: new Date("2024-02-12"), oplachen: true  },
  { _id: 5,  prokat_id: 7,  edinitsa_id: 8,  prichina: "Поздний возврат",              summa: 700.00,  data_vydachi: new Date("2024-03-06"), oplachen: false },
  { _id: 6,  prokat_id: 3,  edinitsa_id: 3,  prichina: "Утеря чехла",                  summa: 800.00,  data_vydachi: new Date("2024-01-22"), oplachen: true  },
  { _id: 7,  prokat_id: 6,  edinitsa_id: 7,  prichina: "Повреждение подошвы",          summa: 1200.00, data_vydachi: new Date("2024-02-17"), oplachen: false },
  { _id: 8,  prokat_id: 8,  edinitsa_id: 9,  prichina: "Погнута палка",                summa: 600.00,  data_vydachi: new Date("2024-03-12"), oplachen: false },
  { _id: 9,  prokat_id: 9,  edinitsa_id: 10, prichina: "Повреждение шлема",            summa: 2500.00, data_vydachi: new Date("2024-03-18"), oplachen: false },
  { _id: 10, prokat_id: 10, edinitsa_id: 4,  prichina: "Отмена менее чем за сутки",    summa: 300.00,  data_vydachi: new Date("2024-03-20"), oplachen: true  }
])


lab.edinitsa_inventarya.createIndex({seriynyy_nomer:1},{unique:true});
const initialSnowboards=lab.model_inventarya.find({kategoriya_id:3},{_id:0,nazvanie:1}).toArray();
print("Исходная модель сноуборда:");printjson(initialSnowboards.filter(x=>x.nazvanie==="Burton Custom"));
// Четыре новые вымышленные модели. Размер и дата заданы явно.
seed("model_inventarya",[
 {_id:101,nazvanie:"Учебный Snow A",kategoriya_id:3,brend_id:1,razmer:"155",god:2025},
 {_id:102,nazvanie:"Учебный Snow B",kategoriya_id:3,brend_id:2,razmer:"158",god:2025},
 {_id:103,nazvanie:"Учебный Snow C",kategoriya_id:3,brend_id:3,razmer:"160",god:2024},
 {_id:104,nazvanie:"Учебный Snow D",kategoriya_id:3,brend_id:4,razmer:"149",god:2025}
]);
const units=[];
for(let i=0;i<8;i++) units.push({_id:101+i,seriynyy_nomer:"NAD-SN-"+(101+i),
 model_id:101+Math.floor(i/2),status_id:1,data_pokupki:new Date("2025-12-01T00:00:00Z"),
 data_izgotovleniya:new Date((i===4||i===5?"2024":"2025")+"-01-15T00:00:00Z"),tsena:50000+i*1000,primechanie:"Учебный пример"});
seed("edinitsa_inventarya",units);
// UPDATE: добавить описание и массив характеристик моделям сноубордов.
const update=lab.model_inventarya.updateMany({kategoriya_id:3},{$set:{
 harakteristiki:{material:"композит",naznachenie:"учебный прокат"},
 tags:["snowboard","rental"],opisanie:"Сноуборд для учебной базы"}});
requireCheck(update.matchedCount===5,"updateMany выбрал ровно 5 моделей сноубордов");
const ids=lab.model_inventarya.find({kategoriya_id:3},{_id:1}).toArray().map(m=>m._id);
// READ: все экземпляры сноубордов с датой изготовления, модель присоединяется через lookup.
const withDates=lab.edinitsa_inventarya.aggregate([
 {$match:{model_id:{$in:ids}}},
 {$lookup:{from:"model_inventarya",localField:"model_id",foreignField:"_id",as:"model"}},
 {$unwind:"$model"},
 {$project:{_id:0,seriynyy_nomer:1,model:"$model.nazvanie",data_izgotovleniya:1}},
 {$sort:{seriynyy_nomer:1}}
]).toArray();
print("Сноуборды до удаления:");printjson(withDates);
requireCheck(withDates.length===9,"до удаления 5 моделей и 9 физических сноубордов");
// Старому экземпляру также присваивается явно учебная дата изготовления.
lab.edinitsa_inventarya.updateOne({seriynyy_nomer:"SN-006"},{$set:{data_izgotovleniya:new Date("2023-01-01T00:00:00Z")}});
// DELETE: удаляем добавленный экземпляр, на который не ссылаются прокаты или штрафы.
const target=lab.edinitsa_inventarya.findOne({seriynyy_nomer:"NAD-SN-108",model_id:{$in:ids}});
requireCheck(target!==null,"объект удаления действительно относится к сноубордам");
requireCheck(lab.prokat.countDocuments({"pozitsii.edinitsa_id":target._id})===0,"удаляемый экземпляр не используется в прокате");
requireCheck(lab.shtraf.countDocuments({edinitsa_id:target._id})===0,"на удаляемый экземпляр нет штрафа");
const deletion=lab.edinitsa_inventarya.deleteOne({seriynyy_nomer:"NAD-SN-108",model_id:{$in:ids}});
requireCheck(deletion.deletedCount===1,"deleteOne удалил ровно один сноуборд");
requireCheck(lab.edinitsa_inventarya.deleteOne({seriynyy_nomer:"NAD-SN-108"}).deletedCount===0,"повторное удаление не затронуло другие записи");
const modelCount=lab.model_inventarya.countDocuments({kategoriya_id:3});
const boardCount=lab.edinitsa_inventarya.countDocuments({model_id:{$in:ids}});
requireCheck(modelCount===5 && boardCount===8,"после удаления 5 моделей и 8 физических сноубордов");
requireCheck(lab.getCollectionNames().length===17,"созданы все 17 коллекций");
requireCheck(lab.model_inventarya.countDocuments()===14,"всего 14 моделей инвентаря");
requireCheck(lab.edinitsa_inventarya.countDocuments()===17,"всего 17 единиц инвентаря");
function referenceCheck(from,field,to) {
 const missing=lab.getCollection(from).aggregate([
 {$lookup:{from:to,localField:field,foreignField:"_id",as:"reference"}},
 {$match:{reference:{$size:0}}},{$count:"n"}
 ]).toArray();
 requireCheck(missing.length===0,from+"."+field+" имеет корректные ссылки на "+to);
}
for(const [from,field,to] of [
 ["model_inventarya","kategoriya_id","kategoriya"],["model_inventarya","brend_id","brend"],
 ["edinitsa_inventarya","model_id","model_inventarya"],["edinitsa_inventarya","status_id","status_inventarya"],
 ["dokument","klient_id","klient"],["sotrudnik","dolzhnost_id","dolzhnost"],
 ["uchet_zapis","sotrudnik_id","sotrudnik"],["prokat","klient_id","klient"],
 ["prokat","sotrudnik_id","sotrudnik"],["prokat","status_id","status_prokata"],
 ["platezh","prokat_id","prokat"],["platezh","sposob_id","sposob_oplaty"],
 ["shtraf","edinitsa_id","edinitsa_inventarya"],["shtraf","prokat_id","prokat"],
 ["obsluzhivanie","edinitsa_id","edinitsa_inventarya"],["obsluzhivanie","sotrudnik_id","sotrudnik"],
 ["tarif","kategoriya_id","kategoriya"]]) referenceCheck(from,field,to);
for(const loan of lab.prokat.find().toArray()) for(const item of loan.pozitsii) {
 requireCheck(lab.edinitsa_inventarya.countDocuments({_id:item.edinitsa_id})===1,"позиция проката "+loan._id+" имеет экземпляр");
 requireCheck(lab.tarif.countDocuments({_id:item.tarif_id})===1,"позиция проката "+loan._id+" имеет тариф");
}
print("ИТОГОВЫЕ КОЛИЧЕСТВА:");
for(const c of lab.getCollectionNames().sort())print(c+": "+lab.getCollection(c).countDocuments());
print("СНОУБОРДЫ С ДАТОЙ ИЗГОТОВЛЕНИЯ ПОСЛЕ УДАЛЕНИЯ:");
printjson(lab.edinitsa_inventarya.find({model_id:{$in:ids}},
 {_id:0,seriynyy_nomer:1,data_izgotovleniya:1}).sort({seriynyy_nomer:1}).toArray());
for(const unit of lab.edinitsa_inventarya.find({model_id:{$in:ids}}).toArray()) {
 const model=lab.model_inventarya.findOne({_id:unit.model_id});
 requireCheck(unit.data_izgotovleniya instanceof Date,"дата изготовления "+unit.seriynyy_nomer+" является Date");
 requireCheck(unit.data_izgotovleniya.getUTCFullYear()===model.god,"год изготовления "+unit.seriynyy_nomer+" совпадает с моделью");
 requireCheck(unit.data_izgotovleniya<=unit.data_pokupki,"изготовление "+unit.seriynyy_nomer+" предшествует покупке");
}
let duplicateRejected=false;
try {lab.edinitsa_inventarya.insertOne({_id:9999,seriynyy_nomer:"SN-001"});}
catch(e){duplicateRejected=e.code===11000;}
requireCheck(duplicateRejected,"индекс отклонил дубликат серийного номера");
requireCheck(lab.edinitsa_inventarya.countDocuments({_id:9999})===0,"неуспешная вставка не оставила запись");
print("ALL MONGODB CHECKS PASSED");
