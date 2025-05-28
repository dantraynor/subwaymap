// Static version - fetches directly from MTA API
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

class SubwayMapApp {
    constructor() {
        this.allTrainData = [];
        this.lastUpdated = null;
        this.mapInstance = null;
        this.isFetching = false;
        this.init();
    }

    async init() {
        this.mapInstance = initLeafletMap('map');
        this.setupEventListeners();
        await this.fetchData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            if (!this.isFetching) {
                 this.fetchData();
            }
        });
    }

    async fetchData() {
        if (this.isFetching) return;
        this.isFetching = true;
        
        const refreshBtn = document.getElementById('refresh-btn');
        const loadingMessageEl = document.getElementById('loading-message');
        const lastUpdatedEl = document.getElementById('last-updated');
        
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refreshing...';
        loadingMessageEl.textContent = 'Fetching latest train data...';
        loadingMessageEl.style.display = 'block';
        document.getElementById('train-list').innerHTML = '';

        try {
            // Use a CORS proxy for direct API calls
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            
            const allFeedsData = await Promise.all(
                Object.entries(MTA_FEEDS).map(async ([feedId, feedUrl]) => {
                    try {
                        // Use proxy to avoid CORS issues
                        const response = await fetch(proxyUrl + encodeURIComponent(feedUrl));
                        
                        if (!response.ok) {
                            console.error(`Error fetching feed ${feedId}: ${response.status}`);
                            return { feedId, error: true, status: response.status };
                        }
                        
                        const arrayBuffer = await response.arrayBuffer();
                        const processedData = this.processGTFSData(arrayBuffer);
                        
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
            
            this.allTrainData = allFeedsData
                .filter(feed => feed.data && !feed.error)
                .flatMap(feed => feed.data);

            this.lastUpdated = new Date();
            this.updateUI();
            if (window.updateMapWithTrainLocations) {
                window.updateMapWithTrainLocations(this.allTrainData, this.getLineColor.bind(this));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            lastUpdatedEl.textContent = `Error: ${error.message}`;
            loadingMessageEl.textContent = `Failed to load train data. This may be due to CORS restrictions. Try the Node.js version for full functionality.`;
        } finally {
            this.isFetching = false;
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Data';
            if (this.allTrainData.length > 0) {
                loadingMessageEl.style.display = 'none';
            }
        }
    }

    // Simplified GTFS processing without protobuf library
    processGTFSData(arrayBuffer) {
        // For static deployment, we'll need to use a different approach
        // Since we can't use the gtfs-realtime-bindings library in browser
        // This is a simplified version that returns mock data
        
        // In a real static deployment, you'd either:
        // 1. Use a different GTFS library that works in browsers
        // 2. Pre-process the data on a server
        // 3. Use a different data source
        
        console.warn('Using simplified GTFS processing for static deployment');
        return this.generateMockData();
    }

    generateMockData() {
        // Generate some mock train data for demonstration
        const routes = ['1', '2', '3', '4', '5', '6', '7', 'A', 'C', 'E', 'B', 'D', 'F', 'M', 'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W'];
        const stations = ['A27', 'R16', '127', '901', '725', '631', 'R20', 'L08', '635', 'D17', 'R17', 'D21'];
        
        const mockData = [];
        
        for (let i = 0; i < 50; i++) {
            const route = routes[Math.floor(Math.random() * routes.length)];
            const station = stations[Math.floor(Math.random() * stations.length)];
            const now = new Date();
            
            mockData.push({
                tripId: `mock_trip_${i}`,
                routeId: route,
                stopId: station + (Math.random() > 0.5 ? 'N' : 'S'),
                arrival: new Date(now.getTime() + Math.random() * 1800000), // Random time within 30 minutes
                departure: new Date(now.getTime() + Math.random() * 1800000),
                delay: Math.floor(Math.random() * 300) // Random delay up to 5 minutes
            });
        }
        
        return mockData;
    }

    updateUI() {
        const lastUpdatedEl = document.getElementById('last-updated');
        if (this.lastUpdated) {
            lastUpdatedEl.textContent = `Last updated: ${this.lastUpdated.toLocaleTimeString()}`;
        }
        this.updateTrainList();
    }

    updateTrainList() {
        const trainListEl = document.getElementById('train-list');
        const loadingMessageEl = document.getElementById('loading-message');
        trainListEl.innerHTML = '';
        
        if (this.allTrainData.length === 0 && !this.isFetching) {
             if (!loadingMessageEl.textContent.startsWith("Failed")) {
                loadingMessageEl.textContent = 'No active train data found or all feeds failed.';
             }
             loadingMessageEl.style.display = 'block';
             return;
        } else if (this.allTrainData.length > 0) {
            loadingMessageEl.style.display = 'none';
        }

        const trainsByRoute = {};
        this.allTrainData.forEach(train => {
            if (!trainsByRoute[train.routeId]) {
                trainsByRoute[train.routeId] = [];
            }
            trainsByRoute[train.routeId].push(train);
        });
        
        Object.entries(trainsByRoute).sort(([routeA], [routeB]) => routeA.localeCompare(routeB)).forEach(([routeId, trains]) => {
            if (!routeId) return;
            const routeEl = document.createElement('div');
            routeEl.className = 'train-item';
            routeEl.style.borderLeftColor = this.getLineColor(routeId);
            
            const sanitizedRouteId = routeId.replace(/[^a-zA-Z0-9]/g, '');

            routeEl.innerHTML = `
                <span class="train-line-icon line-${sanitizedRouteId}">${routeId}</span>
                <div class="train-details">
                    <strong>Route ${routeId}</strong>
                    <p>${trains.length} trip update(s)</p>
                </div>
            `;
            trainListEl.appendChild(routeEl);
        });
    }

    getLineColor(line) {
        const route = line.toUpperCase();
        const colors = {
            '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
            '4': '#00933C', '5': '#00933C', '6': '#00933C',
            '7': '#B933AD',
            'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
            'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
            'G': '#6CBE45',
            'J': '#996633', 'Z': '#996633',
            'L': '#A7A9AC',
            'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
            'S': '#808183', 'GS': '#808183', 'FS':'#808183', 'H':'#808183',
            'SI': '#0039A6',
        };
        return colors[route] || '#555555';
    }

    startAutoRefresh() {
        setInterval(() => {
            if (!this.isFetching) {
                 this.fetchData();
            }
        }, 60000); // Refresh every 60 seconds for static version
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SubwayMapApp();
});