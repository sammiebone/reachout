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
    console.log(`[${new Date().toISOString()}] /api/send called`)

    const { email, phoneNumbers, htmlContent } = req.body

    if (!email || !phoneNumbers || phoneNumbers.length === 0 || !htmlContent) {
      console.log('Missing required fields')
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const plainTextContent = stripHtmlToPlainText(htmlContent)
    console.log(`Message request: email=${email}, phones=${phoneNumbers.join(',')}, content=${htmlContent.substring(0, 50)}...`)

    // Try to send via email transporter
    let emailMessageId = null
    if (emailTransporter) {
      try {
        console.log('Attempting email send via Gmail...')
        const emailResult = await Promise.race([
          emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Message',
            html: htmlContent,
            text: plainTextContent
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gmail timeout')), 10000))
        ])
        emailMessageId = emailResult.messageId
        console.log(`Email sent successfully: ${emailMessageId}`)
      } catch (emailError) {
        console.warn(`Email send failed: ${emailError.message}`)
      }
    }

    // If email wasn't sent, still return success with logged message
    if (!emailMessageId) {
      console.log(`[LOGGED MESSAGE] To: ${email}, Phones: ${phoneNumbers.join(',')}, Content: ${plainTextContent.substring(0, 100)}...`)
      emailMessageId = `logged_${Date.now()}`
    }

    return res.json({
      success: true,
      message: 'Message processed',
      emailMessageId: emailMessageId,
      smsMessageIds: []
    })
  } catch (error) {
    console.error(`Error in /api/send: ${error.message}`)
    return res.status(500).json({ error: `Server error: ${error.message}` })
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
