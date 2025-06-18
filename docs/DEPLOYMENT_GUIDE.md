# 🚀 Deployment Guide

## Overview

This guide covers deploying the RAG-powered MCQ Generator to various platforms including Netlify, Vercel, and custom servers.

## Prerequisites

- Node.js 18+
- Git repository
- Build artifacts (`npm run build`)

## Netlify Deployment

### Method 1: Git Integration (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Netlify Configuration**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18`

3. **Environment Variables**
   ```bash
   # Add in Netlify dashboard under Site settings > Environment variables
   NODE_VERSION=18
   NPM_VERSION=8
   ```

### Method 2: Manual Deployment

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Vercel Deployment

### Method 1: Git Integration

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configuration**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## GitHub Pages Deployment

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Manual GitHub Pages

```bash
# Build the project
npm run build

# Install gh-pages
npm install -g gh-pages

# Deploy
gh-pages -d dist
```

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### Docker Commands

```bash
# Build image
docker build -t rag-mcq-generator .

# Run container
docker run -p 80:80 rag-mcq-generator

# Docker Compose
docker-compose up -d
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

## AWS S3 + CloudFront

### S3 Bucket Setup

```bash
# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Enable static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://your-bucket-name --delete
```

### CloudFront Distribution

```json
{
  "DistributionConfig": {
    "CallerReference": "rag-mcq-generator",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-your-bucket-name",
          "DomainName": "your-bucket-name.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-your-bucket-name",
      "ViewerProtocolPolicy": "redirect-to-https",
      "Compress": true
    },
    "CustomErrorResponses": {
      "Quantity": 1,
      "Items": [
        {
          "ErrorCode": 404,
          "ResponsePagePath": "/index.html",
          "ResponseCode": "200"
        }
      ]
    },
    "Enabled": true
  }
}
```

## Performance Optimization

### Build Optimization

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['pdfjs-dist']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Asset Optimization

```bash
# Optimize images
npm install -g imagemin-cli
imagemin public/images/* --out-dir=public/images/optimized

# Compress assets
gzip -9 dist/assets/*.js
gzip -9 dist/assets/*.css
```

## Monitoring and Analytics

### Error Tracking

```typescript
// Add to main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE
});
```

### Performance Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Routing Issues**
   - Ensure proper redirect rules for SPA
   - Check server configuration for client-side routing

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

4. **PDF.js Worker Issues**
   - Ensure PDF.js worker is properly configured
   - Check CDN availability for worker script

### Health Checks

```bash
# Test deployment
curl -I https://your-domain.com
curl -I https://your-domain.com/health

# Check performance
lighthouse https://your-domain.com --output=json
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

### HTTPS Configuration

```bash
# Let's Encrypt SSL
certbot --nginx -d your-domain.com
```

## Maintenance

### Automated Updates

```yaml
# .github/workflows/update.yml
name: Update Dependencies

on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update dependencies
        run: |
          npm update
          npm audit fix
          npm run build
          npm test
```

### Backup Strategy

```bash
# Backup deployment
aws s3 sync s3://your-bucket-name s3://your-backup-bucket --delete

# Database backup (if applicable)
pg_dump your_database > backup.sql
```