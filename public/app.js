// NYC Subway Real-Time Map with Actual Subway Lines
class SubwayMap {
    constructor() {
        this.trainData = [];
        this.map = null;
        this.trainMarkers = [];
        this.subwayLines = {};
        this.lastUpdated = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🚇 Initializing NYC Subway Map with actual routes...');
        this.initMap();
        await this.loadSubwayRoutes();
        this.setupEventListeners();
        await this.fetchTrainData();
        this.startAutoRefresh();
    }

    initMap() {
        // Initialize map with better NYC subway view
        this.map = L.map('map').setView([40.7589, -73.9851], 11);
        
        // Use a cleaner map style for transit
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CARTO',
            maxZoom: 18,
            minZoom: 10
        }).addTo(this.map);

        console.log('🗺️ Map initialized with transit-friendly styling');
    }

    async loadSubwayRoutes() {
        console.log('🛤️ Loading subway route geometries...');
        
        // Define simplified subway line paths (in real implementation, you'd load GeoJSON)
        // For now, I'll create the major trunk lines manually
        const subwayRoutesData = this.getSubwayRouteGeometry();
        
        // Draw each subway line on the map
        Object.entries(subwayRoutesData).forEach(([lineId, routeData]) => {
            const lineColor = this.getLineColor(lineId);
            
            const routeLine = L.polyline(routeData.coordinates, {
                color: lineColor,
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1
            }).addTo(this.map);
            
            // Add line label
            routeLine.bindTooltip(`${lineId} Line`, {
                permanent: false,
                direction: 'center',
                className: 'subway-line-tooltip'
            });
            
            this.subwayLines[lineId] = {
                line: routeLine,
                coordinates: routeData.coordinates,
                stations: routeData.stations || []
            };
        });
        
        console.log(`✅ Loaded ${Object.keys(this.subwayLines).length} subway lines`);
    }

    getSubwayRouteGeometry() {
        // Simplified subway line coordinates (major trunk sections)
        // In a real app, you'd load this from MTA's GTFS shapes.txt or GeoJSON
        return {
            '1': {
                coordinates: [
                    [40.878856, -73.910293], // 242nd St
                    [40.827994, -73.925831], // 161st St
                    [40.785672, -73.971946], // 96th St
                    [40.773343, -73.981628], // 72nd St
                    [40.755417, -73.986664], // Times Square
                    [40.730328, -74.000271], // 14th St
                    [40.718092, -74.008811], // Canal St
                    [40.703844, -74.013441], // Rector St
                    [40.702068, -74.015800]  // South Ferry
                ]
            },
            '4': {
                coordinates: [
                    [40.889248, -73.898583], // Woodlawn
                    [40.827994, -73.925831], // 161st St (Yankee Stadium)
                    [40.804138, -73.937594], // 125th St
                    [40.768247, -73.959222], // 59th St
                    [40.752769, -73.979187], // Grand Central
                    [40.735736, -73.990568], // Union Square
                    [40.713065, -73.996379], // Fulton St
                    [40.708359, -74.003967], // Bowling Green
                    [40.693626, -73.985834]  // Atlantic Ave (Brooklyn)
                ]
            },
            '6': {
                coordinates: [
                    [40.848828, -73.891394], // Pelham Bay Park
                    [40.827994, -73.925831], // 3rd Ave-149th St
                    [40.804138, -73.937594], // 125th St
                    [40.779492, -73.944073], // 86th St
                    [40.768247, -73.959222], // 59th St
                    [40.752769, -73.979187], // Grand Central
                    [40.735736, -73.990568], // Union Square
                    [40.722301, -73.989344], // Astor Place
                    [40.718092, -74.008811], // Canal St
                    [40.693626, -73.985834]  // Brooklyn Bridge
                ]
            },
            '7': {
                coordinates: [
                    [40.759465, -73.833365], // Flushing-Main St
                    [40.754688, -73.869527], // 111th St
                    [40.748973, -73.891394], // Junction Blvd
                    [40.747023, -73.954168], // Queensboro Plaza
                    [40.755417, -73.986664], // Times Square
                    [40.750373, -73.991057]  // 34th St-Hudson Yards
                ]
            },
            'A': {
                coordinates: [
                    [40.851695, -73.904834], // 207th St
                    [40.827994, -73.925831], // 125th St
                    [40.787995, -73.972323], // 96th St
                    [40.774013, -73.981472], // 72nd St
                    [40.755417, -73.986664], // Times Square
                    [40.750373, -73.991057], // 34th St-Penn Station
                    [40.730019, -73.991013], // W 4th St
                    [40.720595, -74.007107], // Chambers St
                    [40.713065, -73.996379], // Fulton St
                    [40.693626, -73.985834], // Atlantic Ave (Brooklyn)
                    [40.646292, -73.979917]  // Nostrand Ave
                ]
            },
            'N': {
                coordinates: [
                    [40.775036, -73.912034], // Astoria-Ditmars
                    [40.756081, -73.929849], // Queensboro Plaza
                    [40.755417, -73.986664], // Times Square
                    [40.749719, -73.987823], // Herald Square
                    [40.735736, -73.990568], // Union Square
                    [40.720595, -74.007107], // Canal St
                    [40.690545, -73.975776], // Court St
                    [40.684359, -73.977666], // Atlantic Ave-Barclays
                    [40.577422, -73.977181]  // Coney Island
                ]
            },
            'L': {
                coordinates: [
                    [40.669986, -73.885802], // Canarsie-Rockaway Pkwy
                    [40.678340, -73.899232], // Atlantic Ave
                    [40.698931, -73.943832], // Lorimer St
                    [40.714575, -73.958131], // Bedford Ave
                    [40.730328, -74.000271], // 14th St-Union Sq
                    [40.742554, -74.004131]  // 8th Ave
                ]
            },
            'B': {
                coordinates: [
                    [40.874811, -73.910673], // 205th St (Bronx)
                    [40.820421, -73.918423], // 149th St-Grand Concourse
                    [40.799446, -73.937399], // 116th St
                    [40.774013, -73.981472], // 72nd St
                    [40.755417, -73.986664], // Times Square (via 7th Ave)
                    [40.749719, -73.987823], // Herald Square
                    [40.730019, -73.991013], // W 4th St
                    [40.688484, -73.976048], // Jay St-MetroTech
                    [40.684359, -73.977666], // Atlantic Ave-Barclays
                    [40.649271, -73.996204], // Prospect Park
                    [40.577422, -73.977181]  // Coney Island
                ]
            }
        };
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
        loadingMsg.textContent = 'Fetching live train positions...';
        loadingMsg.style.display = 'block';

        try {
            console.log('📡 Fetching live train data...');
            const response = await fetch('/api/mta/feeds/all');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const feedsData = await response.json();
            
            // Process train data for positioning on lines
            this.trainData = this.processTrainPositions(feedsData);
            
            this.lastUpdated = new Date();
            
            console.log(`✅ Processed ${this.trainData.length} train positions`);
            
            this.updateUI();
            this.updateTrainPositions();
            
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

    processTrainPositions(feedsData) {
        const processedTrains = [];
        
        feedsData
            .filter(feed => feed.data && !feed.error)
            .forEach(feed => {
                feed.data.forEach(train => {
                    // Try to position train on its line
                    const lineData = this.subwayLines[train.routeId];
                    if (lineData && train.stopId) {
                        const position = this.estimateTrainPosition(train, lineData);
                        if (position) {
                            processedTrains.push({
                                ...train,
                                estimatedLat: position.lat,
                                estimatedLng: position.lng,
                                confidence: position.confidence
                            });
                        }
                    }
                });
            });
        
        return processedTrains;
    }

    estimateTrainPosition(train, lineData) {
        // Simple position estimation based on stop ID and line coordinates
        // In reality, you'd use more sophisticated positioning with GTFS data
        
        const coordinates = lineData.coordinates;
        if (!coordinates || coordinates.length === 0) return null;
        
        // For demo purposes, place trains at random positions along the line
        // with some logic based on stop ID patterns
        let positionIndex;
        
        // Try to estimate position based on stop ID patterns
        if (train.stopId.includes('1') || train.stopId.includes('2')) {
            positionIndex = Math.floor(coordinates.length * 0.2); // Near beginning
        } else if (train.stopId.includes('9') || train.stopId.includes('8')) {
            positionIndex = Math.floor(coordinates.length * 0.8); // Near end
        } else {
            positionIndex = Math.floor(Math.random() * coordinates.length); // Random for demo
        }
        
        positionIndex = Math.max(0, Math.min(coordinates.length - 1, positionIndex));
        
        const coord = coordinates[positionIndex];
        
        return {
            lat: coord[0] + (Math.random() - 0.5) * 0.002, // Add small random offset
            lng: coord[1] + (Math.random() - 0.5) * 0.002,
            confidence: 0.7 // Medium confidence for estimated positions
        };
    }

    updateTrainPositions() {
        // Clear existing train markers
        this.trainMarkers.forEach(marker => this.map.removeLayer(marker));
        this.trainMarkers = [];

        // Group trains by route for better visualization
        const trainsByRoute = {};
        this.trainData.forEach(train => {
            if (!trainsByRoute[train.routeId]) {
                trainsByRoute[train.routeId] = [];
            }
            trainsByRoute[train.routeId].push(train);
        });

        // Create train markers positioned on their lines
        Object.entries(trainsByRoute).forEach(([routeId, trains]) => {
            const lineColor = this.getLineColor(routeId);
            
            trains.forEach((train, index) => {
                if (train.estimatedLat && train.estimatedLng) {
                    // Create animated train marker
                    const trainIcon = L.divIcon({
                        className: 'train-marker',
                        html: `
                            <div class="train-icon" style="
                                background-color: ${lineColor};
                                color: ${routeId.match(/[NQRW]/) ? 'black' : 'white'};
                                border: 2px solid white;
                                border-radius: 50%;
                                width: 24px;
                                height: 24px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: bold;
                                font-size: 12px;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                                animation: trainPulse 2s infinite;
                            ">${routeId}</div>
                        `,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    
                    const marker = L.marker([train.estimatedLat, train.estimatedLng], {
                        icon: trainIcon,
                        title: `${routeId} Train - ${train.tripId}`
                    });
                    
                    // Enhanced popup with train details
                    const nextArrival = train.arrival ? new Date(train.arrival) : null;
                    const arrivalText = nextArrival ? 
                        `Next stop: ${Math.round((nextArrival - new Date()) / 60000)}min` : 
                        'Schedule unknown';
                    
                    marker.bindPopup(`
                        <div style="text-align: center;">
                            <div style="
                                background: ${lineColor};
                                color: ${routeId.match(/[NQRW]/) ? 'black' : 'white'};
                                padding: 8px;
                                border-radius: 4px;
                                font-weight: bold;
                                margin-bottom: 8px;
                            ">${routeId} Train</div>
                            <div><strong>Trip:</strong> ${train.tripId}</div>
                            <div><strong>Stop:</strong> ${train.stopId}</div>
                            <div><strong>Status:</strong> ${arrivalText}</div>
                            <div style="font-size: 11px; color: #666; margin-top: 4px;">
                                Position estimated
                            </div>
                        </div>
                    `);
                    
                    marker.addTo(this.map);
                    this.trainMarkers.push(marker);
                }
            });
        });
        
        console.log(`🚆 Updated ${this.trainMarkers.length} train positions on map`);
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

        // Display route information
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
        const activeTrains = trains.filter(t => t.estimatedLat && t.estimatedLng).length;
        
        element.innerHTML = `
            <div class="train-line-icon line-${sanitizedRouteId}">${routeId}</div>
            <div class="train-details">
                <strong>Line ${routeId}</strong>
                <p>${activeTrains} trains on map</p>
                <p style="font-size: 0.8rem; color: #888;">${trains.length} total updates</p>
            </div>
        `;
        
        // Click to focus on this line
        element.style.cursor = 'pointer';
        element.addEventListener('click', () => {
            this.focusOnLine(routeId);
        });
        
        return element;
    }

    focusOnLine(routeId) {
        const lineData = this.subwayLines[routeId];
        if (lineData && lineData.coordinates.length > 0) {
            // Fit map to show the entire line
            const bounds = L.latLngBounds(lineData.coordinates);
            this.map.fitBounds(bounds, { padding: [20, 20] });
            
            // Highlight the line temporarily
            const originalStyle = lineData.line.options;
            lineData.line.setStyle({ weight: 8, opacity: 1 });
            
            setTimeout(() => {
                lineData.line.setStyle(originalStyle);
            }, 2000);
        }
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
        const aIsNumber = /^\d/.test(a);
        const bIsNumber = /^\d/.test(b);
        
        if (aIsNumber && !bIsNumber) return -1;
        if (!aIsNumber && bIsNumber) return 1;
        
        return a.localeCompare(b);
    }

    startAutoRefresh() {
        // Refresh every 30 seconds to show train movement
        setInterval(() => {
            if (!this.isLoading) {
                console.log('🔄 Auto-refreshing train positions...');
                this.fetchTrainData();
            }
        }, 30000);
        
        console.log('⏰ Train position auto-refresh enabled (30 seconds)');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting NYC Subway Map with actual routes...');
    new SubwayMap();
});