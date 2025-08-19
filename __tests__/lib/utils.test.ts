import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('handles empty strings', () => {
      const result = cn('base', '', 'valid');
      expect(result).toBe('base valid');
    });

    it('merges Tailwind classes correctly', () => {
      const result = cn('p-4', 'p-6'); // Should keep the last one
      expect(result).toContain('p-6');
      expect(result).not.toContain('p-4');
    });

    it('handles complex conditional logic', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class',
        !isDisabled && 'enabled-class'
      );
      
      expect(result).toBe('base-class active-class enabled-class');
    });
  });
});