const apiConfig = {
  port: 3000
}

const databaseConfig = {
  user: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: 'store',
  port: 5432,
  ssl: false
}

const { Client } = require('pg')

const bodyParser = require('body-parser')

const express = require('express')
const server = express()

server.use(bodyParser.json())

server.get('/authors', async (req, res) => {
  const client = new Client(databaseConfig)
  await client.connect()
  const result = await client.query({
    text: 'select * from authors;'
  })
  await client.end()
  res.send(result.rows)
})
server.get('/authors/:id', async (req, res) => {
  const client = new Client(databaseConfig)
  await client.connect()
  const result = await client.query({
    text: 'select * from authors where id = $1;',
    values: [ req.params.id ]
  })
  await client.end()
  res.send(result.rows[0])
})

server.post('/authors', async (req, res) => {
  const client = new Client(databaseConfig)

  await client.connect()
  const result = await client.query({
    text: 'insert into authors (name, is_live) values ($1, $2) returning *;',
    values: [ req.body.name, req.body.is_live ]
  })
  await client.end()
  res.send(result.rows[0])
})

server.put('/authors/:id', async (req, res) => {
  const client = new Client(databaseConfig)
  await client.connect()
  const result = await client.query({
    text: 'update authors set name = $1, is_live =$2 where id= $3 returning *;',
    values: [ req.body.name, req.body.is_live, req.params.id]
  })
  await client.end()
  res.send(result.rows[0])
})

server.delete('/authors/:id', async (req, res) => {
  const client = new Client(databaseConfig)
  await client.connect()
  const result = await client.query({
    text: 'delete from authors where id = $1;',
    values: [ req.params.id ]
  })

  await client.end()
  res.send(result.rows[0])
})

server.listen(apiConfig.port, () => console.log(`API running on port ${apiConfig.port} ...`))
