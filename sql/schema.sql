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
  created DATE
);
