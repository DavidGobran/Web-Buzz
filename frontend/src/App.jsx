import React, { useState } from "react";
import { Button, TextField, CircularProgress, Box, Typography } from "@mui/material";

export default function BuzzWebApp() {
  const [apiKey, setApiKey] = useState("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");
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");

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
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData, // Use FormData directly
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
      setTranscription(data.transcription);
      setTranslation(data.translation);
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
        <Typography variant="body1" sx={{ mt: 2 }}>
          Uploaded File: {audioFile.name}
        </Typography>
      )}
      <TextField
        select
        label="Select Language"
        value={language}
        onChange={handleLanguageChange}
        fullWidth
        margin="normal"
        SelectProps={{ native: true }}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="ar">Arabic</option>
      </TextField>
      <Button
        variant="contained"
        color="primary"
        onClick={handleTranscribe}
        disabled={loading}
        fullWidth
        sx={{ my: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Transcribe"}
      </Button>
      <TextField
        multiline
        rows={4}
        value={transcription}
        placeholder="Transcription will appear here..."
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />
      <TextField
        multiline
        rows={4}
        value={translation}
        placeholder="Translation will appear here..."
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
      />
    </Box>
  );
}