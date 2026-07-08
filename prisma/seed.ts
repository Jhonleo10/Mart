import { PrismaClient, type SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_BOOKING_TIME_SLOTS } from "../src/lib/booking-time-slots";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@digitalgeniusmart.com";
const ADMIN_PASSWORD = "Admin@123";
const DEMO_USER_EMAIL = "user@example.com";
const DEMO_USER_PASSWORD = "User@12345";

const VENDOR_BASIC_EMAIL = "vendor-basic@example.com";
const VENDOR_GROWTH_EMAIL = "vendor-growth@example.com";
const VENDOR_PRO_EMAIL = "vendor-pro@example.com";
const VENDOR_PASSWORD = "Vendor@12345";
const COMPANY_EMAIL = "company@example.com";
const COMPANY_PASSWORD = "Company@123";

const CATEGORIES = [
  { name: "CRM Software", slug: "crm-software", description: "Customer relationship management tools" },
  { name: "Billing Software", slug: "billing-software", description: "Invoicing and billing solutions" },
  { name: "HRMS Software", slug: "hrms-software", description: "Human resource management systems" },
  { name: "ERP Software", slug: "erp-software", description: "Enterprise resource planning" },
  { name: "Accounting Software", slug: "accounting-software", description: "Accounting and bookkeeping" },
];

const INDUSTRIES = [
  { name: "Retail", slug: "retail", description: "Retail and commerce businesses" },
  { name: "Restaurants", slug: "restaurants", description: "Food and hospitality" },
  { name: "Medical Shops", slug: "medical-shops", description: "Pharmacy and healthcare retail" },
  { name: "Education", slug: "education", description: "Schools and ed-tech" },
  { name: "Startups", slug: "startups", description: "Early-stage companies" },
];

async function seedBookingTimeSlots() {
  for (const [index, slot] of DEFAULT_BOOKING_TIME_SLOTS.entries()) {
    await prisma.bookingTimeSlot.upsert({
      where: { value: slot.value },
      update: { label: slot.label, sortOrder: index },
      create: { label: slot.label, value: slot.value, sortOrder: index },
    });
  }
  console.log(`Seeded ${DEFAULT_BOOKING_TIME_SLOTS.length} booking time slots`);
}

async function seedUsers() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const userHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  const vendorHash = await bcrypt.hash(VENDOR_PASSWORD, 12);
  const companyHash = await bcrypt.hash(COMPANY_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Platform Admin",
      password: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: "Platform Admin",
      password: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {
      name: "Demo Buyer",
      password: userHash,
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo Buyer",
      password: userHash,
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const vendorDefs = [
    { email: VENDOR_BASIC_EMAIL, name: "Basic Vendor Owner", company: "Nimbus CRM Labs", slug: "nimbus-crm-labs", plan: "BASIC" as SubscriptionPlan, passwordHash: vendorHash },
    { email: VENDOR_GROWTH_EMAIL, name: "Growth Vendor Owner", company: "Zenith Billing Co", slug: "zenith-billing-co", plan: "GROWTH" as SubscriptionPlan, passwordHash: vendorHash },
    { email: VENDOR_PRO_EMAIL, name: "Pro Vendor Owner", company: "Apex HR Suite", slug: "apex-hr-suite", plan: "PROFESSIONAL" as SubscriptionPlan, passwordHash: vendorHash },
    { email: COMPANY_EMAIL, name: "Demo Company Owner", company: "Demo Company", slug: "demo-company", plan: "PROFESSIONAL" as SubscriptionPlan, passwordHash: companyHash },
  ];

  for (const vendor of vendorDefs) {
    const user = await prisma.user.upsert({
      where: { email: vendor.email },
      update: {
        name: vendor.name,
        password: vendor.passwordHash,
        role: "COMPANY",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
      create: {
        email: vendor.email,
        name: vendor.name,
        password: vendor.passwordHash,
        role: "COMPANY",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const isGrowth = vendor.plan === "GROWTH";
    const isPro = vendor.plan === "PROFESSIONAL";

    await prisma.company.upsert({
      where: { userId: user.id },
      update: {
        name: vendor.company,
        slug: vendor.slug,
        status: "APPROVED",
        paymentVerified: true,
        adminApproved: true,
        selectedPlan: vendor.plan,
        industry: "Software",
        description: `${vendor.company} builds modern SaaS for Indian businesses.`,
        contactEmail: vendor.email,
        contactPhone: "+91 98765 43210",
        website: `https://${vendor.slug}.example.com`,
        landingEnabled: isGrowth || isPro,
        metaTitle: `${vendor.company} | Verified Software Vendor`,
        metaDescription: `Explore ${vendor.company} products, book demos, and compare solutions on Genius Mart.`,
        seoTagline: isGrowth || isPro ? "Trusted software for growing teams" : null,
      },
      create: {
        userId: user.id,
        name: vendor.company,
        ownerName: vendor.name,
        slug: vendor.slug,
        status: "APPROVED",
        paymentVerified: true,
        adminApproved: true,
        selectedPlan: vendor.plan,
        industry: "Software",
        description: `${vendor.company} builds modern SaaS for Indian businesses.`,
        contactEmail: vendor.email,
        contactPhone: "+91 98765 43210",
        website: `https://${vendor.slug}.example.com`,
        landingEnabled: isGrowth || isPro,
        metaTitle: `${vendor.company} | Verified Software Vendor`,
        metaDescription: `Explore ${vendor.company} products, book demos, and compare solutions on Genius Mart.`,
        seoTagline: isGrowth || isPro ? "Trusted software for growing teams" : null,
      },
    });

    const company = await prisma.company.findUnique({ where: { userId: user.id } });
    if (!company) continue;

    await prisma.subscription.deleteMany({ where: { companyId: company.id } });
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: vendor.plan,
        status: "ACTIVE",
        endDate,
      },
    });
  }

  console.log(`Seeded admin: ${ADMIN_EMAIL}`);
  console.log(`Seeded buyer: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
  console.log(`Seeded main company: ${COMPANY_EMAIL} / ${COMPANY_PASSWORD}`);
  console.log(`Seeded vendors (password ${VENDOR_PASSWORD}):`);
  console.log(`  Basic:  ${VENDOR_BASIC_EMAIL}`);
  console.log(`  Growth: ${VENDOR_GROWTH_EMAIL}`);
  console.log(`  Pro:    ${VENDOR_PRO_EMAIL}`);
}

async function seedCategoriesAndIndustries() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }
  for (const ind of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: { name: ind.name, description: ind.description },
      create: ind,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories and ${INDUSTRIES.length} industries`);
}

async function seedProductsAndAvailability() {
  const crm = await prisma.category.findUnique({ where: { slug: "crm-software" } });
  const billing = await prisma.category.findUnique({ where: { slug: "billing-software" } });
  const hrms = await prisma.category.findUnique({ where: { slug: "hrms-software" } });
  const retail = await prisma.industry.findUnique({ where: { slug: "retail" } });
  const startups = await prisma.industry.findUnique({ where: { slug: "startups" } });
  const education = await prisma.industry.findUnique({ where: { slug: "education" } });

  if (!crm || !billing || !hrms) return;

  const vendors = await prisma.company.findMany({
    where: {
      slug: { in: ["nimbus-crm-labs", "zenith-billing-co", "apex-hr-suite"] },
    },
  });

  const productDefs = [
    {
      companySlug: "nimbus-crm-labs",
      name: "Nimbus CRM Pro",
      slug: "nimbus-crm-pro",
      categoryId: crm.id,
      featured: false,
      views: 45,
    },
    {
      companySlug: "zenith-billing-co",
      name: "Zenith Invoice Hub",
      slug: "zenith-invoice-hub",
      categoryId: billing.id,
      featured: true,
      views: 120,
    },
    {
      companySlug: "zenith-billing-co",
      name: "Zenith POS Billing",
      slug: "zenith-pos-billing",
      categoryId: billing.id,
      featured: true,
      views: 88,
    },
    {
      companySlug: "apex-hr-suite",
      name: "Apex PeopleOS",
      slug: "apex-peopleos",
      categoryId: hrms.id,
      featured: true,
      views: 200,
    },
  ];

  for (const def of productDefs) {
    const company = vendors.find((v) => v.slug === def.companySlug);
    if (!company) continue;

    const product = await prisma.product.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        status: "PUBLISHED",
        featured: def.featured,
        viewCount: def.views,
        shortDescription: `${def.name} helps teams automate workflows and grow faster.`,
        fullDescription: `${def.name} is a full-featured SaaS platform designed for Indian SMBs. Book a demo to see it in action.`,
        pricingModel: "SUBSCRIPTION",
        price: 2999,
        features: ["Dashboard", "Reports", "Integrations", "Mobile app"],
        companyId: company.id,
        categoryId: def.categoryId,
      },
      create: {
        name: def.name,
        slug: def.slug,
        status: "PUBLISHED",
        featured: def.featured,
        viewCount: def.views,
        shortDescription: `${def.name} helps teams automate workflows and grow faster.`,
        fullDescription: `${def.name} is a full-featured SaaS platform designed for Indian SMBs. Book a demo to see it in action.`,
        pricingModel: "SUBSCRIPTION",
        price: 2999,
        features: ["Dashboard", "Reports", "Integrations", "Mobile app"],
        companyId: company.id,
        categoryId: def.categoryId,
      },
    });

    if (retail && def.companySlug === "zenith-billing-co") {
      await prisma.productIndustry.upsert({
        where: { productId_industryId: { productId: product.id, industryId: retail.id } },
        update: {},
        create: { productId: product.id, industryId: retail.id },
      });
    }
    if (startups && def.companySlug === "nimbus-crm-labs") {
      await prisma.productIndustry.upsert({
        where: { productId_industryId: { productId: product.id, industryId: startups.id } },
        update: {},
        create: { productId: product.id, industryId: startups.id },
      });
    }
    if (education && def.companySlug === "apex-hr-suite") {
      await prisma.productIndustry.upsert({
        where: { productId_industryId: { productId: product.id, industryId: education.id } },
        update: {},
        create: { productId: product.id, industryId: education.id },
      });
    }
  }

  const growthCompany = vendors.find((v) => v.slug === "zenith-billing-co");
  if (growthCompany) {
    const slots = await prisma.bookingTimeSlot.findMany({ take: 4 });
    await prisma.companyBookingSlot.deleteMany({ where: { companyId: growthCompany.id } });
    await prisma.companyBookingSlot.createMany({
      data: slots.map((s) => ({ companyId: growthCompany.id, bookingTimeSlotId: s.id })),
    });

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    for (const slot of slots.slice(0, 3)) {
      await prisma.companyAvailability.upsert({
        where: {
          companyId_date_bookingTimeSlotId: {
            companyId: growthCompany.id,
            date: tomorrow,
            bookingTimeSlotId: slot.id,
          },
        },
        update: {},
        create: {
          companyId: growthCompany.id,
          date: tomorrow,
          bookingTimeSlotId: slot.id,
        },
      });
    }
  }

  console.log("Seeded demo products, industries, and growth vendor availability");
}

async function main() {
  await seedUsers();
  await seedBookingTimeSlots();
  await seedCategoriesAndIndustries();
  await seedProductsAndAvailability();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
