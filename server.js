const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Set body parser limits for large bundle files (up to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to parse cookies from request headers
const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let parts = cookie.split('=');
    if (parts.length > 0) {
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    }
  });
  return list;
};

// Authentication Middleware
app.use((req, res, next) => {
  // Allow authentication endpoints
  if (req.path === '/login' || req.path === '/api/login') {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie);
  if (cookies.site_auth === 'Sadiq') {
    return next();
  }

  // Redirect to login page, preserving the original URL
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// Login Page Route
app.get('/login', (req, res) => {
  const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Access - TASMU</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }
        body {
            background: radial-gradient(circle at 50% 50%, #1a1b3a 0%, #0a0b16 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            color: #ffffff;
        }
        /* Animated background mesh circles */
        .circle {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 1;
            opacity: 0.5;
            animation: float 10s ease-in-out infinite alternate;
        }
        .circle-1 {
            width: 300px;
            height: 300px;
            background: #8a2be2;
            top: 20%;
            left: 25%;
        }
        .circle-2 {
            width: 400px;
            height: 400px;
            background: #00ffff;
            bottom: 15%;
            right: 20%;
            animation-delay: -5s;
        }
        @keyframes float {
            0% { transform: translateY(0) scale(1); }
            100% { transform: translateY(-30px) scale(1.1); }
        }
        .login-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 420px;
            padding: 2.5rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        .logo {
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
        }
        .logo svg {
            width: 80px;
            height: 80px;
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
        }
        h2 {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
            background: linear-gradient(45deg, #00ffff, #8a2be2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p.subtitle {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 2rem;
        }
        .input-group {
            position: relative;
            margin-bottom: 1.5rem;
            text-align: left;
        }
        .input-group label {
            display: block;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.5rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .input-group input {
            width: 100%;
            padding: 1rem 1.2rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            outline: none;
            color: #fff;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        .input-group input:focus {
            border-color: #00ffff;
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }
        .btn-submit {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #00ffff 0%, #8a2be2 100%);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
        }
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
        }
        .btn-submit:active {
            transform: translateY(0);
        }
        .error-message {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #ff4a5a;
            display: none;
            animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
        }
    </style>
</head>
<body>
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>
    
    <div class="login-container">
        <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="url(#grad1)"/>
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#8a2be2;stop-opacity:1" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <h2>TASMU Secure Portal</h2>
        <p class="subtitle">Please enter the security password to proceed</p>
        
        <form id="loginForm">
            <div class="input-group">
                <label for="password">Security Password</label>
                <input type="password" id="password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn-submit">Authenticate</button>
            <div class="error-message" id="errorMessage">Incorrect password. Please try again.</div>
        </form>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            
            errorDiv.style.display = 'none';
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                
                if (response.ok) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const next = urlParams.get('next') || '/';
                    window.location.href = next;
                } else {
                    errorDiv.style.display = 'block';
                    errorDiv.style.animation = 'none';
                    errorDiv.offsetHeight; // trigger reflow
                    errorDiv.style.animation = null;
                }
            } catch (err) {
                errorDiv.innerText = 'Connection error. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>`;
  res.send(loginHtml);
});

// Login API Endpoint
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Sadiq') {
    res.setHeader('Set-Cookie', 'site_auth=Sadiq; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax');
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ error: 'Incorrect password' });
});

// Logout Route
app.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'site_auth=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  res.redirect('/login');
});

// Wayback Machine URL rewriter middleware
app.use((req, res, next) => {
  const match = req.url.match(/\/web\/\d+im_\/http:?[/]+smart\.gov\.qa\/(.*)/) || 
                req.url.match(/\/web\/\d+id_\/http:?[/]+smart\.gov\.qa\/(.*)/) ||
                req.url.match(/\/web\/\d+\/http:?[/]+smart\.gov\.qa\/(.*)/);
  if (match) {
    const cleanUrl = '/' + match[1].split('?')[0];
    console.log(`Rewriting Wayback Request: ${req.url} -> ${cleanUrl}`);
    req.url = cleanUrl;
  }
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Upload API for browser subagent crawling bypass
app.post('/api/upload', (req, res) => {
  const { path: relativePath, content, isBinary } = req.body;
  if (!relativePath || !content) {
    return res.status(400).send('Missing path or content');
  }

  const destPath = path.join(__dirname, 'public', relativePath);
  const destDir = path.dirname(destPath);

  try {
    fs.mkdirSync(destDir, { recursive: true });
    
    if (isBinary) {
      const buffer = Buffer.from(content, 'base64');
      fs.writeFileSync(destPath, buffer);
    } else {
      fs.writeFileSync(destPath, content, 'utf8');
    }
    
    console.log(`Uploaded local file: ${destPath}`);
    res.status(200).send('Upload success');
  } catch (err) {
    console.error(`Upload failed: ${err.message}`);
    res.status(500).send(`Upload failed: ${err.message}`);
  }
});

// Fallback to index.html for single page application routing if needed
app.get('*', (req, res) => {
  if (req.url.match(/\.(png|jpe?g|svg|gif|webp)$/i)) {
    const ext = path.extname(req.url).split('?')[0];
    const basename = decodeURIComponent(path.basename(req.url.split('?')[0], ext));
    console.log(`Generating placeholder for missing image: ${req.url}`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">${basename}</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
  } else if (req.url.match(/\.(css|js|ico|woff2?|ttf|eot)$/i)) {
    console.log('404 Not Found:', req.url);
    res.status(404).send('Not Found');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

