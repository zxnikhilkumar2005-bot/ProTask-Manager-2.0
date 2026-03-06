// --- 1. State Management ---
let tasks = JSON.parse(localStorage.getItem('proTasks')) || [];
let currentFilter = 'all';

// --- 2. DOM Elements ---
const taskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const taskListContainer = document.getElementById('task-list-container');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const emptyState = document.getElementById('empty-state');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-task-form');
const editTaskInput = document.getElementById('edit-task-input');
const editCategorySelect = document.getElementById('edit-category-select');
const editPrioritySelect = document.getElementById('edit-priority-select');
const editDateInput = document.getElementById('edit-date-input');
const editTimeInput = document.getElementById('edit-time-input');

// --- 3. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateDate();
    checkTheme();
    requestNotificationPermission();
    startReminderSystem();
});

// --- 4. Core Functions ---

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        text: taskInput.value,
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dateInput.value,
        time: timeInput.value,
        completed: false,
    };

    tasks.unshift(newTask);
    saveAndRender();
    taskForm.reset();
});

// Render Tasks
function renderTasks() {
    taskListContainer.innerHTML = '';

    // Filter Logic
    let filteredTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === 'all' ? true :
                currentFilter === 'completed' ? task.completed :
                    !task.completed;

        const matchesSearch = task.text.toLowerCase().includes(searchInput.value.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Empty State
    if (filteredTasks.length === 0) {
        taskListContainer.appendChild(emptyState);
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }

    // Create HTML
    filteredTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item flex items-center justify-between p-4 mb-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md cursor-move ${task.completed ? 'opacity-60' : ''}`;
        taskEl.setAttribute('draggable', 'true');
        taskEl.setAttribute('data-id', task.id);

        // Priority Colors
        let priorityColor = 'text-gray-500';
        if (task.priority === 'High') priorityColor = 'text-red-500';
        if (task.priority === 'Medium') priorityColor = 'text-yellow-500';
        if (task.priority === 'Low') priorityColor = 'text-green-500';

        // Category Colors
        let badgeColor = 'bg-gray-200 text-gray-700';
        if (task.category === 'Work') badgeColor = 'bg-blue-100 text-blue-700';
        if (task.category === 'Study') badgeColor = 'bg-purple-100 text-purple-700';
        if (task.category === 'Personal') badgeColor = 'bg-green-100 text-green-700';

        taskEl.innerHTML = `
            <div class="flex items-center gap-3 flex-1">
                <button onclick="toggleComplete(${task.id})" class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${task.completed ? 'bg-secondary border-secondary text-white' : 'border-gray-300 hover:border-primary'}">
                    ${task.completed ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
                </button>
                <div>
                    <p class="font-medium ${task.completed ? 'line-through text-gray-400' : ''}">${task.text}</p>
                    <div class="flex items-center gap-2 text-xs mt-1">
                        <span class="px-2 py-0.5 rounded-md ${badgeColor}">${task.category}</span>
                        <span class="${priorityColor}"><i class="fa-solid fa-flag mr-1"></i>${task.priority}</span>
                        ${task.dueDate ? `<span class="text-gray-500"><i class="fa-regular fa-calendar mr-1"></i>${task.dueDate}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="openEditModal(${task.id})" class="text-gray-400 hover:text-primary transition p-2">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="text-gray-400 hover:text-red-500 transition p-2">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        // Drag and Drop Events
        addDragEvents(taskEl);
        taskListContainer.appendChild(taskEl);
    });

    updateProgressBar();
}

// Toggle Complete
window.toggleComplete = (id) => {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndRender();
};

// Delete Task
window.deleteTask = (id) => {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
};

// Filter Logic
window.filterTasks = (filterType) => {
    currentFilter = filterType;

    // Update UI buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-white', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
    });
    event.target.classList.remove('bg-white', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
    event.target.classList.add('bg-primary', 'text-white');

    renderTasks();
};

// Search Listener
searchInput.addEventListener('input', renderTasks);

// Save to LocalStorage
function saveAndRender() {
    localStorage.setItem('proTasks', JSON.stringify(tasks));
    renderTasks();
}

// Update Date
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('en-US', options);
}

// --- 5. Dark Mode Logic ---
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
});

function checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isDark) {
    const icon = themeToggle.querySelector('i');
    icon.className = isDark ? 'fa-solid fa-sun text-xl' : 'fa-solid fa-moon text-xl';
}

// --- 6. Progress Bar ---
function updateProgressBar() {
    if (tasks.length === 0) {
        progressBar.style.width = '0%';
        progressText.innerText = '0%';
        return;
    }

    const completed = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completed / tasks.length) * 100);

    progressBar.style.width = `${percentage}%`;
    progressText.innerText = `${percentage}%`;
}

// --- 7. Notification API ---
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('ProTask', { body: 'Notifications enabled! 🎉' });
        }
    });
}

function startReminderSystem() {
    setInterval(() => {
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        tasks.forEach(task => {
            if (!task.completed && task.time === currentTime && task.dueDate === currentDate) {
                // Visual Alert
                const taskEl = document.querySelector(`[data-id="${task.id}"]`);
                if (taskEl) {
                    taskEl.classList.add('ring-2', 'ring-red-500', 'animate-pulse');
                    setTimeout(() => taskEl.classList.remove('ring-2', 'ring-red-500', 'animate-pulse'), 2000);
                }

                // Browser Notification
                if (Notification.permission === 'granted') {
                    new Notification('Task Reminder!', {
                        body: `Time for: ${task.text}`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2997/2997254.png'
                    });
                }
            }
        });
    }, 10000); // Check every 10 seconds
}

// --- 8. Edit Modal Logic ---
window.openEditModal = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editTaskInput.value = task.text;
    editCategorySelect.value = task.category;
    editPrioritySelect.value = task.priority;
    editDateInput.value = task.dueDate;
    editTimeInput.value = task.time;
    document.getElementById('edit-id').value = task.id;

    editModal.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('modal-active');
};

window.closeModal = () => {
    editModal.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('modal-active');
};

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);

    tasks = tasks.map(t => {
        if (t.id === id) {
            return {
                ...t,
                text: editTaskInput.value,
                category: editCategorySelect.value,
                priority: editPrioritySelect.value,
                dueDate: editDateInput.value,
                time: editTimeInput.value,
            };
        }
        return t;
    });

    saveAndRender();
    closeModal();
});

// --- 9. Drag and Drop Logic ---
let draggedItem = null;

function addDragEvents(item) {
    item.addEventListener('dragstart', () => {
        draggedItem = item;
        setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
        setTimeout(() => {
            item.classList.remove('dragging');
            draggedItem = null;
        }, 0);
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        if (afterElement == null) {
            taskListContainer.appendChild(draggedItem);
        } else {
            taskListContainer.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}