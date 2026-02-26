import React, { useContext, useState, useEffect, useMemo } from "react";
import { Slider, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useHistory } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import SkipPreviousIcon from "@mui/icons-material/Replay10";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/Forward30";
import LinearProgress from "@mui/material/LinearProgress";
import { Grid, Card } from "@mui/material";
import CloseIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { AppContext } from "../App";
import { AppContextValue } from "../types/app";
import SpeedControl from "./SpeedControl";
import SleepTimer from "./SleepTimer";
import { PODCASTVIEW } from "../constants";
import { getImagePalette, toRGBA, buildThemeFromPalette, Palette, PaletteTheme } from "./podcastPalette";

const toMinutes = (totalTime?: number, currentTime?: number | null) => {
  if (typeof totalTime !== "number" || typeof currentTime !== "number") return "∞";
  const remaining = Math.floor(totalTime - currentTime);
  if (!Number.isFinite(remaining)) return "∞";
  return "- " + convertMinsToHrsMins(remaining);
};

const toMin = (theTime: number | null | undefined) =>
  typeof theTime === "number"
    ? convertMinsToHrsMins(Math.floor(theTime))
    : `00:00`;

const convertMinsToHrsMins = (mins: number) => {
  if (!Number.isInteger(mins)) return "";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

interface MediaControlProps {
  player: HTMLAudioElement;
  handler: () => void;
  forward: () => void;
  rewind: () => void;
  seek: (event: Event, value: number | number[]) => void;
}

const MediaControlCard: React.FC<MediaControlProps> = (props) => {
  const { state, dispatch } = useContext(AppContext) as AppContextValue;
  const [open, setOpen] = useState<boolean>(false);
  const theme = useTheme();
  const showExpand = useMediaQuery(theme.breakpoints.up("sm"));
  const history = useHistory();

  const [showSpeed, setShowSpeed] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [palette, setPalette] = useState<Palette | null>(null);

  const saveStorage = (value: boolean) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("openPlayer", JSON.stringify(value));
  };

  const hotkeys = (toggle: React.Dispatch<React.SetStateAction<boolean>>) => {
    const handler = (ev: KeyboardEvent) => {
      const { target, key } = ev;
      if (document.body === target && key === "Escape") {
        toggle((value) => {
          saveStorage(!value);
          return !value;
        });
      }
    };

    document.body.addEventListener("keydown", handler);
    return () => document.body.removeEventListener("keydown", handler);
  };

  const toOrigin = (audioOrigin: string) => () => {
    dispatch({ type: "updateCurrent", payload: audioOrigin });
    history.push(PODCASTVIEW);
  };

  const { media, playing } = state;
  const episodeInfo = state.episodeInfo;

  useEffect(() => {
    let active = true;

    // Respect the global toggle: if podcast view theming is disabled, don't compute palettes.
    if (state.podcastViewEnabled === false) {
      setPalette(null);
      return () => {
        active = false;
      };
    }

    if (!state.podcastImage) {
      setPalette(null);
      return () => {
        active = false;
      };
    }

    getImagePalette(state.podcastImage).then((colors) => {
      if (active) setPalette(colors);
    });
    return () => {
      active = false;
    };
  }, [state.podcastImage, state.podcastViewEnabled]);

  const paletteStyles: PaletteTheme = useMemo(() => {
    if (!palette) {
      return {
        primary: theme.palette.background.paper,
        secondary: theme.palette.background.default,
        accent: theme.palette.secondary.main,
        text: theme.palette.text.primary,
        subText: theme.palette.text.secondary,
        accentText: theme.palette.text.primary,
      } as PaletteTheme;
    }

    return (
      buildThemeFromPalette(palette) || {
        primary: theme.palette.background.paper,
        secondary: theme.palette.background.default,
        accent: theme.palette.secondary.main,
        text: theme.palette.text.primary,
        subText: theme.palette.text.secondary,
        accentText: theme.palette.text.primary,
      }
    );
  }, [
    palette,
    theme.palette.background.default,
    theme.palette.background.paper,
    theme.palette.secondary.main,
    theme.palette.text.primary,
    theme.palette.text.secondary,
  ]);

  useEffect(() => {
    const overflow = "overflow: hidden;";
    if (open && playing) {
      document.body.style.cssText = overflow;
    } else {
      document.body.style.cssText = "";
    }
  }, [open, playing]);

  useEffect(() => setOpen(true), [media]);
  useEffect(() => {
    const { episodeInfo } = state;
    if (episodeInfo === null) {
      document.body.style.cssText = "";
    }
  }, [state.episodeInfo]);

  const played = typeof state.played === "number" ? state.played : Number(state.played || 0);
  const loaded = typeof state.loaded === "number" ? state.loaded : Number(state.loaded || 0);

  useEffect(() => {
    const cleanup = hotkeys(setOpen);
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("openPlayer");
      if (stored !== null) {
        setOpen(stored === "true");
      }
    }
    return cleanup;
  }, []);

  return state.episodeInfo ? (
    <>
      <Card
        variant="outlined"
        sx={(theme) =>
          open
            ? {
                borderTop: `1px solid ${paletteStyles.accent}`,
                position: "fixed",
                width: "100%",
                backgroundColor: paletteStyles.primary,
                zIndex: 50,
                height: "100%",
                top: 0,
              }
            : {
                bottom: "3.50rem",
                width: "100%",
                borderTop: `1px solid ${paletteStyles.accent}`,
                backgroundColor: paletteStyles.primary,
                position: "fixed",
                zIndex: 2,
              }
        }
      >
        {open && (
          <Grid container direction="row-reverse">
          <Grid item sx={{ padding: ".5rem" }}>
              <IconButton
                onClick={() => { saveStorage(!open); setOpen(false); }}
                sx={{ color: paletteStyles.text }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        )}
        {state.episodeInfo && (
          <div>
            {open && (
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={7} sm={6} md={4} lg={3}>
                  <img
                    style={{
                      width: "100%",
                      display: "block",
                      margin: "0 auto",
                      paddingBottom: "5vh",
                      borderRadius: "16px",
                      boxShadow: `0 24px 60px ${toRGBA(palette?.primary, 0.35)}`,
                      maxWidth: "460px",
                    }}
                    src={state.podcastImage}
                  />
                </Grid>
              </Grid>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {open && (
                <Typography
                  onClick={toOrigin(state.audioOrigin)}
                  align={"center"}
                  sx={(theme) => ({
                    padding: "10px 5px",
                    color: paletteStyles.text,
                  })}
                  variant="h6"
                  noWrap
                >
                  {episodeInfo?.title ?? ""}
                </Typography>
              )}

              {open && state.podcastAuthor && (
                <Typography variant="body2" align="center" gutterBottom sx={{ color: paletteStyles.subText }}>
                  {state.podcastAuthor}
                </Typography>
              )}

              {open && episodeInfo?.subtitle && (
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{
                    margin: "0 1em 1rem",
                    height: "rem",
                    display: "block",
                    overflow: "hidden",
                    color: paletteStyles.subText,
                  }}
                  gutterBottom
                >
                   {episodeInfo?.subtitle}
                </Typography>
              )}

              <div style={{ padding: "1rem" }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item xs={12} md={9}>
                    <div style={{ padding: "1rem 0" }}>
                      <Slider
                        value={typeof state.currentTime === "number" ? state.currentTime : 0}
                        max={typeof state.duration === "number" ? Math.round(state.duration) : 1}
                        onChange={props.seek}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <IconButton onClick={props.rewind} sx={{ color: paletteStyles.text }}>
                            <SkipPreviousIcon />
                          </IconButton>
                          <IconButton onClick={props.handler} sx={{ color: paletteStyles.text }}>
                            {state.status === "paused" ? <PlayArrowIcon /> : <PauseIcon />}
                          </IconButton>
                          <IconButton onClick={props.forward} sx={{ color: paletteStyles.text }}>
                            <SkipNextIcon />
                          </IconButton>

                          <Typography sx={{ color: paletteStyles.text }}>{toMin(state.played)}</Typography>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ textAlign: "right" }}>
                            <Typography sx={{ color: paletteStyles.subText }} variant="caption">
                              {toMinutes(state.duration, state.currentTime)}
                            </Typography>
                            <Typography sx={{ color: paletteStyles.subText }} variant="caption">
                              {toMin(state.currentTime)}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <SpeedControl />
                    </div>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  ) : null;
};

export default MediaControlCard;
