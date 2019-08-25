import React, { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";
import Axios from "axios";
// import { Link } from "react-router-dom";

function Item({ match }) {
  const [item, setItem] = useState(null);
  useEffect(() => {
    Axios.get(
      `https://fortnite-public-api.theapinetwork.com/prod09/item/get?ids=${match.params.id}`
    )
      .then(res => {
        console.log("sucessfullly loaded item");
        console.log(res.data);
        setItem(res.data);
        // console.log("--------------------------");
        // console.log(res.data);
      })
      .catch(err => {
        console.log("failed to load the item", err);
      });
  }, [match.params.id]);

  return (
    <div>
      {item ? (
        <div>
          <h1>{item.name}</h1>
          <img src={item.images.transparent} alt={item.name} />
        </div>
      ) : (
        <h1>Loading item</h1>
      )}
    </div>
    // {item && (<div>
    //   <h1>{item.name}</h1>
    //   <img src={item.images.transparent}/>
    // </div>)}
  );
}

export default Item;
