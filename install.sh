#!/bin/sh

cd tools
./create_db.sh database.db
python fill_db.py ../data.csv database.db
mv database.db ..
cd ..
python setup.py install