const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const http = require('http'); // extra
const socketIo = require('socket.io'); //extra

const server = http.createServer(app); // Create server from express
const io = socketIo(server, {
  cors: {
    origin: "*", // adjust in production
  }
});

// Make io accessible in routes
const onlineUsers = new Map();
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});
// end on soket.io extra stuff



const testJwtRouter = require("./controllers/test-jwt")
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

app.use("/test-jwt",verifyToken,testJwtRouter)

app.use("/",sadeedRoutes)




// app.listen(3000, () => {
//   console.log('The express app is ready!');
// });


server.listen(3000, () => {
  console.log('Server with Socket.IO is running on port 3000');
});