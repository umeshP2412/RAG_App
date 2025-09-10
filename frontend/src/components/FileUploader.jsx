import React, { useState } from 'react'
import { uploadFiles } from '../api'

const ACCEPT = [
  '.pdf',
  '.csv',
  '.txt',
  '.xls',
  '.xlsx'
].join(',')

export default function FileUploader({ darkMode }) {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState(null)
  const [uploading, setUploading] = useState(false)

  function onChange(e) {
    const list = e.target.files
    if (!list) return
    setFiles(Array.from(list))
    setStatus(null)
  }

  async function onUpload() {
    if (files.length === 0) {
      setStatus('No files selected')
      return
    }
    setUploading(true)
    setStatus('Uploading...')
    try {
      const res = await uploadFiles(files)
      setStatus(res.message || 'Files uploaded successfully')
      setFiles([])
    } catch (err) {
      setStatus(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Upload Documents
      </h2>
      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Supported: PDF, CSV, Excel, TXT
      </p>
      
      <div className={`relative border-2 border-dashed rounded-lg p-6 mb-4 text-center
        ${darkMode 
          ? 'border-gray-600 hover:border-gray-500' 
          : 'border-gray-300 hover:border-gray-400'}`}>
        <input 
          type="file" 
          accept={ACCEPT} 
          multiple 
          onChange={onChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg 
            className="mx-auto h-12 w-12 mb-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-1 text-sm font-semibold">Click to upload or drag and drop</p>
          <p className="text-xs">PDF, CSV, Excel, TXT up to 10MB each</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className={`mb-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3`}>
          <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Selected Files ({files.length})
          </h3>
          <div className="max-h-36 overflow-y-auto scrollbar-hide">
            {files.map((f) => (
              <div key={f.name} className={`flex justify-between items-center py-2 px-3 rounded mb-1
                ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center overflow-hidden">
                  <div className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center
                    ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <span className="text-xs uppercase font-bold">
                      {f.name.split('.').pop()}
                    </span>
                  </div>
                  <div className="ml-2 overflow-hidden">
                    <p className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {f.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {Math.round(f.size / 1024)} KB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={uploading || files.length === 0}
        className={`flex items-center justify-center py-2 px-4 rounded-lg font-medium text-white
          focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
          ${uploading ? 'cursor-not-allowed opacity-70' : 'hover:bg-blue-600'}
          ${files.length === 0 ? 'cursor-not-allowed opacity-70' : ''}
          ${darkMode ? 'bg-blue-600 focus:ring-blue-500' : 'bg-blue-500 focus:ring-blue-400'}`}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          'Upload Files'
        )}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm
          ${status.includes('success') || status === 'Uploaded' || status === 'Files uploaded successfully' 
            ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') 
            : status === 'Uploading...'
              ? (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800')
              : (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800')}`}>
          {status}
        </div>
      )}
    </div>
  )
}
