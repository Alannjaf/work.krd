// Programmatic SEO: Kurdish city data for landing pages
// Target searches: "resume builder in [city]", "CV maker [city]", "دروستکردنی سیڤی [city]"

export interface CityData {
  slug: string
  name: { en: string; ar: string; ckb: string }
  region: { en: string; ar: string; ckb: string }
  population: string // approximate, for display
  keyIndustries: { en: string[]; ar: string[]; ckb: string[] }
  description: { en: string; ar: string; ckb: string }
}

export const cities: CityData[] = [
  {
    slug: 'erbil',
    name: { en: 'Erbil', ar: 'أربيل', ckb: 'هەولێر' },
    region: { en: 'Erbil Governorate', ar: 'محافظة أربيل', ckb: 'پارێزگای هەولێر' },
    population: '1.5M+',
    keyIndustries: {
      en: ['Oil & Gas', 'Construction', 'Technology', 'Hospitality', 'Banking'],
      ar: ['النفط والغاز', 'البناء', 'التكنولوجيا', 'الضيافة', 'الخدمات المصرفية'],
      ckb: ['نەوت و گاز', 'بیناسازی', 'تەکنەلۆژیا', 'میوانداری', 'بانکداری'],
    },
    description: {
      en: 'As the capital of the Kurdistan Region, Erbil is the economic hub with thousands of companies hiring across oil & gas, tech, construction, and hospitality. A professional CV is essential to stand out in this competitive job market.',
      ar: 'بصفتها عاصمة إقليم كردستان، تعد أربيل المركز الاقتصادي مع آلاف الشركات التي توظف في مجالات النفط والغاز والتكنولوجيا والبناء والضيافة. السيرة الذاتية الاحترافية ضرورية للتميز في سوق العمل التنافسي.',
      ckb: 'هەولێر وەک پایتەختی هەرێمی کوردستان، ناوەندی ئابووریی هەرێمەکەیە و بە هەزاران کۆمپانیا هەیە لە بوارەکانی نەوت و گاز، تەکنەلۆژیا، بیناسازی و میوانداری. سیڤییەکی پەسەندانە پێویستە بۆ جیاکردنەوەی خۆت لە بازاڕی کار.',
    },
  },
  {
    slug: 'sulaymaniyah',
    name: { en: 'Sulaymaniyah', ar: 'السليمانية', ckb: 'سلێمانی' },
    region: { en: 'Sulaymaniyah Governorate', ar: 'محافظة السليمانية', ckb: 'پارێزگای سلێمانی' },
    population: '900K+',
    keyIndustries: {
      en: ['Education', 'Healthcare', 'Technology', 'Agriculture', 'Media'],
      ar: ['التعليم', 'الرعاية الصحية', 'التكنولوجيا', 'الزراعة', 'الإعلام'],
      ckb: ['پەروەردە', 'تەندروستی', 'تەکنەلۆژیا', 'کشتوکاڵ', 'میدیا'],
    },
    description: {
      en: 'Known as the cultural capital of Kurdistan, Sulaymaniyah has a thriving education, healthcare, and tech sector. With growing startups and NGOs, a well-crafted resume opens doors to opportunities across the city.',
      ar: 'تُعرف السليمانية بالعاصمة الثقافية لكردستان، وتتمتع بقطاعات تعليمية وصحية وتكنولوجية مزدهرة. مع نمو الشركات الناشئة والمنظمات غير الحكومية، تفتح السيرة الذاتية المتقنة أبواب الفرص.',
      ckb: 'سلێمانی بە پایتەختی کولتووری کوردستان ناسراوە و بوارەکانی پەروەردە، تەندروستی و تەکنەلۆژیا تێیدا گەشە دەکەن. لەگەڵ زیادبوونی ستارت‌ئەپ و ڕێکخراوەکان، سیڤییەکی باش دەرگاکانی کار بۆت دەکاتەوە.',
    },
  },
  {
    slug: 'duhok',
    name: { en: 'Duhok', ar: 'دهوك', ckb: 'دهۆک' },
    region: { en: 'Duhok Governorate', ar: 'محافظة دهوك', ckb: 'پارێزگای دهۆک' },
    population: '600K+',
    keyIndustries: {
      en: ['Tourism', 'Trade', 'Agriculture', 'Education', 'Construction'],
      ar: ['السياحة', 'التجارة', 'الزراعة', 'التعليم', 'البناء'],
      ckb: ['گەشتیاری', 'بازرگانی', 'کشتوکاڵ', 'پەروەردە', 'بیناسازی'],
    },
    description: {
      en: 'Duhok is a rapidly growing city with strong tourism, trade, and education sectors. Its strategic location near Turkey makes it a key commercial hub. Stand out to employers with a professional, ATS-optimized resume.',
      ar: 'دهوك مدينة سريعة النمو مع قطاعات سياحة وتجارة وتعليم قوية. موقعها الاستراتيجي بالقرب من تركيا يجعلها مركزاً تجارياً رئيسياً. تميّز أمام أصحاب العمل بسيرة ذاتية احترافية.',
      ckb: 'دهۆک شارێکی خێرا گەشەی کردووە لە بوارەکانی گەشتیاری، بازرگانی و پەروەردە. شوێنی ستراتیژییەکەی لە نزیک تورکیا کردووە بە ناوەندێکی بازرگانی. خۆت جیا بکەرەوە بە سیڤییەکی پەسەندانە.',
    },
  },
  {
    slug: 'kirkuk',
    name: { en: 'Kirkuk', ar: 'كركوك', ckb: 'کەرکووک' },
    region: { en: 'Kirkuk Governorate', ar: 'محافظة كركوك', ckb: 'پارێزگای کەرکووک' },
    population: '1M+',
    keyIndustries: {
      en: ['Oil & Gas', 'Agriculture', 'Government', 'Trade', 'Healthcare'],
      ar: ['النفط والغاز', 'الزراعة', 'القطاع الحكومي', 'التجارة', 'الرعاية الصحية'],
      ckb: ['نەوت و گاز', 'کشتوکاڵ', 'حکومەت', 'بازرگانی', 'تەندروستی'],
    },
    description: {
      en: 'Kirkuk is one of Iraq\'s most important oil-producing cities with a diverse economy. Job seekers in Kirkuk need a strong CV to compete for positions in oil companies, government offices, and the growing private sector.',
      ar: 'كركوك من أهم المدن النفطية في العراق مع اقتصاد متنوع. يحتاج الباحثون عن عمل في كركوك إلى سيرة ذاتية قوية للمنافسة على الوظائف في شركات النفط والدوائر الحكومية والقطاع الخاص.',
      ckb: 'کەرکووک یەکێکە لە گرنگترین شارە نەوتییەکانی عێراق و ئابووری فرە لایەنی هەیە. گەڕانکارانی کار لە کەرکووک پێویستیان بە سیڤییەکی بەهێز هەیە بۆ ڕکابەری لە کۆمپانیای نەوت و بوارە تایبەتەکان.',
    },
  },
  {
    slug: 'halabja',
    name: { en: 'Halabja', ar: 'حلبجة', ckb: 'هەڵەبجە' },
    region: { en: 'Halabja Governorate', ar: 'محافظة حلبجة', ckb: 'پارێزگای هەڵەبجە' },
    population: '120K+',
    keyIndustries: {
      en: ['Agriculture', 'Education', 'NGOs', 'Tourism', 'Government'],
      ar: ['الزراعة', 'التعليم', 'المنظمات غير الحكومية', 'السياحة', 'القطاع الحكومي'],
      ckb: ['کشتوکاڵ', 'پەروەردە', 'ڕێکخراوەکان', 'گەشتیاری', 'حکومەت'],
    },
    description: {
      en: 'Halabja, now its own governorate, is growing with opportunities in education, agriculture, and NGO work. Create a professional resume to access jobs in this developing region.',
      ar: 'حلبجة، التي أصبحت محافظة مستقلة، تنمو مع فرص في التعليم والزراعة والعمل مع المنظمات. أنشئ سيرة ذاتية احترافية للوصول إلى وظائف في هذه المنطقة النامية.',
      ckb: 'هەڵەبجە کە بووە بە پارێزگایەکی سەربەخۆ، گەشە دەکات لە بوارەکانی پەروەردە، کشتوکاڵ و ڕێکخراوەکان. سیڤییەکی پەسەندانە دروست بکە بۆ دەستکەوتنی کار لەم ناوچەیە.',
    },
  },
  {
    slug: 'zakho',
    name: { en: 'Zakho', ar: 'زاخو', ckb: 'زاخۆ' },
    region: { en: 'Duhok Governorate', ar: 'محافظة دهوك', ckb: 'پارێزگای دهۆک' },
    population: '200K+',
    keyIndustries: {
      en: ['Border Trade', 'Logistics', 'Construction', 'Retail', 'Tourism'],
      ar: ['التجارة الحدودية', 'اللوجستيات', 'البناء', 'البيع بالتجزئة', 'السياحة'],
      ckb: ['بازرگانی سنوور', 'لۆجستیک', 'بیناسازی', 'فرۆشتن', 'گەشتیاری'],
    },
    description: {
      en: 'Zakho sits at the Ibrahim Khalil border crossing — Kurdistan\'s busiest trade gateway with Turkey. The city thrives on import/export, logistics, and retail. A polished CV helps you land roles in these fast-moving industries.',
      ar: 'تقع زاخو عند معبر إبراهيم خليل — أهم بوابة تجارية لكردستان مع تركيا. تزدهر المدينة بالاستيراد والتصدير واللوجستيات. سيرة ذاتية متقنة تساعدك في الحصول على وظائف.',
      ckb: 'زاخۆ لە گەلی ئیبراهیم خەلیل دانراوە — سەرەکیترین دەروازەی بازرگانی کوردستان لەگەڵ تورکیا. شارەکە لە بوارەکانی هاوردە و ناردە و لۆجستیک گەشە دەکات. سیڤییەکی باش یارمەتیت دەدات کار بدۆزیتەوە.',
    },
  },
  {
    slug: 'ranya',
    name: { en: 'Ranya', ar: 'رانية', ckb: 'ڕانیە' },
    region: { en: 'Sulaymaniyah Governorate', ar: 'محافظة السليمانية', ckb: 'پارێزگای سلێمانی' },
    population: '150K+',
    keyIndustries: {
      en: ['Agriculture', 'Tourism', 'Education', 'Fishing', 'Government'],
      ar: ['الزراعة', 'السياحة', 'التعليم', 'الصيد', 'القطاع الحكومي'],
      ckb: ['کشتوکاڵ', 'گەشتیاری', 'پەروەردە', 'ماسیگری', 'حکومەت'],
    },
    description: {
      en: 'Located near Lake Dukan, Ranya is known for agriculture, fishing, and tourism. As the area develops, more professional opportunities emerge. Get ahead with a well-designed resume.',
      ar: 'تقع بالقرب من بحيرة دوكان، وتشتهر رانية بالزراعة والصيد والسياحة. مع تطور المنطقة، تظهر المزيد من الفرص المهنية. تقدم بسيرة ذاتية مصممة بشكل احترافي.',
      ckb: 'ڕانیە لە نزیکی دەریاچەی دووکان دانراوە و بە کشتوکاڵ و ماسیگری و گەشتیاری ناسراوە. لەگەڵ گەشەسەندنی ناوچەکە، دەرفەتی کاری زیاتر دەردەکەوێت. سیڤییەکی باش ئامادە بکە.',
    },
  },
  {
    slug: 'kalar',
    name: { en: 'Kalar', ar: 'كلار', ckb: 'کەلار' },
    region: { en: 'Garmian Administration', ar: 'إدارة گرميان', ckb: 'بەڕێوەبەرایەتی گەرمیان' },
    population: '200K+',
    keyIndustries: {
      en: ['Oil & Gas', 'Agriculture', 'Government', 'Trade', 'Education'],
      ar: ['النفط والغاز', 'الزراعة', 'القطاع الحكومي', 'التجارة', 'التعليم'],
      ckb: ['نەوت و گاز', 'کشتوکاڵ', 'حکومەت', 'بازرگانی', 'پەروەردە'],
    },
    description: {
      en: 'Kalar is the center of the Garmian region with growing oil & gas operations and agricultural output. Job seekers need professional CVs to compete in this expanding economy.',
      ar: 'كلار هي مركز منطقة گرميان مع عمليات نفط وغاز متنامية وإنتاج زراعي. يحتاج الباحثون عن عمل إلى سير ذاتية احترافية للمنافسة.',
      ckb: 'کەلار ناوەندی ناوچەی گەرمیانە و کاری نەوت و گاز و کشتوکاڵی تێیدا گەشە دەکات. گەڕانکارانی کار پێویستیان بە سیڤییەکی پەسەندانە هەیە.',
    },
  },
]

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find((c) => c.slug === slug)
}

export function getAllCitySlugs(): string[] {
  return cities.map((c) => c.slug)
}
