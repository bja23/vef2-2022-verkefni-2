CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) not null,
  slug VARCHAR(64) not null,
  description VARCHAR(255),
  created DATE,
  updated DATE
);

CREATE TABLE registration (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) not null,
  comment VARCHAR(255),
  event INT,
  created DATE
);

CREATE TABLE users (
  id serial primary key,
  username character varying(255) NOT NULL UNIQUE,
  password character varying(255) NOT NULL
);
