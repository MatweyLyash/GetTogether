-- Active: 1742655941118@@127.0.0.1@5432@gettogether
create table Role(
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) 
);

create table Status (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50)
);

create table Users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    telegram VARCHAR(255) UNIQUE NOT NULL,
    login VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES Role(id)
);


CREATE TABLE OrganizerRequest (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (status_id) REFERENCES Status(id)
);

CREATE TABLE Feedback (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
)

CREATE TABLE Event (
    id SERIAL PRIMARY KEY,
    creator_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    price DECIMAL(10, 2) DEFAULT 0,
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (creator_id) REFERENCES Users(id),
    FOREIGN KEY (category_id)  REFERENCES Category (id)
)


create table EventRegistration (
    id serial PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    status_ID INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    Foreign Key (user_id) REFERENCES Users(id),
    Foreign Key (event_id) REFERENCES Event(id),
    Foreign Key (status_id) REFERENCES Status(id)
)

create table Review (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event(id) ON DELETE CASCADE
);

insert into Role (role_name) VALUES('member');
insert into Role (role_name) VALUES('organizer');
insert into Role (role_name) VALUES('admin');

insert into Status (status_name) VALUES('pending');
insert into Status (status_name) VALUES('approved');
insert into Status (status_name) VALUES('rejected');

insert into Users (role_id, telegram, password_hash) VALUES(3, 436035164,'admin');


select *  from users
SELECT * FROM Categories

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;


