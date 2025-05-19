#!/bin/sh
cd ..
mkdir data
sqlite3 /data/data.db "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT);"
