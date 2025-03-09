const API_URL = 'http://localhost:3000/api';

// Sample data
const classes = [
    { class_name: 'CLASS 1', section: 'A' },
    { class_name: 'CLASS 2', section: 'B' },
    { class_name: 'NURSERY', section: 'SINGLE' }
];

const forecasts = [
    {
        class_id: 1,
        week_number: 'Week 1',
        subject: 'Mathematics',
        topic: 'Addition and Subtraction',
        subtopic: 'Adding Single Digit Numbers',
        material: 'Textbook Chapter 1, Number Cards',
        date: '2024-03-15'
    },
    {
        class_id: 1,
        week_number: 'Week 2',
        subject: 'English',
        topic: 'Reading Comprehension',
        subtopic: 'Understanding Main Ideas',
        material: 'Story Book: "The Little Red Hen"',
        date: '2024-03-22'
    },
    {
        class_id: 2,
        week_number: 'Week 1',
        subject: 'Science',
        topic: 'Living Things',
        subtopic: 'Plants and Animals',
        material: 'Science Lab Kit, Plant Specimens',
        date: '2024-03-15'
    },
    {
        class_id: 3,
        week_number: 'Week 1',
        subject: 'Art and Craft',
        topic: 'Colors',
        subtopic: 'Primary Colors',
        material: 'Paint Set, Drawing Paper',
        date: '2024-03-15'
    }
];

// Function to add classes
async function addClasses() {
    console.log('Adding classes...');
    for (const classData of classes) {
        try {
            const response = await fetch(`${API_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(classData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`Added class: ${result.class_name} ${result.section}`);
        } catch (error) {
            console.error('Error adding class:', error.message);
        }
    }
}

// Function to add forecasts
async function addForecasts() {
    console.log('Adding forecasts...');
    for (const forecast of forecasts) {
        try {
            const response = await fetch(`${API_URL}/forecasts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(forecast)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`Added forecast: ${result.subject} for ${result.week_number}`);
        } catch (error) {
            console.error('Error adding forecast:', error.message);
        }
    }
}

// Run the script
async function run() {
    try {
        await addClasses();
        await addForecasts();
        console.log('Test data added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running script:', error);
        process.exit(1);
    }
}

run(); 