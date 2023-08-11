const { Client, Pool } = require("pg");
const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

const client = new Client({
  password: "root",
  user: "root",
  host: "postgres",
});

app.use( express.urlencoded({ extended: false }) );
app.use( express.json() );
app.use(express.static("class-app/build"));

app.delete("/delete/:id", async (req, res) => {
  if (isNaN(req.params.id)) {
    res.status(400);
    res.send("No id provided");
    res.end();
  } else {
    try {
      console.log(req.body.id);
      await client.query(`UPDATE employees SET isactive = false WHERE id = ${req.params.id}`);
      res.status(200);
      res.send("Employee was successfully disabled!");
    } catch (e) {
      res.status(500);
      res.send("Error: Failed to disable employee!");
    } finally {
      res.end();
    }
  }
});

app.post("/add", async (req, res) => {
  try {
    await client.query(
      `INSERT INTO employees (id, name, title, avatarurl) VALUES (${req.body.id}, '${req.body.name}', '${req.body.title}', '${decodeURIComponent(req.body.avatarurl)}')`
    );
    res.status(200);
    res.send("Employee Added");
  } catch (e) {
    res.status(500);
    res.send("Failed to add Employee");
  } finally {
    res.end();
  }
});

app.put("/update/:ogid/:id/:name/:title/:avatarurl/:isactive", async (req, res) => {
  try {
    await client.query(
      `UPDATE employees SET id = ${req.params.id}, name = '${req.params.name}', title = '${req.params.title}', avatarurl = '${decodeURIComponent(req.params.avatarurl)}', isactive = ${req.params.isactive} WHERE id = ${req.params.ogid}`
    );
    res.status(200);
    res.send("Employee updated");
  } catch (e) {
    res.status(500);
    res.send("Failed to update employee");
  } finally {
    res.end();
  }
});

app.get("/employees", async (req, res) => {
  const results = await client
    .query("SELECT * FROM employees")
    .then((payload) => {
      return payload.rows;
    })
    .catch(() => {
      throw new Error("Query failed");
    });
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  res.send(JSON.stringify(results));
});

app.get("/activeEmployees", async (req, res) => {
  const results = await client
    .query("SELECT * FROM employees Where isactive = true")
    .then((payload) => {
      return payload.rows;
    })
    .catch(() => {
      throw new Error("Query failed");
    });
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  res.send(JSON.stringify(results));
});

app.get("/employees/name", async (req, res) => {
  if (req.query.name.length == 0) {
    res.status(400);
    res.send("No name provided");
    res.end();
  } else {
    const results = await client
    .query(`SELECT * FROM employees WHERE name LIKE '%${req.query.name}%'`)
      .then((payload) => {
        return payload.rows;
      })
      .catch(() => {
        throw new Error("Query failed");
      });
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.send(JSON.stringify(results));
  }
  
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'class-app', 'build', 'index.html'));
});

(async () => {
  await client.connect();

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();

