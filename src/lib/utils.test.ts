import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
    expect(cn('w-full', 'h-full')).toBe('w-full h-full')
    expect(cn('w-full', { 'h-full': true })).toBe('w-full h-full')
    expect(cn('w-full', { 'h-full': false })).toBe('w-full')
})

test('cn handles tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
})
