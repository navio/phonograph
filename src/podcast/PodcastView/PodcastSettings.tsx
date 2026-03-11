// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import {
  getPodcastSettings,
  savePodcastSettings,
  PodcastSettings,
} from "./settingsStorage";

interface Props {
  podcastUrl: string;
  open: boolean;
  textColor?: string;
  subText?: string;
  accentColor?: string;
}

const minuteMarks = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

const speeds = [1.0, 1.2, 1.5, 1.7, 2.0];

const PodcastSettingsPanel: React.FC<Props> = ({
  podcastUrl,
  open,
  textColor,
  subText,
  accentColor,
}) => {
  const [settings, setSettings] = useState<PodcastSettings>(() =>
    getPodcastSettings(podcastUrl)
  );

  // Re-read when the podcast changes
  useEffect(() => {
    setSettings(getPodcastSettings(podcastUrl));
  }, [podcastUrl]);

  const update = (key: keyof PodcastSettings, value: number) => {
    const next = savePodcastSettings(podcastUrl, { [key]: value });
    setSettings(next);
  };

  return (
    <Collapse in={open} unmountOnExit>
      <Box sx={{ mt: 2, pb: 1 }}>
        {/* ---- Section title ---- */}
        <Typography
          variant="subtitle2"
          sx={{ color: textColor, fontWeight: 700, mb: 1.5 }}
        >
          <FormattedMessage
            id="podcastSettings.title"
            defaultMessage="Settings"
          />
        </Typography>

        {/* ---- Skip Start ---- */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="body2"
            sx={{ color: subText, fontWeight: 600, mb: 0.5 }}
          >
            <FormattedMessage
              id="podcastSettings.skipStart"
              defaultMessage="Skip Start"
            />{" "}
            — {settings.skipIntro} min
          </Typography>
          <Slider
            value={settings.skipIntro}
            min={0}
            max={5}
            step={0.5}
            marks={minuteMarks}
            onChange={(_e, v) => update("skipIntro", v as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v} min`}
            sx={{
              color: accentColor,
              "& .MuiSlider-markLabel": {
                color: subText,
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        {/* ---- Skip End ---- */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="body2"
            sx={{ color: subText, fontWeight: 600, mb: 0.5 }}
          >
            <FormattedMessage
              id="podcastSettings.skipEnd"
              defaultMessage="Skip End"
            />{" "}
            — {settings.skipOutro} min
          </Typography>
          <Slider
            value={settings.skipOutro}
            min={0}
            max={5}
            step={0.5}
            marks={minuteMarks}
            onChange={(_e, v) => update("skipOutro", v as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v} min`}
            sx={{
              color: accentColor,
              "& .MuiSlider-markLabel": {
                color: subText,
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        {/* ---- Default Speed ---- */}
        <Box>
          <Typography
            variant="body2"
            sx={{ color: subText, fontWeight: 600, mb: 0.5 }}
          >
            <FormattedMessage
              id="podcastSettings.defaultSpeed"
              defaultMessage="Default Speed"
            />
          </Typography>
          <ToggleButtonGroup
            value={settings.defaultSpeed}
            exclusive
            onChange={(_e, newValue) => {
              if (newValue !== null) update("defaultSpeed", newValue);
            }}
            size="small"
          >
            {speeds.map((v) => (
              <ToggleButton
                key={v}
                value={v}
                sx={{
                  color: subText,
                  borderColor: subText,
                  "&.Mui-selected": {
                    color: textColor,
                    backgroundColor: accentColor,
                    "&:hover": { backgroundColor: accentColor },
                  },
                }}
              >
                {Number(v).toFixed(1)}x
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Collapse>
  );
};

export default PodcastSettingsPanel;
