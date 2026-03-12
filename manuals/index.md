# Phonograph User Manual

Welcome to the official Phonograph user documentation.

Phonograph is a progressive web app for discovering podcasts, building a personal library, and listening with responsive playback controls.

## What You Can Do

- Discover shows from curated and searchable sources.
- Save podcasts and episodes in your personal library.
- Play audio with queue support and per-podcast preferences.
- Run Phonograph as an installable app on supported devices.

## Start Here

1. Read [Getting Started](/getting-started) to install and set up the app.
2. Learn browsing and saves in [Discovery & Library](/discovery-and-library).
3. Learn all controls in [Playback Controls](/player-controls).
4. Use [Troubleshooting](/troubleshooting) if something behaves unexpectedly.

## Documentation Release Model

- The manual ships as static assets at `phonograph.app/docs/`.
- Docs are built independently from app runtime code to reduce risk.
- The app service worker is generated before docs are built, so manuals do not change playback cache behavior.
