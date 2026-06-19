#!/bin/bash

echo "==================================================="
echo "  EduVerse AI - Automated Setup Script (Mac/Linux)"
echo "==================================================="
echo

# Step 1: Install Root Dependencies
echo "[1/5] Installing root project dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Root npm install failed!"
    exit 1
fi
echo

# Step 2: Install Backend and Frontend Dependencies
echo "[2/5] Installing Backend and Frontend dependencies..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "[ERROR] Frontend/Backend npm install failed!"
    exit 1
fi
echo

# Step 3: Set up Environment Files (.env)
echo "[3/5] Setting up environment files..."
if [ ! -f "backend/.env" ]; then
    echo "Copying backend/.env.example to backend/.env..."
    cp backend/.env.example backend/.env
else
    echo "backend/.env already exists. Skipping."
fi

if [ ! -f "frontend/.env" ]; then
    echo "Copying frontend/.env.example to frontend/.env..."
    cp frontend/.env.example frontend/.env
else
    echo "frontend/.env already exists. Skipping."
fi
echo

# Step 4: Setup Python Virtual Environment for ML-Service
echo "[4/5] Setting up Python virtual environment for ML-Service..."
cd ml-service

if ! command -v python3 &> /dev/null; then
    echo "[WARNING] Python 3 was not found in your PATH. Please install Python 3.10+ and run the ml-service setup manually."
    cd ..
    exit 0
fi

if [ ! -d "venv" ]; then
    echo "Creating python virtual environment (venv)..."
    python3 -m venv venv
else
    echo "Python virtual environment (venv) already exists."
fi

echo "Activating virtual environment and installing packages..."
source venv/bin/activate
python3 -m pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[WARNING] Python dependency installation encountered errors. Please check your Python/pip installation."
fi
deactivate
cd ..
echo

echo "==================================================="
echo "  Setup Complete!"
echo "==================================================="
echo "To run the project:"
echo "1. Set up your PostgreSQL database (see README.md)."
echo "2. Update backend/.env with your database credentials."
echo "3. Start the application by running:"
echo "     npm run dev"
echo
