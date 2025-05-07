const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const cors = require('cors');

const app = express();
const port = 5050;
const upload = multer({ dest: "uploads/" });

// Enable CORS
app.use(cors());

app.use(express.json());

app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        const apiKey = req.body.apiKey;
        if (!apiKey) {
            console.error("API key is missing in the request.");
            return res.status(400).json({ error: "API key required" });
        }

        const audioPath = req.file?.path;
        if (!audioPath) {
            console.error("Audio file is missing in the request.");
            return res.status(400).json({ error: "Audio file required" });
        }

        const targetLanguage = req.body.language || "en";

        const languageMap = { en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic', de: 'German', zh: 'Chinese', ja: 'Japanese' };
        const targetLanguageName = languageMap[targetLanguage] || targetLanguage;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(audioPath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        formData.append("model", "whisper-1");

        try {
            const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            const transcription = response.data.text;

            const translationResponse = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that translates text to the specified language." },
                        { role: "user", content: `Please translate the following text into ${targetLanguageName} and preserve formatting:\n\n"""${transcription}"""` }
                    ],
                },
                { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
            );

            const translation = translationResponse.data.choices[0].message.content;

            fs.unlinkSync(audioPath);
            res.json({ transcription, translation });
        } catch (apiError) {
            console.error("Error during API call to OpenAI:", apiError.response?.data || apiError.message);
            res.status(apiError.response?.status || 500).json({
                error: apiError.response?.data?.error || "Error during API call to OpenAI",
            });
        }
    } catch (error) {
        console.error("Unexpected error in /transcribe endpoint:", error);
        res.status(500).json({ error: "Error processing transcription" });
    }
});

// New endpoint for text translation from live transcription
app.post("/translate-text", async (req, res) => {
    try {
        const { apiKey, text, language } = req.body;
        if (!apiKey || !text) {
            return res.status(400).json({ error: "API key and text required" });
        }
        const languageMap = { en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic', de: 'German', zh: 'Chinese', ja: 'Japanese' };
        const targetLanguageName = languageMap[language] || language;
        const translationResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant that translates text to the specified language." },
                    { role: "user", content: `Please translate the following text into ${targetLanguageName} and preserve formatting:\n\n"""${text}"""` }
                ],
            },
            { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
        );
        const translation = translationResponse.data.choices[0].message.content;
        res.json({ translation });
    } catch (error) {
        console.error("Error during translation API call:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.response?.data?.error || "Error during translation" });
    }
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
