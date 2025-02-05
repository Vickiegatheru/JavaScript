const Tasks = {
  'todo': ['in-progress'],
  'in-progress': ['blocked', 'done'],
  'blocked': ['in-progress'],
  'done': []
};

let draggedTask = null;


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-task-btn').addEventListener('click', addTask);
  
  document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', dragDrop);
  });
});

function addTask() {
  const taskInput = document.getElementById('task-input');
  const taskText = taskInput.value.trim();

  if (!taskText) {
    alert('Please enter a task!');
    return;
  }

  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = taskText;

  task.addEventListener('dragstart', dragStart);
  task.addEventListener('dragend', dragEnd);

  document.querySelector('#todo .tasks').appendChild(task);
  taskInput.value = '';
}

function dragStart() {
  draggedTask = this;
  this.style.opacity = '0.4';
}

function dragEnd() {
  draggedTask = null;
  this.style.opacity = '1';
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  if (!draggedTask) return;
  
  const currentColumn = draggedTask.parentElement.parentElement.id;
  const targetColumn = this.id;

  if (Tasks[currentColumn].includes(targetColumn)) {
    this.classList.add('allowed-drop');
  }
}

function dragLeave(e) {
  this.classList.remove('allowed-drop');
}

function dragDrop(e) {
  this.classList.remove('allowed-drop');
  
  const currentColumn = draggedTask.parentElement.parentElement.id;
  const targetColumn = this.id;

  if (Tasks[currentColumn].includes(targetColumn)) {
    this.querySelector('.tasks').appendChild(draggedTask);
  }
}