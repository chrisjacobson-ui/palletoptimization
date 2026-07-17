// Trip Management Application - JavaScript
// Core functionality for the TMA prototype

// Global state management
const TMA = {
    trips: [],
    orders: [],
    currentUser: 'John Manager',
    notifications: [],

    // Initialize the application
    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.updateActiveNavLink();
    },

    // Load sample data for demonstration
    loadSampleData() {
        this.trips = [
            {
                id: 'TRP-2024-001',
                route: 'Warehouse A → Customer Site',
                status: 'in-progress',
                created: new Date('2024-01-30'),
                orders: ['ORD-12348', 'ORD-12349'],
                driver: 'John Driver',
                vehicle: 'Truck-001',
                estimatedDelivery: new Date('2024-01-31')
            },
            {
                id: 'TRP-2024-002',
                route: 'Warehouse B → Distribution Center',
                status: 'completed',
                created: new Date('2024-01-30'),
                orders: ['ORD-12350', 'ORD-12351'],
                driver: 'Jane Driver',
                vehicle: 'Truck-002',
                estimatedDelivery: new Date('2024-01-30')
            },
            {
                id: 'TRP-2024-003',
                route: 'Warehouse A → Multiple Stops',
                status: 'delayed',
                created: new Date('2024-01-29'),
                orders: ['ORD-12352', 'ORD-12353', 'ORD-12354'],
                driver: 'Mike Driver',
                vehicle: 'Truck-003',
                estimatedDelivery: new Date('2024-01-31')
            }
        ];

        this.orders = [
            {
                id: 'ORD-12345',
                customer: 'ACME Corporation',
                priority: 'High',
                status: 'pending',
                items: 25,
                weight: 150,
                destination: 'New York, NY',
                created: new Date('2024-01-30')
            },
            {
                id: 'ORD-12346',
                customer: 'Global Industries',
                priority: 'Standard',
                status: 'pending',
                items: 12,
                weight: 80,
                destination: 'Boston, MA',
                created: new Date('2024-01-30')
            },
            {
                id: 'ORD-12347',
                customer: 'Tech Solutions Ltd',
                priority: 'Standard',
                status: 'pending',
                items: 8,
                weight: 45,
                destination: 'Philadelphia, PA',
                created: new Date('2024-01-30')
            }
        ];
    },

    // Setup event listeners
    setupEventListeners() {
        // Handle refresh dashboard
        const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshDashboard.bind(this));
        }

        // Handle export data
        const exportBtn = document.querySelector('[onclick="exportData()"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportData.bind(this));
        }

        // Handle drag and drop for order assignment
        this.setupDragAndDrop();

        // Handle form submissions
        this.setupForms();

        // Update active navigation link
        this.updateActiveNavLink();
    },

    // Update active navigation link based on current page
    updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage ||
                (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    },

    // Refresh dashboard data
    refreshDashboard() {
        const btn = document.querySelector('[onclick="refreshDashboard()"]');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            btn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                this.showNotification('Dashboard refreshed successfully', 'success');
                this.updateMetrics();
            }, 1500);
        }
    },

    // Export data functionality
    exportData() {
        const btn = document.querySelector('[onclick="exportData()"]');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            btn.disabled = true;

            // Simulate export process
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                this.showNotification('Report exported successfully', 'success');

                // Trigger download of sample data
                this.downloadSampleReport();
            }, 2000);
        }
    },

    // Download sample report
    downloadSampleReport() {
        const data = {
            trips: this.trips,
            orders: this.orders,
            exported: new Date().toISOString(),
            user: this.currentUser
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tma-report-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Setup drag and drop functionality
    setupDragAndDrop() {
        const dragZones = document.querySelectorAll('.drag-drop-zone');
        const orderItems = document.querySelectorAll('.order-item');

        // Make order items draggable
        orderItems.forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Setup drop zones
        dragZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
            zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    },

    // Drag and drop event handlers
    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.orderId || '');
        e.target.style.opacity = '0.5';
    },

    handleDragEnd(e) {
        e.target.style.opacity = '1';
    },

    handleDragOver(e) {
        e.preventDefault();
    },

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    },

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    },

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        const orderId = e.dataTransfer.getData('text/plain');
        if (orderId) {
            this.assignOrderToTrip(orderId, e.target.dataset.tripId);
        }
    },

    // Assign order to trip
    assignOrderToTrip(orderId, tripId) {
        const order = this.orders.find(o => o.id === orderId);
        const trip = this.trips.find(t => t.id === tripId);

        if (order && trip) {
            if (!trip.orders.includes(orderId)) {
                trip.orders.push(orderId);
                order.status = 'assigned';
                this.showNotification(`Order ${orderId} assigned to Trip ${tripId}`, 'success');
            } else {
                this.showNotification(`Order ${orderId} is already assigned to this trip`, 'warning');
            }
        }
    },

    // Setup form handling
    setupForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // Setup form validation
        this.setupFormValidation();
    },

    // Form validation
    setupFormValidation() {
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', this.validateField.bind(this));
            field.addEventListener('input', this.clearFieldError.bind(this));
        });
    },

    // Validate individual field
    validateField(e) {
        const field = e.target;
        const value = field.value.trim();

        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        this.clearFieldError(field);
        return true;
    },

    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');
        let errorDiv = field.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    },

    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    // Email validation
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Validate all fields
        const fields = form.querySelectorAll('[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });

        if (isValid) {
            this.submitForm(form, formData);
        }
    },

    // Submit form data
    submitForm(form, formData) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                if (form.id === 'tripForm') {
                    this.handleTripCreation(formData);
                } else if (form.id === 'orderForm') {
                    this.handleOrderUpdate(formData);
                }

                form.reset();
            }, 1500);
        }
    },

    // Handle trip creation
    handleTripCreation(formData) {
        const newTrip = {
            id: 'TRP-2024-' + String(this.trips.length + 1).padStart(3, '0'),
            route: formData.get('origin') + ' → ' + formData.get('destination'),
            status: 'pending',
            created: new Date(),
            orders: [],
            driver: formData.get('driver'),
            vehicle: formData.get('vehicle'),
            estimatedDelivery: new Date(formData.get('deliveryDate'))
        };

        this.trips.push(newTrip);
        this.showNotification(`Trip ${newTrip.id} created successfully`, 'success');
    },

    // Handle order update
    handleOrderUpdate(formData) {
        const orderId = formData.get('orderId');
        const order = this.orders.find(o => o.id === orderId);

        if (order) {
            order.priority = formData.get('priority');
            order.destination = formData.get('destination');
            this.showNotification(`Order ${orderId} updated successfully`, 'success');
        }
    },

    // Update metrics on dashboard
    updateMetrics() {
        const activeTrips = this.trips.filter(t => t.status === 'in-progress').length;
        const ordersInTransit = this.trips.reduce((count, trip) => {
            return trip.status === 'in-progress' ? count + trip.orders.length : count;
        }, 0);

        // Update DOM elements
        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 2) {
            metricValues[0].textContent = activeTrips;
            metricValues[1].textContent = ordersInTransit;
        }
    },

    // Show notifications
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    // Filter and search functionality
    filterTrips(status = 'all') {
        const filteredTrips = status === 'all'
            ? this.trips
            : this.trips.filter(trip => trip.status === status);

        this.renderTripList(filteredTrips);
    },

    searchOrders(query) {
        const filteredOrders = this.orders.filter(order =>
            order.id.toLowerCase().includes(query.toLowerCase()) ||
            order.customer.toLowerCase().includes(query.toLowerCase())
        );

        this.renderOrderList(filteredOrders);
    },

    // Render trip list
    renderTripList(trips) {
        const container = document.querySelector('.trip-list');
        if (container) {
            container.innerHTML = trips.map(trip => `
                <div class="trip-item">
                    <div class="trip-info">
                        <div class="trip-id">${trip.id}</div>
                        <div class="trip-route">${trip.route}</div>
                        <div class="trip-date">Created: ${trip.created.toLocaleDateString()}</div>
                    </div>
                    <div class="trip-status">
                        <span class="status-badge status-${trip.status}">${trip.status.replace('-', ' ')}</span>
                    </div>
                </div>
            `).join('');
        }
    },

    // Render order list
    renderOrderList(orders) {
        const container = document.querySelector('.order-list');
        if (container) {
            container.innerHTML = orders.map(order => `
                <div class="order-item" data-order-id="${order.id}">
                    <div class="order-info">
                        <div class="order-id">${order.id}</div>
                        <div class="customer">${order.customer}</div>
                        <div class="priority">${order.priority} Priority</div>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-sm btn-primary">Assign to Trip</button>
                    </div>
                </div>
            `).join('');
        }
    }
};

// Utility functions
function refreshDashboard() {
    TMA.refreshDashboard();
}

function exportData() {
    TMA.exportData();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    TMA.init();
});

// Handle page navigation
window.addEventListener('popstate', function() {
    TMA.updateActiveNavLink();
});

// Add notification styles to head if they don't exist
if (!document.querySelector('#notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .notification {
            background: white;
            border-radius: 8px;
            padding: 1rem 1.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border-left: 4px solid;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 300px;
            max-width: 500px;
        }

        .notification-success { border-left-color: #10b981; }
        .notification-error { border-left-color: #ef4444; }
        .notification-warning { border-left-color: #f59e0b; }
        .notification-info { border-left-color: #3b82f6; }

        .notification i:first-child {
            font-size: 1.25rem;
        }

        .notification-success i:first-child { color: #10b981; }
        .notification-error i:first-child { color: #ef4444; }
        .notification-warning i:first-child { color: #f59e0b; }
        .notification-info i:first-child { color: #3b82f6; }

        .notification span {
            flex: 1;
            color: #374151;
            font-weight: 500;
        }

        .notification-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .notification-close:hover {
            background: #f3f4f6;
            color: #6b7280;
        }

        @media (max-width: 768px) {
            .notification-container {
                left: 20px;
                right: 20px;
            }

            .notification {
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
}