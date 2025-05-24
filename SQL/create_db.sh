#!/bin/sh
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		email TEXT,
		password TEXT,
		avatar BLOB
	);"
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS friends (
		user_id INTEGER,
		friend_id INTEGER,
		FOREIGN KEY(user_id) REFERENCES users(id),
		FOREIGN KEY(friend_id) REFERENCES users(id),
		PRIMARY KEY(user_id, friend_id)
	);"
