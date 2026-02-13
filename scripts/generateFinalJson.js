import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Charger le JSON cartographie ---
const cartoPath = path.join(__dirname, '../src/data/formations.json');
if (!fs.existsSync(cartoPath)) {
  throw new Error(`Fichier introuvable : ${cartoPath}`);
}
const cartoFormations = JSON.parse(fs.readFileSync(cartoPath, 'utf8'));

// --- Charger le snapshot API Stats ---
const statsPath = path.join(__dirname, '../src/data/parcoursup_stats_snapshot.json');
if (!fs.existsSync(statsPath)) {
  throw new Error(`Fichier introuvable : ${statsPath}`);
}
const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

// --- Créer un Set des codes internes pour filtrage ---
const statsCodes = new Set(statsData.map(item => item.fields.cod_aff_form));

// --- Filtrer et enrichir le JSON cartographie ---
let filteredFormations = cartoFormations
  .filter(row => statsCodes.has(row.id)) // row.id = code interne Parcoursup
  .map(row => {
    // trouver les stats correspondantes dans l'API
    const stats = statsData.find(item => item.fields.cod_aff_form === row.id)?.fields || {};
    return {
      ...row,
      stats // toutes les stats de l'API associées
    };
  });

console.log(`Cartographie total: ${cartoFormations.length}`);
console.log(`API Stats total: ${statsData.length}`);
console.log(`Formations conservées après filtrage: ${filteredFormations.length}`);

// --- Dédoublonner : une seule formation par code interne ---
const seen = new Set();
filteredFormations = filteredFormations.filter(f => {
  if (seen.has(f.id)) return false;
  seen.add(f.id);
  return true;
});

console.log(`Formations uniques après dédoublonnage: ${filteredFormations.length}`);

// --- Écrire le JSON final ---
const outputDir = path.join(__dirname, "../public/data");
const outputPath = path.join(outputDir, "formations_final.json");
fs.writeFileSync(outputPath, JSON.stringify(filteredFormations, null, 2));

console.log(`JSON final généré avec stats (${filteredFormations.length} formations)`);
