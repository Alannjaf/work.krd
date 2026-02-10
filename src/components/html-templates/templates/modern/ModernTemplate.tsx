import React from 'react';
import type { HtmlTemplateProps } from '../../types';
import { isResumeRTL } from '@/lib/rtl';
import { Watermark } from '../../shared/Watermark';
import { ResumeHeader } from '../../shared/ResumeHeader';
import { SkillsSection } from '../../shared/SkillsSection';
import { LanguagesSection } from '../../shared/LanguagesSection';
import { EducationSection } from '../../shared/EducationSection';
import { CertificationsSection } from '../../shared/CertificationsSection';
import { ExperienceSection } from '../../shared/ExperienceSection';
import { ProjectsSection } from '../../shared/ProjectsSection';
import {
  colors,
  getFont,
  getPageStyle,
  getHeaderStyle,
  getNameStyle,
  getTitleStyle,
  getBodyStyle,
  getSidebarBgStyle,
  getSidebarStyle,
  getMainColumnStyle,
  getSectionTitleStyle,
  getSidebarSectionTitleStyle,
  getSummaryStyle,
} from './styles';

export function ModernTemplate({ data, watermark }: HtmlTemplateProps) {
  const isRTL = isResumeRTL(data);
  const font = getFont(isRTL);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={getPageStyle(isRTL)}>
      {/* Header */}
      <ResumeHeader
        personal={data.personal}
        isRTL={isRTL}
        style={getHeaderStyle(isRTL)}
        nameStyle={{ ...getNameStyle(isRTL), fontFamily: font }}
        titleStyle={{ ...getTitleStyle(isRTL), fontFamily: font }}
        contactStyle={{
          gap: isRTL ? 12 : 16,
          direction: isRTL ? 'rtl' : 'ltr',
        }}
        contactItemStyle={{
          fontSize: isRTL ? 9 : 10,
          color: colors.contactText,
          textAlign: isRTL ? 'right' : 'left',
          fontFamily: font,
        }}
        photoSize={isRTL ? 85 : 90}
        photoBorderColor="#ffffff"
        photoBorderWidth={isRTL ? 3 : 4}
        showDemographics={true}
        demographicContainerStyle={{
          gap: isRTL ? 10 : 12,
          marginTop: isRTL ? 6 : 8,
        }}
        demographicStyle={{
          fontSize: isRTL ? 8 : 9,
          color: colors.demographicText,
          textAlign: isRTL ? 'right' : 'left',
          fontFamily: font,
        }}
      />

      {/* Body */}
      <div style={{ position: 'relative' }}>
        {/* Sidebar background overlay */}
        <div style={getSidebarBgStyle(isRTL)} />

        <div style={getBodyStyle(isRTL)}>
          {/* Sidebar Column (Skills, Languages, Education, Certifications) */}
          <div style={getSidebarStyle(isRTL)}>
            <SkillsSection
              skills={data.skills}
              isRTL={isRTL}
              titleStyle={getSidebarSectionTitleStyle(isRTL)}
              title={isRTL ? '\u062A\u0648\u0627\u0646\u0627\u06CC\u06D5\u06A9\u0627\u0646' : 'Technical Skills'}
              chipStyle={{
                backgroundColor: colors.skillBg,
                color: colors.skillText,
                padding: isRTL ? '4px 10px' : '6px 12px',
                borderRadius: isRTL ? 10 : 12,
                fontSize: isRTL ? 8 : 9,
                fontFamily: font,
              }}
            />

            <LanguagesSection
              languages={data.languages}
              isRTL={isRTL}
              titleStyle={getSidebarSectionTitleStyle(isRTL)}
              title={isRTL ? '\u0632\u0645\u0627\u0646\u06D5\u06A9\u0627\u0646' : 'Languages'}
              itemStyle={{
                padding: isRTL ? '6px 10px' : '8px 12px',
                backgroundColor: colors.langBg,
                borderRadius: 6,
                border: `1px solid ${colors.langBorder}`,
                marginBottom: isRTL ? 8 : 10,
              }}
              nameStyle={{
                fontSize: isRTL ? 9 : 10,
                fontFamily: font,
              }}
              levelStyle={{
                fontSize: isRTL ? 8 : 9,
                color: colors.langLevel,
                backgroundColor: colors.langLevelBg,
                padding: isRTL ? '2px 6px' : '3px 8px',
                borderRadius: isRTL ? 8 : 10,
              }}
            />

            <EducationSection
              education={data.education}
              isRTL={isRTL}
              titleStyle={getSidebarSectionTitleStyle(isRTL)}
              title={isRTL ? '\u062E\u0648\u06CE\u0646\u062F\u0646' : 'Education'}
              itemStyle={{
                marginBottom: isRTL ? 12 : 14,
                padding: isRTL ? '10px 12px' : '12px 16px',
                backgroundColor: colors.educationBg,
                borderRadius: 6,
                border: `1px solid ${colors.educationBorder}`,
              }}
              degreeStyle={{
                fontSize: isRTL ? 11 : 12,
                fontFamily: font,
              }}
              fieldStyle={{
                fontSize: isRTL ? 10 : 11,
                color: colors.fieldColor,
                fontFamily: font,
              }}
              schoolStyle={{
                fontSize: isRTL ? 9 : 10,
                fontFamily: font,
              }}
              gpaStyle={{
                fontFamily: font,
              }}
            />

            <CertificationsSection
              certifications={data.certifications}
              isRTL={isRTL}
              titleStyle={getSidebarSectionTitleStyle(isRTL)}
              title={isRTL ? '\u0628\u0695\u0648\u0627\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' : 'Certifications'}
              itemStyle={{
                marginBottom: isRTL ? 10 : 12,
                padding: isRTL ? '8px 12px' : '10px 14px',
                backgroundColor: colors.certBg,
                borderRadius: 6,
                border: `1px solid ${colors.certBorder}`,
                borderInlineStart: `3px solid ${colors.certAccent}`,
              }}
              nameStyle={{
                fontSize: isRTL ? 10 : 11,
                fontFamily: font,
              }}
              issuerStyle={{
                fontSize: isRTL ? 9 : 10,
                color: colors.linkColor,
                fontFamily: font,
              }}
              dateStyle={{
                fontFamily: font,
              }}
            />
          </div>

          {/* Main Column (Summary, Experience, Projects) */}
          <div style={getMainColumnStyle(isRTL)}>
            {/* Summary */}
            {data.summary && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={getSectionTitleStyle(isRTL)}>
                  {isRTL ? '\u067E\u0648\u062E\u062A\u06D5\u06CC \u067E\u06CC\u0634\u06D5\u06CC\u06CC' : 'Professional Summary'}
                </h3>
                <div style={{ ...getSummaryStyle(isRTL), fontFamily: font }}>
                  {data.summary}
                </div>
              </div>
            )}

            {/* Experience */}
            <ExperienceSection
              experiences={data.experience || []}
              isRTL={isRTL}
              titleStyle={getSectionTitleStyle(isRTL)}
              title={isRTL ? '\u0626\u06D5\u0632\u0645\u0648\u0648\u0646\u06CC \u06A9\u0627\u0631' : 'Professional Experience'}
              jobTitleStyle={{ fontFamily: font }}
              companyStyle={{ fontFamily: font }}
              locationStyle={{ fontFamily: font }}
              durationStyle={{
                backgroundColor: colors.durationBg,
                fontFamily: font,
                maxWidth: isRTL ? 90 : 120,
              }}
              descriptionStyle={{ fontFamily: font }}
            />

            {/* Projects */}
            <ProjectsSection
              projects={data.projects}
              isRTL={isRTL}
              titleStyle={getSectionTitleStyle(isRTL)}
              title={isRTL ? '\u067E\u0695\u06C6\u0698\u06D5\u06A9\u0627\u0646' : 'Notable Projects'}
              nameStyle={{ fontFamily: font }}
              descriptionStyle={{ fontFamily: font }}
              techStyle={{ fontFamily: font }}
              linkStyle={{ fontFamily: font }}
              itemStyle={{
                borderInlineStart: `4px solid ${colors.projectBorder}`,
                backgroundColor: colors.projectBg,
              }}
            />
          </div>
        </div>
      </div>

      {watermark && <Watermark />}
    </div>
  );
}
