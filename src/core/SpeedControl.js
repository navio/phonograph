import React, { useContext, useState, useEffect } from "react";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import SpeedIcon from '@material-ui/icons/Speed';
import IconButton from "@material-ui/core/IconButton";


import { AppContext } from "../App.js";

export default () => {
    
    const { player } = useContext(AppContext);
    const [speed, setSpeed] = useState(player.playbackRate);
    const [visible, setVisible] = useState(false)
    const changeSpeed = (newSpeed) =>{
        if (speed === newSpeed) return;
        setSpeed(newSpeed);
        player.playbackRate = newSpeed;
    }

    return (<>
        <IconButton onClick={() => setVisible((val) => !val)}><SpeedIcon /></IconButton>
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

