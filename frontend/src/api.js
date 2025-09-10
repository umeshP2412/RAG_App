export async function uploadFiles(files) {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form,
    credentials: 'include' // Include cookies for session tracking
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function sendMessage(text, options = {}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text,
      use_web_search: options.useWebSearch || false,
      ...options
    }),
    credentials: 'include' // Include cookies for session tracking
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getSessionFiles() {
  const res = await fetch('/api/files', {
    credentials: 'include' // Include cookies for session tracking
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
