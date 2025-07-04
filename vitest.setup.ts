import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// lucide-react mock is now provided via alias to tests/__mocks__/lucide-react.ts 

vi.mock('lucide-react', async () => {
  return await import('./tests/__mocks__/lucide-react');
}); 