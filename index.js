const API_URL = 'http://localhost:3001/api';

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
  }
}

// Update your drop handler
const columnHandlers = {
  // ... other handlers ...
  drop: async function(e) {
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
      }
    }
  }
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  document.getElementById('add-task-btn').onclick = addTask;
  setupDragHandlers();
});