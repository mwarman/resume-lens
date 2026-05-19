/**
 * This file contains fixtures for testing the resume extraction functionality. It provides a sample ResumeExtraction
 * object that can be used in unit tests and component tests to verify that the application correctly handles and displays
 * extracted resume data.
 *
 * The fixture includes a realistic example of a candidate's resume data, including personal information, summary,
 * skills, experience, education, certifications, and metadata about the extraction process.
 *
 * This allows us to test the UI components that display this data without needing to perform actual API calls
 * or file uploads during testing.
 * @see ResumeExtraction for the structure of the data provided in the fixture.
 */

import { ResumeExtraction } from '@resume-lens/shared';

export const extractionFixture1: ResumeExtraction = {
  candidate: {
    fullName: 'Joseph Smith',
    email: 'j.jones@example.com',
    phone: '+1-987-765-4321',
    location: null,
    linkedIn: 'http://linkedin.com/in/jjones',
  },
  summary:
    'Experienced technology leader with 18+ years of expertise in cloud architecture, full-stack engineering, and people leadership. VP Enterprise Systems with proven track record scaling engineering organizations, implementing Agile processes, and driving business growth through innovative technology solutions and strategic mentoring.',
  inferredSeniorityLevel: 'principal',
  skills: {
    technical: [
      'AWS Architecture',
      'Systems Architecture',
      'Full-Stack Engineering',
      'React',
      'Ionic Framework',
      'NextJS',
      'Serverless Framework',
      'NestJS',
      'ExpressJS',
      'Node.js',
      'AWS CDK',
      'AWS Services',
      'Containers',
      'SQL',
      'NoSQL Databases',
      'JavaScript',
      'TypeScript',
      'Java',
      'Python',
      'Microservices Architecture',
      'CI/CD Pipelines',
      'GitHub',
      'Bitbucket',
      'Jenkins',
      'Atlassian Suite',
    ],
    soft: [
      'People Leadership',
      'Mentoring',
      'Growth',
      'Account Management',
      'Customer Success Strategy',
      'Agile Processes',
      'High Performance Culture',
    ],
  },
  experience: [
    {
      company: 'Big Tuna Technologies',
      title: 'VP Enterprise Systems',
      startDate: 'Aug 2023',
      endDate: null,
      current: true,
      highlights: [
        'Scaled engineering organization from 20 to 120+ members across international locations within 18 months',
        'Fostered culture of high performance and ownership',
        'Spearheaded mentoring programs for engineering managers and senior staff',
        'Improved retention rates by 30%',
        'Reduced voluntary turnover to under 5%',
        'Restructured department implementing Agile processes',
        'Improved project delivery speed by 25%',
      ],
    },
    {
      company: 'Chopped Salad Consulting',
      title: 'Director of Customer Solutions',
      startDate: 'Jan 2018',
      endDate: 'Jul 2023',
      current: false,
      highlights: [
        'Increased client retention by 32% through proactive account management systems',
        'Developed tailored customer success strategies',
        'Drove 24% increase in sales with customer-focused consulting strategy',
        'Transformed reactive customer support into proactive advisory model',
        'Reduced service complaints by 25%',
        'Spearheaded development of new service offerings',
        'Generated significant new revenue within first year',
      ],
    },
    {
      company: 'Fun Monkey Solutions',
      title: 'Senior Software Engineer',
      startDate: 'Jun 2005',
      endDate: 'Dec 2017',
      current: false,
      highlights: [
        'Led team of 7 in designing scalable microservices architecture',
        'Accelerated data processing by 37%',
        'Reduced database response time by 24%',
        'Migrated 10+ legacy on-premise applications to AWS',
        'Reduced infrastructure costs by 30%',
        'Improved overall system reliability',
        'Delivered client-facing web portal using React and Python 2 months ahead of schedule',
        'Increased user retention by 15%',
        'Developed HIPAA-compliant migration script',
        'Successfully transitioned 50+ data nodes with zero downtime',
      ],
    },
  ],
  education: [
    {
      institution: 'North Carolina State University',
      degree: 'Bachelor of Science',
      field: 'Computer Electrical Engineering',
      graduationYear: 2005,
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect - Professional',
      issuer: 'AWS',
      year: null,
    },
    {
      name: 'AWS Certified DevOps Engineer - Professional',
      issuer: 'AWS',
      year: null,
    },
    {
      name: 'Certified Secure Software Lifecycle Professional',
      issuer: null,
      year: null,
    },
  ],
  extractionMeta: {
    modelId: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    processedAt: '2026-05-19T10:25:05.120Z',
    sourceFormat: 'pdf',
    confidence: {
      experience: 'high',
      education: 'medium',
      skills: 'high',
    },
  },
};
