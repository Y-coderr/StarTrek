from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
from datetime import datetime
import insightface
from insightface.app import FaceAnalysis
import pickle

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize InsightFace
face_analyzer = FaceAnalysis(providers=['CPUExecutionProvider'])
face_analyzer.prepare(ctx_id=0, det_size=(640, 640))

# Configuration
REGISTERED_FACES_DB = 'registered_faces.pkl'
SIMILARITY_THRESHOLD = 0.5

class FaceDatabase:
    def __init__(self):
        self.faces = {}  # user_id -> (name, embedding)
        self.load_database()
    
    def load_database(self):
        if os.path.exists(REGISTERED_FACES_DB):
            with open(REGISTERED_FACES_DB, 'rb') as f:
                self.faces = pickle.load(f)
    
    def save_database(self):
        with open(REGISTERED_FACES_DB, 'wb') as f:
            pickle.dump(self.faces, f)

face_db = FaceDatabase()

def process_image(image_data):
    # Convert image data to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Detect and get embeddings
    faces = face_analyzer.get(img)
    if not faces:
        return None
    
    return faces[0].embedding

@app.route('/register', methods=['POST'])
def register():
    if 'image' not in request.files:
        return jsonify({'message': 'No image provided'}), 400
    
    user_id = request.form.get('user_id')
    name = request.form.get('name')
    
    if not user_id or not name:
        return jsonify({'message': 'User ID and Name are required'}), 400
    
    try:
        image_file = request.files['image']
        embedding = process_image(image_file.read())
        
        if embedding is None:
            return jsonify({'message': 'No face detected in image'}), 400
        
        # Store in database
        face_db.faces[user_id] = (name, embedding)
        face_db.save_database()
        
        return jsonify({'message': f'Face registered successfully for {name}'})
        
    except Exception as e:
        return jsonify({'message': f'Error during registration: {str(e)}'}), 500

@app.route('/authenticate', methods=['POST'])
def authenticate():
    if 'image' not in request.files:
        return jsonify({'message': 'No image provided'}), 400
    
    try:
        image_file = request.files['image']
        embedding = process_image(image_file.read())
        
        if embedding is None:
            return jsonify({'message': 'No face detected in image'}), 400
        
        # Find the best match
        best_match = None
        highest_similarity = -1
        
        for user_id, (name, stored_embedding) in face_db.faces.items():
            similarity = np.dot(embedding, stored_embedding) / (
                np.linalg.norm(embedding) * np.linalg.norm(stored_embedding)
            )
            
            if similarity > highest_similarity:
                highest_similarity = similarity
                best_match = (user_id, name)
        
        if highest_similarity >= SIMILARITY_THRESHOLD and best_match:
            return jsonify({
                'message': f'Authentication successful! Welcome, {best_match[1]}',
                'user_id': best_match[0],
                'confidence': float(highest_similarity)
            })
        else:
            return jsonify({
                'message': 'Authentication failed: Face not recognized',
                'confidence': float(highest_similarity)
            }), 401
            
    except Exception as e:
        return jsonify({'message': f'Error during authentication: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)