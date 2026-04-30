<template>
  <DefaultLayout>
    <div class="space-y-4">
      <div class="rusa-gradient-header">
        <h1 class="text-2xl font-bold text-white">Mes Billets</h1>
        <p class="text-primary-100">Consultez vos billets et téléchargez-les</p>
      </div>

      <div class="rusa-card p-5">
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-primary-100/90 p-3 text-primary-700 dark:bg-primary-900/55 dark:text-primary-300">
            <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-primary-300/80">Total billets</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ rows.length }}</p>
          </div>
        </div>
      </div>

      <div class="rusa-panel">
        <p v-if="error" class="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{{ error }}</p>
        <p v-if="loading" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80">Chargement des billets…</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 dark:border-primary-800/60 dark:bg-primary-900/50">
              <tr>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">Client</th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">Trajet / départ</th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">QR</th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">Statut résa.</th>
                <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-primary-300/70">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-primary-800/50">
              <tr v-for="b in rows" :key="b.id" class="bg-white hover:bg-gray-50/80 dark:bg-primary-950/40 dark:hover:bg-primary-900/35">
                <td class="min-w-0 px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ b.nomClient }}</p>
                  <p class="truncate text-gray-500 dark:text-primary-400/85">{{ b.clientContact }}</p>
                </td>
                <td class="min-w-0 px-4 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ b.trajet }}</p>
                  <p class="text-gray-500 dark:text-primary-400/85">{{ b.dateVoyage }} · {{ b.heure }}</p>
                </td>
                <td class="max-w-[200px] px-4 py-3">
                  <code class="block truncate rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-primary-900/60 dark:text-primary-100" :title="b.qrCode">
                    {{ truncateQr(b.qrCode) }}
                  </code>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="badgeClass(b.statutReservation)">
                    {{ statutLabel(b.statutReservation) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex flex-wrap items-center gap-3">
                    <button type="button" class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200" @click="viewBillet(b)">
                      Voir billet
                    </button>
                    <button type="button" class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200" @click="downloadBillet(b)">
                      Télécharger
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!rows.length" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-primary-400/80">
            Aucun billet à afficher.
          </p>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="showDetailModal && detailBillet"
          class="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          @click.self="closeDetailModal"
        >
          <div class="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-950 shadow-2xl ring-1 ring-primary-600/20">
            <header class="relative flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 px-3 py-2.5 text-white sm:px-4 sm:py-3">
              <button type="button" class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15" aria-label="Fermer" @click="closeDetailModal">
                <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="min-w-0 flex-1 text-center text-base font-bold tracking-tight">Détails du billet</h2>
              <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-400/95 text-primary-950 ring-2 ring-white/35" aria-hidden="true">
                <svg class="size-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </span>
            </header>
            <div class="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 px-2 pb-1.5 pt-1.5 sm:px-2.5 sm:pb-2 sm:pt-2">
              <div class="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-primary-800/50 bg-white p-3 shadow-lg dark:border-primary-700/50 dark:bg-primary-900/85">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-[1rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-lg">
                      {{ billetRouteTitle(detailBillet.trajet) }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-primary-300/85">{{ billetTravelDateLong(detailBillet) }}</p>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 rounded-full bg-primary-100 p-2 text-primary-700 ring-1 ring-primary-200/80 transition hover:bg-primary-200 dark:bg-primary-600/45 dark:text-primary-100 dark:ring-primary-500/40"
                    aria-label="Partager"
                    @click="notify.toast.info('Utilisez le bouton Télécharger pour exporter le billet.')"
                  >
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>

                <div class="my-2 border-t border-dashed border-gray-200/90 dark:border-primary-600/55" />

                <div class="rounded-xl border border-gray-100 bg-gray-50/95 px-2.5 py-2 dark:border-primary-800/55 dark:bg-primary-950/45">
                  <div class="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Nom du bus</p>
                      <p class="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{{ billetBusLabel(detailBillet) }}</p>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Société</p>
                      <p class="mt-0.5 text-sm font-bold tracking-tight text-gray-900 dark:text-white">{{ societeLabel(detailBillet) }}</p>
                    </div>
                    <div class="col-span-2 min-w-0 border-t border-gray-200/80 pt-1.5 dark:border-primary-800/50">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Départ</p>
                      <p class="mt-0.5 text-sm font-bold tabular-nums text-gray-900 dark:text-white sm:text-base">{{ detailBillet.heure || '—' }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div class="text-gray-600 dark:text-primary-200/85">
                    <span class="text-gray-400 dark:text-primary-400/90">Émis</span>
                    <span class="ml-1 font-semibold text-gray-800 dark:text-primary-50">{{ detailBillet.dateGeneration }}</span>
                  </div>
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="badgeClass(detailBillet.statutReservation)">
                    {{ statutLabel(detailBillet.statutReservation) }}
                  </span>
                </div>

                <div class="mt-2 rounded-lg border border-gray-100 bg-white px-2 py-1.5 dark:border-primary-800/45 dark:bg-primary-900/35">
                  <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-primary-400/80">Client</p>
                  <p class="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">{{ detailBillet.nomClient }}</p>
                  <p class="truncate text-[11px] text-gray-500 dark:text-primary-300/85">{{ detailBillet.clientContact }}</p>
                </div>

                <div class="my-2 border-t border-dashed border-gray-200/90 dark:border-primary-600/55" />

                <div class="flex items-center justify-between rounded-xl bg-primary-50 px-2.5 py-1.5 dark:bg-primary-900/50 dark:ring-1 dark:ring-primary-700/40">
                  <span class="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">Total</span>
                  <span v-if="billetMontantFc(detailBillet)" class="text-base font-extrabold tabular-nums text-primary-600 dark:text-primary-400 sm:text-lg">
                    {{ billetMontantFc(detailBillet) }}
                  </span>
                  <span v-else class="text-sm font-medium text-gray-400 dark:text-primary-500">—</span>
                </div>

                <div v-if="detailBillet.qrCode" class="mx-auto mt-3 box-border shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" :style="{ width: `${BILLET_QR_PX}px`, height: `${BILLET_QR_PX}px` }">
                  <img v-if="qrImageDataUrl" :src="qrImageDataUrl" :width="BILLET_QR_PX" :height="BILLET_QR_PX" alt="Code QR du billet" class="block max-h-none max-w-none flex-none select-none" />
                </div>
                <p class="mx-auto mt-2 max-w-[19rem] text-center text-[10px] font-medium leading-snug text-primary-700 dark:text-primary-300">
                  À l’embarquement ou au contrôle, présentez ce code QR.
                </p>
              </div>
            </div>
            <footer class="flex shrink-0 gap-2 border-t border-primary-800/60 bg-primary-950 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
              <button type="button" class="flex-1 rounded-xl border-2 border-primary-400/60 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-300 hover:bg-primary-900/60" @click="closeDetailModal">Fermer</button>
              <button type="button" class="flex-1 rounded-xl bg-primary-500 py-2 text-sm font-bold text-primary-950 shadow-md transition hover:bg-primary-400" @click="downloadBillet(detailBillet)">Télécharger</button>
            </footer>
          </div>
        </div>
      </Teleport>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { listReservationsByClient, listReservationsByUserAndClient, mapApiStatutToUi } from '@/services/reservationService'
import { listBilletsArray, listBilletsByReservationId, mapBilletFromApi } from '@/services/billetService'
import { notify } from '@/utils/notify'
import { qrCodeToDataUrlWithLogo } from '@/utils/qrCodeWithLogo'
import { downloadBilletUnified } from '@/utils/billetDownload'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const rows = ref([])
const showDetailModal = ref(false)
const detailBillet = ref(null)
const qrImageDataUrl = ref('')
const BILLET_QR_PX = 156

function titleCaseSegment(part) {
  const p = String(part || '').trim()
  if (!p) return ''
  return p.charAt(0).toLocaleUpperCase('fr-FR') + p.slice(1).toLowerCase()
}

function billetRouteTitle(trajet) {
  const raw = String(trajet || '')
    .replace(/\s*→\s*/g, ' — ')
    .replace(/\s*->\s*/gi, ' — ')
    .trim()
  if (!raw) return '—'
  return raw
    .split(' — ')
    .map(titleCaseSegment)
    .join(' — ')
}

function billetTravelDateLong(b) {
  const d = b?.dateVoyage
  if (!d || d === '—') return '—'
  const parts = String(d).slice(0, 10).split('-')
  const y = Number(parts[0])
  const mo = Number(parts[1])
  const da = Number(parts[2])
  if (!Number.isFinite(y)) return String(d)
  const dt = new Date(y, (mo || 1) - 1, da || 1)
  const s = dt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : String(d)
}

function billetBusLabel(b) {
  const n = String(b?.numeroBus || '').trim()
  return n ? `Bus ${n}` : '—'
}

function billetIdDisplay(b) {
  const id = Number(b?.id) || 0
  if (!id) return '—'
  return `RS-${String(id).padStart(5, '0')}`
}

function societeLabel(b) {
  return String(b?.nomSociete ?? b?.raw?.nomSociete ?? b?.raw?.NomSociete ?? 'Rusa Travel').trim() || 'Rusa Travel'
}

function billetMontantFc(b) {
  const v = Number(b?.prix) || 0
  if (v <= 0) return null
  return `${v.toLocaleString('fr-CD', { maximumFractionDigits: 0 })} FC`
}

function identityFromSession() {
  const user = auth.user || {}
  const client = auth.client || {}
  const fullName = [
    user.prenom ?? user.Prenom ?? client.prenom ?? client.Prenom,
    user.nom ?? user.Nom ?? user.nomComplet ?? user.NomComplet ?? client.nom ?? client.Nom,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
  const contact =
    String(
      user.email ??
        user.Email ??
        client.email ??
        client.Email ??
        user.telephone ??
        user.Telephone ??
        client.telephone ??
        client.Telephone ??
        '',
    ).trim() || '—'
  return {
    nomClient: fullName || 'Client connecté',
    clientContact: contact,
  }
}

function pickReservationIdentity(r) {
  const fullName = [r?.prenomClient ?? r?.PrenomClient, r?.nomClient ?? r?.NomClient]
    .filter(Boolean)
    .join(' ')
    .trim()
  const contact =
    String(
      r?.emailUtilisateur ??
        r?.EmailUtilisateur ??
        r?.telephoneClient ??
        r?.TelephoneClient ??
        '',
    ).trim() || ''
  return {
    nomClient: fullName || '',
    clientContact: contact || '',
  }
}

function truncateQr(s) {
  const t = String(s || '')
  if (t.length <= 28) return t || '—'
  return `${t.slice(0, 14)}…${t.slice(-8)}`
}

function statutLabel(statutReservation) {
  const ui = mapApiStatutToUi(statutReservation)
  const labels = { confirmed: 'Confirmée', pending: 'En attente', cancelled: 'Annulée', completed: 'Terminée' }
  return labels[ui] || String(statutReservation || '—').slice(0, 24) || '—'
}

function badgeClass(statutReservation) {
  const ui = mapApiStatutToUi(statutReservation)
  const map = {
    confirmed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/55 dark:text-emerald-200',
    pending: 'bg-primary-100 text-primary-900 dark:bg-primary-900/50 dark:text-primary-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
    completed: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200',
  }
  return map[ui] || 'bg-gray-100 text-gray-800 dark:bg-primary-900/40 dark:text-primary-200'
}

function closeDetailModal() {
  showDetailModal.value = false
  detailBillet.value = null
  qrImageDataUrl.value = ''
}

async function viewBillet(b) {
  detailBillet.value = b
  showDetailModal.value = true
  qrImageDataUrl.value = ''
  const q = String(b?.qrCode || '').trim()
  if (!q) return
  try {
    qrImageDataUrl.value = await qrCodeToDataUrlWithLogo(q, {
      width: BILLET_QR_PX,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  } catch {
    qrImageDataUrl.value = ''
  }
}

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

async function svgToPngDataUrl(svg, width = 1200, height = 430) {
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

function buildBilletStyledSvg(billet, qrDataUrl) {
  const passenger = String(billet?.nomClient || 'Client').trim()
  const route = String(billet?.trajet || 'Trajet').trim()
  const dateVoy = String(billet?.dateVoyage || '—').trim()
  const departTime = String(billet?.heure || '—').trim()
  const ref = `ID: ${Number(billet?.id) || 0}`
  const contact = String(billet?.clientContact || '').trim() || '—'
  const validUntil = `${dateVoy}`.trim() || '—'
  const qrSrc = qrDataUrl || ''
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <rect x="0" y="0" width="720" height="1280" fill="#ffffff"/>
  <rect x="0" y="0" width="720" height="92" fill="#0891b2"/>
  <text x="24" y="58" style="font:700 44px Arial; fill:#ffffff;">RUSA TRAVEL</text>

  <rect x="36" y="122" width="648" height="648" rx="10" fill="#ffffff" stroke="#d1d5db"/>
  ${qrSrc ? `<image href="${qrSrc}" x="54" y="140" width="612" height="612"/>` : ''}

  <text x="40" y="834" style="font:700 40px Arial; fill:#111827;">${ref}</text>
  <text x="34" y="888" style="font:700 38px Arial; fill:#06b6d4;">D-Ticket // valable jusqu'au</text>
  <text x="34" y="928" style="font:700 38px Arial; fill:#06b6d4;">${validUntil}</text>

  <text x="40" y="985" style="font:700 42px Arial; fill:#111827;">${passenger}</text>
  <text x="40" y="1030" style="font:600 30px Arial; fill:#111827;">${contact}</text>
  <text x="40" y="1078" style="font:600 34px Arial; fill:#111827;">${route}</text>
  <text x="40" y="1122" style="font:700 36px Arial; fill:#111827;">Départ: ${departTime}</text>

  <text x="40" y="1166" style="font:500 21px Arial; fill:#4b5563;">
    Billet nominatif. Présentez ce QR code à l'embarquement avec une pièce d'identité.
  </text>

  <rect x="0" y="1212" width="720" height="68" fill="#0891b2"/>
  <text x="40" y="1256" style="font:700 30px Arial; fill:#ffffff;">Espace client · Rusa Travel</text>
</svg>`.trim()
}

async function downloadBillet(billet) {
  try {
    await downloadBilletUnified(billet, 'billet')
    notify.toast.success('Billet téléchargé')
  } catch (e) {
    notify.toast.error(e?.message || 'Impossible de télécharger le billet.')
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const user = auth.user || {}
    const idClient = Number(user.idClient ?? user.IdClient ?? auth.client?.idClient)
    const idUtilisateur = Number(user.idUtilisateur ?? user.IdUtilisateur ?? user.id)
    if (!Number.isFinite(idClient) || idClient <= 0) {
      rows.value = []
      return
    }

    let reservations = []
    if (Number.isFinite(idUtilisateur) && idUtilisateur > 0) reservations = await listReservationsByUserAndClient(idUtilisateur, idClient)
    if (!reservations.length) reservations = await listReservationsByClient(idClient)
    const reservationIdentityById = new Map(
      reservations.map((r) => [Number(r.idReservation ?? r.IdReservation), pickReservationIdentity(r)]),
    )
    const sessionIdentity = identityFromSession()

    const reservationIds = [...new Set(reservations.map((r) => Number(r.idReservation ?? r.IdReservation)).filter((n) => Number.isFinite(n) && n > 0))]

    let billets = []
    for (const idReservation of reservationIds) {
      try {
        const chunk = await listBilletsByReservationId(idReservation)
        if (Array.isArray(chunk) && chunk.length) billets.push(...chunk)
      } catch {
        // ignore
      }
    }
    if (!billets.length) {
      const all = await listBilletsArray()
      const reservationSet = new Set(reservationIds)
      billets = all.filter((b) => reservationSet.has(Number(b.idReservation ?? b.IdReservation)))
    }

    rows.value = billets
      .map((r) => {
        const mapped = mapBilletFromApi(r)
        const fallback = reservationIdentityById.get(Number(mapped.idReservation)) || sessionIdentity
        return {
          ...mapped,
          nomClient:
            String(mapped.nomClient || '').trim() && mapped.nomClient !== '—'
              ? mapped.nomClient
              : fallback.nomClient || sessionIdentity.nomClient,
          clientContact:
            String(mapped.clientContact || '').trim() && mapped.clientContact !== '—'
              ? mapped.clientContact
              : fallback.clientContact || sessionIdentity.clientContact,
        }
      })
      .sort((a, b) => {
        const da = new Date(String(a.raw?.dateGeneration ?? a.raw?.DateGeneration ?? '')).getTime()
        const db = new Date(String(b.raw?.dateGeneration ?? b.raw?.DateGeneration ?? '')).getTime()
        return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0)
      })
  } catch (e) {
    error.value = e?.message || 'Impossible de charger les billets client.'
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

