#!/bin/bash
# GhostNet.web Setup Script for Raspberry Pi 4
# Installs Node.js, npm, npx, React, TailwindCSS
# Tailwind init fixed via npx (ARM-friendly)
# React dev server configured for external access

set -e  # stop on error

PROJECT_NAME="ghostnet-web"

echo "=== GhostNet.web Setup Script ==="

# --- Step 1: Update system ---
echo "[1/12] Updating system..."
sudo apt update && sudo apt upgrade -y

# --- Step 2: Install prerequisites ---
echo "[2/12] Installing prerequisites..."
sudo apt install -y curl git build-essential

# --- Step 3: Install Node.js 20 LTS via NodeSource ---
if ! command -v node >/dev/null 2>&1; then
    echo "[3/12] Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "[3/12] Node.js already installed. Skipping..."
fi

# --- Step 4: Verify installations ---
echo "[4/12] Verifying installations..."
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "npx: $(npx -v || echo 'npx not found')"

# --- Step 5: Create React project ---
if [ ! -d "$PROJECT_NAME" ]; then
    echo "[5/12] Creating React project '$PROJECT_NAME'..."
    npx create-react-app $PROJECT_NAME -y
else
    echo "[5/12] Project '$PROJECT_NAME' already exists. Skipping create-react-app."
fi

# --- Step 6: Install TailwindCSS ---
echo "[6a/12] Installing TailwindCSS..."
sudo npm install -D postcss autoprefixer
echo "[6b/12] Installing TailwindCSS..."
sudo npm install -g tailwindcss

# --- Step 7: Initialize Tailwind config via npx ---
echo "[7/12] Initializing TailwindCSS..."
cd $PROJECT_NAME
npx tailwindcss init -p

# --- Step 8: Configure Tailwind for React ---
echo "[8/12] Configuring Tailwind..."
TAILWIND_CONFIG="tailwind.config.js"
if [ -f "$TAILWIND_CONFIG" ]; then
    sed -i "s|content: \[\]|content: ['./src/**/*.{js,jsx,ts,tsx}']|" $TAILWIND_CONFIG
fi

INDEX_CSS="src/index.css"
if ! grep -q "tailwind" $INDEX_CSS; then
    echo -e "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > $INDEX_CSS
fi

# --- Step 9: Provide starter App.js ---
echo "[9/12] Creating starter App.js..."
APP_JS="src/App.js"
cat > $APP_JS << 'EOF'
import React from "react";

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-20 px-6 text-center shadow-xl">
        <h1 className="text-5xl font-extrabold mb-4">👻 GhostNet.web</h1>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Een modern platform met React + Tailwind. Minimalistisch, snel en mooi vormgegeven.
        </p>
        <button className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow hover:bg-gray-100 transition">
          Ontdek meer
        </button>
      </header>
      <main className="flex-1 px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Waarom GhostNet.web?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">⚡ Supersnel</h3>
            <p>Optimized met React en Tailwind voor maximale performance.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">🎨 Modern Design</h3>
            <p>Strak, minimalistisch en responsive op alle apparaten.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">🔒 Betrouwbaar</h3>
            <p>Gebouwd voor schaalbaarheid en veiligheid.</p>
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-gray-400 py-6 text-center">
        <p>© {new Date().getFullYear()} GhostNet.web. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
EOF

# --- Step 10: Configure React dev server for external access ---
echo "[10/12] Configuring React dev server for external access..."
REACT_APP_PATH="package.json"
if grep -q '"start": "react-scripts start"' $REACT_APP_PATH; then
    sed -i 's|"start": "react-scripts start"|"start": "react-scripts start --host 0.0.0.0"|' $REACT_APP_PATH
fi

# --- Step 11: Finish ---
PI_IP=$(hostname -I | awk '{print $1}')
echo "[11/12] Installing react-router-dom..."
npm install react-router-dom

echo "[12/12] ✅ GhostNet.web setup complete!"
echo "Start the project, run:"
cd $PROJECT_NAME && npm start &
echo "Access it in your browser via http://$PI_IP:3000"
