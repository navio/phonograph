import React, { useContext } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { AppContext } from "../App.js";

import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";

import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import DescriptionIcon from '@mui/icons-material/Description';

export default () => {
  const { dispatch, state } = useContext(AppContext);
  const { drawer = false, drawerContent = {} } = state;
  const { typeContent, content } = drawerContent;

  const onCloseDrawer = () =>
    dispatch({ type: "drawer", payload: { status: false } });
  const onOpenDrawer = () =>
    dispatch({ type: "drawer", payload: { status: true } });

  const IconRendered = ({icons = 'completed', color = 'primary' }) => {
    switch(icons){
      case 'addnext':
        return <QueuePlayNextIcon color={color} />
      case 'queue':
          return <AddToQueueIcon color={color} />
      case 'completed':
        return <DoneOutlineIcon color={color} />
      case 'description':
        return <DescriptionIcon color={color} />
      default:
        return <DoneOutlineIcon color={color} />
    }
  }
  const ListDrawer = ({ elements }) => {
    return elements.map((element, _) => (
      <List component="nav" key={_}>
        <ListItem
          button
          onClick={() => {
            if (element.event) {
              dispatch(element.event, element.payload);
            }
            if (element.fn) {
              element.fn();
            }
            onCloseDrawer();
          }}
        >
            <ListItemIcon>
              <IconRendered icons={element.icon} />
            </ListItemIcon> 
          <ListItemText primary={element.label} />
        </ListItem>
      </List>
    ));
  };

  return (
    <SwipeableDrawer
      anchor={"bottom"}
      onClose={onCloseDrawer}
      onOpen={onOpenDrawer}
      open={drawer}
    >
      {typeContent === "list" && <ListDrawer elements={content} />}
    </SwipeableDrawer>
  );
};
