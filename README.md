# 🚇 NYC Subway Real-Time Map

A modern web application displaying live NYC subway train locations using MTA's GTFS-realtime feeds.

## 🚀 Quick Deploy

### Deploy to Railway (Free - Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/D9dJhq)

**Steps:**
1. Click the Railway button above
2. Sign in with GitHub
3. Select this repository (`dantraynor/subwaymap`)
4. Choose the `clean-deployment` branch
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
7. Your live subway map will be ready!

### Deploy to Render (Free)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/dantraynor/subwaymap&branch=clean-deployment)

### Deploy to Heroku (Free)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/dantraynor/subwaymap/tree/clean-deployment)

---

## ✨ Features

- 🚇 **Real-time train data** from all MTA subway lines
- 🗺️ **Interactive map** with live train locations  
- 📱 **Responsive design** for mobile and desktop
- 🔄 **Auto-refresh** every 30 seconds
- 🎨 **Color-coded subway lines** matching MTA standards
- ⚡ **No API key required** - uses free MTA feeds
- 🌐 **Custom domain support**

## 📸 What It Looks Like

*Real-time subway map showing live train positions across NYC*

## 🔧 Local Development

```bash
# Clone and setup
git clone https://github.com/dantraynor/subwaymap.git
cd subwaymap
git checkout clean-deployment

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📊 API Endpoints

- `GET /api/mta/feeds/all` - All real-time train data
- `GET /api/mta/feed/:feedId` - Specific line group data
- `GET /health` - Health check

## 🏠 Project Structure

```
subwaymap/
├── server.js              # Express server with API
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Main webpage
│   ├── style.css          # Styling
│   └── app.js             # Frontend logic
└── README.md              # This file
```

## 🌍 Custom Domain Setup

### Connect Your Spaceship Domain:

1. **Deploy to Railway** (or another host)
2. **Get your Railway URL** (e.g., `your-app.up.railway.app`)
3. **In Spaceship DNS settings**, add:
   ```
   Type: CNAME
   Name: subway
   Value: your-app.up.railway.app
   ```
4. **Access at**: `subway.yourdomain.com`

### Alternative Subdomain Examples:
- `trains.yourdomain.com`
- `mta.yourdomain.com`  
- `realtime.yourdomain.com`

## 🔧 Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Map**: Leaflet.js
- **Data**: MTA GTFS-realtime feeds
- **Deployment**: Railway, Render, Heroku

## 📈 Performance

- **Fast loading**: ≈ 2-3 seconds initial load
- **Real-time updates**: 30-second refresh cycle
- **Mobile optimized**: Works on all devices
- **Low resource usage**: Minimal server requirements

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version (requires 16+)
2. **No train data**: MTA feeds may be temporarily down
3. **CORS errors**: Server includes proper CORS headers
4. **Map not loading**: Check internet connection

### Debug Steps:

1. Open browser developer tools (F12)
2. Check Console for errors
3. Verify `/api/mta/feeds/all` returns data
4. Check Network tab for failed requests

## 📝 Data Sources

- **Real-time**: [MTA GTFS-realtime feeds](https://api.mta.info/#/subwayRealTimeFeeds)
- **Static**: [MTA GTFS static data](https://new.mta.info/developers)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

MIT License - feel free to use this project!

---

**Built with ❤️ for NYC transit enthusiasts**

*Real-time data provided by the MTA*