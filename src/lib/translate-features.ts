interface TranslationFunction {
  (key: string, values?: Record<string, string | number>): string
}

export function translatePlanFeatures(features: string[], t: TranslationFunction, keyPrefix: string = 'pricing'): string[] {
  return features.map(feature => {
    // Dynamic features with counts
    const resumesMatch = feature.match(/^(\d+)\s+resumes?\s+per\s+month$/i);
    const unlimitedResumesMatch = feature.match(/^unlimited\s+resumes$/i);
    
    const aiMatch = feature.match(/^(\d+)\s+AI\s+suggestions?\s+per\s+month$/i);
    const unlimitedAiMatch = feature.match(/^unlimited\s+AI\s+(suggestions?|processing)$/i);
    
    const exportsMatch = feature.match(/^(\d+)\s+exports?\s+per\s+month$/i);
    const unlimitedExportsMatch = feature.match(/^unlimited\s+exports?$/i);
    
    if (unlimitedResumesMatch) {
      return t(`${keyPrefix}.features.unlimitedResumes`);
    }
    if (resumesMatch) {
      const count = resumesMatch[1];
      return t(`${keyPrefix}.features.resumesPerMonth`, { count });
    }
    
    if (unlimitedAiMatch) {
      return t(`${keyPrefix}.features.unlimitedAI`);
    }
    if (aiMatch) {
      const count = aiMatch[1];
      return t(`${keyPrefix}.features.aiSuggestionsPerMonth`, { count });
    }
    
    if (unlimitedExportsMatch) {
      return t(`${keyPrefix}.features.unlimitedExports`);
    }
    if (exportsMatch) {
      const count = exportsMatch[1];
      return t(`${keyPrefix}.features.exportsPerMonth`, { count });
    }
    
    // Static features mapping
    const featureMap: { [key: string]: string } = {
      'Free templates': `${keyPrefix}.features.freeTemplates`,
      'All template options': `${keyPrefix}.features.allTemplates`,
      'All premium templates': `${keyPrefix}.features.premiumTemplates`,
      'PDF export': `${keyPrefix}.features.pdfExport`,
      'Multiple export formats': `${keyPrefix}.features.multipleFormats`,
      'Advanced AI enhancement': `${keyPrefix}.features.advancedAI`,
      'Custom branding': `${keyPrefix}.features.customBranding`,
      'Priority support': `${keyPrefix}.features.prioritySupport`,
      'Advanced analytics': `${keyPrefix}.features.analytics`
    };
    
    const translationKey = featureMap[feature];
    if (translationKey) {
      return t(translationKey);
    }
    
    // Return original if no translation found
    return feature;
  });
}