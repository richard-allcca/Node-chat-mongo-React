const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// rutas
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();
const socket = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());// REVIEW - en node

// DDBB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// Rutas - Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Listen
const server = app.listen(PORT, () =>
  console.log(`Server started on ${PORT}`)
);

// Socket
const io = socket(server, {
  cors: {
    origin: "*",
    // origin: "http://localhost:3000",
    credentials: true,
  },
});

// will store all of our online users inside this map
//  https://www.youtube.com/watch?v=_2VHVIJCtGk
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    console.log(userId, onlineUsers); // TODO review
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log('data.to', data.to); // msg para ->
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-received", data.msg);
    }
  });
});
