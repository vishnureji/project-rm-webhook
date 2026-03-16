# 🎯 Webhook Analytics Dashboard

A modern React dashboard for visualizing webhook data with charts, analytics, and real-time insights.

## 📋 Features

- **📊 Real-time Analytics**
  - Total articles and authors count
  - Last updated timestamp
  
- **📈 Charts & Graphs**
  - Posts published per day (bar chart)
  - Top authors by post count (horizontal bar chart)
  - Author statistics grid with visual cards

- **📰 Article Management**
  - Recent articles list with timestamps
  - Direct links to published articles
  - Author information for each article

- **🔄 Auto-refresh**
  - Dashboard refreshes every 30 seconds
  - Live data updates

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Python 3.8+ (for the webhook server)
- PostgreSQL database

### 1. Install Dashboard Dependencies

```bash
cd dashboard
npm install
```

### 2. Start Backend Webhook Server

```bash
cd ..
python webhook.py
```

The webhook server will run on `http://localhost:8000`

### 3. Start Dashboard Development Server

In a new terminal:

```bash
cd dashboard
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## 📦 Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── StatsCard.jsx           # Statistics display cards
│   │   ├── PostsPerDayChart.jsx    # Daily posts bar chart
│   │   ├── TopAuthorsChart.jsx     # Authors horizontal bar chart
│   │   ├── TopAuthorsGrid.jsx      # Author cards grid
│   │   └── RecentArticles.jsx      # Recent articles list
│   ├── App.jsx                      # Main app component
│   ├── api.js                       # API client
│   ├── index.css                    # Styles
│   └── main.jsx                     # Entry point
├── public/
│   └── index.html                   # HTML template
├── package.json                     # Dependencies
└── vite.config.js                   # Vite configuration
```

## 🔌 API Endpoints (Backend)

The dashboard communicates with these API endpoints:

- `GET /api/stats` - Overall statistics (total articles, authors)
- `GET /api/posts-per-day` - Posts published per day (last 30 days)
- `GET /api/top-authors` - Top 15 authors by post count
- `GET /api/recent-articles?limit=20` - Recent articles

All endpoints are already added to `webhook.py`.

## 🎨 Styling

The dashboard features:
- **Color Scheme**: Purple gradient (from #667eea to #764ba2)
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Interactive Cards**: Hover effects and transitions
- **Mobile Friendly**: Works on all device sizes

## 📊 Data Visualization

### Charts Used
- **Recharts**: Modern charting library for React
  - Bar charts for posts per day
  - Horizontal bar charts for top authors
  - Responsive and interactive

### Components

1. **StatsCard** - Displays key metrics
2. **PostsPerDayChart** - Line/bar chart of daily activity
3. **TopAuthorsChart** - Horizontal bar chart of top authors
4. **TopAuthorsGrid** - Visual grid of author cards with avatars
5. **RecentArticles** - List of recently published articles

## 🔧 Configuration

### Backend (webhook.py)
- Database URL: Set `DATABASE_URL` environment variable
- Webhook credentials: Set `WEBHOOK_USER` and `WEBHOOK_PASS`
- Port: Default 8000 (set via `PORT` environment variable)

### Frontend (vite.config.js)
- API proxy: Configured to proxy `/api` to `http://localhost:8000`
- Dev port: 5173 (Vite default)

## 🚀 Building for Production

### Build Dashboard
```bash
cd dashboard
npm run build
```

Creates optimized build in `dashboard/dist/`

### Deploy
1. Build the React app: `npm run build`
2. Serve the `dist` folder with a static server
3. Configure environment variables for the backend
4. Run the webhook server with production URL

## 📱 Responsive Design

- **Desktop**: Full multi-column layout with large charts
- **Tablet**: Adapted grid layout
- **Mobile**: Single column stack with readable charts

## 🐛 Troubleshooting

### Dashboard not loading data
- Ensure webhook server is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify database connection in webhook server

### No charts displayed
- Database may be empty - ensure articles have been synced
- Check that timestamps are valid Unix timestamps (integers)

### Images not loading
- Author photos require valid image URLs
- Images fail gracefully if URLs are broken

## 🔐 Security Notes

- The dashboard runs locally during development
- For production, implement authentication
- Webhook server uses HTTP Basic Auth
- Consider adding API rate limiting

## 📚 Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **recharts**: Charting library
- **axios**: HTTP client
- **vite**: Build tool

## 📄 License

MIT - Feel free to modify and extend!

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify database connection
3. Check webhook server logs
4. Review browser console for errors

---

**Happy Dashboard-ing!** 📊✨
