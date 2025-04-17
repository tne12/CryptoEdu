// lib/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolve the absolute path for the database file (history.db) in the project root
const dbPath = path.resolve(process.cwd(), 'history.db');
console.log("Database path:", dbPath);

// Open or create the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Database opened successfully at", dbPath);
  }
});

// Create the encryption_history table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS encryption_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    cipher_type TEXT,
    plaintext TEXT,
    encrypted_text TEXT,
+   operation TEXT,
    key_a INTEGER,
    key_b INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;


db.run(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
  } else {
    console.log("Table 'encryption_history' created or already exists.");
  }
});

// Function to insert history data into the database

const insertHistory = (user_id, cipher_type, plaintext, encrypted_text, key_a, key_b, operation) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO encryption_history
        (user_id, cipher_type, plaintext, encrypted_text, operation, key_a, key_b)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    db.run(sql,
      [user_id, cipher_type, plaintext, encrypted_text, operation, key_a, key_b],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
};


// Function to fetch history data from the database
const fetchHistory = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM encryption_history ORDER BY created_at DESC", [], (err, rows) => {
      if (err) {
        console.error("Error fetching history:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const deleteHistory = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM encryption_history WHERE id = ?",
      [id],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes);  // number of rows deleted (should be 1)
      }
    );
  });
};


const deleteAllHistory = (user_id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM encryption_history WHERE user_id = ?`,
      [user_id],
      function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      }
    );
  });
};



module.exports = { db, insertHistory, fetchHistory, deleteHistory, deleteAllHistory, };
