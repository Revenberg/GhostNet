import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "rootpassword",
  database: process.env.MYSQL_DATABASE || "ghostnet",
};

export async function ensureTables(pool) {
  const conn = await pool.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) UNIQUE,
        teamname VARCHAR(64),
        token VARCHAR(128),
        role VARCHAR(32) DEFAULT 'user',
        password_hash VARCHAR(225),
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teamname VARCHAR(64) UNIQUE,
        teamcode VARCHAR(64) UNIQUE
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS team_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_id INT,
        event_type VARCHAR(64),
        event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);
  conn.release();
}

// Standalone run (for CLI usage)
if (require.main === module) {
  (async () => {
    const pool = await mysql.createPool(dbConfig);
    await ensureTables(pool);
    console.log("✅ Tables ensured");
    process.exit(0);
  })();
}
