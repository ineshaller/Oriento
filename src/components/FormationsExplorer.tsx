import { useEffect, useMemo, useState } from "react";
// @ts-ignore
import {
  Search,
  GraduationCap,
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
  Bookmark,
  BookmarkPlus,
  Sparkles
} from "lucide-react";
import type { UserProfile } from "../App";

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .trim();
}

interface FormationsExplorerProps {
  userProfile: UserProfile;
  onFormationClick: (formationId: string) => void;
  onToggleFavorite: (formationId: string) => void;
}

/* -------------------- DOMAIN CONFIG -------------------- */

const domainConfig: Record<string, any> = {
  "Droit": GraduationCap,
  "Lettres Langues et Sciences Humaines": BookA,
  "Informatique et Numérique": Code,
  "Ingénierie et Technologie": Code,
  "Mathématiques et statistiques": Code,
  "Sciences et Recherche": Search,
  "Commerce et Management": Briefcase,
  "Economie et Finance": Euro,
  "Marketing et Communication": Briefcase,
  "Immobilier": Building,
  "Logistique et Transport": Train,
  "Science Politique": PersonStanding,
  "BTP": Building,
  "Architecture et Design": Building,
  "Art et Culture": Palette,
  "Technique et Industrie": Code,
  "Tourisme et Hotellerie": Plane,
  "Environnement et Agriculture": Search,
  "Sport": HeartPulse,
  "Social et Education": GraduationCap,
  "Santé et Esthétique": Heart,
  "Autre": Search
};

function getIconFromDomain(domain: string) {
  return domainConfig[domain] || domainConfig["Autre"];
}

/* -------------------- RIASEC CONFIG -------------------- */

const RIASEC_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  R: { label: "Réaliste", color: "#9a3412", bg: "#ffedd5" },
  I: { label: "Investigateur", color: "#1d4ed8", bg: "#dbeafe" },
  A: { label: "Artistique", color: "#6b21a8", bg: "#f3e8ff" },
  S: { label: "Social", color: "#15803d", bg: "#dcfce7" },
  E: { label: "Entrepreneur", color: "#b91c1c", bg: "#fee2e2" },
  C: { label: "Conventionnel", color: "#374151", bg: "#e5e7eb" },
};

const domainToRiasec: Record<string, string[]> = {
  "Droit": ["E", "C"],
  "Lettres Langues et Sciences Humaines": ["A", "S"],
  "Informatique et Numérique": ["I", "R"],
  "Ingénierie et Technologie": ["R", "I"],
  "Mathématiques et statistiques": ["I", "C"],
  "Sciences et Recherche": ["I", "R"],
  "Commerce et Management": ["E", "C"],
  "Economie et Finance": ["C", "E"],
  "Marketing et Communication": ["E", "A"],
  "Immobilier": ["E", "C"],
  "Logistique et Transport": ["R", "C"],
  "Science Politique": ["E", "S"],
  "BTP": ["R", "I"],
  "Architecture et Design": ["A", "R"],
  "Art et Culture": ["A"],
  "Technique et Industrie": ["R", "I"],
  "Tourisme et Hotellerie": ["S", "E"],
  "Environnement et Agriculture": ["R", "I"],
  "Sport": ["R", "S"],
  "Social et Education": ["S"],
  "Santé et Esthétique": ["S", "I"],
  "Autre": [],
};

function getRiasecFromDomains(domainStr: string): string[] {
  const domains = domainStr
    ? domainStr.split(",").map((d: string) => d.trim())
    : ["Autre"];
  const codes = domains.flatMap(d => domainToRiasec[d] ?? []);
  return [...new Set(codes)].slice(0, 3);
}

function getRiasecMatchScore(formationCodes: string[], userProfile: string[]): number {
  return formationCodes.filter(c => userProfile.includes(c)).length;
}

/* -------------------- COMPONENT -------------------- */

export default function FormationsExplorer({
  userProfile,
  onFormationClick,
  onToggleFavorite
}: FormationsExplorerProps) {

  const [formationsData, setFormationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  // ✅ selectedSector reçoit directement le domaine exact (ex: "Informatique et Numérique")
  const [selectedSector, setSelectedSector] = useState<string>("Tous");
  const [showMatchOnly, setShowMatchOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 50;

  const userRiasec: string[] = (userProfile.riasecProfile ?? []).slice(0, 3);
  const primaryCount: number = Math.min(userProfile.riasecPrimaryCount ?? 1, userRiasec.length);
  const primaryCodes: string[] = userRiasec.slice(0, primaryCount);
  const hasRiasecProfile = userRiasec.length > 0;

  /* -------------------- LIRE LE FILTRE DU CHATBOT -------------------- */

  useEffect(() => {
    // Filtre domaine depuis chatbot (domaines/métiers)
    const domainFilter = localStorage.getItem("formationFilter");
    if (domainFilter) {
      setSelectedSector(domainFilter);
      setPage(1);
      localStorage.removeItem("formationFilter");
    }
    // Filtre recherche textuelle depuis chatbot (type de formation : BTS, BUT, Licence...)
    const searchFilter = localStorage.getItem("formationSearchTerm");
    if (searchFilter) {
      setSearchTerm(searchFilter);
      setPage(1);
      localStorage.removeItem("formationSearchTerm");
    }
  }, []);

  /* -------------------- FETCH DATA -------------------- */

  useEffect(() => {
    fetch("/data/formations_final.json")
      .then(res => {
        if (!res.ok) throw new Error("Erreur chargement formations");
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

  /* -------------------- SECTORS -------------------- */

  const sectors = useMemo(() => {
    return [
      "Tous",
      ...Array.from(
        new Set(
          formationsData.flatMap(f =>
            f.domain
              ? f.domain.split(",").map((d: string) => d.trim())
              : ["Autre"]
          )
        )
      ).sort((a, b) => a.localeCompare(b, "fr"))
    ];
  }, [formationsData]);

  /* -------------------- FILTER + SORT -------------------- */

  const filteredFormations = useMemo(() => {
    const list = formationsData
      .map(f => ({
        ...f,
        _riasecCodes: getRiasecFromDomains(f.domain ?? ""),
        _matchScore: getRiasecMatchScore(
          getRiasecFromDomains(f.domain ?? ""),
          primaryCodes
        )
      }))
      .filter(f => {
        const domains = f.domain
          ? f.domain.split(",").map((d: string) => d.trim())
          : ["Autre"];

        const q = normalize(searchTerm);
        const words = q.split(/\s+/).filter(Boolean);
        const titleNorm = normalize(f.title);
        const etabNorm = normalize(f.etablissement ?? "");
        const matchesSearch =
          words.length === 0 ||
          words.every(w => titleNorm.includes(w) || etabNorm.includes(w));

        // ✅ filtre par domaine exact
        const matchesSector =
          selectedSector === "Tous" || domains.includes(selectedSector);

        const matchesRiasecFilter =
          !showMatchOnly || f._matchScore > 0;

        return matchesSearch && matchesSector && matchesRiasecFilter;
      });

    // Tri alphabétique quand "Tous", RIASEC en premier quand un domaine est filtré
    if (selectedSector === "Tous") {
      list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? "", "fr"));
    } else if (hasRiasecProfile) {
      list.sort((a, b) => b._matchScore - a._matchScore);
    }

    return list;
  }, [formationsData, searchTerm, selectedSector, showMatchOnly, userRiasec]);

  const displayedFormations = filteredFormations.slice(0, page * PAGE_SIZE);

  const isFavorite = (formationId: string) => {
    return userProfile.savedFormations?.includes(formationId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement des formations...
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HEADER */}
      <div className="bg-white p-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Explorer les formations
        </h1>

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Rechercher une formation..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* RIASEC MATCH TOGGLE */}
        {hasRiasecProfile && (
          <div className="mb-4">
            <button
              onClick={() => { setShowMatchOnly(prev => !prev); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                showMatchOnly
                  ? "bg-yellow-400 text-yellow-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {showMatchOnly ? "Afficher toutes les formations" : "Voir uniquement les formations qui me correspondent"}
            </button>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-s text-gray-400">Votre profil :</span>
              {userRiasec.map(code => {
                const r = RIASEC_LABELS[code];
                if (!r) return null;
                return (
                  <span key={code} style={{ backgroundColor: r.bg, color: r.color }} className="px-2 py-0.5 rounded-full text-xs font-semibold">
                    {code} · {r.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTER BAR — domaines */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {sectors.map((sector: string) => (
            <button
              key={sector}
              onClick={() => { setSelectedSector(sector); setPage(1); }}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors text-sm ${
                selectedSector === sector
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div className="p-6 space-y-3">
        {displayedFormations.map((f) => {
          const firstDomain = f.domain ? f.domain.split(",")[0].trim() : "Autre";
          const Icon = getIconFromDomain(firstDomain);
          const favorite = isFavorite(f.id);
          const matchScore = f._matchScore as number;
          const riasecCodes = f._riasecCodes as string[];
          const isMatch = hasRiasecProfile && matchScore > 0;

          return (
            <div key={f.id} className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow ${isMatch ? "ring-2 ring-yellow-300" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {hasRiasecProfile && riasecCodes.some(c => primaryCodes.includes(c)) && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-600">Correspond à votre profil</span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                  <div className="text-sm text-gray-600 mb-1">{f.etablissement}</div>
                  <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
                    {f.domain
                      ? f.domain.split(",").map((d: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{d.trim()}</span>
                        ))
                      : <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Autre</span>
                    }
                  </div>
                  {riasecCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {riasecCodes.map(code => {
                        const r = RIASEC_LABELS[code];
                        const isUserCode = userRiasec.includes(code);
                        return (
                          <span key={code} style={{ backgroundColor: r.bg, color: r.color }} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isUserCode ? "ring-2 ring-offset-1 ring-yellow-400" : ""}`}>
                            {code} · {r.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => onFormationClick(f.id)} className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
                      Voir le détail
                    </button>
                    <button onClick={() => onToggleFavorite(f.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${favorite ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                      {favorite ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedFormations.length < filteredFormations.length && (
        <div className="flex justify-center py-6">
          <button onClick={() => setPage(prev => prev + 1)} className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
            Voir plus
          </button>
        </div>
      )}

      {filteredFormations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune formation trouvée</p>
          <button onClick={() => { setSelectedSector("Tous"); setSearchTerm(""); setPage(1); }} className="mt-3 text-sm text-primary-500 underline">
            Effacer les filtres
          </button>
        </div>
      )}
    </div>
  );
}