#!/bin/bash

# QUIB Backend Setup Script
echo "🚀 Setting up QUIB Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Check if Prisma is available
if command -v npx &> /dev/null; then
    echo "🗄️  Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Check if database is accessible
    if npx prisma db push --accept-data-loss --skip-generate 2>/dev/null; then
        echo "✅ Database connection successful"
    else
        echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
    fi
else
    echo "❌ npx not available. Please install npm properly."
    exit 1
fi

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 QUIB Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run dev' to start development server"
echo "4. Visit http://localhost:3000/api/health to test"
echo ""
echo "For production deployment:"
echo "- Vercel: Connect your repository and set environment variables"
echo "- Render: Use the provided render.yaml configuration"
echo "- Docker: Run 'docker build -t quib-backend .'"
echo ""
