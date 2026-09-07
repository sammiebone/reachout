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
      <div className="header">
        <h1>REACHOUT</h1>
        <p>Send coordinated messages across email and SMS</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-wrapper">
          <div className="channel channel-email">
            <div className="channel-label">Email Channel</div>
            <div className="form-group">
              <label htmlFor="email">Recipient Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
          </div>

          <div className="channel">
            <div className="channel-label">SMS Channel</div>
            <div className="form-group">
              <label htmlFor="phone">Phone Numbers</label>
              <div className="phone-actions">
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const cleanPhone = e.target.value.replace(/\D/g, '')
                      if (cleanPhone.length < 10) {
                        alert('Please enter a valid phone number with at least 10 digits')
                        return
                      }
                      const formattedPhone = '+1' + cleanPhone.slice(-10)
                      handlePhoneAdd(formattedPhone)
                      e.target.value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add-phone"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling
                    const cleanPhone = input.value.replace(/\D/g, '')
                    if (cleanPhone.length < 10) {
                      alert('Please enter a valid phone number with at least 10 digits')
                      return
                    }
                    const formattedPhone = '+1' + cleanPhone.slice(-10)
                    handlePhoneAdd(formattedPhone)
                    input.value = ''
                  }}
                >
                  Add
                </button>
              </div>

              {phoneNumbers.length > 0 && (
                <ul className="phone-list">
                  {phoneNumbers.map((phone, index) => (
                    <li key={index}>
                      <span>{phone}</span>
                      <button
                        type="button"
                        onClick={() => handlePhoneRemove(phone)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="editor-label">Message</div>

        <div className="editor-section">
          <MessageEditor
            content={editorContent}
            onChange={handleEditorChange}
          />
        </div>

        <div className="actions-wrapper">
          <button
            type="submit"
            className={`btn-send ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Sending Message...' : 'Send to Both Channels'}
          </button>
          <button
            type="button"
            className="btn-clear"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
