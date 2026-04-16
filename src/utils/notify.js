import Swal from 'sweetalert2'

const swalDefaults = {
  confirmButtonText: 'OK',
  cancelButtonText: 'Annuler',
  confirmButtonColor: '#465fff',
  cancelButtonColor: '#6b7280',
}

/**
 * Notifications UI partagées (SweetAlert2).
 * @param {string} title
 * @param {string} [text]
 */
function warning(title, text) {
  return Swal.fire({
    ...swalDefaults,
    icon: 'warning',
    title,
    text: text || '',
    confirmButtonText: 'OK',
  })
}

/**
 * @param {string} title
 * @param {string} [text]
 */
function error(title, text) {
  return Swal.fire({
    ...swalDefaults,
    icon: 'error',
    title,
    text: text || '',
    confirmButtonText: 'OK',
  })
}

/**
 * @param {string} title
 * @param {string} [text]
 */
function info(title, text) {
  return Swal.fire({
    ...swalDefaults,
    icon: 'info',
    title,
    text: text || '',
    confirmButtonText: 'OK',
  })
}

/**
 * @param {string} message — corps du message
 * @param {string} [title] — titre de la boîte (défaut : Confirmation)
 * @returns {Promise<boolean>}
 */
async function confirm(message, title) {
  const r = await Swal.fire({
    ...swalDefaults,
    icon: 'question',
    title: title || 'Confirmation',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Confirmer',
  })
  return r.isConfirmed
}

const toast = {
  /** @param {string} message */
  success(message) {
    return Swal.fire({
      icon: 'success',
      title: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3200,
      timerProgressBar: true,
    })
  },
}

export const notify = {
  warning,
  error,
  info,
  confirm,
  toast,
}
