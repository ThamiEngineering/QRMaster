import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { qrcodeId, userAgent, ipAddress, referrer } = body

  try {
    const supabase = await serverSupabaseClient(event)

    const device_type =
      userAgent?.includes('Mobile') ||
      userAgent?.includes('Android') ||
      userAgent?.includes('iPhone')
        ? userAgent.includes('Android')
          ? 'Mobile'
          : userAgent.includes('iPhone')
            ? 'Mobile'
            : 'Desktop'
        : 'Desktop'

    const browser = userAgent?.includes('Chrome')
      ? 'Chrome'
      : userAgent?.includes('Firefox')
        ? 'Firefox'
        : userAgent?.includes('Safari')
          ? 'Safari'
          : userAgent?.includes('Edge')
            ? 'Edge'
            : 'Unknown'

    let country = 'Unknown'
    let city = 'Unknown'

    if (ipAddress && ipAddress !== 'Unknown') {
      try {
        const ipResponse = await fetch(`http://ip-api.com/json/${ipAddress}`)
        const ipData = await ipResponse.json()

        if (ipData.status === 'success') {
          country = ipData.country || 'Unknown'
          city = ipData.city || 'Unknown'
        }
      } catch (ipError) {
        // Silently fail on IP geolocation
      }
    }

    const { data: qrcode } = await supabase
      .from('qrcodes')
      .select('campaign_id')
      .eq('id', qrcodeId)
      .single()

    const scanData = {
      qrcode_id: qrcodeId,
      campaign_id: qrcode?.campaign_id || null,
      scanned_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      country,
      city,
      device_type,
      browser,
      referrer,
    }

    const { data: scanResult, error: scanError } = await supabase
      .from('qr_scans')
      .insert(scanData)
      .select()
      .single()

    if (scanError) throw scanError

    const { error: rpcError } = await (supabase as any).rpc('increment_scan_count', {
      qrcode_id_param: qrcodeId,
    })

    if (rpcError) {
      const { data: currentQR } = await supabase
        .from('qrcodes')
        .select('scan_count')
        .eq('id', qrcodeId)
        .single()

      if (currentQR) {
        const newCount = (currentQR.scan_count || 0) + 1
        await supabase.from('qrcodes').update({ scan_count: newCount }).eq('id', qrcodeId)
      }
    }

    return { success: true, scanId: scanResult.id }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Erreur lors de l'enregistrement du scan",
    })
  }
})
