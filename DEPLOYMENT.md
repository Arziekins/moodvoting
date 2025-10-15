# Deployment Guide

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   cd /Users/aryasmac/mood-voting-cards
   vercel
   ```

4. Follow the prompts and your app will be deployed!

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js and deploy

## Backend Deployment Options

Since Socket.IO needs a persistent server, here are free options:

### Option 1: Railway (Recommended - Free Tier)

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
4. Deploy!

### Option 2: Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy!

### Option 3: Vercel Serverless (Advanced)

For a serverless approach, you can use Vercel's serverless functions with Socket.IO adapter.

## Environment Variables

Update your `.env.local` for production:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

## Production Checklist

- [ ] Update socket URL in environment variables
- [ ] Test room creation and joining
- [ ] Test voting functionality
- [ ] Test admin controls
- [ ] Test card flip animations
- [ ] Test on mobile devices

## Troubleshooting

### Common Issues

1. **Socket connection fails**: Check CORS settings and URL
2. **Cards don't flip**: Check CSS animations are loaded
3. **Real-time updates not working**: Verify Socket.IO server is running

### Debug Mode

Add this to your environment variables for debugging:
```env
DEBUG=socket.io:*
```

## Performance Optimization

- Use Redis for room storage in production
- Implement room cleanup for inactive rooms
- Add rate limiting for API endpoints
- Optimize bundle size with Next.js

## Security Considerations

- Add authentication if needed
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Consider adding CSRF protection
