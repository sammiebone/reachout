import React, { useState } from 'react'
import axios from 'axios'
import MessageEditor from './components/MessageEditor'
import EmailPhoneForm from './components/EmailPhoneForm'

function App() {
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [email, setEmail] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [editorContent, setEditorContent] = useState('<p>Start typing your message here...</p>')

  const handlePhoneAdd = (phone) => {
    if (phone && !phoneNumbers.includes(phone)) {
      setPhoneNumbers([...phoneNumbers, phone])
    }
  }

  const handlePhoneRemove = (phone) => {
    setPhoneNumbers(phoneNumbers.filter(p => p !== phone))
  }

  const handleEditorChange = (content) => {
    setEditorContent(content)
  }

  const showAlert = (message, type) => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const validateForm = () => {
    if (!email) {
      showAlert('Email address is required', 'error')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address', 'error')
      return false
    }

    if (phoneNumbers.length === 0) {
      showAlert('At least one phone number is required', 'error')
      return false
    }

    if (!editorContent || editorContent === '<p></p>') {
      showAlert('Message body cannot be empty', 'error')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/send', {
        email: email,
        phoneNumbers: phoneNumbers,
        htmlContent: editorContent
      })

      showAlert('Message sent successfully to email and all phone numbers', 'success')
      setEmail('')
      setPhoneNumbers([])
      setEditorContent('<p>Start typing your message here...</p>')
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message'
      showAlert(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setEmail('')
    setPhoneNumbers([])
    setEditorContent('<p>Start typing your message here...</p>')
    setAlert(null)
  }

  return (
    <div className="container">
      <h1>Reachout</h1>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <EmailPhoneForm
          email={email}
          setEmail={setEmail}
          phoneNumbers={phoneNumbers}
          onPhoneAdd={handlePhoneAdd}
          onPhoneRemove={handlePhoneRemove}
        />

        <MessageEditor
          content={editorContent}
          onChange={handleEditorChange}
        />

        <div className="button-group">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <div className="loading">
                <span>Sending</span>
                <div className="spinner"></div>
              </div>
            ) : (
              'Send Message'
            )}
          </button>
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
