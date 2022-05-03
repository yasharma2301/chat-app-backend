import express from 'express';
import { config } from 'dotenv';

const app = express();
config();

app.get('/', (req, res) => {
    res.send(`Welcome to Let's Chat server!`);
});

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server started at port: ${port}`));