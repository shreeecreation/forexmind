# ForexMind — Firebase Setup Guide

## 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" → name it "forexmind"
3. Disable Google Analytics (optional) → Create project

---

## 2. Enable Authentication

1. In Firebase Console → **Authentication** → Get Started
2. **Sign-in method** tab:
   - Enable **Email/Password**
   - Enable **Google**
3. For Google: add your app domain to Authorized domains (add localhost for dev)

---

## 3. Create Firestore Database

1. **Firestore Database** → Create database
2. Choose **Start in production mode** → Select your region (closest to you)
3. Go to **Rules** tab and paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /trades/{tradeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /insights/{insightId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /reports/{reportId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Motivation quotes - public read
    match /motivation/{quoteId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via Admin SDK
    }
  }
}
```

---

## 4. Get Your Firebase Config

1. **Project Settings** (gear icon) → General tab
2. Scroll down to **Your apps** → Add app → Web (</> icon)
3. Register app name: "ForexMind Web"
4. Copy the firebaseConfig object

---

## 5. Update index.html

Open `index.html` and find this block near the top of the script:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDEMO_REPLACE_WITH_YOUR_KEY",
  authDomain: "forexmind-demo.firebaseapp.com",
  projectId: "forexmind-demo",
  storageBucket: "forexmind-demo.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};
```

Replace with your actual config from step 4.

---

## 6. Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting in the forexmind folder
cd forexmind
firebase init hosting

# When prompted:
# - Select your project
# - Public directory: . (dot, current directory)
# - Single page app: No
# - Overwrite index.html: No

# Deploy!
firebase deploy --only hosting
```

Your app will be live at: `https://forexmind-demo.web.app`

---

## 7. Deploy to Netlify (Alternative - Easier)

1. Go to https://netlify.com → Sign up free
2. Drag and drop your `forexmind` folder onto the Netlify dashboard
3. Done! You get a live URL instantly.

---

## Running Locally (No Setup Needed)

Just open `index.html` in any browser — it runs in **Demo Mode** automatically with pre-generated sample trades. No Firebase needed to test.

---

## Demo Mode

If Firebase is not configured (or config is wrong), the app automatically:
- Creates a demo user session
- Generates 60 days of realistic sample trades
- Lets you test all features: CSV import, mistake analysis, reports, motivation

---

## CSV Format Support

### MT4 (History tab → Save as Report → detailed)
Required columns: Ticket, Open Time, Close Time, Type, Symbol, Lots, Open Price, Close Price, S/L, T/P, Profit

### MT5 (History tab → right-click → Save as CSV)
Required columns: Position, Symbol, Type, Volume, Price, S/L, T/P, Time, Profit

### TradingView (Strategy Tester → List of Trades → Export)
Required columns: Trade #, Type, Ticker, Qty, Date/Time Opened, Date/Time Closed, Price Opened, Price Closed, Profit

### Generic CSV (any platform)
Minimum required columns: symbol, open_time, close_time, type, lots/volume, profit
