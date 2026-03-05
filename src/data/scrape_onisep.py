"""
Scraper ONISEP — version finale avec sélecteurs précis.

Usage :
    pip install requests beautifulsoup4
    py scrape_onisep.py

Met LIMIT = 5 pour tester d'abord, puis LIMIT = None pour tout traiter.
Le script reprend automatiquement là où il s'est arrêté.
"""

import json, time, sys, re
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4"); sys.exit(1)

# ─── Config ───────────────────────────────────────────────────────────────────

INPUT_FILE  = Path("careers_onisep.json")
OUTPUT_FILE = Path("careers_enriched.json")
CHECKPOINT  = Path("scrape_checkpoint.json")

LIMIT = None   # 5 pour tester, None pour tout
DELAY = 1.2

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def clean(text):
    return re.sub(r'\s+', ' ', text or '').strip()

def section_text(soup, section_id):
    """Retourne le texte brut d'une section par son id."""
    div = soup.find(id=section_id)
    if not div:
        return ''
    return clean(div.get_text(separator=' '))

def section_div(soup, section_id):
    """Retourne le tag BeautifulSoup d'une section par son id."""
    return soup.find(id=section_id)

# ─── Extracteurs spécialisés ──────────────────────────────────────────────────

def extract_description(soup):
    """
    La description est dans le chapeau sous le h1 (div.text-xl.mt-4w)
    ou dans le div#metier > .ibexa_richtext-field.
    On prend la meta description comme fallback (toujours propre).
    """
    # 1. Meta description (la plus propre)
    meta = soup.find('meta', {'name': 'description'})
    if meta and meta.get('content'):
        return clean(meta['content'])

    # 2. Chapeau sous le h1
    chapeau = soup.find('div', class_='text-xl')
    if chapeau:
        t = clean(chapeau.get_text())
        if len(t) > 40:
            return t

    return ''


def extract_competences(soup):
    """
    Dans #competences-requises, les compétences sont des <h3>
    (ex: "Patience et sens de l'écoute", "Autonomie et résistance", "Esprit d'équipe")
    On retourne la liste des titres h3.
    """
    div = section_div(soup, 'competences-requises')
    if not div:
        return []
    h3s = [clean(h.get_text()) for h in div.find_all('h3')]
    # Filtre les h3 trop courts ou parasites
    return [h for h in h3s if len(h) > 3 and h.lower() not in ['compétences requises']]


def extract_qualites(soup):
    """
    Les qualités sont dans les <p> sous chaque <h3> de #competences-requises.
    On extrait les mots-clés de chaque paragraphe (tact, discrétion, écoute...).
    """
    div = section_div(soup, 'competences-requises')
    if not div:
        return []
    qualites = []
    for p in div.find_all('p'):
        t = clean(p.get_text())
        if t and len(t) > 10:
            qualites.append(t[:200])
    return qualites[:4]


def extract_ou_exercer(soup):
    """Texte de la section #ou-exercer."""
    div = section_div(soup, 'ou-exercer')
    if not div:
        return ''
    # Prend le premier paragraphe substantiel
    for p in div.find_all('p'):
        t = clean(p.get_text())
        if len(t) > 30:
            return t[:400]
    return clean(div.get_text())[:400]


def extract_parcours(soup):
    """
    Dans #formations-diplomes :
    - Les étapes sont des <h3> (ex: "CAP ou équivalent", "bac ou équivalent")
    - Les formations liées sont dans des <a class="link icon-left"> juste après
    """
    div = section_div(soup, 'formations-diplomes')
    if not div:
        return []

    parcours = []

    # Texte intro (avant les h3 de niveaux)
    intro_div = div.find('div', class_='ibexa_richtext-field')
    if intro_div:
        intro_h3 = intro_div.find('h3')
        intro_p  = intro_div.find('p')
        if intro_h3 and intro_p:
            parcours.append({
                "etape": clean(intro_h3.get_text()),
                "detail": clean(intro_p.get_text())
            })

    # Niveaux avec formations listées
    for h3 in div.find_all('h3', class_=''):
        niveau = clean(h3.get_text())
        if not niveau or niveau in ['Les études']:
            continue
        # Formations qui suivent ce h3
        formations = []
        node = h3.find_next_sibling()
        while node:
            if node.name == 'h3':
                break
            a = node.find('a') if hasattr(node, 'find') else None
            if a:
                formations.append(clean(a.get_text()))
            node = node.find_next_sibling()
        if niveau and (formations or len(niveau) > 3):
            parcours.append({
                "etape": niveau,
                "detail": ', '.join(formations[:4]) if formations else ''
            })

    return parcours[:6]


def extract_emploi(soup):
    """
    Dans #emploi-secteur :
    - Les <h3> sont les sous-titres ("Des besoins croissants", "Évolutions possibles"...)
    - Les <p> contiennent le texte
    On retourne le premier paragraphe comme perspectives.
    """
    div = section_div(soup, 'emploi-secteur')
    if not div:
        return ''
    for p in div.find_all('p'):
        t = clean(p.get_text())
        if len(t) > 40:
            return t[:500]
    return ''


def extract_salaire(soup):
    """
    Dans #salaire-débutant (attention à l'accent dans l'id) :
    Le salaire est soit dans un <div class="tag"> (callout en haut),
    soit dans le texte de la section.
    """
    # 1. Callout en haut de page : <div class="tag">Salaire débutant : <strong>1802 €</strong></div>
    for tag_div in soup.find_all('div', class_='tag'):
        t = clean(tag_div.get_text())
        if 'salaire' in t.lower():
            strong = tag_div.find('strong')
            if strong:
                val = clean(strong.get_text())
                # Ajoute "€/mois" si pas déjà présent
                if val and '€' not in val:
                    val += ' €/mois'
                return val

    # 2. Section dédiée (id peut contenir un accent encodé)
    for section_id in ['salaire-débutant', 'salaire-debutant', 'salaire']:
        div = section_div(soup, section_id)
        if div:
            t = clean(div.get_text())
            # Extrait le montant
            m = re.search(r'[\d][\d\s]*\s*(?:euros?|€)[^.]*', t, re.I)
            if m:
                return clean(m.group(0))[:100]
            return t[:100]

    return ''


def extract_niveau_etudes(soup):
    """Le niveau minimum est dans le callout : <div class="tag">Niveau minimum...<strong>CAP</strong>"""
    for tag_div in soup.find_all('div', class_='tag'):
        t = clean(tag_div.get_text())
        if 'niveau' in t.lower():
            strong = tag_div.find('strong')
            if strong:
                return clean(strong.get_text())
    return ''


def extract_statut(soup):
    """Statut salarié/indépendant depuis le callout."""
    for tag_div in soup.find_all('div', class_='tag'):
        t = clean(tag_div.get_text())
        if 'statut' in t.lower():
            strong = tag_div.find('strong')
            if strong:
                return clean(strong.get_text())
    return ''


def extract_centres_interet(soup):
    """Centres d'intérêt dans le callout."""
    for p in soup.find_all('p'):
        t = clean(p.get_text())
        if "centres d'intérêt" in t.lower() or "intérêt" in t.lower():
            strong = p.find('strong')
            if strong:
                # Texte après le strong
                rest = t.replace(clean(strong.get_text()), '').strip().strip(':').strip()
                if rest and len(rest) > 5:
                    return [c.strip() for c in rest.split(',') if c.strip()]
    return []


def extract_image(soup):
    """URL de l'image principale du métier."""
    # Meta og:image
    meta = soup.find('meta', property='og:image')
    if meta and meta.get('content'):
        return meta['content']
    # Première image de l'article
    fig = soup.find('figure')
    if fig:
        img = fig.find('img')
        if img and img.get('src'):
            src = img['src']
            if src.startswith('/'):
                src = 'https://www.onisep.fr' + src
            return src
    return ''


# ─── Scraper principal ────────────────────────────────────────────────────────

def scrape_career(url, session):
    result = {}
    try:
        r = session.head(url, allow_redirects=True, timeout=12, headers=HEADERS)
        real_url = r.url
        result['url_detail'] = real_url

        r = session.get(real_url, timeout=15, headers=HEADERS)
        r.raise_for_status()
        r.encoding = 'utf-8'
        soup = BeautifulSoup(r.text, 'html.parser')

        result['description']      = extract_description(soup)
        result['competences']      = extract_competences(soup)
        result['qualites']         = extract_qualites(soup)
        result['ou_exercer']       = extract_ou_exercer(soup)
        result['parcours']         = extract_parcours(soup)
        result['perspectives']     = extract_emploi(soup)
        result['salaire_debut']    = extract_salaire(soup)
        result['niveau_etudes']    = extract_niveau_etudes(soup)
        result['statut']           = extract_statut(soup)
        result['centres_interet']  = extract_centres_interet(soup)
        result['image_url']        = extract_image(soup)

        # Nettoyage : retire les champs vides
        result = {k: v for k, v in result.items() if v}

    except requests.exceptions.HTTPError as e:
        result['scrape_error'] = f"HTTP {e.response.status_code}"
    except requests.exceptions.Timeout:
        result['scrape_error'] = "Timeout"
    except Exception as e:
        result['scrape_error'] = str(e)[:200]

    return result


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not INPUT_FILE.exists():
        print(f"❌ Fichier introuvable : {INPUT_FILE}"); sys.exit(1)

    with open(INPUT_FILE, encoding='utf-8') as f:
        careers = json.load(f)

    if LIMIT:
        careers = careers[:LIMIT]

    total = len(careers)
    print(f"📋 {total} métiers à scraper")
    print(f"⏱  Durée estimée : ~{total * DELAY / 60:.0f} min\n")

    enriched = {}
    if CHECKPOINT.exists():
        with open(CHECKPOINT, encoding='utf-8') as f:
            enriched = json.load(f)
        print(f"♻️  Reprise : {len(enriched)} / {total} déjà traités\n")

    session = requests.Session()
    errors  = []

    for i, career in enumerate(careers):
        cid = career['id']
        if cid in enriched:
            continue

        print(f"[{i+1:4}/{total}] {career['title'][:55]:<55}", end=' ', flush=True)

        extra = scrape_career(career['url_onisep'], session)

        if 'scrape_error' in extra:
            print(f"⚠️  {extra['scrape_error']}")
            errors.append(cid)
        else:
            fields = [k for k in ['description','competences','parcours','salaire_debut','image_url'] if k in extra]
            print(f"✅ [{', '.join(fields)}]")

        enriched[cid] = {**career, **extra}

        if (i + 1) % 25 == 0:
            _checkpoint(enriched)
            print(f"   💾 Checkpoint ({len(enriched)}/{total})\n")

        time.sleep(DELAY)

    result = [enriched.get(c['id'], c) for c in careers]
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    ok = len(result) - len(errors)
    print(f"\n✅ {ok} succès, {len(errors)} erreurs → {OUTPUT_FILE}")

    if errors:
        Path("scrape_errors.json").write_text(json.dumps(errors, ensure_ascii=False, indent=2))
        print(f"   Erreurs → scrape_errors.json")

    if not errors and CHECKPOINT.exists():
        CHECKPOINT.unlink()
        print("🗑️  Checkpoint supprimé")


def _checkpoint(enriched):
    with open(CHECKPOINT, 'w', encoding='utf-8') as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()