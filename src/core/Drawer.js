import React, { useContext } from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { AppContext } from "../App.js";

export default () => {
  const { dispatch, state } = useContext(AppContext);
  const { drawer = false, drawerContent = {} } = state;
  const { typeContent, content} = drawerContent;

  const onCloseDrawer = () => dispatch({type:"drawer", payload: {status: false}  });
  const onOpenDrawer = () => dispatch({ type:"drawer", payload: {status: true} });

  const ListDrawer = ({elements}) => {
    return elements.map((element,_) => (
      <List component="nav" key={_}>
        <ListItem button
        onClick={() => {
          console.log(element);
          if(element.event){
            dispatch(element.event, element.payload);
          }
          if(element.fn){
            element.fn();
          }
            onCloseDrawer();
            }
        }>
          <ListItemText primary={element.label} />
        </ListItem>
      </List>
    ));
  }

  return (
    <SwipeableDrawer
      anchor={"bottom"}
      onClose={onCloseDrawer}
      onOpen={onOpenDrawer}
      open={drawer}
    >
      {(typeContent === 'list') && <ListDrawer elements={content} />}
    </SwipeableDrawer>
  );
};
