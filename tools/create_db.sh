#!/bin/sh

if [ ! -f "init_db.sql" ]
then
    echo "Cannot find the file init_db.sql. Are you in the tools folder?"
    exit
fi

sqlite3 "$1" < init_db.sql
