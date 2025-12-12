# Quiz Builder - Deployment Guide

## Quick Deploy to Vercel (Easiest Method)

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create free account)
2. Click the **+** button → **New repository**
3. Name it `quiz-builder`
4. Keep it **Public** or **Private** (your choice)
5. Click **Create repository**

### Step 2: Upload Files to GitHub

On the new repository page, click **"uploading an existing file"** link, then:

1. Drag and drop ALL these files:
   - `index.html`
   - `vercel.json`
   - `package.json`
   - `api/generate.js` (create the `api` folder first if needed)

2. Click **Commit changes**

### Step 3: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New...** → **Project**
3. Click **Import** next to your `quiz-builder` repository
4. **IMPORTANT**: Before deploying, add your API key:
   - Expand **Environment Variables**
   - Add:
     - **Name**: `GEMINI_API_KEY`
     - **Value**: `[Your Gemini API Key]`
5. Click **Deploy**

### Step 4: Done! 🎉

Your app will be live at: `https://quiz-builder-[random].vercel.app`

---

## Embed in Your LMS

Add this HTML snippet/widget in your Dialog LMS:

```html
<iframe 
  src="https://your-quiz-builder-url.vercel.app" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

---

## Security Features Included

✅ **Domain Restriction** - Only works on `*.dialogedu.com` domains
✅ **API Key Hidden** - Key stored securely in Vercel, never exposed to users  
✅ **Session Limits** - 20 AI generations per session
✅ **No Data Storage** - Nothing saved, resets on refresh

---

## Customization

### Change Session Limit
In `index.html`, find and change:
```javascript
const MAX_GENERATIONS = 20;
```

### Add More Allowed Domains
In `api/generate.js`, add to the array:
```javascript
const allowedDomains = [
  '.dialogedu.com',
  '.yournewdomain.com',  // Add more here
];
```

---

## Troubleshooting

### "Unauthorized domain" error
- Make sure you're accessing from a `*.dialogedu.com` domain
- Or add your domain to the `allowedDomains` list in `api/generate.js`

### "API key not configured" error
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Make sure `GEMINI_API_KEY` is set correctly

### Questions not generating
- Check your Gemini API key is valid at [aistudio.google.com](https://aistudio.google.com)
- Check Vercel function logs: Dashboard → Your Project → Deployments → Functions

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel Hosting | Free |
| Google Gemini API | Free (15 req/min, 1500/day) |
| **Total** | **$0/month** |

---

## Support

For issues, check:
1. Vercel deployment logs
2. Browser console (F12 → Console tab)
3. Gemini API status at [aistudio.google.com](https://aistudio.google.com)
