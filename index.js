const columns = ["todo", "in progress", "blocked", "done"];

const taskManager = {
  tasks: [],

  addTask(taskName) {
    this.tasks.push({ name: taskName, column: "todo" });
    console.log(`Task "${taskName}" added to the "todo" column.`);
  },

  moveTask(taskName) {
    const task = this.tasks.find((t) => t.name === taskName);
    if (!task) {
      console.log(`Task "${taskName}" not found.`);
      return;
    }

    const currentColumnIndex = columns.indexOf(task.column);

    if (currentColumnIndex === -1 || currentColumnIndex === columns.length - 1) {
      console.log(`Task "${taskName}" is already in the last column.`);
      return;
    }

    task.column = columns[currentColumnIndex + 1];
    console.log(`Task "${taskName}" moved to the "${task.column}" column.`);
  },

  displayTasks() {
    console.log("Current tasks:");
    this.tasks.forEach((task) => {
      console.log(`- ${task.name}: ${task.column}`);
    });
  },
};

taskManager.addTask("Task 1");
taskManager.addTask("Task 2");

taskManager.displayTasks();

taskManager.moveTask("Task 1");
taskManager.displayTasks();

taskManager.moveTask("Task 1");
taskManager.moveTask("Task 1");
taskManager.moveTask("Task 1");

taskManager.displayTasks();
