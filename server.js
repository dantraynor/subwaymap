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

// Cache for reducing API calls
let feedCache = {};
let lastCacheUpdate = {};
const CACHE_DURATION = 30000; // 30 seconds

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    feeds: Object.keys(MTA_FEEDS),
    cacheStatus: Object.keys(feedCache).map(feedId => ({
      feedId,
      cached: !!feedCache[feedId],
      lastUpdate: lastCacheUpdate[feedId] || 'never'
    }))
  };
  res.json(healthData);
});

// Enhanced feed data processing
function processFeedData(feed, feedId) {
  console.log(`📊 Processing feed ${feedId}: ${feed.entity.length} entities`);
  
  const trains = [];
  let processedTrips = 0;
  let processedStops = 0;
  
  feed.entity.forEach(entity => {
    if (entity.tripUpdate) {
      const tripUpdate = entity.tripUpdate;
      const routeId = tripUpdate.trip.routeId;
      
      if (!routeId) {
        console.warn(`⚠️  Trip without route ID: ${tripUpdate.trip.tripId}`);
        return;
      }
      
      processedTrips++;
      
      tripUpdate.stopTimeUpdate.forEach(stopUpdate => {
        const arrivalTime = stopUpdate.arrival && stopUpdate.arrival.time ? Number(stopUpdate.arrival.time) : null;
        const departureTime = stopUpdate.departure && stopUpdate.departure.time ? Number(stopUpdate.departure.time) : null;
        
        if (arrivalTime || departureTime) {
          const trainData = {
            tripId: tripUpdate.trip.tripId,
            routeId: routeId,
            stopId: stopUpdate.stopId,
            arrival: arrivalTime ? new Date(arrivalTime * 1000) : null,
            departure: departureTime ? new Date(departureTime * 1000) : null,
            delay: stopUpdate.arrival && stopUpdate.arrival.delay ? stopUpdate.arrival.delay : 0,
            feedId: feedId,
            timestamp: new Date().toISOString()
          };
          
          trains.push(trainData);
          processedStops++;
        }
      });
    }
    
    // Also process vehicle positions if available
    if (entity.vehicle) {
      const vehicle = entity.vehicle;
      if (vehicle.trip && vehicle.trip.routeId && vehicle.position) {
        const vehicleData = {
          tripId: vehicle.trip.tripId,
          routeId: vehicle.trip.routeId,
          stopId: vehicle.stopId || `vehicle_${vehicle.vehicle ? vehicle.vehicle.id : 'unknown'}`,
          latitude: vehicle.position.latitude,
          longitude: vehicle.position.longitude,
          bearing: vehicle.position.bearing,
          speed: vehicle.position.speed,
          vehicleId: vehicle.vehicle ? vehicle.vehicle.id : null,
          feedId: feedId,
          timestamp: new Date().toISOString(),
          isVehiclePosition: true
        };
        
        trains.push(vehicleData);
      }
    }
  });
  
  console.log(`✅ Feed ${feedId}: ${processedTrips} trips, ${processedStops} stop updates, ${trains.length} total data points`);
  return trains;
}

// Check if cache is still valid
function isCacheValid(feedId) {
  const lastUpdate = lastCacheUpdate[feedId];
  if (!lastUpdate) return false;
  
  const now = Date.now();
  const cacheAge = now - lastUpdate;
  return cacheAge < CACHE_DURATION;
}

// Get specific feed with caching
app.get('/api/mta/feed/:feedId', async (req, res) => {
  try {
    const feedId = req.params.feedId;
    const feedUrl = MTA_FEEDS[feedId];
    
    if (!feedUrl) {
      return res.status(404).json({ 
        error: 'Feed not found', 
        availableFeeds: Object.keys(MTA_FEEDS) 
      });
    }

    // Check cache first
    if (isCacheValid(feedId) && feedCache[feedId]) {
      console.log(`📦 Serving cached data for feed ${feedId}`);
      return res.json({
        ...feedCache[feedId],
        cached: true,
        cacheAge: Date.now() - lastCacheUpdate[feedId]
      });
    }

    console.log(`🌐 Fetching fresh data for feed ${feedId}`);
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.buffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
    const processedData = processFeedData(feed, feedId);
    
    // Update cache
    feedCache[feedId] = processedData;
    lastCacheUpdate[feedId] = Date.now();
    
    res.json(processedData);
  } catch (error) {
    console.error(`❌ Error fetching MTA feed ${req.params.feedId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch feed data', 
      details: error.message,
      feedId: req.params.feedId
    });
  }
});

// Get all feeds with enhanced processing and parallel fetching
app.get('/api/mta/feeds/all', async (req, res) => {
  try {
    console.log('🚀 Fetching all MTA feeds...');
    const startTime = Date.now();
    
    // Parallel fetch with improved error handling
    const allFeedsData = await Promise.allSettled(
      Object.entries(MTA_FEEDS).map(async ([feedId, feedUrl]) => {
        try {
          // Check cache first
          if (isCacheValid(feedId) && feedCache[feedId]) {
            console.log(`📦 Using cached data for feed ${feedId}`);
            return {
              feedId,
              data: feedCache[feedId],
              cached: true,
              cacheAge: Date.now() - lastCacheUpdate[feedId]
            };
          }
          
          console.log(`🌐 Fetching fresh data for feed ${feedId}...`);
          const response = await fetch(feedUrl, {
            timeout: 10000 // 10 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const buffer = await response.buffer();
          const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
          const processedData = processFeedData(feed, feedId);
          
          // Update cache
          feedCache[feedId] = processedData;
          lastCacheUpdate[feedId] = Date.now();
          
          console.log(`✅ Feed ${feedId}: ${processedData.length} data points`);
          
          return {
            feedId,
            data: processedData,
            cached: false
          };
        } catch (error) {
          console.error(`❌ Error processing feed ${feedId}:`, error.message);
          return {
            feedId,
            error: true,
            details: error.message,
            status: error.status || 'unknown'
          };
        }
      })
    );
    
    // Process results
    const successfulFeeds = [];
    const failedFeeds = [];
    
    allFeedsData.forEach(result => {
      if (result.status === 'fulfilled' && !result.value.error) {
        successfulFeeds.push(result.value);
      } else {
        const errorInfo = result.status === 'rejected' ? 
          { feedId: 'unknown', error: true, details: result.reason.message } :
          result.value;
        failedFeeds.push(errorInfo);
      }
    });
    
    const totalTrains = successfulFeeds.reduce((sum, feed) => sum + (feed.data ? feed.data.length : 0), 0);
    const processingTime = Date.now() - startTime;
    
    // Route statistics
    const routeStats = {};
    const stationStats = new Set();
    
    successfulFeeds.forEach(feed => {
      if (feed.data) {
        feed.data.forEach(train => {
          if (train.routeId) {
            routeStats[train.routeId] = (routeStats[train.routeId] || 0) + 1;
            stationStats.add(train.stopId);
          }
        });
      }
    });
    
    console.log(`🎯 Successfully processed ${successfulFeeds.length}/${allFeedsData.length} feeds`);
    console.log(`📊 Total: ${totalTrains} trains across ${Object.keys(routeStats).length} routes and ${stationStats.size} stations`);
    console.log(`⏱️  Processing time: ${processingTime}ms`);
    
    if (failedFeeds.length > 0) {
      console.log(`⚠️  Failed feeds:`, failedFeeds.map(f => f.feedId).join(', '));
    }
    
    const response = {
      feeds: successfulFeeds,
      summary: {
        successfulFeeds: successfulFeeds.length,
        totalFeeds: allFeedsData.length,
        totalTrains,
        totalRoutes: Object.keys(routeStats).length,
        totalStations: stationStats.size,
        processingTime,
        routeStats,
        timestamp: new Date().toISOString()
      },
      errors: failedFeeds.length > 0 ? failedFeeds : undefined
    };
    
    res.json(successfulFeeds); // Send only successful feeds to frontend for compatibility
  } catch (error) {
    console.error('💥 Critical error fetching all feeds:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch feeds', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for cache status
app.get('/api/debug/cache', (req, res) => {
  const cacheInfo = Object.keys(MTA_FEEDS).map(feedId => ({
    feedId,
    cached: !!feedCache[feedId],
    dataPoints: feedCache[feedId] ? feedCache[feedId].length : 0,
    lastUpdate: lastCacheUpdate[feedId] ? new Date(lastCacheUpdate[feedId]).toISOString() : 'never',
    isValid: isCacheValid(feedId)
  }));
  
  res.json({
    cacheStatus: cacheInfo,
    cacheDuration: CACHE_DURATION,
    totalCachedFeeds: Object.keys(feedCache).length
  });
});

// Clear cache endpoint (for debugging)
app.post('/api/debug/clear-cache', (req, res) => {
  feedCache = {};
  lastCacheUpdate = {};
  console.log('🗑️  Cache cleared');
  res.json({ message: 'Cache cleared successfully' });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Startup with enhanced logging
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 NYC Subway Real-Time Map Server');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log(`📡 MTA Feeds: ${Object.keys(MTA_FEEDS).length} configured`);
  console.log(`💾 Cache Duration: ${CACHE_DURATION / 1000}s`);
  console.log('✅ Server ready!');
  
  // Log available feeds
  console.log('🚇 Available feeds:');
  Object.entries(MTA_FEEDS).forEach(([feedId, url]) => {
    console.log(`   ${feedId}: ${url.split('/').pop()}`);
  });
});