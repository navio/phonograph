import React, { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Search from "./Search";
import Geners from "./Geners";
import Loading from '../../core/Loading';

import { getPopularPodcasts, searchForPodcasts } from './engine';


const Header = ({ searchHandler }) => (
  <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
    <Grid>
      <Toolbar variant="dense">
        <Grid item xs={8}>
          <Typography variant="h6">Discover</Typography>
        </Grid>
        <Grid item md={4} xs={12}>
        </Grid>
      </Toolbar>
    </Grid>
  </AppBar>
);

const getFinalURL = async (url) => {
  const URL = `${window.location.origin}/api/findFinal/?term=${encodeURIComponent(url)}`;
  try {
    const data = await fetch(URL);
    const result = await data.json();

    return result.url;
  } catch (error) {
    console.error("getFinalURL failed, falling back to original URL:", error);
    return url;
  }
};

const GridRender = ({ casts, getClickHandler }) => {
  return <Grid container>
  {casts ?
    casts.map((podcast) => (
      <Grid key={podcast.title} item xs={12} sm={6} md={4} lg={3}>
        <List
          dense
          component="nav"
          aria-label="top podcast"
          key={podcast.title}
        >
          <ListItem disablePadding>
            <ListItemButton onClick={getClickHandler(podcast.rss)}>
            <img
              style={{ width: "8em", marginRight:".5em" }}
              alt={podcast.title}
              src={podcast.thumbnail}
            />

            <ListItemText
              primaryTypographyProps={{
                noWrap: true,
                elementtype: "span",
                variant:'subtitle1'
              }}
              secondaryTypographyProps={{
                noWrap: true,
                elementtype: "span",
              }}
              primary={podcast.title}
              secondary={podcast.publisher}
            />
            </ListItemButton>
          </ListItem>
        </List>
      </Grid>
    )) : null }
</Grid>
};

const Discover = ({ addPodcastHandler, actionAfterClick }) => {
  const [state, setState] = useState({
    init: 0,
    loading: false,
    podcasts: [],
    error: null,
    loadContent: false,
    term: '',
    top: null,
    results: '',
    name: null,
    trendingLoading: true,
    trendingError: false,
  });

  const loadTrending = useCallback((genreId = null) => {
    setState((prev) => ({ ...prev, trendingLoading: true, trendingError: false }));
    getPopularPodcasts(genreId).then((response) => {
      if (response.error) {
        setState((prev) => ({ ...prev, trendingLoading: false, trendingError: true, init: genreId || 0 }));
      } else {
        setState((prev) => ({ ...prev, ...response, trendingLoading: false, trendingError: false }));
      }
    });
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const updatePodcasts = ({ podcasts, value }) => {
    if (podcasts.length < 1) {
      setState((prev) => ({ ...prev, results: 'empty', podcasts: [] }));
      return;
    }
    setState((prev) => ({ ...prev, podcasts, term: value, results: '' }));
  };

  const getClickHandler = (domain) => {
    return () => {
      setState((prev) => ({ ...prev, loadContent: true }));
      getFinalURL(domain)
        .then((finalDomain) => {
          setState((prev) => ({ ...prev, loadContent: false }));
          addPodcastHandler(finalDomain, actionAfterClick);
        })
        .catch(console.error);
    };
  };

  const searchHandler = (a, b) => {
    const { id } = b;
    const domain = `https://www.listennotes.com/c/r/${id}`;
    setState((prev) => ({ ...prev, loadContent: true }));
    getFinalURL(domain)
      .then((finalDomain) => {
        addPodcastHandler(finalDomain, actionAfterClick);
        setState((prev) => ({ ...prev, loadContent: false }));
      })
      .catch(console.error);
  };

  const genreHandler = (genreId) => {
    loadTrending(genreId || null);
  };

  const { podcasts, top, results, trendingLoading, trendingError } = state;
  const casts = podcasts.length > 0 ? podcasts : top;
  const isShowingSearch = podcasts.length > 0;
  const sectionLabel = isShowingSearch ? "Results" : (state.name || "Trending");

  const renderContent = () => {
    if (results === 'empty') {
      return <Typography variant={'h6'}>No results were found.</Typography>;
    }
    if (isShowingSearch) {
      return <GridRender casts={casts} getClickHandler={getClickHandler} />;
    }
    if (trendingLoading) {
      return (
        <Typography align='center' style={{ paddingTop: '20%' }} letterSpacing={6} variant="h4">
          <Loading />
        </Typography>
      );
    }
    if (trendingError) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" gutterBottom>Failed to load trending podcasts.</Typography>
          <Button variant="outlined" onClick={() => loadTrending(state.init || null)}>Retry</Button>
        </Box>
      );
    }
    return <GridRender casts={casts} getClickHandler={getClickHandler} />;
  };

  return <>
        <Header searchHandler={searchHandler} />
        <Card>
          <CardContent>
          <Search handleChange={searchForPodcasts} updatePodcasts={updatePodcasts} />
          <Geners getPopularPodcasts={genreHandler} selected={state.init} />
          <Typography variant={"h6"} >
              { results !== 'empty' && sectionLabel }
          </Typography>
          { renderContent() }
          </CardContent>
        </Card>
        <Backdrop
          sx={(theme) => ({
            zIndex: theme.zIndex.drawer + 1,
            color: "#fff",
          })}
          open={state.loadContent || false}>
          <CircularProgress color="inherit" />
        </Backdrop>
    </>;
};

export default Discover;
