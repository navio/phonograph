import React, { useContext, useMemo, useRef, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Skeleton from "@mui/material/Skeleton";
import { FormattedMessage, useIntl } from "react-intl";

import { AppContext } from "../App";
import { AppContextValue, PodcastEntry } from "../types/app";
import { prefetchSavedPodcasts } from "./prefetchSavedPodcasts";
import phono from "../../public/phono.svg";

interface LibraryProps {
  addPodcastHandler: () => void;
  actionAfterSelectPodcast: () => void;
}

const hashToIndex = (input: string, modulo: number) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  const n = Math.abs(hash);
  return modulo === 0 ? 0 : n % modulo;
};

const PodcastCover: React.FC<{ src?: string; alt: string; bgColor: string }> = ({ src, alt, bgColor }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    // If IntersectionObserver is not available, load immediately.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      {
        root: null,
        // Start loading slightly before it scrolls into view.
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const finalSrc = !errored && src ? src : phono;

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        pt: "100%",
        bgcolor: bgColor,
        overflow: "hidden",
      }}
    >
      {inView ? (
        <Box
          component="img"
          src={finalSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          // @ts-ignore fetchPriority is supported by modern Chromium-based browsers
          fetchPriority="low"
          width={512}
          height={512}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}

      {!loaded ? (
        <Skeleton
          variant="rectangular"
          sx={{
            position: "absolute",
            inset: 0,
          }}
        />
      ) : null}
    </Box>
  );
};

const LibraryView: React.FC<LibraryProps> = ({ addPodcastHandler, actionAfterSelectPodcast }) => {
  const theme = useTheme();
  const intl = useIntl();
  const { state, dispatch, engine } = useContext(AppContext) as AppContextValue;
  const podcasts = (state.podcasts as PodcastEntry[]) || [];

  useEffect(() => {
    const domains = podcasts
      .map((podcast) => podcast.domain)
      .filter((domain): domain is string => Boolean(domain));

    void prefetchSavedPodcasts(engine as any, domains);
  }, [engine, podcasts]);

  const colorSwatches = useMemo(
    () => [
      theme.palette.primary.light,
      theme.palette.primary.main,
      theme.palette.primary.dark,
      theme.palette.secondary.light,
      theme.palette.secondary.main,
      theme.palette.secondary.dark,
    ],
    [
      theme.palette.primary.light,
      theme.palette.primary.main,
      theme.palette.primary.dark,
      theme.palette.secondary.light,
      theme.palette.secondary.main,
      theme.palette.secondary.dark,
    ]
  );

  const processClick = (domain: string) => {
    dispatch({ type: "loadPodcast", payload: domain });
    actionAfterSelectPodcast();
  };

  return (
    <>
      <AppBar sx={{ WebkitAppRegion: "drag" }} position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">
            <FormattedMessage id="library.title" defaultMessage="Library" />
          </Typography>
        </Toolbar>
      </AppBar>

      <Fab
        color="secondary"
        aria-label={intl.formatMessage({ id: "a11y.addPodcast", defaultMessage: "Add podcast" })}
        sx={{
          position: "fixed",
          zIndex: 1,
          right: "8%",
          bottom: "18%",
          margin: "0 auto",
        }}
        onClick={() => addPodcastHandler()}
      >
        <AddIcon />
      </Fab>

      <Grid container spacing={0} direction={"row"}>
        {podcasts.length > 0 ? (
          podcasts
            .filter((p) => !!p?.domain)
            .map((podcast) => {
              const domain = podcast.domain as string;
              const bgColor = colorSwatches[hashToIndex(domain, colorSwatches.length)];
              const title = (podcast.title as string) || intl.formatMessage({ id: "common.podcast", defaultMessage: "Podcast" });

              return (
                <Grid item xs={3} sm={2} md={1} key={domain}>
                  <Card raised>
                    <CardActionArea onClick={() => processClick(domain)}>
                      <PodcastCover src={(podcast.image as string) || undefined} alt={title} bgColor={bgColor} />
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })
        ) : (
          <Typography
            sx={{
              display: "block",
              width: "100%",
              marginTop: "18%",
              color: theme.palette.text.secondary,
            }}
            align="center"
            variant="h5"
          >
            <img width={"85rem"} src={phono} alt="phonograph logo" loading="lazy" decoding="async" />
            <br />
            <FormattedMessage id="library.noPodcasts" defaultMessage="No podcasts bookmarked." />
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default LibraryView;
