import QRCode from 'qrcode'

interface QRCodeOptions {
    width?: number
    margin?: number
    color?: {
        dark?: string
        light?: string
    }
}

/**
 * Génère une image QR code avec l'URL de tracking
 * @param qrcodeId - L'ID du QR code dans la base de données
 * @param options - Options de génération du QR code
 * @returns URL de l'image QR code en base64
 */
export const generateQRCodeWithTracking = async (
    qrcodeId: number,
    options: QRCodeOptions = {}
): Promise<string> => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : 'https://yourapp.com')

    const trackingUrl = `${baseUrl}/scan/${qrcodeId}`

    const defaultOptions: QRCodeOptions = {
        width: 256,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }

    const finalOptions = { ...defaultOptions, ...options }

    try {
        return await QRCode.toDataURL(trackingUrl, finalOptions)
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw new Error('Failed to generate QR code')
    }
}

/**
 * Génère un QR code SVG avec l'URL de tracking
 * @param qrcodeId - L'ID du QR code dans la base de données
 * @param options - Options de génération du QR code
 * @returns SVG string du QR code
 */
export const generateQRCodeSVGWithTracking = async (
    qrcodeId: number,
    options: QRCodeOptions = {}
): Promise<string> => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : 'https://yourapp.com')

    const trackingUrl = `${baseUrl}/scan/${qrcodeId}`

    const defaultOptions = {
        width: 256,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }

    const finalOptions = { ...defaultOptions, ...options }

    try {
        return await QRCode.toString(trackingUrl, {
            type: 'svg',
            ...finalOptions
        })
    } catch (error) {
        console.error('Error generating QR code SVG:', error)
        throw new Error('Failed to generate QR code SVG')
    }
}

/**
 * Génère l'URL de tracking pour un QR code
 * @param qrcodeId - L'ID du QR code
 * @returns URL de tracking
 */
export const getTrackingUrl = (qrcodeId: number): string => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || (process.client ? window.location.origin : 'https://yourapp.com')
    return `${baseUrl}/scan/${qrcodeId}`
}

/**
 * Génère plusieurs QR codes en parallèle avec tracking
 * @param qrcodeIds - Array des IDs des QR codes
 * @param options - Options de génération
 * @returns Promise d'un objet avec les QR codes générés
 */
export const generateMultipleQRCodesWithTracking = async (
    qrcodeIds: number[],
    options: QRCodeOptions = {}
): Promise<Record<number, string>> => {
    const promises = qrcodeIds.map(async (id) => {
        try {
            const qrCodeImage = await generateQRCodeWithTracking(id, options)
            return { id, qrCodeImage }
        } catch (error) {
            console.error(`Failed to generate QR code for ID ${id}:`, error)
            return { id, qrCodeImage: '' }
        }
    })

    const results = await Promise.all(promises)

    return results.reduce((acc, { id, qrCodeImage }) => {
        acc[id] = qrCodeImage
        return acc
    }, {} as Record<number, string>)
}

/**
 * Télécharge un QR code en tant que fichier
 * @param qrcodeImage - Image QR code en base64
 * @param filename - Nom du fichier à télécharger
 */
export const downloadQRCode = (qrcodeImage: string, filename: string = 'qrcode.png'): void => {
    const link = document.createElement('a')
    link.download = filename
    link.href = qrcodeImage
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Copie l'URL de tracking dans le presse-papier
 * @param qrcodeId - L'ID du QR code
 * @returns Promise indiquant le succès de l'opération
 */
export const copyTrackingUrlToClipboard = async (qrcodeId: number): Promise<boolean> => {
    try {
        const trackingUrl = getTrackingUrl(qrcodeId)
        await navigator.clipboard.writeText(trackingUrl)
        return true
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
    }
} 