import React, { useRef, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import useOnline from '../../engine/useOnline';
import { PODCASTVIEW, DISCOVERVIEW } from '../../constants';
import { recordEpisode as saveEpisodeState } from '../../reducer'
import { getImagePalette } from "../../core/podcastPalette";

import Loading from '../../core/Loading';

import EpisodeList from "./EpisodeList";
import PodcastHeader from "./PodcastHeader";
import PodcastEngine from "podcastsuite";
import Typography from "@mui/material/Typography";

const commonRules = (originalUrl) => {
  if (!originalUrl) return;
  let url = originalUrl;
  url = url.indexOf("http:") > -1 ? url.replace("http:", "https:") : url;
  url = url.search("http") < 0 ? "https://" + url : url;
  url =
    url.indexOf("feeds.feedburner") > -1 && url.indexOf("?format=xml") === -1
      ? url + "?format=xml"
      : url;
  return url;
};

export default (props) => {

  let bringAPodcast = window.location.href.split(`${PODCASTVIEW}/`)[1];

  if (bringAPodcast) {
    try {
      new URL(bringAPodcast);
    } catch{
      bringAPodcast = atob(bringAPodcast)
    }
  }

  const { state: global, debug, engine, dispatch, player, playerRef } = useContext(AppContext);
  // console.log('ar',global, engine, player)
  const [podcast, setPodcast] = useState({});
  const [error, setError] = useState({});
  const [shouldRefresh, setToRefresh] = useState(Date.now());
  const [palette, setPalette] = useState(null);

  const podcastURL = commonRules(bringAPodcast || global.current);

  const episodes = useRef(new Map());

  const loadEpisodes = (podcast) => podcast.forEach((episode) => episodes.current.set(episode.guid, episode));

  const getPodcast = async (save = false) => {

    try {
      const fresh = navigator.onLine ? undefined : Infinity;
      // console.log('freshStatus', fresh);
      const castContent = await engine.getPodcast(podcastURL, { save, fresh });
      // console.log(castContent);
      let newPodcast = {
        items: castContent.items,
        title: castContent.title,
        description: castContent.description,
        image: castContent.image,
        link: castContent.url,
        lastUpdated: Date.now(),
        domain: podcastURL,
        url: podcastURL,
        author: castContent.author,
        created: (Date.now()),
      };
      setPodcast(newPodcast);
      loadEpisodes(newPodcast.items);
      setError({});

      return { castContent, newPodcast };

    } catch (error) {
      console.log(error);
      setError({ error, message: `There was a problem loading the podcast.` })
      setTimeout(() => props.history.push(DISCOVERVIEW), 3000);
    }
  }

  const savePodcast = async () => {
    const { newPodcast } = await getPodcast(true);
    const { items, description, link, created, ...allPodcast } = newPodcast;
    dispatch({ type: 'updatePodcasts', podcasts: [...global.podcasts, allPodcast] })
  }

  const removePodcast = async () => {
    await PodcastEngine.db.del(podcastURL);
    const podcastsState = global.podcasts;
    const podcasts = podcastsState.filter((podcast) => podcast.url !== podcastURL);
    dispatch({ type: 'updatePodcasts', podcasts });

  }

  const recordEpisode = async (state) => {
    const { current, episode, currentTime, duration } = state;
    await saveEpisodeState(current, episode, currentTime, duration);
    await setToRefresh(Date.now());
  };

  const updateMediaSession = (state) => {

    if ('mediaSession' in navigator) {
      const { episodeInfo, podcastAuthor, podcastImage, title } = state;
      const { title: episodeTitle } = episodeInfo;


      navigator.mediaSession.metadata = new MediaMetadata({
        title: episodeTitle,
        artist: podcastAuthor,
        album: title,
        artwork: [
          { src: podcastImage,  sizes: '96x96',   type: 'image/png' },
          { src: podcastImage, sizes: '128x128', type: 'image/png' },
          { src: podcastImage, sizes: '192x192', type: 'image/png' },
          { src: podcastImage, sizes: '256x256', type: 'image/png' },
          { src: podcastImage, sizes: '384x384', type: 'image/png' },
          { src: podcastImage, sizes: '512x512', type: 'image/png' },
        ]
      });
    }
  }

  const updateMediaSessionState = (state) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  const playNext = (podcast) => (guid) => {
    const episode = episodes.current.get(guid);
    const payload = {
      audioOrigin: podcastURL,
      // episode: episode.guid,
      media: episode.enclosures[0].url,
      playing: guid,
      status: "playing",
      played: 0,
      episodeInfo: episode,
      podcastImage: podcast.image,
      podcastAuthor: podcast.author,
    };

    dispatch({ type: 'addNext', payload });
  }

  const playLast = (podcast) => (guid) => {
    const episode = episodes.current.get(guid);
    const payload = {
      audioOrigin: podcastURL,
      // episode: episode.guid,
      media: episode.enclosures[0].url,
      playing: guid,
      status: "playing",
      played: 0,
      episodeInfo: episode,
      podcastImage: podcast.image,
      podcastAuthor: podcast.author,
    };

    dispatch({ type: 'addLast', payload });
  }

  const playButton = (guid, currentTime, podcast) => (ev) => {
    const episode = episodes.current.get(guid);
    const audio = playerRef?.current || player;

    if (!audio) {
      console.warn("Audio element not ready yet.");
      return;
    }

    if (global.playing === guid) {
      if (global.status === "paused") {
        audio.play().then(() => {
          if (currentTime) {
            audio.currentTime = currentTime;
          }
        })
        updateMediaSessionState('playing');
        dispatch({ type: 'playingStatus', status: "playing" });
        recordEpisode(global)
      } else {
        audio.pause().then(
          () => recordEpisode(global)
        );
        dispatch({ type: 'playingStatus', status: "paused" });
        
      }
    } else {

      const proxy = !debug ? '' : '';
      console.log('loading new audio', audio);

      audio.setAttribute("src", proxy+episode.media);

      const payload = {
        audioOrigin: podcastURL,
        // episode: episode.guid,
        media: episode.enclosures[0].url,
        playing: guid,
        status: "playing",
        played: 0,
        episodeInfo: episode,
        podcastImage: podcast.image,
        podcastAuthor: podcast.author,
        currentTime
      };

      updateMediaSessionState('playing');
      updateMediaSession(payload);

      if (global.playing) {

        const {
          audioOrigin,
          media,
          playing,
          status,
          played,
          episodeInfo,
          podcastImage,
          podcastAuthor,
          currentTime: prevCurrentTime,
          playlist = [],
        } = global;

        const prevPodcasts = {
          audioOrigin,
          media,
          playing,
          status,
          played,
          episodeInfo,
          podcastImage,
          podcastAuthor,
          currentTime: prevCurrentTime
        };


        payload.playlist = [prevPodcasts, ...playlist];
      }


      if (currentTime) {
        console.log('setting time', currentTime)
        audio.currentTime = currentTime;
      }

      recordEpisode(global);
      dispatch({ type: 'audioUpdate', payload });
    }
  };

  const isPodcastInLibrary = () => global.podcasts.some((cast) => cast.url === podcastURL);


  useEffect(() => {
    console.log('should refresh from global')
    setToRefresh(Date.now());
  }, [global.refresh]);

  useEffect(() => {
    getPodcast()
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

  return podcast.domain ? <>
    <PodcastHeader
      savePodcast={savePodcast}
      podcast={podcast}
      removePodcast={removePodcast}
      inLibrary={isPodcastInLibrary}
      palette={palette}
    />
    <EpisodeList
      episodes={podcast.items}
      podcast={podcast}
      handler={playButton}
      playNext={playNext(podcast)}
      playLast={playLast(podcast)}
      status={global.status}
      playing={global.playing}
      current={global.current}
      shouldRefresh={shouldRefresh}
      palette={palette}
    />
  </>
    : <Typography align='center' style={{ paddingTop: '20%' }} letterSpacing={6} variant="h4">
      <Loading />
      <br />
      {error && error.message}<br />
      {error && error.error && error.error.toString()}
    </Typography>

}
