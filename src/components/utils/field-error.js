function resolve(elOrSelector) {
  if (!elOrSelector) return null;
  if (typeof elOrSelector === 'string') return document.querySelector(elOrSelector);
  return elOrSelector; // assume element
}

export function markFieldError(elOrSelector) {
  const el = resolve(elOrSelector);
  if (!el) return;
  el.classList.add('input-error');
  el.setAttribute('aria-invalid', 'true');

  const clear = () => {
    el.classList.remove('input-error');
    el.removeAttribute('aria-invalid');
    el.removeEventListener('focus', clear);
    el.removeEventListener('input', clear);
  };

  // attach one-time clear handlers
  el.addEventListener('focus', clear);
  el.addEventListener('input', clear);
}

export function clearFieldError(elOrSelector) {
  const el = resolve(elOrSelector);
  if (!el) return;
  el.classList.remove('input-error');
  el.removeAttribute('aria-invalid');
}

export default { markFieldError, clearFieldError };
