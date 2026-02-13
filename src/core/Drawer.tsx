import React, { useContext } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import DescriptionIcon from "@mui/icons-material/Description";

import { AppContext } from "../App";
import { AppAction, AppContextValue } from "../types/app";

type DrawerIcon = "addnext" | "queue" | "completed" | "description";

interface DrawerElement {
  label: string;
  icon?: DrawerIcon;
  event?: AppAction | string;
  payload?: unknown;
  fn?: () => void;
}

interface DrawerContent {
  typeContent?: "list";
  content?: DrawerElement[];
}

const IconRendered: React.FC<{ icons?: DrawerIcon; color?: "primary" | "secondary" | "inherit" }> = ({
  icons = "completed",
  color = "primary",
}) => {
  switch (icons) {
    case "addnext":
      return <QueuePlayNextIcon color={color} />;
    case "queue":
      return <AddToQueueIcon color={color} />;
    case "completed":
      return <DoneOutlineIcon color={color} />;
    case "description":
      return <DescriptionIcon color={color} />;
    default:
      return <DoneOutlineIcon color={color} />;
  }
};

const ListDrawer: React.FC<{ elements?: DrawerElement[]; onItemSelected: () => void }> = ({ elements = [], onItemSelected }) => {
  const { dispatch } = useContext(AppContext);

  return (
    <>
      {elements.map((element, index) => (
        <List component="nav" key={index}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                if (element.event) {
                  if (typeof element.event === "string") {
                    dispatch({
                      type: element.event,
                      ...(element.payload ? { payload: element.payload } : {}),
                    } as AppAction);
                  } else {
                    dispatch(element.event);
                  }
                }
                if (element.fn) {
                  element.fn();
                }
                onItemSelected();
              }}
            >
              <ListItemIcon>
                <IconRendered icons={element.icon} />
              </ListItemIcon>
              <ListItemText primary={element.label} />
            </ListItemButton>
          </ListItem>
        </List>
      ))}
    </>
  );
};

const DrawerComponent: React.FC = () => {
  const { dispatch, state } = useContext(AppContext) as AppContextValue;
  const { drawer = false, drawerContent = {} as DrawerContent } = state as {
    drawer?: boolean;
    drawerContent?: DrawerContent;
  };
  const { typeContent, content } = drawerContent;

  const onCloseDrawer = () => dispatch({ type: "drawer", payload: { status: false } });
  const onOpenDrawer = () => dispatch({ type: "drawer", payload: { status: true } });

  return (
    <SwipeableDrawer anchor="bottom" onClose={onCloseDrawer} onOpen={onOpenDrawer} open={drawer}>
      {typeContent === "list" && <ListDrawer elements={content} onItemSelected={onCloseDrawer} />}
    </SwipeableDrawer>
  );
};

export default DrawerComponent;
