# Deploy to Spaceship Hosting

This guide will help you deploy your NYC Subway Map to Spaceship hosting using their "Custom website" option.

## 📁 Files to Upload

You need to upload these files from the `static/` folder to your Spaceship hosting:

```
static/
├── index.html          # Main page
├── style.css           # Styling
├── script.js           # App functionality
└── map.js              # Map functionality
```

## 🚀 Deployment Steps

### Step 1: Download the Static Files

1. Go to your GitHub repository: https://github.com/dantraynor/subwaymap
2. Switch to the `feature/static-deployment` branch
3. Navigate to the `static/` folder
4. Download each file:
   - Click on each file (index.html, style.css, script.js, map.js)
   - Click the "Raw" button
   - Right-click and "Save As" to download

### Step 2: Upload to Spaceship

1. **Go to Spaceship Hosting Manager**
   - Visit: https://spaceship.com/application/hosting-manager/
   - Log in to your account

2. **Create New Website**
   - Click "+ New hosting"
   - Select "Custom website"
   - Click "Start"

3. **Upload Files**
   - Use the file manager or FTP to upload your files
   - Upload all 4 files to the root directory (public_html or www folder)
   - Make sure `index.html` is in the root

4. **Set Up Domain**
   - Connect your domain to the hosting
   - Update DNS if needed

### Step 3: Test Your Site

1. Visit your domain in a browser
2. You should see the NYC Subway Map
3. The map should load with sample train data

## 📝 Important Notes

### About This Static Version

- **Demo Data**: Uses simulated train data since CORS restrictions prevent direct API calls
- **Limited Functionality**: Real-time data may not work due to browser security
- **For Demo Purposes**: Great for showing the interface and concept

### For Full Real-Time Data

If you want full real-time MTA data, you have two options:

1. **Use Node.js Hosting**: Find a host that supports Node.js (like Heroku, Railway, Render)
2. **Use a Proxy Service**: Set up a simple proxy server elsewhere to handle MTA API calls

## 🔧 Troubleshooting

### Common Issues

1. **Files not loading**: Check file paths and make sure all files are in the same directory
2. **Map not showing**: Ensure you have internet connection for map tiles
3. **No train data**: This is expected in the static version due to CORS

### File Structure on Server

```
your-domain.com/
├── index.html          # Main page (must be in root)
├── style.css           # Styling
├── script.js           # App functionality
└── map.js              # Map functionality
```

## 🌐 Alternative Hosting Options

If Spaceship doesn't work well, consider these free alternatives:

- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for GitHub repos
- **Surge.sh**: Simple static hosting

## 📞 Need Help?

If you run into issues:
1. Check the browser console for errors (F12)
2. Verify all files uploaded correctly
3. Test with a simple HTML file first
4. Contact Spaceship support for hosting-specific issues

## ✨ Next Steps

Once deployed:
1. Test the site on mobile devices
2. Consider upgrading to Node.js hosting for real data
3. Add more subway stations to the map
4. Customize the design to your liking
