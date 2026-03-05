import {
  ArrowLeft, Bookmark, BookmarkPlus, MessageCircle, ExternalLink,
  Wrench, Heart, GraduationCap, TrendingUp, Euro, MapPin, Star,
  Briefcase, Award
} from 'lucide-react';
import type { UserProfile } from '../App';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParcoursEtape {
  etape: string;
  detail: string;
}

interface EnrichedCareer {
  id: string;
  title: string;
  url_onisep: string;
  url_detail?: string;
  sector: string;
  gfe: string;
  rome_codes: string[];
  rome_labels: string[];
  publication: string;
  domaines: string[];
  description?: string;
  competences?: string[];
  qualites?: string[];
  parcours?: ParcoursEtape[];
  perspectives?: string;
  salaire_debut?: string;
  niveau_etudes?: string;
  statut?: string;
  centres_interet?: string[];
  ou_exercer?: string;
  image_url?: string;
}

interface CareerDetailProps {
  careerId: string;
  userProfile: UserProfile;
  onBack: () => void;
  onToggleFavorite: (jobId: string) => void;
  onChat: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

import careersData from '../data/careers_enriched.json';
const careers = careersData as EnrichedCareer[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sectorGradient(sector: string): string {
  const map: Record<string, string> = {
    'Informatique & Numérique': 'from-blue-500 to-cyan-400',
    'Santé & Social':           'from-rose-500 to-pink-400',
    'Commerce & Gestion':       'from-orange-500 to-amber-400',
    'Communication & Médias':   'from-violet-500 to-purple-400',
    'Enseignement':             'from-emerald-500 to-green-400',
    'Bâtiment':                 'from-stone-500 to-stone-400',
    'Transport & Logistique':   'from-sky-500 to-sky-400',
    'Hôtellerie & Tourisme':    'from-yellow-500 to-amber-400',
    'Agriculture':              'from-lime-600 to-lime-400',
    'Chimie & Biologie':        'from-teal-500 to-cyan-400',
    'Administration':           'from-slate-500 to-slate-400',
    'Sécurité & Défense':       'from-zinc-600 to-zinc-500',
    'Électricité & Énergie':    'from-yellow-600 to-orange-400',
    'Mécanique':                'from-gray-500 to-gray-400',
    'Agroalimentaire':          'from-green-600 to-lime-400',
    'Textile & Mode':           'from-pink-500 to-rose-400',
  };
  return map[sector] ?? 'from-gray-500 to-gray-400';
}

// Carte info (salaire, niveau, statut)
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

// Bloc section générique
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function CareerDetail({
  careerId, userProfile, onBack, onToggleFavorite, onChat
}: CareerDetailProps) {
  const career = careers.find(c => c.id === careerId);
  const isFavorite = userProfile.favoriteJobs?.includes(careerId);

  if (!career) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">Métier introuvable.</p>
        <button onClick={onBack} className="text-primary-500 font-semibold">← Retour</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* Header */}
      <div className={`relative bg-gradient-to-br ${sectorGradient(career.sector)} flex flex-col`}
           style={{ minHeight: '13rem' }}>

        {/* Image en transparence */}
        {career.image_url && (
          <img
            src={career.image_url}
            alt={career.title}
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
        )}

        {/* Overlay degrade sombre */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Nav */}
        <div className="relative p-4 flex items-center justify-between">
          <button onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button onClick={() => onToggleFavorite(careerId)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
            {isFavorite
              ? <Bookmark className="w-5 h-5 text-primary-500 fill-current" />
              : <BookmarkPlus className="w-5 h-5 text-gray-800" />}
          </button>
        </div>

        {/* Titre centre */}
        <div className="relative flex-1 flex items-center justify-center px-6 pb-4">
          <h1 className="text-2xl font-bold text-white capitalize leading-tight text-center"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0px 24px rgba(0,0,0,0.7)' }}>
            {career.title}
          </h1>
        </div>

        {/* Secteur bulle bas droite */}
        <div className="relative px-4 pb-4 flex justify-end">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/40">
            {career.sector}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Badges : salaire / niveau / statut ── */}
        {(career.salaire_debut || career.niveau_etudes || career.statut) && (
          <div className="flex gap-2 flex-wrap">
            {career.salaire_debut && (
              <InfoBadge
                icon={<Euro className="w-4 h-4 text-green-500" />}
                label="Salaire débutant"
                value={career.salaire_debut}
              />
            )}
            {career.niveau_etudes && (
              <InfoBadge
                icon={<GraduationCap className="w-4 h-4 text-primary-500" />}
                label="Niveau d'accès"
                value={career.niveau_etudes}
              />
            )}
            {career.statut && (
              <InfoBadge
                icon={<Briefcase className="w-4 h-4 text-orange-400" />}
                label="Statut"
                value={career.statut}
              />
            )}
          </div>
        )}

        {/* ── Description ── */}
        {career.description && (
          <Section title="Le métier" icon={<Briefcase className="w-4 h-4 text-primary-500" />}>
            <p className="text-sm text-gray-700 leading-relaxed">{career.description}</p>
          </Section>
        )}

        {/* ── Compétences ── */}
        {career.competences && career.competences.length > 0 && (
          <Section title="Compétences requises" icon={<Wrench className="w-4 h-4 text-primary-500" />}>
            <div className="flex flex-wrap gap-2">
              {career.competences.map((c, i) => (
                <span key={i}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium border border-primary-100">
                  {c}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Qualités humaines ── */}
        {career.qualites && career.qualites.length > 0 && (
          <Section title="Qualités humaines" icon={<Heart className="w-4 h-4 text-rose-400" />}>
            <div className="space-y-3">
              {career.qualites.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-300 flex-shrink-0 mt-1.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Où l'exercer ── */}
        {career.ou_exercer && (
          <Section title="Où l'exercer ?" icon={<MapPin className="w-4 h-4 text-sky-500" />}>
            <p className="text-sm text-gray-700 leading-relaxed">{career.ou_exercer}</p>
          </Section>
        )}

        {/* ── Perspectives ── */}
        {career.perspectives && (
          <Section title="Emploi et secteur" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>
            <p className="text-sm text-gray-700 leading-relaxed">{career.perspectives}</p>
          </Section>
        )}

        {/* ── Parcours ── */}
        {career.parcours && career.parcours.length > 0 && (
          <Section title="Les études" icon={<GraduationCap className="w-4 h-4 text-primary-500" />}>
            <div>
              {career.parcours.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < career.parcours!.length - 1 && (
                      <div className="w-0.5 bg-primary-100 my-1" style={{ minHeight: '1.5rem', flex: 1 }} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{p.etape}</p>
                    {p.detail && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Centres d'intérêt ── */}
        {career.centres_interet && career.centres_interet.length > 0 && (
          <Section title="Centres d'intérêt" icon={<Star className="w-4 h-4 text-yellow-400" />}>
            <div className="flex flex-wrap gap-2">
              {career.centres_interet.map((c, i) => (
                <span key={i}
                  className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium border border-yellow-100">
                  {c}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Codes ROME ── */}
        {career.rome_codes.length > 0 && (
          <Section title="Codes ROME" icon={<Award className="w-4 h-4 text-gray-400" />}>
            <div className="space-y-2">
              {career.rome_codes.map((code, i) => (
                <div key={code} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                  <span className="font-mono text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-md flex-shrink-0">
                    {code}
                  </span>
                  <span className="text-xs text-gray-600">{career.rome_labels[i] ?? ''}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Lien ONISEP ── */}
        <a
          href={career.url_detail ?? career.url_onisep}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-800 text-sm">Voir la fiche complète</p>
            <p className="text-xs text-gray-400 mt-0.5">Témoignages, vidéos, formations liées…</p>
          </div>
          <ExternalLink className="w-5 h-5 text-primary-500 flex-shrink-0" />
        </a>

        {/* ── Mention source ONISEP ── */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 rounded-2xl border border-blue-100">
          <img
            src="https://www.onisep.fr/assets/dso/images/onisep/logo.svg"
            alt="Logo ONISEP"
            className="h-4 opacity-70"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <p className="text-xs text-blue-600 font-medium text-center">
            Données récupérées sur le site{' '}
            <a
              href="https://www.onisep.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              ONISEP.fr
            </a>
            {' '}— L'information officielle pour l'orientation
          </p>
        </div>

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