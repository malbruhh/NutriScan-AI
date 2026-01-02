# Nutrition Analyzer Web Application

## Overview

**NutriScan AI : Personalized Calorie Tracker** is a webb application that allows users to analyze food items using **text input and/or images**. It leverages **Google Gemini (gemini-2.5-flash)** via a FastAPI backend to estimate calories and macronutrients, returning structured nutritional data in JSON format.

The system is designed with a clear separation between:

* **User-facing functionality** (frontend usage)
* **Calculation & AI reasoning logic** (backend processing)

This README is divided into **User Guide** and **Calculation / Technical Explanation** sections for clarity.

---

## System Architecture

```
[ index.html + app.js ]  -->  [ FastAPI Server (server.py) ]  -->  [ Gemini AI Model ]
        Frontend UI                Backend API                    Nutrition Analysis
```

### Technology Stack

* **Frontend**: HTML, JavaScript (Vanilla)
* **Backend**: Python, FastAPI, Uvicorn
* **AI Model**: Google Gemini 2.5 Flash
* **Data Format**: JSON

---

# USER GUIDE

## Purpose (User Perspective)

The application allows users to:

* Enter food descriptions (e.g., "2 burgers and a cola")
* Upload food images (optional)
* Receive estimated nutrition values per food item

Each food item is analyzed individually and returned with calories, macros, and a short explanation.

---

## How to Use the Application

### 1. Launch the Backend Server

Install Requirements:
```
pip install -r requirements.txt
```

Ensure you have Python installed and create a `.env` file in the same directory:


```
GOOGLE_API_KEY=your_api_key_here
```

Run the server:

```
python server.py
```

The API will run at:

```
http://localhost:8000
```

---

### 2. Open the Frontend

Open `index.html` in a browser.

The UI provides:

* A **text input** for food descriptions
* An **image upload** option
* An **analyze button** to submit data

---

### 3. Input Guidelines

#### Text Input Examples

* `1 apple`
* `2 cheeseburgers`
* `grilled chicken breast and rice`

#### Image Input

* Upload a food image (JPEG recommended)
* Image is optional but improves accuracy

---

### 4. Output Interpretation

Each food item returns:

* Food name
* Calories (kcal)
* Protein (g)
* Carbohydrates (g)
* Fats (g)
* Sugar (g)
* Food category
* Brief reasoning summary

Example output:

```json
{
  "food_name": "Cheeseburger",
  "calories": 303,
  "protein": 17,
  "carbs": 33,
  "fats": 14,
  "sugar": 6,
  "food_type": "Fast Food",
  "reasoning_summary": "Estimated based on a standard fast-food cheeseburger."
}
```

---

# CALCULATION & TECHNICAL EXPLANATION

## Backend Responsibility (server.py)

The backend:

* Accepts text and base64-encoded images
* Sends structured prompts to Gemini
* Enforces output consistency
* Returns clean JSON responses

---

## API Endpoint

### POST `/analyze`

#### Request Body

```json
{
  "text": "2 burgers",
  "image": "base64_encoded_image_string (optional)"
}
```

#### Response

```json
[
  { /* nutrition object */ },
  { /* nutrition object */ }
]
```

---

## Nutrition Calculation Logic

### 1. Quantity Handling

Rule enforced via **system prompt**:

* If the user says `2 burgers`, the AI must return **two separate objects**

This avoids ambiguity and enables accurate tracking.

---

### 2. Estimation Basis

Calculations are based on:

* Standard serving sizes
* Public nutritional averages
* Typical preparation methods

No user-specific metabolism or customization is assumed.

---

### 3. Macronutrient Breakdown

Each item includes:

* **Calories**: Estimated total energy
* **Protein**: Muscle-repair macro
* **Carbohydrates**: Primary energy source
* **Fats**: Energy-dense macro
* **Sugar**: Simple carbohydrates

Values are returned as **integers** for consistency.

---

### 4. Food Classification

Each item is categorized into Food Grade:

* Very Healthy
* Healthy
* Fast Food
* Drink
* Protein
* Other common food groups

This enables future filtering or visualization.

---

### 5. Reasoning Summary

A short 1-sentence explanation explaining:

* Portion assumption
* Food type reference

Example:

> "Estimated based on a medium-sized grilled chicken breast."

---

## Image Processing Flow

1. Image received as Base64
2. Header (`data:image/...`) removed if present
3. Decoded into bytes
4. Sent to Gemini as a multimodal input

Images enhance recognition but are not mandatory.

---

## Error Handling

### API Errors

* Missing API Key → Server exits on startup
* Gemini quota exceeded → HTTP 429
* Invalid AI output → HTTP 500

### Output Safety

* AI is forced to return `application/json`
* Responses are validated and standardized to lists

---

## Model Configuration

* **Model**: `gemini-2.5-flash`
* **Temperature**: `0.1` (low randomness)
* **Response Type**: `application/json`

This ensures deterministic, structured outputs.

---

## Limitations

* Estimates are not medical advice
* Accuracy depends on food description quality
* Portion size assumptions may vary

---

## Future Improvements

* User profile-based calorie needs
* Daily calorie tracking
* Export nutrition history
* Multi-language support
* Offline fallback estimates

---

## License & Disclaimer

This project is for **educational and experimental use only**.
Nutritional values are **approximations** and should not replace professional dietary advice.

---

## Author Notes

Designed as a clean, modular AI-powered nutrition analyzer using modern LLM-based reasoning with strict output control.
