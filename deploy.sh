#!/bin/bash
# This script tests the build and pushes the changes to GitHub.

echo "============================================"
echo "Starting deployment check and git push..."
echo "============================================"

echo "Checking and installing packages..."
npm install

echo "Building front-end project..."
npm run build:pages

if [ $? -ne 0 ]; then
    echo "Error: Build failed! Please inspect logs."
    exit 1
fi

echo "Build completed successfully. Folder 'dist' is ready."

if [ ! -d ".git" ]; then
    echo "Git repository not found. Initializing git..."
    git init
fi

echo "Staging and committing changes..."
git add .
git commit -m "Update website from AI Studio (Vite + React)"

BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

echo "Pushing to branch: $BRANCH..."
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo "============================================"
    echo "Success! Your project was pushed to GitHub."
    echo "Cloudflare will build and publish it shortly."
    echo "============================================"
else
    echo "Error: Failed to push to GitHub. Check connection or remote repo settings."
fi
