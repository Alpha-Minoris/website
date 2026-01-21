/**
 * Image compression utility using the browser's Canvas API.
 * Focuses on reducing file size while maintaining visual quality.
 */

interface CompressionOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    mimeType?: string
}

/**
 * Compresses an image File or Blob.
 * Default targets: Max 1920px dimensions, 0.8 quality WebP.
 * This typically results in >75% size reduction for high-res JPEGs.
 */
export async function compressImage(
    file: File | Blob,
    options: CompressionOptions = {}
): Promise<File | Blob> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        mimeType = 'image/webp'
    } = options

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width)
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height)
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height)

                // Export to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // If it's a File, preserve the name but change extension if necessary
                            if (file instanceof File) {
                                const newName = file.name.replace(/\.[^/.]+$/, "") + (mimeType === 'image/webp' ? '.webp' : '.jpg')
                                resolve(new File([blob], newName, { type: mimeType, lastModified: Date.now() }))
                            } else {
                                resolve(blob)
                            }
                        } else {
                            reject(new Error('Canvas toBlob failed'))
                        }
                    },
                    mimeType,
                    quality
                )
            }
            img.onerror = () => reject(new Error('Failed to load image'))
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
    })
}

/**
 * Calculates a "lossless-like" high efficiency compression.
 * If the image is small already, it might just return the original or a lighter compression.
 */
export async function autoOptimize(file: File): Promise<File> {
    // If file is already small (< 200KB), just return it
    if (file.size < 200 * 1024) {
        return file
    }

    // Default high-performance settings
    return compressImage(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 0.82, // High quality but effective compression
        mimeType: 'image/webp'
    }) as Promise<File>
}
