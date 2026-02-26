import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PodcastSearchResult } from "./engine";

interface HeroCarouselProps {
  items: PodcastSearchResult[];
  onItemClick: (rss: string) => void;
  intervalMs?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, onItemClick, intervalMs = 4000 }) => {
  const slides = items.slice(0, 3);
  const [index, setIndex] = useState(0);
  const mounted = useRef(true);
  const len = slides.length;

  useEffect(() => {
    mounted.current = true;
    if (len === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [len, intervalMs]);

  if (len === 0) return null;

  return (
    <Box sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          width: `${len * 100}%`,
          transform: `translateX(-${index * (100 / len)}%)`,
          transition: "transform 600ms ease",
        }}
      >
        {slides.map((p, i) => (
          <Box
            key={p.rss || p.title || i}
            onClick={() => onItemClick(p.rss)}
            role="button"
            tabIndex={0}
            sx={{
              flex: "0 0 100%",
              position: "relative",
              minHeight: { xs: "18vh", sm: "22vh", md: "28vh" },
              backgroundImage: `url(${p.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              display: "block",
            }}
          >
            <Box sx={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)" }} />
            <Box sx={{ position: "absolute", left: 16, bottom: 16, zIndex: 2, color: "#fff", maxWidth: "70%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.7)" }} noWrap>
                {p.title}
              </Typography>
              {p.publisher ? (
                <Typography variant="body2" sx={{ opacity: 0.9 }} noWrap>
                  {p.publisher}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>

      {/* indicators */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
        {slides.map((_, i) => (
          <Box
            key={`dot-${i}`}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === index ? "primary.main" : "grey.400",
              transition: "background-color 200ms ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroCarousel;
