#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export PATH="$HOME/.local/bin:$PATH"

echo "=========================================================="
echo "🚀 Launching SkillPath AI - Multi-Agent Learning Platform"
echo "=========================================================="

# 1. Initialize DB & seed data
echo "📦 Checking and seeding database..."
python3 -m app.seed.seed_data || true

# 2. Start Unified Server
echo "🌐 Starting full-stack FastAPI application on http://127.0.0.1:8000..."
echo ""
echo "✨ Pre-configured Demo Accounts:"
echo "   Learner Demo: student@skillpath.ai / password123"
echo "   Admin Demo:   admin@skillpath.ai   / admin123"
echo ""
echo "Press Ctrl+C to stop the server."
echo "=========================================================="

python3 -m uvicorn app.main:app --app-dir "$DIR/backend" --host 127.0.0.1 --port 8000 --reload

