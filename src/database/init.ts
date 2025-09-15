import { createConnection } from './config.js';

export const initializeDatabase = async () => {
  const connection = await createConnection();
  
  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS superhero_db`);
    
    // Sélectionner la base (solution 1 : changeUser)
    await connection.changeUser({ database: 'superhero_db' });
    // (solution 2 possible : await connection.query('USE superhero_db');)

    // Create superheroes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS superheroes (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        superpower VARCHAR(255) NOT NULL,
        humilityScore INT NOT NULL CHECK (humilityScore >= 1 AND humilityScore <= 10),
        avatar TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database and tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
};