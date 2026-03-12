import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// ── Middleware auth ─────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token manquant' });

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// ── GET /api/profile ────────────────────────────────────────────────────────
// Récupère le profil de l'utilisateur connecté
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({
      profile: {
      age: user.age,
      grade: user.grade,
      specialties: user.specialties,
      interests: user.interests,
      riasecProfile: user.riasecProfile,
      riasecScores: user.riasecScores ? Object.fromEntries(user.riasecScores) : undefined,
      riasecPrimaryCount: user.riasecPrimaryCount,
      favoriteJobs: user.favoriteJobs,
      savedFormations: user.savedFormations,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ── PUT /api/profile ────────────────────────────────────────────────────────
// Sauvegarde / met à jour le profil (appelé depuis ProfileCreation)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const {
      age, grade, specialties, interests,
      riasecProfile, riasecScores, riasecPrimaryCount,
      favoriteJobs, savedFormations
    } = req.body;

    // On ne met à jour que les champs envoyés (patch partiel)
    const updates = {};
    if (age               !== undefined) updates.age               = age;
    if (grade             !== undefined) updates.grade             = grade;
    if (specialties       !== undefined) updates.specialties       = specialties;
    if (interests         !== undefined) updates.interests         = interests;
    if (riasecProfile     !== undefined) updates.riasecProfile     = riasecProfile;
    if (riasecScores      !== undefined) updates.riasecScores      = riasecScores;
    if (riasecPrimaryCount !== undefined) updates.riasecPrimaryCount = riasecPrimaryCount;
    if (favoriteJobs      !== undefined) updates.favoriteJobs      = favoriteJobs;
    if (savedFormations   !== undefined) updates.savedFormations   = savedFormations;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profil sauvegardé', profile: updates });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;