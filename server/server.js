var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("<pre>emoji-effects server</pre>");
});

app.get("/send", (req, res) => {
  console.log("sending:", req.query);
  res.send("ok");
  io.emit("emoji", req.query);
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
