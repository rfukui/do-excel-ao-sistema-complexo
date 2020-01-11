Ok, agora seu tio já tem uma API que pode ser consumida e alimentada, mas ela ainda tem problemas.

Da forma como está funcionando atualmente é possível, por exemplo, causar um estrago no banco de dados usando um processo hacker bem conhecido como [SQL INJECTION](https://www.devmedia.com.br/sql-injection/6102) e, vamos concordar, já estudamos bastante orientação a objetos e sabemos que no nosso código anterior não tem muito disso.

Vamos começar a fazer isso de forma bem mais profissional, usando um [ORM](https://pt.wikipedia.org/wiki/Mapeamento_objeto-relacional) para acessar os dados. Vamos separar as partes da aplicação em uma arquitetura do tipo [MVC](https://pt.wikipedia.org/wiki/MVC), com rotas bem definidas, e obviamente deixaremos de ter uma aplicação tipo _single file application_ (afinal de contas já sabemos trabalhar em estruturas de arquivo mais complexas e não precisamos escrever todo nosso código num só arquivo `script.js`, `app.js` ou `index.js`).

Primeira coisa: Vamos começar um novo projeto usando também o Sequelize, além de todas as outras ferramentas que já tínhamos instalado.

Aí você deve estar se perguntando: por que não apenas adcionar o Sequelize no projeto e refatorar?
O motivo é simples: é muito mais fácil recomeçar um projeto do jeito certo que tentar arrumar um projeto capenga, e em programação precisamos praticar sempre o desapego afetivo ao código. Então partiu jogar código fora e fazer do zero, agora de forma melhor.

Vamos criar uma nova pasta de projeto chamada `new_store` (fora da pasta que trabalhamos antes!) e começar a desenvolver dentro dela.

```
$ mkdir new_store && cd new_store && npm init -y
```
Com isso iniciamos nosso novo projeto e agora vamos instalar o que precisamos, começando pelas dependências e criando um novo index.js

```
 $ npm install jest express body-parser nodemon
```
Como estamos fazendo tudo de uma forma mais profissional, também adotaremos um linter (verificador de código, para saber se está tudo perfeito do ponto de vista de estilo), pois toda vez que escrevemos um código em que mais de uma pessoa vai trabalhar é bom adotar padrões de desenvolvimento bem estritos, para evitar conflitos no código.

```
$ npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import
```
Alteraremos a chave de `scripts` para ficar assim:

```json
"scripts": {
  "test": "jest",
  "dev":  "nodemon  --exec babel-node ./api/index.js"
},

```
Lembrando sempre que você pode usar outros nomes e isso não é ruim, mas tome cuidado para não se confundir no restante do curso :)

Agora seu `package.json` deve estar algo próximo disso:

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
  "author": "",
  "license": "Unlicense",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "jest": "^24.9.0",
    "nodemon": "^2.0.2"
  },
  "devDependencies": {
    "eslint": "^6.8.0",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-plugin-import": "^2.19.1"
  }
}

```
Pode parecer um pouco estranho que o script de desenvolvimento aponte para um arquivo em um diretório que nem existe, mas não se preocupe. Vamos criar agora tanto o diretório quanto o arquivo.

```
$ mkdir api && touch api/index.js
```
Estou partindo do pressuposto que estamos dentro do diretório `new_store` e estamos criando diretórios e arquivos dentro dele. Aqui usamos comandos do terminal para criar tudo isso, mas você pode usar seu editor de textos favorito.

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

app.get('*', (req, res) => res.status(200).send({
   message: 'Esta é a API da nossa livraria.'
}))

app.listen(port, () => {
   console.log(`Server is running on PORT ${port}`)
})

export default app
```

Para conseguirmos usar completamente o ECMA6 precisaremos instalar o Babel, então vamos fazer isso pois ninguém gosta de escrever JS desatualizado e fora de moda, não é mesmo?

```
$ npm install --save-dev @babel/core @babel/cli @babel/node \
@babel/plugin-transform-runtime @babel/preset-env \
@babel/register @babel/runtime babel-loader
```
Junto com a instalação, vamos criar na raiz do projeto o arquivo de configuração do Babel, `.babelrc`, e adicionar nele as seguintes linhas:

```json
{
   "presets": ["@babel/preset-env"],
   "plugins": [["@babel/transform-runtime"]]
}
```

Agora é só executar o seu container:
```
$ docker-compose up dev
```
(não esqueça de executar `docker-compose down` antes disso, se você ainda estiver com o projeto anterior no ar)
E pronto, nosso novo servidor está no ar.

Para fazer a interface do Node.js com bancos relacionais como o Postgres, utilizamos o ORM [Sequelize](https://sequelize.org/). O Sequelize vai cuidar de toda a comunicação com o banco, sem que a gente precise mais se preocupar em fazer *queries* (`SELECT`, `INSERT`, etc) como no projeto anterior. Utilizaremos a partir de agora a sintaxe do Sequelize, que é mais intuitiva. 

Vamos instalar agora as dependências do Sequelize:
```
$ npm install sequelize-cli
```

E criar no nosso diretório raiz o arquivo `.sequelizerc` com o seguinte conteúdo:
```
const path  = require('path')

module.exports = {
    "config": path.resolve('./api/server/src/config', 'config.js'),
    "models-path": path.resolve('./api/server/src/models'),
    "seeders-path": path.resolve('./api/server/src/seeders'),
    "migrations-path": path.resolve('./api/server/src/migrations')
}
```
Instalaremos também o `path`, `sequelize`, `pg` e `pg-hstore` (o `pg` é de Postgres):
```
$ npm install --save path sequelize pg pg-hstore
```
Como fizemos a instalação do Sequelize de forma local (sem o -g eu espero), vamos executar o init dele usando o `npx`. Neste momento você pode estar se perguntando: mas por que eu vou usar isso?

O `npx` executa primariamente utilizando os binários locais e, caso ele não encontre, busca nos globais.

```
$ npx sequelize init
```
Seu projeto neste momento vai ter uma estrutura parecida com a abaixo (aproveite agora para criar o arquivo `.gitignore` e incluir nele o `node_modules`!):

```
├── node_modules
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
├── .babelrc
├── .sequelizerc
├── .gitignore
├── package.json
└── package-lock.json

```
Agora vamos editar um pouco os arquivos gerados:
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

```js
const config = {
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

export default config
```
