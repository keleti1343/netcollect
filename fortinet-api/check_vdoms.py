import psycopg2
from psycopg2 import sql

def check_vdoms():
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="postgres",
        host="127.0.0.1",
        port="55322"
    )

    with conn.cursor() as cur:
        query = sql.SQL("""
            SELECT f.fw_name, v.vdom_name
            FROM firewalls f
            LEFT JOIN vdoms v ON f.firewall_id = v.firewall_id
        """)
        cur.execute(query)
        rows = cur.fetchall()
        for row in rows:
            print(row)

    conn.close()

if __name__ == "__main__":
    check_vdoms()
