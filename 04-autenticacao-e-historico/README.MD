## Autenticação e Histórico

### Autenticação

Existem várias formas de se fazer autenticações em aplicações web, mesmo em APIs. A forma mais básica é com o que chamamos de basic-auth e precisamos de poucas coisas para ele funcionar.

Vamos tomar por base nossa API anterior.

precisamos primeiro instalar um pacote CORS:

```
$ npm install cors
```
Em sequência vamos criar o model de usuários:

```
$ npx sequelize-cli model:create --name User --attributes name:string,pass:string && npx sequelize-cli db:migrate
```

### ATENÇÃO!
**Este é um caso de estudo e a senha está sendo gravada como um texto simples, não faça isso nunca em produção.**


Vamos criar agora o controlador e o serviço dele.

Usaremos a princípio a mesma estrutura para criar os serviços e controladores de usuários. Agora vem a diferença: também vamos criar o serviço de Autenticação:

```js

static async authenticate(req) {
  const {username, password} = req
  const user = await database.User.findOne(
    { where : {
      name : username + "",
      pass : password + ""
    }}
  )
  if (user) {
    const { name } = user
    return { name }
  }
}

```
... e no controller a inclusão do seguinte código:

```js

static async authenticate(req, res, next) {
  UserService.authenticate(req.body)
      .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
      .catch(err => next(err))
}

```
Com isso teremos uma autenticação básica usando o seu password e usuário com basic auth.

Também precisamos alterar nosso `./api/index.js` para que ele receba as rotas novas e para que as rotas passem por autenticação:

```js
import express from 'express'
import bodyParser from 'body-parser'
import authorRoutes from './server/routes/AuthorRoutes'
import userRoutes from './server/routes/UserRoutes'
const basicAuth = require('./server/services/basic-auth')
const errorHandler = require('./server/services/error-handler')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use(basicAuth)
app.use('/api/authors', authorRoutes)

// when a random route is inputed
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to this API.',
}))

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`)
})

module.exports = app

```
criamos também os serviços de basicAuth e errorHandler, para podermos lidar direito com nossas APIs seguras. Lembre-se de separar sempre o máximo possível seu código.

`./api/server/services/basic-auth.js`

```js
import UserService from './UserService'

module.exports = basicAuth

async function basicAuth(req, res, next) {
    if (req.path === '/api/users/authenticate') {
        return next()
    }
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' })
    }
    const base64Credentials =  req.headers.authorization.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')
    const user = await UserService.authenticate({ username, password })
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' })
    }
    req.user = user

    next()
}

```
Aqui ele verifica se um path é livre, neste caso o que podemos fazer a validação de usuários sem precisar fazer o basicAuth e trava todas as outras rotas para necessidade de autenticação.

Também temos o serviço que trata os erros:
`./api/server/services/error-handler.js`

```js
module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        return res.status(400).json({ message: err });
    }
    return res.status(500).json({ message: err.message })
}

```
Assim seu sistema tem agora um autenticação básica.

Ponto de atenção: é necessário criar um usuário; caso não haja nenhum usuário não será possível fazer conexões. Você pode criar um usuário padrão e colocar ele de forma manual no banco de dados, ou pode criar um usuário fake dentro do sistema, por exemplo:

```js
static async authenticate(req) {
  const {username, password} = req
  if username ==="usuário de teste" && password ==="password de teste"{
    return { name : username }
  }
  const user = await database.User.findOne(
    { where : {
      name : username + "",
      pass : password + ""
    }}
  )
  if (user) {
    const { name } = user
    return { name }
  }
}

```
Essa é uma prática válida para ambientes de desenvolvimento, mas cuidado sempre ao adotar algo assim nos seus códigos.

### Criando um histórico de alteração de bancos de dados

Nosso sistema está ficando bem interessante. Ele já tem autenticação e agora vamos colocar um histórico para todas as tabelas. Eles são importantes porque conseguimos salvar todos os estados que o banco passa, tanto para tentar descobrir possíveis bugs em suas aplicações quanto para descobrir se houve transações indesejadas no seu banco.

Para nosso sistema de histórico vamos utilizar o `sequelize-history` em conjunto com o sequelize-cli para gerar nossas tabelas históricas no banco.

Vamos começar instalando o `sequelize-history`:

```
$ npm i sequelize-history --save
```

É bem intuitivo usar o `sequelize-history`, basta importá-lo nos modelos existentes e fazer uma pequena alteração no `index.js` do model:

```js
import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import configJson from '../config/config'

const sequelizeHistory = require('sequelize-history');
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
const { Author, AuthorHistory } = sequelize.import('./author')
const { User, UserHistory } = sequelize.import('./user')
const { Publisher, PublisherHistory } = sequelize.import('./publisher')

const models = {
  Author,
  AuthorHistory,
  Publisher,
  PublisherHistory,
  User,
  UserHistory
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

const trackAll = require('sequelize-history').all
trackAll(sequelize)
export default db

```

Perceba que mudamos a forma como importamos os models de forma individual neste trecho do código:

```js

const { Author, AuthorHistory } = sequelize.import('./author')
const { User, UserHistory } = sequelize.import('./user')
const { Publisher, PublisherHistory } = sequelize.import('./publisher')

const models = {
  Author,
  AuthorHistory,
  Publisher,
  PublisherHistory,
  User,
  UserHistory
}

```

Isso implica em uma pequena mudança nos modelos também:

```js

'use strict';
const sequelizeHistory = require('sequelize-history');

const Author = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    name: DataTypes.STRING,
    is_alive: DataTypes.BOOLEAN
  }, {});
  Author.associate = function(models) {
    Author.hasMany(models.Book)
  };
  const AuthorHistory = sequelizeHistory(Author, sequelize)

  return { Author, AuthorHistory };
};

module.exports = Author

```

Nada muito diferente! Apenas, como podem ver, incluímos o AuthorHistory como um sequelizeHistory e exportamos ambos. Falta apenas criar as migrations.

Aqui segue o exemplo da migração de autores:

`create-author-history.js`
```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AuthorHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      modelId: {
          type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      is_alive: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      archivedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AuthorHistories');
  }
};
```

Lembre-se que os nomes seguem padrões predeterminados. Você precisa criar todos os campos que já existem nas tabelas e mais 2 campos, o modelId e o id, e tudo funcionará magicamente.

Agora tente implementar um serviço na sua API que retorne o histórico de um autor com a seguinte url `/api/authors/:id/history`. Lembre-se que este `id` não é o id do histórico e sim do autor.

### Níveis de permissão

Para trabalharmos com níveis de permissão, também conhecidos como "roles", precisamos alterar um pouco nossos modelos e criar ainda mais complexidade ao sistema.

Pense que no mundo ideal todo mundo é bem honesto, mas estamos falando sobre sistemas de informações, logo existe também a falha humana. Imagine que bastasse qualquer pessoa estar logada numa determinada conta e ela teria todas as permissões para fazer qualquer tipo de alteração no sistema. Não parece um pouco arriscado?

Para lidarmos com isso precisamos lidar com cada tipo de usuário e cada tipo de permissão. Podemos atribuir isso por roles, ou no nível do usuário mesmo.

Por exemplo:

A usuária Marcela pode fazer todas as operações no sistema, pois é a gerente. Porém Marcela, enquanto gerente, quer que seus liderados não possam apagar dados e alguns outros só possam consultar algum tipo de dado muito específico.
Como faríamos isso?

Bom, podemos criar a seguinte estrutura de `roles`, de acordo com os modelos.

Sugerimos que essa estrutura tenha 2 campos:

`role`
```
Nome da role
Está Ativa?
```
`Permissão de role`:
```
identificação da role
nome do modelo
leitura?
inserção?
alteração?
deleção?
```
um role por usuário
```
id do usuário
id da role
```

Você se lembra como fizemos o sistema de permissão de acesso?
Em cada serviço vai ser necessário fazer a implementação para descobrir se o usuário pode ou não acessar cada um deles. Pode dar um pouquinho de trabalho, mas é uma prática super útil para você entender cada vez mais como funciona o trabalho com um banco de dados.
