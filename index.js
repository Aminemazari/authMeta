import express from "express";
import fetch from "node-fetch";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ==== FACEBOOK CONFIG ====
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

// ==== INSTAGRAM CONFIG ====
const IG_APP_ID = process.env.IG_APP_ID;
const IG_APP_SECRET = process.env.IG_APP_SECRET;
const IG_REDIRECT_URI = process.env.IG_REDIRECT_URI;

// ==== SHARED HTML TEMPLATE ====
const getHTML = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meta OAuth Token Generator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 40px;
      font-size: 14px;
    }

    .buttons-container {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .auth-button {
      flex: 1;
      min-width: 200px;
      padding: 16px 24px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: white;
    }

    .facebook-btn {
      background: #1877f2;
      box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
    }

    .facebook-btn:hover {
      background: #0c63d4;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(24, 119, 242, 0.6);
    }

    .instagram-btn {
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      box-shadow: 0 4px 15px rgba(188, 24, 136, 0.4);
    }

    .instagram-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(188, 24, 136, 0.6);
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .token-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .token-card h3 {
      color: #333;
      margin-bottom: 16px;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .token-item {
      background: white;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      word-break: break-all;
    }

    .token-item:last-child {
      margin-bottom: 0;
    }

    .token-label {
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .token-value {
      color: #333;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .success-icon {
      color: #10b981;
      font-size: 24px;
    }

    .info-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
    }

    .back-button {
      display: block;
      text-align: center;
      color: #667eea;
      text-decoration: none;
      margin-top: 24px;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .back-button:hover {
      color: #764ba2;
    }

    @media (max-width: 600px) {
      .buttons-container {
        flex-direction: column;
      }

      .auth-button {
        min-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

// ==== HOME PAGE ====
app.get("/", (req, res) => {
  const content = `
    <h1>🔐 Meta OAuth Token Generator</h1>
    <p class="subtitle">Generate long-lived access tokens for Facebook & Instagram</p>
    
    <div class="buttons-container">
      <a href="/auth/facebook" class="auth-button facebook-btn">
        <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Login with Facebook
      </a>
      
      <a href="/auth/instagram" class="auth-button instagram-btn">
        <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        Login with Instagram
      </a>
    </div>
  `;
  res.send(getHTML(content));
});

// ==== FACEBOOK ROUTES ====
app.get("/auth/facebook", (req, res) => {
  const authURL = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    FB_REDIRECT_URI
 )}&scope=pages_messaging,pages_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata,business_management,email,public_profile&response_type=code`;
  res.redirect(authURL);
});

app.get("/auth/facebook/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    // Get short-lived token
    const shortRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
        FB_REDIRECT_URI
      )}&client_secret=${FB_APP_SECRET}&code=${code}`
    );
    const shortData = await shortRes.json();
    if (!shortData.access_token)
      return res.status(400).json({ error: "Failed to get short-lived token", details: shortData });

    const shortToken = shortData.access_token;

    // Exchange for long-lived token
    const longRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${shortToken}`
    );
    const longData = await longRes.json();
    if (!longData.access_token)
      return res.status(400).json({ error: "Failed to get long-lived token", details: longData });

    const content = `
      <h1>✨ Facebook Authentication Success</h1>
      <p class="subtitle">Your tokens have been generated successfully</p>

      <div class="token-card">
        <h3>
          <span class="success-icon">✓</span>
          Access Tokens
        </h3>
        
        <div class="token-item">
          <span class="token-label">Short-Lived Token</span>
          <div class="token-value">${shortToken}</div>
        </div>

        <div class="token-item">
          <span class="token-label">Long-Lived Token</span>
          <div class="token-value">${longData.access_token}</div>
        </div>

        <div class="info-badge">
          ⏱️ Expires in ${Math.round(longData.expires_in / 86400)} days
        </div>
      </div>

      <a href="/" class="back-button">← Generate Another Token</a>
    `;
    res.send(getHTML(content));
  } catch (err) {
    console.error("Facebook Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ==== INSTAGRAM ROUTES ====
app.get("/auth/instagram", (req, res) => {
  const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${IG_APP_ID}&redirect_uri=${encodeURIComponent(
    IG_REDIRECT_URI
  )}&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights&response_type=code&force_reauth=true`;
  res.redirect(authUrl);
});

app.get("/auth/instagram/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    // Get short-lived token
    const shortResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: IG_APP_ID,
        client_secret: IG_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: IG_REDIRECT_URI,
        code: code,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const shortToken = shortResponse.data.access_token;

    // Exchange for long-lived token
    const longResponse = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${shortToken}`
    );

    const longToken = longResponse.data.access_token;
    const expiresIn = longResponse.data.expires_in;

    const content = `
      <h1>✨ Instagram Authentication Success</h1>
      <p class="subtitle">Your tokens have been generated successfully</p>

      <div class="token-card">
        <h3>
          <span class="success-icon">✓</span>
          Access Tokens
        </h3>
        
        <div class="token-item">
          <span class="token-label">Short-Lived Token</span>
          <div class="token-value">${shortToken}</div>
        </div>

        <div class="token-item">
          <span class="token-label">Long-Lived Token</span>
          <div class="token-value">${longToken}</div>
        </div>

        <div class="info-badge">
          ⏱️ Expires in ${Math.round(expiresIn / 86400)} days
        </div>
      </div>

      <a href="/" class="back-button">← Generate Another Token</a>
    `;
    res.send(getHTML(content));
  } catch (err) {
    console.error("Instagram Error:", err.response?.data || err.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
