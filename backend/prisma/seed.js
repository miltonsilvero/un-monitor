import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crear escalas de calidad
  const qualityScales = [
    { label: 'Muy Mala', value: 1 },
    { label: 'Mala', value: 2 },
    { label: 'Regular', value: 3 },
    { label: 'Buena', value: 4 },
    { label: 'Excelente', value: 5 },
  ];

  for (const scale of qualityScales) {
    await prisma.qualityScale.upsert({
      where: { label: scale.label },
      update: {},
      create: scale,
    });
  }
  console.log('✅ Quality scales created');

  // 2. Crear pesos de roles
  const roleWeights = [
    { user_role: 'admin', weight: 0 },
    { user_role: 'mesa', weight: 1 },
    { user_role: 'supervisor', weight: 2 },
  ];

  for (const role of roleWeights) {
    await prisma.roleWeight.upsert({
      where: { user_role: role.user_role },
      update: {},
      create: role,
    });
  }
  console.log('✅ Role weights created');

  // 3. Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: hashedPassword,
      user_role: 'admin',
      is_active: true,
    },
  });
  console.log('✅ Admin user created (username: admin, password: admin)');

  // 4. Crear países del Consejo de Seguridad
  const countries = [
    { name: 'Estados Unidos', iso_code: 'US' },
    { name: 'Reino Unido', iso_code: 'GB' },
    { name: 'Francia', iso_code: 'FR' },
    { name: 'Rusia', iso_code: 'RU' },
    { name: 'China', iso_code: 'CN' },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { iso_code: country.iso_code },
      update: {},
      create: country,
    });
  }
  console.log('✅ Countries created');

  // 5. Crear órgano Consejo de Seguridad
  const organ = await prisma.organ.upsert({
    where: { name: 'Consejo de Seguridad' },
    update: {},
    create: { name: 'Consejo de Seguridad' },
  });
  console.log('✅ Organ created');

  // 6. Crear modelo inicial
  const model = await prisma.model.upsert({
    where: { name: 'Modelo Inicial' },
    update: {},
    create: { name: 'Modelo Inicial' },
  });
  console.log('✅ Model created');

  // 7. Asociar modelo con órgano
  await prisma.modelOrgan.upsert({
    where: {
      model_id_organ_id: {
        model_id: model.id,
        organ_id: organ.id,
      },
    },
    update: {},
    create: {
      model_id: model.id,
      organ_id: organ.id,
    },
  });
  console.log('✅ Model-Organ association created');

  // 8. Asociar países con el órgano
  const allCountries = await prisma.country.findMany();
  for (const country of allCountries) {
    await prisma.organCountry.upsert({
      where: {
        organ_id_country_id: {
          organ_id: organ.id,
          country_id: country.id,
        },
      },
      update: {},
      create: {
        organ_id: organ.id,
        country_id: country.id,
      },
    });
  }
  console.log('✅ Countries assigned to organ');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
