<<<<<<< HEAD
# Pencraft Writing Platform

A full-stack writing platform where users can read, upload writings, and interact with authors.

## Features

- User authentication (register/login)
- Create and publish writings with markdown support
- Browse featured writings on the home page
- Explore writings by category
- User profiles with followers system
- Social interactions (like, comment, bookmark)
- Weekly writing challenges
- Dark mode support
- Responsive design for all devices

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, ShadcnUI components
- **Backend**: Node.js, Express
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Styling**: TailwindCSS
- **Forms**: React Hook Form, Zod validation
- **Authentication**: Passport.js with session-based auth

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment Instructions

### Option 1: Deploy to Vercel (Frontend + Backend)

#### Prerequisites

- Vercel account
- GitHub account (optional, for continuous deployment)

#### Steps

1. Push your code to a GitHub repository (or use Vercel CLI for direct uploads)

2. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Run the deployment script:
   ```bash
   ./deploy-vercel.sh
   ```

5. Deploy with Vercel CLI:
   ```bash
   vercel
   ```

6. Configure environment variables in Vercel Dashboard:
   - `SESSION_SECRET`: A secure random string for session encryption
   - `VITE_API_URL`: Your API URL (leave empty if you're deploying frontend and backend together)

7. Your app is now deployed on Vercel!

### Option 2: Split Deployment (Recommended for Production)

#### Frontend Deployment (Vercel)

1. Follow steps 1-5 from Option 1

2. Set the `VITE_API_URL` to point to your backend API URL

#### Backend Deployment (Render, Heroku, etc.)

1. Choose a backend hosting provider (Render, Heroku, DigitalOcean, etc.)

2. Follow their deployment instructions for Node.js applications

3. Configure the backend environment variables:
   - `SESSION_SECRET`: A secure random string for session encryption
   - Add any other required environment variables for your database connection

4. Set up CORS to allow requests from your frontend domain

## Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks 
│   │   ├── lib/             # Utility functions and configuration
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main app component
│   │   ├── index.css        # Global styles
│   │   └── main.tsx         # Entry point
│   └── index.html           # HTML template
├── server/                  # Backend Express server
│   ├── auth.ts              # Authentication logic
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data storage implementation
│   └── vite.ts              # Vite integration
└── shared/                  # Shared code (types/schemas)
    └── schema.ts            # Database schema and types
```

## Environment Variables

### Frontend (.env.production)

```
VITE_API_URL=https://your-api-url.com
```

### Backend

```
SESSION_SECRET=your_secure_session_secret
PORT=5000 (optional)
```

## License

MIT
=======
# WritewWngs
>>>>>>> 1bd37d9a8e06283ddbc882d75b246eea965b2d13
