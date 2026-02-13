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
import Loading from "../../core/Loading";

import {
  getPopularPodcasts,
  searchForPodcasts,
  PodcastSearchResult,
  PopularPodcastsResponse,
} from "./engine";

const Header: React.FC = () => (
  <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
    <Grid>
      <Toolbar variant="dense">
        <Grid item xs={8}>
          <Typography variant="h6">Discover</Typography>
        </Grid>
        <Grid item md={4} xs={12}></Grid>
      </Toolbar>
    </Grid>
  </AppBar>
);

const getFinalURL = async (url: string): Promise<string> => {
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

const GridRender: React.FC<{ casts: PodcastSearchResult[]; getClickHandler: (rss: string) => () => void }> = ({
  casts,
  getClickHandler,
}) => (
  <Grid container>
    {casts
      ? casts.map((podcast) => (
          <Grid key={podcast.title} item xs={12} sm={6} md={4} lg={3}>
            <List dense component="nav" aria-label="top podcast" key={podcast.title}>
              <ListItem disablePadding>
                <ListItemButton onClick={getClickHandler(podcast.rss)}>
                  <img style={{ width: "8em", marginRight: ".5em" }} alt={podcast.title} src={podcast.thumbnail} />

                  <ListItemText
                    primaryTypographyProps={{
                      noWrap: true,
                      component: "span",
                      variant: "subtitle1",
                    }}
                    secondaryTypographyProps={{
                      noWrap: true,
                      component: "span",
                    }}
                    primary={podcast.title}
                    secondary={podcast.publisher}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Grid>
        ))
      : null}
  </Grid>
);

interface DiscoverProps {
  addPodcastHandler: (podcastUrl: string, cb: () => void) => void;
  actionAfterClick: () => void;
}

interface DiscoverState {
  init: number;
  loading: boolean;
  podcasts: PodcastSearchResult[];
  error: unknown;
  loadContent: boolean;
  term: string;
  top: PodcastSearchResult[] | null;
  results: string;
  name: string | null;
  trendingLoading: boolean;
  trendingError: boolean;
  errorMessage?: string;
}

const Discover: React.FC<DiscoverProps> = ({ addPodcastHandler, actionAfterClick }) => {
  const [state, setState] = useState<DiscoverState>({
    init: 0,
    loading: false,
    podcasts: [],
    error: null,
    loadContent: false,
    term: "",
    top: null,
    results: "",
    name: null,
    trendingLoading: true,
    trendingError: false,
  });

  const loadTrending = useCallback((genreId: number | null = null) => {
    setState((prev) => ({ ...prev, trendingLoading: true, trendingError: false }));
    getPopularPodcasts(genreId).then((response: PopularPodcastsResponse) => {
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

  const updatePodcasts = ({ podcasts, value }: { podcasts: PodcastSearchResult[]; value: string }) => {
    if (podcasts.length < 1) {
      setState((prev) => ({ ...prev, results: "empty", podcasts: [] }));
      return;
    }
    setState((prev) => ({ ...prev, podcasts, term: value, results: "" }));
  };

  const getClickHandler = (domain: string) => {
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

  const genreHandler = (genreId: number) => {
    setState((prev) => ({ ...prev, podcasts: [], results: "", term: "" }));
    loadTrending(genreId || null);
  };

  const { podcasts, top, results, trendingLoading, trendingError } = state;
  const casts = podcasts.length > 0 ? podcasts : top || [];
  const isShowingSearch = podcasts.length > 0;
  const sectionLabel = isShowingSearch ? "Results" : state.name || "Trending";

  const renderContent = () => {
    if (results === "empty") {
      return <Typography variant={"h6"}>No results were found.</Typography>;
    }
    if (isShowingSearch) {
      return <GridRender casts={casts} getClickHandler={getClickHandler} />;
    }
    if (trendingLoading) {
      return (
        <Typography align="center" style={{ paddingTop: "20%" }} letterSpacing={6} variant="h4">
          <Loading />
        </Typography>
      );
    }
    if (trendingError) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" gutterBottom>
            Failed to load trending podcasts.
          </Typography>
          {state.errorMessage ? (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              {state.errorMessage}
            </Typography>
          ) : null}
          <Button variant="outlined" onClick={() => loadTrending(state.init || null)}>
            Retry
          </Button>
        </Box>
      );
    }
    return <GridRender casts={casts} getClickHandler={getClickHandler} />;
  };

  return (
    <>
      <Header />
      <Card>
        <CardContent>
          <Box sx={{ maxWidth: 760, mx: "auto", px: 1 }}>
            <Search<PodcastSearchResult> handleChange={searchForPodcasts} updatePodcasts={updatePodcasts} />
            <Box sx={{ pb: 1 }}>
              <Geners getPopularPodcasts={genreHandler} selected={state.init} />
            </Box>
          </Box>

          <Typography variant={"h6"} sx={{ mt: 2, mb: 1 }}>
            {results !== "empty" && sectionLabel}
          </Typography>
          {renderContent()}
        </CardContent>
      </Card>
      <Backdrop
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 1,
          color: "#fff",
        })}
        open={state.loadContent || false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default Discover;
