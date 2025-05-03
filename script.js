document.addEventListener('DOMContentLoaded', function() {
    const reminderTitle = document.getElementById('reminder-title');
    const reminderTime = document.getElementById('reminder-time');
    const addBtn = document.getElementById('add-btn');
    const remindersList = document.getElementById('reminders-list');
    
    // Set default time to current time + 1 hour
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    reminderTime.value = defaultTime.toISOString().slice(0, 16);
    
    // Load reminders from localStorage
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    
    // Display reminders
    function displayReminders() {
        remindersList.innerHTML = '';
        
        if (reminders.length === 0) {
            remindersList.innerHTML = '<p class="no-reminders">No reminders set. Add one above!</p>';
            return;
        }
        
        // Sort reminders by time
        reminders.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        reminders.forEach((reminder, index) => {
            const reminderItem = document.createElement('div');
            reminderItem.classList.add('reminder-item');
            
            if (reminder.completed) {
                reminderItem.classList.add('completed');
            }
            
            const reminderDate = new Date(reminder.time);
            const formattedDate = reminderDate.toLocaleString();
            
            reminderItem.innerHTML = `
                <div class="reminder-info">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-time">${formattedDate}</div>
                </div>
                <div class="reminder-actions">
                    <button class="complete-btn" data-index="${index}">
                        <i class="fas ${reminder.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            remindersList.appendChild(reminderItem);
        });
        
        // Add event listeners to delete and complete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                reminders.splice(index, 1);
                saveReminders();
                displayReminders();
            });
        });
        
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                reminders[index].completed = !reminders[index].completed;
                saveReminders();
                displayReminders();
            });
        });
    }
    
    // Save reminders to localStorage
    function saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
    
    // Add new reminder
    addBtn.addEventListener('click', function() {
        const title = reminderTitle.value.trim();
        const time = reminderTime.value;
        
        if (!title) {
            alert('Please enter a reminder title');
            return;
        }
        
        if (!time) {
            alert('Please select a time for your reminder');
            return;
        }
        
        const reminder = {
            title: title,
            time: time,
            completed: false
        };
        
        reminders.push(reminder);
        saveReminders();
        displayReminders();
        
        // Clear input fields
        reminderTitle.value = '';
        
        // Set default time to current time + 1 hour
        const defaultTime = new Date();
        defaultTime.setHours(defaultTime.getHours() + 1);
        reminderTime.value = defaultTime.toISOString().slice(0, 16);
        
        // Schedule notification
        scheduleNotification(reminder);
    });
    
    // Schedule notification
    function scheduleNotification(reminder) {
        const now = new Date().getTime();
        const reminderTime = new Date(reminder.time).getTime();
        
        if (reminderTime > now) {
            const timeUntilReminder = reminderTime - now;
            
            setTimeout(() => {
                // Check if browser supports notifications
                if ('Notification' in window) {
                    // Check if permission is granted
                    if (Notification.permission === 'granted') {
                        new Notification('Reminder', {
                            body: reminder.title,
                            icon: 'https://cdn-icons-png.flaticon.com/512/2645/2645883.png'
                        });
                    } 
                    // If permission hasn't been requested yet
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                new Notification('Reminder', {
                                    body: reminder.title,
                                    icon: 'https://cdn-icons-png.flaticon.com/512/2645/2645883.png'
                                });
                            }
                        });
                    }
                }
                
                // Play sound
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                audio.play();
                
            }, timeUntilReminder);
        }
    }
    
    // Request notification permission when page loads
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // Check for due reminders
    function checkDueReminders() {
        const now = new Date();
        
        reminders.forEach(reminder => {
            const reminderTime = new Date(reminder.time);
            
            // If reminder is due and not completed
            if (reminderTime <= now && !reminder.completed) {
                // Mark as completed
                reminder.completed = true;
                saveReminders();
                displayReminders();
            }
        });
    }
    
    // Check for due reminders every minute
    setInterval(checkDueReminders, 60000);
    
    // Initial display
    displayReminders();
    checkDueReminders();
});