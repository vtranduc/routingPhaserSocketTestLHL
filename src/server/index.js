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
  handleSoccerGame(socket, io.sockets, io.sockets.adapter.rooms, io);
  //--------------------------------------------------------------
});

//-----------------The only game data-------------------
let gameData = { soccer: {} };
//--------------------------------------

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

//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================
//==================================================================================

const handleSoccerGame = function(socket, sockets, rooms, io) {
  //----These data should be updated as emit from client--------
  // const config = {
  //   window: { height: 600, width: 800 },
  //   physics: {},
  //   player: {}
  //   // updateTime
  // };
  const frameTime = 0.05; // in second
  // const playersMovement = {};
  // const playersPos = {};
  const getAllPos = function(room) {
    let allPos = {};
    for (let player in gameData.soccer[room].players) {
      allPos[player] = gameData.soccer[room].players[player].pos;
    }
    return allPos;
  };

  //--- All soccer game logic HERE!!! ----------
  const updateGameRoom = function(room, frameTime) {
    // console.log("updating game...", room);
    for (let player in gameData.soccer[room].players) {
      const playerData = gameData.soccer[room].players[player];
      // Main control of movements of the player
      if (playerData.command.x === "right") {
        playerData.pos.x +=
          playerData.velocity.x * frameTime +
          playerData.acceleration.x *
            0.5 *
            frameTime *
            frameTime *
            (playerData.velocity.x < 0 ? playerData.reverseAccel.x : 1);
        playerData.velocity.x +=
          playerData.acceleration.x *
          frameTime *
          (playerData.velocity.x < 0 ? playerData.reverseAccel.x : 1);
      } else if (playerData.command.x === "left") {
        playerData.pos.x +=
          playerData.velocity.x * frameTime -
          playerData.acceleration.x *
            0.5 *
            frameTime *
            frameTime *
            (playerData.velocity.x > 0 ? playerData.reverseAccel.x : 1);
        playerData.velocity.x -=
          playerData.acceleration.x *
          frameTime *
          (playerData.velocity.x > 0 ? playerData.reverseAccel.x : 1);
      } else if (playerData.command.x === "") {
        if (playerData.velocity.x !== 0) {
          if (
            Math.abs(playerData.velocity.x) <
            gameData.soccer[room].config.negligibleVel.x
          ) {
            playerData.velocity.x = 0;
          } else if (playerData.velocity.x > 0) {
            playerData.pos.x +=
              playerData.velocity.x * frameTime -
              playerData.resistance.x * 0.5 * frameTime * frameTime;
            playerData.velocity.x -= playerData.resistance.x * frameTime;
          } else if (playerData.velocity.x < 0) {
            playerData.pos.x +=
              playerData.velocity.x * frameTime +
              playerData.resistance.x * 0.5 * frameTime * frameTime;
            playerData.velocity.x += playerData.resistance.x * frameTime;
          }
        }
      }
      if (playerData.command.y === "down") {
        playerData.pos.y +=
          playerData.velocity.y * frameTime +
          playerData.acceleration.y * 0.5 * frameTime * frameTime;
        playerData.velocity.y +=
          playerData.acceleration.y *
          frameTime *
          (playerData.velocity.y < 0 ? playerData.reverseAccel.y : 1);
      } else if (playerData.command.y === "up") {
        playerData.pos.y +=
          playerData.velocity.y * frameTime -
          playerData.acceleration.y * 0.5 * frameTime * frameTime;
        playerData.velocity.y -=
          playerData.acceleration.y *
          frameTime *
          (playerData.velocity.y > 0 ? playerData.reverseAccel.y : 1);
      } else if (playerData.command.y === "") {
        if (playerData.velocity.y !== 0) {
          if (
            Math.abs(playerData.velocity.y) <
            gameData.soccer[room].config.negligibleVel.y
          ) {
            playerData.velocity.y = 0;
          } else if (playerData.velocity.y > 0) {
            playerData.pos.y +=
              playerData.velocity.y * frameTime -
              playerData.resistance.y * 0.5 * frameTime * frameTime;
            playerData.velocity.y -= playerData.resistance.y * frameTime;
          } else if (playerData.velocity.y < 0) {
            playerData.pos.y +=
              playerData.velocity.y * frameTime +
              playerData.resistance.y * 0.5 * frameTime * frameTime;
            playerData.velocity.y += playerData.resistance.y * frameTime;
          }
        }
      }
      // Now check to make sure the player is within the permitted range
      if (playerData.pos.x < gameData.soccer[room].config.permittedRange.left) {
        // console.log("too far left", gameData.soccer[room].config.wallBounce);
        playerData.pos.x =
          2 * gameData.soccer[room].config.permittedRange.left -
          playerData.pos.x;
        playerData.velocity.x =
          -playerData.velocity.x * gameData.soccer[room].config.wallBounce;
      } else if (
        playerData.pos.x > gameData.soccer[room].config.permittedRange.right
      ) {
        console.log("too far right");
        playerData.pos.x =
          2 * gameData.soccer[room].config.permittedRange.right -
          playerData.pos.x;
        playerData.velocity.x =
          -playerData.velocity.x * gameData.soccer[room].config.wallBounce;
      }
      if (playerData.pos.y < gameData.soccer[room].config.permittedRange.top) {
        console.log("too far up");
        playerData.pos.y =
          2 * gameData.soccer[room].config.permittedRange.top -
          playerData.pos.y;
        playerData.velocity.y =
          -playerData.velocity.y * gameData.soccer[room].config.wallBounce;
      } else if (
        playerData.pos.y > gameData.soccer[room].config.permittedRange.bottom
      ) {
        console.log("too far down");
        playerData.pos.y =
          2 * gameData.soccer[room].config.permittedRange.bottom -
          playerData.pos.y;
        playerData.velocity.y =
          -playerData.velocity.y * gameData.soccer[room].config.wallBounce;
      }
      // Handling of soccer ball
    }
  };
  //------------------xTerm: 0.5*this.x*frameTime*frameTime,-

  //------------------xTerm: 0.5*this.x*frameTime*frameTime,----------------
  // Join a new playerxTerm: 0.5*this.x*frameTime*frameTime,
  socket.on("addPlayerSelf", data => {
    console.log("adding a new player, which is YOU");
    if (!gameData.soccer[data.room]) {
      console.log("Firt to join the game is: ", data.socketId);
      gameData.soccer[data.room] = {
        config: {
          wallBounce: data.physics.wallBounce,
          negligibleVel: {
            x: Math.floor(
              data.config.playerSpec.negligibleVel.x * data.config.window.width
            ),
            y: Math.floor(
              data.config.playerSpec.negligibleVel.y * data.config.window.height
            )
          },
          permittedRange: {
            left: data.config.window.left,
            right:
              data.config.window.left +
              data.config.window.width -
              Math.floor(
                data.config.window.width * data.config.playerSpec.size.width
              ),
            top: data.config.window.top,
            bottom:
              data.config.window.top +
              data.config.window.height -
              Math.floor(
                data.config.window.height * data.config.playerSpec.size.height
              )
          }
        },
        players: {}
      };
      gameData.soccer[data.room].game = setInterval(() => {
        updateGameRoom(data.room, frameTime);
        // console.log("update all players for this room: ", data.room);
        // console.log(gameData.soccer[data.room].config.permittedRange);
        sockets.to(data.room).emit("updateAllPlayers", getAllPos(data.room));
      }, frameTime * 1000);
    }
    //-----------JOINING A PLAYER TO ROOM HERE. TO BE FIXED LATER!!!---------------
    socket.join(data.room);
    //-----------------------------------------------------------------------

    // console.log("danzo");
    // console.log(data);
    gameData.soccer[data.room].players[data.socketId] = {
      velocity: { x: 0, y: 0 },
      acceleration: {
        x: Math.floor(data.physics.accel.x * data.config.window.width),
        y: Math.floor(data.physics.accel.y * data.config.window.height)
      },
      reverseAccel: data.physics.reverseAccel,
      resistance: {
        x: Math.floor(data.physics.resistance.x * data.config.window.width),
        y: Math.floor(data.physics.resistance.y * data.config.window.height)
      },
      pos: {
        x: data.config.window.left,
        y: data.config.window.top
      },
      command: { x: "", y: "" }
    };
    console.log(
      "Current players in the game: ",
      gameData.soccer[data.room].players
    );

    sockets.to(data.room).emit("updateAllPlayers", getAllPos(data.room));
  });
  socket.on("handleKeyPress", data => {
    gameData.soccer[data.room].players[data.socketId].command[data.axis] =
      data.dir;
  });
  socket.on("disconnectAssist", data => {
    socket.leave(data.room);
    // //---THIS IS LITERAL!!!--------------------- FIXXXXXXXXXXXXXX
    // const room = "testSoccerRoom";
    // //------------------------------------------
    delete gameData.soccer[data.room].players[socket.id];
    if (Object.keys(gameData.soccer[data.room].players).length === 0) {
      clearInterval(gameData.soccer[data.room].game);
      delete gameData.soccer[data.room];
    }
  });
  socket.on("disconnect", () => {
    //---THIS IS LITERAL!!!--------------------- FIXXXXXXXXXXXXXX
    const room = "testSoccerRoom";
    //------------------------------------------
    if (gameData.soccer[room] && gameData.soccer[room].players[socket.id]) {
      delete gameData.soccer[room].players[socket.id];
      if (Object.keys(gameData.soccer[room].players).length === 0) {
        console.log("deleting the entire room");
        clearInterval(gameData.soccer[room].game);
        delete gameData.soccer[room];
      }
    }
  });
};
