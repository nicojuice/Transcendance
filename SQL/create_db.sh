#!/bin/sh
sqlite3 /data/data.db "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, avatar TEXT);"
# sqlite3 /data/data.db "CREATE TABLE IF NOT EXISTS friends (users_id INTEGER PRIMARY KEY AUTOINCREMENT);"