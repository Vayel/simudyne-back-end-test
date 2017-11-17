#!/bin/sh

python setup.py install
cd tools
./create_db.sh database.db
python fill_db.py ../data/data.csv database.db
mv database.db ../data/
cd ..
