# Web Buzz

Web Buzz is a web application that provides audio transcription and translation services. It allows users to upload audio files or use live transcription, and then translates the transcribed text into a selected language.

## Features

- **Audio File Transcription**: Upload audio files to transcribe their content.
- **Live Transcription**: Use live speech recognition to transcribe spoken words in real-time.
- **Translation**: Translate transcribed text into multiple languages, including Spanish, French, Arabic, and more.
- **User-Friendly Interface**: Simple and intuitive frontend built with React and Material-UI.

## Technologies Used

### Frontend
- React
- Material-UI
- Vite

### Backend
- Node.js
- Express
- Multer (for file uploads)
- Axios (for API requests)

### APIs
- OpenAI Whisper API (for transcription)
- OpenAI Chat Completions API (for translation)

## Installation

### Prerequisites
- Node.js and npm installed on your system.
- An OpenAI API key.

### Steps

1. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

2. Start the backend server:
   ```bash
   node server.js
   ```

3. Start the frontend development server:
   ```bash
   cd ../frontend
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:3000`.

## Usage

1. Enter your OpenAI API key in the provided field.
2. Upload an audio file or start live transcription.
3. Select the target language for translation.
4. View the transcription and translation results.```
