#!/bin/sh
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		password TEXT NOT NULL,
		avatar BLOB,
		enabled_fa INTEGER,
		status INTEGER,
		wins INTEGER,
		all_games INTEGER
	);"
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS otp_codes (
		user_id INTEGER PRIMARY KEY,
		code TEXT NOT NULL,
		expires INTEGER NOT NULL,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);"
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS friends (
		user_id INTEGER,
		friend_id INTEGER,
		FOREIGN KEY(user_id) REFERENCES users(id),
		FOREIGN KEY(friend_id) REFERENCES users(id),
		PRIMARY KEY(user_id, friend_id)
	);"
sqlite3 /data/data.db "
	CREATE TABLE IF NOT EXISTS tournament (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		match1   TEXT NOT NULL,
		match2   TEXT NOT NULL,
		match3   TEXT,
		matchid INTEGER
	);"
