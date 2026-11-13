
// Get elements from HTML
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const taskSummary = document.getElementById("taskSummary");

const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.getElementById("themeToggle");
const clearCompletedButton = document.getElementById("clearCompleted");

// Load saved tasks from Local Storage
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
} catch {
    tasks = [];
}

let currentFilter = "all";

// Save tasks to Local Storage
function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

// Update task counts
function updateCounts() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    totalCount.textContent = tasks.length;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;

    taskSummary.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
}

// Create a task
function addTask(title, priority, dueDate) {
    const task = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        priority: priority,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    renderTasks();
}

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "pending" && !task.completed);

        const matchesSearch = task.title
            .toLowerCase()
            .includes(searchText);

        return matchesFilter && matchesSearch;
    });

    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Task information
        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = `priority ${task.priority}`;
        priority.textContent = task.priority;

        meta.appendChild(priority);

        if (task.dueDate) {
            const date = document.createElement("span");
            date.textContent = `Due: ${task.dueDate}`;
            meta.appendChild(date);
        }

        content.append(title, meta);

        // Edit and delete buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "action-button";
        editButton.textContent = "✎";
        editButton.title = "Edit task";
        editButton.setAttribute("aria-label", "Edit task");

        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.append(editButton, deleteButton);
        taskItem.append(checkbox, content, actions);

        taskList.appendChild(taskItem);
    });

    updateCounts();
}

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newTitle = prompt("Edit your task:", task.title);

    if (newTitle === null) return;

    if (newTitle.trim() === "") {
        alert("Task name cannot be empty.");
        return;
    }

    task.title = newTitle.trim();

    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// Mark task as completed or pending
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// Add task form
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") return;

    addTask(
        title,
        priorityInput.value,
        dueDateInput.value
    );

    taskForm.reset();
    priorityInput.value = "Medium";
    taskInput.focus();
});

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderTasks();
    });
});

// Search tasks
searchInput.addEventListener("input", renderTasks);

// Delete all completed tasks
clearCompletedButton.addEventListener("click", () => {
    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm("Delete all completed tasks?");

    if (!confirmed) return;

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

// Dark mode
const savedTheme = localStorage.getItem("taskflowTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeToggle.textContent = isDark ? "☀" : "☾";

    localStorage.setItem(
        "taskflowTheme",
        isDark ? "dark" : "light"
    );
});

// Display today's date
const today = new Date();

document.getElementById("currentDate").textContent =
    today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

// Load saved tasks when page opens
renderTasks();
