
-- User table
drop table if exists users;

create table users (
  id integer primary key autoincrement,
  name text not null,
  training boolean
);

-- Messages table
drop table if exists messages;

create table messages (
  id integer primary key autoincrement,
  user_id integer not null,
  message text not null,
  expires datetime,
  foreign key(user_id) references users(id)
);
