import React, { useState, useEffect } from "react";
//==FIX THIS==
const room = "testSoccerRoom";
//==============

export default function Soccer({ socket }) {
  // ---All game literals---

  const window = { height: 900, width: 1280, top: 150, left: 0 };
  // accel: How much window ratio's distance the player can cover
  // reverseAccel: How much times faster a reverse accel is. It should be above 1
  const physics = {
    accel: { x: 1.2, y: 1.2 },
    reverseAccel: { x: 3, y: 3 },
    resistance: { x: 1.2, y: 1.2 },
    wallBounce: 0.8
  };
  const ballPhysicsAndSpec = {
    size: { width: 0.1, height: 0.2 },
    resistance: { x: 1.2, y: 1.2 },
    wallBounce: 0.8,
    ballToPlayerMassRatio: 0.1
  };
  // NeglegibleVel is the velocity where the movement is approximate to zero
  // It is the ratio of the window per second
  const playerSpec = {
    size: { width: 0.1, height: 0.2 },
    negligibleVel: { x: 0.05, y: 0.05 }
  };

  //---------------------------------
  const [playersPos, setPlayersPos] = useState(null);

  useEffect(() => {
    socket.emit("addPlayerSelf", {
      socketId: socket.id,
      room: room,
      config: { window, playerSpec },
      physics: physics,
      ballPhysicsAndSpec: ballPhysicsAndSpec
    });
    socket.on("updateAllPlayers", allPos => {
      console.log("Received data from the server!");
      setPlayersPos(allPos);
    });
    return () => {
      console.log("Must unmount the entire game here");
      socket.removeListener("addPlayerSelf");
      socket.removeListener("updateAllPlayers");
      socket.emit("disconnectAssist", { socketId: socket.id, room: room });
    };
  }, []);

  const d = useKeyPress("d");
  const a = useKeyPress("a");
  const w = useKeyPress("w");
  const s = useKeyPress("s");

  useEffect(() => {
    socket.emit("handleKeyPress", {
      axis: "x",
      dir: d ? (a ? "" : "right") : a ? "left" : "",
      room: room,
      socketId: socket.id
    });
  }, [d, a]);
  useEffect(() => {
    socket.emit("handleKeyPress", {
      axis: "y",
      dir: w ? (s ? "" : "up") : s ? "down" : "",
      room: room,
      socketId: socket.id
    });
  }, [w, s]);

  return (
    <div>
      {playersPos && playersPos[socket.id] ? (
        <div>
          <h1>This is jayjaya</h1>
          <h2>{playersPos[socket.id].x}</h2>
          <img
            src="assets/soccer/field.jpg"
            style={{
              height: window.height,
              width: window.width,
              position: "absolute",
              top: window.top,
              left: window.left
            }}
          ></img>
          {Object.keys(playersPos).map(playerId => {
            return (
              <img
                key={playerId}
                src={"assets/soccer/player.png"}
                style={{
                  height: Math.floor(window.height * playerSpec.size.height),
                  width: Math.floor(window.width * playerSpec.size.width),
                  position: "absolute",
                  top: playersPos[playerId].y,
                  left: playersPos[playerId].x
                }}
              ></img>
            );
          })}
        </div>
      ) : (
        <p>Waiting for the game from server...</p>
      )}
    </div>
  );
}

const useKeyPress = function(targetKey) {
  const [key, setKey] = useState(false);
  const downHandler = function({ key }) {
    if (targetKey === key) {
      setKey(true);
    }
  };
  const upHandler = function({ key }) {
    if (targetKey === key) {
      setKey(false);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("updown", upHandler);
    };
  }, []);
  return key;
};
