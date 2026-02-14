import React, { useContext, useState, useRef } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import IconButton from "@mui/material/IconButton";
import NightsStayIcon from "@mui/icons-material/NightsStay";

import { AppContext } from "../App";
import { AppContextValue } from "../types/app";

const convertMinsToHrsMins = (mins: number) => {
  if (!Number.isInteger(mins)) return "";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const toMin = (theTime: number | null) =>
  typeof theTime === "number" ? convertMinsToHrsMins(Math.floor(theTime)) : "00:00";

interface SleepTimerProps {
  onClick: React.Dispatch<React.SetStateAction<boolean>>;
  color?: string;
}

const SleepTimer: React.FC<SleepTimerProps> = ({ onClick, color }) => {
  const { player, playerRef } = useContext(AppContext) as AppContextValue;
  const audio = playerRef?.current || player;

  const [timeto, setTimeto] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  const setTimer = (time: number | null) => {
    onClick((val) => !val);
    if (time) {
      setTimeto(time);

      clearTimers();

      if (!audio) return;
      audio.play();
      const toMs = 1000 * 60 * time;
      setTimeLeft(toMs);

      intervalIdRef.current = setInterval(() => {
        setTimeLeft((current) => (current ? current - 1000 : null));
      }, 1000);

      timerIdRef.current = setTimeout(() => {
        clearTimers();
        setTimeto(null);
        setTimeLeft(null);
        setVisible(false);
        audio.pause();
      }, toMs);

      audio.addEventListener("pause", () => {
        clearTimers();
        setTimeto(null);
        setTimeLeft(null);
        setVisible(false);
      });
    } else {
      clearTimers();
      setTimeto(null);
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
        <NightsStayIcon />
        {timeLeft ? toMin(timeLeft / 1000) : null}
      </IconButton>
      <br />
      {visible && (
        <ToggleButtonGroup
          value={timeto}
          exclusive
          style={{ margin: "0 auto" }}
          onChange={(_ev, newValue) => setTimer(newValue)}
          aria-label="sleep timer"
        >
          {[1, 5, 15, 30, 45, 60].map((time) => (
            <ToggleButton key={time} value={time} aria-label={`${time} minutes`} sx={{ color }}>
              {time}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    </>
  );
};

export default SleepTimer;
