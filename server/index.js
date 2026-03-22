import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Serveur OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`);
});