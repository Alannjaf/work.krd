import type { ResumeData } from '@/types/resume'

export interface QuickStartTemplate {
  id: string
  icon: string
  data: ResumeData
}

const templates: QuickStartTemplate[] = [
  // ─── 1. Software Engineer / IT ───────────────────────────────────────
  {
    id: 'software-engineer',
    icon: 'Code2',
    data: {
      personal: {
        fullName: '',
        email: 'your.email@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/yourprofile',
        website: 'github.com/yourprofile',
        title: 'Software Engineer',
      },
      summary:
        'Results-driven software engineer with 5+ years of experience building scalable web applications and distributed systems. Proficient in modern JavaScript/TypeScript ecosystems and cloud-native development. Passionate about clean architecture, test-driven development, and mentoring junior engineers. Seeking to leverage full-stack expertise to deliver high-impact products at a forward-thinking organization.',
      experience: [
        {
          id: 'qs_se_exp_1',
          jobTitle: 'Senior Software Engineer',
          company: 'TechNova Solutions',
          location: 'San Francisco, CA',
          startDate: '2021-06',
          current: true,
          description:
            '<ul><li>Architected and led migration of legacy monolith to microservices, reducing deployment time by 70% and improving system uptime to 99.95%</li><li>Designed and implemented RESTful APIs serving 2M+ daily requests using Node.js, Express, and PostgreSQL with Redis caching</li><li>Mentored a team of 4 junior developers through code reviews, pair programming, and internal tech talks on TypeScript best practices</li><li>Introduced CI/CD pipelines with GitHub Actions and Docker, cutting release cycles from 2 weeks to daily deployments</li></ul>',
        },
        {
          id: 'qs_se_exp_2',
          jobTitle: 'Junior Software Developer',
          company: 'LaunchPad Startup',
          location: 'Austin, TX',
          startDate: '2019-01',
          endDate: '2021-05',
          current: false,
          description:
            '<ul><li>Built responsive front-end features using React and Redux, contributing to a 35% increase in user engagement</li><li>Developed and maintained Python-based data processing scripts that automated weekly reporting, saving 10+ hours per sprint</li><li>Collaborated with product and design teams in an agile environment to deliver features on 2-week sprint cycles</li><li>Wrote comprehensive unit and integration tests achieving 85% code coverage across the main application</li></ul>',
        },
      ],
      education: [
        {
          id: 'qs_se_edu_1',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          school: 'University of Texas at Austin',
          location: 'Austin, TX',
          startDate: '2015-09',
          endDate: '2019-05',
        },
      ],
      skills: [
        { id: 'qs_se_sk_1', name: 'JavaScript', level: 'Expert' },
        { id: 'qs_se_sk_2', name: 'TypeScript', level: 'Expert' },
        { id: 'qs_se_sk_3', name: 'React', level: 'Expert' },
        { id: 'qs_se_sk_4', name: 'Node.js', level: 'Advanced' },
        { id: 'qs_se_sk_5', name: 'Python', level: 'Intermediate' },
        { id: 'qs_se_sk_6', name: 'Git', level: 'Advanced' },
        { id: 'qs_se_sk_7', name: 'AWS', level: 'Intermediate' },
        { id: 'qs_se_sk_8', name: 'Docker', level: 'Intermediate' },
      ],
      languages: [
        { id: 'qs_se_lang_1', name: 'English', proficiency: 'Native' },
        { id: 'qs_se_lang_2', name: 'Arabic', proficiency: 'Basic' },
      ],
      projects: [
        {
          id: 'qs_se_proj_1',
          name: 'OpenTrack CLI',
          description:
            '<ul><li>Created an open-source command-line tool for tracking developer productivity metrics across Git repositories</li><li>Built with TypeScript and published to npm, reaching 1,200+ weekly downloads</li><li>Implemented plugin architecture allowing community-contributed metric providers</li></ul>',
          technologies: 'TypeScript, Node.js, Commander.js, Chart.js',
          link: 'github.com/yourprofile/opentrack-cli',
          startDate: '2023-03',
          endDate: '2023-08',
        },
      ],
      certifications: [
        {
          id: 'qs_se_cert_1',
          name: 'AWS Certified Developer - Associate',
          issuer: 'Amazon Web Services',
          date: '2023-02',
          expiryDate: '2026-02',
          credentialId: 'AWS-DEV-XXXXXX',
          url: 'aws.amazon.com/certification',
        },
      ],
    },
  },

  // ─── 2. Marketing / Sales ────────────────────────────────────────────
  {
    id: 'marketing-sales',
    icon: 'TrendingUp',
    data: {
      personal: {
        fullName: '',
        email: 'your.email@example.com',
        phone: '+1 (555) 234-5678',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/yourprofile',
        title: 'Marketing Manager',
      },
      summary:
        'Dynamic marketing professional with 6+ years of experience driving brand growth and revenue through data-driven digital strategies. Proven track record of managing multi-channel campaigns that increased lead generation by 45% and boosted conversion rates. Skilled at translating complex analytics into actionable insights for executive stakeholders. Adept at building cross-functional relationships to align marketing initiatives with business objectives.',
      experience: [
        {
          id: 'qs_ms_exp_1',
          jobTitle: 'Marketing Manager',
          company: 'BrightWave Media',
          location: 'New York, NY',
          startDate: '2022-03',
          current: true,
          description:
            '<ul><li>Managed a $500K annual digital marketing budget across paid search, social media, and email channels, achieving a 3.2x return on ad spend</li><li>Developed and executed content marketing strategy that grew organic traffic by 60% and generated 2,000+ qualified leads per quarter</li><li>Led rebranding initiative including messaging framework, visual identity refresh, and website overhaul, resulting in 25% increase in brand awareness</li><li>Built and managed a team of 3 marketing specialists and 2 freelance content creators</li></ul>',
        },
        {
          id: 'qs_ms_exp_2',
          jobTitle: 'Marketing Coordinator',
          company: 'Apex Consumer Brands',
          location: 'Chicago, IL',
          startDate: '2018-09',
          endDate: '2022-02',
          current: false,
          description:
            '<ul><li>Coordinated product launch campaigns for 4 new SKUs, contributing to $1.2M in first-year revenue</li><li>Managed social media accounts across Instagram, LinkedIn, and Twitter, growing combined following from 12K to 48K</li><li>Created monthly performance reports using Google Analytics and HubSpot, identifying opportunities that improved email open rates by 18%</li><li>Organized 6 industry trade shows and events annually, handling logistics, booth design, and post-event lead nurturing</li></ul>',
        },
      ],
      education: [
        {
          id: 'qs_ms_edu_1',
          degree: 'Bachelor of Arts',
          field: 'Marketing',
          school: 'University of Illinois at Chicago',
          location: 'Chicago, IL',
          startDate: '2014-09',
          endDate: '2018-05',
        },
      ],
      skills: [
        { id: 'qs_ms_sk_1', name: 'Digital Marketing', level: 'Expert' },
        { id: 'qs_ms_sk_2', name: 'SEO', level: 'Advanced' },
        { id: 'qs_ms_sk_3', name: 'Google Analytics', level: 'Expert' },
        { id: 'qs_ms_sk_4', name: 'Social Media Marketing', level: 'Expert' },
        { id: 'qs_ms_sk_5', name: 'Content Strategy', level: 'Advanced' },
        { id: 'qs_ms_sk_6', name: 'CRM', level: 'Intermediate' },
        { id: 'qs_ms_sk_7', name: 'HubSpot', level: 'Advanced' },
        { id: 'qs_ms_sk_8', name: 'Data Analysis', level: 'Intermediate' },
      ],
      languages: [
        { id: 'qs_ms_lang_1', name: 'English', proficiency: 'Native' },
        { id: 'qs_ms_lang_2', name: 'Spanish', proficiency: 'Conversational' },
      ],
    },
  },

  // ─── 3. Fresh Graduate ───────────────────────────────────────────────
  {
    id: 'fresh-graduate',
    icon: 'GraduationCap',
    data: {
      personal: {
        fullName: '',
        email: 'your.email@example.com',
        phone: '+1 (555) 345-6789',
        location: 'Boston, MA',
        linkedin: 'linkedin.com/in/yourprofile',
        title: 'Recent Graduate',
      },
      summary:
        'Enthusiastic and detail-oriented recent graduate with a strong foundation in business principles and hands-on internship experience. Demonstrated ability to manage projects, analyze data, and communicate effectively across teams. Eager to apply academic knowledge and fresh perspectives to a challenging entry-level role in a growth-oriented organization.',
      experience: [
        {
          id: 'qs_fg_exp_1',
          jobTitle: 'Business Operations Intern',
          company: 'Horizon Consulting Group',
          location: 'Boston, MA',
          startDate: '2024-06',
          endDate: '2024-12',
          current: false,
          description:
            '<ul><li>Assisted in analyzing operational workflows for 3 client engagements, identifying process improvements that reduced overhead costs by 12%</li><li>Prepared weekly data reports and presentation decks for senior consultants using Excel, PowerPoint, and Tableau</li><li>Conducted competitive market research for a client in the retail sector, compiling findings into a 30-page strategy brief</li><li>Participated in client meetings and contributed to brainstorming sessions for new service offerings</li></ul>',
        },
      ],
      education: [
        {
          id: 'qs_fg_edu_1',
          degree: 'Bachelor of Science',
          field: 'Business Administration',
          school: 'Boston University',
          location: 'Boston, MA',
          startDate: '2021-09',
          endDate: '2025-05',
          gpa: '3.7 / 4.0',
          achievements:
            "<ul><li>Dean's List for 6 consecutive semesters</li><li>Vice President of the Entrepreneurship Club, organized 4 campus networking events with 100+ attendees each</li><li>Relevant coursework: Financial Accounting, Business Analytics, Organizational Behavior, Marketing Strategy</li></ul>",
        },
      ],
      skills: [
        { id: 'qs_fg_sk_1', name: 'Microsoft Office', level: 'Advanced' },
        { id: 'qs_fg_sk_2', name: 'Communication', level: 'Advanced' },
        { id: 'qs_fg_sk_3', name: 'Teamwork', level: 'Advanced' },
        { id: 'qs_fg_sk_4', name: 'Problem Solving', level: 'Intermediate' },
        { id: 'qs_fg_sk_5', name: 'Time Management', level: 'Advanced' },
        { id: 'qs_fg_sk_6', name: 'Basic Programming', level: 'Beginner' },
      ],
      languages: [
        { id: 'qs_fg_lang_1', name: 'English', proficiency: 'Native' },
        { id: 'qs_fg_lang_2', name: 'French', proficiency: 'Basic' },
      ],
      projects: [
        {
          id: 'qs_fg_proj_1',
          name: 'Campus Food Delivery App - Capstone Project',
          description:
            '<ul><li>Led a 5-person team to design and prototype a mobile food delivery app tailored for university campuses</li><li>Conducted user research with 120+ students and developed personas, user journeys, and wireframes</li><li>Presented final business plan and clickable prototype to a panel of faculty and industry judges, earning top marks</li></ul>',
          technologies: 'Figma, Google Sheets, Canva, Trello',
          startDate: '2024-09',
          endDate: '2025-04',
        },
      ],
    },
  },

  // ─── 4. Business / Management ────────────────────────────────────────
  {
    id: 'business-management',
    icon: 'Briefcase',
    data: {
      personal: {
        fullName: '',
        email: 'your.email@example.com',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        linkedin: 'linkedin.com/in/yourprofile',
        title: 'Operations Manager',
      },
      summary:
        'Strategic operations manager with 8+ years of experience optimizing business processes and leading cross-functional teams of up to 25 people. Proven ability to reduce operational costs by 20%+ while improving service delivery and customer satisfaction. Adept at leveraging data analytics and lean methodologies to drive continuous improvement. Seeking a senior leadership role to scale operational excellence across a growing enterprise.',
      experience: [
        {
          id: 'qs_bm_exp_1',
          jobTitle: 'Operations Manager',
          company: 'Pinnacle Logistics Inc.',
          location: 'Seattle, WA',
          startDate: '2021-01',
          current: true,
          description:
            '<ul><li>Oversee daily operations of a 25-person fulfillment center processing 5,000+ orders per day with a 99.7% accuracy rate</li><li>Implemented lean workflow redesign that reduced order processing time by 30% and saved $400K annually in labor costs</li><li>Manage a $3.2M annual operating budget, consistently delivering under budget while meeting all performance KPIs</li><li>Spearheaded adoption of SAP inventory management system, reducing stock discrepancies by 85%</li></ul>',
        },
        {
          id: 'qs_bm_exp_2',
          jobTitle: 'Business Analyst',
          company: 'Summit Financial Services',
          location: 'Portland, OR',
          startDate: '2017-06',
          endDate: '2020-12',
          current: false,
          description:
            '<ul><li>Analyzed business processes across 4 departments, producing actionable recommendations that improved cross-team efficiency by 22%</li><li>Developed financial models and forecasting dashboards in Excel and Power BI, used by C-suite for quarterly planning</li><li>Led requirements gathering and UAT for a CRM migration project serving 150+ internal users</li><li>Facilitated weekly stakeholder meetings to align project deliverables with strategic business objectives</li></ul>',
        },
      ],
      education: [
        {
          id: 'qs_bm_edu_1',
          degree: 'Master of Business Administration',
          field: 'Operations Management',
          school: 'University of Washington',
          location: 'Seattle, WA',
          startDate: '2019-09',
          endDate: '2021-06',
        },
      ],
      skills: [
        { id: 'qs_bm_sk_1', name: 'Strategic Planning', level: 'Expert' },
        { id: 'qs_bm_sk_2', name: 'Budget Management', level: 'Expert' },
        { id: 'qs_bm_sk_3', name: 'Team Leadership', level: 'Expert' },
        { id: 'qs_bm_sk_4', name: 'Process Improvement', level: 'Advanced' },
        { id: 'qs_bm_sk_5', name: 'Data Analysis', level: 'Advanced' },
        { id: 'qs_bm_sk_6', name: 'Stakeholder Management', level: 'Advanced' },
        { id: 'qs_bm_sk_7', name: 'Project Management', level: 'Advanced' },
        { id: 'qs_bm_sk_8', name: 'SAP', level: 'Intermediate' },
      ],
      languages: [
        { id: 'qs_bm_lang_1', name: 'English', proficiency: 'Native' },
        { id: 'qs_bm_lang_2', name: 'Mandarin', proficiency: 'Fluent' },
      ],
      certifications: [
        {
          id: 'qs_bm_cert_1',
          name: 'Project Management Professional (PMP)',
          issuer: 'Project Management Institute',
          date: '2022-05',
          expiryDate: '2025-05',
          credentialId: 'PMP-XXXXXX',
          url: 'pmi.org/certifications',
        },
      ],
    },
  },

  // ─── 5. Creative / Design ────────────────────────────────────────────
  {
    id: 'creative-design',
    icon: 'Palette',
    data: {
      personal: {
        fullName: '',
        email: 'your.email@example.com',
        phone: '+1 (555) 567-8901',
        location: 'Los Angeles, CA',
        linkedin: 'linkedin.com/in/yourprofile',
        website: 'yourportfolio.design',
        title: 'Graphic Designer',
      },
      summary:
        'Creative and versatile graphic designer with 5+ years of experience crafting compelling visual identities, marketing collateral, and digital experiences. Strong expertise in brand strategy, UI/UX design, and motion graphics for both print and digital media. Known for translating abstract client briefs into polished, on-brand deliverables under tight deadlines. Portfolio includes work for Fortune 500 clients and award-winning independent campaigns.',
      experience: [
        {
          id: 'qs_cd_exp_1',
          jobTitle: 'Senior Graphic Designer',
          company: 'Vivid Creative Agency',
          location: 'Los Angeles, CA',
          startDate: '2022-02',
          current: true,
          description:
            '<ul><li>Lead visual design for 10+ client accounts across tech, fashion, and hospitality industries, delivering 50+ projects annually</li><li>Developed comprehensive brand identity systems including logos, color palettes, typography guides, and brand books for 6 clients</li><li>Designed UI mockups and interactive prototypes in Figma for 3 web and mobile applications, collaborating closely with development teams</li><li>Created motion graphics and social media content that increased client engagement rates by an average of 40%</li></ul>',
        },
        {
          id: 'qs_cd_exp_2',
          jobTitle: 'Junior Graphic Designer',
          company: 'Mosaic Design Studio',
          location: 'San Diego, CA',
          startDate: '2019-07',
          endDate: '2022-01',
          current: false,
          description:
            '<ul><li>Produced print and digital marketing materials including brochures, banners, email templates, and social media graphics for 15+ clients</li><li>Assisted in rebranding a regional restaurant chain, designing new menus, signage, packaging, and a 20-page brand guidelines document</li><li>Managed asset libraries and maintained design system components, improving team workflow efficiency by 25%</li><li>Presented design concepts to clients in weekly review meetings, incorporating feedback across 2-3 revision rounds</li></ul>',
        },
      ],
      education: [
        {
          id: 'qs_cd_edu_1',
          degree: 'Bachelor of Fine Arts',
          field: 'Graphic Design',
          school: 'California Institute of the Arts',
          location: 'Valencia, CA',
          startDate: '2015-09',
          endDate: '2019-05',
        },
      ],
      skills: [
        { id: 'qs_cd_sk_1', name: 'Adobe Photoshop', level: 'Expert' },
        { id: 'qs_cd_sk_2', name: 'Adobe Illustrator', level: 'Expert' },
        { id: 'qs_cd_sk_3', name: 'Adobe InDesign', level: 'Advanced' },
        { id: 'qs_cd_sk_4', name: 'Figma', level: 'Expert' },
        { id: 'qs_cd_sk_5', name: 'UI/UX Design', level: 'Advanced' },
        { id: 'qs_cd_sk_6', name: 'Typography', level: 'Expert' },
        { id: 'qs_cd_sk_7', name: 'Brand Identity', level: 'Advanced' },
        { id: 'qs_cd_sk_8', name: 'Motion Graphics', level: 'Intermediate' },
      ],
      languages: [
        { id: 'qs_cd_lang_1', name: 'English', proficiency: 'Native' },
        { id: 'qs_cd_lang_2', name: 'Portuguese', proficiency: 'Fluent' },
      ],
      projects: [
        {
          id: 'qs_cd_proj_1',
          name: 'GreenLeaf Brand Identity Redesign',
          description:
            '<ul><li>Conceptualized and executed a complete brand refresh for an eco-friendly consumer goods company, including logo, packaging, and website</li><li>Designed a cohesive visual system across 30+ SKUs that increased shelf visibility and contributed to a 15% sales uplift</li><li>Created animated brand story video for social media launch campaign, reaching 500K+ views in the first month</li></ul>',
          technologies: 'Illustrator, Photoshop, After Effects, Figma',
          link: 'yourportfolio.design/greenleaf',
          startDate: '2023-06',
          endDate: '2023-11',
        },
      ],
    },
  },
]

/**
 * Returns all 5 quick-start resume templates.
 */
export function getQuickStartTemplates(): QuickStartTemplate[] {
  return templates
}

/**
 * Returns a single quick-start template by ID, or undefined if not found.
 */
export function getQuickStartTemplate(id: string): QuickStartTemplate | undefined {
  return templates.find((t) => t.id === id)
}
