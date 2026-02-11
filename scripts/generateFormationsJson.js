import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers ton CSV Parcoursup
const csvPath = path.join(
  __dirname,
  '../src/data/cartographie_formations_parcoursup.csv'
);

// Chemin de sortie pour le JSON
const outputPath = path.join(
  __dirname,
  '../src/data/formations.json'
);

// Lire le fichier CSV
const csvFile = fs.readFileSync(csvPath, 'utf8');

// Parser le CSV
const parsed = Papa.parse(csvFile, {
  header: true,
  skipEmptyLines: true,
});

const formations = parsed.data.map((row, index) => ({
  id: row['Code interne Parcoursup de la formation'] || String(index),
  title: row['Nom long de la formation'] || row['Nom court de la formation'] || `Formation ${index}`,
  description: row['Informations complémentaires'] || '',
  domain: row['Domaine'] || 'Autre',
  etablissement: row['Nom de l\'établissement'] || '',
  type: row['Types de formation'] || '',
  skills: [],       // Tu pourras remplir plus tard si tu veux
  qualities: [],    // Tu pourras remplir plus tard si tu veux
  education: [row['Types de formation'] || ''],
  links: {
    ficheFormation: row['Lien vers la fiche formation'] || '',
    statistiques: row['Lien vers les données statistiques pour l\'année antérieure'] || '',
    site: row['Site internet de l\'établissement'] || '',
  },
  location: row['Localisation'] || '', // optionnel
  image: '', // tu peux mettre une image par défaut ici si tu veux
}));

// Écrire le JSON
fs.writeFileSync(outputPath, JSON.stringify(formations, null, 2));

console.log(`✅ formations.json généré (${formations.length} formations)`);
