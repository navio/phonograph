import React, {useRef, useContext, useEffect, useState} from 'react';
import {AppContext} from '../../App';
import {PODCASTVIEW, DISCOVERY} from '../../constants';
import loadingAnimation from '../../../public/loading.svg';

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

export default () => {

    const bringAPodcast = window.location.href.split(`${PODCASTVIEW}/`)[1];

    const {state: global , engine, dispatch, player } = useContext(AppContext);
    const [ podcast, setPodcast ] = useState({});
    const [ error, setError ] = useState({});
    const podcastURL = commonRules(bringAPodcast || global.current);

    const episodes = useRef(new Map());

    const loadEpisodes = (podcast) => podcast.forEach((episode) => episodes.current.set(episode.guid, episode));

    const getPodcast = async (save = false ) => {

        try {
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
        setTimeout(()=>history.push(DISCOVERY),3000);
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

    const playButton = (guid) => () => {
        
        const episode = episodes.current.get(guid);
      
        if (global.playing === guid) {
          if (global.status === "pause") {
            player.play();
            dispatch({ type: 'playingStatus', status: "playing" });
          } else {
            player.pause();
            dispatch({ type: 'playingStatus', status: "pause" });
          }
        } else {
          console.log(episode.enclosures[0].url);
          player.setAttribute("src", episode.enclosures[0].url);
          player.play();
          dispatch({ type:'audioUpdate', payload: {
            audioOrigin: podcastURL,
            episode: episode.guid,
            title: episode.title,
            media: episode.enclosures[0].url,
            author: episode.itunes_author,
            playing: guid,
            status: "playing",
          }});
        }
    };
    
    const isPodcastInLibrary = () => global.podcasts.some((cast) => cast.url == global.current);

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
    /> 
    </>
    :<Typography align='center' letterSpacing={6} variant="h4"> <img src={loadingAnimation} width="20%" style={{paddingTop: '20%' }} /> <br /> { error && error.message }</Typography>
                        
}

