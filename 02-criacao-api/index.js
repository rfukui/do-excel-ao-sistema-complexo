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

const queryExecution = query => {
  const client = new Client(databaseConfig)
  await client.connect()
  const result = await client.query(query)
  await client.end()
  return result
}

server.use(bodyParser.json())

server.get('/authors', async (req, res) =>
  res.send(queryExecution({
    text: 'select * from authors;'
  }).rows)
)
server.get('/authors/:id', async (req, res) =>
  res.send(queryExecution({
      text: 'select * from authors where id = $1;',
      values: [ req.params.id ]
    }).rows[0])
)

server.post('/authors', async (req, res) =>
  res.send(queryExecution({
    text: 'insert into authors (name, is_live) values ($1, $2) returning *;',
    values: [ req.body.name, req.body.is_live ]
  }).rows[0])
)

server.put('/authors/:id', async (req, res) =>
  res.send(queryExecution({
      text: 'update authors set name = $1, is_live =$2 where id= $3 returning *;',
      values: [ req.body.name, req.body.is_live, req.params.id]
    }).rows[0])
)

server.delete('/authors/:id', async (req, res) =>
  res.send(queryExecution({
      text: 'delete from authors where id = $1;',
      values: [ req.params.id ]
    }).rows[0])
)

server.listen(apiConfig.port, () => console.log(`API running on port ${apiConfig.port} ...`))
