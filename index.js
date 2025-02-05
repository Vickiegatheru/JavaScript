const Tasks = {
  todo: ['in-progress'],
  'in-progress': ['blocked', 'done'],
  blocked: ['in-progress'],
  done: [] 
};

let draggedTask = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-task-btn').onclick = addTask;

  setupDragHandlers();
});

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

  drop: function(e) {
    this.classList.remove('allowed-drop');
    
    const originalColumn = draggedTask.parentElement.parentElement.id;
    
    if (Tasks[originalColumn].includes(this.id)) {
      this.querySelector('.tasks').append(draggedTask);
    }
  }
};

function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();

  if (!taskText) return alert('Please enter a task!');

  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = taskText;

  task.ondragstart = function() {
    draggedTask = this;
    this.style.opacity = '0.4';
  };

  task.ondragend = function() {
    draggedTask = null;
    this.style.opacity = '1';
  };

  document.querySelector('#todo .tasks').append(task);
  input.value = ''; 
}