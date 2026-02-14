import React from "react";
import { useTheme } from "@mui/material/styles";

const Loading: React.FC = () => {
  const theme = useTheme();
  const one = theme.palette.primary.main;
  const three = theme.palette.warning.main;
  const two = theme.palette.secondary.main;

  return (
    <svg
      width="227px"
      height="227px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      style={{
        margin: "auto",
        background: "none",
        display: "block",
        shapeRendering: "auto",
      }}
    >
      <rect x="18" y="27" width="14" height="46" fill={one}>
        <animate
          attributeName="y"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="13.199999999999996;27;27"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.2s"
        ></animate>
        <animate
          attributeName="height"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="73.60000000000001;46;46"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.2s"
        ></animate>
      </rect>
      <rect x="43" y="26.9632" width="14" height="46.0736" fill={two}>
        <animate
          attributeName="y"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="16.65;27;27"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.1s"
        ></animate>
        <animate
          attributeName="height"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="66.7;46;46"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-0.1s"
        ></animate>
      </rect>
      <rect x="68" y="26.5041" width="14" height="46.9917" fill={three}>
        <animate
          attributeName="y"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="16.65;27;27"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
        ></animate>
        <animate
          attributeName="height"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;0.5;1"
          values="66.7;46;46"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
        ></animate>
      </rect>
    </svg>
  );
};

export default Loading;
