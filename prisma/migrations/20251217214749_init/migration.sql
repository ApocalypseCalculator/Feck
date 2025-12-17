-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "recovery" TEXT NOT NULL,
    "registertime" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'unknown',
    "date" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'public',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "userid" TEXT,
    CONSTRAINT "File_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upload" (
    "transportId" TEXT NOT NULL PRIMARY KEY,
    "fileid" TEXT NOT NULL,
    "offset" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created" INTEGER NOT NULL,
    CONSTRAINT "Upload_fileid_fkey" FOREIGN KEY ("fileid") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Upload_fileid_key" ON "Upload"("fileid");
