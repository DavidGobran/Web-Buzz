import React, { useState, useEffect } from "react";
import { Button, TextField, CircularProgress, Box, Typography } from "@mui/material";

export default function BuzzWebApp() {
  const [apiKey, setApiKey] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [recognition, setRecognition] = useState(null);
  const [liveTranscribing, setLiveTranscribing] = useState(false);
  const [interimTranscription, setInterimTranscription] = useState("");

  useEffect(() => {
    return () => {
      if (recognition) recognition.stop();
    };
  }, [recognition]);

  const startLiveTranscription = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = async (event) => {
      let interim = '';
      setInterimTranscription('');
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const text = res[0].transcript;
          setTranscription(prev => prev + text + ' ');
          try {
            const resp = await fetch('https://web-buzz-quzd.onrender.com/api/translate-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKey, text, language })
            });
            const data = await resp.json();
            {
              const raw = data.translation;
              const cleaned = raw.replace(/^"""+/, '').replace(/"""+$/, '').trim();
              setTranslation(prev => prev + cleaned + ' ');
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          interim += res[0].transcript;
        }
      }
      setInterimTranscription(interim);
    };
    rec.start();
    setRecognition(rec);
    setLiveTranscribing(true);
  };

  const stopLiveTranscription = () => {
    if (recognition) recognition.stop();
    setLiveTranscribing(false);
  };

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleTranscribe = async () => {
    if (!apiKey || !audioFile) {
      alert("Please provide an API key and upload an audio file.");
      return;
    }
    setLoading(true);
    setTranscription("Processing...");
    setTranslation("");
  
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("apiKey", apiKey);
    formData.append("language", language);
  
    try {
      const response = await fetch("https://web-buzz-quzd.onrender.com/api/transcribe", {
        method: "POST",
        body: formData, // Use FormData directly
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      setTranscription(data.transcription);
      // clean translation quotes
      const raw = data.translation;
      const cleaned = raw.replace(/^"""+/, '').replace(/"""+$/, '').trim();
      setTranslation(cleaned);
    } catch (error) {
      console.error("Error during transcription:", error);
      alert(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto", textAlign: "center" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Buzz Web
      </Typography>
      <TextField
        type="password"
        label="Enter OpenAI API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        component="label"
        fullWidth
        sx={{ my: 2 }}
      >
        Upload Audio File
        <input type="file" accept="audio/*" hidden onChange={handleFileChange} />
      </Button>
      {audioFile && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body1">
            Uploaded File: {audioFile.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTranscribe}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Transcribe"}
          </Button>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        {!liveTranscribing ? (
          <Button variant="outlined" onClick={startLiveTranscription} fullWidth>
            Start Live Transcription
          </Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={stopLiveTranscription} fullWidth>
            Stop Live Transcription
          </Button>
        )}
      </Box>
      <TextField
        multiline
        rows={4}
        value={transcription + interimTranscription}
        placeholder="Transcription will appear here..."
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />
      <TextField
        select
        label="Translation Language"
        value={language}
        onChange={handleLanguageChange}
        fullWidth
        margin="normal"
        SelectProps={{ native: true }}
      >
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="ar">Arabic</option>
        <option value="en">English</option>
      </TextField>
      <TextField
        multiline
        rows={4}
        value={translation}
        placeholder="Translation will appear here..."
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        {(transcription || translation) && (
          <Button variant="outlined" color="error" onClick={() => { setTranscription(''); setTranslation(''); }}>
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
}