# Deployment Guide

This guide explains how to deploy the unit-test-ui application using environment variables and Docker.

## Environment Variables

The application uses Vite environment variables. Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

```bash
# API Base URL
VITE_PUBLIC_API_URL=https://api.savollar.leetcode.uz:8443
```

### Environment Variable Format

- All Vite environment variables must be prefixed with `VITE_`
- Variables are accessible in the code via `import.meta.env.VITE_VARIABLE_NAME`
- The `.env` file should be in the root directory of the project

## Deployment Methods

### Method 1: Using Docker (Recommended)

#### Local Build and Test

1. **Set up environment variables:**

   ```bash
   # Create .env file
   echo "VITE_PUBLIC_API_URL=https://api.savollar.leetcode.uz:8443" > .env
   ```

2. **Build the Docker image:**

   ```bash
   docker build -t unit-test-ui .
   ```

3. **Run the container:**

   ```bash
   docker run -p 3001:80 unit-test-ui
   ```

4. **Access the application:**
   - Open http://localhost:3001 in your browser

#### Using Docker Compose

1. **Set up environment variables in `.env` file**

2. **Start the services:**

   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**

   ```bash
   docker-compose logs -f
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Method 2: Automated Deployment Script

The project includes a `deploy.sh` script for automated deployment to a remote server.

#### Prerequisites

- SSH access to the deployment server
- Server details configured in `deploy.sh`:
  - Host: 213.230.125.34
  - Port: 15211
  - User: sysadmin2

#### Deploy to Production

1. **Make the script executable:**

   ```bash
   chmod +x deploy.sh
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

The script will:

- SSH to the remote server
- Pull latest changes from git
- Rebuild Docker containers
- Restart the application

### Method 3: Manual Build and Deploy

#### Build for Production

1. **Set up environment variables:**

   ```bash
   # Create .env file with your production API URL
   echo "VITE_PUBLIC_API_URL=https://api.savollar.leetcode.uz:8443" > .env
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the application:**

   ```bash
   npm run build
   ```

4. **Preview the build locally:**

   ```bash
   npm run preview
   ```

5. **Deploy the `dist` folder:**
   - The `dist` folder contains the production build
   - Upload the contents of `dist` to your web server
   - Configure your web server to serve `index.html` for all routes (SPA routing)

#### Nginx Configuration

The project includes an `nginx.conf` file for serving the application:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

## Environment Variables in Different Environments

### Development

```bash
VITE_PUBLIC_API_URL=http://localhost:4000
```

### Staging

```bash
VITE_PUBLIC_API_URL=https://staging-api.example.com
```

### Production

```bash
VITE_PUBLIC_API_URL=https://api.savollar.leetcode.uz:8443
```

## Important Notes

1. **Environment variables are embedded at build time** - Vite replaces `import.meta.env.VITE_*` variables during the build process. You need to rebuild the application if you change environment variables.

2. **The `.env` file should NOT be committed to git** - Add it to `.gitignore`

3. **For Docker deployments**, environment variables are baked into the image during the build step. If you need to change them, rebuild the image.

4. **Build process:**
   - `npm run build` creates optimized production files in `dist/`
   - The Dockerfile runs `npm run build` during the image build
   - The built files are served by nginx

## Troubleshooting

### Environment variables not working

- Ensure variable names start with `VITE_`
- Restart the dev server after changing `.env` file
- For production, rebuild the application after changing `.env`

### Build fails

- Check that all dependencies are installed: `npm install`
- Verify Node.js version (requires Node 20+)
- Check for TypeScript errors: `npm run lint`

### Docker daemon not running

**Error:** `Cannot connect to the Docker daemon at unix://...`

**Solution:**

1. **macOS:** Start Docker Desktop application

   ```bash
   open -a Docker
   # Wait for Docker to start (whale icon in menu bar)
   docker ps  # Verify it's running
   ```

2. **Linux:** Start Docker service
   ```bash
   sudo systemctl start docker
   ```

### Docker build fails

- Ensure Docker is running (see above)
- Check Dockerfile syntax
- Verify all required files are present
- Try: `docker ps` to verify Docker daemon is accessible

### Deployment script fails

- Verify SSH access to the server
- Check server credentials in `deploy.sh`
- Ensure git repository is accessible on the server
- Verify Docker is installed on the remote server

## Quick Start Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Docker build and run
docker build -t unit-test-ui . && docker run -p 3001:80 unit-test-ui

# Deploy to production
./deploy.sh

# Build without Docker (alternative)
./deploy-without-docker.sh
```
