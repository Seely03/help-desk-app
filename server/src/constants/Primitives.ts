import { z } from 'zod';

const NO_HTML_REGEX = /^[^<>]*$/;

export const CONSTANTS = {
    USERNAME: { MIN: 1, MAX: 8 },
    PROJECT: { TITLE_MAX: 100, DESC_MAX: 4096 },
    TICKET: { TITLE_MAX: 100, DESC_MAX: 2048 },
    JOB: { TEAM_MAX: 50 },
    REGEX: {
      NO_HTML: /^[^<>]*$/,
      USERNAME: /^[a-z]+$/,
      AMAZON_EMAIL: /^[a-zA-Z0-9._%+-]+@amazon\.com$/
    },
    ENUMS: {
        JOB_TITLES: [
            'Project Manager',
            'Software Engineer',
            'Support Engineer',
            'Systems Engineer',
            'Tester',
            'Designer'
          ] as const,
      ROLES: ['User', 'Admin'] as const,
      PRIORITY: ['Low', 'Medium', 'High'] as const,
      STATUS: ['Open', 'In-Progress', 'In Review', 'Closed'] as const,
      SIZING: [1, 2, 3, 5, 8] as const,
    }
  } as const;
  
export const Username = z
    .string()
    .min(1, 'Username is required')
    .max(8, 'Username must be less than 8 characters')
    .regex(/^[a-z]+$/, 'Username must contain only lowercase letters');

export const UserEmail = z
    .email('Invalid email format')
    .regex(/^[a-zA-Z0-9._%+-]+@amazon\.com$/, "Email must be a username ending with @amazon.com");

export const ProjectTitle = z
    .string()
    .min(1, "Project title is required")
    .max(100, "Project title must be 100 characters or less")
    .regex(NO_HTML_REGEX, "Project title must not contain HTML or script content");

export const ProjectDescription = z
    .string()
    .min(1, "Project description is required")
    .max(4096, "Project description must be 4096 characters or less")
    // allows newlines, dashes, punctuation — just no < or >
    .regex(NO_HTML_REGEX, "Project description must not contain HTML or script content");

// add near the other schema exports in Primitives.ts
export const TicketTitle = z
  .string()
  .min(1, "Ticket title is required")
  .max(CONSTANTS.TICKET.TITLE_MAX, "Ticket title must be 100 characters or less")
  .regex(NO_HTML_REGEX, "Ticket title must not contain HTML or script content");

export const TicketPriority = z.enum(CONSTANTS.ENUMS.PRIORITY);
export const TicketStatus = z.enum(CONSTANTS.ENUMS.STATUS);