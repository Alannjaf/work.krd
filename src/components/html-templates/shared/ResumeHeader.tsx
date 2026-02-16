/**
 * @deprecated Currently unused — templates build their own header layouts inline.
 * Available for future templates that want a standardized header component.
 */
import React from 'react';
import type { PersonalInfo } from '@/types/resume';
import { ProfilePhoto } from './ProfilePhoto';
import { ContactInfo } from './ContactInfo';

interface ResumeHeaderProps {
  personal: PersonalInfo;
  isRTL?: boolean;
  layout?: 'modern' | 'classic' | 'creative';
  style?: React.CSSProperties;
  nameStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  contactStyle?: React.CSSProperties;
  contactItemStyle?: React.CSSProperties;
  photoSize?: number;
  photoBorderColor?: string;
  photoBorderWidth?: number;
  showDemographics?: boolean;
  demographicStyle?: React.CSSProperties;
  demographicContainerStyle?: React.CSSProperties;
}

function hasDemographics(personal: PersonalInfo): boolean {
  return Boolean(
    personal.dateOfBirth ||
      personal.gender ||
      personal.nationality ||
      personal.maritalStatus ||
      personal.country
  );
}

function formatFullDate(d: string, isRTL: boolean): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString(isRTL ? 'ar' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ResumeHeader({
  personal,
  isRTL = false,
  style,
  nameStyle,
  titleStyle,
  contactStyle,
  contactItemStyle,
  photoSize = 90,
  photoBorderColor = '#ffffff',
  photoBorderWidth = 4,
  showDemographics = true,
  demographicStyle,
  demographicContainerStyle,
}: ResumeHeaderProps) {
  const demographicItems: { label: string; value: string }[] = [];
  if (showDemographics && hasDemographics(personal)) {
    if (personal.dateOfBirth) {
      demographicItems.push({
        label: isRTL ? 'لەدایکبوون' : 'Born',
        value: formatFullDate(personal.dateOfBirth, isRTL),
      });
    }
    if (personal.gender) {
      demographicItems.push({
        label: isRTL ? 'ڕەگەز' : 'Gender',
        value: personal.gender,
      });
    }
    if (personal.nationality) {
      demographicItems.push({
        label: isRTL ? 'نەتەوە' : 'Nationality',
        value: personal.nationality,
      });
    }
    if (personal.maritalStatus) {
      demographicItems.push({
        label: isRTL ? 'باری خێزانی' : 'Marital Status',
        value: personal.maritalStatus,
      });
    }
    if (personal.country) {
      demographicItems.push({
        label: isRTL ? 'وڵات' : 'Country',
        value: personal.country,
      });
    }
  }

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {personal.profileImage && (
          <div style={{ [isRTL ? 'marginLeft' : 'marginRight']: 24, flexShrink: 0 }}>
            <ProfilePhoto
              src={personal.profileImage}
              size={photoSize}
              borderColor={photoBorderColor}
              borderWidth={photoBorderWidth}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={nameStyle}>{personal.fullName}</div>
          {personal.title && <div style={titleStyle}>{personal.title}</div>}
          <ContactInfo
            personal={personal}
            isRTL={isRTL}
            style={contactStyle}
            itemStyle={contactItemStyle}
          />
        </div>
      </div>

      {demographicItems.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
            ...demographicContainerStyle,
          }}
        >
          {demographicItems.map((item, i) => (
            <span key={i} style={demographicStyle}>
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
