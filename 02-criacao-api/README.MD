## Criando sua primeira API

### O que é API

"Interface de Programação de Aplicação , cujo acrônimo API provém do Inglês Application Programming Interface, é um conjunto de rotinas e padrões estabelecidos por um software para a utilização das suas funcionalidades por aplicativos que não pretendem envolver-se em detalhes da implementação do software, mas apenas usar seus serviços.
De modo geral, a API é composta por uma série de funções acessíveis somente por programação, e que permitem utilizar características do software menos evidentes ao utilizador tradicional". [**Wikipédia**](https://pt.wikipedia.org/wiki/Interface_de_programa%C3%A7%C3%A3o_de_aplica%C3%A7%C3%B5es)

Mas Ok, e o que eu faço com essa definição?

Partindo do pressuposto que você entendeu que uma API é uma forma de se acessar os serviços de um software, podemos então criar esses serviços para acesso via web, que é onde normalmente para onde as desenvolvemos.

Por exemplo, nosso "sistema" de livros hoje apenas armazena dados em um banco, usando linguagem SQL e recupera esses dados desta forma, deixar seu Tio fazer as coisas assim pode gerar um grande problema para você, lembre-se, tios não costumam ser bom em 2 coisas, pagar por serviço e nem usar corretamente um computador, imagina então ele acessando diretamente seu banco de dados, que você modelou com tanto carinho e te pedindo para arrumar os dados que sumiram magicamente de dentro das tabelas, ou quando todos os livros trocaram de título para Crepúsculo.

Sendo assim vamos começar a desenvolver nosso serviço de forma mais profissional, criando uma aplicação em node.js que retornará em algumas rotas os valores que gostariamos de exibir, ele também terá rotas para inclusão, exclusão e alteração de dados.


## Acessando seu banco de dados com node

Existem várias formas de se acessar um banco de dados relacional com o Node, neste primeiro passo vamos fazer da forma mais simples.
Usaremos o Node com o express e o pg, uma biblioteca para acessar bancos de dados postgres.

Criaremos assim nossa primeira aplicação node com o seguinte comando:

```
$ npm init
```
Este comando cria um arquivo chamado `package.json` com um conteudo similar a este:

```json
{
  "name": "store-api",
  "version": "1.0.0",
  "description": "my first api tutorial",
  "main": "index.js",
  "scripts": {
    "test": "jest"
  },
  "author": "rfukui",
  "license": "Unlicense"
}
```
Agora vamos instalar as dependências:

```
$ npm install jest pg express body-parser nodemon
```
O seu arquivo `package.json` ficará próxmo deste e vamos também adcionar um comando para executar a aplicação diretamente pelo node.

```json
{
  "name": "store-api",
  "version": "1.0.0",
  "description": "my first api tutorial",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon ./index.js",
    "test": "jest"
  },
  "author": "rfukui",
  "license": "Unlicense",
  "dependencies": {    
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "jest": "^24.9.0",
    "npm": "^6.13.6",
    "pg": "^7.17.0"
  }
}
```
Agora vamos criar a aplicação e um docker-compose para ela.

`index.js`
```js
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

```
`docker-composer.yml`
```yml
version: '3.4'

services:
  dev:
    image: node:12-alpine
    container_name: store_api_dev
    command:  npm run dev
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./:/app:cached
    links:
      - db
    depends_on:
      - db

  db:
    image: postgres
    container_name: store02_db
    ports:
      - "5432:5432"
    volumes:
      - database:/var/lib/postgresql/data

volumes:
  database:

```
Note que este codigo não está bonito, na verdade está bem longe disso, temos muito código repetido e podemos dar uma boa limpada nele, deixo aqui para você fazer isso (spoiler, tem um código bem mais limpo no arquivo salvo neste repositório), mas este é para você entender como o código está funcionando.

Aqui vão algumas explicações de coisas que você pode não estar entendendo do código.

```js
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

```
##### `server.<tipo de requisição>`:

informa qual o tipo de requisição esperada naquela URI, neste caso espera uma requisição tipo get na uri `/authors/<id>`

##### `authors/:id`:
aqui informamos qual a URI que estamos esperando a requisição, o `:id` é interpretado como uma variável de uma função, sendo esperado o `id` do autor.


##### `criação e destruição de conexão do banco`
```js
const client = new Client(databaseConfig)
await client.connect()
.
.
.
await client.end()
```
Nesta parte criamos a conexão com o banco e encerramos a encerramos, isso é extremamente importante para quando trabalhamos com aplicações com muita concorrência (muitas conexões acontecendo ao mesmo tempo, tipo vida real).

##### `execução das queries`

```js
const result = await client.query({
  text: 'select * from authors where id = $1;',
  values: [ req.params.id ]
})

```
Talvez você até esteja se perguntando, por que foi escrito desta forma e não com template strings, bom, você pode, mas essa é a notação "normal" para esse tipo de execução. Apenas por uma questão de estilo mesmo, uma pessoa que trabalha escrevendo queries SQL normalmente espera, por motivos meramente históricos, receber as informações nesta notação.


Para executar a aplicação diretamente num container docker basta executar:

```
$ docker-compose up dev
```
Partindo disso, crie todas as rotas de criação, exclusão, alteração e consulta para livros e autores também.
