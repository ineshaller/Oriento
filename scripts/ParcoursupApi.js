import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On utilise l'API records de data.education
const API_URL =
  'https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-esr-parcoursup&rows=10000';

const outputPath = path.join(
  __dirname,
  '../src/data/parcoursup_stats_snapshot.json'
);

async function snapshotStatsApi() {
  console.log("Téléchargement API Stats Parcoursup...");

  const res = await fetch(API_URL);
  const data = await res.json();

  const records = data.records ?? [];

  if (!records.length) {
    throw new Error("Aucune donnée récupérée – vérifie l’URL ou la dataset");
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));

  console.log(`Snapshot API Stats enregistré (${records.length} entrées)`);
}

snapshotStatsApi().catch(err => {
  console.error(err.message);
});
