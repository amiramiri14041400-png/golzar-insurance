#!/bin/bash

# Ensure script runs in its containing directory
cd "$(dirname "$0")"

echo "======================================================"
echo "    DEPLOYMENT UTILITY: GITHUB + CLOUDFLARE + SUPABASE"
echo "======================================================"
echo "This utility will guide you through the following steps:"
echo " 1. Install & update npm packages"
echo " 2. Build your React/Vite front-end files into the 'dist' folder"
echo " 3. Synchronize with your GitHub repository"
echo " 4. Directly deploy static files to Cloudflare Pages"
echo " 5. Inspect and verify Supabase configuration"
echo "======================================================"
echo ""

read -p "OK? Continue by pressing Y: " start_choice
if [[ ! "$start_choice" =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled by user."
    exit 0
fi

echo ""
echo "------------------------------------------------------"
echo "STEP 1: Checking and Installing Dependencies"
echo "------------------------------------------------------"
read -p "Run npm install? Press Y to continue: " inst_choice
if [[ "$inst_choice" =~ ^[Yy]$ ]]; then
    echo "Installing node packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Package installation failed!"
        exit 1
    fi
    echo "Packages installed successfully."
else
    echo "Skipping package installation."
fi

echo ""
echo "------------------------------------------------------"
echo "STEP 2: Cleaning and Building Production Files"
echo "------------------------------------------------------"
read -p "Clean old build and run build:pages? Press Y to continue: " build_choice
if [[ "$build_choice" =~ ^[Yy]$ ]]; then
    echo "Cleaning old build files..."
    npm run clean
    echo "Building website..."
    npm run build:pages
    if [ $? -ne 0 ]; then
        echo "Error: Build failed! Please review console errors."
        exit 1
    fi
    echo "Build completed successfully! Fresh 'dist' folder is updated."
else
    echo "Skipping build stage."
fi

echo ""
echo "------------------------------------------------------"
echo "STEP 3: Synchronizing Code with GitHub"
echo "------------------------------------------------------"
read -p "Stage, commit, and push to GitHub? Press Y to continue: " git_choice
if [[ "$git_choice" =~ ^[Yy]$ ]]; then
    if [ ! -d ".git" ]; then
        echo "Git repository not found in this folder. Initializing..."
        git init
    fi

    git add .
    git commit -m "Update project deployment files"

    # Get active branch name or default to main
    BRANCH=$(git branch --show-current)
    if [ -z "$BRANCH" ]; then
        BRANCH="main"
    fi

    echo "Pushing code to branch: $BRANCH..."
    git push origin $BRANCH

    if [ $? -eq 0 ]; then
        echo "Success! Changes have been synchronized to GitHub."
    else
        echo ""
        echo "⚠️ Git Push Failed/Rejected!"
        echo "------------------------------------------------------"
        echo "Your remote GitHub repository has changes that are not present locally,"
        echo "or the remote is not configured yet."
        echo ""
        echo "Select an action to proceed:"
        echo " [1] Safe Pull & Merge: Fetch remote changes, merge them, and push (Recommended)"
        echo " [2] Force Push: Overwrite your remote GitHub repository with local files"
        echo " [3] Skip GitHub upload"
        echo ""
        read -p "Enter your option (1, 2, or 3): " git_err_choice

        case $git_err_choice in
            1)
                echo "Pulling remote changes..."
                git pull origin $BRANCH --no-rebase
                if [ $? -ne 0 ]; then
                    echo "Error: Pull failed due to merge conflicts. Please resolve manually."
                    exit 1
                fi
                echo "Pull succeeded! Retrying push..."
                git push origin $BRANCH
                ;;
            2)
                read -p "Are you sure you want to force push? This will overwrite remote files! (y/n): " force_confirm
                if [[ "$force_confirm" =~ ^[Yy]$ ]]; then
                    echo "Force pushing to $BRANCH..."
                    git push origin $BRANCH --force
                else
                    echo "Force push cancelled."
                fi
                ;;
            *)
                echo "Skipping Git sync."
                ;;
        esac
    fi
else
    echo "Skipping Git synchronization."
fi

echo ""
echo "------------------------------------------------------"
echo "STEP 4: Deploying directly to Cloudflare Pages"
echo "------------------------------------------------------"
read -p "Deploy 'dist' folder directly to Cloudflare via Wrangler? Press Y to continue: " cf_choice
if [[ "$cf_choice" =~ ^[Yy]$ ]]; then
    if [ ! -d "dist" ]; then
        echo "Error: 'dist' folder does not exist! You must build the project first."
        exit 1
    fi
    echo "Launching Cloudflare Pages deployment with Wrangler..."
    echo "This will upload your build and give you a permanent production URL."
    npx wrangler pages deploy dist
else
    echo "Skipping direct Cloudflare deployment."
fi

echo ""
echo "------------------------------------------------------"
echo "STEP 5: Verifying Supabase Configuration"
echo "------------------------------------------------------"
# Check if supabase configurations are loaded
SUPABASE_URL_FOUND=false
SUPABASE_KEY_FOUND=false

if [ -f ".env" ]; then
    if grep -q "VITE_SUPABASE_URL=[a-zA-Z0-9]" .env; then
        SUPABASE_URL_FOUND=true
    fi
    if grep -q "VITE_SUPABASE_ANON_KEY=[a-zA-Z0-9]" .env; then
        SUPABASE_KEY_FOUND=true
    fi
fi

if [ "$SUPABASE_URL_FOUND" = true ] && [ "$SUPABASE_KEY_FOUND" = true ]; then
    echo "[SUCCESS] Supabase configuration variables are active in your local .env file!"
else
    echo "[NOTICE] Supabase connection keys are not yet configured in your local environment."
    echo "To connect to your database:"
    echo " 1. Make sure you create a '.env' file in this folder."
    echo " 2. Add the following values to it:"
    echo "    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL"
    echo "    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY"
    echo ""
    echo " 3. IMPORTANT: When deploying to Cloudflare Pages:"
    echo "    Go to your Cloudflare Dashboard -> Workers & Pages -> your-project -> Settings -> Variables,"
    echo "    and define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Environment Variables."
fi

echo ""
echo "======================================================"
echo "Deployment Process Complete!"
echo "======================================================"
read -p "Press any key to exit..." -n1 -s
echo ""
