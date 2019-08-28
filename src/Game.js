import React, { useEffect } from "react";
import Phaser from "phaser";
import { Link } from "react-router-dom";
let gaming;
let vector;

export default function Game({ socket }) {
  return (
    <Link to="/ballkicking">
      <div>Please click on Ball Kicking instead</div>
    </Link>
  );

  useEffect(() => {
    // if (!gaming) {
    if (true) {
      let background;
      // let cuteSchoolGirl;
      let allCuteGirls = {};
      // let cuteSchoolGirl2;
      let w, a, s, d;
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
          default: "arcade",
          arcade: {
            // gravity: { y: 300 },
            debug: true
          }
        },
        scene: {
          preload,
          create,
          update
        },
        parent: "game"
      };

      gaming = new Phaser.Game(config);
      vector = new Phaser.Math.Vector2();
      // setGame(new Phaser.Game(config));
      function preload() {
        console.log(1);
        this.load.image("kobayashi", "assets/sumoGame/kanna.jpg");
        this.load.image("cuteSchoolGirl", "assets/sumoGame/move.png");
        //--------------------------------

        //-------------------

        //-----------------------------------------
      }
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      function create() {
        console.log("LOOK AT ME CONNECTING!!!", socket.id);

        //----EVERYTHING NEW------------------------------------------

        socket.emit("serverStage1", socket.id);
        socket.on("clientStage1", requester => {
          console.log("Helps to get the postion");
          let data = {};
          if (requester === socket.id) {
            data = { socketId: socket.id, xy: { x: 100, y: 100 } };
          } else {
            data = {
              socketId: socket.id,
              xy: allCuteGirls[socket.id].getCenter(vector)
            };
          }
          socket.emit("serverStage2", data);
        });
        socket.on("clientStage2", data => {
          console.log("now append all");
          if (!allCuteGirls[data.socketId]) {
            allCuteGirls[data.socketId] = this.physics.add.sprite(
              data.xy.x,
              data.xy.y,
              "cuteSchoolGirl"
            );
            allCuteGirls[data.socketId].setScale(0.2);
            allCuteGirls[data.socketId].setCollideWorldBounds(true);
            allCuteGirls[data.socketId].setBounce(1);
            if (data.socketId === socket.id) {
              allCuteGirls[data.socketId].body.gravity.y = 300;
            }
          }
          console.log("SHOW ME IT");
          console.log(allCuteGirls);
        });

        socket.on("killSchoolGirl", socketId => {
          console.log("killing school girl");
          allCuteGirls[socketId].destroy();
          delete allCuteGirls[socketId];
        });

        //--Just background--
        background = this.add.image(
          config.width / 2,
          config.height / 2,
          "kobayashi"
        );
        background.setDisplaySize(config.width, config.height);
        //-------------------------------------------------------------

        socket.on("testRequestFromServer", data => {
          console.log("The request from server has been received", data);
        });

        // cuteSchoolGirl = this.physics.add.sprite(100, 100, "cuteSchoolGirl");
        // cuteSchoolGirl.setScale(0.2);
        // cuteSchoolGirl.setCollideWorldBounds(true);
        // cuteSchoolGirl.setBounce(0.8);
        // w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        // a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        // s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        // d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // this.physics.add.collider(cuteSchoolGirl, cuteSchoolGirl2, () => {
        //   console.log("collided");
        // });
        socket.on("receivePlayerPos", data => {
          if (allCuteGirls[data.socketId]) {
            allCuteGirls[data.socketId].x = data.xy.x;
            allCuteGirls[data.socketId].y = data.xy.y;
          }
        });
      }

      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      //------------------------------------------------------------------------------
      function update() {
        if (allCuteGirls[socket.id]) {
          socket.emit("updatePlayerPos", {
            socketId: socket.id,
            xy: allCuteGirls[socket.id].getCenter(vector)
          });
        }
        // if (a.isDown) {
        //   cuteSchoolGirl.body.acceleration.x += -20;
        // }
        // if (d.isDown) {
        //   cuteSchoolGirl.body.acceleration.x += 20;
        // }
        // if (w.isDown) {
        //   cuteSchoolGirl.body.acceleration.y += -20;
        //   socket.emit("testRequestFromClient", socket.id);
        // }
        // if (s.isDown) {
        //   cuteSchoolGirl.body.acceleration.y += 20;
        // }
        // if (cuteSchoolGirl.body.onFloor()) {
        // }
        // console.log(cuteSchoolGirl.getCenter(vector));
      }
    }

    return function cleanup() {
      console.log("CLEAN UP RUN");

      // socket.emit("switchTab", socket.id);
      // allCuteGirls = {};
      gaming.destroy(true);
    };
  }, []);

  return <div id="game"></div>;
}
