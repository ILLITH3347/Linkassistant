import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(bodyParser.json());

let wordLimit = 20; // Une limite par défaut pour le nombre de mots
let defaultPrompt = "Réponds de façon possitive et concise à un post Linkedin, n'ajoute pas d'hastag.";
let currentPrompt = defaultPrompt;
let apiKey = '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'; // Clé API par défaut

// Route pour obtenir toutes les configurations
app.get('/get-config', (req, res) => {
    res.json({
        currentPrompt: currentPrompt,
        wordLimit: wordLimit,
        apiKey: '****' + apiKey.slice(-4) // Masquer la clé API
    });
});

// Route pour mettre à jour le texte d'invite
app.post('/update-prompt', (req, res) => {
    const { prompt } = req.body;
    console.log('Received request to update prompt to:', prompt);
    currentPrompt = prompt;
    res.send(`Prompt updated to: ${currentPrompt}`);
});

// Route pour réinitialiser le texte d'invite
app.post('/reset-prompt', (req, res) => {
  console.log('Received request to reset prompt to default.');
    currentPrompt = defaultPrompt;
    res.send(`Prompt reset to default: ${currentPrompt}`);
});

// Route pour obtenir le texte d'invite actuel
app.get('/get-prompt', (req, res) => {
  console.log('Received request to get current prompt.');
    res.send(currentPrompt);
});

app.post('/analyze-text', async (req, res) => {
    const { text } = req.body;
    console.log('Received request to analyze text:', text);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: currentPrompt + `, max ${wordLimit} mots.`
                }, {
                    role: "user",
                    content: text
                }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            let generatedText = data.choices[0].message.content.trim();
            
            // Tronquer la réponse à la limite de mots spécifiée
            generatedText = generatedText.split(" ").slice(0, wordLimit).join(" ");

            console.log('Generated Response:', generatedText);
            res.json({ text: generatedText });
        } else {
            res.status(500).json({ error: 'No choices returned from API' });
        }        

    } catch (error) {
        res.status(500).json({ error: 'Error processing the request' });
    }
});

app.post('/update-word-limit', (req, res) => {
    const { limit } = req.body;
    console.log('Received request to update word limit to:', limit);
    if (typeof limit === 'number' && limit > 0) {
        wordLimit = limit;
        res.send(`Word limit updated to: ${wordLimit}`);
    } else {
        res.status(400).send('Invalid word limit provided.');
    }
});

app.get('/get-word-limit', (req, res) => {
    res.json({ wordLimit });
});

// Route pour mettre à jour la clé API
app.post('/update-api-key', (req, res) => {
    const { key } = req.body;
    apiKey = key;
    res.send('API key updated successfully.');
});

// Route pour obtenir la clé API masquée
app.get('/get-api-key', (req, res) => {
    const maskedKey = apiKey.slice(0, -4) + '****';
    res.send(maskedKey);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});