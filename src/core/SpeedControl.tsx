import React, { useContext, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import SpeedIcon from "@mui/icons-material/Speed";
import IconButton from "@mui/material/IconButton";

import { AppContext } from "../App";
import { AppContextValue } from "../types/app";

interface SpeedControlProps {
  onClick: React.Dispatch<React.SetStateAction<boolean>>;
  color?: string;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ onClick, color }) => {
  const { player, playerRef } = useContext(AppContext) as AppContextValue;
  const audio = playerRef?.current || player;
  const [speed, setSpeed] = useState<number>(audio?.playbackRate || 1.0);
  const [visible, setVisible] = useState(false);

  const changeSpeed = (newSpeed: number | null) => {
    onClick((val) => !val);
    if (newSpeed && audio) {
      setSpeed(newSpeed);
      audio.playbackRate = newSpeed;
    }
    setVisible(false);
  };

  return (
    <>
      <IconButton
        onClick={() => {
          setVisible((val) => !val);
          onClick((val) => !val);
        }}
        disabled={!audio}
        sx={{ color }}
      >
        {speed !== 1.0 ? `${speed}x ` : <SpeedIcon />}
      </IconButton>
      <br />
      {visible && (
        <ToggleButtonGroup
          value={speed}
          exclusive
          style={{ margin: "0 auto" }}
          onChange={(_ev, newValue) => changeSpeed(newValue)}
          aria-label="playback speed"
        >
          {[1.0, 1.2, 1.5, 1.7, 2.0].map((value) => (
            <ToggleButton key={value} value={value} aria-label={`${value}x`} sx={{ color }}>
              {Number(value).toFixed(1)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    </>
  );
};

export default SpeedControl;
