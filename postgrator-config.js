require('dotenv').config();

module.exports = {
    "migrationsDirectory": "migrations",
    "driver": "pg",
    "connectionString": (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : 'postgres://qifxpiblfepykg:685d95ebab20dcabcc9de4800edd6c3f6bae536a1ed0e5db6202c4d03e78dfcc@ec2-52-203-49-58.compute-1.amazonaws.com:5432/d2nc8vlisg88h0',
    "ssl": process.env.NODE_ENV === 'production',
}