import OpenAI from "openai";

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://resumeai.app", // Your site URL for rankings
    "X-Title": "ResumeAI", // Your site title for rankings
  },
});

export interface AIGenerationOptions {
  jobTitle?: string;
  industry?: string;
  experience?: string;
  skills?: string[];
  language?: "en" | "ar" | "ku" | "auto";
}

export class AIService {
  static async generateProfessionalSummary(
    options: AIGenerationOptions
  ): Promise<string> {
    const {
      jobTitle = "",
      industry = "",
      experience = "",
      skills = [],
      language = "en",
    } = options;

    const languageInstructions: Record<string, string> = {
      en: "Write in English",
      ar: "Write in Arabic with proper RTL formatting",
      ku: "Write in Kurdish Sorani (کوردی سۆرانی)",
      auto: "Detect the language of the input fields (job title, industry, experience) and write the summary in that same language. If the input is in Kurdish Sorani, respond in Kurdish Sorani. If Arabic, respond in Arabic. If English or unclear, respond in English.",
    };

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional resume writer specializing in creating compelling professional summaries. Always follow the language requirements and formatting guidelines exactly.`,
      },
      {
        role: "user" as const,
        content: `Generate a professional resume summary for the following profile:
- Job Title: ${jobTitle}
- Industry: ${industry}
- Experience Level: ${experience}
- Key Skills: ${skills.join(", ")}

Requirements:
- ${languageInstructions[language] || languageInstructions['auto']}
- 3-4 punchy lines (concise, impactful statements)
- Condense information to avoid redundancy
- Focus on years of experience and top-tier achievements
- Use action-oriented language
- Highlight relevant skills and experience
- Make it ATS-friendly
- Sound professional but not overly formal

Please provide only the summary text without any additional formatting or explanations.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error('[AI] Failed to generate summary:', error);
      throw new Error("Failed to generate professional summary");
    }
  }

  static async enhanceJobDescription(
    originalDescription: string,
    jobTitle: string,
    options: AIGenerationOptions
  ): Promise<string> {
    const { language = "en" } = options;

    const languageInstructions: Record<string, string> = {
      en: "Write in English",
      ar: "Write in Arabic with proper RTL formatting",
      ku: "Write in Kurdish Sorani (کوردی سۆرانی)",
      auto: "Detect the language of the job title and any existing description, then write in that same language. If Kurdish, write in Kurdish Sorani. If Arabic, write in Arabic. If English or unclear, write in English.",
    };

    const hasDescription = originalDescription && originalDescription.trim();
    const taskInstruction = hasDescription
      ? `Enhance the following job description to make it more impactful and ATS-friendly:\n\nOriginal Description: "${originalDescription}"\nJob Title: ${jobTitle}`
      : `Generate a professional job description for the following role:\n\nJob Title: ${jobTitle}`;

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional resume writer who creates and enhances job descriptions to make them impactful and ATS-friendly. Always use proper bullet formatting with "• " (bullet + space).`,
      },
      {
        role: "user" as const,
        content: `${taskInstruction}

Requirements:
- ${languageInstructions[language] || languageInstructions['auto']}
- Use strong action verbs
- Quantify achievements where possible (e.g., "Increased efficiency by 30%")
- Add relevant keywords for ATS optimization
- Format as bullet points using "•" (bullet symbol), NOT asterisks (*)
- Keep each bullet point concise (1-2 lines maximum)
- Focus on accomplishments and results rather than basic duties
- Make it sound professional and impressive
- Start each bullet point with "• " followed by the content
- Generate 3-5 bullet points

IMPORTANT: Use only "• " (bullet + space) to start each point, never use "*" or "-" or numbers.

Please provide only the description without any additional formatting or explanations.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 400,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error('[AI] Failed to enhance job description:', error);
      throw new Error("Failed to enhance job description");
    }
  }

  static async generateSkillSuggestions(
    jobTitle: string,
    industry: string,
    options: AIGenerationOptions
  ): Promise<string[]> {
    const { language = "en" } = options;

    const languageInstructions: Record<string, string> = {
      en: "Provide skills in English",
      ar: "Provide skills in Arabic",
      ku: "Provide skills in Kurdish Sorani",
    };

    const messages = [
      {
        role: "system" as const,
        content: `You are a career advisor who suggests relevant skills for specific job roles. Provide only skill names, one per line.`,
      },
      {
        role: "user" as const,
        content: `Suggest 8-12 relevant skills for the following position:
- Job Title: ${jobTitle}
- Industry: ${industry}

Requirements:
- ${languageInstructions[language]}
- Include both technical and soft skills
- Make them specific and relevant to the role
- Include current industry trends
- Make them ATS-friendly keywords
- Provide only the skill names, one per line
- No descriptions or explanations

Format: Return only skill names separated by newlines.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 300,
        temperature: 0.6,
      });

      const skillsText = completion.choices[0]?.message?.content?.trim() || "";
      return skillsText
        .split("\n")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
    } catch (error) {
      console.error('[AI] Failed to generate skill suggestions:', error);
      throw new Error("Failed to generate skill suggestions");
    }
  }

  static async generateBulletPoints(
    jobTitle: string,
    company: string,
    industry: string,
    options: AIGenerationOptions
  ): Promise<string[]> {
    const { language = "en" } = options;

    const languageInstructions: Record<string, string> = {
      en: "Write in English",
      ar: "Write in Arabic with proper RTL formatting",
      ku: "Write in Kurdish Sorani",
    };

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional resume writer who creates impactful bullet points for work experience sections. Always use "• " (bullet + space) formatting.`,
      },
      {
        role: "user" as const,
        content: `Generate 3-5 impactful bullet points for a resume work experience section:
- Job Title: ${jobTitle}
- Company: ${company}
- Industry: ${industry}

Requirements:
- ${languageInstructions[language]}
- Start each bullet with strong action verbs (e.g., "Developed", "Led", "Implemented")
- Include quantifiable achievements where appropriate (e.g., percentages, numbers)
- Make them ATS-friendly with relevant keywords
- Focus on results and impact, not just duties
- Keep each bullet point to 1-2 lines maximum
- Use present tense for current roles, past tense for previous roles

FORMATTING REQUIREMENTS:
- Start each bullet point with "• " (bullet symbol + space)
- Do NOT use "*", "-", or numbers
- One bullet point per line
- No additional text or explanations

Example format:
• Developed and implemented new software features
• Led cross-functional team of 8 developers
• Increased system performance by 40%`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 400,
        temperature: 0.7,
      });

      const bulletsText = completion.choices[0]?.message?.content?.trim() || "";
      return bulletsText
        .split("\n")
        .map((bullet) => bullet.replace(/^[•\-\*]\s*/, "").trim())
        .filter((bullet) => bullet.length > 0);
    } catch (error) {
      console.error('[AI] Failed to generate bullets:', error);
      throw new Error("Failed to generate bullet points");
    }
  }

  static async improveContent(
    content: string,
    contentType: "summary" | "description" | "achievement",
    options: AIGenerationOptions
  ): Promise<string> {
    const { language = "en" } = options;

    const languageInstructions: Record<string, string> = {
      en: "Write in English",
      ar: "Write in Arabic with proper RTL formatting",
      ku: "Write in Kurdish Sorani",
    };

    const typeInstructions = {
      summary: "professional summary",
      description: "job description",
      achievement: "achievement or accomplishment",
    };

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional resume writer who improves content to make it more impactful and ATS-friendly.`,
      },
      {
        role: "user" as const,
        content: `Improve the following ${typeInstructions[contentType]} for a resume:

Original Content: "${content}"

Requirements:
- ${languageInstructions[language]}
- Make it more impactful and professional
- Use stronger action verbs
- Add quantifiable elements where appropriate
- Make it ATS-friendly
- Keep the same general meaning but improve the expression
- Ensure proper grammar and clarity

Please provide only the improved content without any additional formatting or explanations.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, or other symbols. Provide plain text only.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error('[AI] Failed to improve content:', error);
      throw new Error("Failed to improve content");
    }
  }

  static async translateToEnglish(
    content: string,
    sourceLanguage: "ar" | "ku" | "auto" = "auto"
  ): Promise<string> {
    const languageNames = {
      ar: "Arabic",
      ku: "Kurdish Sorani",
      auto: "the source language",
    };

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional translator specializing in translating resume content from Arabic and Kurdish to English. Always maintain the professional tone and meaning.`,
      },
      {
        role: "user" as const,
        content: `Translate the following text from ${languageNames[sourceLanguage]} to English:

"${content}"

Requirements:
- Maintain professional resume language
- Preserve the original meaning and intent
- Use proper grammar and professional vocabulary
- Make it suitable for English-speaking employers
- If it's a job description or achievement, use professional resume language
- Keep the same structure and format

Please provide only the English translation without any additional formatting or explanations.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, or other symbols. Provide plain text only.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 400,
        temperature: 0.3, // Lower temperature for more consistent translation
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error('[AI] Failed to translate content:', error);
      throw new Error("Failed to translate content");
    }
  }

  static async translateAndEnhance(
    content: string,
    contentType:
      | "personal"
      | "summary"
      | "description"
      | "achievement"
      | "project",
    sourceLanguage: "ar" | "ku" | "auto" = "auto",
    contextInfo?: {
      jobTitle?: string;
      company?: string;
      projectName?: string;
    }
  ): Promise<string> {
    const languageNames = {
      ar: "Arabic",
      ku: "Kurdish Sorani",
      auto: "the source language",
    };

    const typeInstructions = {
      personal:
        "personal information (like professional title, location, etc.)",
      summary: "professional summary for resume",
      description: "job description or role responsibilities",
      achievement: "achievement or accomplishment",
      project: "project description",
    };

    const contextText = contextInfo
      ? `
Context Information:
${contextInfo.jobTitle ? `- Job Title: ${contextInfo.jobTitle}` : ""}
${contextInfo.company ? `- Company: ${contextInfo.company}` : ""}
${contextInfo.projectName ? `- Project: ${contextInfo.projectName}` : ""}
`
      : "";

    const wordCount = content.trim().split(/\s+/).length;
    const isShortContent = wordCount <= 5;

    const messages = [
      {
        role: "system" as const,
        content: `You are a professional resume writer and translator. You specialize in translating resume content from Arabic/Kurdish to English and then enhancing it to make it professional and ATS-friendly.`,
      },
      {
        role: "user" as const,
        content: `Translate and enhance the following ${typeInstructions[contentType]} from ${languageNames[sourceLanguage]} to professional English:

"${content}"
${contextText}
Requirements:
1. TRANSLATION: First translate accurately to English maintaining the original meaning
2. ENHANCEMENT: Then improve the English version to be:
   - Professional and polished for resume use
   - ATS-friendly with relevant keywords
   - Use strong action verbs where appropriate
   - Include quantifiable elements if possible
   - Proper grammar and professional vocabulary
   - Suitable for English-speaking employers

CRITICAL LENGTH REQUIREMENT:
${
  isShortContent
    ? `- The input has EXACTLY ${wordCount} word(s). You MUST return EXACTLY ${wordCount} word(s).
- If the input is a single word (like a nationality, country, or title), return ONLY the direct translation.
- DO NOT add articles (a, an, the), prepositions, or any extra words.
- Examples: "العراق" → "Iraq" (NOT "The Republic of Iraq"), "مهندس" → "Engineer" (NOT "Software Engineer")`
    : `- Maintain approximately the same length as the original content.
- Do not significantly expand or reduce the content length.`
}

${contentType === "description" ? '- Format as bullet points using "• " if it contains multiple achievements or responsibilities' : ""}
${contentType === "project" ? "- Focus on technical achievements and impact" : ""}

Please provide only the final enhanced English version without showing the translation steps or any additional explanations.

IMPORTANT: Do NOT use any markdown formatting like **bold**, *italic*, or other symbols. Provide plain text only.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 500,
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error('[AI] Failed to translate and enhance content:', error);
      throw new Error("Failed to translate and enhance content");
    }
  }

  static async analyzeATSScore(resumeData: {
    personal: {
      fullName?: string;
      email?: string;
      phone?: string;
      title?: string;
      location?: string;
      linkedin?: string;
      website?: string;
    };
    summary?: string;
    experience?: Array<{
      jobTitle?: string;
      company?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }>;
    education?: Array<{
      degree?: string;
      field?: string;
      school?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
    }>;
    skills?: Array<{ name?: string }>;
    languages?: Array<{
      name?: string;
      proficiency?: string;
    }>;
    projects?: Array<{
      name?: string;
      description?: string;
      technologies?: string;
    }>;
    certifications?: Array<{
      name?: string;
      issuer?: string;
      date?: string;
      credentialId?: string;
    }>;
  }): Promise<{
    score: number;
    issues: Array<{
      type: string;
      severity: "high" | "medium" | "low";
      message: string;
      suggestion: string;
      section:
        | "personal"
        | "summary"
        | "experience"
        | "education"
        | "skills"
        | "languages"
        | "projects"
        | "certifications"
        | "general";
    }>;
    strengths: string[];
    suggestions: string[];
  }> {
    // Helper to strip HTML tags and convert to plain text
    const stripHtml = (html?: string): string => {
      if (!html) return "";
      return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    };

    // Helper to format date range for experience
    const formatDateRange = (
      startDate?: string,
      endDate?: string,
      current?: boolean
    ): string => {
      if (!startDate) return "";
      const start = startDate;
      const end = current ? "Present" : endDate || "Present";
      return ` (${start} - ${end})`;
    };

    // Helper to format date range for education
    const formatEducationDateRange = (
      startDate?: string,
      endDate?: string
    ): string => {
      if (!startDate && !endDate) return "";
      const start = startDate || "Unknown";
      const end = endDate || "Unknown";
      return ` (${start} - ${end})`;
    };

    const resumeText = `
Name: ${resumeData.personal?.fullName || "Not provided"}
Email: ${resumeData.personal?.email || "Not provided"}
Phone: ${resumeData.personal?.phone || "Not provided"}
Job Title: ${resumeData.personal?.title || "Not provided"}
${resumeData.personal?.location ? `Location: ${resumeData.personal.location}` : ""}
${resumeData.personal?.linkedin ? `LinkedIn: ${resumeData.personal.linkedin}` : ""}
${resumeData.personal?.website ? `Website: ${resumeData.personal.website}` : ""}

Summary: ${stripHtml(resumeData.summary) || "Not provided"}

Experience:
${resumeData.experience?.length ? resumeData.experience.map((exp) => `- ${exp.jobTitle || "No title"} at ${exp.company || "No company"}${formatDateRange(exp.startDate, exp.endDate, exp.current)}: ${stripHtml(exp.description) || "No description"}`).join("\n") : "No experience listed"}

Education:
${resumeData.education?.length ? resumeData.education.map((edu) => `- ${edu.degree || "No degree"}${edu.field ? ` in ${edu.field}` : ""} from ${edu.school || "No institution"}${edu.location ? `, ${edu.location}` : ""}${formatEducationDateRange(edu.startDate, edu.endDate)}`).join("\n") : "No education listed"}

Skills:
${
  resumeData.skills
    ?.map((skill) => skill.name)
    .filter(Boolean)
    .join(", ") || "No skills listed"
}

Languages:
${resumeData.languages?.length ? resumeData.languages.map((lang) => `- ${lang.name || "Unknown"}${lang.proficiency ? ` (${lang.proficiency})` : ""}`).join("\n") : "No languages listed"}

Projects:
${resumeData.projects?.length ? resumeData.projects.map((proj) => `- ${proj.name || "Unnamed project"}${proj.technologies ? ` - ${proj.technologies}` : ""}: ${stripHtml(proj.description) || "No description"}`).join("\n") : "No projects listed"}

Certifications:
${resumeData.certifications?.length ? resumeData.certifications.map((cert) => `- ${cert.name || "Unnamed certification"} from ${cert.issuer || "Unknown issuer"}${cert.date ? ` (${cert.date})` : ""}${cert.credentialId ? ` - ID: ${cert.credentialId}` : ""}`).join("\n") : "No certifications listed"}
`;

    const messages = [
      {
        role: "system" as const,
        content: `You are an ATS (Applicant Tracking System) expert who analyzes resumes for ATS compatibility. You handle resumes in English, Arabic, and Kurdish (Sorani). You must respond in valid JSON format only.`,
      },
      {
        role: "user" as const,
        content: `Analyze this resume for ATS compatibility and provide a detailed assessment:

${resumeText}

Respond with a JSON object containing:
{
  "score": <number 0-100>,
  "issues": [
    {
      "type": "<format|content|keywords|structure>",
      "severity": "<high|medium|low>",
      "message": "<what the issue is>",
      "suggestion": "<how to fix it>",
      "section": "<personal|summary|experience|education|skills|languages|projects|certifications|general>"
    }
  ],
  "strengths": ["<list of positive ATS-friendly aspects>"],
  "suggestions": ["<top 3-5 improvement suggestions>"]
}

Evaluation criteria:
1. Contact information completeness (10 points)
2. Professional summary presence and quality (15 points)
3. Work experience with quantifiable achievements (25 points)
4. Skills section with relevant keywords (20 points)
5. Education section completeness (10 points)
6. Overall structure and formatting (10 points)
7. Use of action verbs and professional language (10 points)

IMPORTANT RULES:
- Return ONLY the JSON object, no markdown formatting, no code blocks, no explanations.
- DO NOT penalize resumes for being written in Arabic or Kurdish. Non-English resumes are perfectly valid.
- If the resume is entirely in Arabic/Kurdish, suggest adding an English version as an optional improvement, not a required fix.
- When checking for action verbs and professional language, evaluate quality in the resume's own language.
- Provide all feedback messages and suggestions in English (the UI handles translation).
- DO NOT flag date format inconsistencies as issues. The platform uses a consistent date format, so date formatting is not a concern.
- DO NOT flag formatting, structure, or organization issues related to bullet points, lists, labels, section headers, or text organization. The platform automatically formats content appropriately (e.g., bullet points are handled automatically, labels like "Key Responsibilities" are formatted by the system).
- Before flagging skills as missing from the Skills section, ALWAYS verify they are NOT already listed in the Skills section.
- Only flag skills mentioned in the summary or experience as missing if they are genuinely absent from the Skills section.
- Cross-reference the Skills section content before suggesting additions to avoid false positives.
- Each issue MUST include a "section" field indicating which resume section it relates to.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1500,
        temperature: 0.3,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || "";

      // Clean up the response in case it has markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const result = JSON.parse(cleanedResponse);
      return {
        score: Math.max(0, Math.min(100, result.score || 0)),
        issues: result.issues || [],
        strengths: result.strengths || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error('[AI] Failed to analyze ATS score:', error);
      throw new Error("Failed to analyze ATS score");
    }
  }

  static async matchKeywords(
    resumeData: {
      personal: { fullName?: string; title?: string };
      summary?: string;
      experience?: Array<{ jobTitle?: string; description?: string }>;
      skills?: Array<{ name?: string }>;
    },
    jobDescription: string
  ): Promise<{
    matchScore: number;
    matchedKeywords: Array<{
      keyword: string;
      found: boolean;
      importance: "critical" | "important" | "nice-to-have";
    }>;
    missingKeywords: Array<{
      keyword: string;
      importance: "critical" | "important" | "nice-to-have";
      suggestion: string;
      section:
        | "personal"
        | "summary"
        | "experience"
        | "education"
        | "skills"
        | "languages"
        | "projects"
        | "certifications"
        | "general";
    }>;
    suggestions: string[];
  }> {
    // Helper to strip HTML tags and convert to plain text
    const stripHtml = (html?: string): string => {
      if (!html) return "";
      return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    };

    const resumeText = `
Job Title: ${resumeData.personal?.title || "Not specified"}
Summary: ${stripHtml(resumeData.summary) || ""}
Experience: ${resumeData.experience?.map((exp) => `${exp.jobTitle}: ${stripHtml(exp.description)}`).join("; ") || ""}
Skills: ${
      resumeData.skills
        ?.map((skill) => skill.name)
        .filter(Boolean)
        .join(", ") || ""
    }
`;

    const messages = [
      {
        role: "system" as const,
        content: `You are an ATS keyword matching expert who compares resumes against job descriptions across languages (English, Arabic, Kurdish). You match keywords semantically — a skill written in Arabic/Kurdish counts as a match for its English equivalent. You must respond in valid JSON format only.`,
      },
      {
        role: "user" as const,
        content: `Compare this resume against the job description and identify keyword matches:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond with a JSON object containing:
{
  "matchScore": <number 0-100>,
  "matchedKeywords": [
    {
      "keyword": "<keyword from job description>",
      "found": true,
      "importance": "<critical|important|nice-to-have>"
    }
  ],
  "missingKeywords": [
    {
      "keyword": "<missing keyword>",
      "importance": "<critical|important|nice-to-have>",
      "suggestion": "<how to incorporate this keyword>",
      "section": "<personal|summary|experience|education|skills|languages|projects|certifications|general>"
    }
  ],
  "suggestions": ["<top 3-5 suggestions to improve keyword match>"]
}

Guidelines:
1. Extract key skills, technologies, qualifications, and requirements from the job description
2. Check if each keyword exists in the resume (exact or semantic match)
3. Rate importance: critical (required qualifications), important (preferred), nice-to-have (bonus)
4. Calculate match score based on how many critical/important keywords are matched
5. Provide actionable suggestions for missing keywords
6. Each missing keyword MUST include a "section" field indicating the best resume section to add it to (skills for technical skills, experience for job duties, etc.)
7. Match keywords SEMANTICALLY across languages — 'برنامەنووسی' (Kurdish for programming) matches 'programming', 'برمجة' (Arabic) matches 'programming'
8. If resume and job description are in different languages, still match equivalent skills/qualifications
9. Provide all feedback messages and suggestions in English

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no explanations.`,
      },
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || "";

      // Clean up the response in case it has markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const result = JSON.parse(cleanedResponse);
      return {
        matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
        matchedKeywords: result.matchedKeywords || [],
        missingKeywords: result.missingKeywords || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error('[AI] Failed to match keywords:', error);
      throw new Error("Failed to match keywords");
    }
  }
}
