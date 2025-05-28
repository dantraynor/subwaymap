const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const app = express();
const PORT = process.env.PORT || 3000;

// MTA Feed URLs - No API key required
const MTA_FEEDS = {
  '1234567': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
  'ace': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'bdfm': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'g': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'jz': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'l': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  'nqrw': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'si': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si'
};

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Process GTFS feed data
function processFeedData(feed) {
  const trains = [];
  feed.entity.forEach(entity => {
    if (entity.tripUpdate) {
      const tripUpdate = entity.tripUpdate;
      const routeId = tripUpdate.trip.routeId;
      
      tripUpdate.stopTimeUpdate.forEach(stopUpdate => {
        const arrivalTime = stopUpdate.arrival && stopUpdate.arrival.time ? Number(stopUpdate.arrival.time) : null;
        const departureTime = stopUpdate.departure && stopUpdate.departure.time ? Number(stopUpdate.departure.time) : null;

        if (arrivalTime || departureTime) {
          trains.push({
            tripId: tripUpdate.trip.tripId,
            routeId: routeId,
            stopId: stopUpdate.stopId,
            arrival: arrivalTime ? new Date(arrivalTime * 1000) : null,
            departure: departureTime ? new Date(departureTime * 1000) : null,
            delay: stopUpdate.arrival && stopUpdate.arrival.delay ? stopUpdate.arrival.delay : 0
          });
        }
      });
    }
  });
  return trains;
}

// Get specific feed
app.get('/api/mta/feed/:feedId', async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const feedUrl = MTA_FEEDS[feedId];
    
    if (!feedUrl) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.buffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
    const processedData = processFeedData(feed);
    
    res.json(processedData);
  } catch (error) {
    console.error('Error fetching MTA feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch feed data', details: error.message });
  }
});

// Get all feeds
app.get('/api/mta/feeds/all', async (req, res) => {
  try {
    console.log('Fetching all MTA feeds...');
    
    const allFeedsData = await Promise.all(
      Object.entries(MTA_FEEDS).map(async ([feedId, feedUrl]) => {
        try {
          console.log(`Fetching feed: ${feedId}`);
          const response = await fetch(feedUrl);
          
          if (!response.ok) {
            console.error(`Error fetching feed ${feedId}: ${response.status}`);
            return { feedId, error: true, status: response.status };
          }
          
          const buffer = await response.buffer();
          const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
          const processedData = processFeedData(feed);
          
          console.log(`Feed ${feedId}: ${processedData.length} trains`);
          
          return {
            feedId,
            data: processedData
          };
        } catch (error) {
          console.error(`Error processing feed ${feedId}:`, error.message);
          return { feedId, error: true, details: error.message };
        }
      })
    );
    
    const successfulFeeds = allFeedsData.filter(f => !f.error);
    const totalTrains = successfulFeeds.reduce((sum, feed) => sum + (feed.data ? feed.data.length : 0), 0);
    
    console.log(`Successfully fetched ${successfulFeeds.length}/${allFeedsData.length} feeds, ${totalTrains} total trains`);
    
    res.json(successfulFeeds);
  } catch (error) {
    console.error('Error fetching all feeds:', error.message);
    res.status(500).json({ error: 'Failed to fetch feeds', details: error.message });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚇 NYC Subway Map server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});