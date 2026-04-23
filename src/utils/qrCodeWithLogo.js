import QRCode from 'qrcode'

function publicAssetUrl(relativePath) {
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${path}`.replace(/([^:]\/)\/+/g, '$1')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Image failed: ${src}`))
    img.src = src
  })
}

async function loadRusaLogo() {
  const candidates = [
    publicAssetUrl('images/logo/logo.png'),
    publicAssetUrl('images/logo/auth-logo.png'),
  ]
  for (const src of candidates) {
    try {
      return await loadImage(src)
    } catch {
      /* try next */
    }
  }
  return null
}

function fillRoundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
  ctx.fill()
}

/**
 * Data URL PNG : QR avec logo Rusa Travel au centre (correction d’erreur H).
 * @param {string} text
 * @param {{ width?: number, margin?: number, color?: { dark?: string, light?: string } }} [options]
 * @returns {Promise<string>}
 */
export async function qrCodeToDataUrlWithLogo(text, options = {}) {
  const width = options.width ?? 260
  const margin = options.margin ?? 2
  const color = options.color || { dark: '#0f172a', light: '#ffffff' }

  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, String(text), {
    width,
    margin,
    errorCorrectionLevel: 'H',
    color: { dark: color.dark ?? '#0f172a', light: color.light ?? '#ffffff' },
  })

  const logoImg = await loadRusaLogo()
  if (!logoImg || !logoImg.naturalWidth) {
    return canvas.toDataURL('image/png')
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL('image/png')

  const w = canvas.width
  const h = canvas.height
  const logoMax = Math.round(Math.min(w, h) * 0.2)
  const padding = Math.max(4, Math.round(Math.min(w, h) * 0.028))

  let lw = logoMax
  let lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw
  if (lh > logoMax) {
    lh = logoMax
    lw = (logoImg.naturalWidth / logoImg.naturalHeight) * lh
  }
  lw = Math.round(lw)
  lh = Math.round(lh)

  const bgW = Math.round(lw + padding * 2)
  const bgH = Math.round(lh + padding * 2)
  const bx = Math.round((w - bgW) / 2)
  const by = Math.round((h - bgH) / 2)
  const corner = Math.min(14, Math.round(Math.min(bgW, bgH) * 0.22))

  ctx.save()
  ctx.fillStyle = color.light ?? '#ffffff'
  fillRoundRect(ctx, bx, by, bgW, bgH, corner)
  ctx.restore()

  const ix = Math.round((w - lw) / 2)
  const iy = Math.round((h - lh) / 2)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(logoImg, ix, iy, lw, lh)

  return canvas.toDataURL('image/png')
}
