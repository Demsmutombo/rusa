/**
 * Export PDF des réservations (mise en page HTML → canvas → PDF).
 * @param {object} params
 * @param {object[]} params.reservations — lignes mappées (mapReservationFromApi)
 * @param {object | null} params.societe — réponse GET /api/Societe/{id}
 * @param {string} [params.filterSummary] — résumé des filtres actifs
 * @param {(n: number) => string} [params.formatMoneyFc]
 * @param {(status: string) => string} [params.statusLabel]
 */

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Réponses API parfois enveloppées `{ data: { … } }`. */
function normalizeSocietePayload(societe) {
  if (!societe || typeof societe !== 'object') return null
  const d = societe.data
  if (d && typeof d === 'object' && !Array.isArray(d)) return d
  return societe
}

function cell(s) {
  const t = String(s ?? '').trim()
  return escHtml(t || '—')
}

function formatMoneyDefault(n) {
  const v = Number(n) || 0
  return `${v.toLocaleString('fr-CD', { maximumFractionDigits: 0 })} FC`
}

function rawTrim(s) {
  return String(s ?? '').trim()
}

/** En-tête « papier à en-tête » : pas de tableau, blocs typographiques. */
function buildSocieteSection(societe) {
  societe = normalizeSocietePayload(societe)
  if (!societe || typeof societe !== 'object') {
    return `
      <div style="margin:0;padding:12px 16px;border-top:1px solid #e2e8f0;background:#fff5f5;border-left:4px solid #f87171;font-size:10px;color:#991b1b;">
        <strong>Informations société</strong> — Non disponibles (contexte ou API). Le tableau des réservations est néanmoins exporté.
      </div>`
  }

  const s = societe
  const idSoc = Number(s.idSociete ?? s.IdSociete)
  const idChip =
    Number.isFinite(idSoc) && idSoc > 0
      ? `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:9px;font-weight:600;border:1px solid #e2e8f0;">Réf. société ${escHtml(String(idSoc))}</span>`
      : ''
  const nom = cell(s.nom ?? s.Nom)
  const type = rawTrim(s.type ?? s.Type)
  const devise = rawTrim(s.devise ?? s.Devise)
  const tel = rawTrim(s.telephone ?? s.Telephone)
  const email = rawTrim(s.emailContact ?? s.EmailContact)
  const site = rawTrim(s.siteWeb ?? s.SiteWeb)
  const resp = rawTrim(s.nomCompletResponsable ?? s.NomCompletResponsable)
  const genre = rawTrim(s.genreResponsable ?? s.GenreResponsable)
  const desc = rawTrim(s.description ?? s.Description)
  const adr = rawTrim(s.adresseResidence ?? s.AdresseResidence)
  const actif =
    s.statut === false || s.Statut === false
      ? '<span style="color:#b91c1c;font-weight:700;font-size:9px;">Société inactive</span>'
      : '<span style="color:#047857;font-weight:700;font-size:9px;">Société active</span>'

  const taglineParts = [type, devise].filter(Boolean).map(escHtml)
  const tagline =
    taglineParts.length > 0
      ? `<p style="margin:6px 0 0 0;font-size:10px;color:#64748b;font-style:italic;letter-spacing:0.01em;">${taglineParts.join(' · ')}</p>`
      : ''

  const contactBits = []
  if (tel) contactBits.push(`<span style="white-space:nowrap;"><span style="color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:0.06em;">Tél.</span> ${escHtml(tel)}</span>`)
  if (email) contactBits.push(`<span style="white-space:nowrap;"><span style="color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:0.06em;">E-mail</span> ${escHtml(email)}</span>`)
  if (site) contactBits.push(`<span style="white-space:nowrap;"><span style="color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:0.06em;">Web</span> ${escHtml(site)}</span>`)
  const contactLine =
    contactBits.length > 0
      ? `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10px;color:#0f172a;line-height:1.75;">${contactBits.join(' <span style="color:#cbd5e1;">·</span> ')}</div>`
      : ''

  const respLine =
    resp || genre
      ? `<p style="margin:10px 0 0 0;font-size:10px;color:#334155;"><span style="color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:0.06em;">Responsable</span><br/><strong style="font-weight:600;">${escHtml(resp || '—')}</strong>${genre && genre !== '—' ? ` <span style="color:#64748b;">(${escHtml(genre)})</span>` : ''}</p>`
      : ''

  const adrBlock =
    adr && adr !== '—'
      ? `<p style="margin:8px 0 0 0;font-size:10px;color:#334155;white-space:pre-wrap;line-height:1.5;"><span style="color:#94a3b8;font-size:8px;text-transform:uppercase;letter-spacing:0.06em;">Adresse</span><br/>${escHtml(adr)}</p>`
      : ''

  const descBlock = desc
    ? `<p style="margin:12px 0 0 0;padding-top:10px;border-top:1px solid #f1f5f9;font-size:9px;color:#475569;line-height:1.55;font-style:italic;">${escHtml(desc)}</p>`
    : ''

  return `
    <div class="rusa-societe-en-tete" style="margin:0;padding:0;background:#fff;">
      <div style="height:3px;background:linear-gradient(90deg,#14b8a6,#0d9488,#115e59);opacity:0.85;"></div>
      <div style="padding:16px 18px 18px 18px;border-left:4px solid #0d9488;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="flex:1;min-width:180px;">
            <p style="margin:0 0 2px 0;font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.14em;">Émetteur du document</p>
            <h2 style="margin:0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;line-height:1.15;">${nom}</h2>
            ${tagline}
          </div>
          <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
            ${idChip}
            ${actif}
          </div>
        </div>
        ${contactLine}
        ${respLine}
        ${adrBlock}
        ${descBlock}
      </div>
    </div>`
}

function formatLongDateFr(isoDate) {
  const s = String(isoDate || '').slice(0, 10)
  if (!s || s === '—') return '—'
  const parts = s.split('-').map((x) => Number(x))
  const y = parts[0]
  const mo = parts[1]
  const da = parts[2]
  if (!Number.isFinite(y)) return s
  const dt = new Date(y, (mo || 1) - 1, da || 1)
  try {
    const out = dt.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return out ? out.charAt(0).toUpperCase() + out.slice(1) : s
  } catch {
    return s
  }
}

function routeTitleReservation(r) {
  const dep = String(r.departure || '').trim() || '—'
  const arr = String(r.arrival || '').trim() || '—'
  return `${escHtml(dep)} — ${escHtml(arr)}`
}

/** Cartes type « billet » (modèle mobile), couleurs alignées sur le thème primary / teal. */
function buildReservationTicketCards(rows, formatMoneyFc, statusLabel) {
  const fmt = formatMoneyFc || formatMoneyDefault
  const st = statusLabel || ((x) => String(x || ''))

  const cards = rows
    .map((r) => {
      const apiSt = r.apiStatutReservation ? ` (${escHtml(r.apiStatutReservation)})` : ''
      const stat = `${escHtml(st(r.status))}${apiSt}`
      const total = escHtml(fmt(Number(r.totalPrice) || 0))
      const longDate = escHtml(formatLongDateFr(r.date))
      return `
      <div style="margin-bottom:14px;border-radius:16px;border:1px solid #5eead4;background:linear-gradient(180deg,#ecfdf5 0%,#f0fdfa 40%,#ffffff 100%);overflow:hidden;page-break-inside:avoid;box-shadow:0 2px 8px rgba(13,148,136,0.12);">
        <div style="padding:14px 16px 12px;background:#fff;">
          <div style="font-size:14px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;line-height:1.2;">${routeTitleReservation(r)}</div>
          <div style="margin-top:6px;font-size:9px;color:#64748b;">${longDate}</div>
        </div>
        <div style="height:0;border-top:1px dashed #94a3b8;margin:0 14px;opacity:0.7;"></div>
        <div style="padding:12px 16px;background:#fff;">
          <div style="display:grid;grid-template-columns:1fr 1fr;column-gap:18px;row-gap:10px;font-size:9px;">
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Client</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${cell(r.clientName)}</div>
            </div>
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">E-mail</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;word-break:break-all;">${cell(r.clientEmail)}</div>
            </div>
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Transport</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${cell(r.carrier)}</div>
            </div>
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Heure</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${cell(r.time)}</div>
            </div>
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Places</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${cell(r.places)}</div>
            </div>
            <div>
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Création</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${cell(r.createdAt)}</div>
            </div>
            <div style="grid-column:1/-1;">
              <div style="color:#64748b;font-size:8px;text-transform:uppercase;letter-spacing:0.05em;">Statut</div>
              <div style="font-weight:700;color:#0f172a;margin-top:2px;">${stat}</div>
            </div>
          </div>
        </div>
        <div style="height:0;border-top:1px dashed #94a3b8;margin:0 14px;opacity:0.7;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#fff;">
          <span style="font-size:11px;font-weight:800;color:#0f172a;">Total</span>
          <span style="font-size:14px;font-weight:800;color:#0d9488;">${total}</span>
        </div>
        <div style="padding:8px 14px 12px;background:#ccfbf1;font-size:8px;color:#115e59;text-align:center;line-height:1.45;">
          Note : document de suivi interne — présentez les justificatifs officiels en agence. Montants en FC.
        </div>
      </div>`
    })
    .join('')

  return `
    <div style="margin-top:10px;">
      <h2 style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#0f766e;">Réservations (${rows.length})</h2>
      ${cards}
    </div>`
}

function buildDocumentHtml({ reservations, societe, filterSummary, formatMoneyFc, statusLabel }) {
  const now = new Date()
  const dateStr = now.toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const filt = filterSummary ? escHtml(filterSummary) : 'Aucun filtre (liste complète chargée).'

  return `
    <div class="rusa-reservations-pdf-root" style="font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;line-height:1.35;padding:4px 8px 20px;box-sizing:border-box;width:100%;max-width:277mm;background:#fff;">
      <header style="border-radius:12px;overflow:hidden;margin-bottom:12px;border:1px solid #0f7669;box-shadow:0 2px 10px rgba(15,23,42,0.07);">
        <div style="background:linear-gradient(135deg,#14b8a6 0%,#0f766e 55%,#134e4a 100%);color:#fff;padding:16px 18px;">
          <div style="font-size:9px;opacity:0.9;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Rusa Travel</div>
          <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.02em;">Liste des réservations</h1>
          <p style="margin:8px 0 0 0;font-size:10px;opacity:0.92;">Document généré le ${escHtml(dateStr)} — montants en francs congolais (FC).</p>
        </div>
        ${buildSocieteSection(societe)}
      </header>
      <p style="margin:0 0 12px 0;font-size:9px;color:#475569;background:#f1f5f9;border-radius:8px;padding:8px 10px;border:1px solid #e2e8f0;"><strong>Filtres / périmètre :</strong> ${filt}</p>
      ${buildReservationTicketCards(reservations, formatMoneyFc, statusLabel)}
      <footer style="margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:8px;color:#64748b;text-align:center;">
        Rusa Travel — export réservé à un usage interne. Reproduction interdite sans autorisation.
      </footer>
    </div>`
}

export async function exportReservationsToPdf({
  reservations,
  societe,
  filterSummary,
  formatMoneyFc,
  statusLabel,
}) {
  const html2pdf = (await import('html2pdf.js')).default

  const host = document.createElement('div')
  host.setAttribute('data-rusa-pdf-export', '1')
  host.style.cssText =
    'position:fixed;left:0;top:0;width:297mm;max-width:297mm;z-index:-1;opacity:0;pointer-events:none;overflow:visible;background:#fff;'
  document.body.appendChild(host)

  const inner = document.createElement('div')
  inner.innerHTML = buildDocumentHtml({
    reservations,
    societe,
    filterSummary,
    formatMoneyFc,
    statusLabel,
  })
  host.appendChild(inner.firstElementChild)

  const root = host.querySelector('.rusa-reservations-pdf-root')
  if (!root) {
    document.body.removeChild(host)
    throw new Error('Mise en page PDF invalide.')
  }

  const filename = `reservations_${new Date().toISOString().slice(0, 10)}.pdf`
  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    await html2pdf().set(opt).from(root).save()
  } finally {
    document.body.removeChild(host)
  }
}
