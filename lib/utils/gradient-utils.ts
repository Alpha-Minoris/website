/**
 * Gradient utility functions for text color gradients
 */

export type GradientType = 'linear' | 'radial'
export type ColorStop = {
    color: string
    position: number // 0-100
}

export type GradientConfig = {
    type: GradientType
    angle?: number // For linear (0-360)
    stops: ColorStop[]
    // For radial:
    shape?: 'circle' | 'ellipse'
    position?: { x: number; y: number } // Center point (0-100)
}

/**
 * Convert gradient config to CSS gradient string
 */
export function gradientToCSS(config: GradientConfig): string {
    const stops = config.stops
        .sort((a, b) => a.position - b.position)
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ')

    if (config.type === 'linear') {
        const angle = config.angle ?? 180
        return `linear-gradient(${angle}deg, ${stops})`
    } else {
        const shape = config.shape ?? 'circle'
        const pos = config.position ?? { x: 50, y: 50 }
        return `radial-gradient(${shape} at ${pos.x}% ${pos.y}%, ${stops})`
    }
}

/**
 * Convert rgb(r, g, b) or rgba(r, g, b, a) to hex format
 */
export function rgbToHex(rgb: string): string {
    if (rgb.startsWith('#')) return rgb

    const numbers = rgb.match(/\d+/g)
    if (!numbers || numbers.length < 3) return rgb

    const r = parseInt(numbers[0])
    const g = parseInt(numbers[1])
    const b = parseInt(numbers[2])

    const toHex = (n: number) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return '#' + toHex(r) + toHex(g) + toHex(b)
}

/**
 * Parse CSS gradient string to config
 */
export function cssToGradient(cssString: string): GradientConfig | null {
    if (!cssString.includes('gradient')) return null

    const isLinear = cssString.includes('linear-gradient')
    const isRadial = cssString.includes('radial-gradient')
    if (!isLinear && !isRadial) return null

    try {
        // Extract content between FIRST ( and LAST ) to handle nested parens in rgb()
        const firstParen = cssString.indexOf('(')
        const lastParen = cssString.lastIndexOf(')')
        if (firstParen === -1 || lastParen === -1) return null

        const content = cssString.substring(firstParen + 1, lastParen)

        // Split on commas ONLY when not inside parentheses
        const parts: string[] = []
        let current = ''
        let depth = 0

        for (let i = 0; i < content.length; i++) {
            const char = content[i]
            if (char === '(') depth++
            if (char === ')') depth--

            if (char === ',' && depth === 0) {
                parts.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        if (current) parts.push(current.trim())

        if (isLinear) {
            const anglePart = parts[0]
            const angle = parseInt(anglePart) || 180

            const stops: ColorStop[] = parts.slice(1).map((stopStr) => {
                const colorMatch = stopStr.match(/(rgba?\([^)]+\)|#[a-fA-F0-9]{3,6})/)
                // FIX: Support decimal percentages like 78.57%
                const posMatch = stopStr.match(/(\d+(?:\.\d+)?)%/)

                if (colorMatch && posMatch) {
                    return {
                        color: rgbToHex(colorMatch[1]),
                        position: parseFloat(posMatch[1])
                    }
                }

                return { color: '#ffffff', position: 0 }
            })

            return { type: 'linear' as const, angle, stops }
        } else {
            let shapeAndPos = parts[0]
            const shape = shapeAndPos.includes('circle') ? 'circle' : 'ellipse'

            const atMatch = shapeAndPos.match(/at\s+(\d+)%\s+(\d+)%/)
            const position = atMatch
                ? { x: parseInt(atMatch[1]), y: parseInt(atMatch[2]) }
                : { x: 50, y: 50 }

            const stopStart = shapeAndPos.includes('at') ? 1 : 1
            const stops: ColorStop[] = parts.slice(stopStart).map(stopStr => {
                const colorMatch = stopStr.match(/(rgba?\([^)]+\)|#[a-fA-F0-9]{3,6})/)
                // FIX: Support decimal percentages like 78.57%
                const posMatch = stopStr.match(/(\d+(?:\.\d+)?)%/)

                if (colorMatch && posMatch) {
                    return {
                        color: rgbToHex(colorMatch[1]),
                        position: parseFloat(posMatch[1])
                    }
                }

                return { color: '#ffffff', position: 0 }
            })

            return { type: 'radial', shape, position, stops }
        }
    } catch (error) {
        return null
    }
}
