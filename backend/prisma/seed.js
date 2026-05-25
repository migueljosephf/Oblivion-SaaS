const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@oblivion.com' },
    update: {},
    create: {
      email: 'demo@oblivion.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Demo user created');

  // Create demo business
  const business = await prisma.business.upsert({
    where: { id: user.businessId || 'demo-business-id' },
    update: {},
    create: {
      id: 'demo-business-id',
      name: 'Colmado El Progreso',
      ownerName: 'Juan Pérez',
      location: 'Santo Domingo',
      address: 'Calle Principal #123',
      phone: '+1 (809) 555-1234',
      rnc: '12345678901',
      businessType: 'COLMADO',
      schedule: 'Lun-Sab 8:00-20:00',
      users: {
        connect: { id: user.id },
      },
    },
  });

  console.log('✅ Demo business created');

  // Update user with business
  await prisma.user.update({
    where: { id: user.id },
    data: { businessId: business.id },
  });

  // Create trial subscription
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  await prisma.subscription.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      plan: 'BASIC',
      status: 'TRIAL',
      trialEndDate,
      endDate: trialEndDate,
    },
  });

  console.log('✅ Trial subscription created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Bebidas',
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Alimentos',
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Limpieza',
        businessId: business.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Snacks',
        businessId: business.id,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coca-Cola 2L',
        description: 'Refresco de cola 2 litros',
        barcode: '7501000000001',
        sku: 'BEB-001',
        price: 85.00,
        cost: 60.00,
        stock: 50,
        minStock: 10,
        categoryId: categories[0].id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Papas Fritas Lays',
        description: 'Papas fritas saladas 150g',
        barcode: '7501000000002',
        sku: 'SNK-001',
        price: 45.00,
        cost: 30.00,
        stock: 30,
        minStock: 5,
        categoryId: categories[3].id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Arroz Premium 5lb',
        description: 'Arroz blanco premium 5 libras',
        barcode: '7501000000003',
        sku: 'ALI-001',
        price: 120.00,
        cost: 90.00,
        stock: 25,
        minStock: 8,
        categoryId: categories[1].id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jabón de Baño',
        description: 'Jabón de baño 3 unidades',
        barcode: '7501000000004',
        sku: 'LIM-001',
        price: 65.00,
        cost: 45.00,
        stock: 40,
        minStock: 10,
        categoryId: categories[2].id,
        businessId: business.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Agua Mineral 1L',
        description: 'Agua mineral purificada 1 litro',
        barcode: '7501000000005',
        sku: 'BEB-002',
        price: 35.00,
        cost: 20.00,
        stock: 100,
        minStock: 20,
        categoryId: categories[0].id,
        businessId: business.id,
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create demo sale
  const sale = await prisma.sale.create({
    data: {
      saleNumber: 'SALE-000001',
      businessId: business.id,
      userId: user.id,
      subtotal: 130.00,
      tax: 0,
      discount: 0,
      total: 130.00,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
            subtotal: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
            subtotal: products[1].price,
          },
        ],
      },
    },
  });

  console.log('✅ Demo sale created');

  // Update product stock
  await prisma.product.update({
    where: { id: products[0].id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.product.update({
    where: { id: products[1].id },
    data: { stock: { decrement: 1 } },
  });

  console.log('✅ Stock updated');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Demo credentials:');
  console.log('   Email: demo@oblivion.com');
  console.log('   Password: demo123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
