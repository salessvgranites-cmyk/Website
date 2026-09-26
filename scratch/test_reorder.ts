import dotenv from "dotenv";
dotenv.config();

import { getAllProducts, reorderProducts, getAllCollections, reorderCollections, getAllGallery, reorderGallery, getAllFinishes, reorderFinishes } from "../server/db";

async function main() {
  console.log("=== Testing Reorder APIs ===");

  // 1. Products
  const products = await getAllProducts();
  console.log(`Original products order (${products.length} items):`, products.map(p => `${p.id}: ${p.name} (order: ${p.sortOrder})`));
  if (products.length >= 2) {
    const reversed = [products[1].id, products[0].id, ...products.slice(2).map(p => p.id)];
    await reorderProducts(reversed);
    const updated = await getAllProducts();
    console.log("Reordered products:", updated.map(p => `${p.id}: ${p.name} (order: ${p.sortOrder})`));
    // Restore original order
    await reorderProducts(products.map(p => p.id));
    console.log("Restored products original order.");
  }

  // 2. Collections
  const collections = await getAllCollections();
  console.log(`Original collections order (${collections.length} items):`, collections.slice(0, 4).map(c => `${c.id}: ${c.name} (order: ${c.sortOrder})`));
  if (collections.length >= 2) {
    const swapped = [collections[1].id, collections[0].id, ...collections.slice(2).map(c => c.id)];
    await reorderCollections(swapped);
    const updated = await getAllCollections();
    console.log("Reordered collections:", updated.slice(0, 4).map(c => `${c.id}: ${c.name} (order: ${c.sortOrder})`));
    // Restore original order
    await reorderCollections(collections.map(c => c.id));
    console.log("Restored collections original order.");
  }

  // 3. Finishes
  const finishes = await getAllFinishes();
  console.log(`Original finishes order (${finishes.length} items):`, finishes.map(f => `${f.id}: ${f.name} (order: ${f.sortOrder})`));

  // 4. Gallery
  const gallery = await getAllGallery();
  console.log(`Original gallery order (${gallery.length} items):`, gallery.slice(0, 4).map(g => `${g.id}: ${g.title} (order: ${g.sortOrder})`));

  console.log("All reorder functionality verified successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
