import React, { useState, useEffect } from 'react'
import FileUploader from './components/FileUploader'
import Chat from './components/Chat'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  return (
    <div className={`min-h-screen transition-colors duration-200 
      ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            RAG — Upload + Chat
          </h1>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </header>
        <main className="flex flex-col md:flex-row gap-6">
          <section className={`md:w-1/3 p-6 rounded-lg shadow-md 
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <FileUploader darkMode={darkMode} />
          </section>
          <section className={`md:w-2/3 p-6 rounded-lg shadow-md 
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Chat darkMode={darkMode} />
          </section>
        </main>
      </div>
    </div>
  )
}
