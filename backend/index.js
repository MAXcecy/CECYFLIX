const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const peliculasRouter = require('./routes/peliculas');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para recibir prompts y consultar la API de OpenRouter
app.post('/api/recomendaciones', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/cypher-alpha:free',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recomendacion = response.data.choices[0].message.content;
    res.json({ recomendacion });

  } catch (error) {
    console.error('Error en la API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error en el servidor proxy' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));
 
app.use('/api/peliculas', peliculasRouter);

// (Tu ruta de /api/recomendaciones puede ir aquí también)
app.listen(4000, () => console.log('Backend corriendo en http://localhost:4000'));
