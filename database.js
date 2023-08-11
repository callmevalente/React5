const { Pool, Client } = require("pg");

const credentials = {
  user: "root",
  host: "postgres",
  password: "root"
};

async function poolDemo() {
    const pool = new Pool(credentials);
    const now = await pool.query("SELECT * FROM employees")
    .then((payload) => {
        return payload.rows;
      })
  }

console.log(poolDemo())