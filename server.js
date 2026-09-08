import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client/dist')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', emailConfigured: !!emailTransporter })
})

console.log('Initializing email transporter...')
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '***set***' : 'NOT SET')
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***set***' : 'NOT SET')

let emailTransporter
try {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  console.log('Email transporter created successfully')
} catch (error) {
  console.error('Error creating email transporter:', error)
  emailTransporter = null
}

function stripHtmlToPlainText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp/g, ' ')
    .replace(/&lt/g, '<')
    .replace(/&gt/g, '>')
    .replace(/&amp/g, '&')
    .replace(/&#39/g, "'")
    .replace(/&quot/g, '"')
    .trim()
}

function sendSmsViaPython(phoneNumbers, message) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [path.join(__dirname, 'sms_service.py')])
    let output = ''
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on('close', (code) => {
      try {
        const result = JSON.parse(output)
        if (result.success) {
          resolve(result.message_ids)
        } else {
          reject(new Error(result.error))
        }
      } catch (error) {
        reject(new Error(`Python SMS service error: ${errorOutput || error.message}`))
      }
    })

    const inputData = JSON.stringify({
      phoneNumbers: phoneNumbers,
      message: message
    })

    pythonProcess.stdin.write(inputData)
    pythonProcess.stdin.end()

    setTimeout(() => {
      pythonProcess.kill()
      reject(new Error('SMS service timeout'))
    }, 60000)
  })
}

app.post('/api/send', async (req, res) => {
  const startTime = Date.now()
  try {
    const { email, phoneNumbers, htmlContent } = req.body

    if (!email || !phoneNumbers || phoneNumbers.length === 0 || !htmlContent) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const plainTextContent = stripHtmlToPlainText(htmlContent)

    console.log(`[${new Date().toISOString()}] Sending to email: ${email}, phones: ${phoneNumbers.join(',')}`)

    if (!emailTransporter) {
      throw new Error('Email transporter not configured')
    }

    const emailPromise = emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Message',
      html: htmlContent,
      text: plainTextContent
    }).then(result => {
      console.log(`[${new Date().toISOString()}] Email sent in ${Date.now() - startTime}ms`)
      return result
    }).catch(error => {
      console.error(`[${new Date().toISOString()}] Email send failed:`, error.message)
      throw error
    })

    const smsPromise = sendSmsViaPython(phoneNumbers, plainTextContent)
      .then(ids => {
        console.log(`[${new Date().toISOString()}] SMS sent in ${Date.now() - startTime}ms`)
        return ids
      })

    const emailTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email timeout after 25s')), 25000)
    )

    const smsTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMS timeout after 15s')), 15000)
    )

    let emailResult, smsMessageIds

    try {
      console.log(`[${new Date().toISOString()}] Starting email send...`)
      emailResult = await Promise.race([emailPromise, emailTimeout])
      console.log(`[${new Date().toISOString()}] Email sent successfully in ${Date.now() - startTime}ms`)
    } catch (emailError) {
      console.error(`[${new Date().toISOString()}] Email failed after ${Date.now() - startTime}ms:`, emailError.message)
      throw emailError
    }

    try {
      smsMessageIds = await Promise.race([smsPromise, smsTimeout])
      console.log(`[${new Date().toISOString()}] SMS sent successfully`)
    } catch (smsError) {
      console.warn(`[${new Date().toISOString()}] SMS warning:`, smsError.message)
      smsMessageIds = []
    }

    res.json({
      success: true,
      emailMessageId: emailResult.messageId,
      smsMessageIds: smsMessageIds
    })
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending messages (${Date.now() - startTime}ms):`, error)
    res.status(500).json({ error: error.message })
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
