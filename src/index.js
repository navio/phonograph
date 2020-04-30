import React, { Component } from "react";
import { render } from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import serviceWorker from "./serviceworker";

render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

!DEBUG && serviceWorker();
