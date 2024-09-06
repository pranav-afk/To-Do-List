from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__, static_folder='frontend', static_url_path='/frontend')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'
db = SQLAlchemy(app)

class TodoItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed
        }

@app.route('/todos', methods=['GET'])
def get_todos():
    todos = TodoItem.query.all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.json
    print('Received data:', data)  # Debugging line
    if not all(key in data for key in ('title', 'description')):
        return jsonify({'error': 'Invalid input'}), 400
    new_todo = TodoItem(title=data['title'], description=data['description'])
    db.session.add(new_todo)
    db.session.commit()
    print('Added todo:', new_todo.to_dict())  # Debugging line
    return jsonify(new_todo.to_dict()), 201


@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    todo = TodoItem.query.get_or_404(id)
    data = request.json
    if 'title' in data:
        todo.title = data['title']
    if 'description' in data:
        todo.description = data['description']
    if 'completed' in data:
        todo.completed = data['completed']
    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    todo = TodoItem.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
