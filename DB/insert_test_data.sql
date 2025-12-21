-- SQL скрипт для вставки тестовых данных
-- Исключены таблицы roles и statuses

-- Вставка категорий
INSERT INTO categories (category_name, "deletedAt") VALUES
('Спорт и фитнес', NULL),
('Образование', NULL),
('Технологии', NULL),
('Искусство и культура', NULL),
('Бизнес и нетворкинг', NULL),
('Развлечения', NULL),
('Благотворительность', NULL);

-- Вставка пользователей
INSERT INTO users (role_id, telegram, login, password_hash, is_blocked, "createdAt", "updatedAt") VALUES
-- Администраторы (role_id = 3)
(3, '@admin_user', 'admin', '$2b$10$example_hash_for_admin_password', false, NOW(), NOW()),

-- Организаторы (role_id = 2)
(2, '@organizer1', 'organizer_alex', '$2b$10$example_hash_for_organizer1_password', false, NOW(), NOW()),
(2, '@organizer2', 'organizer_maria', '$2b$10$example_hash_for_organizer2_password', false, NOW(), NOW()),
(2, '@organizer3', 'organizer_ivan', '$2b$10$example_hash_for_organizer3_password', false, NOW(), NOW()),

-- Обычные пользователи (role_id = 1)
(1, '@user1_telegram', 'user_john', '$2b$10$example_hash_for_user1_password', false, NOW(), NOW()),
(1, '@user2_telegram', 'user_sarah', '$2b$10$example_hash_for_user2_password', false, NOW(), NOW()),
(1, '@user3_telegram', 'user_mike', '$2b$10$example_hash_for_user3_password', false, NOW(), NOW()),
(1, '@user4_telegram', 'user_anna', '$2b$10$example_hash_for_user4_password', false, NOW(), NOW()),
(1, '@user5_telegram', 'user_dmitry', '$2b$10$example_hash_for_user5_password', false, NOW(), NOW()),
(1, NULL, 'user_no_telegram', '$2b$10$example_hash_for_user_no_tg_password', false, NOW(), NOW());

-- Вставка мероприятий
INSERT INTO events (creator_id, category_id, title, description, date, location, price, telegram_chat_link, telegram_chat_id, organizer_verification_key, capacity, image, "createdAt", "updatedAt", "deletedAt") VALUES
-- Спортивные мероприятия
(2, 1, 'Марафон по Минску', 'Ежегодный марафон по центру Минска. Дистанции: 5км, 10км, 21км, 42км', '2025-06-15 08:00:00', 'Центр Минска, площадь Независимости', 25.00, 'https://t.me/marathon_minsk_2025', 'chat_marathon_2025', 'org_key_marathon_001', 500, NULL, NOW(), NOW(), NULL),

(3, 1, 'Турнир по теннису', 'Открытый турнир по большому теннису среди любителей', '2025-06-20 10:00:00', 'Теннисный центр "Виктория"', 50.00, 'https://t.me/tennis_tournament_2025', 'chat_tennis_001', 'org_key_tennis_001', 32, NULL, NOW(), NOW(), NULL),

-- Образовательные мероприятия
(2, 2, 'IT-конференция TechTalks', 'Конференция о современных технологиях и трендах в IT', '2025-07-01 09:00:00', 'Конференц-зал "Европа", ул. Немига 38', 75.00, 'https://t.me/techtalks_2025', 'chat_techtalks_001', 'org_key_tech_001', 200, NULL, NOW(), NOW(), NULL),

(4, 2, 'Мастер-класс по фотографии', 'Изучаем основы портретной фотографии с профессиональным фотографом', '2025-06-25 14:00:00', 'Студия "Light&Shadow", пр. Победителей 23', 40.00, 'https://t.me/photo_masterclass', 'chat_photo_001', 'org_key_photo_001', 15, NULL, NOW(), NOW(), NULL),

-- Технологические мероприятия  
(3, 3, 'Хакатон AI Solutions', 'Разрабатываем решения на базе искусственного интеллекта за 48 часов', '2025-07-10 18:00:00', 'Технопарк, ул. Сурганова 1', 0.00, 'https://t.me/ai_hackathon_2025', 'chat_hackathon_001', 'org_key_hack_001', 100, NULL, NOW(), NOW(), NULL),

-- Культурные мероприятия
(4, 4, 'Выставка современного искусства', 'Экспозиция работ белорусских художников', '2025-06-30 12:00:00', 'Галерея "Современник", ул. Ленина 12', 15.00, 'https://t.me/art_exhibition_2025', 'chat_art_001', 'org_key_art_001', 80, NULL, NOW(), NOW(), NULL),

(2, 4, 'Концерт джазовой музыки', 'Выступление джаз-квартета "Minsk Jazz"', '2025-07-05 19:30:00', 'Клуб "Blue Note", ул. Октябрьская 5', 30.00, 'https://t.me/jazz_concert_2025', 'chat_jazz_001', 'org_key_jazz_001', 60, NULL, NOW(), NOW(), NULL),

-- Бизнес мероприятия
(3, 5, 'Стартап Pitch Day', 'Питчинг стартапов перед инвесторами и экспертами', '2025-07-15 16:00:00', 'Бизнес-центр "Столица", пл. Независимости 3', 100.00, 'https://t.me/startup_pitch_2025', 'chat_startup_001', 'org_key_startup_001', 50, NULL, NOW(), NOW(), NULL),

-- Развлекательные мероприятия
(2, 6, 'Квиз "Что? Где? Когда?"', 'Интеллектуальная игра для команд до 6 человек', '2025-06-28 18:00:00', 'Паб "Guinness", ул. Зыбицкая 6', 20.00, 'https://t.me/quiz_minsk_2025', 'chat_quiz_001', 'org_key_quiz_001', 40, NULL, NOW(), NOW(), NULL),

(4, 6, 'Кулинарный мастер-класс', 'Готовим традиционные белорусские блюда', '2025-07-08 16:00:00', 'Кулинарная студия "Смак", ул. Комсомольская 25', 45.00, 'https://t.me/cooking_class_2025', 'chat_cooking_001', 'org_key_cooking_001', 20, NULL, NOW(), NOW(), NULL),

-- Благотворительные мероприятия
(3, 7, 'Забег в поддержку приюта', 'Благотворительный забег для сбора средств на корм животным', '2025-07-12 09:00:00', 'Парк Горького', 0.00, 'https://t.me/charity_run_2025', 'chat_charity_001', 'org_key_charity_001', 300, NULL, NOW(), NOW(), NULL),

-- Прошедшее мероприятие для возможности оставить отзыв
(2, 2, 'Воркшоп по веб-разработке', 'Изучили основы React и Node.js', '2025-05-20 10:00:00', 'IT-центр "Код", ул. Притыцкого 60', 60.00, 'https://t.me/web_workshop_past', 'chat_web_001', 'org_key_web_001', 25, NULL, NOW(), NOW(), NULL);

-- Вставка регистраций на мероприятия
INSERT INTO eventregistrations (user_id, event_id, status_id, telegram_invite_link, "createdAt", "updatedAt") VALUES
-- Одобренные заявки (status_id = 2)
(5, 1, 2, 'https://t.me/+invite_link_user5_event1', NOW(), NOW()),
(6, 1, 2, 'https://t.me/+invite_link_user6_event1', NOW(), NOW()),
(7, 2, 2, 'https://t.me/+invite_link_user7_event2', NOW(), NOW()),
(8, 3, 2, 'https://t.me/+invite_link_user8_event3', NOW(), NOW()),
(9, 4, 2, 'https://t.me/+invite_link_user9_event4', NOW(), NOW()),
(10, 5, 2, 'https://t.me/+invite_link_user10_event5', NOW(), NOW()),
(5, 6, 2, 'https://t.me/+invite_link_user5_event6', NOW(), NOW()),
(6, 7, 2, 'https://t.me/+invite_link_user6_event7', NOW(), NOW()),
(7, 8, 2, 'https://t.me/+invite_link_user7_event8', NOW(), NOW()),
(8, 9, 2, 'https://t.me/+invite_link_user8_event9', NOW(), NOW()),
-- Регистрация на прошедшее мероприятие для отзывов
(5, 12, 2, 'https://t.me/+invite_link_user5_event12', NOW(), NOW()),
(6, 12, 2, 'https://t.me/+invite_link_user6_event12', NOW(), NOW()),
(7, 12, 2, 'https://t.me/+invite_link_user7_event12', NOW(), NOW()),

-- Ожидающие одобрения заявки (status_id = 1)
(9, 1, 1, NULL, NOW(), NOW()),
(10, 1, 1, NULL, NOW(), NOW()),
(5, 2, 1, NULL, NOW(), NOW()),
(6, 3, 1, NULL, NOW(), NOW()),
(7, 4, 1, NULL, NOW(), NOW()),
(8, 5, 1, NULL, NOW(), NOW()),

-- Отклоненные заявки (status_id = 3)
(9, 2, 3, NULL, NOW(), NOW()),
(10, 3, 3, NULL, NOW(), NOW());

-- Вставка запросов на роль организатора
INSERT INTO organizerrequests (user_id, status_id, "createdAt", "updatedAt") VALUES
-- Ожидающие рассмотрения (status_id = 1)
(5, 1, NOW(), NOW()),
(6, 1, NOW(), NOW()),
(7, 1, NOW(), NOW()),

-- Одобренные (status_id = 2) - эти пользователи уже получили роль организатора
(2, 2, '2025-05-01 10:00:00', '2025-05-01 15:00:00'),
(3, 2, '2025-05-05 12:00:00', '2025-05-05 17:00:00'),
(4, 2, '2025-05-10 09:00:00', '2025-05-10 14:00:00'),

-- Отклоненные (status_id = 3)
(8, 3, '2025-05-15 11:00:00', '2025-05-15 16:00:00'),
(9, 3, '2025-05-18 13:00:00', '2025-05-18 18:00:00');

-- Вставка отзывов (только для прошедших мероприятий с одобренными заявками)
INSERT INTO reviews (user_id, event_id, rating, comment, "createdAt") VALUES
(5, 12, 5, 'Отличный воркшоп! Много практики, понятные объяснения. Рекомендую всем начинающим разработчикам.', '2025-05-21 15:30:00'),
(6, 12, 4, 'Хороший материал, но хотелось бы больше времени на практические задания. В целом довольна!', '2025-05-21 18:45:00'),
(7, 12, 5, 'Превосходно! Ведущий - настоящий профессионал. Узнал много нового о современных подходах в веб-разработке.', '2025-05-22 10:15:00');

-- Обновление последовательностей (если используется PostgreSQL)
-- SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
-- SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));
-- SELECT setval('eventregistrations_id_seq', (SELECT MAX(id) FROM eventregistrations));
-- SELECT setval('organizerrequests_id_seq', (SELECT MAX(id) FROM organizerrequests));
-- SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
