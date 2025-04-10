const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const authRoutes = require("./controllers/auth.routes")
const verifyToken = require("./middleware/verify-token")

const sadeedRoutes = require("./controllers/conceptController")

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use("/auth",authRoutes)


app.use("/",sadeedRoutes)




app.listen(3000, () => {
  console.log('The express app is ready!');
});
