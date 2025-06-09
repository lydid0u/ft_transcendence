
async function postUsers(request, reply) {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
  const name = names[Math.floor(Math.random() * names.length)]
  const email = `${name.toLowerCase()}${Math.floor(Math.random() * 1000)}@test.com`

  return new Promise((resolve, reject) => {
    console.log("post request.server.db", request.server.db)

    request.server.db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
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
}

async function getUsers(request, reply) {
    console.log("get request.server.db", request.server.db)
    return new Promise((resolve, reject) => {
        request.server.db.all('SELECT * FROM users', (err, rows) => {
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
}

module.exports = {
    getUsers,
    postUsers
};
