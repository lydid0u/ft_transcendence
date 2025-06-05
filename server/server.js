// backend/server.js - VERSION FINALE QUI MARCHE
const fastify = require('fastify')({ logger: true })
const sqlite3 = require('sqlite3').verbose()

// Base de données SQLite
const db = new sqlite3.Database('/app/data/database.sqlite')

// Créer la table users avec support pour Google Auth
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    google_id TEXT,
    picture TEXT,
    provider TEXT DEFAULT 'local',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

// CORS simple
fastify.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type')
  
  if (request.method === 'OPTIONS') {
    return reply.send()
  }
})

// Routes
fastify.get('/', async () => {
  return { message: 'Backend OK!' }
})

// Route pour ajouter un utilisateur - SANS BODY JSON
fastify.post('/add-user', async (request, reply) => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
  const name = names[Math.floor(Math.random() * names.length)]
  const email = `${name.toLowerCase()}${Math.floor(Math.random() * 1000)}@test.com`

  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
      if (err) {
        reply.code(500).send({ error: err.message })
        reject(err)
      } else {
        const result = { 
          success: true, 
          user: { id: this.lastID, name, email },
          message: `User ${name} added!`
        }
        console.log('✅ User added:', name)
        resolve(result)
        return result
      }
    })
  })
})

// Route pour lister les utilisateurs - FIX: ne pas envoyer 2 fois
fastify.get('/users', async (request, reply) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users ORDER BY id DESC', (err, rows) => {
      if (err) {
        reply.code(500).send({ error: err.message })
        reject(err)
      } else {
        const result = { users: rows || [] }
        console.log(`📋 Retrieved ${rows ? rows.length : 0} users`)
        resolve(result)
        return result
      }
    })
  })
})

// Démarrer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 Server running on port 3000')
  } catch (err) {
    console.log('❌ Error:', err)
    process.exit(1)
  }
}

start()