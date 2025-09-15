from flask import Blueprint, send_file
import os

images_bp = Blueprint('images', __name__)
UPLOAD_FOLDER = '/tmp/uploaded_images'

@images_bp.route('/images', methods=['GET'])
def list_images():
    files = [f for f in os.listdir(UPLOAD_FOLDER) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
    if not files:
        return '<h2>No images found.</h2>'
    html = '<h2>Available Images</h2><ul>'
    for fname in files:
        html += f'<li><a href="/images/{fname}">{fname}</a></li>'
    html += '</ul>'
    return html

@images_bp.route('/images/<filename>', methods=['GET'])
def serve_image(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return 'Image not found', 404
