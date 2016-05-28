
-- User table
drop table if exists users;

create table users (
  id integer primary key autoincrement,
  name text not null,
  training boolean
);
