import { ArrowLeft, Bookmark, BookmarkPlus, MessageCircle, ExternalLink, Tag, MapPin } from 'lucide-react';
import type { UserProfile } from '../App';
import type { Career } from './CareersExplorer';
import careersData from '../data/metiers.json';

const careers: Career[] = careersData as Career[];

interface CareerDetailProps {
  careerId: string;
  userProfile: UserProfile;
  onBack: () => void;
  onToggleFavorite: (jobId: string) => void;
  onChat: () => void;
}

function sectorColor(sector: string): string {
  const map: Record<string, string> = {
    'Informatique & Numérique': 'from-blue-400 to-blue-600',
    'Santé & Social':           'from-red-400 to-red-600',
    'Commerce & Gestion':       'from-orange-400 to-orange-600',
    'Communication & Médias':   'from-purple-400 to-purple-600',
    'Enseignement':             'from-green-400 to-green-600',
    'Bâtiment':                 'from-stone-400 to-stone-600',
    'Transport & Logistique':   'from-sky-400 to-sky-600',
    'Hôtellerie & Tourisme':    'from-yellow-500 to-yellow-600',
    'Agriculture':              'from-lime-400 to-lime-600',
    'Chimie & Biologie':        'from-teal-400 to-teal-600',
    'Administration':           'from-slate-400 to-slate-600',
    'Sécurité & Défense':       'from-zinc-500 to-zinc-700',
  };
  return map[sector] ?? 'from-gray-400 to-gray-600';
}

export default function CareerDetail({ careerId, userProfile, onBack, onToggleFavorite, onChat }: CareerDetailProps) {
  // Cherche le métier dans le JSON ONISEP
  const career: Career | undefined = careers.find(c => c.id === careerId);
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
    <div className="min-h-screen bg-white pb-32">
      {/* Header coloré selon le secteur */}
      <div className={`relative h-48 bg-gradient-to-br ${sectorColor(career.sector)}`}>
        {/* Initiales en grand */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="text-white font-black" style={{ fontSize: '8rem', lineHeight: 1 }}>
            {career.sector.split(/[\s&]+/)[0]?.[0]?.toUpperCase()}
          </span>
        </div>

        {/* Boutons haut */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={() => onToggleFavorite(careerId)}
            className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg ${
              isFavorite ? 'bg-white' : 'bg-white/90'
            }`}
          >
            {isFavorite
              ? <Bookmark className="w-5 h-5 text-primary-500 fill-current" />
              : <BookmarkPlus className="w-5 h-5 text-gray-800" />}
          </button>
        </div>

        {/* Titre */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white capitalize leading-tight">
            {career.title}
          </h1>
          <p className="text-white/80 text-sm mt-1">{career.sector}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-6">

        {/* Codes ROME */}
        {career.rome_codes.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500" />
              Codes ROME
            </h2>
            <div className="space-y-2">
              {career.rome_codes.map((code, i) => (
                <div key={code} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="font-mono text-sm font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-md flex-shrink-0">
                    {code}
                  </span>
                  <span className="text-sm text-gray-700">
                    {career.rome_labels[i] ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Domaines */}
        {career.domaines.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              Domaines & sous-domaines
            </h2>
            <div className="flex flex-wrap gap-2">
              {career.domaines.map((d, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Publication ONISEP */}
        {career.publication && (
          <section className="p-4 bg-blue-50 rounded-2xl">
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">
              Source ONISEP
            </p>
            <p className="text-sm text-blue-800 font-medium">{career.publication}</p>
          </section>
        )}

        {/* Lien ONISEP */}
        <a
          href={career.url_onisep}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-800 text-sm">Fiche complète sur ONISEP</p>
            <p className="text-xs text-gray-400 mt-0.5">Formations, débouchés, salaires…</p>
          </div>
          <ExternalLink className="w-5 h-5 text-primary-500 flex-shrink-0" />
        </a>
      </div>

      {/* CTA fixe */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <button
          onClick={onChat}
          className="pointer-events-auto w-full max-w-md mx-auto flex bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-2xl font-semibold items-center justify-center gap-2 shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Discuter avec le chatbot
        </button>
      </div>
    </div>
  );
}