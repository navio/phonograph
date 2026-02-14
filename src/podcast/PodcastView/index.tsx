import React, { useRef, useContext, useEffect, useState } from "react";
import PodcastEngine from "podcastsuite";
import Typography from "@mui/material/Typography";

import { AppContext } from "../../App";
import { AppContextValue } from "../../types/app";
import useOnline from "../../engine/useOnline";
import { PODCASTVIEW, DISCOVERVIEW } from "../../constants";
import { recordEpisode as saveEpisodeState } from "../../reducer";
import { getImagePalette, Palette } from "../../core/podcastPalette";
import Loading from "../../core/Loading";
import EpisodeList from "./EpisodeList";
import PodcastHeader from "./PodcastHeader";

type Episode = any;
type Podcast = any;

const commonRules = (originalUrl: string) => {
  if (!originalUrl) return "";
  let url = originalUrl;
  url = url.indexOf("http:") > -1 ? url.replace("http:", "https:") : url;
  url = url.search("http") < 0 ? "https://" + url : url;
  url =
    url.indexOf("feeds.feedburner") > -1 && url.indexOf("?format=xml") === -1
      ? url + "?format=xml"
      : url;
  return url;
};

const PodcastView: React.FC<{ history: { push: (path: string) => void } }> = (props) => {
  let bringAPodcast = window.location.href.split(`${PODCASTVIEW}/`)[1];

  if (bringAPodcast) {
    try {
      new URL(bringAPodcast);
    } catch {
      bringAPodcast = atob(bringAPodcast);
    }
  }

  const { state: global, debug, engine, dispatch, player, playerRef } = useContext(AppContext) as AppContextValue;
  const [podcast, setPodcast] = useState<Podcast>({});
  const [error, setError] = useState<{ message?: string; error?: unknown }>({});
  const [shouldRefresh, setToRefresh] = useState(Date.now());
  const [palette, setPalette] = useState<Palette | null>(null);

  const podcastURL = commonRules(bringAPodcast || (global.current as string));

  const episodes = useRef<Map<string, Episode>>(new Map());

  const loadEpisodes = (pod: Podcast) => pod.forEach((episode: Episode) => episodes.current.set(episode.guid, episode));

  const getPodcast = async (save = false) => {
    try {
      const fresh = navigator.onLine ? undefined : Infinity;
      const castContent = await (engine as any).getPodcast(podcastURL, { save, fresh });
      const newPodcast = {
        items: castContent.items,
        title: castContent.title,
        description: castContent.description,
        image: castContent.image,
        link: castContent.url,
        lastUpdated: Date.now(),
        domain: podcastURL,
        url: podcastURL,
        author: castContent.author,
        created: Date.now(),
      } as Podcast;
      setPodcast(newPodcast);
      loadEpisodes(newPodcast.items);
      setError({});

      return { castContent, newPodcast };
    } catch (err: any) {
      setError({ error: err, message: `There was a problem loading the podcast.` });
      setTimeout(() => props.history.push(DISCOVERVIEW), 3000);
      return null;
    }
  };

  const savePodcast = async () => {
    const result = await getPodcast(true);
    if (!result) return;
    const { newPodcast } = result;
    const { items, description, link, created, ...allPodcast } = newPodcast;
    dispatch({ type: "updatePodcasts", podcasts: [...global.podcasts, allPodcast] });
  };

  const removePodcast = async () => {
    await (PodcastEngine as any).db.del(podcastURL);
    const podcastsState = global.podcasts;
    const podcasts = podcastsState.filter((cast) => cast.url !== podcastURL);
    dispatch({ type: "updatePodcasts", podcasts });
  };

  const recordEpisode = async (state: any) => {
    const { current, episode, currentTime, duration } = state;
    await saveEpisodeState(current, episode, currentTime, duration);
    setToRefresh(Date.now());
  };

  const updateMediaSession = (state: any) => {
    if ("mediaSession" in navigator) {
      const { episodeInfo, podcastAuthor, podcastImage, title } = state;
      const { title: episodeTitle } = episodeInfo || {};

      if (!episodeTitle) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: episodeTitle,
        artist: podcastAuthor,
        album: title,
        artwork: podcastImage
          ? [
              { src: podcastImage, sizes: "96x96", type: "image/png" },
              { src: podcastImage, sizes: "128x128", type: "image/png" },
              { src: podcastImage, sizes: "192x192", type: "image/png" },
              { src: podcastImage, sizes: "256x256", type: "image/png" },
              { src: podcastImage, sizes: "384x384", type: "image/png" },
              { src: podcastImage, sizes: "512x512", type: "image/png" },
            ]
          : [],
      });
    }
  };

  const updateMediaSessionState = (value: MediaSessionPlaybackState) => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = value;
    }
  };

  const playNext = (pod: Podcast) => (guid: string) => {
    const episode = episodes.current.get(guid);
    if (!episode) return;
    const payload = {
      audioOrigin: podcastURL,
      media: episode.enclosures[0].url,
      playing: guid,
      status: "playing",
      played: 0,
      episodeInfo: episode,
      podcastImage: pod.image,
      podcastAuthor: pod.author,
    } as any;

    dispatch({ type: "addNext", payload });
  };

  const playLast = (pod: Podcast) => (guid: string) => {
    const episode = episodes.current.get(guid);
    if (!episode) return;
    const payload = {
      audioOrigin: podcastURL,
      media: episode.enclosures[0].url,
      playing: guid,
      status: "playing",
      played: 0,
      episodeInfo: episode,
      podcastImage: pod.image,
      podcastAuthor: pod.author,
    } as any;

    dispatch({ type: "addLast", payload });
  };

  const playButton = (guid: string, currentTime: number, pod: Podcast) => (_ev: React.MouseEvent) => {
    const episode = episodes.current.get(guid);
    const audio = playerRef?.current || player;

    if (!episode || !audio) {
      return;
    }

    if (global.playing === guid) {
      if (global.status === "paused") {
        audio
          .play()
          .then(() => {
            if (currentTime) {
              audio.currentTime = currentTime;
            }
          })
          .catch(() => {});
        updateMediaSessionState("playing");
        dispatch({ type: "playingStatus", status: "playing" });
        recordEpisode(global);
      } else {
        try {
          audio.pause();
          recordEpisode(global);
        } catch {
          // ignore
        }
        dispatch({ type: "playingStatus", status: "paused" });
      }
    } else {
      const proxy = !debug ? "" : "";

      audio.setAttribute("src", proxy + (episode.media || episode.enclosures[0]?.url));

      const payload: any = {
        audioOrigin: podcastURL,
        media: episode.enclosures[0].url,
        playing: guid,
        status: "playing",
        played: 0,
        episodeInfo: episode,
        podcastImage: pod.image,
        podcastAuthor: pod.author,
        currentTime,
      };

      updateMediaSessionState("playing");
      updateMediaSession(payload);

      if (global.playing) {
        const { audioOrigin, media, playing, status, played, episodeInfo, podcastImage, podcastAuthor, currentTime: prevCurrentTime, playlist = [] } = global as any;

        const prevPodcasts = {
          audioOrigin,
          media,
          playing,
          status,
          played,
          episodeInfo,
          podcastImage,
          podcastAuthor,
          currentTime: prevCurrentTime,
        };

        payload.playlist = [prevPodcasts, ...playlist];
      }

      if (currentTime) {
        audio.currentTime = currentTime;
      }

      recordEpisode(global);
      dispatch({ type: "audioUpdate", payload });
    }
  };

  const isPodcastInLibrary = () => global.podcasts.some((cast) => cast.url === podcastURL);

  useEffect(() => {
    setToRefresh(Date.now());
  }, [global.refresh]);

  useEffect(() => {
    getPodcast();
  }, []);

  useEffect(() => {
    if (!podcast.image) {
      setPalette(null);
      return;
    }
    let active = true;
    getImagePalette(podcast.image).then((colors) => {
      if (active) setPalette(colors);
    });
    return () => {
      active = false;
    };
  }, [podcast.image]);

  return podcast.domain ? (
    <>
      <PodcastHeader
        savePodcast={savePodcast}
        podcast={podcast}
        removePodcast={removePodcast}
        inLibrary={isPodcastInLibrary}
        palette={palette}
      />
      <EpisodeList
        episodes={podcast.items || []}
        podcast={podcast}
        handler={playButton}
        playNext={playNext(podcast)}
        playLast={playLast(podcast)}
        status={global.status as any}
        playing={global.playing as any}
        current={global.current as any}
        shouldRefresh={shouldRefresh}
        palette={palette}
      />
    </>
  ) : (
    <Typography align="center" style={{ paddingTop: "20%" }} letterSpacing={6} variant="h4">
      <Loading />
      <br />
      {error && error.message}
      <br />
      {error && error.error && error.error.toString()}
    </Typography>
  );
};

export default PodcastView;
