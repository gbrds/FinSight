# Project Setup Guide

## 1. Node Setup
Run the following command to install JavaScript dependencies:

npm install

---

## 2. Python Virtual Environment

### Windows
py -3 -m venv venv
venv\Scripts\activate

### Linux / Mac
python3 -m venv venv
source venv/bin/activate

---

## 3. Install Python Dependencies
pip install -r requirements.txt

If you install new Python packages:
pip freeze > requirements.txt

---

## 4. Running the Project
(Replace these with your real commands)

npm run dev
python app.py

---

## 5. Deactivate Virtual Environment
deactivate

---

## FAQ

**pip not found?**  
Install Python and ensure you checked "Add to PATH".

**yfinance not found?**  
You forgot to activate your virtual environment.