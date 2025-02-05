const Tasks = {
  todo: ['in-progress'],
  'in-progress': ['blocked', 'done'],
  blocked: ['in-progress'],
  done: []
};

let draggedTask = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-task-btn').onclick = addTask;
  
  
  ['dragover', 'dragenter', 'dragleave', 'drop'].forEach(event => {
    document.querySelectorAll('.column').forEach(column => {
      column.addEventListener(event, columnHandlers[event]);
    });
  });
});

const columnHandlers = {
  dragover: e => e.preventDefault(),
  dragenter: function(e) {
    if (!draggedTask) return;
    const current = draggedTask.parentElement.parentElement.id;
    if (Tasks[current].includes(this.id)) this.classList.add('allowed-drop');
  },
  dragleave: function(e) { this.classList.remove('allowed-drop') },
  drop: function(e) {
    this.classList.remove('allowed-drop');
    const current = draggedTask.parentElement.parentElement.id;
    if (Tasks[current].includes(this.id)) this.querySelector('.tasks').append(draggedTask);
  }
};

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return alert('Please enter a task!');

  const task = Object.assign(document.createElement('div'), {
    className: 'task',
    draggable: true,
    textContent: text,
    ondragstart: function() { 
      draggedTask = this;
      this.style.opacity = '0.4';
    },
    ondragend: function() { 
      draggedTask = null;
      this.style.opacity = '1';
    }
  });

  document.querySelector('#todo .tasks').append(task);
  input.value = '';
}