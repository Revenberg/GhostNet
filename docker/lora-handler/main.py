from random import random
from tokenize import String
from attr import fields
import pymysql
import os
import time
import serial
import threading


rpibeaconid = None
ser = None
conn = None

def get_db_connection(retries=10, delay=3):
    for attempt in range(retries):
        try:
            return pymysql.connect(
                host=os.environ.get('DB_HOST', 'mysql'),
                user=os.environ.get('DB_USER', 'admin'),
                password=os.environ.get('DB_PASSWORD', 'admin'),
                database=os.environ.get('DB_NAME', 'hostnet'),
                autocommit=True
            )
        except pymysql.err.OperationalError as e:
            print(f"MySQL connection failed (attempt {attempt+1}/{retries}): {e}")
            time.sleep(delay)
    raise Exception("Could not connect to MySQL after several attempts.")

def create_tables():
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(64) UNIQUE,
            teamname VARCHAR(64),
            token VARCHAR(128),
            password_hash VARCHAR(225),
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            teamname VARCHAR(64) UNIQUE,
            teamcode VARCHAR(64) UNIQUE
        )
        """)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS lora_nodes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            node_id VARCHAR(64) UNIQUE,
            last_seen DATETIME,
            rssi FLOAT,
            snr FLOAT,
            version VARCHAR(64)
        )
        """)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            node_id VARCHAR(64),
            username VARCHAR(64),
            team VARCHAR(64),
            object VARCHAR(64),
            `function` VARCHAR(64),
            parameters MEDIUMTEXT,
            timestamp DATETIME
        )
        """)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS Lora_Send (
            id INT AUTO_INCREMENT PRIMARY KEY,
            node_id VARCHAR(64),
            team VARCHAR(64),
            object VARCHAR(64),
            `function` VARCHAR(64),
            parameters MEDIUMTEXT,
            timestamp DATETIME
        )
        """)
    conn.close()

def parse_fields(msg):
    fields = {}
    for part in msg.split(','):
        if ':' in part:
            key, value = part.split(':', 1)
            fields[key.strip()] = value.strip()
    return fields

def process_lora_message(msg):
    
    global rpibeaconid
    
#    print(f"Received LoRa message: =={msg}==")

    if msg.startswith("[RPI4"):
        print(f"Received LoRa message: {msg}", flush=True)

    if msg.startswith("[RPI4 Start]"):
        print("RPI4 LoRa Gateway started.", flush=True)
        # Extract node and version if present
        import re
        match = re.search(r'Node:\s*([\w_]+),\s*Version:\s*([\d.]+)', msg)
        if match:
            node = match.group(1)
            version = match.group(2)
            print(f"Node: {node}, Version: {version}", flush=True)
            try:
                conn = get_db_connection()
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO lora_nodes (node_id, last_seen, rssi, snr, version)
                        VALUES (%s, NOW(), NULL, NULL, %s)
                        ON DUPLICATE KEY UPDATE last_seen=NOW(), version=%s
                    """, (node, version, version))
                print("lora_nodes table updated for RPI4 Start.", flush=True)
                conn.close()
            except Exception as e:
                print(f"Failed to update lora_nodes for RPI4 Start: {e}", flush=True)
        return

    if msg.startswith("[RPI4 WIFI]"):
        print("RPI4 WIFI started.", flush=True)
        return

    if msg.startswith("[LoRa RX]") or msg.startswith("[LoRa TX]"):
        if (msg.startswith("[LoRa TX]") & (rpibeaconid is None)):
            rpibeaconid = "rpi"

        if msg.startswith("[LoRa RX]"):
            msg = msg[len("[LoRa RX]"):].strip()
        if msg.startswith("[LoRa TX]"):
            msg = msg[len("[LoRa TX]"):].strip()

        if msg.startswith('BEACON'):
            msg = msg[len('BEACON;'):].strip()
            fields = parse_fields(msg)
            
            node_id = fields['nodeid']
            rssi = fields['rssi']
            snr = fields['snr']
            nodeversion = fields['version']

            if (rpibeaconid == "rpi"):
                rpibeaconid = node_id
            try:
                conn = get_db_connection()
    
                with conn.cursor() as cur:
                    cur.execute("""
                    INSERT INTO lora_nodes (node_id, last_seen, rssi, snr, version)
                    VALUES (%s, NOW(), %s, %s, %s)
                    ON DUPLICATE KEY UPDATE last_seen=NOW(), rssi=%s, snr=%s, version=%s
                    """, (node_id, rssi, snr, nodeversion, rssi, snr, nodeversion))
                print("LoRa node info updated in database.", flush=True)
                conn.close()
            except Exception as e:
                print(f"Failed to update LoRa node info: {e}", flush=True)
            return

        if msg.startswith('test'):
#            msg = msg[len('test'):].strip().strip('"')

            parts = msg.split(';')
            node_id, user_id, team_id, obj, func, params, timestamp = parts
            try:
                conn = get_db_connection()
                with conn.cursor() as cur:
                    cur.execute("""
                    INSERT INTO messages (node_id, user_id, team_id, object, `function`, parameters, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (node_id, user_id, team_id, obj, func, params, timestamp))
                print("Message inserted into database.")
                conn.close()
            except Exception as e:
                print(f"Failed to insert message: {e}")

def loraSend(ser, nodeMessage):
    # Send the LoRa message
    print(f"Sending LoRa message: {nodeMessage[:40]}", flush=True)
    # Use Python's time.time() for millis equivalent
    msgID = int(time.time() * 1000)
    msg = "MSG;" + str(msgID) + ";RPI;" + str(3) + ";" + nodeMessage
    ser.write((msg + "\n").encode('utf-8'))

def check_lora_send(ser):
    print("Starting LoRa send checker thread.", flush=True)
    
    conn = get_db_connection()

    while True:
        print("Check LoRa send checker thread.", flush=True)
        with conn.cursor() as cur:
            cur.execute("SELECT id, node_id, team, object, `function`, parameters FROM Lora_Send ORDER BY id ASC LIMIT 1")
            row = cur.fetchone()
            if row:
                id = row[0]
                node_id = row[1]
                team = row[2]
                obj = row[3]
                func = row[4]
                params = row[5]

                loraSend(ser, f"SEND; node:{node_id},team:{team},object:{obj},function:{func},parameters:{params}")

                # Delete the entry after sending
                cur.execute("DELETE FROM Lora_Send WHERE id = %s", (id,))
                cur.execute("COMMIT")
                
                print(f"Lora_Send entry {id} sent and deleted from database.", flush=True)
                time.sleep(60)  # Wait 60 seconds
            else:
                print("No Lora_Send entries to process.", flush=True)

        time.sleep(60)  # Wait 60 seconds
        
def check_user_updates(ser):
    print("Starting user update checker thread.", flush=True)
    conn = get_db_connection()

    import datetime
    last_user_update = datetime.datetime(2025, 1, 1)
    while True:
        print("Check user update checker thread.", flush=True)
        with conn.cursor() as cur:
            cur.execute("SELECT username, password_hash, token, teamname, last_update FROM users WHERE last_update > %s", (last_user_update,))
            rows = cur.fetchall()
            for row in rows:
                print(f"User update found: {row}")

                username = row[0]
                pwdHash = row[1]
                token = row[2]
                teamname = row[3]
                if (last_user_update is None) or (row[4] > last_user_update):
                    last_user_update = row[4]

                loraSend(ser, "USER;ADD; name:" + username + ",pwdHash:" + pwdHash + ",token:" + token + ",team:" + teamname)
                time.sleep(5)  # Wait 10 seconds

        time.sleep(60)  # Wait 60 seconds

def lora_reader(ser):
    while True:
        line = ser.readline().decode('utf-8', errors='replace').strip()
        if line:
            try:
                process_lora_message(line)
            except Exception as e:
                print(f"Error processing LoRa message: {e}", flush=True)

def main():
    print(f"main")
    conn = get_db_connection()
    print(f"connection established")
    conn.close()

    create_tables()
    print(f"Tables created")
    usb_port = os.environ.get('USB_PORT', '/dev/ttyUSB0')
    baudrate = int(os.environ.get('USB_BAUDRATE', '115200'))
    print(f"Using USB port: {usb_port} at baudrate: {baudrate}", flush=True)
    connection = False
    ser = None
    while not connection:
        try:
            ser = serial.Serial(usb_port, baudrate, timeout=1)
            print(f"Listening for LoRa messages on {usb_port}...", flush=True)
            connection = True
        except Exception as e:
            print(f"Failed to open USB port: {e}", flush=True)

    # Start background threads
    threading.Thread(target=lora_reader, args=(ser,), daemon=True).start()
    threading.Thread(target=check_user_updates, args=(ser,), daemon=True).start()
    threading.Thread(target=check_lora_send, args=(ser,), daemon=True).start()

    # Keep main thread alive
    while True:
        time.sleep(60)

if __name__ == "__main__":
    main()
