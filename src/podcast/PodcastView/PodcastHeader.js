import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  CardMedia,
  Grid,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Favorite from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Alert from "@mui/material/Alert";

import { clearText } from "./EpisodeList";
import { Consumer } from "../../App.js";
import { useHistory } from "react-router-dom";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const prod = DEBUG ? '' : ''

function PodcastHeader(props) {
  const { inLibrary, savePodcast, removePodcast } = props;
  const theme = useTheme();
  const showDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  let history = useHistory();
  const isInLibrary = inLibrary()
  const saveThisPodcastToLibrary = (ev) => {
    savePodcast(ev);
    setMessage("Podcast Added to Library");
    setOpen(true);
  };

  const backHandler = () => history.goBack();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // const colorThief = new ColorThief();

  const makeMeAHash = (url) => btoa(url);


  const shareLink = !!(navigator.share || navigator.clipboard);
  const share = (title, text, url) => {
    if (navigator.share) {
      return () =>
        navigator.share({
          title,
          text,
          url,
        });
    } else if (navigator.clipboard) {
      return () => {
        navigator.clipboard.writeText(`${title} ${url.toString()}`);
        setMessage("Link copied to clipboard");
        setOpen(true);
      };
    } else {
      return false;
    }
  };

  return (
    <Consumer>
      {(data) => {
        const state = props.podcast;
        return (
          <>
            <Snackbar
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              autoHideDuration={4000}
            >
              <Alert elevation={6} variant="filled" severity="success">
                {message}
              </Alert>
            </Snackbar>
            <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
              <Toolbar variant="dense">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h6">
                      <IconButton
                        size="small"
                        aria-label="back"
                        onClick={backHandler}
                      >
                        <ArrowBackIcon style={{ color: "#fff" }} />
                      </IconButton>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {isInLibrary ? (
                      <Tooltip title="Remove from library" placement="bottom">
                        <IconButton
                          size="small"
                          sx={{ color: "#fff", float: "right" }}
                          onClick={removePodcast}
                          aria-label="Remove from Library"
                        >
                          <Favorite />
                        </IconButton>
                      </Tooltip>
                    ) : (
                        <Tooltip title="Add to Library" placement="bottom">
                          <IconButton
                            size="small"
                            sx={{ color: "#fff", float: "right" }}
                            onClick={saveThisPodcastToLibrary}
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    {shareLink && (
                      <Tooltip title="Share Podcast" placement="bottom">
                        <IconButton
                          sx={{ color: "#fff", float: "right" }}
                          size="small"
                          onClick={share(
                            "Phonograph",
                            state.title,
                            `${document.location.origin}/podcast/${makeMeAHash(state.domain)}`
                          )}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Toolbar>
            </AppBar>
            <Grid sx={{ paddingBottom: "1em" }} container>
              <Grid item xs={12} md={4}>
                {state.image && (
                  <>
                    {showDesktop ? (
                      <CardMedia
                        sx={{ margin: 1, padding: 5, height: "20em" }}
                        image={prod + state.image}
                        title={`${state.title} cover`}
                      />
                    ) : (
                      <CardMedia
                        sx={{ height: "20em" }}
                        image={state.image}
                        title={`${state.title} cover`}
                      />
                    )}
                  </>
                )}
              </Grid>
              <Grid item sm={12} md={8}>
                <Box sx={{ mb: "1rem" }}>
                  {showDesktop ? (
                    <>
                    <Typography
                      sx={{
                        marginTop: 0.375,
                        whiteSpace: "pre-wrap",
                        marginLeft: 1.25,
                        paddingRight: "1em",
                        lineClamp: 2,
                      }}
                      variant="h4"
                      noWrap
                    >
                      {state.title}
                    </Typography>
                    <Typography
                      align={"justify"}
                      sx={{
                        maxHeight: "14vh",
                        marginTop: "1em",
                        overflow: "hidden",
                        marginLeft: ".5em",
                        paddingRight: "1em",
                      }}
                      color="textSecondary"
                    >
                      {clearText(state.description)}
                    </Typography>
                    </>
                  ) : (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          sx={{
                            marginTop: 0.375,
                            whiteSpace: "pre-wrap",
                            marginLeft: 1.25,
                            paddingRight: "1em",
                            lineClamp: 2,
                          }}
                          variant="h6"
                          noWrap
                        >
                          {state.title}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {clearText(state.description)}
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ pt: 2, textAlign: "right" }}>
                {!isInLibrary &&
                  <Button onClick={saveThisPodcastToLibrary}
                    style={{ marginRight: '1rem' }} variant="outlined" color="secondary" >Subscribe</Button>}
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ marginLeft: ".5rem" }}>
                  <b>Episodes:</b> {state.items.length}
                </Typography>
              </Grid>
            </Grid>
          </>
        );
      }}
    </Consumer>
  );
}

export default PodcastHeader;
