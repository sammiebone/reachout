import React, { useState } from 'react'

function EmailPhoneForm({
  email,
  setEmail,
  phoneNumbers,
  onPhoneAdd,
  onPhoneRemove
}) {
  const [phoneInput, setPhoneInput] = useState('')

  const handleAddPhone = () => {
    const cleanPhone = phoneInput.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      alert('Please enter a valid phone number with at least 10 digits')
      return
    }
    const formattedPhone = '+1' + cleanPhone.slice(-10)
    onPhoneAdd(formattedPhone)
    setPhoneInput('')
  }

  const handlePhoneKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPhone()
    }
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor="email">Recipient Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="recipient@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Numbers</label>
        <div className="phone-input-group">
          <input
            id="phone"
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            onKeyPress={handlePhoneKeyPress}
            placeholder="Enter phone number"
          />
          <button
            type="button"
            onClick={handleAddPhone}
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
                  className="remove-btn"
                  onClick={() => onPhoneRemove(phone)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default EmailPhoneForm
