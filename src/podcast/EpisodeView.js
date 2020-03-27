import React, { setState, useContext } from "react";
import { Consumer } from "../App.js";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";

export default () => {
  const consumer = useContext(Consumer);
  console.log(consumer);
  return <Card>Load</Card>;
};
