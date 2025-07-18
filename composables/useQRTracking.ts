import type { Database } from '~/types/supabase'

interface UserAgentInfo {
    device_type: string
    browser: string
}

interface LocationInfo {
    country: string
    city: string
}

interface QRCodeAnalytics {
    totalScans: number
    uniqueVisitors: number
    scansByCountry: Record<string, number>
    scansByCity: Record<string, number>
    scansByDevice: Record<string, number>
    scansByBrowser: Record<string, number>
    scansByDate: Record<string, number>
    recentScans: any[]
    qrcode: any | null
}

interface GlobalAnalytics {
    totalScans: number
    uniqueVisitors: number
    topCountries: [string, number][]
    topCities: [string, number][]
    deviceBreakdown: Record<string, number>
    browserBreakdown: Record<string, number>
    scanTrend: Record<string, number>
    topQRCodes: [string, number][]
    recentActivity: any[]
}

interface QRScanWithQRCode {
    id: number
    qrcode_id: number
    campaign_id: number | null
    scanned_at: string
    ip_address: string | null
    user_agent: string | null
    country: string | null
    city: string | null
    device_type: string | null
    browser: string | null
    referrer: string | null
    qrcodes?: {
        name: string
        type: string
        content: string
        scan_count: number
        created_at: string
    } | null
}

interface QRScanWithQRCodeFull {
    id: number
    qrcode_id: number
    campaign_id: number | null
    scanned_at: string
    ip_address: string | null
    user_agent: string | null
    country: string | null
    city: string | null
    device_type: string | null
    browser: string | null
    referrer: string | null
    qrcodes?: {
        user_id: string
        name: string
        type: string
        campaign_id: number | null
    } | null
}

export const useQRTracking = () => {
    const supabase = useSupabaseClient<Database>()
    const config = useRuntimeConfig()

    const parseUserAgent = (userAgent?: string | null): UserAgentInfo => {
        if (!userAgent) return { device_type: 'Unknown', browser: 'Unknown' }

        let device_type = 'Desktop'
        let browser = 'Unknown'

        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            if (/iPad/i.test(userAgent)) {
                device_type = 'Tablet'
            } else if (/Android/i.test(userAgent) && /Mobile/i.test(userAgent)) {
                device_type = 'Mobile'
            } else if (/iPhone|iPod/i.test(userAgent)) {
                device_type = 'Mobile'
            } else {
                device_type = 'Mobile'
            }
        } else if (/Tablet/i.test(userAgent)) {
            device_type = 'Tablet'
        }

        if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
            browser = 'Chrome'
        } else if (/Firefox/i.test(userAgent)) {
            browser = 'Firefox'
        } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
            browser = 'Safari'
        } else if (/Edge/i.test(userAgent)) {
            browser = 'Edge'
        } else if (/Opera/i.test(userAgent)) {
            browser = 'Opera'
        } else if (/MSIE|Trident/i.test(userAgent)) {
            browser = 'Internet Explorer'
        }

        return { device_type, browser }
    }

    const getLocationFromIP = async (ip?: string | null): Promise<LocationInfo> => {
        if (!ip || ip === 'Unknown') {
            return { country: 'Unknown', city: 'Unknown' }
        }

        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`)
            if (response.ok) {
                const data = await response.json()
                return {
                    country: data.country_name || 'Unknown',
                    city: data.city || 'Unknown'
                }
            }
        } catch (error) {
            console.warn('Error getting location from IP:', error)
        }

        return { country: 'Unknown', city: 'Unknown' }
    }

    const recordScan = async (
        qrcodeId: number,
        userAgent?: string | null,
        ipAddress?: string | null,
        referrer?: string | null
    ) => {
        try {
            console.log('📊 recordScan starting...', { qrcodeId, userAgent, ipAddress, referrer })
            const { device_type, browser } = parseUserAgent(userAgent)

            const { country, city } = await getLocationFromIP(ipAddress)

            const { data: qrcode } = await supabase
                .from('qrcodes')
                .select('campaign_id')
                .eq('id', qrcodeId)
                .single()

            console.log('💾 Inserting scan data...', {
                qrcode_id: qrcodeId,
                campaign_id: qrcode?.campaign_id || null,
                country,
                city,
                device_type,
                browser
            })

            const { data, error } = await supabase
                .from('qr_scans')
                .insert({
                    qrcode_id: qrcodeId,
                    campaign_id: qrcode?.campaign_id || null,
                    scanned_at: new Date().toISOString(),
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    country,
                    city,
                    device_type,
                    browser,
                    referrer
                })
                .select()
                .single()

            console.log('💾 Insert result:', { data, error })

            const { data: currentQR } = await supabase
                .from('qrcodes')
                .select('scan_count')
                .eq('id', qrcodeId)
                .single()

            if (currentQR) {
                const newScanCount = (currentQR.scan_count || 0) + 1
                console.log('🔢 Updating scan count...', { currentCount: currentQR.scan_count, newCount: newScanCount })

                const updateResult = await supabase
                    .from('qrcodes')
                    .update({ scan_count: newScanCount })
                    .eq('id', qrcodeId)

                console.log('🔢 Update scan count result:', updateResult)
            }

            return { data, error }
        } catch (error) {
            console.error('Error recording scan:', error)
            return { data: null, error }
        }
    }

    const getQRCodeAnalytics = async (qrcodeId: number) => {
        try {
            const { data, error } = await supabase
                .from('qr_scans')
                .select(`
          *,
          qrcodes (
            name,
            type,
            content,
            scan_count,
            created_at
          )
        `)
                .eq('qrcode_id', qrcodeId)
                .order('scanned_at', { ascending: false })

            if (error) throw error

            const typedData = data as QRScanWithQRCode[]

            const analytics: QRCodeAnalytics = {
                totalScans: typedData.length,
                uniqueVisitors: new Set(typedData.map((scan: QRScanWithQRCode) => scan.ip_address)).size,
                scansByCountry: {},
                scansByCity: {},
                scansByDevice: {},
                scansByBrowser: {},
                scansByDate: {},
                recentScans: typedData.slice(0, 10),
                qrcode: typedData[0]?.qrcodes || null
            }

            typedData.forEach((scan: QRScanWithQRCode) => {
                if (scan.country) {
                    analytics.scansByCountry[scan.country] = (analytics.scansByCountry[scan.country] || 0) + 1
                }
            })

            typedData.forEach((scan: QRScanWithQRCode) => {
                if (scan.city) {
                    analytics.scansByCity[scan.city] = (analytics.scansByCity[scan.city] || 0) + 1
                }
            })

            typedData.forEach((scan: QRScanWithQRCode) => {
                if (scan.device_type) {
                    analytics.scansByDevice[scan.device_type] = (analytics.scansByDevice[scan.device_type] || 0) + 1
                }
            })

            typedData.forEach((scan: QRScanWithQRCode) => {
                if (scan.browser) {
                    analytics.scansByBrowser[scan.browser] = (analytics.scansByBrowser[scan.browser] || 0) + 1
                }
            })

            typedData.forEach((scan: QRScanWithQRCode) => {
                const date = new Date(scan.scanned_at).toDateString()
                analytics.scansByDate[date] = (analytics.scansByDate[date] || 0) + 1
            })

            return { data: analytics, error: null }
        } catch (error) {
            console.error('Error fetching QR code analytics:', error)
            return { data: null, error }
        }
    }

    const getGlobalAnalytics = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('qr_scans')
                .select(`
          *,
          qrcodes!inner (
            user_id,
            name,
            type,
            campaign_id
          )
        `)
                .eq('qrcodes.user_id', userId)
                .order('scanned_at', { ascending: false })

            if (error) throw error

            const typedData = data as QRScanWithQRCodeFull[]

            const analytics: GlobalAnalytics = {
                totalScans: typedData.length,
                uniqueVisitors: new Set(typedData.map((scan: QRScanWithQRCodeFull) => scan.ip_address)).size,
                topCountries: [],
                topCities: [],
                deviceBreakdown: {},
                browserBreakdown: {},
                scanTrend: {},
                topQRCodes: [],
                recentActivity: typedData.slice(0, 20)
            }

            const tempCountries: Record<string, number> = {}
            const tempCities: Record<string, number> = {}
            const tempQRCodes: Record<string, number> = {}

            typedData.forEach((scan: QRScanWithQRCodeFull) => {
                if (scan.country) {
                    tempCountries[scan.country] = (tempCountries[scan.country] || 0) + 1
                }

                if (scan.city) {
                    tempCities[scan.city] = (tempCities[scan.city] || 0) + 1
                }

                if (scan.device_type) {
                    analytics.deviceBreakdown[scan.device_type] = (analytics.deviceBreakdown[scan.device_type] || 0) + 1
                }

                if (scan.browser) {
                    analytics.browserBreakdown[scan.browser] = (analytics.browserBreakdown[scan.browser] || 0) + 1
                }

                const qrName = scan.qrcodes?.name || 'Unknown'
                tempQRCodes[qrName] = (tempQRCodes[qrName] || 0) + 1

                const date = new Date(scan.scanned_at).toDateString()
                analytics.scanTrend[date] = (analytics.scanTrend[date] || 0) + 1
            })

            analytics.topCountries = Object.entries(tempCountries)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)

            analytics.topCities = Object.entries(tempCities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)

            analytics.topQRCodes = Object.entries(tempQRCodes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)

            return { data: analytics, error: null }
        } catch (error) {
            console.error('Error fetching global analytics:', error)
            return { data: null, error }
        }
    }

    const generateTrackingUrl = (qrcodeId: number): string => {
        const baseUrl = config.public.baseUrl || 'https://yourapp.com'
        return `${baseUrl}/scan/${qrcodeId}`
    }

    const getClientIP = (event: any): string => {
        const forwarded = event.node?.req?.headers?.['x-forwarded-for']
        const real = event.node?.req?.headers?.['x-real-ip']
        const remote = event.node?.req?.connection?.remoteAddress

        if (forwarded && typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim()
        }
        if (real && typeof real === 'string') {
            return real
        }
        return (remote as string) || 'Unknown'
    }

    return {
        parseUserAgent,
        getLocationFromIP,
        recordScan,
        getQRCodeAnalytics,
        getGlobalAnalytics,
        generateTrackingUrl,
        getClientIP
    }
} 