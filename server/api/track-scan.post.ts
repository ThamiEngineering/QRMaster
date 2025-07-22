import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { qrcodeId, userAgent, ipAddress, referrer } = body

  console.log('🚀 [API] Début de l\'enregistrement du scan')
  console.log('🚀 [API] Données reçues:', { qrcodeId, userAgent, ipAddress, referrer })

  try {
    // Utiliser le client standard côté serveur (devrait avoir les bonnes permissions via RLS)
    const supabase = await serverSupabaseClient(event)
    
    // Parse user agent
    const device_type = userAgent?.includes('Mobile') || userAgent?.includes('Android') || userAgent?.includes('iPhone') 
      ? userAgent.includes('Android') ? 'Mobile' 
      : userAgent.includes('iPhone') ? 'Mobile'
      : 'Desktop'
      : 'Desktop'
    
    const browser = userAgent?.includes('Chrome') ? 'Chrome'
      : userAgent?.includes('Firefox') ? 'Firefox'
      : userAgent?.includes('Safari') ? 'Safari'
      : userAgent?.includes('Edge') ? 'Edge'
      : 'Unknown'

    console.log('📱 [API] User Agent parsé:', { device_type, browser })

    // Get location (simplified)
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
        console.warn('⚠️ [API] Erreur IP:', ipError)
      }
    }

    console.log('🌍 [API] Localisation:', { country, city })

    // Get QR code info
    const { data: qrcode } = await supabase
      .from('qrcodes')
      .select('campaign_id')
      .eq('id', qrcodeId)
      .single()

    console.log('🔍 [API] QR code info:', qrcode)

    // Insert scan
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

    console.log('💾 [API] Insertion du scan avec:', scanData)

    const { data: scanResult, error: scanError } = await supabase
      .from('qr_scans')
      .insert(scanData)
      .select()
      .single()

    if (scanError) {
      console.error('❌ [API] Erreur insertion scan:', scanError)
      throw scanError
    }

    console.log('✅ [API] Scan inséré:', scanResult)

    // Increment counter
    console.log('🔢 [API] Tentative RPC increment_scan_count...')
    
    const { error: rpcError } = await (supabase as any).rpc('increment_scan_count', {
      qrcode_id_param: qrcodeId
    })

    if (rpcError) {
      console.error('❌ [API] Erreur RPC:', rpcError)
      
      // Fallback
      console.log('🔄 [API] Fallback vers UPDATE...')
      const { data: currentQR } = await supabase
        .from('qrcodes')
        .select('scan_count')
        .eq('id', qrcodeId)
        .single()

      if (currentQR) {
        const newCount = (currentQR.scan_count || 0) + 1
        console.log('🔢 [API] UPDATE vers:', newCount)
        
        const { error: updateError } = await supabase
          .from('qrcodes')
          .update({ scan_count: newCount })
          .eq('id', qrcodeId)

        if (updateError) {
          console.error('❌ [API] Erreur UPDATE:', updateError)
        } else {
          console.log('✅ [API] Compteur mis à jour via UPDATE')
        }
      }
    } else {
      console.log('✅ [API] Compteur incrémenté via RPC')
    }

    return { success: true, scanId: scanResult.id }

  } catch (error) {
    console.error('❌ [API] Erreur générale:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de l\'enregistrement du scan'
    })
  }
}) 