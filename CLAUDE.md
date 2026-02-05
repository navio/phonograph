# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn start` - Start development server with Parcel
- `yarn dev` - Full development mode (runs getter, proxy, and lambda serve)  
- `yarn build` - Full production build (runs getter, builds with Parcel, SEO setup, service worker generation, and lambda build)
- `yarn serve` - Serve the application with Parcel
- `yarn lambda:build` - Build Netlify Lambda functions
- `yarn lambda:serve` - Serve Lambda functions locally
- `yarn getter` - Run the file getter script (filegetter.sh)
- `yarn sw` - Generate service worker with swGenerator.js

## Architecture Overview

Phonograph is a Progressive Web App (PWA) built as an audio application shell, focused on podcast consumption. It uses React with Material-UI for the interface and deploys to Netlify with serverless functions.

### Core Structure

- **State Management**: Uses React's useReducer with a centralized reducer pattern (`src/reducer.js`)
- **Audio Engine**: Custom audio player with queue management (`src/engine/`)
- **Podcast Engine**: Built on `podcastsuite` library for RSS parsing and podcast management
- **Service Worker**: Custom PWA implementation with offline caching
- **Lambda Functions**: Serverless proxy functions for RSS feeds and API calls

### Key Components

- **App.js**: Main application container with routing, state management, and lazy-loaded components
- **MediaControl**: Global audio player controls with media session integration
- **Discovery**: Podcast search and discovery interface using Apple Podcasts API via proxy
- **Library**: User's saved podcast collection with persistent storage
- **PodcastView**: Individual podcast and episode management

### Data Flow

1. **Podcast Data**: RSS feeds proxied through Netlify functions (`/rss-full/*` → `findCast.js`)
2. **Search**: Apple Podcasts API accessed via `/ln/*` proxy to Listen API  
3. **State Persistence**: Application state saved to localStorage with automatic restoration
4. **Audio Queue**: Custom queue system with episode completion tracking using IndexedDB

### Proxy Configuration

The application uses extensive proxy routing (netlify.toml) to handle CORS and API access:
- RSS feeds proxied through Lambda functions
- Search APIs routed through external services
- Media files served with caching headers

### Build Process

The build process includes:
1. File gathering (`filegetter.sh`)
2. Parcel bundling
3. SEO file copying
4. Service worker generation with dynamic file list
5. Lambda function compilation