import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let channels = [{ id: "general", name: "General" }];
let messages = { general: [] };
let onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("join", ({ user }) => {
    onlineUsers[user] = true;
    io.emit("presence", Object.keys(onlineUsers));
  });

  socket.on("message", ({ channel, user, text }) => {
    const msg = { user, text, time: Date.now() };
    messages[channel].push(msg);
    io.to(channel).emit("message", msg);
  });

  socket.on("joinChannel", (channel) => {
    socket.join(channel);
  });
});

app.get("/channels", (req, res) => res.json(channels));
app.get("/messages/:channel", (req, res) => {
  const { channel } = req.params;
  res.json(messages[channel] || []);
});

httpServer.listen(3001, () => console.log("Backend running"));