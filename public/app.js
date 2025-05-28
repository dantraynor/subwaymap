// NYC Subway Real-Time Map Application
class SubwayMap {
    constructor() {
        this.trainData = [];
        this.map = null;
        this.markers = [];
        this.lastUpdated = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🚇 Initializing NYC Subway Map...');
        this.initMap();
        this.setupEventListeners();
        await this.fetchTrainData();
        this.startAutoRefresh();
    }

    initMap() {
        // Initialize Leaflet map centered on NYC
        this.map = L.map('map').setView([40.7589, -73.9851], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 10
        }).addTo(this.map);

        console.log('🗺️ Map initialized');
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.addEventListener('click', () => {
            if (!this.isLoading) {
                this.fetchTrainData();
            }
        });
    }

    async fetchTrainData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const refreshBtn = document.getElementById('refresh-btn');
        const loadingMsg = document.getElementById('loading-message');
        const lastUpdated = document.getElementById('last-updated');
        
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refreshing...';
        loadingMsg.textContent = 'Fetching real-time train data from MTA...';
        loadingMsg.style.display = 'block';

        try {
            console.log('📡 Fetching train data...');
            const response = await fetch('/api/mta/feeds/all');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const feedsData = await response.json();
            
            // Flatten all train data from all feeds
            this.trainData = feedsData
                .filter(feed => feed.data && !feed.error)
                .flatMap(feed => feed.data);
            
            this.lastUpdated = new Date();
            
            console.log(`✅ Loaded ${this.trainData.length} train updates from ${feedsData.length} feeds`);
            
            this.updateUI();
            this.updateMap();
            
        } catch (error) {
            console.error('❌ Error fetching train data:', error);
            loadingMsg.textContent = `Failed to load train data: ${error.message}`;
            lastUpdated.textContent = `Error: ${error.message}`;
        } finally {
            this.isLoading = false;
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Data';
        }
    }

    updateUI() {
        const lastUpdated = document.getElementById('last-updated');
        const loadingMsg = document.getElementById('loading-message');
        
        if (this.lastUpdated) {
            lastUpdated.innerHTML = `Last updated: ${this.lastUpdated.toLocaleTimeString()} <span class="status-indicator"></span>`;
        }
        
        if (this.trainData.length > 0) {
            loadingMsg.style.display = 'none';
        }
        
        this.updateTrainList();
    }

    updateTrainList() {
        const trainList = document.getElementById('train-list');
        trainList.innerHTML = '';
        
        if (this.trainData.length === 0) {
            trainList.innerHTML = '<p style="text-align: center; color: #666;">No train data available</p>';
            return;
        }

        // Group trains by route
        const trainsByRoute = {};
        this.trainData.forEach(train => {
            if (!trainsByRoute[train.routeId]) {
                trainsByRoute[train.routeId] = [];
            }
            trainsByRoute[train.routeId].push(train);
        });

        // Sort routes and display
        Object.entries(trainsByRoute)
            .sort(([routeA], [routeB]) => this.sortRoutes(routeA, routeB))
            .forEach(([routeId, trains]) => {
                const routeElement = this.createTrainRouteElement(routeId, trains);
                trainList.appendChild(routeElement);
            });
    }

    createTrainRouteElement(routeId, trains) {
        const element = document.createElement('div');
        element.className = 'train-item';
        element.style.borderLeftColor = this.getLineColor(routeId);
        
        const sanitizedRouteId = routeId.replace(/[^a-zA-Z0-9]/g, '');
        
        element.innerHTML = `
            <div class="train-line-icon line-${sanitizedRouteId}">${routeId}</div>
            <div class="train-details">
                <strong>Line ${routeId}</strong>
                <p>${trains.length} active train${trains.length !== 1 ? 's' : ''}</p>
            </div>
        `;
        
        return element;
    }

    updateMap() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Sample station coordinates (you can expand this)
        const stationCoordinates = {
            // Times Square area
            'A27': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St' },
            'R16': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St' },
            '127': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St' },
            '901': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St' },
            
            // Grand Central
            '631': { lat: 40.752769, lng: -73.979187, name: 'Grand Central-42 St' },
            
            // Union Square
            'R20': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq' },
            'L08': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq' },
            '635': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq' },
            
            // Herald Square
            'D17': { lat: 40.749719, lng: -73.987823, name: '34 St-Herald Sq' },
            'R17': { lat: 40.749719, lng: -73.987823, name: '34 St-Herald Sq' },
            
            // More stations...
            'D21': { lat: 40.730019, lng: -73.991013, name: 'W 4 St-Washington Sq' },
            'A32': { lat: 40.720595, lng: -74.007107, name: 'Chambers St' },
        };

        // Group trains by station
        const trainsByStation = {};
        
        this.trainData.forEach(train => {
            // Try to match station coordinates
            const stationKey = this.findStationKey(train.stopId, stationCoordinates);
            
            if (stationKey && stationCoordinates[stationKey]) {
                const stationId = `${stationCoordinates[stationKey].lat},${stationCoordinates[stationKey].lng}`;
                
                if (!trainsByStation[stationId]) {
                    trainsByStation[stationId] = {
                        station: stationCoordinates[stationKey],
                        trains: []
                    };
                }
                trainsByStation[stationId].trains.push(train);
            }
        });

        // Create markers for stations with trains
        Object.values(trainsByStation).forEach(({ station, trains }) => {
            const routes = [...new Set(trains.map(t => t.routeId))];
            const primaryRoute = routes[0];
            
            const marker = L.circleMarker([station.lat, station.lng], {
                radius: Math.min(8 + routes.length * 2, 16),
                fillColor: this.getLineColor(primaryRoute),
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Create popup with route information
            const routeBadges = routes.map(route => 
                `<span style="background: ${this.getLineColor(route)}; color: ${route.match(/[NQRW]/) ? 'black' : 'white'}; padding: 2px 6px; border-radius: 3px; font-weight: bold; margin: 1px;">${route}</span>`
            ).join(' ');
            
            marker.bindPopup(`
                <div style="text-align: center;">
                    <strong>${station.name}</strong><br>
                    <div style="margin: 8px 0;">${routeBadges}</div>
                    <small>${trains.length} train update${trains.length !== 1 ? 's' : ''}</small>
                </div>
            `);
            
            marker.addTo(this.map);
            this.markers.push(marker);
        });
        
        console.log(`🗺️ Updated map with ${Object.keys(trainsByStation).length} stations`);
    }

    findStationKey(stopId, stationCoordinates) {
        // Direct match
        if (stationCoordinates[stopId]) return stopId;
        
        // Try without direction suffix (remove last character if it's N/S/E/W)
        if (stopId.length > 1) {
            const withoutDirection = stopId.slice(0, -1);
            if (stationCoordinates[withoutDirection]) return withoutDirection;
        }
        
        // Try first 3 characters
        const generic = stopId.substring(0, 3);
        if (stationCoordinates[generic]) return generic;
        
        return null;
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
            'S': '#808183', 'GS': '#808183', 'FS': '#808183', 'H': '#808183',
            'SI': '#0039A6'
        };
        return colors[route] || '#666666';
    }

    sortRoutes(a, b) {
        // Numbers first, then letters
        const aIsNumber = /^\d/.test(a);
        const bIsNumber = /^\d/.test(b);
        
        if (aIsNumber && !bIsNumber) return -1;
        if (!aIsNumber && bIsNumber) return 1;
        
        return a.localeCompare(b);
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            if (!this.isLoading) {
                console.log('🔄 Auto-refreshing train data...');
                this.fetchTrainData();
            }
        }, 30000);
        
        console.log('⏰ Auto-refresh enabled (30 seconds)');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting NYC Subway Real-Time Map...');
    new SubwayMap();
});