import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslation } from "react-i18next";

function NavigationApp(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          margin: 0,
          zIndex: 4000,
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <IconButton
              sx={{ marginLeft: -1.5, marginRight: 2.5 }}
              color="inherit"
              aria-label={t("header.menu")}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h2"
              color="inherit"
            >
              {t("header.podcast")}
            </Typography>
            {/* <Button color="inherit">Login</Button> */}
          </Toolbar>
        </AppBar>
      </div>
      <div style={{ paddingTop: 62 }}></div>
    </div>
  );
}

export default NavigationApp;
