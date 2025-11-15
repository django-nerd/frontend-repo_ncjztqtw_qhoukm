import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [books, setBooks] = useState([])

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    cover_url: '',
    content: '',
    audio_summary_url: '',
    tags: '',
  })

  const [filters, setFilters] = useState({ genre: '', q: '' })

  const filteredBooks = useMemo(() => {
    return books
  }, [books])

  const loadBooks = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.q) params.append('q', filters.q)
      const res = await fetch(`${baseUrl}/api/books?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load books')
      const data = await res.json()
      setBooks(data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : null,
      }
      const res = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to create book')
      }
      setForm({
        title: '',
        author: '',
        genre: '',
        description: '',
        cover_url: '',
        content: '',
        audio_summary_url: '',
        tags: '',
      })
      await loadBooks()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Book Hub with Audio Summaries
          </h1>
          <a
            href="/test"
            className="text-sm text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded"
          >
            Check Backend
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
        <section className="md:col-span-2">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by title, author, or tag..."
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              placeholder="Filter by genre"
              value={filters.genre}
              onChange={(e) => setFilters((p) => ({ ...p, genre: e.target.value }))}
              className="w-full sm:w-56 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={loadBooks}
              className="rounded bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              Apply
            </button>
          </div>

          {loading && (
            <p className="text-gray-600">Loading books...</p>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-r from-purple-100 to-blue-100" />
                )}
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold">{b.genre}</div>
                  <h3 className="text-lg font-bold text-gray-800">{b.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">by {b.author}</p>
                  {b.description && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-2">{b.description}</p>
                  )}
                  {b.content && (
                    <details className="mb-2">
                      <summary className="cursor-pointer text-sm text-blue-600">Read excerpt</summary>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{b.content}</p>
                    </details>
                  )}
                  {b.audio_summary_url && (
                    <div className="mt-2">
                      <audio controls className="w-full">
                        <source src={b.audio_summary_url} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {b.tags && b.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.tags.map((t, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && !loading && (
            <p className="text-gray-600">No books yet. Add one using the form.</p>
          )}
        </section>

        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <h2 className="text-xl font-semibold mb-3">Add a Book</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="w-full rounded border border-gray-300 px-3 py-2" />
              <input name="author" value={form.author} onChange={handleChange} placeholder="Author" required className="w-full rounded border border-gray-300 px-3 py-2" />
              <input name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" required className="w-full rounded border border-gray-300 px-3 py-2" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full rounded border border-gray-300 px-3 py-2" />
              <input name="cover_url" value={form.cover_url} onChange={handleChange} placeholder="Cover image URL (optional)" className="w-full rounded border border-gray-300 px-3 py-2" />
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="Excerpt or content (optional)" className="w-full rounded border border-gray-300 px-3 py-2" />
              <input name="audio_summary_url" value={form.audio_summary_url} onChange={handleChange} placeholder="Audio summary URL (mp3)" className="w-full rounded border border-gray-300 px-3 py-2" />
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="w-full rounded border border-gray-300 px-3 py-2" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Save</button>
              <p className="text-xs text-gray-500">Backend: {baseUrl}</p>
            </form>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
