import React, {useRef, useContext, useEffect, useState} from 'react';
import {AppContext} from '../../App';
import EpisodeList from "./EpisodeList";
import PodcastHeader from "./PodcastHeader";
import PodcastEngine from "podcastsuite";
import Typography from "@material-ui/core/Typography";
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

export default (props) => {
    console.log(props);

    const {state: global , engine, dispatch, player } = useContext(AppContext);
    const [ podcast, setPodcast ] = useState({});
    const [ error, setError ] = useState({});
    const podcastURL = commonRules(global.current);
    console.log(podcastURL)
    const episodes = useRef(new Map());

    const loadEpisodes = (podcast) => podcast.forEach((episode) => episodes.current.set(episode.guid, episode));

    const getPodcast = async (save = false ) => {

        try {
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
        setError({});
        return { castContent, newPodcast };

      } catch (error){
        setError({error, message: 'Error loading podcast'})
        setTimeout(()=>history.back(),5000);
      }
    }

    const savePodcast = async () => {
        const {newPodcast} = await getPodcast(true);
        dispatch({ type:'updatePodcasts', podcasts: [...global.podcasts, newPodcast  ] })
    }

    const removePodcast = async () => {
        const podcastsState = global.podcasts;
        const podcasts = podcastsState.filter((podcast) => podcast.url !== podcastURL);
        dispatch({type:'updatePodcasts', podcasts});
        await PodcastEngine.db.del(podcastURL);
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
    
    return podcast.domain ? <> 
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
                        : <Typography align='center' letterSpacing={6} variant="h4">{ error && error.message }</Typography>
                        
}

