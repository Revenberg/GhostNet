import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.MYSQL_HOST || "mysql",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "rootpassword",
  database: process.env.MYSQL_DATABASE || "ghostnet",
};

export async function ensureTables(pool) {
  const conn = await pool.getConnection();
  // removed duplicate game table creation above

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
        event_message VARCHAR(255),
        event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS game (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(64) UNIQUE,
      status VARCHAR(64),
      lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS game_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT,
        team_id INT,
        status VARCHAR(64),
        FOREIGN KEY (game_id) REFERENCES game(id),
        FOREIGN KEY (team_id) REFERENCES teams(id),
        lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await conn.query(`
    drop table if exists game_route_points;
    `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS game_route_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location VARCHAR(64),
        latitude DOUBLE,
        longitude DOUBLE,
        description TEXT,
        images TEXT,
        hints TEXT
    )
  `);
  await conn.query(`
  drop table if exists game_routes;
    `);
    
    await conn.query(`
    CREATE TABLE IF NOT EXISTS game_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT,
        order_id INT,
        game_route_points_id INT,
        FOREIGN KEY (game_route_points_id) REFERENCES game_route_points(id),
        FOREIGN KEY (game_id) REFERENCES game(id),
        lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS lora_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lora_node_id VARCHAR(64) UNIQUE,
        location VARCHAR(128),
        images TEXT,
        name VARCHAR(64),
        description TEXT
    )
  `);
  conn.release();
}

// Standalone run (for CLI usage, ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const pool = await mysql.createPool(dbConfig);
    await ensureTables(pool);
    console.log("✅ Tables ensured");
    process.exit(0);
  })();
}
