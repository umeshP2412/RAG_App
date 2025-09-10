import React, { useState, useRef, useEffect } from 'react'

export default function ChatOptions({ darkMode, useWebSearch, setUseWebSearch }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors focus:outline-none ${
          isOpen
            ? darkMode 
              ? 'bg-gray-700 text-blue-400' 
              : 'bg-gray-200 text-blue-600'
            : darkMode 
              ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300' 
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }`}
        aria-label="Chat options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className={`absolute bottom-full mb-2 w-64 rounded-lg shadow-lg overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Search options</h3>
          </div>
          <div className="p-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useWebSearch}
                onChange={() => setUseWebSearch(!useWebSearch)}
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors 
                ${useWebSearch 
                  ? 'bg-blue-600' 
                  : darkMode ? 'bg-gray-600' : 'bg-gray-300'} 
                peer-focus:ring-2 
                ${darkMode ? 'peer-focus:ring-blue-800' : 'peer-focus:ring-blue-300'}`}>
                <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform
                  ${useWebSearch ? 'translate-x-5' : ''}`}>
                </div>
              </div>
              <div className="ml-3">
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Web Search
                </span>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Search the web for more up-to-date information
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
