/// <reference types="jest" />
import { AddBookmarkDTO, UpdatePositionDTO } from '../services/dto';

describe('Zod DTO validation', () => {
  it('validates AddBookmarkDTO correctly', () => {
    const valid = { title: 'My Bookmark', url: 'https://example.com' };
    expect(() => AddBookmarkDTO.parse(valid)).not.toThrow();

    const invalid = { title: '', url: 'not-a-url' };
    expect(() => AddBookmarkDTO.parse(invalid)).toThrow();
  });

  it('validates UpdatePositionDTO correctly', () => {
    const valid = { position: 1.23, order: 3 };
    expect(() => UpdatePositionDTO.parse(valid)).not.toThrow();

    const invalid = { position: 'xyz', order: 15 } as any;
    expect(() => UpdatePositionDTO.parse(invalid)).toThrow();
  });
});