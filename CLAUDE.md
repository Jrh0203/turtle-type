# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turtle Type is an adaptive typing test that learns from the user's typing patterns and intentionally selects words that are difficult for them. The application features three modes:
- **Random**: Random words for practice
- **Tricky**: Words that maximize finger travel distance across the keyboard
- **Turtle** (default): Adaptive mode that learns letter combinations the user struggles with and generates increasingly difficult words

The "Turtle" mode includes animated turtles that spawn during typing and need to be eliminated by typing correctly.

## Common Commands

```bash
# Start development server (requires legacy OpenSSL provider for compatibility)
npm start

# Build for production
npm build

# Run tests
npm test
```

## Architecture

### State Management
The entire application state is managed in `App.tsx` using class component state. Key state includes:
- Typing state: `currWord`, `typedWord`, `typedHistory`
- Timer state: `timer`, `setTimer`, `timeLimit`
- Performance metrics: `wpm`, `wpmGraph`
- Adaptive learning data: stored in instance variables `letterMapSum`, `letterMapCount`, `singletonSum`, `singletonCount`
- Turtle animation state: `turtles`, `turtlesBorn`, `turtlesKilled`, `turtleTime`

### Adaptive Learning Algorithm

The core intelligence is in `App.tsx` and works as follows:

1. **Keystroke Tracking** (`recordTest` method in App.tsx:307-550):
   - Tracks time between consecutive keypresses
   - Stores bigram timing data in `letterMapSum` and `letterMapCount`
   - Stores single letter timing in `singletonSum` and `singletonCount`

2. **Word Scoring** (`computeWordScore` in App.tsx:246-263):
   - Calculates difficulty score based on average time to type letter combinations
   - Higher scores = slower typing = more difficult for the user
   - Uses both bigram and singleton data

3. **Word Selection** (in `recordTest` on space key, App.tsx:359-423):
   - Scores all remaining words in the word pool
   - Selects words with highest scores (slowest combinations) in "evil" mode
   - Removes typed words from pool to ensure variety

4. **Alternative Heuristic** (`computeNiceness` in App.tsx:265-305):
   - Alternative scoring based on keyboard geometry
   - Uses `letterSpot` (horizontal position) and `letterDist` (vertical row distance)
   - Penalizes same-finger key sequences

### Keyboard Geometry Mappings

`letterSpot` and `letterDist` in App.tsx:31-86 map each letter to its physical position on QWERTY keyboard:
- `letterSpot`: Horizontal column position (0-7 from left to right)
- `letterDist`: Vertical row distance from home row (0-2)

### Component Structure

- **App.tsx**: Main container, handles all business logic, keyboard events, timer, and adaptive algorithm
- **Test.tsx**: Displays the typing interface with words, caret, and WPM display
- **Result.tsx**: Shows final results with Chart.js scatter plot of WPM over time
- **Turtle.tsx**: Renders individual turtle animations
- **Header.tsx**: Displays branding (simplified, theme/time options removed from UI but logic remains)
- **Footer.tsx**: Shows mode selector and "Play Again" button

### Turtle Animation System

The turtle spawning system (App.tsx:166-245) creates visual pressure:
- Turtles spawn from the center and move outward at different angles
- Spawn rate increases based on typing speed and time elapsed
- Each correct character typed "kills" one turtle
- Uses `requestAnimationFrame` for smooth animation
- Turtles appear only in Turtle mode (selectedIdx === 0)
- Game ends when oldest turtle reaches 13.7 seconds of age

### Styling

Uses SCSS modules per component in `src/stylesheets/`:
- `themes.scss`: Contains color theme definitions
- Component-specific styles match component names (Test.scss, Result.scss, etc.)
- Theme applied to `document.body.children[1]` dynamically

### Import Path Resolution

The project uses TypeScript path mapping with `baseUrl: "src"` in tsconfig.json, allowing absolute imports from the src directory:
- `import { words } from "helpers/words.json"` instead of relative paths
- `import Test from "components/Test"` instead of `./components/Test`

## Development Notes

- Uses React 17 with class components throughout
- Node.js version requirement: >=22.0.0
- Legacy OpenSSL provider flag required for `npm start` due to webpack compatibility
- Word list stored in `src/helpers/words.json`
- Mobile devices show a message directing users to desktop (see App.tsx:742-751)
