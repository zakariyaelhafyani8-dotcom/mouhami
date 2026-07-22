import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Début du seed...");

  // ─── Création des types d'affaires (CaseTypes) ────────────
  const caseTypesData = [
    {
      nameAr: "القضايا المدنية",
      description: "القضايا المدنية بأنواعها",
      documents: ["البطاقة الوطنية", "وكالة", "العقود", "المراسلات", "المذكرات"],
    },
    {
      nameAr: "القضايا الجنائية",
      description: "القضايا الجنائية والجنايات",
      documents: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "شهادة طبية", "صور", "شهود"],
    },
    {
      nameAr: "القضايا التجارية",
      description: "القضايا التجارية وقضايا الشركات",
      documents: ["البطاقة الوطنية", "السجل التجاري", "العقود", "وكالة", "الفواتير", "المراسلات"],
    },
    {
      nameAr: "قضايا الأسرة",
      description: "قضايا الأسرة والأحوال الشخصية",
      documents: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "وكالة", "شهادة السكنى"],
    },
    {
      nameAr: "القضايا العقارية",
      description: "قضايا العقار والملكية",
      documents: ["البطاقة الوطنية", "عقد الملكية", "الرسوم العقارية", "وكالة", "المخططات", "صور"],
    },
    {
      nameAr: "القضايا الإدارية",
      description: "قضايا الإدارة والمجالس",
      documents: ["البطاقة الوطنية", "القرار الإداري", "وكالة", "المذكرات", "المراسلات"],
    },
    {
      nameAr: "قضايا الشغل",
      description: "قضايا الشغل والعمل",
      documents: ["البطاقة الوطنية", "عقد العمل", "وكالة", "كشف الراتب", "المقررات", "الإشعارات"],
    },
    {
      nameAr: "قضايا التنفيذ",
      description: "قضايا التنفيذ الجبري",
      documents: ["البطاقة الوطنية", "الحكم", "وكالة", "المحاضر", "الإنذارات"],
    },
    {
      nameAr: "قضايا الإرث",
      description: "قضايا الإرث والميراث",
      documents: ["البطاقة الوطنية", "شهادة الوفاة", "عقد الملكية", "وكالة", "شهادة الميلاد", "رسم الإرث"],
    },
    {
      nameAr: "قضايا الكراء",
      description: "قضايا الكراء والإيجار",
      documents: ["البطاقة الوطنية", "عقد الكراء", "وكالة", "الإنذارات", "المحاضر", "الفواتير"],
    },
    {
      nameAr: "حوادث السير",
      description: "قضايا حوادث السير",
      documents: ["البطاقة الوطنية", "محضر الشرطة", "شهادة طبية", "صور", "وكالة", "تقرير الخبرة"],
    },
    {
      nameAr: "الطلاق",
      description: "قضايا الطلاق والتطليق",
      documents: ["البطاقة الوطنية", "عقد الزواج", "شهادة السكنى", "شهادة الميلاد", "وكالة", "المقال الافتتاحي"],
    },
    {
      nameAr: "النفقة",
      description: "قضايا النفقة",
      documents: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "شهادة السكنى", "كشف الراتب", "وكالة"],
    },
    {
      nameAr: "الحضانة",
      description: "قضايا الحضانة",
      documents: ["البطاقة الوطنية", "عقد الزواج", "شهادة الميلاد", "شهادة السكنى", "وكالة", "شهود"],
    },
    {
      nameAr: "السرقة",
      description: "قضايا السرقة والنشل",
      documents: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "صور", "شهود", "شكاية"],
    },
    {
      nameAr: "النصب",
      description: "قضايا النصب والاحتيال",
      documents: ["البطاقة الوطنية", "وكالة", "محضر الشرطة", "العقود", "الفواتير", "شكاية", "شهود"],
    },
    {
      nameAr: "خيانة الأمانة",
      description: "قضايا خيانة الأمانة",
      documents: ["البطاقة الوطنية", "وكالة", "العقود", "المحاضر", "شهود", "شكاية"],
    },
    {
      nameAr: "الشيكات",
      description: "قضايا الشيكات",
      documents: ["البطاقة الوطنية", "وكالة", "الشيك", "محضر الشرطة", "كشف الحساب", "الإنذار"],
    },
    {
      nameAr: "الشركات",
      description: "قضايا الشركات",
      documents: ["البطاقة الوطنية", "السجل التجاري", "عقد التأسيس", "وكالة", "القوائم المالية", "محاضر الجمعيات"],
    },
  ];

  for (const ct of caseTypesData) {
    const existing = await prisma.caseType.findFirst({ where: { nameAr: ct.nameAr } });
    if (!existing) {
      const created = await prisma.caseType.create({
        data: {
          nameAr: ct.nameAr,
          description: ct.description,
          documents: {
            create: ct.documents.map((doc, index) => ({
              nameAr: doc,
              isRequired: true,
              order: index + 1,
            })),
          },
        },
      });
      console.log(`نوع قضية : ${created.nameAr}`);
    } else {
      console.log(`نوع قضية موجود : ${ct.nameAr}`);
    }
  }

  // ─── Création des modèles de dossiers ─────────────────────
  const templates = [
    {
      nom: "سرقة",
      slug: "vol",
      description: "قضايا السرقة والنشل",
      documents: [
        "البطاقة الوطنية",
        "وكالة",
        "محضر السرقة",
        "صور",
        "شهادة طبية",
        "تقارير الشرطة",
      ],
    },
    {
      nom: "طلاق",
      slug: "divorce",
      description: "قضايا الطلاق والتطليق",
      documents: [
        "البطاقة الوطنية",
        "عقد الزواج",
        "وكالة",
        "شهادة الميلاد",
        "كشف الراتب",
        "صور",
      ],
    },
    {
      nom: "إرث",
      slug: "succession",
      description: "قضايا الإرث والميراث",
      documents: [
        "البطاقة الوطنية",
        "شهادة الوفاة",
        "عقد الملكية",
        "وكالة",
        "شهادة الميلاد",
        "رسم الإرث",
      ],
    },
    {
      nom: "قضية تجارية",
      slug: "commercial",
      description: "القضايا التجارية والشركات",
      documents: [
        "البطاقة الوطنية",
        "السجل التجاري",
        "العقود",
        "وكالة",
        "الفواتير",
        "المراسلات",
      ],
    },
    {
      nom: "قضية شغل",
      slug: "travail",
      description: "قضايا الشغل والعمل",
      documents: [
        "البطاقة الوطنية",
        "عقد العمل",
        "وكالة",
        "كشف الراتب",
        "المقررات",
        "الإشعارات",
      ],
    },
    {
      nom: "عقار",
      slug: "immobilier",
      description: "قضايا العقار والملكية",
      documents: [
        "البطاقة الوطنية",
        "عقد الملكية",
        "الرسوم العقارية",
        "وكالة",
        "المخططات",
        "صور",
      ],
    },
    {
      nom: "قضية إدارية",
      slug: "administratif",
      description: "قضايا الإدارة والمجالس",
      documents: [
        "البطاقة الوطنية",
        "القرار الإداري",
        "وكالة",
        "المذكرات",
        "المراسلات",
        "المرفقات",
      ],
    },
  ];

  for (const template of templates) {
    const existing = await prisma.caseTemplate.findUnique({ where: { slug: template.slug } });
    if (!existing) {
      const created = await prisma.caseTemplate.create({
        data: {
          nom: template.nom,
          slug: template.slug,
          description: template.description,
          documents: {
            create: template.documents.map((doc, index) => ({
              nom: doc,
              obligatoire: true,
              ordre: index + 1,
            })),
          },
        },
      });
      console.log(`Modèle créé : ${created.nom}`);
    } else {
      console.log(`Modèle déjà existant : ${template.nom}`);
    }
  }

  // ─── Création des types de documents ──────────────────────
  const documentTypes = [
    { nom: "البطاقة الوطنية", slug: "carte-nationale", icon: "id-card" },
    { nom: "وكالة", slug: "procuration", icon: "file-signature" },
    { nom: "عقد الزواج", slug: "contrat-mariage", icon: "file-contract" },
    { nom: "عقد الملكية", slug: "titre-propriete", icon: "file-contract" },
    { nom: "عقد الكراء", slug: "contrat-location", icon: "file-contract" },
    { nom: "عقد العمل", slug: "contrat-travail", icon: "file-contract" },
    { nom: "شهادة الميلاد", slug: "certificat-naissance", icon: "certificate" },
    { nom: "شهادة السكنى", slug: "certificat-residence", icon: "certificate" },
    { nom: "شهادة الوفاة", slug: "certificat-deces", icon: "certificate" },
    { nom: "شهادة طبية", slug: "certificat-medical", icon: "certificate" },
    { nom: "محضر الشرطة", slug: "proces-verbal", icon: "file-lines" },
    { nom: "صور", slug: "photos", icon: "image" },
    { nom: "شهود", slug: "temoins", icon: "users" },
    { nom: "السجل التجاري", slug: "registre-commerce", icon: "file" },
    { nom: "الفواتير", slug: "factures", icon: "file-invoice" },
    { nom: "المراسلات", slug: "correspondance", icon: "envelope" },
    { nom: "المذكرات", slug: "memoires", icon: "file-lines" },
    { nom: "المقررات", slug: "decisions", icon: "gavel" },
    { nom: "الإشعارات", slug: "avertissements", icon: "bell" },
    { nom: "الإنذارات", slug: "avertissements-legaux", icon: "exclamation" },
    { nom: "المحاضر", slug: "proces-verbaux", icon: "file" },
    { nom: "الشيك", slug: "cheque", icon: "money-bill" },
    { nom: "كشف الحساب", slug: "releve-compte", icon: "file" },
    { nom: "القوائم المالية", slug: "etats-financiers", icon: "chart-bar" },
    { nom: "الحكم", slug: "jugement", icon: "gavel" },
    { nom: "رسم الإرث", slug: "acte-succession", icon: "file" },
    { nom: "تقرير الخبرة", slug: "rapport-expertise", icon: "file" },
    { nom: "شكاية", slug: "plainte", icon: "file" },
    { nom: "المقال الافتتاحي", slug: "article-introductif", icon: "file" },
    { nom: "القرار الإداري", slug: "decision-administrative", icon: "file" },
    { nom: "عقد التأسيس", slug: "acte-constitution", icon: "file-contract" },
    { nom: "محاضر الجمعيات", slug: "pv-assemblees", icon: "file" },
    { nom: "المخططات", slug: "plans", icon: "draw-polygon" },
    { nom: "كشف الراتب", slug: "bulletin-salaire", icon: "money-bill" },
    { nom: "الرسوم العقارية", slug: "frais-notariaux", icon: "file" },
  ];

  for (const docType of documentTypes) {
    const existing = await prisma.documentType.findUnique({ where: { slug: docType.slug } });
    if (!existing) {
      await prisma.documentType.create({ data: docType });
    }
  }
  console.log("Types de documents créés");

  // ─── Création de l'admin par défaut ───────────────────────
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@cabinet.ma" } });
  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@cabinet.ma",
        password: adminPassword,
        nom: "العلوي",
        prenom: "أحمد",
        telephone: "0612345678",
        role: "admin",
      },
    });
    console.log("Admin créé : admin@cabinet.ma / admin123");
  } else {
    console.log("Admin déjà existant");
  }

  // ─── Paramètres par défaut ────────────────────────────────
  const settings = [
    { key: "cabinet_nom", value: "مكتب الأستاذ أحمد العلوي" },
    { key: "cabinet_adresse", value: "شارع الحسن الثاني، الدار البيضاء" },
    { key: "cabinet_telephone", value: "0522123456" },
    { key: "cabinet_email", value: "contact@cabinet.ma" },
    { key: "cabinet_ville", value: "الدار البيضاء" },
  ];

  for (const setting of settings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.setting.create({ data: setting });
    }
  }
  console.log("Paramètres par défaut créés");

  console.log("Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
