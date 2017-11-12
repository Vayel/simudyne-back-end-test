import sqlite3

from . import agent

conn = None

def connect(db_path):
    global conn
    conn = sqlite3.connect(db_path)


def check_conn(f):
    def wrapper(*args, **kwargs):
        if conn is None:
            raise ValueError('The "connect" function must be called before querying the database.')
        return f(*args, **kwargs)
    return wrapper


def row_to_agent(row):
    return agent.Agent(*row)


@check_conn
def get_all():
    c = conn.cursor()
    c.execute('SELECT * FROM agents')
    data = c.fetchmany()
    while data:
        for row in data:
            yield row_to_agent(row)  # Use a generator to avoid overwhelming the memory
        data = c.fetchmany()


@check_conn
def get_by_id(id_):
    c = conn.cursor()
    c.execute('SELECT * FROM agents WHERE id=?', (id_,))
    row = c.fetchone()
    return row_to_agent(row) if row is not None else None
