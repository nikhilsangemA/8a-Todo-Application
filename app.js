const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializationDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: '${e.message}'`);
    process.exit(1);
  }
};

initializationDBandServer();

// API 1
const priorityandStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const priorityOf = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const statusOf = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let dbresponse = null;
  let getResult = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case priorityandStatus(request.query):
      getResult = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}'`;
      break;
    case priorityOf(request.query):
      getResult = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}'`;
      break;
    case statusOf(request.query):
      getResult = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}'`;
      break;
    default:
      getResult = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  dbresponse = await db.all(getResult);
  response.send(dbresponse);
});

// API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const selectOneTodoId = `SELECT * FROM todo WHERE id = '${todoId}'`;
  const dbresponse = await db.get(selectOneTodoId);
  response.send(dbresponse);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodo = `INSERT INTO todo (id, todo, priority, status)
    VALUES ( ${id},'${todo}','${priority}','${status}')`;
  const dbresponse = await db.run(postTodo);
  response.send("Todo Successfully Added");
});

// API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
  }

  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;

  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodo = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}' WHERE id = ${todoId}`;

  const dbresponse = await db.run(updateTodo);
  response.send(`${updateColumn} Updated`);
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delTodo = `DELETE FROM todo WHERE id = ${todoId}`;
  const dbresponse = await db.run(delTodo);
  response.send("Todo Deleted");
});

module.exports = app;
