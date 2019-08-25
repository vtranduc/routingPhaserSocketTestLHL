const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3001;

app.get("/", (req, res) => {
  res.send("<h1>test server for game</h1>");
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

io.on("connection", socket => {
  console.log("A new user has been connected: ", socket.id);
  socket.on("disconnect", () => {
    console.log("A user has been disconnected: ", socket.id);
  });

  //-----------------ALL GAME COMMANDS---------------------------

  socket.join("testRoom");
  socket.join("imaginaryRoom");
  handleRequestsFromClients(socket, io.sockets, io.sockets.adapter.rooms);
  handleBallKickingGame(socket, io.sockets, io.sockets.adapter.rooms, io);
  //--------------------------------------------------------------
});

function handleRequestsFromClients(socket, sockets, rooms) {
  //--------------temporary
  const room = "testRoom";
  //---------------
  socket.on("disconnect", () => {
    console.log("A user has been disconnected: ", socket.id);
    sockets.to(room).emit("killSchoolGirl", socket.id);
  });
  socket.on("serverStage1", socketId => {
    console.log("stage1");
    sockets.to(room).emit("clientStage1", socketId);
  });
  socket.on("serverStage2", data => {
    console.log("stage2");
    console.log(data);
    sockets.to(room).emit("clientStage2", data);
  });
  socket.on("updatePlayerPos", data => {
    socket.broadcast.to(room).emit("receivePlayerPos", data);
  });
  // socket.on("switchTab", socketId => {
  //   sockets.to(room).emit("killSchoolGirl", socketId);
  // });
  // socket.on("loadTheGame", socketId => {
  //   console.log("Here we need to load the game");
  //   sockets.to(room).emit("getPosition", socketId);
  // });
  // socket.on("retrieveAllPositions", data => {
  //   console.log("retrievePosition");
  //   sockets.to(room).emit("updatePosition", data);
  // });

  //---------------------------------------------
  socket.on("testRequestFromClient", data => {
    console.log("Request from client has been received!", data);
    console.log("This is room info: ", rooms[room].length);
    console.log(rooms[room]);
    sockets.to(room).emit("testRequestFromServer", data);
  });
}

const handleBallKickingGame = function(socket, sockets, rooms, io) {
  socket.on("disconnect", () => {
    // console.log("disconnecting a user: ", socket.id);
    // console.log(rooms["imaginaryRoom"]);
    //UNABLE TO GET THE ROOM NOW. FIX IT LATER!!!!!!!!!!!!!!!!!!!!!!!!!
    socket.broadcast.to("imaginaryRoom").emit("disconnectAPlayer", socket.id);
  });
  socket.on("cleanUpAssist", data => {
    socket.broadcast.to(data.room).emit("disconnectAPlayer", data.socketId);
  });
  socket.on("requestPlayers", data => {
    io.to(data.socketId).emit(
      "loadPlayers",
      Object.keys(rooms[data.room].sockets)
    );
    socket.broadcast.to(data.room).emit("insertPlayer", data.socketId);
  });
  socket.on("updatePlayerPosition", data => {
    socket.broadcast.to(data.room).emit("updateOtherPlayersPos", {
      socketId: data.socketId,
      xy: data.xy
    });
  });
};
