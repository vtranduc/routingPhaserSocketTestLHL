import React, { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";
import Axios from "axios";
import { Link } from "react-router-dom";

function Shop() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    Axios.get(
      "https://fortnite-public-api.theapinetwork.com/prod09/upcoming/get"
    )
      .then(res => {
        console.log("sucessful response");
        console.log(res.data.items);
        setItems(res.data.items);
      })
      .catch(err => console.log("Failed to load API: ", err));
  }, []);

  return (
    <div>
      {items.map(item => {
        return (
          <Link key={item.itemid} to={`/shop/${item.itemid}`}>
            <h1>{item.name}</h1>
          </Link>
        );
      })}
    </div>
  );
}

export default Shop;
