@echo off
REM Jemini Restaurant - Production Deployment Script (Windows)

echo 🚀 Jemini Restaurant Notification System Deployment
echo =================================================

REM Set deployment environment
set NODE_ENV=production

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js
    exit /b 1
)

echo 📋 Checking environment setup...

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --production=false
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Dependency installation failed
    exit /b 1
)

REM Run linting
echo 🔍 Running code quality checks...
call npm run lint
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Linting failed. Please fix errors before deployment.
    exit /b 1
)

REM Build for production
echo 🏗️ Building for production...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Please fix errors before deployment.
    exit /b 1
)

REM Show bundle information
echo 📊 Build completed successfully!
dir dist\assets\*.js dist\assets\*.css

REM Create deployment timestamp
for /f "delims=" %%i in ('powershell -Command "Get-Date -Format 'yyyyMMdd-HHmmss'"') do set timestamp=%%i

echo 📦 Deployment package ready: dist\ folder
echo 📅 Deployment timestamp: %timestamp%

echo.
echo ✅ Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Upload dist\ folder contents to your web server
echo 2. Configure environment variables:
echo    - VITE_FIREBASE_API_KEY
echo    - VITE_FIREBASE_AUTH_DOMAIN  
echo    - VITE_FIREBASE_PROJECT_ID
echo    - VITE_WHATSAPP_API_URL
echo    - VITE_WHATSAPP_API_TOKEN
echo 3. Update Firebase Firestore rules
echo 4. Test notification flows in production
echo.
echo 🧪 Critical testing areas:
echo - Admin reservation notifications
echo - Chef order status notifications  
echo - Customer order tracking
echo - WhatsApp message delivery
echo - Real-time cross-device updates

pause
