import { qrCodeToDataUrlWithLogo } from '@/utils/qrCodeWithLogo'

function triggerDownloadUrl(url, filename = '') {
  const a = document.createElement('a')
  a.href = url
  if (filename) a.download = filename
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function svgToPngDataUrl(svg, width = 720, height = 1280) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas indisponible')
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

function safe(v, fallback = '—') {
  const s = String(v ?? '').trim()
  return s || fallback
}

function slugPart(v, fallback = 'item') {
  const s = String(v || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || fallback
}

function fileNamePart(v, fallback = 'item') {
  const raw = String(v || '').trim()
  if (!raw) return fallback
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || fallback
}

function buildBilletStyledSvg(billet, qrDataUrl) {
  const passenger = safe(billet?.nomClient, 'Client')
  const societe = safe(billet?.nomSociete ?? billet?.societe, 'Rusa Travel')
  const route = safe(billet?.trajet, 'Trajet')
  const dateVoy = safe(billet?.dateVoyage)
  const departTime = safe(billet?.heure)
  const contact = safe(billet?.clientContact)
  const validUntil = dateVoy
  const qrSrc = qrDataUrl || ''

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <rect x="0" y="0" width="720" height="1280" fill="#ffffff"/>
  <rect x="0" y="0" width="720" height="92" fill="#0891b2"/>
  <text x="24" y="58" style="font:700 44px Arial; fill:#ffffff;">RUSA TRAVEL</text>

  <rect x="36" y="122" width="648" height="648" rx="10" fill="#ffffff" stroke="#d1d5db"/>
  ${qrSrc ? `<image href="${qrSrc}" x="54" y="140" width="612" height="612"/>` : ''}

  <text x="40" y="834" style="font:700 34px Arial; fill:#111827;">Client: ${passenger}</text>
  <text x="40" y="872" style="font:700 34px Arial; fill:#111827;">Société: ${societe}</text>
  <text x="34" y="918" style="font:700 38px Arial; fill:#06b6d4;">D-Ticket // valable jusqu'au</text>
  <text x="34" y="958" style="font:700 38px Arial; fill:#06b6d4;">${validUntil}</text>

  <text x="40" y="1000" style="font:600 30px Arial; fill:#111827;">${contact}</text>
  <text x="40" y="1048" style="font:600 34px Arial; fill:#111827;">${route}</text>
  <text x="40" y="1092" style="font:700 36px Arial; fill:#111827;">Départ: ${departTime}</text>

  <text x="40" y="1148" style="font:500 21px Arial; fill:#4b5563;">
    Billet nominatif. Présentez ce QR code à l'embarquement avec une pièce d'identité.
  </text>

  <rect x="0" y="1212" width="720" height="68" fill="#0891b2"/>
  <text x="40" y="1256" style="font:700 30px Arial; fill:#ffffff;">Espace client · Rusa Travel</text>
</svg>`.trim()
}

export async function downloadBilletUnified(billet, filenamePrefix = 'billet') {
  const b = billet && typeof billet === 'object' ? billet : null
  if (!b) throw new Error('Billet invalide.')
  const qr = String(b.qrCode || '').trim()
  if (!qr) throw new Error('QR code manquant pour ce billet.')
  const dataUrl = await qrCodeToDataUrlWithLogo(qr, {
    width: 512,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
  const svg = buildBilletStyledSvg(b, dataUrl)
  const pngDataUrl = await svgToPngDataUrl(svg, 720, 1280)
  const id = Number(b.id) || Date.now()
  const client = fileNamePart(b.nomClient, 'Client')
  const date = fileNamePart(b.dateVoyage, 'Date')
  triggerDownloadUrl(
    pngDataUrl,
    `${slugPart(filenamePrefix, 'billet')}-${id}-${client}-${date}.png`,
  )
}

