import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ── Profil ─────────────────────────────────────────────
  age:          { type: Number },
  grade:        { type: String },
  specialties:  { type: [String], default: [] },
  interests:    { type: [String], default: [] },

  // ── RIASEC ─────────────────────────────────────────────
  riasecProfile:      { type: [String], default: [] },
  riasecScores:       { type: Map, of: Number },
  riasecPrimaryCount: { type: Number, default: 1 },

  // ── Favoris ────────────────────────────────────────────
  favoriteJobs:    { type: [String], default: [] },
  savedFormations: { type: [String], default: [] },

}, { timestamps: true });

export default mongoose.model('User', UserSchema);