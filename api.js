const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const baseUrl = 'http://localhost:3000/api';
    try {
        console.log(`Making API call to: ${baseUrl}${endpoint}`);
        const response = await fetch(`${baseUrl}${endpoint}`, options);
        
        // Log response status
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => {
                // If parsing JSON fails, create a more descriptive error
                return { 
                    error: `HTTP ${response.status} - ${response.statusText || 'Unknown error'}`,
                    details: `Failed to fetch from ${endpoint}`
                };
            });
            throw new Error(errorData.error || errorData.details || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`API call successful, data:`, data);
        return data;
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Helper functions
async function getAllClasses() {
    return apiCall('/classes');
}

async function getForecastsForClass(classId) {
    return apiCall(`/forecasts/${classId}`);
}

async function getActivitiesForClass(classId) {
    return apiCall(`/activities/${classId}`);
}

const api = {
    // Classes
    getClasses: async () => {
        return apiCall('/classes');
    },

    createClass: async (classData) => {
        return apiCall('/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
    },

    // Weekly Forecasts
    getForecasts: async (classId) => {
        try {
            return apiCall(`/forecasts/${classId}`);
        } catch (error) {
            console.error('Error fetching forecasts:', error);
            throw error;
        }
    },

    getForecast: async (id) => {
        try {
            console.log(`Fetching forecast with ID: ${id}`);
            const response = await apiCall(`/forecasts/${id}`);
            
            if (!response) {
                throw new Error(`Forecast with ID ${id} not found`);
            }
            
            // Validate the response structure
            if (!response.class_name || !response.week_number) {
                console.warn('Forecast data may be incomplete:', response);
            }
            
            return response;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            // Include more context in the error message
            throw new Error(`Failed to load forecast ${id}: ${error.message}`);
        }
    },

    createForecast: async (forecastData) => {
        return apiCall('/forecasts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(forecastData)
        });
    },

    updateForecastStatus: async (id, statusData) => {
        return apiCall(`/forecasts/${id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusData)
        });
    },

    // Weekly Activities
    getActivities: async (classId) => {
        try {
            return apiCall(`/activities/${classId}`);
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    },

    getActivity: async (id) => {
        return apiCall(`/activities/${id}`);
    },

    createActivity: async (activityData) => {
        return apiCall('/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityData)
        });
    },

    updateActivityStatus: async (id, statusData) => {
        return apiCall(`/activities/${id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusData)
        });
    },

    // Add these to the api object
    getAllClasses,
    getForecastsForClass,
    getActivitiesForClass
};

// Export the api object
window.api = api; 