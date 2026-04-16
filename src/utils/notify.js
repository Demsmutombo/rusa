import Swal from 'sweetalert2'

/**
 * Notifications UI partagées (SweetAlert2).
 * @param {string} title
 * @param {string} [text]
 */
function warning(title, text) {
  return Swal.fire({
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
    icon: 'error',
    title,
    text: text || '',
    confirmButtonText: 'OK',
  })
}

/**
 * @param {string} message
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
async function confirm(message, title) {
  const r = await Swal.fire({
    icon: 'question',
    title: title || 'Confirmation',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Confirmer',
    cancelButtonText: 'Annuler',
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
  confirm,
  toast,
}
