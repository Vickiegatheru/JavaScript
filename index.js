const API_URL = 'http://localhost:3001/api';

// Enhanced task transitions with colors and restrictions
const Tasks = {
  todo: { 
    transitions: ['in-progress'],
    color: '#f0f0f0' 
  },
  'in-progress': { 
    transitions: ['blocked', 'done'],
    color: '#fff3cd' 
  },
  blocked: { 
    transitions: ['in-progress'],
    color: '#f8d7da' 
  },
  done: { 
    transitions: [],
    color: '#d4edda' 
  }
};

let draggedTask = null;

// Load tasks with animation
async function loadTasks() {
  try {
    showLoader();
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();
    
    document.querySelectorAll('.tasks').forEach(container => {
      container.innerHTML = '';
    });
    
    tasks.forEach((task, index) => {
      setTimeout(() => {
        renderTask(task.title, task.column_id, task.id);
      }, index * 100); // Staggered animation
    });
  } catch (error) {
    showError('Failed to load tasks');
  } finally {
    hideLoader();
  }
}

// Enhanced task rendering with colors and animations
function renderTask(title, columnId, taskId) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = title;
  task.dataset.id = taskId;
  task.style.backgroundColor = Tasks[columnId].color;
  task.style.transition = 'all 0.3s ease';

  task.ondragstart = function() {
    draggedTask = this;
    this.style.opacity = '0.4';
    this.style.transform = 'rotate(3deg)';
  };

  task.ondragend = function() {
    this.style.opacity = '1';
    this.style.transform = 'rotate(0deg)';
  };

  // Add delete button
  const deleteBtn = document.createElement('span');
  deleteBtn.innerHTML = '×';
  deleteBtn.className = 'delete-task';
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      await deleteTask(taskId);
    }
  };
  task.appendChild(deleteBtn);

  document.querySelector(`#${columnId} .tasks`).append(task);
}

// Delete task functionality
async function deleteTask(taskId) {
  try {
    await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    document.querySelector(`.task[data-id="${taskId}"]`).remove();
  } catch (error) {
    showError('Failed to delete task');
  }
}

// Enhanced add task with input validation
async function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();

  if (!taskText) {
    showError('Please enter a task!');
    input.focus();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskText })
    });
    
    const newTask = await response.json();
    renderTask(taskText, 'todo', newTask.id);
    input.value = '';
    input.focus();
  } catch (error) {
    showError('Failed to add task');
  }
}

// Enhanced drag-and-drop with visual feedback
function setupDragHandlers() {
  document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedTask) {
        const fromColumn = draggedTask.parentElement.parentElement.id;
        if (Tasks[fromColumn].transitions.includes(column.id)) {
          column.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)';
        } else {
          column.style.boxShadow = '0 0 10px rgba(255,0,0,0.5)';
        }
      }
    });

    column.addEventListener('dragleave', () => {
      column.style.boxShadow = 'none';
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.style.boxShadow = 'none';
      
      if (!draggedTask) return;

      const fromColumn = draggedTask.parentElement.parentElement.id;
      if (!Tasks[fromColumn].transitions.includes(column.id)) return;

      const taskId = draggedTask.dataset.id;
      try {
        await fetch(`${API_URL}/tasks/${taskId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newColumnId: column.id })
        });
        
        // Update visual appearance
        draggedTask.style.backgroundColor = Tasks[column.id].color;
        column.querySelector('.tasks').append(draggedTask);
        
        // Visual confirmation
        column.style.transform = 'scale(1.02)';
        setTimeout(() => {
          column.style.transform = 'scale(1)';
        }, 200);
      } catch (error) {
        showError('Failed to move task');
      }
    });
  });
}

// UI Helpers
function showLoader() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loading').style.display = 'none';
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 3000);
}

// Initialize with additional UI elements
document.addEventListener('DOMContentLoaded', () => {
  // Add loader and error elements if they don't exist
  if (!document.getElementById('loading')) {
    const loader = document.createElement('div');
    loader.id = 'loading';
    loader.style.display = 'none';
    document.body.appendChild(loader);
  }
  
  if (!document.getElementById('error-message')) {
    const errorEl = document.createElement('div');
    errorEl.id = 'error-message';
    errorEl.style.display = 'none';
    document.body.appendChild(errorEl);
  }

  loadTasks();
  document.getElementById('add-task-btn').onclick = addTask;
  setupDragHandlers();
});