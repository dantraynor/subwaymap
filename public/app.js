// NYC Subway Real-Time Map Application - Enhanced Version
class SubwayMap {
    constructor() {
        this.trainData = [];
        this.map = null;
        this.markers = [];
        this.lastUpdated = null;
        this.isLoading = false;
        this.stationCoordinates = this.initStationCoordinates();
        this.init();
    }

    async init() {
        console.log('🚇 Initializing Enhanced NYC Subway Map...');
        this.initMap();
        this.setupEventListeners();
        await this.fetchTrainData();
        this.startAutoRefresh();
    }

    initStationCoordinates() {
        // Comprehensive station coordinates - Major stations across all boroughs
        return {
            // Manhattan - Times Square Area
            'A27': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St (A,C,E)' },
            'R16': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St (N,Q,R,W)' },
            '127': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St (1,2,3)' },
            '901': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St (7)' },
            '725': { lat: 40.755417, lng: -73.986664, name: 'Times Sq-42 St (S)' },
            
            // Manhattan - Grand Central
            '631': { lat: 40.752769, lng: -73.979187, name: 'Grand Central-42 St (4,5,6)' },
            '902': { lat: 40.752769, lng: -73.979187, name: 'Grand Central-42 St (7)' },
            
            // Manhattan - Union Square
            'R20': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq (N,Q,R,W)' },
            'L08': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq (L)' },
            '635': { lat: 40.735736, lng: -73.990568, name: '14 St-Union Sq (4,5,6)' },
            
            // Manhattan - Herald Square
            'D17': { lat: 40.749719, lng: -73.987823, name: '34 St-Herald Sq (B,D,F,M)' },
            'R17': { lat: 40.749719, lng: -73.987823, name: '34 St-Herald Sq (N,Q,R,W)' },
            
            // Manhattan - Penn Station
            'A28': { lat: 40.750373, lng: -73.991057, name: '34 St-Penn Station (A,C,E)' },
            '132': { lat: 40.750373, lng: -73.991057, name: '34 St-Penn Station (1,2,3)' },
            
            // Manhattan - Wall Street Area
            'R27': { lat: 40.706821, lng: -74.008834, name: 'Whitehall St-South Ferry (R,W)' },
            'R25': { lat: 40.704817, lng: -74.013408, name: 'Rector St (R,W)' },
            'R29': { lat: 40.708359, lng: -74.003967, name: 'Bowling Green (R,W)' },
            '142': { lat: 40.713065, lng: -73.996379, name: 'Fulton St (4,5,6)' },
            'A32': { lat: 40.720595, lng: -74.007107, name: 'Chambers St (A,C)' },
            'R30': { lat: 40.720595, lng: -74.007107, name: 'Chambers St (R,W)' },
            
            // Manhattan - Greenwich Village
            'D21': { lat: 40.730019, lng: -73.991013, name: 'W 4 St-Washington Sq (A,C,E,B,D,F,M)' },
            'A33': { lat: 40.728251, lng: -74.002906, name: 'Canal St (A,C,E)' },
            'R31': { lat: 40.728251, lng: -74.002906, name: 'Canal St (N,Q,R,W)' },
            
            // Manhattan - Upper East Side
            '640': { lat: 40.768247, lng: -73.959222, name: '59 St-Lexington Av (4,5,6)' },
            '641': { lat: 40.775594, lng: -73.958155, name: '77 St (6)' },
            '642': { lat: 40.779492, lng: -73.944073, name: '86 St (4,5,6)' },
            
            // Manhattan - Upper West Side
            'A15': { lat: 40.774013, lng: -73.981472, name: '72 St (A,B,C)' },
            'A12': { lat: 40.787995, lng: -73.972323, name: '96 St (A,B,C)' },
            '120': { lat: 40.773343, lng: -73.981628, name: '72 St (1,2,3)' },
            
            // Brooklyn - Downtown
            'R45': { lat: 40.690545, lng: -73.975776, name: 'Court St (N,R,W)' },
            'A41': { lat: 40.688484, lng: -73.976048, name: 'Jay St-MetroTech (A,C,F,R)' },
            'D43': { lat: 40.688484, lng: -73.976048, name: 'Jay St-MetroTech (B,D,Q)' },
            
            // Brooklyn - Atlantic Terminal
            'D40': { lat: 40.684359, lng: -73.977666, name: 'Atlantic Av-Barclays Ctr (B,D,N,Q,R,W)' },
            '238': { lat: 40.684359, lng: -73.977666, name: 'Atlantic Av-Barclays Ctr (2,3)' },
            
            // Brooklyn - Williamsburg
            'G21': { lat: 40.714575, lng: -73.958131, name: 'Bedford Av (L)' },
            'L24': { lat: 40.714575, lng: -73.958131, name: 'Bedford Av (L)' },
            
            // Queens - Long Island City
            'G22': { lat: 40.747023, lng: -73.954168, name: 'Court Sq (G)' },
            'E01': { lat: 40.747023, lng: -73.954168, name: 'Court Sq-23 St (E,M)' },
            '702': { lat: 40.747023, lng: -73.954168, name: 'Court Sq-23 St (7)' },
            
            // Queens - Flushing
            '701': { lat: 40.759465, lng: -73.833365, name: 'Flushing-Main St (7)' },
            
            // Queens - Jamaica
            'E09': { lat: 40.700488, lng: -73.808361, name: 'Jamaica Center (E,J,Z)' },
            'J31': { lat: 40.700488, lng: -73.808361, name: 'Jamaica Center (J,Z)' },
            
            // Queens - Astoria
            'N31': { lat: 40.775036, lng: -73.912034, name: 'Astoria-Ditmars Blvd (N,W)' },
            'R13': { lat: 40.756081, lng: -73.929849, name: 'Queensboro Plaza (N,Q,R,W)' },
            
            // Bronx - 149th St Hub
            '413': { lat: 40.820421, lng: -73.918423, name: '149 St-Grand Concourse (4,5,6)' },
            'D11': { lat: 40.820421, lng: -73.918423, name: '149 St-Grand Concourse (B,D)' },
            
            // Bronx - Yankee Stadium
            '414': { lat: 40.827994, lng: -73.925831, name: '161 St-Yankee Stadium (4,5,6)' },
            'D12': { lat: 40.827994, lng: -73.925831, name: '161 St-Yankee Stadium (B,D)' },
            
            // Brooklyn - Coney Island
            'D43': { lat: 40.577422, lng: -73.977181, name: 'Coney Island-Stillwell Av (D,F,N,Q)' },
            'F39': { lat: 40.577422, lng: -73.977181, name: 'Coney Island-Stillwell Av (F)' },
            
            // Add more major interchange stations
            'A02': { lat: 40.851695, lng: -73.904834, name: '207 St (A)' },
            'L29': { lat: 40.669986, lng: -73.885802, name: 'Canarsie-Rockaway Pkwy (L)' },
            'G26': { lat: 40.629742, lng: -73.996229, name: 'Church Av (G)' },
            
            // Generic station patterns for broader coverage
            // Pattern: First 3 characters for station groups
            'A01': { lat: 40.851695, lng: -73.904834, name: 'Inwood-207 St (A)' },
            'A03': { lat: 40.843456, lng: -73.910408, name: '175 St (A)' },
            'D01': { lat: 40.874811, lng: -73.910673, name: '205 St (D)' },
            'D03': { lat: 40.869526, lng: -73.919830, name: 'Norwood-205 St (D)' },
            
            // More Queens stations
            'F01': { lat: 40.748973, lng: -73.853124, name: 'Jamaica-179 St (F)' },
            'R01': { lat: 40.749865, lng: -73.844270, name: 'Jamaica-Van Wyck (R)' },
            
            // Staten Island Railway (if data available)
            'S09': { lat: 40.604423, lng: -74.075370, name: 'St. George (SIR)' },
            'S31': { lat: 40.528453, lng: -74.255405, name: 'Tottenville (SIR)' }
        };
    }

    initMap() {
        // Initialize Leaflet map centered on NYC with better view
        this.map = L.map('map').setView([40.7589, -73.9851], 11);
        
        // Add OpenStreetMap tiles with better styling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 9
        }).addTo(this.map);

        console.log('🗺️ Enhanced map initialized with broader NYC view');
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
        loadingMsg.textContent = 'Fetching real-time data from all MTA feeds...';
        loadingMsg.style.display = 'block';

        try {
            console.log('📡 Fetching comprehensive train data...');
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
            console.log('📊 Feeds loaded:', feedsData.map(f => f.feedId).join(', '));
            
            // Log route distribution
            const routeCounts = {};
            this.trainData.forEach(train => {
                routeCounts[train.routeId] = (routeCounts[train.routeId] || 0) + 1;
            });
            console.log('🚇 Routes with data:', routeCounts);
            
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

    updateMap() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Group trains by station using enhanced matching
        const trainsByStation = {};
        let mappedTrains = 0;
        let unmappedStations = new Set();
        
        this.trainData.forEach(train => {
            const stationKey = this.findBestStationMatch(train.stopId);
            
            if (stationKey && this.stationCoordinates[stationKey]) {
                const station = this.stationCoordinates[stationKey];
                const stationId = `${station.lat},${station.lng}`;
                
                if (!trainsByStation[stationId]) {
                    trainsByStation[stationId] = {
                        station: station,
                        trains: []
                    };
                }
                trainsByStation[stationId].trains.push(train);
                mappedTrains++;
            } else {
                unmappedStations.add(train.stopId);
            }
        });

        console.log(`🗺️ Mapped ${mappedTrains}/${this.trainData.length} trains to ${Object.keys(trainsByStation).length} stations`);
        if (unmappedStations.size > 0) {
            console.log('🔍 Unmapped stations (sample):', Array.from(unmappedStations).slice(0, 10));
        }

        // Create enhanced markers for stations with trains
        Object.values(trainsByStation).forEach(({ station, trains }) => {
            const routes = [...new Set(trains.map(t => t.routeId))].sort();
            const primaryRoute = routes[0];
            
            // Create marker with size based on number of trains
            const baseSize = 8;
            const maxSize = 20;
            const markerSize = Math.min(baseSize + (trains.length * 0.5), maxSize);
            
            const marker = L.circleMarker([station.lat, station.lng], {
                radius: markerSize,
                fillColor: this.getLineColor(primaryRoute),
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Enhanced popup with more information
            const routeBadges = routes.map(route => 
                `<span style="
                    background: ${this.getLineColor(route)}; 
                    color: ${route.match(/[NQRW]/) ? 'black' : 'white'}; 
                    padding: 3px 7px; 
                    border-radius: 4px; 
                    font-weight: bold; 
                    font-size: 12px;
                    margin: 2px;
                    display: inline-block;
                ">${route}</span>`
            ).join('');
            
            // Get recent arrivals info
            const now = new Date();
            const recentTrains = trains.filter(t => {
                const arrivalTime = t.arrival ? new Date(t.arrival) : null;
                return arrivalTime && arrivalTime > now && arrivalTime < new Date(now.getTime() + 30 * 60000); // Next 30 minutes
            }).slice(0, 3);
            
            let arrivalInfo = '';
            if (recentTrains.length > 0) {
                arrivalInfo = '<div style="margin-top: 8px; font-size: 11px;"><strong>Next arrivals:</strong><br>';
                recentTrains.forEach(train => {
                    const arrivalTime = new Date(train.arrival);
                    const minutesAway = Math.round((arrivalTime - now) / 60000);
                    arrivalInfo += `${train.routeId}: ${minutesAway}m<br>`;
                });
                arrivalInfo += '</div>';
            }
            
            marker.bindPopup(`
                <div style="text-align: center; min-width: 150px;">
                    <strong style="font-size: 14px;">${station.name}</strong><br>
                    <div style="margin: 8px 0;">${routeBadges}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${trains.length} train update${trains.length !== 1 ? 's' : ''}
                    </div>
                    ${arrivalInfo}
                </div>
            `);
            
            marker.addTo(this.map);
            this.markers.push(marker);
        });
        
        console.log(`🎯 Created ${this.markers.length} station markers on map`);
    }

    findBestStationMatch(stopId) {
        // Enhanced station matching algorithm
        
        // 1. Direct match
        if (this.stationCoordinates[stopId]) {
            return stopId;
        }
        
        // 2. Try without direction suffix (N, S, E, W)
        if (stopId.length > 1) {
            const lastChar = stopId.slice(-1);
            if (['N', 'S', 'E', 'W'].includes(lastChar)) {
                const withoutDirection = stopId.slice(0, -1);
                if (this.stationCoordinates[withoutDirection]) {
                    return withoutDirection;
                }
            }
        }
        
        // 3. Try first 3 characters (station complex)
        if (stopId.length >= 3) {
            const stationComplex = stopId.substring(0, 3);
            if (this.stationCoordinates[stationComplex]) {
                return stationComplex;
            }
        }
        
        // 4. Try first 2 characters for numbered stations
        if (stopId.length >= 2) {
            const shortId = stopId.substring(0, 2);
            if (this.stationCoordinates[shortId]) {
                return shortId;
            }
        }
        
        return null;
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

        // Group trains by route with enhanced statistics
        const trainsByRoute = {};
        this.trainData.forEach(train => {
            if (!trainsByRoute[train.routeId]) {
                trainsByRoute[train.routeId] = {
                    trains: [],
                    stations: new Set()
                };
            }
            trainsByRoute[train.routeId].trains.push(train);
            trainsByRoute[train.routeId].stations.add(train.stopId);
        });

        // Sort routes and display with enhanced info
        Object.entries(trainsByRoute)
            .sort(([routeA], [routeB]) => this.sortRoutes(routeA, routeB))
            .forEach(([routeId, data]) => {
                const routeElement = this.createEnhancedTrainRouteElement(routeId, data);
                trainList.appendChild(routeElement);
            });
    }

    createEnhancedTrainRouteElement(routeId, data) {
        const element = document.createElement('div');
        element.className = 'train-item';
        element.style.borderLeftColor = this.getLineColor(routeId);
        
        const sanitizedRouteId = routeId.replace(/[^a-zA-Z0-9]/g, '');
        const trainCount = data.trains.length;
        const stationCount = data.stations.size;
        
        element.innerHTML = `
            <div class="train-line-icon line-${sanitizedRouteId}">${routeId}</div>
            <div class="train-details">
                <strong>Line ${routeId}</strong>
                <p>${trainCount} active train${trainCount !== 1 ? 's' : ''}</p>
                <p style="font-size: 0.8rem; color: #888;">${stationCount} station${stationCount !== 1 ? 's' : ''}</p>
            </div>
        `;
        
        return element;
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
        // Refresh every 30 seconds with enhanced logging
        setInterval(() => {
            if (!this.isLoading) {
                console.log('🔄 Auto-refreshing comprehensive train data...');
                this.fetchTrainData();
            }
        }, 30000);
        
        console.log('⏰ Enhanced auto-refresh enabled (30 seconds)');
    }
}

// Initialize the enhanced application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Enhanced NYC Subway Real-Time Map...');
    new SubwayMap();
});