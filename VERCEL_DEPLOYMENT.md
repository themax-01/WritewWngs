# Deploying to Vercel - Step-by-Step Guide

This guide will walk you through deploying your Pencraft Writing Platform to Vercel.

## Prerequisites

- A Vercel account (you can sign up at [vercel.com](https://vercel.com))
- Git repository with your project (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Project

Your project has already been configured for Vercel deployment with:
- vercel.json configuration file
- API endpoint for serverless functions
- Environment variable support
- Frontend configuration for API URL
  
## Step 2: Push Your Code to a Git Repository

If you haven't already, push your code to a Git repository:

```bash
# Initialize git repository (if needed)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository
git remote add origin <your-repository-url>

# Push to remote repository
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended for Beginners)

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." and select "Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as is (/)
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`
   
5. Add environment variables:
   - `SESSION_SECRET`: A random string for session encryption (e.g., generate with `openssl rand -hex 32`)
   - `VITE_API_URL`: Leave empty for now if you're deploying frontend and backend together

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

## Step 4: Configure Domain and Environment Variables (After Deployment)

1. After deployment, go to your project in the Vercel dashboard
2. Go to "Settings" > "Environment Variables"
3. Add or update environment variables:
   - `SESSION_SECRET`: A random string for session encryption
   - `VITE_API_URL`: If you're using split deployment, enter your backend API URL

## Step 5: Verify Deployment

1. Visit your deployed site at the URL provided by Vercel
2. Test all functionality:
   - Registration and login
   - Viewing writings
   - Creating new writings
   - Social features (like, comment, follow)

## Best Practices for Production

For a production environment, consider:

1. **Split Deployment**: 
   - Deploy frontend to Vercel
   - Deploy backend to a dedicated server platform (Render, Heroku, DigitalOcean)
   
2. **Database**: 
   - Set up a production database like PostgreSQL on a managed service
   - Update database connection strings in environment variables

3. **Monitoring**:
   - Set up error tracking with Sentry or LogRocket
   - Configure performance monitoring

4. **Security**:
   - Set up proper CORS settings
   - Use HTTPS for all connections
   - Configure secure cookies for sessions

## Troubleshooting

- **CORS Issues**: Make sure your backend allows requests from your frontend domain
- **API Connection Problems**: Verify that VITE_API_URL is set correctly
- **Deployment Failures**: Check build logs in Vercel dashboard for errors
- **Authentication Issues**: Verify SESSION_SECRET is set and session config is correct

## Maintenance

- Set up continuous deployment from your Git repository
- Configure webhooks for automatic deployments on code changes
- Regularly update dependencies for security patches