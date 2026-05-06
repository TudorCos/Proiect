import { mockProducts } from './src/data/mock-products.js';

async function seed() {
  console.log('Seeding products...');
  for (const product of mockProducts) {
    try {
      const res = await fetch('http://localhost:5216/api/Products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        console.log(`Successfully added: ${product.name}`);
      } else {
        const err = await res.text();
        console.error(`Failed to add: ${product.name} - Status: ${res.status} - ${err}`);
      }
    } catch (e) {
      console.error(`Error adding ${product.name}:`, e.message);
    }
  }
  console.log('Done seeding products!');
}

seed();
