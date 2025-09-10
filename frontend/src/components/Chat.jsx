import React, { useState, useRef, useEffect } from 'react'
import { sendMessage, getSessionFiles } from '../api'
import ChatOptions from './ChatOptions'

export default function Chat({ darkMode }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [sessionFiles, setSessionFiles] = useState([])
  const [showSessionFiles, setShowSessionFiles] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch session files on component mount
  useEffect(() => {
    fetchSessionFiles()
  }, [])

  const fetchSessionFiles = async () => {
    try {
      const data = await getSessionFiles()
      setSessionFiles(data.files || [])
    } catch (err) {
      console.error('Failed to fetch session files:', err)
    }
  }

  async function onSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    
    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    
    try {
      const res = await sendMessage(text, { 
        useWebSearch: useWebSearch 
      })
      
      const botMsg = { 
        id: Date.now().toString() + '1', 
        role: 'assistant', 
        text: res.reply,
        usedWebSearch: useWebSearch
      }
      setMessages(prev => [...prev, botMsg])
      
      // Refresh the session files list in case new files were referenced
      fetchSessionFiles()
    } catch (err) {
      const errorMsg = { 
        id: Date.now().toString() + '2', 
        role: 'assistant', 
        error: true,
        text: 'Sorry, something went wrong. Please try again.' 
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  // Function to get message style classes based on role
  const getMessageClasses = (role, error = false, usedWebSearch = false) => {
    const common = 'py-2 px-4 rounded-lg max-w-[80%] mb-2'
    
    if (role === 'user') {
      return `${common} ml-auto ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
    } else {
      // Assistant message
      if (error) {
        return `${common} ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'}`
      }
      return `${common} ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`
    }
  }

  const toggleSessionFiles = () => {
    setShowSessionFiles(!showSessionFiles)
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Chat with your documents
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSessionFiles}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {sessionFiles.length > 0 ? `Files (${sessionFiles.length})` : 'No Files'}
          </button>
        </div>
      </div>
      
      {showSessionFiles && sessionFiles.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg text-sm overflow-auto max-h-32 ${
          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          <h3 className="font-medium mb-2">Uploaded Files:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sessionFiles.map((file, index) => (
              <div 
                key={index} 
                className={`px-2 py-1 rounded truncate ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                {file.name || file}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`flex-1 overflow-y-auto mb-4 p-4 rounded-lg scrollbar-hide
        ${darkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
        {messages.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center
            ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center">
              Upload your documents and ask questions about them.
            </p>
            <p className="text-center text-sm mt-2">
              I'll analyze your files and provide relevant answers.
            </p>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={getMessageClasses(msg.role, msg.error, msg.usedWebSearch)}>
                  {msg.text}
                  {msg.usedWebSearch && (
                    <div className={`mt-1 text-xs ${
                      darkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Used web search
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`${getMessageClasses('assistant')} flex items-center space-x-2`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={onSend} className="relative">
        <div className="absolute bottom-[14px] left-4">
          <ChatOptions 
            darkMode={darkMode} 
            useWebSearch={useWebSearch} 
            setUseWebSearch={setUseWebSearch}
          />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your documents..."
          className={`w-full py-3 pl-14 pr-16 rounded-lg focus:outline-none focus:ring-2 transition-colors
            ${darkMode 
              ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 border border-gray-600' 
              : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 border border-gray-300'}`}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors
            ${loading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} 
            ${darkMode 
              ? 'bg-blue-600 text-white focus:ring-blue-500' 
              : 'bg-blue-500 text-white focus:ring-blue-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
      {useWebSearch && (
        <div className={`mt-2 text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Web search is enabled for this message
        </div>
      )}
    </div>
  )
}
