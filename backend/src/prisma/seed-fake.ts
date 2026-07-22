import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("=== Ajout de données fictives ===\n");

  const admin = await prisma.user.findUnique({ where: { email: "admin@cabinet.ma" } });
  if (!admin) {
    console.error("Admin non trouvé ! Lancez d'abord le seed principal.");
    return;
  }

  const caseTypes = await prisma.caseType.findMany({ include: { documents: true } });
  const templates = await prisma.caseTemplate.findMany({ include: { documents: true } });
  const docTypes = await prisma.documentType.findMany();

  // ─── CLIENTS ────────────────────────────────────────────────────
  const clientsData = [
    {
      nom: "بنعمر", prenom: "محمد", cin: "BE123456", telephone: "0661234567",
      adresse: "شارع فاطمة الفهرية، رقم 23", ville: "الدار البيضاء", profession: "رجل أعمال",
      email: "mohamed.benomar@gmail.com", observations: "عميل دائم، يتعامل مع عدة قضايا تجارية",
    },
    {
      nom: "الشرقاوي", prenom: "فاطمة", cin: "CQ234567", telephone: "0672345678",
      adresse: "شارع الأمير عبد القادر، رقم 15", ville: "الدار البيضاء", profession: "مدرسة",
      email: "fatima.sharkaoui@gmail.com",
    },
    {
      nom: "الحسني", prenom: "عبد الرحمن", cin: "HS345678", telephone: "0683456789",
      adresse: "حي السلام، شارع الحرية، رقم 8", ville: "الدار البيضاء", profession: "مهندس",
      email: "abderrahmane.hassani@gmail.com",
    },
    {
      nom: "العطوي", prenom: "نادية", cin: "AT456789", telephone: "0694567890",
      adresse: "شارع محمد الخامس، رقم 42", ville: "الدار البيضاء", profession: "صاحبة شركة",
      email: "nadia.atoui@gmail.com", observations: "صاحبة شركة الامل للتجارة",
    },
    {
      nom: "البوزيدي", prenom: "يوسف", cin: "BZ567890", telephone: "0605678901",
      adresse: "شارع علال الفاسي، رقم 7", ville: "الدار البيضاء", profession: "موظف بنكي",
      email: "youssef.bouzidi@gmail.com",
    },
    {
      nom: "العمري", prenom: "سارة", cin: "AM678901", telephone: "0616789012",
      adresse: "حي النصر، شارع ابن خلدون، رقم 19", ville: "الدار البيضاء", profession: "طبيبة",
      email: "sara.omri@gmail.com",
    },
    {
      nom: "الكعبي", prenom: "كريم", cin: "KB789012", telephone: "0627890123",
      adresse: "شارع الزرقطوني، رقم 31", ville: "الدار البيضاء", profession: "تاجر",
      email: "karim.kaabi@gmail.com", observations: "يملك محلاً تجارياً في سوق الدار البيضاء",
    },
    {
      nom: "الفاسي", prenom: "مريم", cin: "FA890123", telephone: "0638901234",
      adresse: "شارع مولاي يوسف، رقم 5", ville: "الدار البيضاء", profession: "موظفة حكومية",
      email: "meryem.fassi@gmail.com",
    },
  ];

  const createdClients = [];
  for (const c of clientsData) {
    const existing = await prisma.client.findUnique({ where: { cin: c.cin } });
    if (!existing) {
      const client = await prisma.client.create({ data: c });
      createdClients.push(client);
      console.log(`عميل: ${c.prenom} ${c.nom}`);
    } else {
      createdClients.push(existing);
      console.log(`عميل موجود: ${c.prenom} ${c.nom}`);
    }
  }

  // ─── USER COMPTES CLIENTS ─────────────────────────────────────
  const clientUsersData = [
    { email: "mohamed.benomar@gmail.com", password: "$2a$12$LJ3m4ys3Lk0TSwHjRqM5NOJm7MnGqN4Bx4VYv8R3V8R3V8R3V8R3", clientIndex: 0 },
    { email: "fatima.sharkaoui@gmail.com", password: "$2a$12$LJ3m4ys3Lk0TSwHjRqM5NOJm7MnGqN4Bx4VYv8R3V8R3V8R3V8R3", clientIndex: 1 },
    { email: "nadia.atoui@gmail.com", password: "$2a$12$LJ3m4ys3Lk0TSwHjRqM5NOJm7MnGqN4Bx4VYv8R3V8R3V8R3V8R3", clientIndex: 3 },
  ];

  for (const cu of clientUsersData) {
    const existing = await prisma.user.findUnique({ where: { email: cu.email } });
    if (!existing) {
      const client = createdClients[cu.clientIndex];
      await prisma.user.create({
        data: {
          email: cu.email,
          password: cu.password,
          nom: client.nom,
          prenom: client.prenom,
          telephone: client.telephone,
          role: "client",
          clientId: client.id,
        },
      });
      console.log(` compte client: ${cu.email}`);
    }
  }

  // ─── DOSSIERS (CASES) ──────────────────────────────────────────
  const tribunals = [
    "المحكمة الابتدائية بالدار البيضاء",
    "المحكمة الابتدائية أنفا",
    "المحكمة الابتدائية سيدي البرنوصي",
    "المحكمة التجارية بالدار البيضاء",
    "المحكمة الإدارية بالدار البيضاء",
    "الاستئنافية بالدار البيضاء",
    "المحكمة الاجتماعية بالدار البيضاء",
  ];

  const juges = [
    "الأستاذ كريم بنسعيد", "الأستاذة ليلى المرابط", "الأستاذ عمر الفاسي",
    "الأستاذة نادية العلوي", "الأستاذ حسن الإدريسي", "الأستاذة فوزية بنموسى",
  ];

  const casesData = [
    {
      reference: "CF-2026-001", type: "القضايا المدنية", sousType: "تعويض عن الأضرار",
      description: "قضية تعويض عن حادث مروري أصيب فيه العميل بجروح",
      etat: "en_cours", progress: 35, clientIndex: 0, caseTypeIndex: 0,
    },
    {
      reference: "CF-2026-002", type: "الطلاق", sousType: "تطليق فسخ",
      description: "طلب طلاق بسبب غياب الزوج لمدة طويلة",
      etat: "en_cours", progress: 60, clientIndex: 1, caseTypeIndex: 11,
    },
    {
      reference: "CF-2026-003", type: "القضايا التجارية", sousType: "نزاع تجاري",
      description: "نزاع بين شركتين حول عقد توريد",
      etat: "en_cours", progress: 45, clientIndex: 3, caseTypeIndex: 2,
    },
    {
      reference: "CF-2026-004", type: "النفقة", sousType: "نفقة أطفال",
      description: "طلب نفقة للأطفال بعد الطلاق",
      etat: "en_cours", progress: 70, clientIndex: 1, caseTypeIndex: 12,
    },
    {
      reference: "CF-2026-005", type: "القضايا العقارية", sousType: "نزاع ملكية",
      description: "نزاع حول ملكية أرض بين جيران",
      etat: "en_cours", progress: 20, clientIndex: 2, caseTypeIndex: 4,
    },
    {
      reference: "CF-2026-006", type: "حوادث السير", sousType: "تعويض",
      description: "车祸 تعويض عن حادث سير مع خسائر مادية ومعنوية",
      etat: "cloture", progress: 100, clientIndex: 0, caseTypeIndex: 10,
    },
    {
      reference: "CF-2026-007", type: "قضايا الشغل", sousType: "فصل تعسفي",
      description: "طعن في قرار فصل تعسفي من العمل",
      etat: "en_cours", progress: 50, clientIndex: 4, caseTypeIndex: 6,
    },
    {
      reference: "CF-2026-008", type: "السرقة", sousType: "سرقة من مسكن",
      description: "شكوى سرقة من مسكن والقبض على المتورطين",
      etat: "en_cours", progress: 40, clientIndex: 5, caseTypeIndex: 14,
    },
    {
      reference: "CF-2026-009", type: "القضايا الإدارية", sousType: "طعن في قرار إداري",
      description: "طعن في قرار رفض الترخيص بالبناء",
      etat: "suspendu", progress: 30, clientIndex: 6, caseTypeIndex: 5,
    },
    {
      reference: "CF-2026-010", type: "الكراء", sousType: "إخلاء",
      description: "طلب إخلاء محل تجاري بسبب عدم أداء الكراء",
      etat: "en_cours", progress: 55, clientIndex: 6, caseTypeIndex: 9,
    },
    {
      reference: "CF-2026-011", type: "الإرث", sousType: "تقسيم تركة",
      description: "تقسيم تركة والد العميل بين الورثة",
      etat: "en_cours", progress: 25, clientIndex: 7, caseTypeIndex: 8,
    },
    {
      reference: "CF-2026-012", type: "الحضانة", sousType: "حضانة أطفال",
      description: "طلب حضانة الأطفال بعد الطلاق",
      etat: "en_cours", progress: 65, clientIndex: 1, caseTypeIndex: 13,
    },
  ];

  const createdCases = [];
  for (const c of casesData) {
    const existing = await prisma.case.findUnique({ where: { reference: c.reference } });
    if (!existing) {
      const client = createdClients[c.clientIndex];
      const caseType = caseTypes[c.caseTypeIndex];
      const tribunal = randomItem(tribunals);

      const caseRecord = await prisma.case.create({
        data: {
          reference: c.reference,
          mahakimRef: `MK-${c.reference.replace("CF-", "")}`,
          tribunal,
          type: c.type,
          sousType: c.sousType,
          description: c.description,
          etat: c.etat,
          progress: c.progress,
          clientId: client.id,
          caseTypeId: caseType?.id,
        },
      });
      createdCases.push(caseRecord);
      console.log(` dossier: ${c.reference} - ${c.sousType}`);

      // Checklist items from case type documents
      if (caseType?.documents) {
        const shuffled = [...caseType.documents].sort(() => Math.random() - 0.5);
        const numChecked = Math.floor(Math.random() * (shuffled.length + 1));
        for (let i = 0; i < shuffled.length; i++) {
          await prisma.caseChecklistItem.create({
            data: {
              nom: shuffled[i].nameAr,
              obligatoire: shuffled[i].isRequired,
              ordre: shuffled[i].order,
              coche: i < numChecked,
              casId: caseRecord.id,
            },
          });
        }
      }
    } else {
      createdCases.push(existing);
    }
  }

  // ─── DOCUMENTS ──────────────────────────────────────────────────
  const documentNames = [
    "البطاقة الوطنية", "وكالة", "محضر الشرطة", "شهادة طبية", "صور",
    "عقد الزواج", "شهادة الميلاد", "عقد الملكية", "الفواتير", "المذكرات",
  ];

  const docStatuses = ["en_attente", "valide", "rejete"];
  const docAuthors = ["المستشارة نادية", "المحامي أحمد", "الكاتب فؤاد"];

  for (const c of createdCases) {
    const numDocs = Math.floor(Math.random() * 4) + 1;
    const usedNames = new Set<string>();
    for (let i = 0; i < numDocs; i++) {
      let docName: string;
      do { docName = randomItem(documentNames); } while (usedNames.has(docName));
      usedNames.add(docName);

      const docType = docTypes.find(d => d.nom === docName);
      await prisma.document.create({
        data: {
          nom: docName,
          fileName: `${docName.replace(/\s/g, "_")}_${c.reference}.pdf`,
          filePath: `/uploads/${c.reference}/${docName.replace(/\s/g, "_")}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          auteur: randomItem(docAuthors),
          etat: randomItem(docStatuses),
          commentaires: Math.random() > 0.5 ? "تم التحقق من الوثيقة" : undefined,
          isClientVisible: Math.random() > 0.3,
          casId: c.id,
          typeId: docType?.id,
        },
      });
    }
    console.log(` وثائق: ${c.reference} (${numDocs} وثائق)`);
  }

  // ─── AUDIENCES (HEARINGS) ──────────────────────────────────────
  const hearingTypes = ["نظر أول", "نظر ثاني", "conciliation", "إبرام حكم", "مرافعة"];
  const hearingStatuses = ["planifiee", "tenue", "reportee", "annulee"];
  const salles = ["القاعة 1", "القاعة 2", "القاعة 3", "القاعة 5", "قاعة المجلس"];

  for (const c of createdCases) {
    const numHearings = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numHearings; i++) {
      const date = randomDate(new Date("2026-05-01"), new Date("2026-12-31"));
      const status = i === numHearings - 1 ? "planifiee" : randomItem(hearingStatuses);
      await prisma.hearing.create({
        data: {
          date,
          heure: `${String(Math.floor(Math.random() * 5) + 9).padStart(2, "0")}:${randomItem(["00", "30"])}`,
          type: randomItem(hearingTypes),
          tribunal: randomItem(tribunals),
          salle: randomItem(salles),
          juge: randomItem(juges),
          statut: status,
          notes: status === "reportee" ? "تم التأجيل بسبب غياب أحد الطرفين" : undefined,
          casId: c.id,
        },
      });
    }
    console.log(` جلسة: ${c.reference} (${numHearings} جلسات)`);
  }

  // ─── PAIEMENTS ──────────────────────────────────────────────────
  const paymentModes = ["especes", "cheques", "virement"];
  const paymentAmounts = [2000, 3500, 5000, 7500, 10000, 15000, 20000];

  for (const c of createdCases) {
    if (Math.random() > 0.3) {
      const numPayments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPayments; i++) {
        await prisma.payment.create({
          data: {
            montant: randomItem(paymentAmounts),
            date: randomDate(new Date("2026-01-01"), new Date("2026-07-15")),
            mode: randomItem(paymentModes),
            reference: `PAY-${c.reference}-${String(i + 1).padStart(2, "0")}`,
            notes: i === 0 ? "دفعة أولى" : i === 1 ? "دفعة ثانية" : "دفعة نهائية",
            casId: c.id,
          },
        });
      }
      console.log(` دفع: ${c.reference} (${numPayments} دفعات)`);
    }
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────────
  const notificationsData = [
    { titre: "جلسة قادمة", message: "لديك جلسة غداً في المحكمة الابتدائية", type: "audience" },
    { titre: "وثيقة جديدة", message: "تم رفع وثيقة جديدة في dossier CF-2026-001", type: "document" },
    { titre: "تحديث الملف", message: "تم تحديث حالة dossier CF-2026-003", type: "dossier" },
    { titre: "دفع جديد", message: "تم تسجيل دفعة جديدة بقيمة 5000 درهم", type: "paiement" },
    { titre: "تنبيه", message: "هناك 3 وثائق بانتظار المراجعة", type: "document" },
    { titre: "جلسة مؤجلة", message: "تم تأجيل جلسة dossier CF-2026-007", type: "audience" },
    { titre: "عميل جديد", message: "تم إضافة عميل جديد: يوسف البوزيدي", type: "dossier" },
    { titre: "نفقة", message: "تم تحديد مبلغ النفقة في dossier CF-2026-004", type: "paiement" },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: { ...n, lu: Math.random() > 0.5, userId: admin.id },
    });
  }
  console.log(" إشعارات: 8 إشعارات");

  // ─── ACTIVITÉS ──────────────────────────────────────────────────
  const activitiesData = [
    { action: "creation", entity: "client", description: "إنشاء عميل جديد: محمد بنعمر" },
    { action: "creation", entity: "case", description: "فتح dossier CF-2026-001" },
    { action: "upload", entity: "document", description: "رفع وثيقة البطاقة الوطنية" },
    { action: "modification", entity: "case", description: "تحديث حالة dossier CF-2026-003" },
    { action: "login", entity: "user", description: "تسجيل الدخول إلى النظام" },
    { action: "creation", entity: "hearing", description: "إضافة جلسة جديدة في dossier CF-2026-002" },
    { action: "upload", entity: "document", description: "رفع عقد الزواج في dossier CF-2026-002" },
    { action: "creation", entity: "payment", description: "تسجيل دفعة في dossier CF-2026-006" },
    { action: "modification", entity: "case", description: "تحديث تقدم dossier CF-2026-004 إلى 70%" },
    { action: "creation", entity: "client", description: "إنشاء عميل جديد: كريم الكعبي" },
    { action: "export", entity: "case", description: "تصدير تقرير dossier CF-2026-006 كـ PDF" },
    { action: "download", entity: "document", description: "تحميل محضر الشرطة من dossier CF-2026-008" },
  ];

  for (const a of activitiesData) {
    await prisma.activity.create({
      data: { ...a, userId: admin.id },
    });
  }
  console.log(" أنشطة: 12 نشاط");

  // ─── ÉVÉNEMENTS DE RAPPEL ──────────────────────────────────────
  const eventsData = [
    {
      title: "جلسة محاكمة - محمد بنعمر", description: "الجلسة الأولى في قضية التعويض",
      type: "AUDIENCE" as const, priority: "IMPORTANTE" as const,
      date: new Date("2026-08-15"), time: "09:30", lieu: "المحكمة الابتدائية بالدار البيضاء",
      clientIndex: 0, caseIndex: 0,
    },
    {
      title: "موعد مع فاطمة الشرقاوي", description: "مناقشة تطورات قضية الطلاق",
      type: "RENDEZ_VOUS" as const, priority: "NORMALE" as const,
      date: new Date("2026-07-25"), time: "14:00", lieu: "المكتب",
      clientIndex: 1, caseIndex: 1,
    },
    {
      title: "ال案子 العقارية - جلسة خبرة", description: "جلسة خبرة في قضية النزاع العقاري",
      type: "AUDIENCE" as const, priority: "URGENTE" as const,
      date: new Date("2026-07-22"), time: "10:00", lieu: "المحكمة الابتدائية أنفا",
      clientIndex: 2, caseIndex: 4,
    },
    {
      title: "تسليم الملف التجاري", description: "تسليم الملف الكامل للقضية التجارية",
      type: "TACHE" as const, priority: "IMPORTANTE" as const,
      date: new Date("2026-08-01"), time: "16:00", lieu: "المكتب",
      clientIndex: 3, caseIndex: 2,
    },
    {
      title: "استحقاق النفقة الشهري", description: "date إيداع مبلغ النفقة",
      type: "ECHEANCE" as const, priority: "NORMALE" as const,
      date: new Date("2026-08-01"), time: "09:00", lieu: "البنك",
      clientIndex: 1, caseIndex: 3,
    },
    {
      title: "جلسة طلاق - فاطمة الشرقاوي", description: "الجلسة الثالثة في قضية الطلاق",
      type: "AUDIENCE" as const, priority: "IMPORTANTE" as const,
      date: new Date("2026-09-05"), time: "11:00", lieu: "المحكمة الاجتماعية بالدار البيضاء",
      clientIndex: 1, caseIndex: 1,
    },
  ];

  for (const e of eventsData) {
    const client = createdClients[e.clientIndex];
    const cas = createdCases[e.caseIndex];

    const event = await prisma.reminderEvent.create({
      data: {
        userId: admin.id,
        title: e.title,
        description: e.description,
        clientId: client.id,
        caseId: cas.id,
        type: e.type,
        date: e.date,
        time: e.time,
        lieu: e.lieu,
        priority: e.priority,
      },
    });

    // Generate reminders: J-7, J-3, J-1, H-2, M-30
    const eventDate = new Date(e.date);
    const reminders = [
      { offset: -7 * 24 * 60, label: "7 أيام" },
      { offset: -3 * 24 * 60, label: "3 أيام" },
      { offset: -1 * 24 * 60, label: "يوم واحد" },
      { offset: -2 * 60, label: "ساعتين" },
      { offset: -30, label: "30 دقيقة" },
    ];

    for (const r of reminders) {
      const remindAt = new Date(eventDate.getTime() + r.offset * 60 * 1000);
      await prisma.reminder.create({
        data: {
          eventId: event.id,
          userId: admin.id,
          title: `تذكير: ${e.title} (${r.label})`,
          description: e.description,
          remindAt,
          notified: remindAt < new Date(),
          dismissed: false,
        },
      });
    }
    console.log(` حدث: ${e.title} + 5 تذكيرات`);
  }

  // ─── RÉSUMÉ ─────────────────────────────────────────────────────
  console.log("\n=== ملخص البيانات المضافة ===");
  const counts = {
    clients: await prisma.client.count(),
    users: await prisma.user.count(),
    cases: await prisma.case.count(),
    checklistItems: await prisma.caseChecklistItem.count(),
    documents: await prisma.document.count(),
    hearings: await prisma.hearing.count(),
    payments: await prisma.payment.count(),
    notifications: await prisma.notification.count(),
    activities: await prisma.activity.count(),
    reminderEvents: await prisma.reminderEvent.count(),
    reminders: await prisma.reminder.count(),
  };

  for (const [key, val] of Object.entries(counts)) {
    console.log(`  ${key}: ${val}`);
  }

  console.log("\n=== اكتمل بنجاح! ===");
  console.log("\nبيانات الدخول:");
  console.log("  المدير: admin@cabinet.ma / admin123");
  console.log("  العميل 1: mohamed.benomar@gmail.com");
  console.log("  العميل 2: fatima.sharkaoui@gmail.com");
}

main()
  .catch((e) => {
    console.error("خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
