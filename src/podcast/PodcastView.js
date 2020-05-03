import React, {useRef, useContext, useEffect, useState} from 'react';
import {AppContext} from '../App';
import EpisodeList from "./EpisodeList";
import PodcastHeader from "./PodcastHeader";
import PodcastEngine from "podcastsuite";
// const PodcastView = React.lazy( async () => await import("./podcast/PodcastView"));


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

    const {state: global , engine, dispatch, player } = useContext(AppContext);
    const [ podcast, setPodcast ] = useState({});
    const podcastURL = commonRules(global.current);

    const episodes = useRef(new Map());

    const loadEpisodes = (podcast) => podcast.forEach((episode) => episodes.current.set(episode.guid, episode));

    const getPodcast = async (save = false ) => {
        const castContent = await engine.getPodcast(podcastURL, { save });

        let newPodcast = {
            items: castContent.items.slice(0, 20),
            title: castContent.title,
            description: castContent.description,
            image: castContent.image,
            link: castContent.url,
            lastUpdated: Date.now(),
            domain: podcastURL,
            url:podcastURL
        };
        setPodcast(newPodcast);
        loadEpisodes(newPodcast.items);
        
        return { castContent, newPodcast };
    }

    const savePodcast = async () => {
        const {newPodcast} = await getPodcast(true);
        dispatch({ type:'updatePodcasts', podcasts: [...global.podcasts, newPodcast  ] })
    }

    const removePodcast = async () => {
        await PodcastEngine.db.del(podcastURL);
        const podcastsState = global.podcasts;
        const podcasts = podcastsState.filter((podcast) => podcast.url !== podcastURL);
        dispatch({type:'updatePodcasts', podcasts})
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
          dispatch({ type:'audioUpdate', payload:{
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
    
    return <>
            { podcast && <> 
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
                        }</>   
}

