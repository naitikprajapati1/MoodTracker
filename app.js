document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const saveButton = document.getElementById('save-mood');
    const dayView = document.getElementById('day-view');
    const weekView = document.getElementById('week-view');
    const monthView = document.getElementById('month-view');
    const dayViewBtn = document.getElementById('day-view-btn');
    const weekViewBtn = document.getElementById('week-view-btn');
    const monthViewBtn = document.getElementById('month-view-btn');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const currentMonthElement = document.getElementById('current-month');
    const calendarContainer = document.getElementById('calendar-container');
    
    // State variables
    let selectedMood = null;
    let moodEntries = [];
    let currentViewDate = new Date();
    
    // Load mood entries from localStorage
    const loadMoodEntries = () => {
        const storedEntries = localStorage.getItem('moodEntries');
        moodEntries = storedEntries ? JSON.parse(storedEntries) : [];
    };
    
    // Save mood entries to localStorage
    const saveMoodEntries = () => {
        localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    };
    
    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Get today's date string (YYYY-MM-DD format)
    const getTodayString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };
    
    // Get emoji based on mood name
    const getMoodEmoji = (mood) => {
        const moodMap = {
            'happy': '😊',
            'excited': '😃',
            'neutral': '😐',
            'sad': '😔',
            'angry': '😠',
            'anxious': '😰',
            'tired': '😴',
            'loved': '🥰'
        };
        return moodMap[mood] || '❓';
    };
    
    // Event Listeners for emoji selection
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deselect all buttons
            emojiButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Select clicked button
            button.classList.add('selected');
            
            // Set selected mood
            selectedMood = button.getAttribute('data-mood');
        });
    });
    
    // Save mood event
    saveButton.addEventListener('click', () => {
        if (!selectedMood) {
            alert('Please select a mood!');
            return;
        }
        
        const today = getTodayString();
        
        // Check if we already have an entry for today
        const existingEntryIndex = moodEntries.findIndex(entry => entry.date === today);
        
        if (existingEntryIndex !== -1) {
            // Update existing entry
            moodEntries[existingEntryIndex].mood = selectedMood;
        } else {
            // Add new entry
            moodEntries.push({
                date: today,
                mood: selectedMood,
            });
        }
        
        // Save to localStorage
        saveMoodEntries();
        
        // Reset form
        emojiButtons.forEach(btn => btn.classList.remove('selected'));
        selectedMood = null;
        
        // Refresh views
        renderDayView();
        renderWeekView();
        renderMonthView();
        
        alert('Mood saved successfully!');
    });
    
    // View toggle events
    dayViewBtn.addEventListener('click', () => {
        dayViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        monthViewBtn.classList.remove('active');
        
        dayView.style.display = 'flex';
        weekView.style.display = 'none';
        monthView.style.display = 'none';
    });
    
    weekViewBtn.addEventListener('click', () => {
        dayViewBtn.classList.remove('active');
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        
        dayView.style.display = 'none';
        weekView.style.display = 'flex';
        monthView.style.display = 'none';
        
        renderWeekView();
    });
    
    monthViewBtn.addEventListener('click', () => {
        dayViewBtn.classList.remove('active');
        weekViewBtn.classList.remove('active');
        monthViewBtn.classList.add('active');
        
        dayView.style.display = 'none';
        weekView.style.display = 'none';
        monthView.style.display = 'block';
        
        renderMonthView();
    });
    
    // Month navigation
    prevMonthBtn.addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
        renderMonthView();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
        renderMonthView();
    });
    
    // Render day view (timeline)
    const renderDayView = () => {
        dayView.innerHTML = '';
        
        if (moodEntries.length === 0) {
            dayView.innerHTML = '<p>No mood entries yet. Start tracking today!</p>';
            return;
        }
        
        // Sort entries by date (newest first)
        const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'mood-entry';
            
            const dateObj = new Date(entry.date);
            
            entryElement.innerHTML = `
                <div class="date">${formatDate(dateObj)}</div>
                <div class="emoji">${getMoodEmoji(entry.mood)}</div>
                <button class="delete-btn" data-date="${entry.date}">❌</button>
            `;
            
            dayView.appendChild(entryElement);
        });
        
        // Add delete functionality
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dateToDelete = e.target.getAttribute('data-date');
                moodEntries = moodEntries.filter(entry => entry.date !== dateToDelete);
                saveMoodEntries();
                renderDayView();
                renderWeekView();
                renderMonthView();
            });
        });
    };
    
    // Render week view
    const renderWeekView = () => {
        weekView.innerHTML = '';
        
        if (moodEntries.length === 0) {
            weekView.innerHTML = '<p>No mood entries yet. Start tracking today!</p>';
            return;
        }
        
        // Get current week dates
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            
            const dayString = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
            const entry = moodEntries.find(e => e.date === dayString);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'weekly-day';
            
            const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = currentDay.getDate();
            
            if (entry) {
                dayElement.innerHTML = `
                    <div class="day-label">${dayName}</div>
                    <div class="day-number">${dayNumber}</div>
                    <div class="weekly-emoji">${getMoodEmoji(entry.mood)}</div>
                    
                `;
            } else {
                dayElement.innerHTML = `
                    <div class="day-label">${dayName}</div>
                    <div class="day-number">${dayNumber}</div>
                    <div class="weekly-emoji">➖</div>
                `;
            }
            
            weekView.appendChild(dayElement);
        }
    };
    
    // Render month view (calendar)
    const renderMonthView = () => {
        calendarContainer.innerHTML = '';
        
        // Update current month display
        currentMonthElement.textContent = currentViewDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        // Get first day of the month
        const firstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
        const lastDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);
        const startingDay = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Create calendar grid
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days = 42
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Calculate the actual date for this cell
            const currentDate = new Date(firstDay);
            currentDate.setDate(currentDate.getDate() + (i - startingDay));
            
            // Check if this date is in the current month
            if (currentDate.getMonth() === currentViewDate.getMonth()) {
                const dayNumber = currentDate.getDate();
                const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                
                // Find mood entry for this date
                const entry = moodEntries.find(e => e.date === dateString);
                
                dayElement.innerHTML = `
                    <div class="day-number">${dayNumber}</div>
                    ${entry ? `<div class="calendar-emoji">${getMoodEmoji(entry.mood)}</div>` : ''}
                `;
                
                // Highlight today's date
                if (dateString === getTodayString()) {
                    dayElement.classList.add('today');
                }
            }
            
            calendarContainer.appendChild(dayElement);
        }
    };
    
    // Initial load
    loadMoodEntries();
    renderDayView();
    renderMonthView();
});