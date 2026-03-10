import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
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
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
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

// Time values from HTMLAudioElement (currentTime/duration) are in **seconds**.
const formatTime = (seconds: number | null | undefined) => {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "00:00";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const formatRemaining = (durationSeconds?: number, currentSeconds?: number | null) => {
  if (typeof durationSeconds !== "number" || typeof currentSeconds !== "number") return "∞";
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(currentSeconds) || durationSeconds <= 0) return "∞";

  const remaining = Math.max(0, Math.floor(durationSeconds - currentSeconds));
  if (!Number.isFinite(remaining)) return "∞";
  return "- " + formatTime(remaining);
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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const theme = useTheme();
  const showExpand = useMediaQuery(theme.breakpoints.up("sm"));
  const history = useHistory();

  const [showSpeed, setShowSpeed] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [saved, setSaved] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [thumbHidden, setThumbHidden] = useState(false);

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
  const podcasts = Array.isArray(state.podcasts) ? state.podcasts : [];
  const currentPodcast = podcasts.find(
    (pod) => pod.domain === state.audioOrigin || pod.url === state.audioOrigin || pod.feed === state.audioOrigin
  );
  const activePodcastImage = state.podcastImage || currentPodcast?.image || null;

  useEffect(() => {
    setThumbHidden(false);
  }, [activePodcastImage]);

  useEffect(() => {
    let active = true;

    // Respect the global toggle: if podcast view theming is disabled, don't compute palettes.
    if (state.podcastViewEnabled === false) {
      setPalette(null);
      return () => {
        active = false;
      };
    }

    if (!activePodcastImage) {
      setPalette(null);
      return () => {
        active = false;
      };
    }

    getImagePalette(activePodcastImage).then((colors) => {
      if (active) setPalette(colors);
    });
    return () => {
      active = false;
    };
  }, [activePodcastImage, state.podcastViewEnabled]);

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

  // Slider values should work in seconds. Compute safe, clamped values here.
  const sliderMax =
    typeof state.duration === "number" && Number.isFinite(state.duration) && state.duration > 0
      ? state.duration
      : 1;
  const sliderValue = (() => {
    const ct = typeof state.currentTime === "number" && Number.isFinite(state.currentTime) && state.currentTime >= 0 ? state.currentTime : 0;
    return Math.min(Math.max(ct, 0), sliderMax);
  })();

  const handleSeek = (_ev: Event, value: number | number[]) => {
    const seconds = Array.isArray(value) ? value[0] : value;
    // Convert seconds -> percent because engine.seek expects a percentage value (0-100).
    const dur = typeof state.duration === "number" && Number.isFinite(state.duration) && state.duration > 0 ? state.duration : 1;
    let percent = dur > 0 ? Math.round((seconds / dur) * 100) : 0;
    if (!Number.isFinite(percent) || percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    props.seek(_ev, percent);
  };

  const setExpanded = (value: boolean) => {
    saveStorage(value);
    setOpen(value);
    try {
      dispatch({ type: "setPlayerExpanded", payload: value } as any);
    } catch (_) {
      // ignore type errors at runtime
    }
  };

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const swipeThreshold = 56;
    if (Math.abs(deltaY) < swipeThreshold) return;
    if (Math.abs(deltaY) < Math.abs(deltaX)) return;

    if (open && deltaY > 0) {
      setExpanded(false);
    }

    if (!open && deltaY < 0) {
      setExpanded(true);
    }
  };

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
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={(theme) =>
          open
            ? {
                borderTop: `1px solid ${paletteStyles.accent}`,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: paletteStyles.primary,
                zIndex: (theme) => theme.zIndex.appBar + 10,
              }
            : {
                bottom: "3.50rem",
                width: "100%",
                borderTop: `1px solid ${paletteStyles.accent}`,
                backgroundColor: paletteStyles.primary,
                position: "fixed",
                zIndex: (theme) => theme.zIndex.appBar + 2,
                height: "3.50rem",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }
        }
      >
        {open && (
          <Grid container direction="row-reverse">
            <Grid item sx={{ padding: ".5rem" }}>
              <IconButton
                onClick={() => setExpanded(false)}
                sx={{ color: paletteStyles.text }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        )}

        {state.episodeInfo && (open ? (
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
                      marginBottom: "5vh",
                      borderRadius: "16px",
                      boxShadow: `0 24px 60px ${toRGBA(palette?.primary, 0.35)}`,
                      maxWidth: "460px",
                    }}
                    src={activePodcastImage || undefined}
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
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem 0", width: "100%" }}>
                      <Slider
                        value={sliderValue}
                        max={sliderMax}
                        onChange={handleSeek}
                        sx={{ width: "100%", maxWidth: 720, mx: 0, my: 0, color: paletteStyles.accent }}
                      />

                      {/* Primary control row */}
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, width: "100%", maxWidth: 720, mt: 1 }}>
                        <IconButton onClick={props.rewind} sx={{ color: paletteStyles.text }}>
                          <SkipPreviousIcon />
                        </IconButton>
                        <IconButton onClick={props.handler} sx={{ color: paletteStyles.text }}>
                          {state.status === "paused" ? <PlayArrowIcon /> : <PauseIcon />}
                        </IconButton>
                        <IconButton onClick={props.forward} sx={{ color: paletteStyles.text }}>
                          <SkipNextIcon />
                        </IconButton>
                      </Box>

                      {/* Secondary control row: smaller, visually lighter */}
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, width: "100%", maxWidth: 720, mt: 1, opacity: 0.85, '& .MuiIconButton-root': { padding: '6px' } }}>
                        <SleepTimer onClick={setShowTimer} color={paletteStyles.subText} />
                        <SpeedControl onClick={setShowSpeed} color={paletteStyles.subText} />
                        <IconButton onClick={() => setSaved((s) => !s)} sx={{ color: paletteStyles.subText }}>
                          {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 720, mt: 1 }}>
                        <Typography
                          sx={{
                            color: paletteStyles.text,
                            fontSize: theme.typography.body1.fontSize,
                            fontWeight: theme.typography.fontWeightRegular,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {formatTime(state.currentTime)}
                        </Typography>
                        <div style={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              color: paletteStyles.subText,
                              fontSize: theme.typography.body1.fontSize,
                              fontWeight: theme.typography.fontWeightRegular,
                              fontVariantNumeric: "tabular-nums",
                            }}
                            variant="caption"
                          >
                            {(() => {
                              const duration = state.duration;
                              const currentTime = state.currentTime;
                              if (typeof duration !== "number" || typeof currentTime !== "number") return "∞";
                              if (!Number.isFinite(duration) || !Number.isFinite(currentTime) || duration <= 0) return "∞";

                              const remaining = Math.max(0, duration - currentTime);
                              return `- ${formatTime(remaining)}`;
                            })()}
                          </Typography>
                        </div>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        ) : (
          // Minimized single-row layout
          <div
            style={{ display: "flex", alignItems: "center", width: "100%", padding: "0 0.75rem", gap: "8px" }}
            onClick={() => {
              // Expand when the minimized bar itself is clicked
              setExpanded(true);
            }}
          >
            {activePodcastImage && !thumbHidden && (
              <img
                src={activePodcastImage}
                alt="Podcast"
                onError={() => setThumbHidden(true)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "fit-content" }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Explicit expand affordance
                  setExpanded(true);
                }}
                sx={{ color: paletteStyles.text }}
                aria-label="Expand player"
              >
                <ExpandLessIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  props.rewind();
                }}
                sx={{ color: paletteStyles.text }}
              >
                <SkipPreviousIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  props.handler();
                }}
                sx={{ color: paletteStyles.text }}
              >
                {state.status === "paused" ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  props.forward();
                }}
                sx={{ color: paletteStyles.text }}
              >
                <SkipNextIcon fontSize="small" />
              </IconButton>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", margin: "0 8px" }}>
              <Slider
                size="small"
                value={sliderValue}
                max={sliderMax}
                onChange={(e, v) => {
                  // Prevent the container click from firing while interacting with the slider
                  try {
                    (e as Event & { stopPropagation?: () => void }).stopPropagation?.();
                  } catch (_) {}
                  handleSeek(e as Event, v as number);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                sx={{ color: paletteStyles.accent, mx: 0, my: 0 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "72px" }}>
              <Typography sx={{ color: paletteStyles.subText }} variant="caption">
                {formatTime(state.currentTime)}
              </Typography>
              <Typography sx={{ color: paletteStyles.subText }} variant="caption">
                {formatRemaining(state.duration, state.currentTime)}
              </Typography>
            </div>
          </div>
        ))}
      </Card>
    </>
  ) : null;
};

export default MediaControlCard;
