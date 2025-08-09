# Cloudinary Setup Guide

## Why Cloudinary?
Railway's file system is ephemeral, meaning uploaded images are lost on each deployment. Cloudinary provides persistent cloud storage for images.

## Setup Steps:

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Get your credentials from the dashboard

### 2. Add Environment Variables
Add these to your Railway backend environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Get Your Credentials
From your Cloudinary dashboard, you'll find:
- Cloud Name
- API Key  
- API Secret

### 4. Deploy
After adding the environment variables, redeploy your backend to Railway.

## Benefits:
- ✅ Images persist between deployments
- ✅ Automatic image optimization
- ✅ CDN for fast loading
- ✅ Free tier includes 25GB storage
- ✅ Automatic image transformations

## Migration:
Existing images in your database will still reference local paths. You may need to:
1. Download existing images
2. Re-upload them through the new system
3. Update database records

## Alternative Solutions:
If you prefer not to use Cloudinary, consider:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
