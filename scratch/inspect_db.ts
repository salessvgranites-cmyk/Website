import 'dotenv/config';
import { getDb, getCollections, getGallery, getProducts, getFinishes, getSectionVisibility, getSiteContent } from '../server/db';
import { siteContent } from '../drizzle/schema';

async function main() {
  const db = await getDb();
  if (!db) {
    console.log('NO_DB');
    process.exit(1);
  }
  const contentRows = await db.select().from(siteContent);
  console.log('CONTENT ROWS:', JSON.stringify(contentRows, null, 2));

  const collections = await getCollections();
  console.log('COLLECTIONS:', collections.map(c => ({ id: c.id, name: c.name, img: c.imageUrl })));

  const products = await getProducts();
  console.log('PRODUCTS:', products.map(p => ({ id: p.id, name: p.name, img: p.imageUrl })));

  const finishes = await getFinishes();
  console.log('FINISHES:', finishes.map(f => ({ id: f.id, name: f.name, img: f.imageUrl })));

  const sections = await getSectionVisibility();
  console.log('SECTIONS:', sections.map(s => ({ key: s.sectionKey, visible: s.isVisible })));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
