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
// Helper to extract key fields from answers JSON for forecasts
function extractForecastFields(response) {
    const answers = response.answers || {};
    // Extract some meaningful fields for the table
    // Example: Tajneed Total, Motamad Attendance, Motamad No. of National Amila Meetings held this month
    let tajneedTotal = '', motamadAttendance = '', motamadMeetings = '';
    if (answers['Mohtamim Tajneed'] && answers['Mohtamim Tajneed']['Tajneed']) {
        tajneedTotal = answers['Mohtamim Tajneed']['Tajneed']['Total'] || '';
    }
    if (answers['Motamad']) {
        motamadAttendance = answers['Motamad']['Attendance'] || '';
        motamadMeetings = answers['Motamad']['No. of National Amila Meetings held this month'] || '';
    }
    return {
        week_number: motamadMeetings, // Use as week/period
        subject: motamadAttendance,   // Use as subject
        topic: tajneedTotal           // Use as topic/summary
    };
}

// Helper to extract key fields from answers JSON for activities
function extractActivityFields(response) {
    const answers = response.answers || {};
    // Example: extract day, topic from answers (customize as needed)
    let day_of_week = '', topic = '';
    if (answers['Mohtamim Waqar e Amal']) {
        day_of_week = answers['Mohtamim Waqar e Amal']['No. of Majalis organised Waqar e Amal'] || '';
        topic = answers['Mohtamim Waqar e Amal']['Total Attendance'] || '';
    }
    return {
        day_of_week,
        topic
    };
}

// Fetch and display forecasts from new endpoint
async function loadForecasts() {
    try {
        const tbody = document.getElementById('forecasts-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Loading forecasts...</td></tr>';
        const res = await fetch('http://localhost:3000/api/questionnaire-responses?type=forecast&stage=admin');
        const allForecasts = await res.json();
        tbody.innerHTML = '';
        if (!allForecasts.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No forecasts found</td></tr>';
            return;
        }
        allForecasts.forEach(forecast => {
            const keyFields = extractForecastFields(forecast);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${keyFields.week_number || 'N/A'}</td>
                <td>${forecast.class_id || 'N/A'}</td>
                <td>${forecast.section || 'N/A'}</td>
                <td>${keyFields.subject || 'N/A'}</td>
                <td>${keyFields.topic || 'N/A'}</td>
                <td>
                    <span class="status-badge ${forecast.admin_review ? 'reviewed' : 'pending'}">
                        ${forecast.admin_review ? 'Reviewed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="edit-btn" onclick="openEditModal('forecast', ${forecast.id})">EDIT</button>
                    <button class="view-btn" onclick="openViewModal('forecast', ${forecast.id})">VIEW</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        updateFilterCounts('forecasts', allForecasts);
    } catch (error) {
        console.error('Error loading forecasts:', error);
        const tbody = document.getElementById('forecasts-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="error-state">Error loading forecasts. Please try again.</td></tr>';
        }
    }
}

// Fetch and display activities from new endpoint
async function loadActivities() {
    try {
        const tbody = document.getElementById('activities-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">Loading activities...</td></tr>';
        const res = await fetch('http://localhost:3000/api/questionnaire-responses?type=activity&stage=admin');
        const allActivities = await res.json();
        tbody.innerHTML = '';
        if (!allActivities.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No activities found</td></tr>';
            return;
        }
        allActivities.forEach(activity => {
            const keyFields = extractActivityFields(activity);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${keyFields.day_of_week || 'N/A'}</td>
                <td>${activity.class_id || 'N/A'}</td>
                <td>${activity.section || 'N/A'}</td>
                <td>${keyFields.topic || 'N/A'}</td>
                <td>
                    <span class="status-badge ${activity.admin_review ? 'reviewed' : 'pending'}">
                        ${activity.admin_review ? 'Reviewed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="edit-btn" onclick="openEditModal('activity', ${activity.id})">EDIT</button>
                    <button class="view-btn" onclick="openViewModal('activity', ${activity.id})">VIEW</button>
                </td>
            `;
            tbody.appendChild(row);
        });
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
        // Show loading state in modal elements
        const elements = {
            'modal-class': 'Loading...',
            'modal-section': 'Loading...',
            'modal-week_number': 'Loading...',
            'modal-subject': 'Loading...',
            'modal-topic': 'Loading...',
            'modal-subtopic': 'Loading...',
            'modal-material': 'Loading...',
            'modal-date': 'Loading...',
            'modal-created_at': 'Loading...',
            'modal-updated_at': 'Loading...'
        };
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        // Use the correct API functions from the api object
        let item;
<<<<<<< Updated upstream
        if (type === 'activity') {
            item = await api.getActivity(id);
=======
        try {
            item = type == 'activity' 
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
        if (type == 'forecast') {
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
>>>>>>> Stashed changes
        } else {
            item = await api.getForecast(id);
        }
        // Map backend data to modal fields
        const updatedElements = {
            'modal-class': item.class_name,
            'modal-section': item.section,
            'modal-week_number': item.week_number,
            'modal-subject': item.subject,
            'modal-topic': item.topic,
            'modal-subtopic': item.subtopic,
            'modal-material': item.material,
            'modal-date': item.date ? item.date.split('T')[0] : '',
            'modal-created_at': item.created_at ? item.created_at.split('T')[0] : '',
            'modal-updated_at': item.updated_at ? item.updated_at.split('T')[0] : ''
        };
        Object.entries(updatedElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = (value !== undefined && value !== null && value !== '') ? value : 'N/A';
            }
        });
        // Also populate input fields for edit mode
        if (document.getElementById('input-week_number')) document.getElementById('input-week_number').value = item.week_number || '';
        if (document.getElementById('input-subject')) document.getElementById('input-subject').value = item.subject || '';
        if (document.getElementById('input-topic')) document.getElementById('input-topic').value = item.topic || '';
        if (document.getElementById('input-subtopic')) document.getElementById('input-subtopic').value = item.subtopic || '';
        if (document.getElementById('input-material')) document.getElementById('input-material').value = item.material || '';
        if (document.getElementById('input-date')) document.getElementById('input-date').value = item.date ? item.date.split('T')[0] : '';
    } catch (error) {
        // Show error in modal elements
        const errorElements = {
            'modal-class': '---',
            'modal-section': '---',
            'modal-week_number': '---',
            'modal-subject': '---',
            'modal-topic': error.message || 'Error loading details',
            'modal-subtopic': type === 'forecast' 
                ? 'This forecast may have been deleted or not yet submitted.'
                : 'This activity may have been deleted or not yet submitted.',
            'modal-material': '---',
            'modal-date': '---',
            'modal-created_at': '---',
            'modal-updated_at': '---'
        };
        Object.entries(errorElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
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

// Add modal logic for EDIT and VIEW
// Helper to render all questionnaire data in a modal as a table
function renderQuestionnaireModal(answers, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    Object.entries(answers).forEach(([topic, questions]) => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'modal-topic';
        const topicTitle = document.createElement('h4');
        topicTitle.style.color = '#2563eb';
        topicTitle.style.fontSize = '1.15em';
        topicTitle.style.marginTop = '18px';
        topicTitle.textContent = topic;
        topicDiv.appendChild(topicTitle);
        // Create a table for questions/answers
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '18px';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const qth = document.createElement('th');
        qth.textContent = 'Question';
        qth.style.background = 'linear-gradient(90deg, #e3eaff, #f3f6fa)';
        qth.style.color = '#1741a6';
        qth.style.padding = '6px 10px';
        qth.style.textAlign = 'left';
        const ath = document.createElement('th');
        ath.textContent = 'Answer';
        ath.style.background = 'linear-gradient(90deg, #e3eaff, #f3f6fa)';
        ath.style.color = '#1741a6';
        ath.style.padding = '6px 10px';
        ath.style.textAlign = 'left';
        headerRow.appendChild(qth);
        headerRow.appendChild(ath);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        let rowIdx = 0;
        Object.entries(questions).forEach(([label, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Subfields: show each sub-question as a row
                Object.entries(value).forEach(([subLabel, subValue]) => {
                    const row = document.createElement('tr');
                    row.style.background = rowIdx % 2 === 0 ? '#f7faff' : '#fff';
                    const qCell = document.createElement('td');
                    qCell.textContent = label + ' - ' + subLabel;
                    qCell.style.fontWeight = 'bold';
                    qCell.style.padding = '6px 10px';
                    const aCell = document.createElement('td');
                    aCell.textContent = subValue;
                    aCell.style.padding = '6px 10px';
                    row.appendChild(qCell);
                    row.appendChild(aCell);
                    tbody.appendChild(row);
                    rowIdx++;
                });
            } else {
                const row = document.createElement('tr');
                row.style.background = rowIdx % 2 === 0 ? '#f7faff' : '#fff';
                const qCell = document.createElement('td');
                qCell.textContent = label;
                qCell.style.fontWeight = 'bold';
                qCell.style.padding = '6px 10px';
                const aCell = document.createElement('td');
                aCell.textContent = value;
                aCell.style.padding = '6px 10px';
                row.appendChild(qCell);
                row.appendChild(aCell);
                tbody.appendChild(row);
                rowIdx++;
            }
        });
        table.appendChild(tbody);
        topicDiv.appendChild(table);
        container.appendChild(topicDiv);
    });
}

// Update modal logic to show all questionnaire data as a table
async function openViewModal(type, id) {
    try {
        const modal = document.getElementById('review-modal');
        modal.style.display = 'block';
        // Fetch the response
        const res = await fetch(`http://localhost:3000/api/questionnaire-responses?type=${type === 'forecast' ? 'forecast' : 'activity'}`);
        const allResponses = await res.json();
        const item = allResponses.find(r => r.id === id || r.id === Number(id));
        if (!item) throw new Error('Item not found');
        // Parse answers if needed
        let parsedAnswers = item.answers;
        if (typeof parsedAnswers === 'string') {
            try {
                parsedAnswers = JSON.parse(parsedAnswers);
            } catch (e) {
                parsedAnswers = {};
            }
        }
        renderQuestionnaireModal(parsedAnswers, 'modal-questionnaire-content');
    } catch (error) {
        alert('Failed to load details.');
    }
}
// Helper to render questionnaire as editable table
function renderEditableQuestionnaireModal(answers, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    Object.entries(answers).forEach(([topic, questions]) => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'modal-topic';
        const topicTitle = document.createElement('h4');
        topicTitle.style.color = '#2563eb';
        topicTitle.style.fontSize = '1.15em';
        topicTitle.style.marginTop = '18px';
        topicTitle.textContent = topic;
        topicDiv.appendChild(topicTitle);
        // Create a table for questions/answers
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '18px';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const qth = document.createElement('th');
        qth.textContent = 'Question';
        qth.style.background = 'linear-gradient(90deg, #e3eaff, #f3f6fa)';
        qth.style.color = '#1741a6';
        qth.style.padding = '6px 10px';
        qth.style.textAlign = 'left';
        const ath = document.createElement('th');
        ath.textContent = 'Answer';
        ath.style.background = 'linear-gradient(90deg, #e3eaff, #f3f6fa)';
        ath.style.color = '#1741a6';
        ath.style.padding = '6px 10px';
        ath.style.textAlign = 'left';
        headerRow.appendChild(qth);
        headerRow.appendChild(ath);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        let rowIdx = 0;
        Object.entries(questions).forEach(([label, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Subfields: show each sub-question as a row
                Object.entries(value).forEach(([subLabel, subValue]) => {
                    const row = document.createElement('tr');
                    row.style.background = rowIdx % 2 === 0 ? '#f7faff' : '#fff';
                    const qCell = document.createElement('td');
                    qCell.textContent = label + ' - ' + subLabel;
                    qCell.style.fontWeight = 'bold';
                    qCell.style.padding = '6px 10px';
                    const aCell = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = subValue;
                    input.style.width = '100%';
                    input.style.padding = '4px 8px';
                    input.dataset.topic = topic;
                    input.dataset.label = label;
                    input.dataset.sublabel = subLabel;
                    aCell.appendChild(input);
                    aCell.style.padding = '6px 10px';
                    row.appendChild(qCell);
                    row.appendChild(aCell);
                    tbody.appendChild(row);
                    rowIdx++;
                });
            } else {
                const row = document.createElement('tr');
                row.style.background = rowIdx % 2 === 0 ? '#f7faff' : '#fff';
                const qCell = document.createElement('td');
                qCell.textContent = label;
                qCell.style.fontWeight = 'bold';
                qCell.style.padding = '6px 10px';
                const aCell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.style.width = '100%';
                input.style.padding = '4px 8px';
                input.dataset.topic = topic;
                input.dataset.label = label;
                aCell.appendChild(input);
                aCell.style.padding = '6px 10px';
                row.appendChild(qCell);
                row.appendChild(aCell);
                tbody.appendChild(row);
                rowIdx++;
            }
        });
        table.appendChild(tbody);
        topicDiv.appendChild(table);
        container.appendChild(topicDiv);
    });
}

// Open modal in edit mode
async function openEditModal(type, id) {
    try {
        const modal = document.getElementById('review-modal');
        modal.style.display = 'block';
        // Fetch the response
        const res = await fetch(`http://localhost:3000/api/questionnaire-responses?type=${type === 'forecast' ? 'forecast' : 'activity'}`);
        const allResponses = await res.json();
        console.log('Fetched responses:', allResponses);
        console.log('Looking for id:', id);
        const item = allResponses.find(r => r.id === id || r.id === Number(id));
        if (!item) throw new Error('Item not found');
        // Parse answers if needed
        let parsedAnswers = item.answers;
        if (typeof parsedAnswers === 'string') {
            try {
                parsedAnswers = JSON.parse(parsedAnswers);
            } catch (e) {
                parsedAnswers = {};
            }
        }
        // Render editable questionnaire
        renderEditableQuestionnaireModal(parsedAnswers, 'modal-questionnaire-content');
        // Add Save button
        const modalFooter = document.getElementById('modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `<button class="submit-btn" onclick="saveEditedAnswers('${type}', ${id})">Save</button>`;
        }
    } catch (error) {
        alert('Failed to load details.');
    }
}

// Save edited answers
window.saveEditedAnswers = async function(type, id) {
    // Collect all input values
    const inputs = document.querySelectorAll('#modal-questionnaire-content input');
    const updatedAnswers = {};
    inputs.forEach(input => {
        const topic = input.dataset.topic;
        const label = input.dataset.label;
        const sublabel = input.dataset.sublabel;
        if (!updatedAnswers[topic]) updatedAnswers[topic] = {};
        if (sublabel) {
            if (!updatedAnswers[topic][label]) updatedAnswers[topic][label] = {};
            updatedAnswers[topic][label][sublabel] = input.value;
        } else {
            updatedAnswers[topic][label] = input.value;
        }
    });
    // Send update to backend
    try {
        const res = await fetch(`http://localhost:3000/api/questionnaire-responses`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, answers: updatedAnswers })
        });
        if (!res.ok) throw new Error('Failed to save changes');
        alert('Answers updated successfully!');
        closeModal();
        // Optionally reload the table
        if (type === 'forecast') loadForecasts();
        else loadActivities();
    } catch (err) {
        alert('Failed to save changes.');
    }
};
// UpdateData for forecast to collect values from inputs
window.updateData = async function(type, id) {
    try {
        let updatePayload = {
            admin_review: true,
            reviewed_at: new Date().toISOString()
        };
        if (type === 'forecast') {
            updatePayload.week_number = document.getElementById('input-week_number').value;
            updatePayload.subject = document.getElementById('input-subject').value;
            updatePayload.topic = document.getElementById('input-topic').value;
            updatePayload.subtopic = document.getElementById('input-subtopic').value;
            updatePayload.material = document.getElementById('input-material').value;
            updatePayload.date = document.getElementById('input-date').value;
            await api.updateForecastStatus(id, updatePayload);
            await loadForecasts();
        } else if (type === 'activity') {
            // (You can add similar logic for activities if needed)
            await api.updateActivityStatus(id, updatePayload);
            await loadActivities();
        }
        closeModal();
        // Show success message
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message success';
        statusMessage.textContent = '✅ Data updated successfully!';
        document.body.appendChild(statusMessage);
        setTimeout(() => statusMessage.remove(), 3000);
    } catch (error) {
        console.error('Error updating data:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'status-message error';
        errorMessage.textContent = '❌ Error updating data. Please try again.';
        document.body.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
    }
};

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