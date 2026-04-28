import { useState } from 'react';
import type { ResumeExtraction } from '@resume-lens/shared';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  extraction: ResumeExtraction;
  onReset: () => void;
}

/**
 * Renders a confidence badge with appropriate styling based on confidence level.
 * High confidence is quiet (no badge), medium and low are visible.
 */
const ConfidenceBadge = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
  if (level === 'high') return null;
  return <span className={`${styles.badge} ${styles[`badge-${level}`]}`}>{level}</span>;
};

/**
 * ResultCard renders the full ResumeExtraction result in a structured, scannable layout.
 * Features:
 * - All sections displayed in a responsive grid (2-col on large screens, 1-col on small)
 * - Inferred seniority level prominently displayed
 * - Confidence indicators for medium/low confidence sections
 * - Collapsible metadata section (default open)
 * - Action to reset and analyze another résumé
 */
const ResultCard = ({ extraction, onReset }: ResultCardProps) => {
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return dateStr;
  };

  const dateRange = (start: string | null, end: string | null, current: boolean) => {
    if (current) return `${formatDate(start)} — Present`;
    return `${formatDate(start)} — ${formatDate(end)}`;
  };

  return (
    <div className={styles.container}>
      {/* Two-column layout: structured data (left) and raw JSON (right) */}
      <div className={styles.mainLayout}>
        {/* Left column: Structured content */}
        <div className={styles.leftColumn}>
          {/* Main grid content */}
          <div className={styles.grid}>
            {/* Candidate Header - at top of left column */}
            <header className={styles.header}>
              <div>
                <h2 className={styles.candidateName}>{extraction.candidate.fullName}</h2>
                <div className={styles.contactInfo}>
                  {extraction.candidate.email && <span>{extraction.candidate.email}</span>}
                  {extraction.candidate.phone && <span>{extraction.candidate.phone}</span>}
                  {extraction.candidate.location && <span>{extraction.candidate.location}</span>}
                  {extraction.candidate.linkedIn && (
                    <a href={extraction.candidate.linkedIn} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </header>

            {/* Summary */}
            {extraction.summary && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Summary</h3>
                <p className={styles.summaryText}>{extraction.summary}</p>
              </section>
            )}

            {/* AI Inferences */}
            <section className={styles.section} style={{ borderLeft: '3px solid #a78bfa' }}>
              <h3 className={styles.sectionTitle}>AI Inferences</h3>
              <div className={styles.inferencesGrid}>
                <div className={styles.inferenceItem}>
                  <div className={styles.inferenceLabel}>Seniority Level</div>
                  <div
                    className={`${styles.seniorityBadge} ${styles[`seniority-${extraction.inferredSeniorityLevel}`]}`}
                  >
                    {extraction.inferredSeniorityLevel.charAt(0).toUpperCase() +
                      extraction.inferredSeniorityLevel.slice(1)}
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Skills */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Technical Skills</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.skills} />
              </div>
              {extraction.skills.technical.length > 0 ? (
                <div className={styles.skillsList}>
                  {extraction.skills.technical.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No technical skills listed</p>
              )}
            </section>

            {/* Soft Skills */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Soft Skills</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.skills} />
              </div>
              {extraction.skills.soft.length > 0 ? (
                <div className={styles.skillsList}>
                  {extraction.skills.soft.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No soft skills listed</p>
              )}
            </section>

            {/* Experience - spans both columns */}
            <section className={`${styles.section} ${styles.fullWidth}`}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Experience</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.experience} />
              </div>
              {extraction.experience.length > 0 ? (
                <div className={styles.experienceList}>
                  {extraction.experience.map((exp, idx) => (
                    <div key={idx} className={styles.experienceItem}>
                      <div className={styles.experienceHeader}>
                        <h4 className={styles.jobTitle}>{exp.title}</h4>
                        <span className={styles.company}>{exp.company}</span>
                      </div>
                      <div className={styles.dateRange}>{dateRange(exp.startDate, exp.endDate, exp.current)}</div>
                      {exp.highlights.length > 0 && (
                        <ul className={styles.highlights}>
                          {exp.highlights.map((highlight, hIdx) => (
                            <li key={hIdx}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No experience listed</p>
              )}
            </section>

            {/* Education - spans both columns */}
            <section className={`${styles.section} ${styles.fullWidth}`}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Education</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.education} />
              </div>
              {extraction.education.length > 0 ? (
                <div className={styles.educationList}>
                  {extraction.education.map((edu, idx) => (
                    <div key={idx} className={styles.educationItem}>
                      <h4 className={styles.institution}>{edu.institution}</h4>
                      <div className={styles.degreeInfo}>
                        {edu.degree && <span className={styles.degree}>{edu.degree}</span>}
                        {edu.field && <span className={styles.field}>{edu.field}</span>}
                        {edu.graduationYear && <span className={styles.year}>{edu.graduationYear}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No education listed</p>
              )}
            </section>

            {/* Certifications - spans both columns */}
            {extraction.certifications.length > 0 && (
              <section className={`${styles.section} ${styles.fullWidth}`}>
                <h3 className={styles.sectionTitle}>Certifications</h3>
                <div className={styles.certificationsList}>
                  {extraction.certifications.map((cert, idx) => (
                    <div key={idx} className={styles.certificationItem}>
                      <h4 className={styles.certName}>{cert.name}</h4>
                      <div className={styles.certInfo}>
                        {cert.issuer && <span>{cert.issuer}</span>}
                        {cert.year && <span>{cert.year}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right column: Raw JSON */}
        <div className={styles.rightColumn}>
          <div className={styles.jsonContainer}>
            <h3 className={styles.jsonTitle}>Raw API Response</h3>
            <pre className={styles.jsonDisplay}>{JSON.stringify(extraction, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Metadata Section - Collapsible */}
      <section className={styles.metadataSection}>
        <button
          className={styles.metadataToggle}
          onClick={() => setIsMetadataOpen(!isMetadataOpen)}
          aria-expanded={isMetadataOpen}
        >
          <span className={styles.toggleIndicator}>{isMetadataOpen ? '▼' : '▶'}</span>
          Extraction Metadata
        </button>
        {isMetadataOpen && (
          <div className={styles.metadataContent}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Model:</span>
              <code>{extraction.extractionMeta.modelId}</code>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Processed:</span>
              <time>{new Date(extraction.extractionMeta.processedAt).toLocaleString()}</time>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Source:</span>
              <span>{extraction.extractionMeta.sourceFormat.toUpperCase()}</span>
            </div>
          </div>
        )}
      </section>

      {/* Action Button */}
      <footer className={styles.footer}>
        <button className={styles.resetButton} onClick={onReset}>
          Analyze Another Résumé
        </button>
      </footer>
    </div>
  );
};

export default ResultCard;
