const Tasks = {
  todo: ['in-progress'],
  'in-progress': ['blocked', 'done'],
  blocked: ['in-progress'],
  done: []
};

let draggedTask = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-task-btn').onclick = addTask;

  fetch('http://localhost:3001/api/tasks')
    .then(res => res.json())
    .then(tasks => {
      tasks.forEach(t => {
        const task = createTaskElement(t.title, t.id);
        document.querySelector(`#${t.column_id} .tasks`).append(task);
      });
    })
    .catch(() => alert('Failed to load tasks'));

  setupDragHandlers();
});

function setupDragHandlers() {
  const dragEvents = ['dragover', 'dragenter', 'dragleave', 'drop'];

  document.querySelectorAll('.column').forEach(column => {
    dragEvents.forEach(eventType => {
      column.addEventListener(eventType, function (event) {
        columnHandlers[eventType].call(this, event);
      });
    });
  });
}

const columnHandlers = {
  dragover: function (e) {
    e.preventDefault();
  },

  dragenter: function (e) {
    if (!draggedTask) return;

    const originalColumn = draggedTask.parentElement.parentElement.id;

    if (Tasks[originalColumn].includes(this.id)) {
      this.classList.add('allowed-drop');
    }
  },

  dragleave: function (e) {
    this.classList.remove('allowed-drop');
  },

  drop: function (e) {
    this.classList.remove('allowed-drop');

    const originalColumn = draggedTask.parentElement.parentElement.id;

    if (Tasks[originalColumn].includes(this.id)) {
      this.querySelector('.tasks').append(draggedTask);

      const taskId = draggedTask.dataset.id;

      fetch(`http://localhost:3001/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newColumnId: this.id })
      }).catch(() => alert('Failed to move task'));
    }
  }
};

function addTask() {
  const input = document.getElementById('task-input');
  const taskText = input.value.trim();

  if (!taskText) return alert('Please enter a task!');

  fetch('http://localhost:3001/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: taskText })
  })
    .then(res => res.json())
    .then(data => {
      const task = createTaskElement(data.title, data.id);
      document.querySelector('#todo .tasks').append(task);
      input.value = '';
    })
    .catch(() => alert('Failed to add task'));
}

function createTaskElement(title, id) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.textContent = title;
  task.dataset.id = id;

  task.ondragstart = function () {
    draggedTask = this;
    this.style.opacity = '0.4';
  };

  task.ondragend = function () {
    draggedTask = null;
    this.style.opacity = '1';
  };

  return task;
}
