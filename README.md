# BRIDGE Dashboard - ASL Translation Tool

An interactive dashboard that translates text into American Sign Language (ASL) visual representations for the BRIDGE project. This tool combines static ASL sign images with AI-generated signs for words not yet in the library.

## Project Overview

This application provides a seamless text-to-ASL translation experience with intelligent handling of missing word sign images. When a user enters text containing words without corresponding ASL signs, the system prompts them to generate new signs using OpenAI's image generation API. This project was built for [FACETLab](https://facetlab.pitt.edu) at the University of Pittsburgh.

## Architecture

### Core Components

#### UI Components (`src/routes/`)

**`+page.svelte`** - Main App Controller

- Orchestrates the entire user flow and state management
- Manages text submission, missing word detection, and modal queue
- Coordinates between child components (TextInput, SignDisplay, ImageGenerationModal)
- Implements a queue system for processing multiple missing words sequentially
- Handles API calls to generate new ASL signs via the `/api/generate-sign` endpoint

**`TextInput.svelte`** - Input Interface

- Provides a text input form with submission handling
- Displays loading state during sign generation
- Disables input while processing to prevent race conditions

**`SignDisplay.svelte`** - Visual Output

- Renders ASL signs as a sequence of images
- Distinguishes between word-level signs (larger, highlighted) and letter-level fingerspelling
- Injects visual separators between words for improved readability
- Reactively updates when new text is submitted

**`ImageGenerationModal.svelte`** - The AI Generation Popup

- Modal dialog that prompts users when a word lacks an ASL sign image
- Displays queue progress when multiple words need generation
- Offers Yes/No options: generate with AI or skip (falling back to fingerspelling)
- Includes keyboard navigation (Escape to close) and backdrop click handling

#### Data Management (`src/lib/stores/signLibrary.ts`)

**Sign Library Store**

- Centralized Svelte writable store managing all ASL sign data
- Preloads letter signs (a-z) and word-level signs using Vite's glob imports
- Maintains a `WORD_DICTIONARY` of important words that should have dedicated signs
- Type definitions for `Sign` objects with path, character, type (letter/word), and alt text

**Key Helper Functions:**

- `getSigns(text)` - Converts input text to an array of Sign objects, prioritizing word-level signs over fingerspelling
- `findAllMissingWords(text)` - Identifies all words in the dictionary that lack images (returns unique, ordered list)
- `reloadWordSign(word)` - Dynamically imports newly generated images and updates the store
- `isWordMissing(word)` - Checks if a specific word needs an image

#### API Routes (`src/routes/api/`)

**`/api/generate-sign/+server.ts`** - OpenAI Image Gen Route

- POST endpoint that receives a word to generate
- Sanitizes the input and constructs an ASL-specific prompt for OpenAI
- Uses OpenAI's `gpt-image-1` model to generate black-and-white ASL sign illustrations
- Receives base64-encoded images, converts to Buffer, and saves to `src/lib/images/signs/`
- Returns success status with file path or detailed error messages
- Includes comprehensive logging for debugging generation flow

### User Flow

1. **Text Input**: User types English text into the input field
2. **Word Analysis**: On submit, the app scans for words in `WORD_DICTIONARY` that lack images
3. **Missing Word Handling**:
   - If missing words found: Text is held in `pendingText` state and modal queue is initialized
   - If no missing words: Text immediately displays as ASL signs
4. **Generation Queue**: For each missing word (shown sequentially):
   - Modal prompts user: "Generate image using ChatGPT?"
   - **Yes**: Calls `/api/generate-sign`, shows loading state, waits for completion, reloads sign from filesystem
   - **No**: Skips generation (word will be fingerspelled instead)
5. **Display**: Once queue is empty, `SignDisplay` renders the final ASL translation
   - Word-level signs appear larger with yellow ring styling
   - Letter-level signs appear smaller (fingerspelling fallback)
   - Visual separators between words

## Running Locally

Install dependencies:

```sh
npm install
```

Set up environment variables (`.env` file):

```
OPENAI_API_KEY=your_openai_api_key_here
```

Start the development server:

```sh
npm run dev

# or open in browser automatically
npm run dev -- --open
```

## Building

To create a production version:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

> **Note**: This app uses SvelteKit's adapter-auto. You may need to install a specific [adapter](https://svelte.dev/docs/kit/adapters) for your deployment target.
