CREATE TABLE files(
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
date INTEGER NOT NULL,
type TEXT NOT NULL DEFAULT "standard", 
size TEXT NOT NULL DEFAULT "0B",
owner TEXT NOT NULL DEFAULT "none",
folder TEXT NOT NULL DEFAULT "none",
public INTEGER NOT NULL DEFAULT 1 CHECK(public = 1 OR public = 0),
FOREIGN KEY (owner) REFERENCES users (userid),
FOREIGN KEY (folder) REFERENCES folders (id)
);

CREATE TABLE csrf(
token TEXT NOT NULL UNIQUE,
generated INTEGER NOT NULL
);

CREATE TABLE users(
userid TEXT PRIMARY KEY,
username TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
creation INTEGER NOT NULL
);

CREATE TABLE folders(
id TEXT PRIMARY KEY,
owner TEXT NOT NULL DEFAULT "none",
FOREIGN KEY (owner) REFERENCES users (userid)
);
