import { useState } from 'react';
import { ChevronRight, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { register, login } from '../api/auth';

interface AuthScreenProps {
  onAuthComplete: (userData: { email: string; token: string; isNewUser: boolean }) => void;
}

type AuthMode = 'welcome' | 'login' | 'register' | 'forgot-password';

export default function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const clearErrors = () => setError('');

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePassword = (p: string) => p.length >= 8;

  const handleRegister = async () => {
    clearErrors();
    if (!validateEmail(email)) return setError('Adresse email invalide.');
    if (!validatePassword(password)) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas.');

    setLoading(true);
    try {
      const res = await register(email, password);
      if (res.message?.toLowerCase().includes('erreur') || res.error) {
        setError(res.message || 'Une erreur est survenue.');
      } else {
        // Connexion automatique après inscription
        const loginRes = await login(email, password);
        if (loginRes.token) {
          localStorage.setItem('token', loginRes.token);
          onAuthComplete({ email, token: loginRes.token, isNewUser: true });
        } else {
          setError('Compte créé mais connexion échouée. Essaie de te connecter.');
          setMode('login');
        }
      }
    } catch {
      setError('Impossible de contacter le serveur. Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearErrors();
    if (!validateEmail(email)) return setError('Adresse email invalide.');
    if (!password) return setError('Saisis ton mot de passe.');

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        onAuthComplete({ email, token: res.token, isNewUser: false });
      } else {
        setError(res.message || 'Email ou mot de passe incorrect.');
      }
    } catch {
      setError('Impossible de contacter le serveur. Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearErrors();
    if (!validateEmail(email)) return setError('Saisis une adresse email valide.');

    setLoading(true);
    try {
      // Appelle ton endpoint de reset — adapte l'URL si besoin
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetEmailSent(true);
      } else {
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // ─── WELCOME ────────────────────────────────────────────────────────────────
  if (mode === 'welcome') {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-4xl">🧭</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Bienvenue !</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Crée un compte pour sauvegarder ton profil et retrouver tes résultats à tout moment.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-10 space-y-3">
          <button
            onClick={() => { clearErrors(); setMode('register'); }}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            Créer un compte
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => { clearErrors(); setMode('login'); }}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold"
          >
            J'ai déjà un compte
          </button>
        </div>
      </div>
    );
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
  if (mode === 'forgot-password') {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="p-6">
          <button onClick={() => setMode('login')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mot de passe oublié ?</h2>
          <p className="text-gray-500 mb-8">
            Saisis ton email et on t'envoie un lien pour le réinitialiser.
          </p>

          {resetEmailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-medium">Email envoyé !</p>
              <p className="text-green-600 text-sm mt-1">Vérifie ta boîte mail.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <InputField
                icon={<Mail className="w-5 h-5" />}
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(v) => { setEmail(v); clearErrors(); }}
              />
              {error && <ErrorMessage message={error} />}
              <button
                onClick={handleForgotPassword}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="p-6">
          <button onClick={() => setMode('welcome')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
          <p className="text-gray-500 mb-8">Content de te revoir 👋</p>

          <div className="space-y-4">
            <InputField
              icon={<Mail className="w-5 h-5" />}
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(v) => { setEmail(v); clearErrors(); }}
            />
            <InputField
              icon={<Lock className="w-5 h-5" />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(v) => { setPassword(v); clearErrors(); }}
              rightIcon={
                <button onClick={() => setShowPassword(!showPassword)} type="button">
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              }
            />
            {error && <ErrorMessage message={error} />}

            <button
              onClick={() => { clearErrors(); setMode('forgot-password'); }}
              className="text-primary-500 text-sm font-medium"
            >
              Mot de passe oublié ?
            </button>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">
            Pas encore de compte ?{' '}
            <button onClick={() => { clearErrors(); setMode('register'); }} className="text-primary-500 font-semibold">
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="p-6">
        <button onClick={() => setMode('welcome')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Créer un compte</h2>
        <p className="text-gray-500 mb-8">Rejoins des milliers de jeunes qui trouvent leur voie 🚀</p>

        <div className="space-y-4">
          <InputField
            icon={<Mail className="w-5 h-5" />}
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(v) => { setEmail(v); clearErrors(); }}
          />
          <InputField
            icon={<Lock className="w-5 h-5" />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe (8 caractères min.)"
            value={password}
            onChange={(v) => { setPassword(v); clearErrors(); }}
            rightIcon={
              <button onClick={() => setShowPassword(!showPassword)} type="button">
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            }
          />
          <InputField
            icon={<Lock className="w-5 h-5" />}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); clearErrors(); }}
            rightIcon={
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            }
          />

          {/* Indicateur de force du mot de passe */}
          {password.length > 0 && (
            <PasswordStrength password={password} />
          )}

          {error && <ErrorMessage message={error} />}

          <button
            onClick={handleRegister}
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>

          <p className="text-gray-400 text-xs text-center leading-relaxed">
            En créant un compte, tu acceptes nos{' '}
            <span className="text-primary-500">Conditions d'utilisation</span> et notre{' '}
            <span className="text-primary-500">Politique de confidentialité</span>.
          </p>
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm">
          Déjà un compte ?{' '}
          <button onClick={() => { clearErrors(); setMode('login'); }} className="text-primary-500 font-semibold">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  rightIcon,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 focus-within:border-primary-400 focus-within:bg-white transition-all">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base"
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : undefined}
      />
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <p className="text-red-500 text-sm">{message}</p>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">{labels[score]}</p>
    </div>
  );
}