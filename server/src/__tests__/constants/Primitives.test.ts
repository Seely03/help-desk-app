import { describe, it, expect, jest } from '@jest/globals';
import {
  Username,
  UserEmail,
  ProjectTitle,
  ProjectDescription,
  TicketTitle,
  TicketPriority,
  TicketStatus,
} from '../../constants/Primitives.js';

describe('Primitives Validation', () => {
  describe('Username', () => {
    it('should accept valid lowercase usernames', () => {
      expect(Username.parse('john')).toBe('john');
      expect(Username.parse('j')).toBe('j');
      expect(Username.parse('abcdefgh')).toBe('abcdefgh');
    });

    it('should reject usernames with uppercase letters', () => {
      expect(() => Username.parse('John')).toThrow();
      expect(() => Username.parse('JOHN')).toThrow();
    });

    it('should reject usernames with numbers', () => {
      expect(() => Username.parse('john1')).toThrow();
      expect(() => Username.parse('123')).toThrow();
    });

    it('should reject usernames longer than 8 characters', () => {
      expect(() => Username.parse('abcdefghi')).toThrow();
    });

    it('should reject empty usernames', () => {
      expect(() => Username.parse('')).toThrow();
    });
  });

  describe('UserEmail', () => {
    it('should accept valid Amazon email addresses', () => {
      expect(UserEmail.parse('john@amazon.com')).toBe('john@amazon.com');
      expect(UserEmail.parse('jane.doe@amazon.com')).toBe('jane.doe@amazon.com');
      expect(UserEmail.parse('user+tag@amazon.com')).toBe('user+tag@amazon.com');
    });

    it('should reject non-Amazon email addresses', () => {
      expect(() => UserEmail.parse('john@gmail.com')).toThrow();
      expect(() => UserEmail.parse('john@example.com')).toThrow();
    });

    it('should reject invalid email formats', () => {
      expect(() => UserEmail.parse('notanemail')).toThrow();
      expect(() => UserEmail.parse('@amazon.com')).toThrow();
      expect(() => UserEmail.parse('john@')).toThrow();
    });
  });

  describe('ProjectTitle', () => {
    it('should accept valid project titles', () => {
      expect(ProjectTitle.parse('My Project')).toBe('My Project');
      expect(ProjectTitle.parse('A'.repeat(100))).toBe('A'.repeat(100));
    });

    it('should reject titles longer than 100 characters', () => {
      expect(() => ProjectTitle.parse('A'.repeat(101))).toThrow();
    });

    it('should reject titles with HTML tags', () => {
      expect(() => ProjectTitle.parse('<script>alert("xss")</script>')).toThrow();
      expect(() => ProjectTitle.parse('Project <b>Title</b>')).toThrow();
      expect(() => ProjectTitle.parse('Project>Title')).toThrow();
    });

    it('should reject empty titles', () => {
      expect(() => ProjectTitle.parse('')).toThrow();
    });
  });

  describe('ProjectDescription', () => {
    it('should accept valid descriptions', () => {
      expect(ProjectDescription.parse('A valid description')).toBe('A valid description');
      expect(ProjectDescription.parse('A'.repeat(4096))).toBe('A'.repeat(4096));
    });

    it('should reject descriptions longer than 4096 characters', () => {
      expect(() => ProjectDescription.parse('A'.repeat(4097))).toThrow();
    });

    it('should reject descriptions with HTML tags', () => {
      expect(() => ProjectDescription.parse('<div>Content</div>')).toThrow();
      expect(() => ProjectDescription.parse('Description<script>')).toThrow();
    });

    it('should reject empty descriptions', () => {
      expect(() => ProjectDescription.parse('')).toThrow();
    });
  });

  describe('TicketTitle', () => {
    it('should accept valid ticket titles', () => {
      expect(TicketTitle.parse('Fix bug in login')).toBe('Fix bug in login');
      expect(TicketTitle.parse('A'.repeat(100))).toBe('A'.repeat(100));
    });

    it('should reject titles longer than 100 characters', () => {
      expect(() => TicketTitle.parse('A'.repeat(101))).toThrow();
    });

    it('should reject titles with HTML tags', () => {
      expect(() => TicketTitle.parse('<img src=x>')).toThrow();
      expect(() => TicketTitle.parse('Bug<script>')).toThrow();
    });

    it('should reject empty titles', () => {
      expect(() => TicketTitle.parse('')).toThrow();
    });
  });

  describe('TicketPriority', () => {
    it('should accept valid priorities', () => {
      expect(TicketPriority.parse('Low')).toBe('Low');
      expect(TicketPriority.parse('Medium')).toBe('Medium');
      expect(TicketPriority.parse('High')).toBe('High');
    });

    it('should reject invalid priorities', () => {
      expect(() => TicketPriority.parse('Critical')).toThrow();
      expect(() => TicketPriority.parse('low')).toThrow();
      expect(() => TicketPriority.parse('')).toThrow();
    });
  });

  describe('TicketStatus', () => {
    it('should accept valid statuses', () => {
      expect(TicketStatus.parse('Open')).toBe('Open');
      expect(TicketStatus.parse('In-Progress')).toBe('In-Progress');
      expect(TicketStatus.parse('In Review')).toBe('In Review');
      expect(TicketStatus.parse('Closed')).toBe('Closed');
    });

    it('should reject invalid statuses', () => {
      expect(() => TicketStatus.parse('open')).toThrow();
      expect(() => TicketStatus.parse('Pending')).toThrow();
      expect(() => TicketStatus.parse('')).toThrow();
    });
  });
});

