import React, {useRef, useContext, useEffect, useState} from 'react';
import {AppContext} from '../../App';
import useOnline from '../../engine/useOnline';
import {PODCASTVIEW, DISCOVERY} from '../../constants';
import { recordEpisode as saveEpisodeState } from '../../reducer'

import Loading from '../../core/Loading';

import EpisodeList from "./EpisodeList";
import PodcastHeader from "./PodcastHeader";
import PodcastEngine from "podcastsuite";
import Typography from "@material-ui/core/Typography";

const commonRules = (originalUrl) => {
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
    if(bringAPodcast){
      try {
        new URL(bringAPodcast);
      }catch{
        bringAPodcast = atob(bringAPodcast)
      }
    }

    const {state: global , engine, dispatch, player } = useContext(AppContext);
    const [ podcast, setPodcast ] = useState({});
    const [ error, setError ] = useState({});
    const [shouldRefresh, setToRefresh] = useState(Date.now());
    
    const podcastURL = commonRules(bringAPodcast || global.current);

    const episodes = useRef(new Map());

    const loadEpisodes = (podcast) => podcast.forEach((episode) => episodes.current.set(episode.guid, episode));

    const getPodcast = async (save = false ) => {
          
        try {
        const online = useOnline();
        console.log('Im online',online);
        const getFromMemory = online ? null : Infinity;
        const castContent = await engine.getPodcast(podcastURL, { save });

        let newPodcast = {
            items: castContent.items,
            title: castContent.title,
            description: castContent.description,
            image: castContent.image,
            link: castContent.url,
            lastUpdated: Date.now(),
            domain: podcastURL,
            url:podcastURL,
            created: (Date.now())
        };
        setPodcast(newPodcast);
        loadEpisodes(newPodcast.items);
        setError({});

        return { castContent, newPodcast };

      } catch (error){
        setError({error, message: 'Error loading podcast'})
        setTimeout(()=>props.history.push(DISCOVERY),3000);
      }
    }

    const savePodcast = async () => {
        const {newPodcast} = await getPodcast(true);
        const {items, description, link, created, ...allPodcast } = newPodcast;
        dispatch({ type:'updatePodcasts', podcasts: [...global.podcasts, allPodcast ] })
    }

    const removePodcast = async () => {
        await PodcastEngine.db.del(podcastURL);
        const podcastsState = global.podcasts;
        const podcasts = podcastsState.filter((podcast) => podcast.url !== podcastURL);
        dispatch({type:'updatePodcasts', podcasts});
  
    }

    const recordEpisode = async (state) => {
      const {current, episode, currentTime, duration} = state;
      await saveEpisodeState(current, episode, currentTime, duration);
      await setToRefresh(Date.now());
    }

    const playButton = (guid, currentTime) => (ev) => {
        const episode = episodes.current.get(guid);
      
        if (global.playing === guid) {
          if (global.status === "pause") {
            player.play().then(() => {
              if(currentTime){
                console.log('setting time',currentTime)
                player.currentTime = currentTime;
              }
            })
            dispatch({ type: 'playingStatus', status: "playing" });
            recordEpisode(global)
          } else {
            player.pause();
            dispatch({ type: 'playingStatus', status: "pause" });
            recordEpisode(global)
          }
        } else {
          console.log('loading new audio')
          player.setAttribute("src", episode.enclosures[0].url);
         
          
          const payload = {
            audioOrigin: podcastURL,
            // episode: episode.guid,
            media: episode.enclosures[0].url,
            playing: guid,
            status: "playing",
            played: 0,
            episodeInfo: episode,
          }
          if(currentTime){
            console.log('setting time',currentTime)
            player.currentTime = currentTime;
            payload.currentTime = currentTime;
          }
         
          recordEpisode(global);
          dispatch({ type:'audioUpdate', payload });
        }
    };
    
    const isPodcastInLibrary = () => global.podcasts.some((cast) => cast.url === podcastURL);


    useEffect(()=>{
      console.log('should refresh from global')
       setToRefresh(Date.now());
    },[global.refresh]);

    useEffect(()=>{
        getPodcast()
    },[]);
    
    return  podcast.domain ? <>
    <PodcastHeader  
        savePodcast={savePodcast} 
        podcast={podcast} 
        removePodcast={removePodcast} 
        inLibrary={isPodcastInLibrary} 
    />
    <EpisodeList
        episodes={podcast.items}
        handler={playButton}
        status={global.status}
        playing={global.playing}
        current={global.current}
        shouldRefresh={shouldRefresh}
    /> 
    </>
    : <Typography align='center' style={{paddingTop: '20%' }} letterSpacing={6} variant="h4"> <Loading  /> <br /> { error && error.message }</Typography>
                        
}

