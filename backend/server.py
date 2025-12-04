import json
import time
import requests
import os
import subprocess
import socket
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI App
app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# CONFIGURATION
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2"
LOG_FILE = "api_logs.json"
PORT = 8000

# SYSTEM PROMPT
SYSTEM_PROMPT = """
You are a specialized Nutrition Analyzer API.
Your ONLY job is to return a valid JSON object based on the user's food description.
Do not output any conversational text, markdown formatting, or explanations outside the JSON.

Required JSON Structure:
{
  "food_name": "string (identified name of the food)",
  "calories": int,
  "protein": int,
  "carbs": int,
  "fats": int,
  "food_type": "string (Category: e.g., Fruit, Vegetable, Fast Food, Dessert, Meat)",
  "reasoning_summary": "string (1 short sentence explaining the estimate)"
}
"""

# Input Validation Model
class FoodRequest(BaseModel):
    text: str

def check_ollama():
    """Checks if Ollama is running, starts it if not."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 11434))
    sock.close()
    
    if result != 0:
        print("⚠️ Starting Ollama for you...")
        os.environ["OLLAMA_ORIGINS"] = "*"
        subprocess.Popen("ollama serve", shell=True)
        time.sleep(3)

@app.on_event("startup")
def startup_event():
    check_ollama()

@app.post("/analyze")
def analyze_food(request: FoodRequest):
    """
    Analyzes food text using Ollama (Llama 3.2) and returns JSON.
    Note: Defined as a synchronous 'def' to run in a threadpool and not block the loop while waiting for requests.
    """
    user_text = request.text
    print(f"Received: {user_text}")

    full_prompt = f"{SYSTEM_PROMPT}\n\nUser Food Description: {user_text}\n\nJSON Output:"

    payload = {
        "model": MODEL_NAME,
        "prompt": full_prompt,
        "stream": False,
        "temperature": 0.2,
        "format": "json"
    }

    try:
        print(f"Sending to Ollama ({MODEL_NAME})...")
        ollama_res = requests.post(OLLAMA_URL, json=payload, timeout=120)
        ollama_res.raise_for_status()
        
        raw_content = ollama_res.json()["response"]
        
        # Cleanup Logic
        cleaned_content = raw_content
        if "```json" in cleaned_content:
            cleaned_content = cleaned_content.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned_content:
            cleaned_content = cleaned_content.split("```")[1].split("```")[0].strip()

        final_data = json.loads(cleaned_content)
        return final_data

    except requests.exceptions.RequestException as e:
        print(f"Ollama Connection Error: {e}")
        raise HTTPException(status_code=503, detail="Ollama server is not reachable.")
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse model output.")
    except Exception as e:
        print(f"General Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs")
def get_logs():
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                for line in f:
                    if line.strip():
                        logs.append(json.loads(line))
        except Exception:
            pass
    return logs

if __name__ == '__main__':
    print(f"✅ FastAPI Server running on http://localhost:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
# @app.get("/logs")
# def get_logs():
#     logs = []
#     if os.path.exists(LOG_FILE):
#         try:
#             with open(LOG_FILE, "r") as f:
#                 for line in f:
#                     if line.strip():
#                         logs.append(json.loads(line))
#         except Exception:
#             pass
#     return logs



# import json
# import time
# import requests
# import os
# import subprocess
# import socket
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from datetime import datetime

# app = Flask(__name__)
# CORS(app)

# # CONFIGURATION
# # Using /api/generate 
# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "llama3.2"  # Updated to Llama 3.2 (3B)
# LOG_FILE = "api_logs.json"
# PORT = 8000

# # Llama 3.2 System Prompt
# # Optimized for strict instruction following
# SYSTEM_PROMPT = """
# You are a specialized Nutrition Analyzer API.
# Your ONLY job is to return a valid JSON object based on the user's food description.
# Do not output any conversational text, markdown formatting, or explanations outside the JSON.

# Required JSON Structure:
# {
#   "food_name": "string (identified name of the food)",
#   "calories": int,
#   "protein": int,
#   "carbs": int,
#   "fats": int,
#   "food_type": "string (Category: e.g., Fruit, Vegetable, Fast Food, Dessert, Meat)",
#   "reasoning_summary": "string (1 short sentence explaining the estimate)"
# }
# """

# # def log_request(user_input, response_data, duration):
# #     log_entry = {
# #         "timestamp": datetime.now().isoformat(),
# #         "input": user_input,
# #         "model": MODEL_NAME,
# #         "duration_seconds": round(duration, 2),
# #         "response": response_data
# #     }
# #     try:
# #         with open(LOG_FILE, "a") as f:
# #             f.write(json.dumps(log_entry) + "\n")
# #     except Exception as e:
# #         print(f"Logging failed: {e}")

# @app.route('/analyze', methods=['POST'])
# def analyze_food():
#     start_time = time.time()
    
#     data = request.json
#     user_text = data.get('text', '')
#     print(f"Received: {user_text}")

#     # Combine prompt for /api/generate
#     # Llama 3.2 works best when the system instruction is explicit at the start
#     full_prompt = f"{SYSTEM_PROMPT}\n\nUser Food Description: {user_text}\n\nJSON Output:"

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": full_prompt,
#         "stream": False,
#         "temperature": 0.2, # Lower temperature for more consistent, deterministic JSON
#         "format": "json"    # Ollama native JSON mode (helps force structure)
#     }

#     try:
#         print(f"Sending to Ollama ({MODEL_NAME})...")
#         # Timeout set to 120s to be safe
#         ollama_res = requests.post(OLLAMA_URL, json=payload, timeout=120)
#         ollama_res.raise_for_status()
        
#         raw_content = ollama_res.json()["response"]
        
#         # Clean the response (Llama is usually good, but this handles edge cases)
#         cleaned_content = raw_content
        
#         # Remove markdown code blocks if present
#         if "```json" in cleaned_content:
#             cleaned_content = cleaned_content.split("```json")[1].split("```")[0].strip()
#         elif "```" in cleaned_content:
#             cleaned_content = cleaned_content.split("```")[1].split("```")[0].strip()

#         final_data = json.loads(cleaned_content)
        
#         # log_request(user_text, final_data, time.time() - start_time)
#         return jsonify(final_data)

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": str(e), "detail": "Analysis failed. Make sure Ollama is running!"}), 500

# @app.route('/logs', methods=['GET'])
# def get_logs():
#     logs = []
#     if os.path.exists(LOG_FILE):
#         try:
#             with open(LOG_FILE, "r") as f:
#                 for line in f:
#                     if line.strip():
#                         logs.append(json.loads(line))
#         except Exception:
#             pass
#     return jsonify(logs)

# if __name__ == '__main__':
#     # Check if Ollama is up
#     sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#     if sock.connect_ex(('127.0.0.1', 11434)) != 0:
#         print("⚠️ Starting Ollama for you...")
#         os.environ["OLLAMA_ORIGINS"] = "*"
#         subprocess.Popen("ollama serve", shell=True)
#         time.sleep(3)
#     sock.close()

#     print(f"✅ Flask Server running on http://localhost:{PORT}")
#     app.run(port=PORT, debug=True)