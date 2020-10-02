const express = require("express");
const path = require("path");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 4000;

app.get("/api/:room/:emoji", (req, res) => {
  console.log("sending:", req.params, req.query);

  const payload = {
    emoji: req.params.emoji,
    wave: req.query.wave,
    rotate: req.query.rotate,
  };

  io.to(req.params.room).emit("emoji", payload);
  res.send("ok");
});

/* GET React App */
app.get(["/", "/:room"], function (req, res, next) {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.use(express.static("./frontend/build"));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

io.sockets.on("connection", function (socket) {
  console.log("a user connected", socket.id);

  socket.on("join", function ({ room }) {
    console.log("joining user to room", socket.id, room);
    socket.join(room);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
