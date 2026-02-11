import { useState } from "react";
import formationsData from "../data/formations.json";
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
  User
} from "lucide-react";
import type { UserProfile } from "../App";

interface FormationsExplorerProps {
  userProfile: UserProfile;
  onFormationClick: (formationId: string) => void;
  onToggleFavorite: (formationId: string) => void;
}

/* -------------------- DOMAIN CONFIG EXACT -------------------- */

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

/* -------------------- SECTORS FROM JSON -------------------- */

const sectors: string[] = [
  "Tous",
  ...Array.from(
    new Set(
      formationsData.map(f =>
        f.domain ? f.domain.split(",")[0].trim() : "Autre"
      )
    )
  ).map(s => String(s)) // <-- assure à TypeScript que c'est bien des string
];


/* -------------------- COMPONENT -------------------- */

export default function FormationsExplorer({
  userProfile,
  onFormationClick,
  onToggleFavorite
}: FormationsExplorerProps) {

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("Tous");

  /* -------------------- FILTER -------------------- */

  const filteredFormations = formationsData.filter(f => {
    const firstDomain = f.domain
      ? f.domain.split(",")[0].trim()
      : "Autre";

    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.etablissement.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector =
      selectedSector === "Tous" || firstDomain === selectedSector;

    return matchesSearch && matchesSector;
  });

  const isFavorite = (formationId: string) => {
    return userProfile.favoriteJobs?.includes(formationId);
  };

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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {sectors.map((sector: string) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
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
        {filteredFormations.map((f) => {

          const firstDomain = f.domain
            ? f.domain.split(",")[0].trim()
            : "Autre";

          const Icon = getIconFromDomain(firstDomain);
          const favorite = isFavorite(f.id);

          return (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">

                {/* ICON */}
                <div className="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1">
                    {f.title}
                  </h3>

                  <div className="text-sm text-gray-600 mb-1">
                    {f.etablissement}
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    {firstDomain}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onFormationClick(f.id)}
                      className="flex-1 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Voir le détail
                    </button>

                    <button
                      onClick={() => onToggleFavorite(f.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        favorite
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {favorite ? (
                        <Bookmark className="w-5 h-5 fill-current" />
                      ) : (
                        <BookmarkPlus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredFormations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Aucune formation trouvée
          </p>
        </div>
      )}
    </div>
  );
}
