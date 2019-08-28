import React, { useEffect } from "react";
import Phaser from "phaser";

const room = "imaginaryRoom";

let game;
export default function BallKicking({ socket }) {
  let players = {};
  let w, a, s, d;
  let moveSpeed = 200;
  let possession = false;
  const accel = 400;
  const decel = 200;
  const reverseAccel = 700;
  const stoppingSpeed = 20;
  const bounce = 0.8;
  const yaminoma = function(data) {
    console.log("have collided HERE!");
    console.log("Data: ", data);
  };

  let vector;
  useEffect(() => {
    const preload = function() {
      this.load.image("field", "assets/ballKicking/field.jpg");
      this.load.image("player", "assets/ballKicking/player.png");
      this.load.image("ball", "assets/ballKicking/ball.png");
    };
    const create = function() {
      let bg = this.add.image(config.width / 2, config.height / 2, "field");
      bg.setDisplaySize(config.width, config.height);
      let ball = this.physics.add.sprite(100, 100, "ball");
      ball.setScale(0.05);
      ball.setCollideWorldBounds(true);

      //---First initialization---
      socket.emit("requestPlayers", { room: room, socketId: socket.id });
      socket.on("loadPlayers", playerList => {
        // console.log(players);
        players[socket.id] = this.physics.add.sprite(100, 100, "player");
        players[socket.id].setScale(0.1);
        players[socket.id].setCollideWorldBounds(true);
        players[socket.id].setBounce(bounce);
        for (let player of playerList) {
          if (player !== socket.id) {
            players[player] = this.physics.add.sprite(100, 100, "player");
            players[player].setScale(0.1);
            players[player].setCollideWorldBounds(true);
            players[player].setBounce(bounce);
            //---New line of codes---
            this.physics.add.collider(
              players[socket.id],
              players[player],
              yaminoma
            );
          }
          //-----------------------
        }
      });
      socket.on("insertPlayer", socketId => {
        players[socketId] = this.physics.add.sprite(100, 100, "player");
        players[socketId].setScale(0.1);
        players[socketId].setCollideWorldBounds(true);
        players[socketId].setBounce(bounce);
        //---New line of codes---
        this.physics.add.collider(
          players[socket.id],
          players[socketId],
          yaminoma
        );
        //-----------------------
      });
      socket.on("updateOtherPlayersPos", data => {
        if (players[data.socketId]) {
          players[data.socketId].x = data.xy.x;
          players[data.socketId].y = data.xy.y;
        } else {
          console.log("This is not right");
        }
      });
      socket.on("disconnectAPlayer", socketId => {
        console.log("killing a player now!");
        if (players[socketId]) {
          players[socketId].destroy();
          delete players[socketId];
        }
      });
      w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    };
    const update = function() {
      if (players[socket.id]) {
        //=----------------------------------------------
        // for (let player in players) {
        //   //   if (
        //   //     player !== socket.id &&
        //   //     game.physics.arcade.collide(players[socket.id], players[player])
        //   //   ) {
        //   //     console.log("have overlapped!");
        //   //   }
        //   console.log(this.physics.arcade);
        // }

        // game.physics.arcade.collide(players[socket.id], players[player]);
        //=----------------------------------------------

        socket.emit("updatePlayerPosition", {
          room: room,
          socketId: socket.id,
          xy: players[socket.id].getCenter(vector)
        });
        if (possession) {
          // Transmit the data of the ball here
        }
        if (d.isDown) {
          console.log("accelerate right");
          // if (players[socket.id].body.acceleration.x) {}
          if (players[socket.id].body.velocity.x < 0) {
            players[socket.id].body.acceleration.x = reverseAccel;
          } else if (players[socket.id].body.acceleration.x !== accel) {
            players[socket.id].body.acceleration.x = accel;
          }
        }
        if (a.isDown) {
          console.log("accelerate left");
          // players[socket.id].body.velocity.x = -moveSpeed;
          // players[socket.id].body.acceleration.x = -accel;
          if (players[socket.id].body.velocity.x > 0) {
            players[socket.id].body.acceleration.x = -reverseAccel;
          } else if (players[socket.id].body.acceleration.x !== -accel) {
            players[socket.id].body.acceleration.x = -accel;
          }
        }
        if (w.isDown) {
          console.log("accelerate up");
          // // players[socket.id].body.velocity.y = -moveSpeed;
          // players[socket.id].body.acceleration.y = -accel;
          if (players[socket.id].body.velocity.y > 0) {
            players[socket.id].body.acceleration.y = -reverseAccel;
          } else if (players[socket.id].body.acceleration.y !== -accel) {
            players[socket.id].body.acceleration.y = -accel;
          }
        }
        if (s.isDown) {
          console.log("accelerate down");
          // players[socket.id].body.velocity.y = moveSpeed;
          // players[socket.id].body.acceleration.y = accel;
          if (players[socket.id].body.velocity.y < 0) {
            players[socket.id].body.acceleration.y = reverseAccel;
          } else if (players[socket.id].body.acceleration.y !== accel) {
            players[socket.id].body.acceleration.y = accel;
          }
        }
        if (players[socket.id].body.velocity.x && d.isUp && a.isUp) {
          if (Math.abs(players[socket.id].body.velocity.x) <= stoppingSpeed) {
            console.log("stop player completely!");
            players[socket.id].body.acceleration.x = 0;
            players[socket.id].body.velocity.x = 0;
          } else if (
            players[socket.id].body.velocity.x > 0 &&
            players[socket.id].body.acceleration.x !== -decel
          ) {
            console.log("stop going right");
            players[socket.id].body.acceleration.x = -decel;
          } else if (
            players[socket.id].body.velocity.x < 0 &&
            players[socket.id].body.acceleration.x !== decel
          ) {
            console.log("stop going left");
            players[socket.id].body.acceleration.x = decel;
          }
        }

        if (players[socket.id].body.velocity.y && w.isUp && s.isUp) {
          if (Math.abs(players[socket.id].body.velocity.y) <= stoppingSpeed) {
            console.log("stop player completely!");
            players[socket.id].body.acceleration.y = 0;
            players[socket.id].body.velocity.y = 0;
          } else if (
            players[socket.id].body.velocity.y > 0 &&
            players[socket.id].body.acceleration.y !== -decel
          ) {
            console.log("stop going right");
            players[socket.id].body.acceleration.y = -decel;
          } else if (
            players[socket.id].body.velocity.y < 0 &&
            players[socket.id].body.acceleration.y !== decel
          ) {
            console.log("stop going left");
            players[socket.id].body.acceleration.y = decel;
          }
        }

        // if (d.isUp && players[socket.id].body.velocity.x > 0) {
        //   players[socket.id].body.velocity.x = 0;
        // }
        // if (a.isUp && players[socket.id].body.velocity.x < 0) {
        //   players[socket.id].body.velocity.x = 0;
        // }
        // if (w.isUp && players[socket.id].body.velocity.y < 0) {
        //   players[socket.id].body.velocity.y = 0;
        // }
        // if (s.isUp && players[socket.id].body.velocity.y > 0) {
        //   players[socket.id].body.velocity.y = 0;
        // }
      }

      // if (d.isUp && players[socket.id]) {
      //   players[socket.id].body.velocity.x = 0;
      // }
    };
    //---configuration---
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          debug: true
        }
      },
      scene: {
        preload,
        create,
        update
      },
      parent: "ballkicking"
    };
    //---create game---
    game = new Phaser.Game(config);
    vector = new Phaser.Math.Vector2();
    const cleanup = function() {
      console.log("cleaning Up All");
      socket.emit("cleanUpAssist", { socketId: socket.id, room: room });
      game.destroy(true);

      socket.removeListener("updateOtherPlayersPos");
      socket.removeListener("loadPlayers");
      socket.removeListener("insertPlayer");
      socket.removeListener("disconnectAPlayer");
      players = {};
    };
    return cleanup;
  }, []);
  return <div id="ballkicking"></div>;
}
