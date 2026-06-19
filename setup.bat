@echo off
echo ===================================================
echo   EduVerse AI - Automated Setup Script (Windows)
echo ===================================================
echo.

:: Step 1: Install Root Dependencies (concurrently, etc.)
echo [1/5] Installing root project dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Root npm install failed!
    exit /b %ERRORLEVEL%
)
echo.

:: Step 2: Install Backend and Frontend Dependencies
echo [2/5] Installing Backend and Frontend dependencies...
call npm run install:all
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend/Backend npm install failed!
    exit /b %ERRORLEVEL%
)
echo.

:: Step 3: Set up Environment Files (.env)
echo [3/5] Setting up environment files...
if not exist "backend\.env" (
    echo Copying backend\.env.example to backend\.env...
    copy "backend\.env.example" "backend\.env"
) else (
    echo backend\.env already exists. Skipping.
)

if not exist "frontend\.env" (
    echo Copying frontend\.env.example to frontend\.env...
    copy "frontend\.env.example" "frontend\.env"
) else (
    echo frontend\.env already exists. Skipping.
)
echo.

:: Step 4: Setup Python Virtual Environment for ML-Service
echo [4/5] Setting up Python virtual environment for ML-Service...
cd ml-service

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Python was not found in your PATH. Please install Python 3.10+ and run the ml-service setup manually.
    cd ..
    goto finish
)

if not exist "venv" (
    echo Creating python virtual environment (venv)...
    python -m venv venv
) else (
    echo Python virtual environment (venv) already exists.
)

echo Activating virtual environment and installing packages...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Python dependency installation encountered errors. Please check your Python/pip installation.
)
call deactivate
cd ..
echo.

:finish
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo To run the project:
echo 1. Set up your PostgreSQL database (see README.md).
echo 2. Update backend\.env with your database credentials.
echo 3. Start the application by running:
echo      npm run dev
echo.
pause
