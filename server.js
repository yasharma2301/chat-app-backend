import express from 'express';
import { config } from 'dotenv';
import userRoutes from './Routes/userRoutes.js'
import mongoose from 'mongoose';

const app = express();
config();
app.use(express.json())

app.get('/', (req, res) => {
    res.send(`Welcome to Let's Chat server!`);
});

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message))