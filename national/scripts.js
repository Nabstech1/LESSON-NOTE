// Review Modal Functionality
function initializeReviewModal() {
    const modal = document.getElementById('review-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const submitBtn = modal.querySelector('.submit-review-btn');
    const starBtns = modal.querySelectorAll('.star-btn');
    const templateBtns = modal.querySelectorAll('.template-btn');
    const feedbackInput = modal.querySelector('#feedback-input');
    
    let selectedRating = 0;
    let currentForecastId = null;
    
    // Close modal handlers
    function closeModal() {
        modal.style.display = 'none';
        resetModal();
    }
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    // Close if clicked outside modal
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    }
    
    // Star rating handlers
    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const rating = parseInt(btn.dataset.rating);
            selectedRating = rating;
            
            // Update stars visual state
            starBtns.forEach(star => {
                const starRating = parseInt(star.dataset.rating);
                if (starRating <= rating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        });
        
        // Hover effects
        btn.addEventListener('mouseover', () => {
            const rating = parseInt(btn.dataset.rating);
            starBtns.forEach(star => {
                const starRating = parseInt(star.dataset.rating);
                if (starRating <= rating) {
                    star.style.color = '#ffd700';
                }
            });
        });
        
        btn.addEventListener('mouseout', () => {
            starBtns.forEach(star => {
                const starRating = parseInt(star.dataset.rating);
                if (starRating <= selectedRating) {
                    star.style.color = '#ffd700';
                } else {
                    star.style.color = '#ddd';
                }
            });
        });
    });
    
    // Template button handlers
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            
            // Toggle active state
            templateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Add template text to feedback
            const currentFeedback = feedbackInput.value;
            feedbackInput.value = template + (currentFeedback ? '\n' + currentFeedback : '');
        });
    });
    
    // Submit handler
    submitBtn.addEventListener('click', async () => {
        if (selectedRating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }
        
        const feedback = feedbackInput.value.trim();
        if (!feedback) {
            alert('Please provide feedback before submitting.');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
            
            // Send review data to server
            const response = await fetch(`http://localhost:3000/api/forecasts/${currentForecastId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: selectedRating,
                    admin_feedback: feedback,
                    admin_review: true,
                    reviewed_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            // Show success message
            showStatusMessage('review-status', '✅ Review submitted successfully!', 'success');
            
            // Refresh the forecasts table
            await loadForecasts();
            
            // Close modal
            closeModal();
        } catch (error) {
            console.error('Error submitting review:', error);
            showStatusMessage('review-status', '❌ Failed to submit review. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Review';
        }
    });
    
    function resetModal() {
        selectedRating = 0;
        currentForecastId = null;
        starBtns.forEach(star => {
            star.classList.remove('active');
            star.style.color = '#ddd';
        });
        templateBtns.forEach(btn => btn.classList.remove('active'));
        feedbackInput.value = '';
    }
    
    return {
        show: function(forecastData) {
            currentForecastId = forecastData.id;
            // Populate forecast details
            const detailsContainer = modal.querySelector('.forecast-details');
            detailsContainer.innerHTML = `
                <div class="detail-item">
                    <strong>Week:</strong> ${forecastData.week_number}
                </div>
                <div class="detail-item">
                    <strong>Class:</strong> ${forecastData.class_name}
                </div>
                <div class="detail-item">
                    <strong>Section:</strong> ${forecastData.section}
                </div>
                <div class="detail-item">
                    <strong>Subject:</strong> ${forecastData.subject}
                </div>
                <div class="detail-item">
                    <strong>Topic:</strong> ${forecastData.topic}
                </div>
                <div class="detail-item">
                    <strong>Subtopic:</strong> ${forecastData.subtopic || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Material:</strong> ${forecastData.material || 'N/A'}
                </div>
            `;
            
            resetModal();
            modal.style.display = 'block';
        }
    };
}

// Initialize review modal when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const reviewModal = initializeReviewModal();
    
    // Example of opening the modal (you would call this when clicking a review button)
    window.openReviewModal = function(forecastData) {
        reviewModal.show(forecastData);
    };

    // Add PASS button logic for profile modal
    const changePassBtn = document.getElementById('changePassBtn');
    const profilePassModal = document.getElementById('profilePassModal');
    const profilePassModalBackdrop = document.getElementById('profilePassModalBackdrop');
    const profileModal = document.getElementById('profileModal');
    if (changePassBtn && profilePassModal && profilePassModalBackdrop && profileModal) {
        changePassBtn.onclick = function() {
            profileModal.style.display = 'none';
            profilePassModal.style.display = 'flex';
            profilePassModalBackdrop.style.display = 'block';
        };
    }
});

// Show status message function
function showStatusMessage(elementId, message, type) {
    const statusElement = document.createElement('div');
    statusElement.className = `status-message status-${type}`;
    statusElement.innerHTML = message;
    document.body.appendChild(statusElement);
    
    setTimeout(() => {
        statusElement.remove();
    }, 3000);
} 