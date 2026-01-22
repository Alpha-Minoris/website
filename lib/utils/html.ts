/**
 * Utility function to strip HTML tags from text
 * Used for displaying section/block names in UI where HTML should not render
 */

export function stripHtmlTags(html: string | undefined | null): string {
    if (!html) return ''

    // Remove HTML tags
    const text = html.replace(/\u003c[^>]*\u003e/g, '')

    // Decode HTML entities
    const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
    if (textarea) {
        textarea.innerHTML = text
        return textarea.value
    }

    // Fallback for server-side: basic entity decoding
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '\u003c')
        .replace(/&gt;/g, '\u003e')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
}

/**
 * Get a clean display name for a section or block
 * Strips HTML and truncates if needed
 */
export function getDisplayName(content: string | undefined | null, fallback: string = 'Untitled', maxLength: number = 50): string {
    const clean = stripHtmlTags(content)
    const trimmed = clean.trim() || fallback

    if (trimmed.length <= maxLength) {
        return trimmed
    }

    return trimmed.slice(0, maxLength) + '...'
}
