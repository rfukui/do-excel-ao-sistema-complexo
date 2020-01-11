## Criando sua primeira API

### O que é API

"Interface de Programação de Aplicação, cujo acrônimo API vem do inglês _Application Programming Interface_, é um conjunto de rotinas e padrões estabelecidos por um software para a utilização das suas funcionalidades por aplicativos que não pretendem envolver-se em detalhes da implementação do software, mas apenas usar seus serviços.
De modo geral, a API é composta por uma série de funções acessíveis somente por programação, e que permitem utilizar características do software menos evidentes ao utilizador tradicional". [**Wikipédia**](https://pt.wikipedia.org/wiki/Interface_de_programa%C3%A7%C3%A3o_de_aplica%C3%A7%C3%B5es)

Ok, e o que eu faço com essa definição?

Partindo do pressuposto que você entendeu que uma API é uma forma de se acessar os serviços de um software, podemos então criar esses serviços para acesso via web, que é para onde normalmente as desenvolvemos.

Por exemplo, nosso "sistema" de livros hoje apenas armazena dados em um banco, usando linguagem SQL, e recupera esses dados desta forma. Deixar seu tio fazer as coisas assim pode gerar um grande problema para você; lembre-se que tios não costumam ser bons em duas coisas: pagar por serviços e usar corretamente um computador (a não ser que ele seja programador também, mas aí ele mesmo escreveria o sistema e esse curso não faria sentido :D). Imagine então ele acessando diretamente seu banco de dados, que você modelou com tanto carinho, e depois te pedindo para arrumar os dados que sumiram magicamente de dentro das tabelas, ou todos os livros que trocaram de título para Crepúsculo.

Sendo assim vamos começar a desenvolver nosso serviço de forma mais profissional, criando uma aplicação em Node.js que retornará em algumas rotas os valores que gostariamos de exibir. Ela também terá rotas para inclusão, exclusão e alteração de dados.

## Acessando seu banco de dados com Node

Existem várias formas de se acessar um banco de dados relacional com o Node. Neste primeiro passo vamos fazer da forma mais simples. Usaremos o Node com o Express e o pg, uma biblioteca para acessar bancos de dados Postgres.

Criaremos assim nossa primeira aplicação Node com o seguinte comando:

```
$ npm init -y
```
Este comando cria um arquivo chamado `package.json` com um conteudo similar a este:

```json
{
  "name": "store-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```
Depois você pode alterar o nome do projeto, autoria, descrição e outras infos.
Agora vamos instalar as dependências:

```
$ npm install jest pg express body-parser nodemon
```
O seu arquivo `package.json` ficará parecido com esse. Vamos também adicionar dois comandos de `script` para executar a aplicação diretamente pelo node.

```json
{
  "name": "store-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon ./index.js",
    "test": "jest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "jest": "^24.9.0",
    "nodemon": "^2.0.2",
    "pg": "^7.17.1"
  }
}
```
Agora vamos criar um arquivo `index.js` para rodar a aplicação e adicionar algumas linhas no `docker-compose` para ela.

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
Este código não está bonito, na verdade está bem longe disso. Temos muito código repetido e podemos dar uma boa limpada nele, deixo aqui para você fazer isso (spoiler: tem um código bem mais limpo no arquivo salvo neste repositório). Este é para você percorrer as linhas com calma e entender como o código está funcionando.

Aqui vão algumas explicações de partes do código que podem não estar tão claras:

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

Informa qual o tipo de requisição esperada naquela URI, neste caso espera-se uma requisição tipo GET na uri `/authors/<id>`

##### `authors/:id`:
Aqui informamos qual a URI que estamos esperando a requisição; o `:id` é interpretado como uma variável de uma função, sendo esperado o `id` do autor.

##### `criação e finalização de conexão do banco`
```js
const client = new Client(databaseConfig)
await client.connect()
.
.
.
await client.end()
```
Nesta parte criamos a conexão com o banco e encerramos a conexão depois de fazer o que precisamos no banco (criar, consultar, alterar, etc). Isso é extremamente importante para quando trabalhamos com aplicações com muita concorrência (ou seja, muitas conexões acontecendo ao mesmo tempo, como na vida real).

##### `execução das queries`

```js
const result = await client.query({
  text: 'select * from authors where id = $1;',
  values: [ req.params.id ]
})

```
Talvez você esteja se perguntando por que o valor de `text` foi escrito desta forma e não com template strings, já que estamos usando o ES6. Bom, você pode fazer isso, mas a notação com aspas é a "normal" para esse tipo de execução. Apenas por uma questão de estilo mesmo, uma pessoa que trabalha escrevendo queries SQL normalmente espera, por motivos meramente históricos, receber as informações nesta notação. 

***O termo `query` pode ter algumas traduções quando falamos de programação, mas podemos assumir que uma `query` é uma solicitação, como em um pedido de informações; nesse caso incluímos em `query` outros comandos SQL que não são necessariamente apenas consulta (o GET), mas também outras solicitações que podemos fazer ao banco.

Como fizemos alterações no arquivo `docker-compose`, vamos derrubar a máquina atual (se ainda estiver rodando) com:
```
$ docker-compose down
```
E subir novamente com:
```
$ docker-compose up dev
```

A partir daqui, crie todas as rotas de criação, exclusão, alteração e consulta para livros e autores também.
