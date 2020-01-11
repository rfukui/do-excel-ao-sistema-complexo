Ok, agora seu tio já tem uma api que pode ser consumida e alimentada, mas ela tem alguns vários problemas ainda, nesta forma por exemplo podemos fazer um processo hacker bem conhecido como [SQL INJECTION](https://www.devmedia.com.br/sql-injection/6102) e vamos concordar com outra coisa também, estudamos muito orientação a objetos e sabemos que nosso código anterior ele é quaze zero OO.

Vamos começar a fazer isso de forma bem mais profissional, usando um [ORM](https://pt.wikipedia.org/wiki/Mapeamento_objeto-relacional) para acessar os dados, separaremos as coisas em uma arquitetura do tipo [MVC](https://pt.wikipedia.org/wiki/MVC), com rotas bem definidas e deixaremos obviamente de ter uma aplicação tipo single file application.

Primeira coisa, vamos começar um novo projeto usando também o sequelize com todas as outras coisas que j'a tinhamos instalado.

você deve estar se perguntando, porque não apenas adcionar o sequelize no projeto e refatorar, por um motivo bem simples, é muito mais fácil recomeçar um projeto do jeito certo que tentar arrumar um projeto capenga, em programação precisamos praticar o desapego afetivo ao código. Então partiu jogar código fora e fazer do zero.

Vamos criar uma nova pasta de projeto chamada new_store
e trabalhar dentro dela.

```
$ mkdir new_store && cd new_store && npm init
```
Com isso iniciamos nosso novo projeto e agora vamos instalar as coisas dentro dele, começando por instalar as dependências e criando um novo index.js

```
 $ npm install jest pg express body-parser nodemon sequelize
```
Como estamos fazendo as coisas mais profissionais também adotaremos um linter (verificador de código, para saber se está tudo perfeito do ponto de vista de escrita do código), toda vez que fazemos um código que mais de uma pessoa vai trabalhar é bom adotar padrões de desenvolvimento bem estritos, para evitar conflitos no código.

```
npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import
```
Alteraremos a chave de scripts e ela deve ficar assim:

```json
"scripts": {
  "test": "jest",
  "dev":  "nodemon  --exec babel-node ./api/index.js"
},

```
Lembrando sempre que você pode usar outros nomes e isso não é ruim, mas tome cuidado.

Agora seu package.json deve estar algo próximo disso:

```json
{
  "name": "new_store",
  "version": "1.0.0",
  "description": "New version of bookstore tutorial",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "dev":  "nodemon --exec babel-node ./api/index.js"
  },
  "author": "Ricardo Fukui",
  "license": "Unlicense",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "jest": "^24.9.0",
    "nodemon": "^2.0.2",
    "pg": "^7.17.1",
    "sequelize": "^5.21.3"
  },
  "devDependencies": {
    "eslint": "^6.8.0",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-plugin-import": "^2.19.1"
  }
}

```
Pode agora estar estranhando um pouco que o script de desenvolvimento aponta para um arquivo em um diretório que nem existe, mas não se preocupe. vamos criar tanto o diretório quanto o arquivo.

```
$ mkdir api && touch api/index.js
```
Estou partindo do pressuposto que estamos dentro do diretório `new_store` mas você pode criar tudo isso com seu editor de textos favorito.

Vamos agora criar novamente o arquivo do docker-compose, aquele que você já está craque.

```yml
version: '3.4'

services:
  dev:
    image: node:12-alpine
    container_name: new_store_api_dev
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
    container_name: new_store_db
    ports:
      - "5432:5432"
    volumes:
      - database:/var/lib/postgresql/data

volumes:
  database:

```

E editaremos o arquivo `api/index.js`

```js
import express from 'express'

import bodyParser from 'body-parser'
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const port = process.env.PORT || 3000
// when a random route is inputed
app.get('*', (req, res) => res.status(200).send({
   message: 'Esta é a API da nossa livraria.'
}))
app.listen(port, () => {
   console.log(`Server is running on PORT ${port}`)

})
export default app

```
Para conseguirmos usar completamente o ECMA6 precisaremos instalar o babel e ninguém gosta de escrever js como um neandertal, não é mesmo?

```
$ npm install --save-dev @babel/core @babel/cli @babel/node \
@babel/plugin-transform-runtime @babel/preset-env \
@babel/register @babel/runtime babel-loader
```

Agora é só executar o seu container:
```
$ docker-compose up dev
```
Pronto, você tem o seu servidor no ar.

```
$ npm install sequelize-cli
```

Vamos criar no nosso diretório raiz o arquivo `.sequelizerc` com o seguinte conteudo:
```
const path  = require('path')module.exports = {
    "config": path.resolve('./api/server/src/config', 'config.js'),
    "models-path": path.resolve('./api/server/src/models'),
    "seeders-path": path.resolve('./api/server/src/seeders'),
    "migrations-path": path.resolve('./api/server/src/migrations')
}
```
Instalaremos também o path, sequelize, pg  e pg-hstore

```
$ npm install --save path sequelize pg pg-hstore
```
Como fizemos a instalação do sequelize de forma local (sem o -g eu espero) vamos executar o init dele usando o npx. Neste momento você pode estar se perguntando, mas porque eu vou usar isso?

O npx executa primariamente utilizando os binários locais e caso ele não encontre, ele busca nos globais.

```
$ npx sequelize init
```
Seu projeto neste monento vai parecer com esta estrutura:

```
├── node-modules
├── api
│   ├── index.js
│   └── server
│       └── src
│           ├── config
│           │   └── config.js
│           ├── migrations
│           ├── models
│           │   └── index.js
│           └── seeders
├── docker-compose.yml
├── package.json
└── package-lock.json

```
Agora vamos editar um pouco os arquivos gerados.

`./api/server/src/models/index.js`

```js
import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import configJson from '../config/config'

const basename = path.basename(__filename)
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

const config = configJson[env]

console.log('this is the environment: ', env)

const db = {}

let sequelize
if (config.environment === 'production') {
  sequelize = new Sequelize(
      process.env[config.use_env_variable], config
    )
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      dialectOption: {
        ssl: true,
        native: true
      },
      logging: true
    }
  )
} else {
  sequelize = new Sequelize(
     config.database, config.username, config.password, config
  )
}

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) &&
           (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db

```
`./api/server/src/config/config.js`

```json
{
  "development": {
    "username": "postgres",
    "password": null,
    "database": "new_store_development",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "test": {
    "username": "postgres",
    "password": null,
    "database": "new_store_test",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "production": {
    "username": "postgres",
    "password": null,
    "database": "new_store_production",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "operatorsAliases": false
  }
}
```
