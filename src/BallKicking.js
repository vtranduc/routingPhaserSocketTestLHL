import React, { useEffect } from "react";
import Phaser from "phaser";

const room = "imaginaryRoom";

let game;
export default function BallKicking({ socket }) {
  let players = {};
  let w, a, s, d;
  let moveSpeed = 200;

  let vector;
  useEffect(() => {
    const preload = function() {
      this.load.image("field", "assets/ballKicking/field.jpg");
      this.load.image("player", "assets/ballKicking/player.png");
    };
    const create = function() {
      let bg = this.add.image(config.width / 2, config.height / 2, "field");
      bg.setDisplaySize(config.width, config.height);
      //---First initialization---
      socket.emit("requestPlayers", { room: room, socketId: socket.id });
      socket.on("loadPlayers", playerList => {
        // console.log(players);
        for (let player of playerList) {
          players[player] = this.physics.add.sprite(100, 100, "player");
          players[player].setScale(0.1);
          players[player].setCollideWorldBounds(true);
        }
      });
      socket.on("insertPlayer", socketId => {
        players[socketId] = this.physics.add.sprite(100, 100, "player");
        players[socketId].setScale(0.1);
        players[socketId].setCollideWorldBounds(true);
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
        players[socketId].destroy();
        delete players[socketId];
      });
      w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    };
    const update = function() {
      if (players[socket.id]) {
        socket.emit("updatePlayerPosition", {
          room: room,
          socketId: socket.id,
          xy: players[socket.id].getCenter(vector)
        });
        if (d.isDown) {
          players[socket.id].body.velocity.x = moveSpeed;
        }
        if (a.isDown) {
          players[socket.id].body.velocity.x = -moveSpeed;
        }
        if (w.isDown) {
          players[socket.id].body.velocity.y = -moveSpeed;
        }
        if (s.isDown) {
          players[socket.id].body.velocity.y = moveSpeed;
        }
        if (d.isUp && players[socket.id].body.velocity.x > 0) {
          players[socket.id].body.velocity.x = 0;
        }
        if (a.isUp && players[socket.id].body.velocity.x < 0) {
          players[socket.id].body.velocity.x = 0;
        }
        if (w.isUp && players[socket.id].body.velocity.y < 0) {
          players[socket.id].body.velocity.y = 0;
        }
        if (s.isUp && players[socket.id].body.velocity.y > 0) {
          players[socket.id].body.velocity.y = 0;
        }
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
