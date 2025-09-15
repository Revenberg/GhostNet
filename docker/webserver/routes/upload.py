from flask import Blueprint, request, render_template_string, send_file
import os

bp = Blueprint('upload_image', __name__)
UPLOAD_FOLDER = '/tmp/uploaded_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@bp.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'image' not in request.files:
            return 'No image part', 400
        file = request.files['image']
        if file.filename == '':
            return 'No selected file', 400
        filepath = os.path.join(UPLOAD_FOLDER, 'uploaded.jpg')
        file.save(filepath)
        return '<h2>Image upload complete!</h2><a href="/upload">Back</a>'
    return render_template_string('''
        <h2>Upload Image to RPI</h2>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="image"><br>
            <input type="submit" value="Upload">
        </form>
    ''')

@bp.route('/uploaded.jpg', methods=['GET'])
def get_uploaded_image():
    filepath = os.path.join(UPLOAD_FOLDER, 'uploaded.jpg')
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/jpeg')
    return 'No image uploaded', 404
