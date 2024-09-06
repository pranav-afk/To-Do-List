document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todoForm');
    const todoList = document.getElementById('todoList');
    let editingTodoId = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        if (editingTodoId) {
            // Update existing todo
            const response = await fetch(`/todos/${editingTodoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, completed: false })
            });

            if (response.ok) {
                form.reset();
                editingTodoId = null; // Reset editing state
                loadTodos(); // Reload todos after updating
            } else {
                console.error('Failed to update todo');
            }
        } else {
            // Add new todo
            const response = await fetch('/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                form.reset();
                loadTodos(); // Reload todos after adding
            } else {
                console.error('Failed to add todo');
            }
        }
    });

    async function loadTodos() {
        const response = await fetch('/todos');
        if (response.ok) {
            const todos = await response.json();
            todoList.innerHTML = todos.map(todo => `
                <li>
                    ${todo.title} - ${todo.description} - ${todo.completed ? 'Completed' : 'Pending'}
                    <button onclick="editTodo(${todo.id}, '${todo.title}', '${todo.description}')">Edit</button>
                    <button onclick="deleteTodo(${todo.id})">Delete</button>
                </li>
            `).join('');
        }
    }

    window.editTodo = (id, title, description) => {
        document.getElementById('title').value = title;
        document.getElementById('description').value = description;
        editingTodoId = id; // Set editing state
    };

    window.deleteTodo = async (id) => {
        const response = await fetch(`/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTodos(); // Reload todos after deletion
        } else {
            console.error('Failed to delete todo');
        }
    };

    loadTodos(); // Initial load of todos
});
