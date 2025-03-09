function showStatusMessage(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';
    statusElement.innerHTML = message;
    
    if (type !== 'loading') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

function saveGoal() {
    const goal = document.getElementById('goal').value;
    const deadline = document.getElementById('deadline').value;
    const priority = document.getElementById('priority').value;
    
    if(goal && deadline) {
        // Show loading state
        showStatusMessage('goal-status', '<span class="loading-spinner"></span>Saving your goal...', 'loading');
        
        // Simulate API call with setTimeout
        setTimeout(() => {
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            goalElement.innerHTML = `
                <div>
                    <h3>${goal}</h3>
                    <p>Due: ${deadline}</p>
                </div>
                <span class="priority-badge ${priority}">${priority}</span>
            `;
            
            document.getElementById('goals-list').appendChild(goalElement);
            
            // Show success message
            showStatusMessage('goal-status', '✅ Goal added successfully!', 'success');
            
            // Clear form
            document.getElementById('goal').value = '';
            document.getElementById('deadline').value = '';
            document.getElementById('priority').value = 'medium';
        }, 1000); // Simulate 1s delay
    } else {
        showStatusMessage('goal-status', '❌ Please fill in all fields', 'error');
    }
}

// Function to populate form with existing week data
function populateFormWithWeekData(week) {
    const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        if (cells[0].textContent === week) {
            // Found the matching week, populate form fields
            document.getElementById('assignment-week').value = week;
            document.getElementById('assignment-subject').value = cells[1].textContent;
            document.getElementById('assignment-topic').value = cells[2].textContent;
            document.getElementById('assignment-subtopic').value = cells[3].textContent;
            document.getElementById('assignment-material').value = cells[4].textContent;
            document.getElementById('assignment-date').value = cells[5].textContent;
            
            // Change button text to indicate editing mode
            const addButton = document.querySelector('.add-forecast .primary-btn');
            addButton.textContent = 'Update Forecast';
            addButton.setAttribute('data-editing', 'true');
            break;
        }
    }
}

// Function to handle week selection
function handleWeekSelection(event) {
    const selectedWeek = event.target.value;
    if (selectedWeek) {
        const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
        const rows = table.getElementsByTagName('tr');
        
        for (let row of rows) {
            if (row.cells[0].textContent === selectedWeek) {
                populateFormWithWeekData(selectedWeek);
                return;
            }
        }
        
        // If week not found, reset form for new entry
        resetForm();
    }
}

// Function to reset form
function resetForm() {
    document.getElementById('assignment-subject').value = '';
    document.getElementById('assignment-topic').value = '';
    document.getElementById('assignment-subtopic').value = '';
    document.getElementById('assignment-material').value = '';
    document.getElementById('assignment-date').value = '';
    
    const addButton = document.querySelector('.add-forecast .primary-btn');
    addButton.textContent = 'Add Forecast';
    addButton.removeAttribute('data-editing');
}

function addAssignment() {
    const selectedClass = document.getElementById('class-select').value;
    const selectedSection = document.getElementById('section-select').value;
    if (!selectedClass || !selectedSection) {
        showStatusMessage('assignment-status', '❌ Please select both class and section first', 'error');
        return;
    }

    const week = document.getElementById('assignment-week').value;
    const subject = document.getElementById('assignment-subject').value;
    const topic = document.getElementById('assignment-topic').value;
    const subtopic = document.getElementById('assignment-subtopic').value;
    const material = document.getElementById('assignment-material').value;
    const date = document.getElementById('assignment-date').value;
    
    if(!week || !subject || !topic || !subtopic || !material || !date) {
        showStatusMessage('assignment-status', '❌ Please fill in all fields', 'error');
        return;
    }

    showStatusMessage('assignment-status', '<span class="loading-spinner"></span>Processing forecast...', 'loading');
    
    setTimeout(() => {
        const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
        const rows = table.getElementsByTagName('tr');
        let existingRow = null;
        
        for (let row of rows) {
            if (row.cells[0].textContent === week) {
                existingRow = row;
                break;
            }
        }
        
        const newRowHTML = `
            <td>${week}</td>
            <td>${subject}</td>
            <td>${topic}</td>
            <td>${subtopic}</td>
            <td>${material}</td>
            <td>${date}</td>
            <td>Incomplete</td>
        `;
        
        if (existingRow) {
            existingRow.innerHTML = newRowHTML;
            showStatusMessage('assignment-status', '✅ Forecast updated successfully!', 'success');
        } else {
            const row = table.insertRow();
            row.innerHTML = newRowHTML;
            showStatusMessage('assignment-status', '✅ Forecast added successfully!', 'success');
        }
        
        // Enable submit button when there's data
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.removeAttribute('disabled');
        }
        
        resetForm();
    }, 1000);
}

// Function to enable submit button when there's data
function updateSubmitButton() {
    const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
    const submitBtn = document.querySelector('.submit-btn');
    
    if (submitBtn) {
        if (table && table.rows.length > 0) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'disabled');
        }
    }
}

// Function to populate form with existing week data
function populateActivityFormWithWeekData(day) {
    const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        if (cells[0].textContent === day) {
            // Found the matching day, populate form fields
            document.getElementById('assignment-week').value = day;
            document.getElementById('assignment-topic').value = cells[1].textContent;
            document.getElementById('assignment-subtopic').value = cells[2].textContent;
            document.getElementById('assignment-rpk').value = cells[3].textContent;
            document.getElementById('assignment-objectives').value = cells[4].textContent;
            document.getElementById('assignment-material').value = cells[5].textContent;
            
            // Change button text to indicate editing mode
            const addButton = document.querySelector('.add-forecast .primary-btn');
            addButton.textContent = 'Update Activity';
            addButton.setAttribute('data-editing', 'true');
            break;
        }
    }
}

function handleActivityWeekSelection(event) {
    const selectedDay = event.target.value;
    if (selectedDay) {
        const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
        const rows = table.getElementsByTagName('tr');
        
        for (let row of rows) {
            if (row.cells[0].textContent === selectedDay) {
                populateActivityFormWithWeekData(selectedDay);
                return;
            }
        }
        
        // If day not found, reset form for new entry
        resetActivityForm();
    }
}

function resetActivityForm() {
    const fields = [
        'activity-day',
        'activity-topic',
        'activity-subtopic',
        'activity-rpk',
        'activity-objectives',
        'activity-material'
    ];
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
        }
    });
    
    const addButton = document.querySelector('.add-forecast .primary-btn');
    if (addButton) {
        addButton.textContent = 'Add Activity';
        addButton.removeAttribute('data-editing');
    }
}

// Store data for different classes
let classData = {};

// Function to handle class and section selection
function handleClassSelection() {
    const selectedClass = document.getElementById('class-select')?.value;
    const selectedSection = document.getElementById('section-select')?.value;
    
    const formFields = [
        'activity-day',
        'activity-topic',
        'activity-subtopic',
        'activity-rpk',
        'activity-objectives',
        'activity-material'
    ];
    
    // Enable/disable form fields based on class and section selection
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (selectedClass && selectedSection) {
                field.disabled = false;
                field.value = field.value || ''; // Preserve existing values
            } else {
                field.disabled = true;
                field.value = '';
            }
        }
    });
    
    // Update the selected class display
    const selectedClassDisplay = document.querySelector('.selected-class');
    if (selectedClassDisplay) {
        if (selectedClass && selectedSection) {
            const displayText = selectedSection === 'SINGLE' ? selectedClass : `${selectedClass} ${selectedSection}`;
            selectedClassDisplay.textContent = displayText;
            selectedClassDisplay.style.display = 'block';
        } else {
            selectedClassDisplay.textContent = '';
            selectedClassDisplay.style.display = 'none';
        }
    }

    // Clear the table when class/section changes
    const tbody = document.querySelector('#assignments-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
    }

    // Reset form fields only if class or section changes
    if (!selectedClass || !selectedSection) {
        resetActivityForm();
    }

    // Update submit button state
    updateSubmitButton();
}

function addActivity() {
    const selectedClass = document.getElementById('class-select')?.value;
    const selectedSection = document.getElementById('section-select')?.value;

    if (!selectedClass || !selectedSection) {
        showStatusMessage('assignment-status', '❌ Please select a class and section first', 'error');
        return;
    }

    // Get all form field values and trim them
    const fields = {
        day: document.getElementById('activity-day')?.value || '',
        topic: document.getElementById('activity-topic')?.value?.trim() || '',
        subtopic: document.getElementById('activity-subtopic')?.value?.trim() || '',
        rpk: document.getElementById('activity-rpk')?.value?.trim() || '',
        objectives: document.getElementById('activity-objectives')?.value?.trim() || '',
        material: document.getElementById('activity-material')?.value?.trim() || ''
    };

    // Log the values for debugging
    console.log('Form field values:', fields);

    // Check for empty fields
    const emptyFields = Object.entries(fields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (emptyFields.length > 0) {
        showStatusMessage('assignment-status', `❌ Please fill in all fields (missing: ${emptyFields.join(', ')})`, 'error');
        return;
    }

    // Get the table body
    const tbody = document.querySelector('#assignments-table tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    // Check if a row for this day already exists
    let existingRow = Array.from(tbody.getElementsByTagName('tr'))
        .find(row => row.cells[0].textContent === fields.day);

    // Create table cell content
    const cellContent = [
        fields.day,
        fields.topic,
        fields.subtopic,
        fields.rpk,
        fields.objectives,
        fields.material,
        'Incomplete'
    ];

    if (existingRow) {
        // Update existing row
        for (let i = 0; i < cellContent.length; i++) {
            existingRow.cells[i].textContent = cellContent[i];
        }
        showStatusMessage('assignment-status', '✅ Activity updated successfully', 'success');
    } else {
        // Create new row
        const newRow = tbody.insertRow();
        cellContent.forEach(content => {
            const cell = newRow.insertCell();
            cell.textContent = content;
        });
        showStatusMessage('assignment-status', '✅ Activity added successfully', 'success');
    }

    // Enable submit button since we have data
    const submitButton = document.querySelector('.submit-btn');
    if (submitButton) {
        submitButton.disabled = false;
    }

    // Clear form fields
    document.getElementById('activity-day').value = '';
    document.getElementById('activity-topic').value = '';
    document.getElementById('activity-subtopic').value = '';
    document.getElementById('activity-rpk').value = '';
    document.getElementById('activity-objectives').value = '';
    document.getElementById('activity-material').value = '';
}

// Function to submit forecast data
function submitForecastData() {
    const selectedClass = document.getElementById('class-select').value;
    const selectedSection = document.getElementById('section-select').value;
    const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];
    
    // Show loading state
    showStatusMessage('assignment-status', '<span class="loading-spinner"></span>Submitting forecast data...', 'loading');

    // First, try to find or create the class
    fetch('http://localhost:3000/api/classes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            class_name: selectedClass,
            section: selectedSection // The section value will be normalized on the server
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create/find class');
        }
        return response.json();
    })
    .then(classObj => {
        if (!classObj || !classObj.id) {
            throw new Error('Invalid class data received');
        }

        console.log('Class created/found:', classObj);

        // Collect all rows data
        const forecasts = Array.from(table.rows).map(row => {
            const cells = row.cells;
            return {
                class_id: classObj.id,
                week_number: cells[0].textContent,
                subject: cells[1].textContent,
                topic: cells[2].textContent,
                subtopic: cells[3].textContent,
                material: cells[4].textContent,
                date: cells[5].textContent,
                status: cells[6].textContent
            };
        });

        // Submit each forecast
        return Promise.all(forecasts.map(forecast => 
            fetch('http://localhost:3000/api/forecasts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(forecast)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit forecast');
                }
                return response.json();
            })
        ));
    })
    .then(() => {
        showStatusMessage('assignment-status', '✅ Forecast data submitted successfully!', 'success');
        
        // Reset the form and table
        table.innerHTML = '';
        resetForm();
        document.getElementById('class-select').value = '';
        document.getElementById('section-select').value = '';
        updateSubmitButton();
        
        // Disable form inputs
        const formInputs = document.querySelectorAll('.add-forecast input, .add-forecast select');
        formInputs.forEach(input => input.setAttribute('disabled', 'disabled'));
    })
    .catch(error => {
        console.error('Error:', error);
        showStatusMessage('assignment-status', `❌ Error: ${error.message}`, 'error');
    });
}

// Function to submit activity data
async function submitActivityData() {
    const selectedClass = document.getElementById('class-select').value;
    const selectedSection = document.getElementById('section-select').value;
    const table = document.getElementById('assignments-table').getElementsByTagName('tbody')[0];

    if (!selectedClass || !selectedSection) {
        showStatusMessage('assignment-status', '❌ Please select both class and section', 'error');
        return;
    }

    if (!table.rows.length) {
        showStatusMessage('assignment-status', '❌ No activities to submit', 'error');
        return;
    }

    // Show loading state
    showStatusMessage('assignment-status', '<span class="loading-spinner"></span>Submitting activity data...', 'loading');

    try {
        // First create/get the class
        const classResponse = await fetch('http://localhost:3000/api/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                class_name: selectedClass,
                section: selectedSection
            })
        });

        if (!classResponse.ok) {
            throw new Error('Failed to create/get class');
        }

        const classObj = await classResponse.json();
        console.log('Class created/found:', classObj);

        // Collect all rows data and submit each activity
        const activities = Array.from(table.rows).map(row => {
            const cells = row.cells;
            return {
                class_id: classObj.id,
                day_of_week: cells[0].textContent,
                topic: cells[1].textContent,
                subtopic: cells[2].textContent,
                rpk: cells[3].textContent,
                objectives: cells[4].textContent,
                material: cells[5].textContent,
                status: 'Incomplete'
            };
        });

        // Submit each activity
        await Promise.all(activities.map(activity =>
            fetch('http://localhost:3000/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activity)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit activity');
                }
                return response.json();
            })
        ));

        // Show success message
        showStatusMessage('assignment-status', '✅ Activity data submitted successfully!', 'success');
        
        // Reset the form and table
        table.innerHTML = '';
        resetActivityForm();
        document.getElementById('class-select').value = '';
        document.getElementById('section-select').value = '';
        updateSubmitButton();
        
        // Disable form inputs
        const formInputs = document.querySelectorAll('.add-forecast input, .add-forecast select');
        formInputs.forEach(input => input.setAttribute('disabled', 'disabled'));

    } catch (error) {
        console.error('Error submitting activity data:', error);
        showStatusMessage('assignment-status', '❌ Error submitting activity data. Please try again.', 'error');
    }
}

// Function to switch between forecast and activity responses tabs
function showTab(tabId) {
    // Hide all response sections
    document.querySelectorAll('.response-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section and activate its tab
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Function to load responses for the selected class
async function loadResponses(classId) {
    try {
        // Load forecast responses
        const forecastResponses = await api.getForecasts(classId);
        displayForecastResponses(forecastResponses);
        
        // Load activity responses
        const activityResponses = await api.getActivities(classId);
        displayActivityResponses(activityResponses);
    } catch (error) {
        console.error('Error loading responses:', error);
        showStatusMessage('response-status', '❌ Error loading responses', 'error');
    }
}

// Function to display forecast responses
function displayForecastResponses(responses) {
    const tbody = document.getElementById('forecast-responses-body');
    tbody.innerHTML = '';
    
    responses.forEach(response => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${response.week_number}</td>
            <td>${response.subject}</td>
            <td>${new Date(response.created_at).toLocaleDateString()}</td>
            <td>
                <span class="review-status ${response.admin_review ? 'status-reviewed' : 'status-pending'}">
                    ${response.admin_review ? 'Reviewed' : 'Pending'}
                </span>
            </td>
            <td>
                <div class="rating">
                    ${response.rating ? '⭐'.repeat(response.rating) : 'Not Rated'}
                </div>
            </td>
            <td class="admin-feedback">${response.admin_feedback || 'No feedback yet'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to display activity responses
function displayActivityResponses(responses) {
    const tbody = document.getElementById('activity-responses-body');
    tbody.innerHTML = '';
    
    responses.forEach(response => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${response.day_of_week}</td>
            <td>${response.topic}</td>
            <td>${new Date(response.created_at).toLocaleDateString()}</td>
            <td>
                <span class="review-status ${response.admin_review ? 'status-reviewed' : 'status-pending'}">
                    ${response.admin_review ? 'Reviewed' : 'Pending'}
                </span>
            </td>
            <td>
                <div class="rating">
                    ${response.rating ? '⭐'.repeat(response.rating) : 'Not Rated'}
                </div>
            </td>
            <td class="admin-feedback">${response.admin_feedback || 'No feedback yet'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add Activity button handler
    const addActivityBtn = document.getElementById('add-activity');
    if (addActivityBtn) {
        // Remove any existing onclick attribute
        addActivityBtn.removeAttribute('onclick');
        // Add click event listener
        addActivityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedDay = document.getElementById('activity-day')?.value;
            if (!selectedDay) {
                showStatusMessage('assignment-status', '❌ Please select a day first', 'error');
                return;
            }
            addActivity();
        });
    }

    // Class and Section selection handlers
    const classSelect = document.getElementById('class-select');
    const sectionSelect = document.getElementById('section-select');
    
    if (classSelect) classSelect.addEventListener('change', handleClassSelection);
    if (sectionSelect) sectionSelect.addEventListener('change', handleClassSelection);

    // Day selection handler
    const daySelect = document.getElementById('activity-day');
    if (daySelect) {
        daySelect.addEventListener('change', function(e) {
            const selectedDay = e.target.value;
            if (!selectedDay) return;

            const tbody = document.querySelector('#assignments-table tbody');
            if (!tbody) return;

            const existingRow = Array.from(tbody.getElementsByTagName('tr'))
                .find(row => row.cells[0].textContent === selectedDay);
            
            if (existingRow) {
                // Populate form with existing data
                document.getElementById('activity-topic').value = existingRow.cells[1].textContent;
                document.getElementById('activity-subtopic').value = existingRow.cells[2].textContent;
                document.getElementById('activity-rpk').value = existingRow.cells[3].textContent;
                document.getElementById('activity-objectives').value = existingRow.cells[4].textContent;
                document.getElementById('activity-material').value = existingRow.cells[5].textContent;
            } else {
                // Clear form for new entry but keep selected day
                resetActivityForm();
                document.getElementById('activity-day').value = selectedDay;
            }
        });
    }

    // Initialize all form fields as disabled
    const formFields = [
        'activity-day',
        'activity-topic',
        'activity-subtopic',
        'activity-rpk',
        'activity-objectives',
        'activity-material'
    ];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.disabled = true;
    });

    // Initial state setup
    handleClassSelection();
}); 