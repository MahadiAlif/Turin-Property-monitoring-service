// Application Data
const dashboardData = {
    "current_status": {
        "monitoring_active": true,
        "last_scan": "2025-08-04 11:30",
        "next_scan": "2025-08-04 12:00"
    },
    "statistics": {
        "total_listings_today": 12,
        "new_listings_week": 45,
        "average_price": 650,
        "active_filters": 5
    },
    "recent_listings": [
        {
            "title": "Bilocale Centro Storico",
            "price": 580,
            "location": "Centro",
            "date_added": "2025-08-04 10:45",
            "url": "https://idealista.it/example1"
        },
        {
            "title": "Studio Crocetta",
            "price": 450,
            "location": "Crocetta",
            "date_added": "2025-08-04 09:30",
            "url": "https://idealista.it/example2"
        },
        {
            "title": "Trilocale San Salvario",
            "price": 720,
            "location": "San Salvario",
            "date_added": "2025-08-04 08:15",
            "url": "https://idealista.it/example3"
        }
    ],
    "system_logs": [
        "11:30 - Scraped 45 listings from Idealista",
        "11:25 - Found 3 new matching properties",
        "11:20 - Email notification sent",
        "11:15 - Started monitoring cycle"
    ],
    "neighborhoods": ["Centro", "Crocetta", "San Salvario", "Vanchiglia", "Borgo Po", "Porta Nuova"],
    "property_types": ["Apartment", "Studio", "Room", "House"],
    "websites": ["Idealista", "Cercoaloggio", "Subito"],
    "default_config": {
        "price_range": {"min": 300, "max": 800},
        "locations": ["Centro", "Crocetta"],
        "property_types": ["Apartment", "Studio"],
        "rooms": "1-3",
        "email": "user@example.com",
        "monitoring_interval": 30,
        "notification_frequency": "immediate"
    }
};

// Application State
let currentConfig = { ...dashboardData.default_config };
let priceChart = null;
let activityChart = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeNavigation();
    populateDashboard();
    initializeConfiguration();
    initializeWebsiteSettings();
    initializeHistory();
    setupEventListeners();
    
    // Ensure dashboard is shown by default
    showSection('dashboard');
});

// Navigation
function initializeNavigation() {
    console.log('Initializing navigation...');
    const sidebarLinks = document.querySelectorAll('.sidebar__link');
    console.log('Found sidebar links:', sidebarLinks.length);
    
    sidebarLinks.forEach((link, index) => {
        console.log(`Setting up link ${index}:`, link.getAttribute('data-section'));
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetSection = this.getAttribute('data-section');
            console.log('Navigation clicked:', targetSection);
            
            // Show the target section
            showSection(targetSection);
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections first
    const allSections = document.querySelectorAll('.content-section');
    console.log('Found sections:', allSections.length);
    
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        console.log('Target section found, showing:', sectionId);
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        
        // Initialize charts when history section is shown
        if (sectionId === 'history') {
            setTimeout(() => {
                initializeCharts();
            }, 200);
        }
    } else {
        console.error('Target section not found:', sectionId);
    }
}

// Dashboard Population
function populateDashboard() {
    console.log('Populating dashboard...');
    
    // Update statistics
    const totalTodayEl = document.getElementById('total-today');
    const newWeekEl = document.getElementById('new-week');
    const avgPriceEl = document.getElementById('avg-price');
    const activeFiltersEl = document.getElementById('active-filters');
    
    if (totalTodayEl) totalTodayEl.textContent = dashboardData.statistics.total_listings_today;
    if (newWeekEl) newWeekEl.textContent = dashboardData.statistics.new_listings_week;
    if (avgPriceEl) avgPriceEl.textContent = `€${dashboardData.statistics.average_price}`;
    if (activeFiltersEl) activeFiltersEl.textContent = dashboardData.statistics.active_filters;
    
    // Update monitoring status
    const statusElement = document.getElementById('monitoring-status');
    if (statusElement) {
        if (dashboardData.current_status.monitoring_active) {
            statusElement.textContent = 'Monitoring Active';
            statusElement.className = 'status status--success';
        } else {
            statusElement.textContent = 'Monitoring Inactive';
            statusElement.className = 'status status--error';
        }
    }
    
    // Populate recent listings
    const recentListingsTable = document.getElementById('recent-listings');
    if (recentListingsTable) {
        recentListingsTable.innerHTML = '';
        
        dashboardData.recent_listings.forEach(listing => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${listing.title}</td>
                <td class="price-cell">€${listing.price}</td>
                <td>${listing.location}</td>
                <td>${formatDate(listing.date_added)}</td>
                <td><a href="${listing.url}" target="_blank" class="view-link">View</a></td>
            `;
            recentListingsTable.appendChild(row);
        });
    }
    
    // Populate system logs
    const systemLogs = document.getElementById('system-logs');
    if (systemLogs) {
        systemLogs.innerHTML = '';
        
        dashboardData.system_logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            const parts = log.split(' - ');
            logEntry.innerHTML = `<span class="log-time">${parts[0]}</span> - ${parts[1]}`;
            systemLogs.appendChild(logEntry);
        });
    }
}

// Configuration Initialization
function initializeConfiguration() {
    console.log('Initializing configuration...');
    
    // Initialize price range sliders
    const priceMinSlider = document.getElementById('price-min');
    const priceMaxSlider = document.getElementById('price-max');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');
    
    if (priceMinSlider && priceMaxSlider && priceMinValue && priceMaxValue) {
        priceMinSlider.value = currentConfig.price_range.min;
        priceMaxSlider.value = currentConfig.price_range.max;
        priceMinValue.textContent = `€${currentConfig.price_range.min}`;
        priceMaxValue.textContent = `€${currentConfig.price_range.max}`;
        
        priceMinSlider.addEventListener('input', function() {
            const minVal = parseInt(this.value);
            const maxVal = parseInt(priceMaxSlider.value);
            
            if (minVal >= maxVal) {
                this.value = maxVal - 10;
            }
            
            priceMinValue.textContent = `€${this.value}`;
            currentConfig.price_range.min = parseInt(this.value);
        });
        
        priceMaxSlider.addEventListener('input', function() {
            const minVal = parseInt(priceMinSlider.value);
            const maxVal = parseInt(this.value);
            
            if (maxVal <= minVal) {
                this.value = minVal + 10;
            }
            
            priceMaxValue.textContent = `€${this.value}`;
            currentConfig.price_range.max = parseInt(this.value);
        });
    }
    
    // Initialize location checkboxes
    const locationCheckboxes = document.getElementById('location-checkboxes');
    if (locationCheckboxes) {
        locationCheckboxes.innerHTML = '';
        dashboardData.neighborhoods.forEach(neighborhood => {
            const checkboxItem = document.createElement('label');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" value="${neighborhood}" ${currentConfig.locations.includes(neighborhood) ? 'checked' : ''}>
                ${neighborhood}
            `;
            
            const checkbox = checkboxItem.querySelector('input');
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxItem.classList.add('checked');
                    if (!currentConfig.locations.includes(neighborhood)) {
                        currentConfig.locations.push(neighborhood);
                    }
                } else {
                    checkboxItem.classList.remove('checked');
                    currentConfig.locations = currentConfig.locations.filter(loc => loc !== neighborhood);
                }
            });
            
            if (checkbox.checked) {
                checkboxItem.classList.add('checked');
            }
            
            locationCheckboxes.appendChild(checkboxItem);
        });
    }
    
    // Initialize property type checkboxes
    const propertyTypeCheckboxes = document.getElementById('property-type-checkboxes');
    if (propertyTypeCheckboxes) {
        propertyTypeCheckboxes.innerHTML = '';
        dashboardData.property_types.forEach(type => {
            const checkboxItem = document.createElement('label');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" value="${type}" ${currentConfig.property_types.includes(type) ? 'checked' : ''}>
                ${type}
            `;
            
            const checkbox = checkboxItem.querySelector('input');
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxItem.classList.add('checked');
                    if (!currentConfig.property_types.includes(type)) {
                        currentConfig.property_types.push(type);
                    }
                } else {
                    checkboxItem.classList.remove('checked');
                    currentConfig.property_types = currentConfig.property_types.filter(pt => pt !== type);
                }
            });
            
            if (checkbox.checked) {
                checkboxItem.classList.add('checked');
            }
            
            propertyTypeCheckboxes.appendChild(checkboxItem);
        });
    }
    
    // Initialize monitoring interval slider
    const intervalSlider = document.getElementById('monitoring-interval');
    const intervalValue = document.getElementById('interval-value');
    
    if (intervalSlider && intervalValue) {
        intervalSlider.value = currentConfig.monitoring_interval;
        intervalValue.textContent = `${currentConfig.monitoring_interval} minutes`;
        
        intervalSlider.addEventListener('input', function() {
            intervalValue.textContent = `${this.value} minutes`;
            currentConfig.monitoring_interval = parseInt(this.value);
        });
    }
    
    // Initialize active days
    const activeDays = document.getElementById('active-days');
    if (activeDays) {
        activeDays.innerHTML = '';
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        days.forEach((day, index) => {
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item active';
            dayItem.textContent = day;
            dayItem.dataset.day = index;
            
            dayItem.addEventListener('click', function() {
                this.classList.toggle('active');
            });
            
            activeDays.appendChild(dayItem);
        });
    }
}

// Website Settings
function initializeWebsiteSettings() {
    console.log('Initializing website settings...');
    
    const websiteToggles = document.getElementById('website-toggles');
    if (websiteToggles) {
        websiteToggles.innerHTML = '';
        dashboardData.websites.forEach(website => {
            const websiteItem = document.createElement('div');
            websiteItem.className = 'website-item enabled';
            websiteItem.innerHTML = `
                <div class="website-name">${website}</div>
                <input type="checkbox" class="website-toggle" checked>
            `;
            
            const toggle = websiteItem.querySelector('.website-toggle');
            toggle.addEventListener('change', function() {
                if (this.checked) {
                    websiteItem.classList.add('enabled');
                } else {
                    websiteItem.classList.remove('enabled');
                }
            });
            
            websiteToggles.appendChild(websiteItem);
        });
    }
}

// History and Charts
function initializeHistory() {
    console.log('Initializing history...');
    
    // Populate all listings table
    const allListingsTable = document.getElementById('all-listings');
    if (allListingsTable) {
        const allListings = [
            ...dashboardData.recent_listings,
            {
                title: "Monolocale Vanchiglia",
                price: 400,
                location: "Vanchiglia",
                date_added: "2025-08-03 16:20",
                url: "https://cercoaloggio.it/example1",
                source: "Cercoaloggio"
            },
            {
                title: "Appartamento Borgo Po",
                price: 850,
                location: "Borgo Po",
                date_added: "2025-08-03 14:15",
                url: "https://subito.it/example1",
                source: "Subito"
            }
        ];
        
        allListingsTable.innerHTML = '';
        allListings.forEach(listing => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${listing.title}</td>
                <td class="price-cell">€${listing.price}</td>
                <td>${listing.location}</td>
                <td>${formatDate(listing.date_added)}</td>
                <td>${listing.source || 'Idealista'}</td>
                <td><a href="${listing.url}" target="_blank" class="view-link">View</a></td>
            `;
            allListingsTable.appendChild(row);
        });
    }
}

function initializeCharts() {
    console.log('Initializing charts...');
    
    // Price Trend Chart
    const priceCtx = document.getElementById('price-trend-chart');
    if (priceCtx && !priceChart) {
        try {
            priceChart = new Chart(priceCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    datasets: [{
                        label: 'Average Price (€)',
                        data: [620, 630, 640, 635, 650, 645, 660, 650],
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 600
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating price chart:', error);
        }
    }
    
    // Activity Chart
    const activityCtx = document.getElementById('activity-chart');
    if (activityCtx && !activityChart) {
        try {
            activityChart = new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'New Listings',
                        data: [8, 12, 15, 10, 18, 5, 3],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating activity chart:', error);
        }
    }
}

// Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Save Configuration
    const saveConfigBtn = document.getElementById('save-config');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', function() {
            showToast('Configuration saved successfully!', 'success');
        });
    }
    
    // Test Notification
    const testNotificationBtn = document.getElementById('test-notification');
    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', function() {
            showToast('Test notification sent!', 'success');
        });
    }
    
    // Export Data
    const exportDataBtn = document.getElementById('export-data');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            exportToCSV();
        });
    }
    
    // Search Listings
    const searchInput = document.getElementById('search-listings');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterListings(this.value);
        });
    }
    
    // Sort Listings
    const sortSelect = document.getElementById('sort-listings');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortListings(this.value);
        });
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function exportToCSV() {
    const data = [
        ['Property Title', 'Price', 'Location', 'Date Added', 'Source'],
        ['Bilocale Centro Storico', '580', 'Centro', '2025-08-04 10:45', 'Idealista'],
        ['Studio Crocetta', '450', 'Crocetta', '2025-08-04 09:30', 'Idealista'],
        ['Trilocale San Salvario', '720', 'San Salvario', '2025-08-04 08:15', 'Idealista'],
        ['Monolocale Vanchiglia', '400', 'Vanchiglia', '2025-08-03 16:20', 'Cercoaloggio'],
        ['Appartamento Borgo Po', '850', 'Borgo Po', '2025-08-03 14:15', 'Subito']
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_listings.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function filterListings(searchTerm) {
    const rows = document.querySelectorAll('#all-listings tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function sortListings(sortBy) {
    const tbody = document.getElementById('all-listings');
    if (tbody) {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'price':
                    aVal = parseInt(a.cells[1].textContent.replace('€', ''));
                    bVal = parseInt(b.cells[1].textContent.replace('€', ''));
                    return bVal - aVal; // Descending
                case 'location':
                    aVal = a.cells[2].textContent;
                    bVal = b.cells[2].textContent;
                    return aVal.localeCompare(bVal);
                case 'date':
                default:
                    aVal = new Date(a.cells[3].textContent);
                    bVal = new Date(b.cells[3].textContent);
                    return bVal - aVal; // Most recent first
            }
        });
        
        // Clear and re-append sorted rows
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }
}