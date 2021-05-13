const db = require('./db')
const helpers = require('./helpers').default
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const uploads = multer({ dest: 'uploads' })

// Constants
const PORT = 3300
const BASE = '/test-api/0.3'

// Configuration
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
get(`${BASE}/clusters`, req => db.clusters.list(req.query))
get(`${BASE}/types`, () => db.types.list())
get(`${BASE}/types/:id`, req => db.types.show(req.params.id))
get(`${BASE}/types/counts`, req => db.types.count(req.query))
get(`${BASE}/locations`, req => db.locations.list(req.query))
post(`${BASE}/locations`, async req => {
  req.body.user_id = null
  if (req.query.token) {
    req.body.user_id = await db.users.find_user_by_token(req.query.token)
  }
  return db.locations.add(req.body)
})
get(`${BASE}/locations/:id`, req => db.locations.show(req.params.id))
put(`${BASE}/locations/:id`, req => db.locations.edit(req))
get(`${BASE}/locations/:id/reviews`, req => db.reviews.list(req.params.id))
post(`${BASE}/locations/:id/reviews`, req => db.reviews.add(req), uploads.array('photo'))
put(`${BASE}/locations/:id/reviews/:rid`, req => db.reviews.edit(req), uploads.array('photo'))
get(`${BASE}/locations/count`, req => db.locations.count(req.query))
post(`${BASE}/users`, req => db.users.add(req))
get(`${BASE}/users/token`, req => db.users.get_token(req.query))
put(`${BASE}/users/:id`, req => db.users.edit(req))

// Generic handlers
function get(url, handler) {
  app.get(url, async (req, res) => {
    try {
      await check_key(req)
      const data = await handler(req)
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({
        error: error.message || error
      })
    }
  })
}

function post(url, handler, uploader) {
  uploader = uploader || uploads.none()
  app.post(url, uploader, async (req, res) => {
    try {
      await check_key(req)
      const data = await handler(req)
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({
        error: error.message || error
      })
    }
  })
}

function put(url, handler, uploader) {
  uploader = uploader || uploads.none()
  app.put(url, uploader, async (req, res) => {
    try {
      await check_key(req)
      const data = await handler(req)
      res.status(200).json(data)
    } catch (error) {
      res.status(400).json({
        error: error.message || error
      })
    }
  })
}

async function check_key(req) {
  const keys = await db.any("SELECT id FROM api_keys WHERE api_key=${key}", req.query)
  if (keys.length == 0) {
    throw Error('key is invalid')
  }
}

// Start server
app.listen(PORT, () => {
    console.log('Ready for requests on http://localhost:' + PORT)
})
