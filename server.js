const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Set body parser limits for large bundle files (up to 10MB)
app.use(express.json({ limit: '10mb' }));

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

