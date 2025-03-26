const API_URL = 'http://localhost:3001/api';

// Define allowed task transitions between columns
const Tasks = {
  todo: ['in-progress'],
  'in-progress': ['blocked', 'done'],
  blocked: ['in-progress'],
  done: []
};

let draggedTask = null;

// Load tasks from database when page loads
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();
    
    // Clear existing tasks
    document.querySelectorAll('.tasks').forEach(container => {
      container.innerHTML = '';
    });
    
    // Render tasks
    tasks.forEach(task => {
      renderTask(task.title, task.column_id, task.id);
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Render a single task element
function renderTask(title, columnId, taskId) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = title;
  task.dataset.id = taskId;

  task.ondragstart = function() {
    draggedTask = this;
    this.style.opacity = '0.4';
  };

  task.ondragend = function() {
    draggedTask = null;
    this.style.opacity = '1';
  };

  document.querySelector(`#${columnId} .tasks`).append(task);
}

// Add new task to database
async function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();

  if (!taskText) return alert('Please enter a task!');

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskText })
    });
    
    const newTask = await response.json();
    renderTask(taskText, 'todo', newTask.id);
    input.value = '';
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Failed to add task. Please try again.');
  }
}

// Set up drag-and-drop event handlers
function setupDragHandlers() {
  const dragEvents = ['dragover', 'dragenter', 'dragleave', 'drop'];
  
  document.querySelectorAll('.column').forEach(column => {
    dragEvents.forEach(eventType => {
      column.addEventListener(eventType, function(event) {
        columnHandlers[eventType].call(this, event);
      });
    });
  });
}

// Column event handlers for drag-and-drop
const columnHandlers = {
  dragover: function(e) {
    e.preventDefault(); 
  },

  dragenter: function(e) {
    if (!draggedTask) return;
    
    const originalColumn = draggedTask.parentElement.parentElement.id;
    
    if (Tasks[originalColumn].includes(this.id)) {
      this.classList.add('allowed-drop');
    }
  },

  dragleave: function(e) {
    this.classList.remove('allowed-drop');
  },

  drop: async function(e) {
    e.preventDefault();
    this.classList.remove('allowed-drop');
    
    const originalColumn = draggedTask.parentElement.parentElement.id;
    const taskId = draggedTask.dataset.id;
    
    if (Tasks[originalColumn].includes(this.id)) {
      try {
        await fetch(`${API_URL}/tasks/${taskId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newColumnId: this.id })
        });
        
        this.querySelector('.tasks').append(draggedTask);
      } catch (error) {
        console.error('Error moving task:', error);
        alert('Failed to move task. Please try again.');
      }
    }
  }
};

// Initialize the application when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  document.getElementById('add-task-btn').onclick = addTask;
  setupDragHandlers();
});