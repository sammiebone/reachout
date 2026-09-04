REACHOUT APPLICATION SETUP GUIDE

This is a complete web application for sending email and SMS messages through a unified interface.

REQUIREMENTS

Node.js 16 or higher
npm or yarn package manager
Python 3.8 or higher
pip Python package manager
Gmail account with app-specific password enabled
Modern web browser

PROJECT STRUCTURE

root
├── server.js
├── package.json
├── .env
├── .env.example
└── client
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── components
            ├── EmailPhoneForm.jsx
            └── MessageEditor.jsx

INSTALLATION STEPS

1. Clone SMS-Sender repository
   git clone https://github.com/farukalpay/SMS-Sender.git

2. Install Python dependencies
   pip3 install -r requirements.txt

3. Install root dependencies
   npm install

4. Install client dependencies
   cd client
   npm install
   cd ..

5. Set up environment variables
   Copy .env file and update with Gmail credentials

CONFIGURATION

PYTHON SMS-SENDER SETUP

1. Verify Python installed
   python3 --version (requires Python 3.8 or higher)

2. Clone SMS-Sender repository
   git clone https://github.com/farukalpay/SMS-Sender.git

3. Install Python dependencies
   pip3 install -r requirements.txt

4. Configure SMS-Sender
   Follow SMS-Sender/README.md for gateway setup
   Configure API credentials for your SMS provider
   Test SMS sending from SMS-Sender directory

GMAIL SETUP

1. Enable 2-Factor Authentication on Gmail account
2. Generate App Password from myaccount.google.com/apppasswords
3. Select Mail and Windows Computer
4. Add these to .env file:
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

RUNNING THE APPLICATION

Development Mode (Local)
npm run dev

This starts both frontend development server on port 5173 and backend on port 5000.

Production Deployment (Recommended)
Deploy to Railway for production use:
See RAILWAY_DEPLOYMENT.txt or RAILWAY_QUICKSTART.txt

Local Production Build
npm run build

Start Production Server
npm start

Server will run on http://localhost:5000

API ENDPOINTS

POST /api/send
Sends message to email and phone numbers

Request body
{
  "email": "recipient@example.com",
  "phoneNumbers": ["+1234567890", "+1987654321"],
  "htmlContent": "<p>Your message here</p>"
}

Response
{
  "success": true,
  "emailMessageId": "message-id-from-nodemailer",
  "smsMessageIds": ["sid1", "sid2", "sid3"]
}

FRONTEND FEATURES

Email input field with validation
Phone number management with add/remove functionality
Rich text editor with formatting options
Message preview
Loading states and error messages
Responsive design for desktop and mobile

TEXT FORMATTING OPTIONS

Bold, Italic, Underline, Strikethrough
Heading levels H1, H2
Bullet lists and numbered lists
Text alignment left, center, right
Clear formatting button

SMS CONVERSION

HTML message is automatically converted to plain text for SMS
HTML tags are stripped
Entities are decoded
Line breaks are preserved
Special characters are handled correctly

ERROR HANDLING

Invalid email format rejected
Phone numbers validated for minimum 10 digits
Empty message body rejected
API errors displayed to user
Network timeouts handled gracefully

DEVELOPMENT NOTES

Frontend built with React 18 and Vite
TipTap WYSIWYG editor for rich text
Axios for HTTP requests
Backend Express server with CORS enabled
Nodemailer for email delivery
Python SMS-Sender for SMS delivery via child processes

TROUBLESHOOTING

Emails not sending
Check EMAIL_USER and EMAIL_PASSWORD in .env
Verify Gmail app password is correct
Check Gmail 2FA is enabled

SMS not sending
Verify SMS-Sender directory exists in root
Check SMS-Sender is properly configured
Ensure Python 3.8 or higher installed
Verify phone numbers are valid
Review SMS-Sender/README.md for gateway setup

Python SMS service errors
SMS-Sender not found in root directory
Run: git clone https://github.com/farukalpay/SMS-Sender.git
Verify Python dependencies: pip3 install -r requirements.txt

Connection refused errors
Backend server not running on port 5000
Check NODE_ENV=development in .env
Verify .env file exists and is properly configured

CORS errors
Frontend and backend on different origins
Development proxy configured in vite.config.js
Production build served from backend

PRODUCTION DEPLOYMENT

1. Build React frontend
   npm run build

2. Set NODE_ENV=production in .env

3. Deploy to hosting service supporting Node.js and Python
   Heroku, Railway, DigitalOcean, AWS, etc

4. Install SMS-Sender on server
   git clone https://github.com/farukalpay/SMS-Sender.git
   pip3 install -r requirements.txt

5. Update environment variables on hosting platform

6. Ensure Gmail credentials are secure

7. Configure SMS provider credentials on server

SECURITY CONSIDERATIONS

Never commit .env file to version control
Use environment variables for all credentials
Validate email and phone inputs on backend
Rate limit API endpoints in production
Use HTTPS in production
Store sensitive data securely

LICENSE

This project is provided as is for development use.
