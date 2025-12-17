import { db } from "../src/lib/db";
import { settings } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// Helper to set a setting
async function setSetting(key: string, value: string) {
  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });

  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

async function seedContent() {
  console.log("🌱 Seeding default content...\n");

  // ═══════════════════════════════════════════════════════════
  // ORDER STEPS
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Adding order steps...");
  const orderSteps = [
    {
      id: crypto.randomUUID(),
      stepEn: "Choose your favorite model",
      stepUk: "Виберіть улюблену модель",
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      stepEn: "Contact us via social media or form on the site",
      stepUk: "Зв'яжіться через соціальні мережі або форму на сайті",
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      stepEn: "Make an advance payment of 30%",
      stepUk: "Внесіть передоплату 30%",
      order: 2,
    },
    {
      id: crypto.randomUUID(),
      stepEn: "After the dress is sewn pay the remaining 70%",
      stepUk: "Після пошиття сукні оплатіть решту 70%",
      order: 3,
    },
    {
      id: crypto.randomUUID(),
      stepEn: "Provide the necessary data for delivery",
      stepUk: "Надайте дані для доставки",
      order: 4,
    },
    {
      id: crypto.randomUUID(),
      stepEn: "Receive your order",
      stepUk: "Отримайте замовлення",
      order: 5,
    },
  ];
  await setSetting("order_steps", JSON.stringify(orderSteps));

  // ═══════════════════════════════════════════════════════════
  // DELIVERY INFO
  // ═══════════════════════════════════════════════════════════
  console.log("🚚 Adding delivery information...");
  const deliveryInfo = [
    {
      id: crypto.randomUUID(),
      titleEn: "Worldwide Delivery",
      titleUk: "Міжнародна доставка",
      descriptionEn: "By EMS Post Service",
      descriptionUk: "Через EMS Post Service",
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      titleEn: "Shipping after FULL payment",
      titleUk: "Відправка після ПОВНОЇ оплати",
      descriptionEn: "",
      descriptionUk: "",
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      titleEn: "Delivery time",
      titleUk: "Термін доставки",
      descriptionEn: "Up to 2 weeks",
      descriptionUk: "До 2 тижнів",
      order: 2,
    },
    {
      id: crypto.randomUUID(),
      titleEn: "Delivery cost",
      titleUk: "Вартість доставки",
      descriptionEn: "On average $100 (depending on country and weight)",
      descriptionUk: "В середньому $100 (залежить від країни та ваги)",
      order: 3,
    },
    {
      id: crypto.randomUUID(),
      titleEn: "Documents",
      titleUk: "Документи",
      descriptionEn: "We provide all cheques and invoices",
      descriptionUk: "Надаємо всі чеки та інвойси",
      order: 4,
    },
    {
      id: crypto.randomUUID(),
      titleEn: "Delivery expenses",
      titleUk: "Витрати на доставку",
      descriptionEn: "Paid by the buyer",
      descriptionUk: "Оплачуються покупцем",
      order: 5,
    },
  ];
  await setSetting("delivery_info", JSON.stringify(deliveryInfo));

  // ═══════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ═══════════════════════════════════════════════════════════
  console.log("💳 Adding payment methods...");
  const paymentMethods = [
    {
      id: crypto.randomUUID(),
      nameEn: "Bank account transfer",
      nameUk: "Банківський переказ",
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      nameEn: "Visa/Mastercard transfer",
      nameUk: "Переказ Visa/Mastercard",
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      nameEn: "Western Union transfer",
      nameUk: "Переказ Western Union",
      order: 2,
    },
    {
      id: crypto.randomUUID(),
      nameEn: "Moneygram transfer",
      nameUk: "Переказ Moneygram",
      order: 3,
    },
    {
      id: crypto.randomUUID(),
      nameEn: "Paysend transfer",
      nameUk: "Переказ Paysend",
      order: 4,
    },
  ];
  await setSetting("payment_methods", JSON.stringify(paymentMethods));

  // ═══════════════════════════════════════════════════════════
  // ABOUT PAGE CONTENT
  // ═══════════════════════════════════════════════════════════
  console.log("📝 Adding About page content...");

  const aboutContentEn = `Sapfir Couture is a royal bridal manufacturer dedicated to creating exceptional wedding dresses for brides worldwide.

With years of expertise in bridal fashion, we combine traditional craftsmanship with modern elegance to design gowns that make every bride feel like royalty on her special day.

Our atelier offers a wide selection of styles at reasonable prices, and we welcome orders of any complexity — from timeless classics to one-of-a-kind custom creations.

Every dress is crafted with love, attention to detail, and the finest materials to ensure your wedding day is truly unforgettable.`;

  const aboutContentUk = `Sapfir Couture — виробник розкішних весільних суконь, що створює виняткові вбрання для наречених по всьому світу.

З багаторічним досвідом у весільній моді ми поєднуємо традиційну майстерність із сучасною елегантністю, щоб створювати сукні, в яких кожна наречена почувається королевою у свій особливий день.

Наше ательє пропонує широкий вибір стилів за розумними цінами та приймає замовлення будь-якої складності — від позачасової класики до унікальних індивідуальних творінь.

Кожна сукня створюється з любов'ю, увагою до деталей та найкращих матеріалів, щоб ваш весільний день став по-справжньому незабутнім.`;

  await setSetting("about_content_en", aboutContentEn);
  await setSetting("about_content_uk", aboutContentUk);

  // ═══════════════════════════════════════════════════════════
  // BRAND STATEMENT (Homepage)
  // ═══════════════════════════════════════════════════════════
  console.log("✨ Adding brand statement...");

  const brandStatementEn = `At Sapfir Couture, we believe every bride deserves to feel extraordinary. Our exclusive collection of wedding dresses combines timeless elegance with modern sophistication, crafted with the finest materials and meticulous attention to detail.`;

  const brandStatementUk = `У Sapfir Couture ми віримо, що кожна наречена заслуговує почуватися неперевершеною. Наша ексклюзивна колекція весільних суконь поєднує позачасову елегантність із сучасною витонченістю, створена з найкращих матеріалів та з прискіпливою увагою до деталей.`;

  await setSetting("brand_statement_en", brandStatementEn);
  await setSetting("brand_statement_uk", brandStatementUk);

  // ═══════════════════════════════════════════════════════════
  // CTA BANNER TEXT
  // ═══════════════════════════════════════════════════════════
  console.log("📢 Adding CTA banner text...");

  await setSetting("cta_banner_text_en", "Find Your Dream Dress");
  await setSetting("cta_banner_text_uk", "Знайдіть сукню своєї мрії");

  // ═══════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════
  console.log("\n✅ Content seeded successfully!");
  console.log("\nAdded:");
  console.log("  • 6 order steps (EN/UK)");
  console.log("  • 6 delivery info items (EN/UK)");
  console.log("  • 5 payment methods (EN/UK)");
  console.log("  • About page content (EN/UK)");
  console.log("  • Brand statement (EN/UK)");
  console.log("  • CTA banner text (EN/UK)");

  process.exit(0);
}

seedContent().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
