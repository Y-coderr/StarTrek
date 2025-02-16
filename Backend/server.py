from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import hashlib
import hmac
import base64

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api_debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

app = Flask(__name__)
CORS(app)

# Sandbox API configurations
SANDBOX_BASE_URL = "https://api.sandbox.co.in"
SANDBOX_TOKEN = os.getenv("SANDBOX_TOKEN")
SANDBOX_API_KEY = os.getenv("SANDBOX_API_KEY")
SANDBOX_API_SECRET = os.getenv("SANDBOX_API_SECRET")  # Add this to your .env file
API_VERSION = "2.0"

def generate_auth_headers(method, path, body=None):
    """Generate authentication headers for Sandbox API"""
    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    
    # Create string to sign
    string_to_sign = f"{method}\n{path}\n{timestamp}"
    if body:
        body_hash = hashlib.sha256(str(body).encode()).digest()
        body_hash_b64 = base64.b64encode(body_hash).decode()
        string_to_sign += f"\n{body_hash_b64}"
    
    # Generate signature
    signature = hmac.new(
        SANDBOX_API_SECRET.encode(),
        string_to_sign.encode(),
        hashlib.sha256
    ).digest()
    signature_b64 = base64.b64encode(signature).decode()
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {SANDBOX_TOKEN}",
        "x-api-key": SANDBOX_API_KEY,
        "x-api-version": API_VERSION,
        "x-date": timestamp,
        "x-signature": signature_b64
    }
    
    logger.debug(f"Generated headers: {headers}")
    return headers

@app.route("/api/aadhaar/generate-otp", methods=["POST"])
def generate_otp():
    try:
        logger.info("Received request to generate Aadhaar OTP")
        data = request.get_json()
        aadhaar_number = data.get("aadhaar_number")
        
        if not aadhaar_number:
            logger.error("Aadhaar number missing in request")
            return jsonify({"error": "Aadhaar number is required"}), 400
        
        url = f"{SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp"
        payload = {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
            "aadhaar_number": aadhaar_number,
            "consent": "Y",
            "reason": "For KYC"
        }
        
        headers = generate_auth_headers("POST", "/kyc/aadhaar/okyc/otp", payload)
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code != 200:
            error_msg = response_data.get("message", "Failed to generate OTP")
            logger.error(f"API error: {error_msg}")
            return jsonify({"error": error_msg}), response.status_code
        
        return jsonify({
            "reference_id": response_data['data'].get("reference_id"),
            "status": response_data.get("code"),
            "message": response_data['data'].get("message")
        })
        
    except Exception as e:
        logger.error(f"Exception occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/aadhaar/verify-otp", methods=["POST"])
def verify_otp():
    try:
        logger.info("Received request to verify Aadhaar OTP")
        data = request.get_json()
        reference_id = data.get("reference_id")
        otp = data.get("otp")
        
        if not reference_id or not otp:
            logger.error("Missing required fields: reference_id or OTP")
            return jsonify({"error": "Both reference_id and OTP are required"}), 400
        
        url = f"{SANDBOX_BASE_URL}/kyc/aadhaar/okyc/verify"
        payload = {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
            "reference_id": reference_id,
            "otp": otp
        }
        
        headers = generate_auth_headers("POST", "/kyc/aadhaar/okyc/verify", payload)
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code != 200:
            error_msg = response_data.get("message", "Failed to verify OTP")
            logger.error(f"API error: {error_msg}")
            return jsonify({"error": error_msg}), response.status_code
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Exception occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route("/api/pan/verify", methods=["POST"])
def verify_pan():
    try:
        logger.info("Received request to verify PAN")
        data = request.get_json()
        pan_number = data.get("pan_number")
        
        if not pan_number:
            logger.error("PAN number missing in request")
            return jsonify({"error": "PAN number is required"}), 400
        
        url = f"{SANDBOX_BASE_URL}/kyc/pan/verify"
        payload = {
            "@entity": "in.co.sandbox.kyc.pan_verification.request",
            "pan_number": pan_number
        }
        
        headers = generate_auth_headers("POST", "/kyc/pan/verify", payload)
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code != 200:
            error_msg = response_data.get("message", "Failed to verify PAN")
            logger.error(f"API error: {error_msg}")
            return jsonify({"error": error_msg}), response.status_code
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Exception occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    logger.info("Starting Flask application")
    app.run(host="0.0.0.0", debug=True)