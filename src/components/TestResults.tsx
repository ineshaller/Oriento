import { Sparkles, ArrowRight, MessageCircle, AlertCircle } from "lucide-react";

interface TestResultsProps {
  riasecProfile: string[];
  scores?: { [key: string]: number | string };
  onExplore: () => void;
  onChat: () => void;
}

const profileDescriptions: {
  [key: string]: { name: string; description: string; traits: string[]; careers: string[] };
} = {
  R: {
    name: "Réaliste",
    description:
      "Tu es pragmatique et tu aimes les activités concrètes. Tu préfères manipuler des outils et travailler avec tes mains.",
    traits: ["Pratique", "Concret", "Manuel"],
    careers: ["Ingénieur", "Technicien", "Artisan", "Pilote"],
  },
  I: {
    name: "Investigateur",
    description:
      "Tu es curieux et analytique. Tu aimes observer, comprendre et résoudre des problèmes complexes.",
    traits: ["Analytique", "Curieux", "Logique"],
    careers: ["Chercheur", "Médecin", "Ingénieur R&D", "Analyste"],
  },
  A: {
    name: "Artistique",
    description:
      "Tu es créatif et imaginatif. Tu as besoin d'exprimer ta créativité et d'innover.",
    traits: ["Créatif", "Original", "Expressif"],
    careers: ["Designer", "Artiste", "Architecte", "Réalisateur"],
  },
  S: {
    name: "Social",
    description:
      "Tu es empathique et tu aimes aider les autres. Le relationnel est au cœur de tes motivations.",
    traits: ["Empathique", "Communicatif", "Altruiste"],
    careers: ["Enseignant", "Psychologue", "Infirmier", "Coach"],
  },
  E: {
    name: "Entreprenant",
    description:
      "Tu es ambitieux et tu aimes diriger. Tu cherches à convaincre et à atteindre des objectifs.",
    traits: ["Leader", "Persuasif", "Ambitieux"],
    careers: ["Manager", "Entrepreneur", "Commercial", "Avocat"],
  },
  C: {
    name: "Conventionnel",
    description:
      "Tu es organisé et rigoureux. Tu apprécies les tâches structurées et les procédures claires.",
    traits: ["Méthodique", "Précis", "Fiable"],
    careers: ["Comptable", "Assistant", "Administrateur", "Contrôleur"],
  },
};

export default function TestResults({ riasecProfile, scores, onExplore, onChat }: TestResultsProps) {
  console.log("TestResults props scores =", scores);

  const allCodes = Object.keys(profileDescriptions); // ["R","I","A","S","E","C"]

  // ✅ Normalisation : clés trim + uppercase, valeurs Number
  const normalizedScores: Record<string, number> | undefined = scores
    ? Object.fromEntries(
        Object.entries(scores)
          .map(([k, v]) => [k.trim().toUpperCase(), Number(v)] as const)
          .filter(([k, v]) => allCodes.includes(k) && Number.isFinite(v))
      )
    : undefined;

  // ✅ IMPORTANT : si scores non passés, on ne peut PAS détecter les égalités
  let mainCodes: string[] = [riasecProfile[0]];
  let secondaryCodes: string[] = riasecProfile.slice(1, 3);

  if (normalizedScores) {
    const entries = allCodes
      .filter((code) => typeof normalizedScores[code] === "number")
      .map((code) => [code, normalizedScores[code]] as const)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      const topScore = entries[0][1];
      mainCodes = entries.filter(([, s]) => s === topScore).map(([c]) => c);

      const remaining = entries.filter(([c]) => !mainCodes.includes(c));

      // ✅ Cas 1 : score principal unique -> afficher les 3 suivants (+ ex-aequo au cutoff)
      if (mainCodes.length === 1) {
        if (remaining.length <= 3) {
          secondaryCodes = remaining.map(([c]) => c);
        } else {
          const cutoffScore = remaining[2][1];
          secondaryCodes = remaining.filter(([, s]) => s >= cutoffScore).map(([c]) => c);
        }
      }
      // ✅ Cas 2 : top ex-aequo -> secondaires = ex-aequo du 2e score
      else {
        if (remaining.length > 0) {
          const secondScore = remaining[0][1];
          secondaryCodes = remaining.filter(([, s]) => s === secondScore).map(([c]) => c);
        } else {
          secondaryCodes = [];
        }
      }
    }
  }

  const mainProfiles = mainCodes.map((c) => profileDescriptions[c] || profileDescriptions.R);
  const secondaryProfiles = secondaryCodes.map((c) => profileDescriptions[c] || profileDescriptions.R);

  // Alerte scores proches (<=2 du meilleur), hors top
  let hasCloseTies = false;
  let tiedProfiles: string[] = [];

  if (normalizedScores) {
    const best = Math.max(...Object.values(normalizedScores));
    const sorted = Object.entries(normalizedScores).sort(([, a], [, b]) => b - a);

    tiedProfiles = sorted
      .filter(([, sc]) => sc >= best - 2 && sc !== best)
      .map(([cat]) => cat);

    hasCloseTies = tiedProfiles.length > 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white pb-24">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Résultats de ton test</h1>
        <p className="text-center text-gray-600">Découvre ton profil de personnalité</p>
      </div>

      {/* Alert */}
      {hasCloseTies && normalizedScores && (
        <div className="px-6 mb-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">Profil équilibré détecté</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Tes scores sont très proches ! Les profils <strong>{mainCodes.join(", ")}</strong>
                  {tiedProfiles.length > 0 && (
                    <>
                      {" "}
                      et <strong>{tiedProfiles.join(", ")}</strong>
                    </>
                  )}{" "}
                  te correspondent presque autant.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Scores Display */}
      {normalizedScores && (
        <div className="px-6 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tes scores détaillés :</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(normalizedScores)
                .sort(([, a], [, b]) => b - a)
                .map(([category, score]) => {
                  const isMain = mainCodes.includes(category);
                  const isSecondary = secondaryCodes.includes(category);

                  return (
                    <div
                      key={category}
                      className={`rounded-lg p-3 border-2 ${
                        isMain
                          ? "bg-primary-50 border-primary-300"
                          : isSecondary
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            isMain ? "text-primary-700" : isSecondary ? "text-indigo-700" : "text-gray-600"
                          }`}
                        >
                          {category}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">{score}/30</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isMain ? "bg-primary-500" : isSecondary ? "bg-indigo-500" : "bg-gray-400"
                          }`}
                          style={{ width: `${(score / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Main Profiles */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-primary-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Profil{mainCodes.length > 1 ? "s" : ""} principal{mainCodes.length > 1 ? "aux" : ""}
          </h3>

          <div className="space-y-5">
            {mainProfiles.map((profile, idx) => {
              const code = mainCodes[idx];
              return (
                <div key={code} className={idx > 0 ? "pt-5 border-t border-gray-100" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {code}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                      <p className="text-sm text-primary-600">
                        Profil principal
                        {normalizedScores &&
                          Number.isFinite(normalizedScores[code]) &&
                          ` • ${normalizedScores[code]}/30 points`}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{profile.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Métiers associés :</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.careers.map((career) => (
                        <span key={career} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secondary Profiles */}
      {secondaryCodes.length > 0 && (
        <div className="px-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Profil{secondaryCodes.length > 1 ? "s" : ""} secondaire{secondaryCodes.length > 1 ? "s" : ""}
          </h3>

          <div className="space-y-3">
            {secondaryProfiles.map((profile, index) => {
              const code = secondaryCodes[index];
              return (
                <div key={code} className="bg-white rounded-2xl p-4 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold">
                      {code}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{profile.name}</h4>
                      {normalizedScores && Number.isFinite(normalizedScores[code]) && (
                        <p className="text-xs text-gray-500">{normalizedScores[code]}/30 points</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{profile.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="px-6 space-y-3">
        <button
          onClick={onExplore}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          Explorer les métiers
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={onChat}
          className="w-full bg-white border-2 border-primary-200 text-primary-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Discuter avec le chatbot
        </button>
      </div>
    </div>
  );
}
