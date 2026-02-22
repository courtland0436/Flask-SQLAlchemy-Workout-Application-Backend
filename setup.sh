#!/bin/bash

# Exit on any error
set -e

echo "Starting Turnkey Setup from GitHub..."

# 1. Setup Backend
echo "Installing Python dependencies..."
cd server
pip install -r requirements.txt

# 2. Initialize Database & Seed
echo "Initializing database and seeding exercises..."
# This runs your seed script to ensure the professor has data immediately
python seed.py 

# 3. Setup Frontend
echo "Installing React dependencies..."
cd ../client
npm install

echo "Setup Complete!"
echo "-------------------------------------------------------"
echo "To run the app:"
echo "Terminal A: cd server && python app.py"
echo "Terminal B: cd client && npm start"
echo "-------------------------------------------------------"