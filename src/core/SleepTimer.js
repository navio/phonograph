import React, { useContext, useState, useRef } from "react";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import IconButton from "@material-ui/core/IconButton";
import NightsStayIcon from '@material-ui/icons/NightsStay';


import { AppContext } from "../App.js";

const toMin = (theTime) => typeof theTime === "number"
    ? convertMinsToHrsMins(Math.floor(theTime))
    : `00:00`;

const convertMinsToHrsMins = (mins) => {
    if (!Number.isInteger(mins)) return "";
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    return `${h}:${m}`;
};

export default ({onClick}) => {

    const { player } = useContext(AppContext);

    const [timeto, setTimeto] = useState(null);
    const [visible, setVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    const setTimer = (time) => {
        const {timerId, intervalId} = window;
        onClick(val => !val) 
        if (time) {
            setTimeto(time);

            if (timerId) {
                console.log('flushing', timerId)
                clearTimeout(timerId);
            }

            if (intervalId) {
                console.log('flushing', intervalId)
                clearInterval(intervalId);
            }

            player.play();
            const toMs = 1000 * 60 * time;
            setTimeLeft(toMs);

            window.intervalId = setInterval(() => {
                setTimeLeft((timeLeft) => timeLeft - 1000);
            }, 1000);

            window.timerId = setTimeout(() => {
                clearInterval(window.intervalId);
                setTimeto(null);
                setTimeLeft(null);
                setVisible(false);

                player.pause();
            }, toMs);
            player.addEventListener('pause',() => {
                clearTimeout(window.timerId);
                clearInterval(window.intervalId);
                setTimeto(null);
                setTimeLeft(null);
                setVisible(false);
            })

        } else {
            clearTimeout(timerId);
            clearInterval(intervalId);
            setTimeto(null);
        }
        setVisible(false);
    }

    return (<>
        <IconButton onClick={() => { setVisible(val => !val); onClick(val => !val) }}>
            <NightsStayIcon />
            {timeLeft && toMin(timeLeft / 1000)}
        </IconButton>
        <br />
        {visible && <ToggleButtonGroup
            value={timeto}
            exclusive
            style={{ margin: '0 auto' }}
            onChange={(ev, newValue) => setTimer(newValue)}
            aria-label="text alignment"
        >
            {[1, 5, 15, 30, 45, 60].map((time) =>
                <ToggleButton key={time} value={time} aria-label="left aligned">
                    {time}
                </ToggleButton>)}
        </ToggleButtonGroup>}
    </>);

};

