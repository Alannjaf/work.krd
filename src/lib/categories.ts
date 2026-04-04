// Programmatic SEO: Job category data for landing pages
// Target searches: "oil and gas jobs Kurdistan", "construction jobs Erbil", "وظائف تكنولوجيا كوردستان"

export interface CategoryData {
  slug: string
  name: { en: string; ar: string; ckb: string }
  description: { en: string; ar: string; ckb: string }
  icon: string // lucide icon name hint
  searchTerms: string[] // DB category values to match
  topCities: string[] // city slugs where this category is strong
}

export const categories: CategoryData[] = [
  {
    slug: 'oil-and-gas',
    name: { en: 'Oil & Gas', ar: 'النفط والغاز', ckb: 'نەوت و گاز' },
    description: {
      en: 'Kurdistan Region holds significant oil reserves, with major international operators in Erbil, Kirkuk, and Kalar. Find petroleum engineering, drilling, HSE, and operations roles across the energy sector.',
      ar: 'يمتلك إقليم كردستان احتياطيات نفطية كبيرة مع شركات دولية كبرى في أربيل وكركوك وكلار. اعثر على وظائف هندسة البترول والحفر والسلامة والعمليات.',
      ckb: 'هەرێمی کوردستان بەرهەمی نەوتی زۆری هەیە و کۆمپانیای نێودەوڵەتی گەورە لە هەولێر و کەرکووک و کەلار کاردەکەن. کاری ئەندازیاری نەوت و لێدوان و سەلامەتی بدۆزەرەوە.',
    },
    icon: 'Flame',
    searchTerms: ['Oil & Gas', 'Oil and Gas', 'Petroleum', 'Energy'],
    topCities: ['erbil', 'kirkuk', 'kalar'],
  },
  {
    slug: 'construction',
    name: { en: 'Construction', ar: 'البناء', ckb: 'بیناسازی' },
    description: {
      en: 'The Kurdistan Region is experiencing a construction boom with new infrastructure, residential, and commercial projects. Find civil engineering, project management, and skilled trade jobs.',
      ar: 'يشهد إقليم كردستان طفرة في البناء مع مشاريع بنية تحتية وسكنية وتجارية جديدة. اعثر على وظائف الهندسة المدنية وإدارة المشاريع والحرف.',
      ckb: 'هەرێمی کوردستان گەشەی بیناسازی زۆری هەیە لەگەڵ پڕۆژەی ئابووری و نیشتەجێبوون و بازرگانی. کاری ئەندازیاری شارستانی و بەڕێوەبردنی پڕۆژە بدۆزەرەوە.',
    },
    icon: 'HardHat',
    searchTerms: ['Construction', 'Building', 'Engineering', 'Civil'],
    topCities: ['erbil', 'duhok', 'zakho'],
  },
  {
    slug: 'technology',
    name: { en: 'Technology', ar: 'التكنولوجيا', ckb: 'تەکنەلۆژیا' },
    description: {
      en: 'Kurdistan\'s tech sector is growing fast with startups, IT companies, and digital transformation across industries. Find software development, IT support, data, and digital marketing roles.',
      ar: 'ينمو قطاع التكنولوجيا في كردستان بسرعة مع الشركات الناشئة وشركات تكنولوجيا المعلومات والتحول الرقمي. اعثر على وظائف تطوير البرمجيات والدعم الفني والبيانات.',
      ckb: 'بوارەکەی تەکنەلۆژیا لە کوردستان خێرا گەشە دەکات لەگەڵ ستارت‌ئەپ و کۆمپانیای ئایتی. کاری پەرەپێدانی سۆفتوێر و پاڵپشتی ئایتی و داتا بدۆزەرەوە.',
    },
    icon: 'Laptop',
    searchTerms: ['Technology', 'IT', 'Software', 'Tech', 'Digital'],
    topCities: ['erbil', 'sulaymaniyah'],
  },
  {
    slug: 'healthcare',
    name: { en: 'Healthcare', ar: 'الرعاية الصحية', ckb: 'تەندروستی' },
    description: {
      en: 'Kurdistan\'s healthcare sector is expanding with new hospitals and clinics. Find medical, nursing, pharmacy, and healthcare administration positions across the region.',
      ar: 'يتوسع قطاع الرعاية الصحية في كردستان مع مستشفيات وعيادات جديدة. اعثر على وظائف طبية وتمريضية وصيدلانية وإدارة صحية.',
      ckb: 'بوارەکەی تەندروستی لە کوردستان بەرفراوان دەبێت لەگەڵ نەخۆشخانە و کلینیکی نوێ. کاری پزیشکی و پەرستاری و دەرمانسازی بدۆزەرەوە.',
    },
    icon: 'Heart',
    searchTerms: ['Healthcare', 'Medical', 'Hospital', 'Health', 'Pharmacy', 'Nursing'],
    topCities: ['sulaymaniyah', 'kirkuk', 'erbil'],
  },
  {
    slug: 'education',
    name: { en: 'Education', ar: 'التعليم', ckb: 'پەروەردە' },
    description: {
      en: 'Teaching and academic positions are in high demand across Kurdistan\'s schools and universities. Find teaching, training, academic research, and education management roles.',
      ar: 'الوظائف التعليمية والأكاديمية مطلوبة بشدة في مدارس وجامعات كردستان. اعثر على وظائف التدريس والتدريب والبحث الأكاديمي.',
      ckb: 'کاری مامۆستایەتی و ئەکادیمی داواکاری زۆری هەیە لە قوتابخانە و زانکۆکانی کوردستان. کاری وانەوتنەوە و ڕاهێنان و توێژینەوە بدۆزەرەوە.',
    },
    icon: 'GraduationCap',
    searchTerms: ['Education', 'Teaching', 'Training', 'Academic', 'University'],
    topCities: ['sulaymaniyah', 'duhok', 'erbil', 'halabja'],
  },
  {
    slug: 'hospitality-tourism',
    name: { en: 'Hospitality & Tourism', ar: 'الضيافة والسياحة', ckb: 'میوانداری و گەشتیاری' },
    description: {
      en: 'Kurdistan\'s tourism industry is booming with hotels, restaurants, and travel services expanding rapidly. Find hotel management, F&B, tour guide, and hospitality roles.',
      ar: 'تزدهر صناعة السياحة في كردستان مع توسع الفنادق والمطاعم وخدمات السفر. اعثر على وظائف إدارة الفنادق والمأكولات والمشروبات والسياحة.',
      ckb: 'بوارەکەی گەشتیاری لە کوردستان گەشە دەکات لەگەڵ هوتێل و چێشتخانە و خزمەتگوزاری گەشت. کاری بەڕێوەبردنی هوتێل و خواردنەوە بدۆزەرەوە.',
    },
    icon: 'Hotel',
    searchTerms: ['Hospitality', 'Tourism', 'Hotel', 'Restaurant', 'Travel', 'F&B'],
    topCities: ['erbil', 'duhok', 'ranya'],
  },
  {
    slug: 'banking-finance',
    name: { en: 'Banking & Finance', ar: 'الخدمات المصرفية والمالية', ckb: 'بانکداری و دارایی' },
    description: {
      en: 'Kurdistan\'s financial sector includes banks, insurance companies, and money transfer services. Find accounting, banking, finance, and audit roles across major cities.',
      ar: 'يشمل القطاع المالي في كردستان البنوك وشركات التأمين وخدمات التحويلات. اعثر على وظائف المحاسبة والمصرفية والمالية والتدقيق.',
      ckb: 'بوارەکەی دارایی لە کوردستان بانک و کۆمپانیای بیمە و خزمەتگوزاری ناردنی پارەی تێدایە. کاری ژمێریاری و بانکداری و دارایی بدۆزەرەوە.',
    },
    icon: 'Landmark',
    searchTerms: ['Banking', 'Finance', 'Accounting', 'Insurance', 'Audit'],
    topCities: ['erbil', 'sulaymaniyah'],
  },
  {
    slug: 'trade-logistics',
    name: { en: 'Trade & Logistics', ar: 'التجارة واللوجستيات', ckb: 'بازرگانی و لۆجستیک' },
    description: {
      en: 'Kurdistan\'s strategic location between Turkey, Iran, and central Iraq makes it a trade hub. Find import/export, logistics, supply chain, and warehouse management jobs.',
      ar: 'الموقع الاستراتيجي لكردستان بين تركيا وإيران ووسط العراق يجعلها مركزاً تجارياً. اعثر على وظائف الاستيراد والتصدير واللوجستيات وسلسلة التوريد.',
      ckb: 'شوێنی ستراتیژی کوردستان لە نێوان تورکیا و ئێران و ناوەڕاستی عێراق کردووەتی بە ناوەندی بازرگانی. کاری هاوردە و ناردە و لۆجستیک بدۆزەرەوە.',
    },
    icon: 'Truck',
    searchTerms: ['Trade', 'Logistics', 'Import', 'Export', 'Supply Chain', 'Warehouse', 'Retail'],
    topCities: ['zakho', 'erbil', 'duhok'],
  },
  {
    slug: 'agriculture',
    name: { en: 'Agriculture', ar: 'الزراعة', ckb: 'کشتوکاڵ' },
    description: {
      en: 'Agriculture remains a key sector in Kurdistan, especially in Halabja, Ranya, and Kalar regions. Find farming, agribusiness, food processing, and veterinary roles.',
      ar: 'لا تزال الزراعة قطاعاً رئيسياً في كردستان، خاصة في مناطق حلبجة ورانية وكلار. اعثر على وظائف الزراعة والأعمال الزراعية وتصنيع الأغذية.',
      ckb: 'کشتوکاڵ بوارێکی سەرەکییە لە کوردستان، بەتایبەت لە هەڵەبجە و ڕانیە و کەلار. کاری کشتوکاڵ و پیشەسازی خواردن بدۆزەرەوە.',
    },
    icon: 'Wheat',
    searchTerms: ['Agriculture', 'Farming', 'Food', 'Veterinary', 'Agri'],
    topCities: ['halabja', 'ranya', 'kalar', 'kirkuk'],
  },
  {
    slug: 'ngo-international',
    name: { en: 'NGOs & International Orgs', ar: 'المنظمات غير الحكومية والدولية', ckb: 'ڕێکخراوە نەحکومی و نێودەوڵەتییەکان' },
    description: {
      en: 'Kurdistan hosts hundreds of NGOs and international organizations working in humanitarian aid, development, and human rights. Find program management, field coordination, and policy roles.',
      ar: 'يستضيف كردستان مئات المنظمات غير الحكومية والدولية العاملة في المساعدات الإنسانية والتنمية وحقوق الإنسان. اعثر على وظائف إدارة البرامج والتنسيق الميداني.',
      ckb: 'کوردستان سەدان ڕێکخراوی نەحکومی و نێودەوڵەتی تێدایە کە لە یارمەتی مرۆڤایەتی و گەشەپێدان کاردەکەن. کاری بەڕێوەبردنی پڕۆگرام بدۆزەرەوە.',
    },
    icon: 'Globe',
    searchTerms: ['NGO', 'International', 'Humanitarian', 'UN', 'UNDP', 'Development'],
    topCities: ['erbil', 'sulaymaniyah', 'duhok', 'halabja'],
  },
]

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug)
}
