import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { PodcastSearchResult } from "./engine";

interface HeroCarouselProps {
  items: PodcastSearchResult[];
  onItemClick: (rss: string) => void;
  intervalMs?: number; // milliseconds for auto-advance; if falsy, auto-advance is disabled
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, onItemClick, intervalMs = 4000 }) => {
  const slides = items.slice(0, 3);
  const len = slides.length;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const interactionRef = useRef({ isInteracting: false, lastInteraction: 0 });
  const scrollTimeout = useRef<number | null>(null);
  const autoId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
      if (autoId.current) window.clearInterval(autoId.current);
    };
  }, []);

  // Helper to scroll to a given slide index
  const goTo = (i: number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || container.getBoundingClientRect().width;
    const left = Math.max(0, Math.min(i, len - 1)) * width;
    try {
      container.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    } catch (e) {
      // fallback for older browsers
      container.scrollLeft = left;
    }
    setIndex(Math.max(0, Math.min(i, len - 1)));
  };

  // Auto-advance when intervalMs is provided and there are multiple slides
  useEffect(() => {
    if (!intervalMs || len <= 1) return;
    if (autoId.current) window.clearInterval(autoId.current);

    autoId.current = window.setInterval(() => {
      if (interactionRef.current.isInteracting) return; // pause while interacting
      setIndex((prev) => {
        const next = (prev + 1) % len;
        goTo(next);
        return next;
      });
    }, intervalMs);

    return () => {
      if (autoId.current) window.clearInterval(autoId.current);
      autoId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, len]);

  // Update index when user scrolls / after scroll settles
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;

    const onScroll = () => {
      // throttle with rAF
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = container.clientWidth || container.getBoundingClientRect().width;
        const idx = Math.round((container.scrollLeft || 0) / (width || 1));
        setIndex(Math.max(0, Math.min(idx, len - 1)));
      });

      // debounce end of scroll for snap correction
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
      scrollTimeout.current = window.setTimeout(() => {
        const width = container.clientWidth || container.getBoundingClientRect().width;
        const idx = Math.round((container.scrollLeft || 0) / (width || 1));
        goTo(idx);
        interactionRef.current.lastInteraction = Date.now();
        interactionRef.current.isInteracting = false;
      }, 120);
    };

    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [len]);

  // Mouse drag support (desktop). Touch will use native scrolling.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onDown = (e: MouseEvent) => {
      // only react to left button
      if (e.button !== 0) return;
      isDown = true;
      interactionRef.current.isInteracting = true;
      interactionRef.current.lastInteraction = Date.now();
      container.classList.add("dragging");
      startX = e.clientX;
      scrollStart = container.scrollLeft;
      // prevent text selection
      (document.body.style as any).userSelect = "none";
    };

    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      container.scrollLeft = scrollStart - dx;
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove("dragging");
      (document.body.style as any).userSelect = "";
      // snap to nearest
      const width = container.clientWidth || container.getBoundingClientRect().width;
      const idx = Math.round((container.scrollLeft || 0) / (width || 1));
      goTo(idx);
      interactionRef.current.isInteracting = false;
      interactionRef.current.lastInteraction = Date.now();
    };

    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      (document.body.style as any).userSelect = "";
    };
  }, []);

  // Recalculate position on resize
  useEffect(() => {
    const onResize = () => {
      goTo(index, false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (len === 0) return null;

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Box sx={{ maxWidth: 760, mx: "auto", px: 1 }}>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            // hide scrollbar visually but keep accessible
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
            cursor: { xs: "default", sm: "grab" },
          }}
        >
          {slides.map((p, i) => (
            <Box key={p.rss || p.title || i} sx={{ scrollSnapAlign: "start", flex: "0 0 100%", px: 0 }}>
              <Card
                onClick={() => onItemClick(p.rss)}
                role="button"
                tabIndex={0}
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  flexDirection: { xs: "column", sm: "row" },
                  width: "100%",
                  overflow: "hidden",
                }}
                elevation={2}
              >
                <Box
                  component="img"
                  src={p.thumbnail}
                  alt={p.title}
                  sx={{
                    width: { xs: "100%", sm: 240 },
                    height: { xs: 140, sm: 140 },
                    objectFit: "cover",
                    flexShrink: 0,
                    display: "block",
                  }}
                />
                <CardContent sx={{ flex: 1, p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom noWrap>
                    {p.title}
                  </Typography>
                  {p.publisher ? (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {p.publisher}
                    </Typography>
                  ) : null}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* indicators */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
          {slides.map((_, i) => (
            <Box
              key={`dot-${i}`}
              onClick={() => goTo(i)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: i === index ? "primary.main" : "grey.400",
                transition: "background-color 200ms ease",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HeroCarousel;
