import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      email: email.toLowerCase(), 
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    
    await user.save();
    console.log(`✅ Nouvel utilisateur créé : ${email} (${firstName} ${lastName})`);
    res.status(201).json({ message: 'Compte créé avec succès !' });

  } catch (err) {
    console.error('❌ Erreur Register:', err);
    res.status(500).json({ message: 'Erreur lors de la création du compte.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    console.log(`🔑 Connexion réussie pour : ${email}`);
    res.json({ token, message: 'Connexion réussie.' });

  } catch (err) {
    console.error('❌ Erreur Login:', err);
    res.status(500).json({ message: 'Le serveur ne répond pas.' });
  }
});

export default router;