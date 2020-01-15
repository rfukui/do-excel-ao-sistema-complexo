## Autenticação e Histórico

### Autenticação

Existem várias formas de se fazer autenticações em aplicações web, mesmo em APIs, a forma mais básica é com o que chamamos de basic-auth precisamos de poucas coisas para ele funcionar.

Vamos tomar por base nossa api anterior.

precisamos primeiro agora instalar um pacote cors

```
$ npm install cors
```
Em sequência vamos criar o model de usuários

```
$ npx sequelize-cli model:create --name User --attributes name:string,pass:string && npx sequelize-cli db:migrate
```

### ATENÇÃO!!!
**Este é um caso de estudo e a senha está sendo gravada como um texto simples, não faça isso nunca em produção.**


Vamos criar agora a controladora e o serviço dele.

Usaremos a principio a mesma estrutura para criar os serviços e controladores de usuários, agora vem a diferença, vamos criar o serviço de Autenticação também:

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

também precisamos alterar nosso `./api/index.js` para que ele receba as rotas novas e para que as rotas passem por autenticação:

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
criamos também os serviços de basicAuth e errorHandler, para podermos lidar direito com nossas apis seguras, lembre-se de separar sempre o máximo possível seu código.

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

também temos o serviço que trata os erros:
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
Assim ele tem agora autenticação basica.

Ponto de atenção. é necessário criar um usuário caso não haja nenhum usuário não será possível fazer conexões. Você pode criar um usuário padrão e colocar ele de forma manual no banco de dados, ou pode criar um usuário fake dentro do sistema, por exemplo:

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
