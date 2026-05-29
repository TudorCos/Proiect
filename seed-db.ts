import { mockProducts } from './src/data/mock-products';
import { mockUsers } from './src/data/mock-users';

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
        console.log(`Successfully added product: ${product.name}`);
      } else {
        const err = await res.text();
        console.error(`Failed to add product: ${product.name} - Status: ${res.status} - ${err}`);
      }
    } catch (e: any) {
      console.error(`Error adding product ${product.name}:`, e.message);
    }
  }

  console.log('Seeding users...');
  for (const user of mockUsers) {
    try {
      // Map mock user and add a password field
      const userToSeed = {
        ...user,
        password: 'parola123',
      };
      
      const res = await fetch('http://localhost:5216/api/Users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSeed),
      });

      if (res.ok) {
        console.log(`Successfully added user: ${user.email}`);
      } else {
        const err = await res.text();
        console.error(`Failed to add user: ${user.email} - Status: ${res.status} - ${err}`);
      }
    } catch (e: any) {
      console.error(`Error adding user ${user.email}:`, e.message);
    }
  }

  const mockReviews = [
    {
      productId: 'cpu-001',
      userId: 'user-002',
      rating: 5,
      comment: 'Un procesor absolut incredibil. Rulează extrem de rece cu un cooler AIO de 360mm și performanța în compilare și gaming este de neegalat.',
    },
    {
      productId: 'cpu-001',
      userId: 'user-003',
      rating: 4,
      comment: 'Foarte rapid, dar consumă destul de mult curent sub sarcină maximă. Recomand o sursă de calitate.',
    },
    {
      productId: 'gpu-001',
      userId: 'user-002',
      rating: 5,
      comment: 'Cea mai puternică placă video de pe piață. Rulează orice joc în 4K cu Ray Tracing la peste 100 FPS. Dimensiunile sunt uriașe, atenție la carcasă!',
    },
    {
      productId: 'mb-001',
      userId: 'user-002',
      rating: 5,
      comment: 'O placă de bază premium extrem de stabilă. VRM-ul este excelent și dotările sunt de top.',
    },
    {
      productId: 'ram-001',
      userId: 'user-003',
      rating: 5,
      comment: 'Frecvență mare, latență mică și profilul XMP/EXPO a funcționat din prima fără probleme pe AM5.',
    },
    {
      productId: 'storage-001',
      userId: 'user-002',
      rating: 5,
      comment: 'Viteze uimitoare. Sistemul de operare se încarcă instant, iar jocurile nu au timp de loading.',
    },
    {
      productId: 'case-002',
      userId: 'user-003',
      rating: 5,
      comment: 'Design superb cu inserții de lemn real. Airflow-ul este surprinzător de bun și arată ca o piesă de mobilier premium.',
    }
  ];

  console.log('Seeding reviews...');
  for (const review of mockReviews) {
    try {
      const res = await fetch(`http://localhost:5216/api/Products/${review.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (res.ok) {
        console.log(`Successfully added review for product: ${review.productId}`);
      } else {
        const err = await res.text();
        console.error(`Failed to add review for product: ${review.productId} - Status: ${res.status} - ${err}`);
      }
    } catch (e: any) {
      console.error(`Error adding review for product ${review.productId}:`, e.message);
    }
  }

  console.log('Done seeding products, users, and reviews!');
}

seed();
