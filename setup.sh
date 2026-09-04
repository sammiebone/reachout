#!/bin/bash

echo "Reachout Application Setup"
echo "=========================="
echo ""

echo "Cloning SMS-Sender repository..."
if [ ! -d SMS-Sender ]; then
    git clone https://github.com/farukalpay/SMS-Sender.git
    echo "SMS-Sender cloned successfully."
    echo ""
else
    echo "SMS-Sender already exists."
    echo ""
fi

echo "Installing Python dependencies..."
pip3 install -r requirements.txt

echo ""
echo "Installing Node.js dependencies..."
npm install

echo ""
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ".env file created. Please edit it with your Gmail credentials."
    echo ""
else
    echo ".env file already exists."
    echo ""
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Gmail credentials"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For detailed instructions, see QUICK_START.txt"
