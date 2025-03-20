/**
 * Filename: dbConnect.js
 * Description: This file contains the code to connect to MongoDB using mongoose.
 *              It uses the environment variable MONGODB_URI defined in the .env file to connect to the database.
 */
const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            console.error('MongoDB URI is not defined in environment variables');
            process.exit(1);
        }
        
        // Connect with authentication options
        const conn = await mongoose.connect(mongoURI, {
            // The newer versions of mongoose don't require these options explicitly
            // but adding them for clarity and compatibility
            authSource: 'admin'
        });
        
        console.log(`MongoDB is running on ${conn.connection.host} port ${conn.connection.port}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = dbConnect;