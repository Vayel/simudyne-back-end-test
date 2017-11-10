def parse_cell(row, i, f):
    row[i] = f(row[i])


if __name__ == '__main__':
    import os
    import sys
    import csv
    import sqlite3
    import simudyne as sim

    # Named indices
    BREED, ID, AGE, SG, PAP, A_BRAND, A_PRICE, A_PROMO, AR, IFS = list(range(10))

    if len(sys.argv) != 3:  # argv also contains the name of the Python file
        print("Usage: python3 fill_db.py csv-data-path db-path")
        sys.exit(1)

    data_path = sys.argv[1]
    db_path = sys.argv[2]

    if not os.path.isfile(data_path):
        print("Invalid data path. Must be valid path.")
        sys.exit(1)
    if not os.path.isfile(db_path):
        print("Invalid db path. Must be valid path.")
        sys.exit(1)

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    with open(data_path, newline='') as csvfile:
        reader = csv.reader(csvfile)
        next(reader, None)  # Skip the headers
        for row in reader:
            # Parse row
            row[BREED] = (sim.agent.BREED_ENUM['C'] if row[BREED] == 'Breed_C'
                          else sim.agent.BREED_ENUM['NC'])
            parse_cell(row, ID, float)  # Cannot convert into int directly
            parse_cell(row, ID, int)
            parse_cell(row, AGE, int)
            parse_cell(row, SG, int)
            parse_cell(row, PAP, int)
            parse_cell(row, A_BRAND, float)
            parse_cell(row, A_PRICE, float)
            parse_cell(row, A_PROMO, float)
            parse_cell(row, AR, int)
            parse_cell(row, IFS, int)

            try:
                c.execute('INSERT INTO agents VALUES (?,?,?,?,?,?,?,?,?,?)', row)
            except sqlite3.IntegrityError as e:
                print(e, row)

    conn.commit()
    conn.close()
