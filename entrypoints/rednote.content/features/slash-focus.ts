document.addEventListener('keydown', (e) => {
  if (e.key !== '/') return

  const input = document.querySelector<HTMLInputElement>('#search-input')

  if (!input) return

  e.preventDefault()
  input.focus()
})
