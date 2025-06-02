import mysql from 'mysql2/promise';

async function connectDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'your_database'
  });
  return connection;
}

export default connectDB;