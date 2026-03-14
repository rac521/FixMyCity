import google.generativeai as genai
import json
import base64
from PIL import Image
import io

genai.configure(api_key="AIzaSyAip0vTes5jQJGRKEtezKDTU5k7tZOOPs4")

CATEGORIES_MAP = {
    'Public Works': ['Potholes', 'Damaged Roads', 'Damaged Sidewalks'],
    'Sanitation': ['Garbage Accumulation', 'Dead Animals', 'Clogged Drains', 'Public Toilet Maintenance'],
    'Water Supply': ['Leaking Fire Hydrant', 'No Water Supply', 'Contaminated Water'],
    'Electricity': ['Broken Streetlight', 'Fallen Power Lines', 'Frequent Outages'],
    'Public Safety': ['Overgrown Bushes (Visibility Issue)', 'Missing Road Signs', 'Unsafe Crosswalks'],
    'Public Infrastructure': ['Damaged Park Bench', 'Broken Playground Equipment', 'Vandalism/Graffiti'],
    'Environment': ['Illegal Dumping', 'Noise Pollution', 'Fallen Trees']
}

# 1 pixel transparent PNG just to test the API structure if it defaults to pothole
B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

img_bytes = base64.b64decode(B64)
img = Image.open(io.BytesIO(img_bytes))

model = genai.GenerativeModel('gemini-1.5-flash')

prompt = f"""
Analyze this image of a civic/infrastructure issue.
Categorize it strictly into ONE of the following precise sub-categories from this map:
{json.dumps(CATEGORIES_MAP, indent=2)}

CRITICAL INSTRUCTION: Your `category` and `subcategory` MUST perfectly match the exact strings, including exact capitalization and pluralization, from the map above. Do not invent categories. 
For example, if you see a pothole, your subcategory MUST be "Potholes" with an 's'.

Provide the output in strict JSON format like this:
{{
    "category": "The exact top-level category name",
    "subcategory": "The exact sub-category string from the map",
    "description": "A short 1-2 sentence description of the observed damage or issue, written from the perspective of a concerned citizen reporting it.",
    "confidence": 0.95
}}
"""

try:
    response = model.generate_content([prompt, img])
    print("Raw Response:", response.text)
except Exception as e:
    print("Error:", e)
