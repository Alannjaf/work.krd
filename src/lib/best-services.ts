// Programmatic SEO: "Best X in [City]" listicle pages
// Target searches: "best web designer in erbil", "best marketing agency sulaymaniyah"

export interface ServiceData {
  slug: string
  name: { en: string; ar: string; ckb: string }
  description: { en: string; ar: string; ckb: string }
  whyMatters: { en: string; ar: string; ckb: string }
  tips: { en: string[]; ckb: string[] }
  relatedCategories: string[] // category slugs for internal linking
}

export const services: ServiceData[] = [
  {
    slug: 'web-designers',
    name: { en: 'Web Designers', ar: 'مصممي المواقع', ckb: 'دیزاینەری وێبسایت' },
    description: {
      en: 'Looking for the best web designers? Kurdistan has a growing pool of talented designers building modern, responsive websites for local businesses and international clients.',
      ar: 'تبحث عن أفضل مصممي المواقع؟ كردستان لديها مجموعة متنامية من المصممين الموهوبين الذين يبنون مواقع حديثة ومتجاوبة.',
      ckb: 'بەدوای باشترین دیزاینەری وێبسایتدا دەگەڕێیت؟ کوردستان کۆمەڵێک دیزاینەری بەئەزموونی هەیە کە وێبسایتی مۆدێرن دروست دەکەن.',
    },
    whyMatters: {
      en: 'A professional website is essential for any business in Kurdistan. With more customers searching online, having a well-designed website helps you stand out from competitors and attract more clients.',
      ar: 'موقع احترافي ضروري لأي عمل في كردستان. مع المزيد من العملاء الباحثين عبر الإنترنت، يساعدك الموقع المصمم جيداً في التميز.',
      ckb: 'وێبسایتی پەسەندانە پێویستە بۆ هەر بزنسێک لە کوردستان. لەگەڵ ئەوەی زیاتر موشتەری ئۆنلاین دەگەڕێن، وێبسایتی باش یارمەتیت دەدات جیا بیتەوە.',
    },
    tips: {
      en: [
        'Check their portfolio for Kurdistan-specific projects',
        'Ensure they support RTL (Arabic/Kurdish) layouts',
        'Ask about mobile responsiveness and SEO optimization',
        'Look for experience with local payment integrations',
        'Verify they offer ongoing maintenance and support',
      ],
      ckb: [
        'پۆرتفۆلیۆیان ببینە بۆ پڕۆژەکانی کوردستان',
        'دڵنیا بە لەوەی RTL (عەرەبی/کوردی) پاڵپشتی دەکەن',
        'پرسیار لەسەر ڕێسپۆنسیڤ و SEO بکە',
        'شارەزایی لەگەڵ سیستەمی پارەدان لە کوردستان',
        'دڵنیا بە لە خزمەتگوزاری و چاککردنەوەی دوای دروستکردن',
      ],
    },
    relatedCategories: ['technology'],
  },
  {
    slug: 'graphic-designers',
    name: { en: 'Graphic Designers', ar: 'مصممي الجرافيك', ckb: 'دیزاینەری گرافیک' },
    description: {
      en: 'Find top graphic designers who understand Kurdish and Arabic typography, branding, and visual identity. From logos to social media, Kurdistan\'s creative talent is thriving.',
      ar: 'اعثر على أفضل مصممي الجرافيك الذين يفهمون الخط العربي والكردي والهوية البصرية. من الشعارات إلى وسائل التواصل الاجتماعي.',
      ckb: 'باشترین دیزاینەری گرافیک بدۆزەرەوە کە لە تایپۆگرافیای کوردی و عەرەبی تێدەگەن. لە لۆگۆ بۆ سۆشیال میدیا.',
    },
    whyMatters: {
      en: 'Strong visual branding sets Kurdistan businesses apart. A skilled graphic designer who understands local aesthetics, bilingual typography, and cultural context creates designs that truly resonate with your audience.',
      ar: 'العلامة التجارية البصرية القوية تميز الشركات في كردستان. مصمم جرافيك ماهر يفهم الجماليات المحلية والخط ثنائي اللغة.',
      ckb: 'براندی بینایی بەهێز بزنسەکانی کوردستان جیا دەکاتەوە. دیزاینەرێکی شارەزا کە لە جوانکاری ناوخۆیی و تایپۆگرافیای دوو زمانە تێدەگات.',
    },
    tips: {
      en: [
        'Look for experience with Arabic/Kurdish calligraphy',
        'Review their social media design portfolio',
        'Check if they understand print vs digital requirements',
        'Ask about brand identity packages (logo, colors, fonts)',
        'Ensure they can work with both LTR and RTL layouts',
      ],
      ckb: [
        'شارەزایی لە خەتی عەرەبی/کوردی ببینە',
        'پۆرتفۆلیۆی سۆشیال میدیایان ببینە',
        'تێگەیشتنیان لە چاپ و دیجیتاڵ بپشکنە',
        'پرسیار لەسەر پاکێجی براند (لۆگۆ، ڕەنگ، فۆنت) بکە',
        'دڵنیا بە لە کارکردنیان لەگەڵ LTR و RTL',
      ],
    },
    relatedCategories: ['technology'],
  },
  {
    slug: 'marketing-agencies',
    name: { en: 'Marketing Agencies', ar: 'وكالات التسويق', ckb: 'ئاژانسی مارکێتینگ' },
    description: {
      en: 'Discover the best marketing agencies helping Kurdistan businesses grow online. From social media management to SEO and paid ads, these agencies understand the local market.',
      ar: 'اكتشف أفضل وكالات التسويق التي تساعد شركات كردستان في النمو عبر الإنترنت. من إدارة وسائل التواصل الاجتماعي إلى تحسين محركات البحث.',
      ckb: 'باشترین ئاژانسەکانی مارکێتینگ بدۆزەرەوە کە یارمەتی بزنسەکانی کوردستان دەدەن بۆ گەشەکردن لە ئۆنلاین.',
    },
    whyMatters: {
      en: 'Digital marketing is essential for growth in Kurdistan\'s competitive market. A local agency understands Kurdish consumer behavior, seasonal trends, and which platforms your audience actually uses.',
      ar: 'التسويق الرقمي ضروري للنمو في سوق كردستان التنافسي. وكالة محلية تفهم سلوك المستهلك الكردي والاتجاهات الموسمية.',
      ckb: 'مارکێتینگی دیجیتاڵ پێویستە بۆ گەشەکردن لە بازاڕی ڕکابەریی کوردستان. ئاژانسی ناوخۆیی ڕەفتاری کڕیاری کوردی و ترێندەکان تێدەگات.',
    },
    tips: {
      en: [
        'Ask for case studies from Kurdistan-based clients',
        'Check if they manage Kurdish & Arabic content',
        'Verify they understand local platforms (Instagram, TikTok, Snapchat)',
        'Look for data-driven results, not just vanity metrics',
        'Ensure they offer reporting in a language you understand',
      ],
      ckb: [
        'داوای نموونەی کاری کوردستان بکە',
        'ببینە ئایا ناوەڕۆکی کوردی و عەرەبی بەڕێوە دەبەن',
        'تێگەیشتنیان لە پلاتفۆرمە ناوخۆییەکان بپشکنە',
        'بەدوای ئەنجامی ڕاستەقینەدا بگەڕێ',
        'ڕاپۆرتدان بە زمانی خۆت دابین بکەن',
      ],
    },
    relatedCategories: ['technology', 'trade-logistics'],
  },
  {
    slug: 'resume-writers',
    name: { en: 'Resume Writers', ar: 'كتّاب السيرة الذاتية', ckb: 'نووسەری سیڤی' },
    description: {
      en: 'Need help crafting the perfect CV? Find professional resume writers who specialize in Kurdistan\'s job market — from oil & gas to NGOs and government positions.',
      ar: 'تحتاج مساعدة في كتابة السيرة الذاتية المثالية؟ اعثر على كتّاب سير ذاتية متخصصين في سوق العمل في كردستان.',
      ckb: 'پێویستت بە یارمەتییە بۆ نووسینی سیڤییەکی تەواو؟ نووسەری سیڤی بدۆزەرەوە کە شارەزان لە بازاڕی کاری کوردستان.',
    },
    whyMatters: {
      en: 'A well-written resume is your ticket to interviews. Professional resume writers understand what Kurdistan employers look for, ATS systems used by international companies, and how to present your experience effectively in multiple languages.',
      ar: 'السيرة الذاتية المكتوبة بشكل جيد هي تذكرتك للمقابلات. كتّاب السير الذاتية المحترفون يفهمون ما يبحث عنه أصحاب العمل في كردستان.',
      ckb: 'سیڤییەکی باشنووسراو بلیتی چاوپێکەوتنەکانتە. نووسەری سیڤی پەسەندانە دەزانن خاوەنکارەکانی کوردستان بەدوای چیدا دەگەڕێن.',
    },
    tips: {
      en: [
        'Or try Work.krd — our AI writes your CV in Kurdish, Arabic & English',
        'Check if they know ATS optimization for international companies',
        'Ask for samples in your target language',
        'Verify they understand Kurdistan\'s industry terminology',
        'Look for writers with HR or recruitment background',
      ],
      ckb: [
        'یان Work.krd تاقی بکەرەوە — AI سیڤیت بە کوردی و عەرەبی و ئینگلیزی دەنووسێت',
        'بزانە ئایا ATS بۆ کۆمپانیا نێودەوڵەتییەکان دەزانن',
        'نموونەی کار بە زمانی ئامانجت داوا بکە',
        'تێگەیشتنیان لە زاراوەکانی پیشەسازی کوردستان',
        'نووسەرانی لەگەڵ پاشخانی HR یان دامەزراندن بگەڕێ',
      ],
    },
    relatedCategories: ['ngo-international', 'oil-and-gas'],
  },
  {
    slug: 'it-companies',
    name: { en: 'IT Companies', ar: 'شركات تكنولوجيا المعلومات', ckb: 'کۆمپانیای ئایتی' },
    description: {
      en: 'Find the best IT companies providing software development, network infrastructure, cybersecurity, and cloud services in Kurdistan. The tech sector is booming with local and international players.',
      ar: 'اعثر على أفضل شركات تكنولوجيا المعلومات التي تقدم تطوير البرمجيات والبنية التحتية للشبكات والأمن السيبراني في كردستان.',
      ckb: 'باشترین کۆمپانیای ئایتی بدۆزەرەوە کە سۆفتوێر و تۆڕ و ئەمنی سایبەری و خزمەتگوزاری کلاود لە کوردستان پێشکەش دەکەن.',
    },
    whyMatters: {
      en: 'Every business needs reliable IT infrastructure. Kurdistan\'s IT companies offer everything from custom software to managed services, often at competitive rates compared to regional alternatives.',
      ar: 'كل شركة تحتاج بنية تحتية تكنولوجية موثوقة. شركات تكنولوجيا المعلومات في كردستان تقدم كل شيء من البرمجيات المخصصة إلى الخدمات المدارة.',
      ckb: 'هەر بزنسێک پێویستی بە ئایتی متمانەپێکراوە هەیە. کۆمپانیای ئایتی کوردستان هەموو شتێک لە سۆفتوێری تایبەت بۆ خزمەتگوزاری بەڕێوەبردن پێشکەش دەکەن.',
    },
    tips: {
      en: [
        'Check their track record with local businesses',
        'Ask about support response times and SLAs',
        'Verify they have certifications (Microsoft, Cisco, AWS)',
        'Look for companies that offer bilingual support',
        'Ensure they understand local internet infrastructure limitations',
      ],
      ckb: [
        'ڕیکۆردی کاریان لەگەڵ بزنسی ناوخۆیی ببینە',
        'پرسیار لەسەر کاتی وەڵامدانەوە و SLA بکە',
        'بڕوانامەکانیان (مایکرۆسۆفت، سیسکۆ، AWS) بپشکنە',
        'کۆمپانیایەک بدۆزەرەوە کە پاڵپشتی دوو زمانە هەبێت',
        'تێگەیشتنیان لە سنووردارییەکانی ئینتەرنێتی ناوخۆیی',
      ],
    },
    relatedCategories: ['technology'],
  },
]

// Only generate pages for the 3 main cities
export const bestServiceCities = ['erbil', 'sulaymaniyah', 'duhok'] as const

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find((s) => s.slug === slug)
}

export function getAllServiceSlugs(): string[] {
  return services.map((s) => s.slug)
}
