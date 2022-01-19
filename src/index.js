const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(user => user.username == username);
  if(!user)
    return response.status(404).json({ error: "User not found!" });
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } =  request.body;

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  });

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.headers;
  const { user } = request;

  user.todos.forEach(todo => {
    if(id === todo.id) {
      todo.title = title;
      todo.deadline = new Date(deadline);

      return response.status(201).send();
    }
  });

  return response.status(404).json({ error: "Todo not found!" });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.headers;
  const { user } = request;

  user.todos.forEach(todo => {
    if(id === todo.id) {
      todo.done = true;

      return response.status(201).send();
    }
  });

  return response.status(404).json({ error: "Todo not found!" });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.headers;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);
  user.todos.splice(todo, 1);

  return response.status(201).send();
});

module.exports = app;