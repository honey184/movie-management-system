require('dotenv').config();
const app = require('./app');
const { connectDB, connectRedis } = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB();
connectRedis();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});