import React, { useContext } from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { AppContext } from "../App.js";

import QueuePlayNextIcon from "@material-ui/icons/QueuePlayNext";
import AddToQueueIcon from "@material-ui/icons/AddToQueue";
import DoneOutlineIcon from "@material-ui/icons/DoneOutline";
import DescriptionIcon from '@material-ui/icons/Description';

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
              // Support both forms:
              // - event is an action object: { type, ... }
              // - event is a string type + optional payload
              if (typeof element.event === "string") {
                dispatch({ type: element.event, ...(element.payload ? { payload: element.payload } : {}) });
              } else {
                dispatch(element.event);
              }
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
