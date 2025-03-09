// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function getStatusClass(status) {
    return status.toLowerCase() === 'reviewed' ? 'status-reviewed' : 'status-pending';
}

// Helper Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<tr><td colspan="7" class="loading-state">Loading...</td></tr>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.querySelector('.loading-state')) {
        element.querySelector('.loading-state').remove();
    }
}

function updateFilterCounts(type, items) {
    if (!items) return;
    
    const totalCount = items.length;
    const pendingCount = items.filter(item => !item.admin_review).length;
    const reviewedCount = items.filter(item => item.admin_review).length;

    const totalElement = document.getElementById('total-count');
    const pendingElement = document.getElementById('pending-count');
    const reviewedElement = document.getElementById('reviewed-count');

    if (totalElement) totalElement.textContent = totalCount;
    if (pendingElement) pendingElement.textContent = pendingCount;
    if (reviewedElement) reviewedElement.textContent = reviewedCount;

    // Update status filter if it exists
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.innerHTML = `
            <option value="">All Status (${totalCount})</option>
            <option value="pending">Pending Review (${pendingCount})</option>
            <option value="reviewed">Reviewed (${reviewedCount})</option>
        `;
    }
}

// Dashboard Functions
async function updateDashboardStats() {
    try {
        // Get all classes
        const classes = await api.getAllClasses();
        let allForecasts = [];
        let allActivities = [];
        
        // Fetch forecasts and activities for each class
        for (const classInfo of classes) {
            try {
                const [forecasts, activities] = await Promise.all([
                    api.getForecastsForClass(classInfo.id),
                    api.getActivitiesForClass(classInfo.id)
                ]);
                allForecasts = allForecasts.concat(forecasts || []);
                allActivities = allActivities.concat(activities || []);
            } catch (error) {
                console.error(`Error fetching data for class ${classInfo.class_name}:`, error);
            }
        }

        console.log('All Forecasts:', allForecasts);
        console.log('All Activities:', allActivities);
        
        // Calculate counts
        const pendingForecastsCount = allForecasts.filter(f => !f.admin_review).length;
        const pendingActivitiesCount = allActivities.filter(a => !a.admin_review).length;
        const totalPendingCount = pendingForecastsCount + pendingActivitiesCount;
        
        // Update the main pending count
        const pendingCountElement = document.getElementById('pending-count');
        if (pendingCountElement) {
            pendingCountElement.textContent = totalPendingCount;
        }
        
        // Update forecast and activity pending counts
        const forecastPendingElement = document.getElementById('forecast-pending');
        const activityPendingElement = document.getElementById('activity-pending');
        
        if (forecastPendingElement) {
            forecastPendingElement.textContent = `${pendingForecastsCount} Forecasts`;
        }
        if (activityPendingElement) {
            activityPendingElement.textContent = `${pendingActivitiesCount} Activities`;
        }
        
        // Update today's reviews count
        const todayCountElement = document.getElementById('today-count');
        if (todayCountElement) {
            const today = new Date().toISOString().split('T')[0];
            const todayForecasts = allForecasts.filter(f => f.updated_at?.split('T')[0] === today && f.admin_review).length;
            const todayActivities = allActivities.filter(a => a.updated_at?.split('T')[0] === today && a.admin_review).length;
            todayCountElement.textContent = todayForecasts + todayActivities;
        }
        
        // Update average rating
        const avgRatingElement = document.getElementById('avg-rating');
        if (avgRatingElement) {
            const allRatings = [
                ...allForecasts.filter(f => f.rating).map(f => f.rating),
                ...allActivities.filter(a => a.rating).map(a => a.rating)
            ];
            
            const avgRating = allRatings.length > 0
                ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
                : '0.0';
            
            avgRatingElement.textContent = avgRating;
        }
        
        // Update current date
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            currentDateElement.textContent = new Date().toLocaleDateString();
        }
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        // Show error message on the dashboard
        const errorMessage = 'Error loading dashboard statistics. Please refresh the page.';
        ['pending-count', 'today-count', 'avg-rating'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '---';
                element.title = errorMessage;
            }
        });
    }
}

// Add auto-refresh for dashboard stats
function initializeDashboard() {
    // Initial update
    updateDashboardStats();
    
    // Refresh every 30 seconds
    setInterval(updateDashboardStats, 30000);
}

// Review Functions
async function loadForecasts() {
    try {
        const tbody = document.getElementById('forecasts-table-body');
        if (!tbody) {
            console.error('Forecasts table body not found');
            return;
        }

        // Show loading state
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Loading forecasts...</td></tr>';

        // Get all classes
        const classes = await api.getAllClasses();
        console.log('Loaded classes:', classes);
        
        let allForecasts = [];
        
        // Fetch forecasts for each class
        for (const classInfo of classes) {
            try {
                const forecasts = await api.getForecastsForClass(classInfo.id);
                console.log(`Loaded forecasts for class ${classInfo.class_name}:`, forecasts);
                
                // Add class info to each forecast
                if (Array.isArray(forecasts)) {
                    forecasts.forEach(forecast => {
                        // Ensure class info is properly set
                        forecast.class_name = classInfo.class_name;
                        forecast.section = classInfo.section;
                        forecast.class_id = classInfo.id;
                        
                        // Log the forecast after adding class info
                        console.log('Processed forecast:', forecast);
                    });
                    allForecasts = allForecasts.concat(forecasts);
                }
            } catch (error) {
                console.error(`Error fetching forecasts for class ${classInfo.class_name}:`, error);
            }
        }

        console.log('Total forecasts loaded:', allForecasts.length);
        console.log('All forecasts:', allForecasts);

        // Clear loading state and populate table
        tbody.innerHTML = '';
        if (allForecasts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No forecasts found</td></tr>';
            return;
        }

        // Sort forecasts by submission date (newest first)
        allForecasts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        allForecasts.forEach(forecast => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${forecast.week_number || 'N/A'}</td>
                <td>${forecast.class_name || 'N/A'}</td>
                <td>${forecast.section || 'SINGLE'}</td>
                <td>${forecast.subject || 'N/A'}</td>
                <td>${forecast.topic || 'N/A'}</td>
                <td>
                    <span class="status-badge ${forecast.admin_review ? 'reviewed' : 'pending'}">
                        ${forecast.admin_review ? 'Reviewed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="review-btn" onclick="openReviewModal('forecast', ${forecast.id})">
                        ${forecast.admin_review ? 'Edit Review' : 'Review'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update filter counts
        updateFilterCounts('forecasts', allForecasts);

    } catch (error) {
        console.error('Error loading forecasts:', error);
        const tbody = document.getElementById('forecasts-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="error-state">Error loading forecasts. Please try again.</td></tr>';
        }
    }
}

// Load activities for review
async function loadActivities() {
    try {
        const tbody = document.getElementById('activities-table-body');
        if (!tbody) {
            console.error('Activities table body not found');
            return;
        }
        
        // Show loading state
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Loading activities...</td></tr>';
        
        // Get all classes
        const classes = await api.getAllClasses();
        console.log('Loaded classes:', classes);
        
        let allActivities = [];
        
        // Fetch activities for each class
        for (const classInfo of classes) {
            try {
                const activities = await api.getActivitiesForClass(classInfo.id);
                console.log(`Loaded activities for class ${classInfo.class_name}:`, activities);
                
                // Add class info to each activity
                if (Array.isArray(activities)) {
                    activities.forEach(activity => {
                        activity.class_name = classInfo.class_name;
                        activity.section = classInfo.section || 'SINGLE';
                    });
                    allActivities = allActivities.concat(activities);
                }
            } catch (error) {
                console.error(`Error fetching activities for class ${classInfo.class_name}:`, error);
            }
        }
        
        console.log('Total activities loaded:', allActivities.length);

        // Clear loading state and populate table
        tbody.innerHTML = '';
        if (allActivities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No activities found</td></tr>';
            return;
        }
        
        // Sort activities by submission date (newest first)
        allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        allActivities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.day_of_week || 'N/A'}</td>
                <td>${activity.class_name || 'N/A'}</td>
                <td>${activity.section || 'N/A'}</td>
                <td>${activity.topic || 'N/A'}</td>
                <td>${activity.rpk || 'N/A'}</td>
                <td>
                    <span class="status-badge ${activity.admin_review ? 'reviewed' : 'pending'}">
                        ${activity.admin_review ? 'Reviewed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="review-btn" onclick="openReviewModal('activity', ${activity.id})">
                        ${activity.admin_review ? 'Edit Review' : 'Review'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update filter counts
        updateFilterCounts('activities', allActivities);
        
    } catch (error) {
        console.error('Error loading activities:', error);
        const tbody = document.getElementById('activities-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="error-state">Error loading activities. Please try again.</td></tr>';
        }
    }
}

// Modal Functions
let currentItemId = null;
let currentItemType = null;

async function openReviewModal(type, id) {
    try {
        // Show loading state in modal
        const modal = document.getElementById('review-modal');
        modal.style.display = 'block';
        
        // Set current item type and ID
        currentItemType = type;
        currentItemId = id;
        
        // Load item details
        await loadItemDetails(type, id);
        
    } catch (error) {
        console.error('Error opening review modal:', error);
        alert('Failed to open review modal. Please try again.');
    }
}

function closeModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'none';
        currentItemId = null;
        currentItemType = null;
        
        // Reset form
        const ratingInput = document.getElementById('rating');
        const feedbackInput = document.getElementById('feedback');
        if (ratingInput) ratingInput.value = '5';
        if (feedbackInput) feedbackInput.value = '';
    }
}

async function loadItemDetails(type, id) {
    try {
        console.log(`Loading ${type} details for ID:`, id);
        
        // Show loading state in modal elements
        const elements = {
            'modal-class': 'Loading...',
            'modal-section': 'Loading...',
            'modal-day': 'Loading...',
            'modal-topic': 'Loading...',
            'modal-subtopic': 'Loading...',
            'modal-rpk': 'Loading...',
            'modal-objectives': 'Loading...',
            'modal-material': 'Loading...'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Use the correct API functions from the api object
        let item;
        try {
            item = type === 'activity' 
                ? await api.getActivity(id)
                : await api.getForecast(id);
                
            console.log('Loaded item details:', item);
            
            if (!item || typeof item !== 'object') {
                throw new Error(`${type} not found or invalid response`);
            }
        } catch (error) {
            console.error('Error fetching item:', error);
            throw error;
        }

        // Update modal content with the actual data
        if (type === 'forecast') {
            const updatedElements = {
                'modal-class': item.class_name,
                'modal-section': item.section,
                'modal-day': item.week_number,
                'modal-topic': item.topic,
                'modal-subtopic': item.subtopic,
                'modal-material': item.material
            };

            // Update each element with fallback to 'N/A' only if value is null or undefined
            Object.entries(updatedElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || 'N/A';
                }
            });
        } else {
            // For activities
            const updatedElements = {
                'modal-class': item.class_name,
                'modal-section': item.section,
                'modal-day': item.day_of_week,
                'modal-topic': item.topic,
                'modal-subtopic': item.subtopic,
                'modal-rpk': item.rpk,
                'modal-objectives': item.objectives,
                'modal-material': item.material
            };

            // Update each element with fallback to 'N/A' only if value is null or undefined
            Object.entries(updatedElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || 'N/A';
                }
            });
        }

        // If there's an existing review, populate the form
        const ratingInput = document.getElementById('rating');
        const feedbackInput = document.getElementById('feedback');
        
        if (ratingInput && item.rating) {
            ratingInput.value = item.rating;
        }
        if (feedbackInput && item.admin_feedback) {
            feedbackInput.value = item.admin_feedback;
        }

        // Enable review form
        if (ratingInput) ratingInput.disabled = false;
        if (feedbackInput) feedbackInput.disabled = false;
        
        const submitButton = document.querySelector('.submit-btn');
        if (submitButton) submitButton.disabled = false;

    } catch (error) {
        console.error('Error loading item details:', error);
        
        // Show error in modal elements
        const errorElements = {
            'modal-class': '---',
            'modal-section': '---',
            'modal-day': '---',
            'modal-topic': error.message || 'Error loading details',
            'modal-subtopic': type === 'forecast' 
                ? 'This forecast may have been deleted or not yet submitted.'
                : 'This activity may have been deleted or not yet submitted.',
            'modal-rpk': '---',
            'modal-objectives': '---',
            'modal-material': '---'
        };
        
        Object.entries(errorElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Disable review form on error
        const ratingInput = document.getElementById('rating');
        const feedbackInput = document.getElementById('feedback');
        const submitButton = document.querySelector('.submit-btn');
        
        if (ratingInput) ratingInput.disabled = true;
        if (feedbackInput) feedbackInput.disabled = true;
        if (submitButton) submitButton.disabled = true;
    }
}

async function submitReview() {
    if (!currentItemId || !currentItemType) {
        alert('No item selected for review');
        return;
    }

    const rating = parseInt(document.getElementById('rating').value);
    const feedback = document.getElementById('feedback').value.trim();
    
    if (!rating || rating < 1 || rating > 5) {
        alert('Please provide a valid rating (1-5)');
        return;
    }
    
    if (!feedback) {
        alert('Please provide feedback');
        return;
    }
    
    try {
        const reviewData = {
            rating,
            admin_feedback: feedback,
            admin_review: true,
            reviewed_at: new Date().toISOString()
        };
        
        // Use the correct API function based on the type
        if (currentItemType === 'activity') {
            await api.updateActivityStatus(currentItemId, reviewData);
            await loadActivities(); // Refresh activities table
        } else {
            await api.updateForecastStatus(currentItemId, reviewData);
            await loadForecasts(); // Refresh forecasts table
        }
        
        closeModal();
        
        // Show success message
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message success';
        statusMessage.textContent = '✅ Review submitted successfully!';
        document.body.appendChild(statusMessage);
        setTimeout(() => statusMessage.remove(), 3000);

        // Update dashboard stats if we're on the dashboard page
        if (document.getElementById('pending-count')) {
            updateDashboardStats();
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'status-message error';
        errorMessage.textContent = '❌ Error submitting review. Please try again.';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
    }
}

// Settings Functions
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    if (document.getElementById('admin-name')) {
        document.getElementById('admin-name').value = settings.adminName || '';
        document.getElementById('admin-email').value = settings.adminEmail || '';
        document.getElementById('notification-preference').value = settings.notifications || 'all';
        document.getElementById('default-rating').value = settings.defaultRating || '5';
        document.getElementById('feedback-template').value = settings.feedbackTemplate || '';
        document.getElementById('items-per-page').value = settings.itemsPerPage || '10';
        document.getElementById('show-completed').checked = settings.showCompleted || false;
    }
}

function saveSettings() {
    const settings = {
        adminName: document.getElementById('admin-name').value,
        adminEmail: document.getElementById('admin-email').value,
        notifications: document.getElementById('notification-preference').value,
        defaultRating: document.getElementById('default-rating').value,
        feedbackTemplate: document.getElementById('feedback-template').value,
        itemsPerPage: document.getElementById('items-per-page').value,
        showCompleted: document.getElementById('show-completed').checked
    };

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard if we're on the admin dashboard page
    if (document.getElementById('pending-count')) {
        initializeDashboard();
    }

    // Initialize review pages
    if (document.getElementById('forecasts-table-body')) {
        loadForecasts();
        ['class-filter', 'section-filter', 'status-filter', 'week-filter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => filterItems('forecast'));
        });
    }

    if (document.getElementById('activities-table-body')) {
        loadActivities();
        ['class-filter', 'section-filter', 'status-filter', 'day-filter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => filterItems('activity'));
        });
    }

    // Initialize settings
    if (document.getElementById('admin-name')) {
        loadSettings();
        document.getElementById('save-settings')?.addEventListener('click', saveSettings);
    }

    // Modal event listeners
    const closeModalBtn = document.querySelector('.close-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('review-modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}); 