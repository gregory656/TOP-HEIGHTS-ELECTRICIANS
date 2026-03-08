import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const outputPath = path.resolve(__dirname, '..', 'knowledge.json');

function readFromRoot(relativePath) {
  return fs.readFileSync(path.resolve(projectRoot, relativePath), 'utf8');
}

function decode(value) {
  return String(value ?? '')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractArrayLiteral(source, pattern, label) {
  const match = source.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Could not extract ${label}`);
  }
  const literal = match[1];
  return vm.runInNewContext(literal);
}

function extractServicesKnowledge() {
  const source = readFromRoot('src/data/services.ts');
  const services = extractArrayLiteral(
    source,
    /export const services:\s*Service\[\]\s*=\s*(\[[\s\S]*?\]);/m,
    'services'
  );

  return services.map((service) => ({
    id: `service-${service.id}`,
    type: 'service',
    title: service.title,
    content: `${decode(service.shortDescription)} ${decode(service.fullDescription)} Key benefits: ${(
      service.keyBenefits ?? []
    ).join('; ')}.`,
    keywords: ['service', service.id, ...(service.keyBenefits ?? [])],
  }));
}

function extractProductsKnowledge() {
  const source = readFromRoot('src/data/products.ts');
  const products = extractArrayLiteral(
    source,
    /export const products:\s*Product\[\]\s*=\s*(\[[\s\S]*?\]);/m,
    'products'
  );

  return products.map((product) => ({
    id: `product-${product.id}`,
    type: 'product',
    title: product.name,
    content: `${product.name} is in category ${decode(product.category)} and costs KES ${product.price}. ${
      product.inStock ? 'It is currently marked as in stock.' : 'Stock status not provided.'
    } ${decode(product.description)}`,
    keywords: [product.name, product.category, 'product', 'price'],
  }));
}

function extractMilestonesKnowledge() {
  const source = readFromRoot('src/pages/About.tsx');
  const milestones = extractArrayLiteral(
    source,
    /const milestones:\s*CompanyMilestone\[\]\s*=\s*(\[[\s\S]*?\]);/m,
    'milestones'
  );

  return milestones.map((milestone) => ({
    id: `milestone-${milestone.year}`,
    type: 'about',
    title: `${milestone.year} ${milestone.title}`,
    content: decode(milestone.description),
    keywords: ['about', milestone.year, milestone.title],
  }));
}

function extractPillarsKnowledge() {
  const source = readFromRoot('src/pages/About.tsx');
  const descriptionMatches = [...source.matchAll(/description:\s*'([^']*(?:\\'[^']*)*)'/g)];
  const descriptions = descriptionMatches.map((match) => decode(match[1])).filter(Boolean);

  return descriptions.slice(0, 3).map((description, index) => ({
    id: `pillar-${index + 1}`,
    type: 'about',
    title: ['Our Mission', 'Our Vision', 'Our Values'][index] ?? `About ${index + 1}`,
    content: description,
    keywords: ['mission', 'vision', 'values', 'about'],
  }));
}

function extractContactKnowledge() {
  const source = readFromRoot('src/components/Layout.tsx');
  const phoneMatch = source.match(/\+254\s?\d{3}\s?\d{3}\s?\d{3}/);
  const phone = phoneMatch?.[0]?.replace(/\s+/g, ' ') ?? '+254 711 343 412';

  return [
    {
      id: 'contact-phone',
      type: 'contact',
      title: 'TopHeights Contact Number',
      content: `You can reach Top Heights by phone at ${phone}. The website also links to WhatsApp contact for service quotes.`,
      keywords: ['contact', 'phone', 'whatsapp', phone],
    },
    {
      id: 'account-access',
      type: 'account',
      title: 'Account Access',
      content:
        'The website includes sign-in and profile sections. Use the Sign In button in the top navigation to access your account and profile features.',
      keywords: ['account', 'login', 'sign in', 'profile'],
    },
    {
      id: 'payments',
      type: 'payment',
      title: 'Payments and Checkout',
      content:
        'The website has cart and checkout flows where users can review cart items and proceed with orders. Pricing is shown in Kenyan Shillings (KES) on product cards.',
      keywords: ['payments', 'checkout', 'cart', 'orders', 'KES'],
    },
  ];
}

function dedupeById(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.id, entry);
  }
  return [...map.values()];
}

function main() {
  const knowledgeEntries = dedupeById([
    ...extractServicesKnowledge(),
    ...extractProductsKnowledge(),
    ...extractMilestonesKnowledge(),
    ...extractPillarsKnowledge(),
    ...extractContactKnowledge(),
  ]);

  fs.writeFileSync(outputPath, JSON.stringify(knowledgeEntries, null, 2), 'utf8');
  console.log(`Generated ${knowledgeEntries.length} knowledge entries at ${outputPath}`);
}

main();
