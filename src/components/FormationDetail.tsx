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
  PersonStanding
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

/* -------------------- Helper établissement -------------------- */
function parseEtablissement(etablissement: string) {
  const match = etablissement.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      location: match[2].trim()
    };
  }
  return { name: etablissement.trim(), location: "" };
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

  /* -------- Sécurité avant rendu -------- */
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

  const formation =
    formationsData.find(f => f.id === formationId) || formationsData[0];

  const isFavorite = userProfile.favoriteJobs?.includes(formationId);

  const firstDomain = formation.domain
    ? formation.domain.split(",")[0].trim()
    : "Autre";

  const Icon = getIconFromDomain(firstDomain);
  const { name: etabName, location: etabLocation } = parseEtablissement(
    formation.etablissement || ""
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
        {formation.image && (
          <img
            src={formation.image}
            alt={formation.title}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            onClick={() => onToggleFavorite(formationId)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              isFavorite ? "bg-primary-500" : "bg-white/90"
            }`}
          >
            {isFavorite ? (
              <Bookmark className="w-5 h-5 text-white fill-current" />
            ) : (
              <BookmarkPlus className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {formation.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Établissement:</strong> {etabName}</p>
          <p><strong>Domaine:</strong> {formation.domain}</p>
          {etabLocation && <p><strong>Lieu:</strong> {etabLocation}</p>}
          {formation.type && <p><strong>Type:</strong> {formation.type}</p>}
          {formation.skills?.length > 0 && (
            <p><strong>Spécialités:</strong> {formation.skills.join(", ")}</p>
          )}
        </div>

        {formation.description && (
          <section>
            <h2 className="text-xl font-bold mb-3">Description</h2>
            <p className="text-gray-700">{formation.description}</p>
          </section>
        )}

        {formation.qualities?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">Qualités humaines</h2>
            {formation.qualities.map((q: string) => (
              <div key={q} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                <span>{q}</span>
              </div>
            ))}
          </section>
        )}

        {formation.stats && (
          <section>
            <h2 className="text-xl font-bold mb-3">Informations clés et statistiques de l'année précédente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 text-sm">
              <div><strong>Ville :</strong> {formation.stats.ville_etab}</div>
              <div><strong>Région :</strong> {formation.stats.region_etab_aff}</div>
              <div><strong>Type :</strong> {formation.stats.select_form}</div>
              <div><strong>Capacité :</strong> {formation.stats.capa_fin}</div>
              <div><strong>Nombre de vœux :</strong> {formation.stats.voe_tot}</div>
              <div><strong>Nombre d’admis :</strong> {formation.stats.acc_tot}</div>
              <div><strong>Taux d’accès :</strong> {formation.stats.taux_acces_ens}%</div>
            </div>
          </section>
        )}

        {formation.education?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">Formations possibles</h2>
            {formation.education.map((e: string, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                {e}
              </div>
            ))}
          </section>
        )}
        {formation.links && (
          <section>
            <h2 className="text-xl font-bold mb-3">Liens utiles</h2>
            <ul className="space-y-2 text-primary-600 underline">
              {formation.links.ficheFormation && (
                <li>
                  <a href={formation.links.ficheFormation} target="_blank" rel="noreferrer">
                    Fiche formation Parcoursup
                  </a>
                </li>
              )}
              
              {formation.links.site && (
                <li>
                  <a href={formation.links.site} target="_blank" rel="noreferrer">
                    Site de l’établissement
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-white"> 
        <button onClick={onChat} className="w-full max-w-md mx-auto bg-primary-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2" > 
          <MessageCircle className="w-5 h-5" /> Discuter avec le chatbot </button> 
      </div>

      <div className="pb-24">
        {/* contenu de la page */}
      </div>
    </div>
  );
}
