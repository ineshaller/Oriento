import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  GraduationCap,
  CheckCircle,
  MessageCircle,
  Search,
  Code,
  Heart,
  Palette,
  Building,
  Briefcase,
  Euro,
  BookA,
  Train,
  Plane,
  HeartPulse,
  PersonStanding,
  MapPin,
  TrendingUp,
  ExternalLink,
  Users
} from "lucide-react";
import type { UserProfile } from "../App";

interface FormationDetailProps {
  formationId: string;
  userProfile: UserProfile;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onChat: () => void;
}

/* -------------------- DOMAIN CONFIG -------------------- */
const domainConfig: Record<string, any> = {
  Droit: GraduationCap,
  "Lettres Langues et Sciences Humaines": BookA,
  "Informatique et Numérique": Code,
  "Ingénierie et Technologie": Code,
  "Mathématiques et statistiques": Code,
  "Sciences et Recherche": Search,
  "Commerce et Management": Briefcase,
  "Economie et Finance": Euro,
  "Marketing et Communication": Briefcase,
  Immobilier: Building,
  "Logistique et Transport": Train,
  "Science Politique": PersonStanding,
  BTP: Building,
  "Architecture et Design": Building,
  "Art et Culture": Palette,
  "Technique et Industrie": Code,
  "Tourisme et Hotellerie": Plane,
  "Environnement et Agriculture": Search,
  Sport: HeartPulse,
  "Social et Education": GraduationCap,
  "Santé et Esthétique": Heart,
  Autre: Search
};

function getIconFromDomain(domain: string) {
  return domainConfig[domain] || domainConfig["Autre"];
}

function domainGradient(domain: string): string {
  const map: Record<string, string> = {
    "Informatique et Numérique":            "from-blue-500 to-cyan-400",
    "Ingénierie et Technologie":            "from-blue-600 to-blue-400",
    "Mathématiques et statistiques":        "from-indigo-500 to-blue-400",
    "Sciences et Recherche":                "from-teal-500 to-cyan-400",
    "Commerce et Management":               "from-orange-500 to-amber-400",
    "Economie et Finance":                  "from-green-600 to-emerald-400",
    "Marketing et Communication":           "from-violet-500 to-purple-400",
    "Droit":                                "from-slate-600 to-slate-400",
    "Lettres Langues et Sciences Humaines": "from-rose-500 to-pink-400",
    "Immobilier":                           "from-stone-500 to-stone-400",
    "Logistique et Transport":              "from-sky-500 to-sky-400",
    "Science Politique":                    "from-zinc-600 to-zinc-400",
    "BTP":                                  "from-stone-600 to-amber-400",
    "Architecture et Design":               "from-fuchsia-500 to-purple-400",
    "Art et Culture":                       "from-pink-500 to-rose-400",
    "Technique et Industrie":               "from-gray-600 to-gray-400",
    "Tourisme et Hotellerie":               "from-yellow-500 to-amber-400",
    "Environnement et Agriculture":         "from-lime-600 to-green-400",
    "Sport":                                "from-emerald-500 to-green-400",
    "Social et Education":                  "from-sky-500 to-blue-400",
    "Santé et Esthétique":                  "from-rose-500 to-pink-400",
  };
  return map[domain] ?? "from-gray-500 to-gray-400";
}

/* -------------------- Helper établissement -------------------- */
function parseEtablissement(etablissement: string) {
  const match = etablissement.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { name: match[1].trim(), location: match[2].trim() };
  }
  return { name: etablissement.trim(), location: "" };
}

/* -------------------- SUB COMPONENTS -------------------- */
function InfoBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-start gap-2 min-w-0">
      <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-xs font-semibold text-gray-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

/* -------------------- COMPONENT -------------------- */
export default function FormationDetail({
  formationId,
  userProfile,
  onBack,
  onToggleFavorite,
  onChat
}: FormationDetailProps) {
  const [formationsData, setFormationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/formations_final.json")
      .then(res => {
        if (!res.ok) throw new Error("JSON introuvable");
        return res.json();
      })
      .then(data => {
        setFormationsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!formationsData.length) {
    return <div className="p-6 text-red-500">Aucune donnée disponible</div>;
  }

  const formation = formationsData.find(f => f.id === formationId) || formationsData[0];
  const isFavorite = userProfile.favoriteJobs?.includes(formationId);

  const firstDomain = formation.domain
    ? formation.domain.split(",")[0].trim()
    : "Autre";

  const Icon = getIconFromDomain(firstDomain);
  const gradient = domainGradient(firstDomain);
  const { name: etabName, location: etabLocation } = parseEtablissement(formation.etablissement || "");

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* ── Header ── */}
      <div
        className={`relative bg-gradient-to-br ${gradient} flex flex-col`}
        style={{ minHeight: "13rem" }}
      >
        {formation.image && (
          <img
            src={formation.image}
            alt={formation.title}
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Nav */}
        <div className="relative p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={() => onToggleFavorite(formationId)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow"
          >
            {isFavorite
              ? <Bookmark className="w-5 h-5 text-primary-500 fill-current" />
              : <BookmarkPlus className="w-5 h-5 text-gray-800" />}
          </button>
        </div>

        {/* Titre centré */}
        <div className="relative flex-1 flex items-center justify-center px-6 pb-4">
          <h1
            className="text-2xl font-bold text-white leading-tight text-center"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0px 24px rgba(0,0,0,0.7)" }}
          >
            {formation.title}
          </h1>
        </div>

        {/* Domaine bulle bas droite */}
        <div className="relative px-4 pb-4 flex justify-end">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/40">
            {firstDomain}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Badges info ── */}
        <div className="flex gap-2 flex-wrap">
          {etabName && (
            <InfoBadge
              icon={<GraduationCap className="w-4 h-4 text-primary-500" />}
              label="Établissement"
              value={etabName}
            />
          )}
          {etabLocation && (
            <InfoBadge
              icon={<MapPin className="w-4 h-4 text-sky-500" />}
              label="Lieu"
              value={etabLocation}
            />
          )}
          {formation.type && (
            <InfoBadge
              icon={<Briefcase className="w-4 h-4 text-orange-400" />}
              label="Type"
              value={formation.type}
            />
          )}
        </div>

        {/* ── Description ── */}
        {formation.description && (
          <Section title="La formation" icon={<BookA className="w-4 h-4 text-primary-500" />}>
            <p className="text-sm text-gray-700 leading-relaxed">{formation.description}</p>
          </Section>
        )}

        {/* ── Spécialités ── */}
        {formation.skills?.length > 0 && (
          <Section title="Spécialités" icon={<Code className="w-4 h-4 text-primary-500" />}>
            <div className="flex flex-wrap gap-2">
              {formation.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium border border-primary-100">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Qualités ── */}
        {formation.qualities?.length > 0 && (
          <Section title="Qualités humaines" icon={<Heart className="w-4 h-4 text-rose-400" />}>
            <div className="space-y-2">
              {formation.qualities.map((q: string) => (
                <div key={q} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Stats Parcoursup ── */}
        {formation.stats && (
          <Section title="Statistiques Parcoursup" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ville", value: formation.stats.ville_etab },
                { label: "Région", value: formation.stats.region_etab_aff },
                { label: "Sélectivité", value: formation.stats.select_form },
                { label: "Capacité", value: formation.stats.capa_fin },
                { label: "Nombre de vœux", value: formation.stats.voe_tot },
                { label: "Admis", value: formation.stats.acc_tot },
                { label: "Taux d'accès", value: formation.stats.taux_acces_ens ? `${formation.stats.taux_acces_ens}%` : undefined },
              ].filter(item => item.value != null && item.value !== "").map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Formations possibles ── */}
        {formation.education?.length > 0 && (
          <Section title="Formations possibles" icon={<GraduationCap className="w-4 h-4 text-primary-500" />}>
            <div className="space-y-2">
              {formation.education.map((e: string, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < formation.education.length - 1 && (
                      <div className="w-0.5 bg-primary-100 my-1" style={{ minHeight: "1.5rem", flex: 1 }} />
                    )}
                  </div>
                  <div className="pb-3 flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{e}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Liens utiles ── */}
        {formation.links && (
          <Section title="Liens utiles" icon={<ExternalLink className="w-4 h-4 text-primary-500" />}>
            <div className="space-y-2">
              {formation.links.ficheFormation && (
                <a
                  href={formation.links.ficheFormation}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-800">Fiche formation Parcoursup</p>
                  <ExternalLink className="w-4 h-4 text-primary-500 flex-shrink-0" />
                </a>
              )}
              {formation.links.site && (
                <a
                  href={formation.links.site}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-800">Site de l'établissement</p>
                  <ExternalLink className="w-4 h-4 text-primary-500 flex-shrink-0" />
                </a>
              )}
            </div>
          </Section>
        )}

      </div>

      {/* ── Bouton chatbot flottant ── */}
      <button
        onClick={onChat}
        className="fixed bottom-28 right-5 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-xl flex items-center justify-center z-50"
        title="Discuter avec le chatbot"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}