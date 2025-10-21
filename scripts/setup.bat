@echo off
echo 🚀 Setting up QUIB Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please update .env file with your configuration
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🗄️  Setting up database...
npx prisma generate
if %errorlevel% neq 0 (
    echo ⚠️  Prisma client generation failed
)

REM Create logs directory
if not exist logs mkdir logs
echo ✅ Created logs directory

REM Build the project
echo 🔨 Building project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful

echo.
echo 🎉 QUIB Backend setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Set up your PostgreSQL database
echo 3. Run 'npm run dev' to start development server
echo 4. Visit http://localhost:3000/api/health to test
echo.
echo For production deployment:
echo - Vercel: Connect your repository and set environment variables
echo - Render: Use the provided render.yaml configuration
echo - Docker: Run 'docker build -t quib-backend .'
echo.
pause
