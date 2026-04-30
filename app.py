import os
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# You should set this in your environment variables or a .env file
# os.environ['GEMINI_API_KEY'] = 'your-key'

SYSTEM_PROMPT = """
You are the "AI Online Shopping Size Advisor". Your ONLY purpose is to suggest the right clothing size based on past purchases or answer general questions strictly related to clothing sizing, fit, and apparel dimensions.

CRITICAL RULES:
1. DO NOT answer any questions outside the domain of clothing sizes, footwear sizes, apparel fit, or fashion sizing advice.
2. If the user asks about anything else (e.g., coding, history, math, weather, general chatting), respond with exactly: "I am a Size Advisor. I can only help you with questions related to clothing and footwear sizing."
3. When giving size recommendations based on past purchases, analyze the brands, item types, sizes, and how they fit to deduce the best size for the target brand and item.
4. Keep your responses concise, helpful, and formatted beautifully using markdown (bolding key parts).
5. If the past purchase data is insufficient, tell the user what typical sizing looks like for the target brand.
"""

def call_gemini(prompt_text, api_key):
    if not api_key:
        raise Exception("API Key is missing. Please provide it in the UI.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser Request: {prompt_text}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
        }
    }

    response = requests.post(url, json=payload)
    response_data = response.json()

    if not response.ok:
        raise Exception(response_data.get("error", {}).get("message", "Failed to fetch response from AI."))

    return response_data["candidates"][0]["content"]["parts"][0]["text"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/recommendation', methods=['POST'])
def get_recommendation():
    data = request.json
    api_key = data.get('apiKey')
    target_brand = data.get('targetBrand')
    target_item = data.get('targetItem')
    purchases = data.get('purchases', [])

    if purchases:
        history_lines = [f"- Bought {p['brand']} {p['itemType']} in size {p['size']}, fit was: {p['fit']}" for p in purchases]
        history_text = "\n".join(history_lines)
    else:
        history_text = "No past purchase history provided."

    prompt_text = f"""
    I am looking to buy a **{target_item}** from **{target_brand}**.
    
    Here is my past purchase history:
    {history_text}
    
    Based on this data, what size should I get for the {target_brand} {target_item}? Please provide a clear recommendation and a brief explanation.
    """

    try:
        # Simple retry logic similar to the frontend
        import time
        retries = 3
        delay = 1.5
        for i in range(retries):
            try:
                ai_response = call_gemini(prompt_text, api_key)
                return jsonify({"response": ai_response})
            except Exception as e:
                # If it's the last retry or not a 503-like error, bubble it up.
                # Since we don't have the status code directly from the helper if it raises,
                # we just generically retry. In a robust app, you'd check the status code specifically.
                if i < retries - 1 and "503" in str(e):
                    time.sleep(delay)
                    delay *= 2
                    continue
                else:
                    return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    api_key = data.get('apiKey')
    message = data.get('message')
    
    try:
        import time
        retries = 3
        delay = 1.5
        for i in range(retries):
            try:
                ai_response = call_gemini(message, api_key)
                return jsonify({"response": ai_response})
            except Exception as e:
                if i < retries - 1 and "503" in str(e):
                    time.sleep(delay)
                    delay *= 2
                    continue
                else:
                    return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
