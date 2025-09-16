from flask import Blueprint, send_file, request
import os
import pymysql
from flask import render_template_string

images_bp = Blueprint('images', __name__)
UPLOAD_FOLDER = '/tmp/uploaded_images'

def get_db_connection():
    return pymysql.connect(
        host=os.environ.get('DB_HOST', 'mysql'),
        user=os.environ.get('DB_USER', 'admin'),
        password=os.environ.get('DB_PASSWORD', 'admin'),
        database=os.environ.get('DB_NAME', 'hostnet'),
        autocommit=True
    )

@images_bp.route('/images', methods=['GET'])
def list_images():
    # Fetch teams from database
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT teamname FROM teams")
        teams = [row[0] for row in cur.fetchall()]
    if not teams:
        teams = ['No teams found']
    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
    html = '<h2>Available Images</h2>'
    html += '<form method="GET" action="/images">'
    html += '<label for="team">Select team:</label>'
    html += '<select name="team" id="team">'
    for team in teams:
        html += f'<option value="{team}"' + (' selected' if team == request.args.get('team', teams[0]) else '') + f'>{team}</option>'
    html += '</select> <input type="submit" value="Filter"></form><br>'
    if not files:
        html += '<h2>No images found.</h2>'
        return html
    html += '<ul>'
    selected_team = request.args.get('team', teams[0])
    for fname in files:
        html += f'<li>'
        html += f'<img src="/images/{fname}" alt="{fname}" style="max-width:120px;max-height:120px;vertical-align:middle;"> '
        html += f'{fname} '
        html += f'<a href="/images/send_lora/{fname}?team={selected_team}">[Send to LoRa]</a>'
        html += '</li>'
        html += '</ul>'
    return html

@images_bp.route('/lora_send', methods=['GET'])
def lora_send_overview():
        conn = get_db_connection()
        with conn.cursor() as cur:
                cur.execute("SELECT * FROM Lora_Send")
                rows = cur.fetchall()
        return render_template_string("""
        <h2>Lora_Send Entries</h2>
        <table border=1>
            <tr><th>ID</th><th>Node ID</th><th>Team</th><th>Object</th><th>Function</th><th>Parameters</th><th>Timestamp</th></tr>
            {% for row in rows %}
            <tr><td>{{row[0]}}</td><td>{{row[1]}}</td><td>{{row[2]}}</td><td>{{row[3]}}</td><td>{{row[4]}}</td><td>{{row[5]}}</td><td>{{row[6]}}</td></tr>
            {% endfor %}
        </table>
        <a href='/images'>Back</a>
        """, rows=rows)

@images_bp.route('/images/send_lora/<filename>', methods=['GET'])
def send_image_to_lora(filename):
    import base64
    team = request.args.get('team', 'unknown')
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return 'Image not found', 404
    with open(filepath, 'rb') as f:
        image_bytes = f.read()
    image_b64 = base64.b64encode(image_bytes).decode('ascii')
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Lora_Send (node_id, team, object, `function`, parameters)
                VALUES (%s, %s, %s, %s, %s)
            """, ('all', team, 'images', 'add', image_b64))
        msg = f'Image {filename} scheduled for LoRa send (database insert OK).'
    except Exception as e:
        msg = f'Error inserting into Lora_Send: {e}'
    finally:
        conn.close()
    return msg

@images_bp.route('/images/<filename>', methods=['GET'])
def serve_image(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return 'Image not found', 404
