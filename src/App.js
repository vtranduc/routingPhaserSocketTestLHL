import React from "react";
// import logo from './logo.svg';
import "./App.css";
import Nav from "./Nav";
import Home from "./Home";
import About from "./About";
import Shop from "./Shop";
import ItemDetail from "./ItemDetail";
import Game from "./Game";
import BallKicking from "./BallKicking";
import Soccer from "./Soccer";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from "socket.io-client";

const serverPORT = 3001;

// const socket = io(`:${serverPORT}`);
// console.log("Do not repeat this!");

function App() {
  const socket = io(`:${serverPORT}`);
  return (
    <Router>
      {socket ? (
        <div className="App">
          <Nav />
          <Switch>
            <Route path="/about" exact component={About} />
            <Route path="/shop" exact component={Shop} />
            <Route path="/shop/:id" component={ItemDetail} />
            <Route
              path="/game"
              exact
              render={() => {
                return <Game socket={socket} />;
              }}
            />
            <Route
              path="/ballkicking"
              exact
              render={() => {
                return <BallKicking socket={socket} />;
              }}
            />
            <Route
              path="/soccer"
              exact
              render={() => {
                return <Soccer socket={socket} />;
              }}
            />
            <Route path="/" exact component={Home} />
          </Switch>
        </div>
      ) : (
        <h1>Loading socket...</h1>
      )}
    </Router>
  );
}

// const Home = function() {
//   return (
//     <div>
//       <h1>Home Page</h1>
//     </div>
//   );
// };

export default App;
