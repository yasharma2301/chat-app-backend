import express from 'express';
import { config } from 'dotenv';
import connectDB from './config/db.js'
import userRoutes from './Routes/userRoutes.js'

const app = express();
config();
connectDB();

app.get('/', (req, res) => {
    res.send(`Welcome to Let's Chat server!`);
});

app.use('/api/user', userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server started at port: ${port}`));