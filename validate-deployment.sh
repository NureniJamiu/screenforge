#!/bin/bash

# Deployment validation script for ScreenForge

echo "🚀 ScreenForge Deployment Validation"
echo "===================================="

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

if [[ $node_version < "v18" ]]; then
    echo "❌ Node.js version should be 18 or higher"
    exit 1
fi

# Check if in correct directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the root of the ScreenForge repository"
    exit 1
fi

echo "✅ Repository structure validated"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Install frontend dependencies
echo "📥 Installing frontend dependencies..."
cd frontend && npm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build:frontend

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Check if required files exist
echo "📋 Checking required configuration files..."

required_files=(
    "vercel.json"
    "frontend/vercel.json" 
    "backend/vercel.json"
    "frontend/.env.example"
    "backend/.env.example"
    "backend/prisma/schema.prisma"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "🎉 Deployment validation complete!"
echo ""
echo "Next steps for Vercel deployment:"
echo "1. Deploy frontend from root directory with these settings:"
echo "   - Framework: Vite"
echo "   - Build Command: npm run build:frontend"
echo "   - Output Directory: frontend/dist"
echo "   - Install Command: npm install && cd frontend && npm install"
echo ""
echo "2. Deploy backend from 'backend' directory as a separate project:"
echo "   - Framework: Other"
echo "   - Build Command: npm run vercel-build"
echo "   - Output Directory: dist"
echo ""
echo "3. Set up environment variables as described in DEPLOYMENT.md"
echo "4. Update VITE_API_URL in frontend environment to point to backend deployment"