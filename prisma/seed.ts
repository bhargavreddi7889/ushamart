import { PrismaClient, Role, DiscountType, OfferType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ushamart.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@ushamart.com",
      password: adminPassword,
      phone: "9876543210",
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@ushamart.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@ushamart.com",
      password: customerPassword,
      phone: "9123456789",
      role: Role.CUSTOMER,
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      name: "John Doe",
      phone: "9123456789",
      address: "123, Main Road, Kukatpally",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500072",
      isDefault: true,
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      contactPhone: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      storeAddress: "Kukatpally, Hyderabad, Telangana",
      businessHours: "Mon-Sat: 8AM - 10PM, Sun: 9AM - 8PM",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "water-bottles" },
      update: {},
      create: { name: "Water Bottles", slug: "water-bottles", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "cool-drinks" },
      update: {},
      create: { name: "Cool Drinks", slug: "cool-drinks", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "namkeens" },
      update: {},
      create: { name: "Namkeens", slug: "namkeens", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "grocery" },
      update: {},
      create: { name: "Grocery", slug: "grocery", sortOrder: 4 },
    }),
    prisma.category.upsert({
      where: { slug: "personal-care" },
      update: {},
      create: { name: "Personal Care", slug: "personal-care", sortOrder: 5 },
    }),
  ]);

  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: "bisleri" },
      update: {},
      create: { name: "Bisleri", slug: "bisleri" },
    }),
    prisma.brand.upsert({
      where: { slug: "coca-cola" },
      update: {},
      create: { name: "Coca Cola", slug: "coca-cola" },
    }),
    prisma.brand.upsert({
      where: { slug: "parle" },
      update: {},
      create: { name: "Parle", slug: "parle" },
    }),
    prisma.brand.upsert({
      where: { slug: "colgate" },
      update: {},
      create: { name: "Colgate", slug: "colgate" },
    }),
  ]);

  const products = [
    {
      name: "Bisleri Water 1L",
      slug: "bisleri-water-1l",
      sku: "BIS-1L-001",
      description: "Pure and safe packaged drinking water. Perfect for wholesale bulk orders.",
      categoryId: categories[0].id,
      brandId: brands[0].id,
      stock: 500,
      mrp: 20,
      sellingPrice: 12.5,
      isFeatured: true,
      isBestSelling: true,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    },
    {
      name: "Coca Cola 750ml",
      slug: "coca-cola-750ml",
      sku: "COKE-750-001",
      description: "Refreshing Coca Cola soft drink. Wholesale pricing for retailers.",
      categoryId: categories[1].id,
      brandId: brands[1].id,
      stock: 300,
      mrp: 40,
      sellingPrice: 32,
      isDealOfDay: true,
      isFeatured: true,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    },
    {
      name: "Parle-G Biscuits 1kg",
      slug: "parle-g-biscuits-1kg",
      sku: "PARLE-G-1KG",
      description: "India's favorite glucose biscuits. Bulk pack for wholesale.",
      categoryId: categories[3].id,
      brandId: brands[2].id,
      stock: 200,
      mrp: 120,
      sellingPrice: 95,
      isNewArrival: true,
      isBestSelling: true,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    },
    {
      name: "Colgate Toothpaste 200g",
      slug: "colgate-toothpaste-200g",
      sku: "COLG-200G",
      description: "Colgate Strong Teeth toothpaste. Wholesale pack.",
      categoryId: categories[4].id,
      brandId: brands[3].id,
      stock: 150,
      mrp: 110,
      sellingPrice: 89,
      isFeatured: true,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    },
    {
      name: "Haldiram's Namkeen Mix 500g",
      slug: "haldirams-namkeen-mix-500g",
      sku: "HAL-NMK-500",
      description: "Crispy and tasty namkeen mix. Perfect for snacking.",
      categoryId: categories[2].id,
      brandId: null,
      stock: 8,
      mrp: 80,
      sellingPrice: 65,
      isDealOfDay: true,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
    },
  ];

  for (const product of products) {
    const discountPercentage = Math.round(
      ((product.mrp - product.sellingPrice) / product.mrp) * 100
    );
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, discountPercentage },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off on first order",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 200,
      maxDiscount: 100,
      expiresAt: new Date("2027-12-31"),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "USHA50" },
    update: {},
    create: {
      code: "USHA50",
      description: "Flat ₹50 off",
      discountType: DiscountType.FLAT,
      discountValue: 50,
      minOrderValue: 500,
      expiresAt: new Date("2027-12-31"),
    },
  });

  await prisma.offer.createMany({
    data: [
      {
        title: "Grocery 15% Off",
        type: OfferType.CATEGORY,
        categoryId: categories[3].id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15,
      },
      {
        title: "Sankranti Sale",
        type: OfferType.FESTIVAL,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "EVERYONE GETS WHOLESALE PRICES",
        subtitle: "No Middlemen - Wholesale Prices For Everyone",
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        sortOrder: 0,
      },
      {
        title: "FREE DELIVERY",
        subtitle: "On orders above ₹499",
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
  console.log("Admin: admin@ushamart.com / admin123");
  console.log("Customer: customer@ushamart.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
