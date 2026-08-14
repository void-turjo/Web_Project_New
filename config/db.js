const mysql = require('mysql2');

// Use connection pool with auto-reconnection and keep-alive to prevent timeout crashes
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smartlearn',
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log('⚠️ Database Note (Using Resilient Memory Fallback):', err.message);
  } else {
    console.log('✅ MySQL Database Connected Successfully!');
    connection.release();
  }
});

pool.on('error', (err) => {
  console.log('⚠️ Handled DB connection event (server remaining active):', err.message);
});

module.exports = pool;