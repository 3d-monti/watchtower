const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const expectedLabels = [
  "Accueil",
  "Bases communautaires",
  "Confidentialité",
  "Contact",
  "Mentions légales"
];
const pages = [
  ["index.html", 0],
  ["analyses/bases-antispam-communautaires/index.html", 1],
  ["privacy/index.html", 2],
  ["contact/index.html", 3],
  ["legal/index.html", 4]
];
const errors = [];

const decodeText = (value) => value
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .trim();

const readLinks = (markup) => [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
  .map((match) => ({ attributes: match[1], label: decodeText(match[2]) }));

const checkLabels = (file, area, links) => {
  const labels = links.map((link) => link.label);
  if (JSON.stringify(labels) !== JSON.stringify(expectedLabels)) {
    errors.push(`${file}: ${area} contient ${JSON.stringify(labels)}`);
  }
};

for (const [file, activeIndex] of pages) {
  const absolutePath = path.join(root, file);
  const bytes = fs.readFileSync(absolutePath);
  let html;

  try {
    html = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    errors.push(`${file}: le fichier n’est pas un UTF-8 valide`);
    continue;
  }

  if (!html.includes('<meta charset="UTF-8">')) {
    errors.push(`${file}: déclaration UTF-8 absente ou différente`);
  }
  if (!html.includes('<html lang="fr"')) {
    errors.push(`${file}: langue française non déclarée`);
  }
  if (/Confidentialite|Mentions legales|Ã|Â|�/.test(html)) {
    errors.push(`${file}: variante française incorrecte ou caractère corrompu`);
  }

  const navigationMatches = [...html.matchAll(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/g)];
  if (navigationMatches.length !== 1) {
    errors.push(`${file}: ${navigationMatches.length} menus principaux trouvés`);
    continue;
  }

  const navigationLinks = readLinks(navigationMatches[0][1]);
  checkLabels(file, "menu principal", navigationLinks);
  const currentIndices = navigationLinks
    .map((link, index) => link.attributes.includes('aria-current="page"') ? index : -1)
    .filter((index) => index >= 0);
  if (currentIndices.length !== 1 || currentIndices[0] !== activeIndex) {
    errors.push(`${file}: aria-current attendu sur le lien ${activeIndex + 1}, obtenu ${JSON.stringify(currentIndices)}`);
  }

  const footerMatch = html.match(/<div class="footer-links">([\s\S]*?)<\/div>/);
  if (!footerMatch) {
    errors.push(`${file}: liens du pied de page introuvables`);
  } else {
    checkLabels(file, "pied de page", readLinks(footerMatch[1]));
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Navigation française vérifiée sur ${pages.length} pages canoniques.`);
