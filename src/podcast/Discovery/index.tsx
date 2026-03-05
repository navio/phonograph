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
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { FormattedMessage, useIntl } from "react-intl";
import Search from "./Search";
import Geners from "./Geners";
import Loading from "../../core/Loading";
import HeroCarousel from "./HeroCarousel";

import {
  getPopularPodcasts,
  searchForPodcasts,
  PodcastSearchResult,
  PopularPodcastsResponse,
  resolveApplePodcastFeedUrl,
} from "./engine";

const Header: React.FC = () => (
  <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
    <Grid>
      <Toolbar variant="dense">
        <Grid item xs={8}>
          <Typography variant="h6">
            <FormattedMessage id="discover.title" defaultMessage="Discover" />
          </Typography>
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

const GridRender: React.FC<{ casts: PodcastSearchResult[]; onPodcastClick: (podcast: PodcastSearchResult) => void }> = ({ casts, onPodcastClick }) => (
  <Grid container>
    {casts
      ? casts.map((podcast) => (
          <Grid key={podcast.title} item xs={12} sm={6} md={4} lg={3}>
            <List dense component="nav" aria-label="top podcast" key={podcast.title}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => onPodcastClick(podcast)}>
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
  const intl = useIntl();
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
        setState((prev) => ({ ...prev, trendingLoading: false, trendingError: true, init: genreId || 0, errorMessage: response.errorMessage }));
      } else {
        setState((prev) => ({ ...prev, ...response, trendingLoading: false, trendingError: false, errorMessage: undefined }));
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

  const extractAppleIdFromUrl = (maybeUrl?: string) => {
    if (!maybeUrl) return null;
    const m = String(maybeUrl).match(/\/id(\d+)/);
    return m && m[1] ? m[1] : null;
  };

  const onPodcastClick = (podcast: PodcastSearchResult) => {
    setState((prev) => ({ ...prev, loadContent: true, errorMessage: undefined }));

    const go = async () => {
      let feedUrl = (podcast && podcast.rss) || "";
      if (!feedUrl) {
        const id = podcast.appleId || extractAppleIdFromUrl(podcast.itunesUrl) || null;
        if (id) {
          const resolved = await resolveApplePodcastFeedUrl(String(id));
          if (resolved) feedUrl = resolved;
        }
      }

      if (!feedUrl) {
        throw new Error("Could not resolve podcast feed URL");
      }

      const finalUrl = await getFinalURL(feedUrl);
      addPodcastHandler(finalUrl, actionAfterClick);
    };

    go()
      .catch((err) => {
        console.error(err);
        setState((prev) => ({ ...prev, errorMessage: String(err?.message || err) }));
      })
      .finally(() => setState((prev) => ({ ...prev, loadContent: false })));
  };

  const genreHandler = (genreId: number) => {
    setState((prev) => ({ ...prev, podcasts: [], results: "", term: "" }));
    loadTrending(genreId === 0 ? null : genreId);
  };

  const { podcasts, top, results, trendingLoading, trendingError } = state;
  const casts = podcasts.length > 0 ? podcasts : top || [];
  const isShowingSearch = podcasts.length > 0;
  const sectionLabel = isShowingSearch
    ? intl.formatMessage({ id: "discover.results", defaultMessage: "Results" })
    : state.name || intl.formatMessage({ id: "discover.top", defaultMessage: "Top Podcasts" });

  // Show a top-hero carousel when we're not searching and we have at least 3 trending items
  const showHero = !isShowingSearch && !trendingLoading && !trendingError && top && top.length >= 3;

  const renderContent = () => {
    if (results === "empty") {
      return (
        <Typography variant={"h6"}>
          <FormattedMessage id="discover.noResults" defaultMessage="No results were found." />
        </Typography>
      );
    }
    if (isShowingSearch) {
      return <GridRender casts={casts} onPodcastClick={onPodcastClick} />;
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
            <FormattedMessage id="discover.loadFailed" defaultMessage="Failed to load trending podcasts." />
          </Typography>
          {state.errorMessage ? (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              {state.errorMessage}
            </Typography>
          ) : null}
          <Button variant="outlined" onClick={() => loadTrending(state.init || null)}>
            <FormattedMessage id="common.retry" defaultMessage="Retry" />
          </Button>
        </Box>
      );
    }
    return <GridRender casts={casts} onPodcastClick={onPodcastClick} />;
  };

  return (
    <>
      <Header />
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ maxWidth: 760, mx: "auto", px: 1, pb: 1 }}>
            <Search<PodcastSearchResult> handleChange={searchForPodcasts} updatePodcasts={updatePodcasts} />
            {showHero ? <HeroCarousel items={top!} onItemClick={onPodcastClick} /> : null}
            <Geners getPopularPodcasts={genreHandler} selected={state.init} />
          </Stack>

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
