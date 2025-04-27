-- Функция для обработки триггера
CREATE OR REPLACE FUNCTION update_user_role_on_organizer_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверяем, что status_id = 2
    IF NEW.status_id = 2 THEN
        -- Обновляем role_id в таблице Users для соответствующего user_id
        UPDATE Users
        SET role_id = 2, -- Предполагаем, что 2 - это ID роли организатора
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер, который срабатывает после вставки или обновления в OrganizerRequest
CREATE TRIGGER organizer_request_role_trigger
AFTER UPDATE OF status_id
ON OrganizerRequest
FOR EACH ROW
EXECUTE FUNCTION update_user_role_on_organizer_request();


-- Функция для триггера
CREATE OR REPLACE FUNCTION update_event_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- Если status_id изменен на 2 (подтверждена регистрация)
    IF NEW.status_id = 2 AND (OLD.status_id IS NULL OR OLD.status_id != 2) THEN
        UPDATE Event
        SET capacity = capacity - 1
        WHERE id = NEW.event_id;
    -- Если status_id изменен с 2 на 1 или 3 (отклонена или отменена)
    ELSIF OLD.status_id = 2 AND NEW.status_id IN (1, 3) THEN
        UPDATE Event
        SET capacity = capacity + 1
        WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на UPDATE в EventRegistration
CREATE TRIGGER event_capacity_trigger
AFTER UPDATE ON EventRegistration
FOR EACH ROW
EXECUTE FUNCTION update_event_capacity();