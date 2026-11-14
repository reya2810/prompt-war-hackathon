#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🎨 Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🌱 Initializing database and seed data..."
python3 -c "import sys; sys.path.insert(0, './backend'); from app.seed.seed_data import init_db; init_db()"

echo "✅ Build complete!"
