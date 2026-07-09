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
    echo ""
    echo "============================================"
    echo "⚠️ Git Push Rejected!"
    echo "============================================"
    echo "This usually happens because the remote repository (GitHub) has commits"
    echo "that you do not have locally."
    echo ""
    echo "What would you like to do?"
    echo "[1] Try to pull remote changes and merge (Safe)"
    echo "[2] Force Push (Overwrites GitHub with your current local files - recommended if AI Studio is your source of truth)"
    echo "[3] Exit"
    echo ""
    read -p "Enter option (1, 2, or 3): " choice

    case $choice in
        1)
            echo ""
            echo "Trying to pull remote changes..."
            git pull origin $BRANCH --no-rebase
            if [ $? -ne 0 ]; then
                echo "Error: Pull failed due to conflicts. Please resolve them manually."
                exit 1
            fi
            echo ""
            echo "Pull succeeded! Retrying push..."
            git push origin $BRANCH
            if [ $? -eq 0 ]; then
                echo "============================================"
                echo "Success! Your project was pushed to GitHub."
                echo "Cloudflare will build and publish it shortly."
                echo "============================================"
            else
                echo "Error: Failed to push to GitHub. Check connection or remote repo settings."
                exit 1
            fi
            ;;
        2)
            echo ""
            echo "Warning: This will overwrite files on GitHub!"
            read -p "Are you sure you want to force push? (y/n): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                echo "Force pushing to branch $BRANCH..."
                git push origin $BRANCH --force
                if [ $? -eq 0 ]; then
                    echo "============================================"
                    echo "Success! Your project was force-pushed to GitHub."
                    echo "Cloudflare will build and publish it shortly."
                    echo "============================================"
                else
                    echo "Error: Failed to push to GitHub. Check connection or remote repo settings."
                    exit 1
                fi
            else
                echo "Cancelled."
                exit 1
            fi
            ;;
        *)
            echo "Exiting."
            exit 1
            ;;
    esac
fi
