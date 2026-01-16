'use client'

export interface SnapPoint {
    position: number
    type: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' | 'gridX' | 'gridY'
    sourceId?: string
}

export interface SnapResult {
    x: number
    y: number
    snappedX: boolean
    snappedY: boolean
    guides: SnapGuide[]
}

export interface SnapGuide {
    orientation: 'horizontal' | 'vertical'
    position: number
    type: 'edge' | 'center' | 'grid'
}

interface BoundingBox {
    id: string
    x: number
    y: number
    width: number
    height: number
}

/**
 * Calculate snap points from sibling blocks
 */
export function calculateSnapPoints(
    siblings: BoundingBox[],
    sectionWidth: number,
    sectionHeight: number,
    gridSize: number = 0
): { xPoints: SnapPoint[], yPoints: SnapPoint[] } {
    const xPoints: SnapPoint[] = []
    const yPoints: SnapPoint[] = []

    // Section center lines
    xPoints.push({ position: sectionWidth / 2, type: 'centerX' })
    yPoints.push({ position: sectionHeight / 2, type: 'centerY' })

    // Section edges
    xPoints.push({ position: 0, type: 'left' })
    xPoints.push({ position: sectionWidth, type: 'right' })
    yPoints.push({ position: 0, type: 'top' })
    yPoints.push({ position: sectionHeight, type: 'bottom' })

    // Grid lines (if enabled)
    if (gridSize > 0) {
        for (let x = gridSize; x < sectionWidth; x += gridSize) {
            xPoints.push({ position: x, type: 'gridX' })
        }
        for (let y = gridSize; y < sectionHeight; y += gridSize) {
            yPoints.push({ position: y, type: 'gridY' })
        }
    }

    // Sibling edges and centers
    for (const sibling of siblings) {
        // X axis - left edge, right edge, center
        xPoints.push({ position: sibling.x, type: 'left', sourceId: sibling.id })
        xPoints.push({ position: sibling.x + sibling.width, type: 'right', sourceId: sibling.id })
        xPoints.push({ position: sibling.x + sibling.width / 2, type: 'centerX', sourceId: sibling.id })

        // Y axis - top edge, bottom edge, center
        yPoints.push({ position: sibling.y, type: 'top', sourceId: sibling.id })
        yPoints.push({ position: sibling.y + sibling.height, type: 'bottom', sourceId: sibling.id })
        yPoints.push({ position: sibling.y + sibling.height / 2, type: 'centerY', sourceId: sibling.id })
    }

    return { xPoints, yPoints }
}

/**
 * Apply snapping to a position
 */
export function applySnapping(
    x: number,
    y: number,
    width: number,
    height: number,
    xPoints: SnapPoint[],
    yPoints: SnapPoint[],
    threshold: number = 8
): SnapResult {
    let finalX = x
    let finalY = y
    let snappedX = false
    let snappedY = false
    const guides: SnapGuide[] = []

    // Component edges and center
    const componentXEdges = [x, x + width / 2, x + width] // left, center, right
    const componentYEdges = [y, y + height / 2, y + height] // top, center, bottom

    // Find closest X snap
    let closestXDist = threshold + 1
    let closestXSnap: { offset: number; point: SnapPoint } | null = null

    for (const point of xPoints) {
        for (let i = 0; i < componentXEdges.length; i++) {
            const edgeX = componentXEdges[i]
            const dist = Math.abs(edgeX - point.position)
            if (dist < closestXDist) {
                closestXDist = dist
                const offset = i === 0 ? 0 : (i === 1 ? -width / 2 : -width)
                closestXSnap = { offset, point }
            }
        }
    }

    if (closestXSnap && closestXDist <= threshold) {
        finalX = closestXSnap.point.position + closestXSnap.offset
        snappedX = true
        guides.push({
            orientation: 'vertical',
            position: closestXSnap.point.position,
            type: closestXSnap.point.type.includes('grid') ? 'grid' :
                closestXSnap.point.type.includes('center') ? 'center' : 'edge'
        })
    }

    // Find closest Y snap
    let closestYDist = threshold + 1
    let closestYSnap: { offset: number; point: SnapPoint } | null = null

    for (const point of yPoints) {
        for (let i = 0; i < componentYEdges.length; i++) {
            const edgeY = componentYEdges[i]
            const dist = Math.abs(edgeY - point.position)
            if (dist < closestYDist) {
                closestYDist = dist
                const offset = i === 0 ? 0 : (i === 1 ? -height / 2 : -height)
                closestYSnap = { offset, point }
            }
        }
    }

    if (closestYSnap && closestYDist <= threshold) {
        finalY = closestYSnap.point.position + closestYSnap.offset
        snappedY = true
        guides.push({
            orientation: 'horizontal',
            position: closestYSnap.point.position,
            type: closestYSnap.point.type.includes('grid') ? 'grid' :
                closestYSnap.point.type.includes('center') ? 'center' : 'edge'
        })
    }

    return { x: finalX, y: finalY, snappedX, snappedY, guides }
}
