import React, { useContext, useState, useEffect } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SpeedIcon from "@mui/icons-material/Speed";
import IconButton from "@mui/material/IconButton";


import { AppContext } from "../App.js";

export default ({onClick}) => {
    
    const { player } = useContext(AppContext);
    const [speed, setSpeed] = useState(player.playbackRate);
    const [visible, setVisible] = useState(false)
    const changeSpeed = (newSpeed) =>{
        onClick(val => !val) 
        if (newSpeed ){
            setSpeed(newSpeed);
            player.playbackRate = newSpeed;
        }
        setVisible(false);
    }

    return (<>
        <IconButton onClick={() => { setVisible((val) => !val); onClick(val => !val); } }>
        { speed !== 1.0 ? `${speed}x ` : <SpeedIcon /> } 
        </IconButton>
        <br />
        {visible && <ToggleButtonGroup
            value={speed}
            exclusive
            style={{ margin: '0 auto' }}
            onChange={(ev, newValue) => changeSpeed(newValue) }
            aria-label="text alignment"
        >
            {[1.0, 1.2, 1.5, 1.7, 2.0].map((speed) =>
                <ToggleButton key={speed} value={speed} aria-label="left aligned">
                    {Number(speed).toFixed(1)}
                </ToggleButton>)}
        </ToggleButtonGroup>}
    </>);

};
