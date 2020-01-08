CREATE DATABASE IF NOT EXISTS store;
\c store
CREATE TABLE IF NOT EXISTS publishers(
    id         SERIAL   PRIMARY KEY,
    name       CHAR(255) NOT NULL,
    adress     CHAR(255)  NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS authors(
    id         SERIAL    PRIMARY KEY,
    name       CHAR(255) NOT NULL,
    is_live    BOOLEAN   NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS books(
    id            SERIAL       PRIMARY KEY,
    name          CHAR(255)    NOT NULL,
    buy_value     DECIMAL(10,2) NOT NULL,
    sell_value    DECIMAL(10,2) NOT NULL,
    author_id     INTEGER      NOT NULL,
    publisher_id  INTEGER      NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW(),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id),
    FOREIGN KEY (author_id) REFERENCES authors(id)
);
