#!/bin/bash

# Build script for Vercel deployment
echo "Preparing project for Vercel deployment..."

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Create production build
echo "Building client..."
cd client && npm run build

# Return to root
cd ..

echo "Deployment preparation complete!"
echo "You can now deploy to Vercel using the Vercel CLI or GitHub integration."
echo ""
echo "Instructions:"
echo "1. Create a new project on Vercel"
echo "2. Link this repository"
echo "3. Configure the following environment variables in Vercel:"
echo "   - SESSION_SECRET (for server-side authentication)"
echo "   - VITE_API_URL (your API URL after deployment)"
echo ""
echo "For split deployment (recommended):"
echo "1. Deploy the frontend (client) to Vercel"
echo "2. Deploy the backend (server) to a server platform like Render, Heroku, or DigitalOcean"
echo "3. Update VITE_API_URL to point to your backend URL"