        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful');
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }

        class MealPlanner {
            constructor() {
                this.meals = [];
                this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                
                // DOM Elements
                this.generatePlanBtn = document.getElementById('generatePlanBtn');
                this.copyToNotesBtn = document.getElementById('copyToNotesBtn');
                this.weeklyPlan = document.getElementById('weeklyPlan');

                // Initialize
                this.loadMeals();
                this.bindEvents();
            }

            async loadMeals() {
                try {
                    const response = await fetch('meals.json');
                    const data = await response.json();
                    this.meals = data.meals;
                } catch (error) {
                    console.error('Error loading meals:', error);
                    alert('Failed to load meals. Please check the meals.json file.');
                }
            }

            bindEvents() {
                // Generate plan button
                this.generatePlanBtn.addEventListener('click', () => this.generateWeeklyPlan());
                // Copy to notes button
                this.copyToNotesBtn.addEventListener('click', () => this.copyToNotes());
            }

            generateWeeklyPlan() {
                // Ensure meals are loaded
                if (this.meals.length === 0) {
                    alert('Meals are not loaded. Please check the JSON file.');
                    return;
                }

                // Clear previous plan
                this.weeklyPlan.innerHTML = '';

                // Create a copy of meals to avoid repeating the same meal
                let availableMeals = [...this.meals];

                // Generate plan for 7 days
                this.days.forEach(day => {
                    // If no meals left, reset available meals
                    if (availableMeals.length === 0) {
                        availableMeals = [...this.meals];
                    }

                    // Select a random meal
                    const randomIndex = Math.floor(Math.random() * availableMeals.length);
                    const selectedMeal = availableMeals.splice(randomIndex, 1)[0];
                    
                    const dayPlan = document.createElement('div');
                    dayPlan.classList.add('day-plan');
                    dayPlan.innerHTML = `
                        <div class="day-name">${day}</div>
                        <div class="meal-name">${selectedMeal}</div>
                    `;
                    
                    this.weeklyPlan.appendChild(dayPlan);
                });
            }

            async copyToNotes() {
                const dayPlans = this.weeklyPlan.getElementsByClassName('day-plan');
                if (dayPlans.length === 0) {
                    alert('Please generate a meal plan first!');
                    return;
                }

                let notesText = '🍽️ Weekly Meal Plan\n\n';
                
                Array.from(dayPlans).forEach(dayPlan => {
                    const day = dayPlan.querySelector('.day-name').textContent;
                    const meal = dayPlan.querySelector('.meal-name').textContent;
                    notesText += `${day}: ${meal}\n`;
                });

                try {
                    // Modern clipboard API method
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(notesText);
                        alert('✅ Meal plan copied to clipboard! You can now paste it into Apple Notes.');
                        return;
                    }

                    // Fallback method using document.execCommand
                    const textarea = document.createElement('textarea');
                    textarea.value = notesText;
                    textarea.style.position = 'fixed';  // Prevent scrolling to bottom
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            alert('✅ Meal plan copied to clipboard! You can now paste it into Apple Notes.');
                        } else {
                            throw new Error('Copy command was unsuccessful');
                        }
                    } finally {
                        document.body.removeChild(textarea);
                    }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    // As a final fallback, show the text in a prompt that the user can copy from
                    const shouldCopy = confirm('Could not access clipboard. Press OK to see the meal plan text to copy manually.');
                    if (shouldCopy) {
                        prompt('Copy this text:', notesText);
                    }
                }
            }
        }

        // Initialize the app when DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            new MealPlanner();
        });