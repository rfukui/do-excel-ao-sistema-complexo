## Criando Serviços usando MVC

Ok, agora seu tio já tem uma API que pode ser consumida e alimentada, mas ela ainda tem problemas.

Da forma como está funcionando atualmente é possível, por exemplo, causar um estrago no banco de dados usando um processo hacker bem conhecido como [SQL INJECTION](https://www.devmedia.com.br/sql-injection/6102) e, vamos concordar, já estudamos bastante orientação a objetos e sabemos que no nosso código anterior não tem muito disso.

Vamos começar a fazer isso de forma bem mais profissional, usando um [ORM](https://pt.wikipedia.org/wiki/Mapeamento_objeto-relacional) para acessar os dados. Vamos separar as partes da aplicação em uma arquitetura do tipo [MVC](https://pt.wikipedia.org/wiki/MVC), com rotas bem definidas, e obviamente deixaremos de ter uma aplicação tipo _single file application_ (afinal de contas já sabemos trabalhar em estruturas de arquivo mais complexas e não precisamos escrever todo nosso código num só arquivo `script.js`, `app.js` ou `index.js`).

Vamos começar a fazer isso de forma bem mais profissional, usando um [ORM](https://pt.wikipedia.org/wiki/Mapeamento_objeto-relacional) para acessar os dados. Vamos separar as partes da aplicação em uma arquitetura do tipo [MVC](https://pt.wikipedia.org/wiki/MVC), com rotas bem definidas, e obviamente deixaremos de ter uma aplicação tipo _single file application_ (afinal de contas já sabemos trabalhar em estruturas de arquivo mais complexas e não precisamos escrever todo nosso código num só arquivo `script.js`, `app.js` ou `index.js`).

Primeira coisa: Vamos começar um novo projeto usando também o Sequelize, além de todas as outras ferramentas que já tínhamos instalado.

Aí você deve estar se perguntando: por que não apenas adcionar o Sequelize no projeto e refatorar?
O motivo é simples: é muito mais fácil recomeçar um projeto do jeito certo que tentar arrumar um projeto capenga, e em programação precisamos praticar sempre o desapego afetivo ao código. Então partiu jogar código fora e fazer do zero, agora de forma melhor.

Vamos criar uma nova pasta de projeto chamada `new_store` (fora da pasta que trabalhamos antes!) e começar a desenvolver dentro dela.

```
$ mkdir new_store && cd new_store && npm init
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
  "dev":  "nodemon  --exec babel-node ./api/index.js"
},

```
Lembrando sempre que você pode usar outros nomes e isso não é ruim, mas tome cuidado para não se confundir no restante do curso :)

Agora seu package.json deve estar algo próximo disso:

```json
{
  "name": "new_store",
  "version": "1.0.0",
  "description": "New version of bookstore tutorial",
  "main": "index.js",
  "scripts": {
    "dev":  "nodemon --exec babel-node ./api/index.js"
  },
  "author": "",
  "license": "Unlicense",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "jest": "^24.9.0",
    "nodemon": "^2.0.2",
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

Vamos agora criar novamente o arquivo do docker-compose, aquele que você já está craque, mas agora com uma pequena alteração para que ele possa funcionar melhor. Para entender melhor o que faz o `network`, você pode conferir o livro Docker Para Desenvolvedores, o mesmo que está indicado na primeira parte do tutorial.

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
    networks:
      - store-network
    depends_on:
      - db

  db:
    image: postgres
    container_name: new_store_db
    ports:
      - "5432:5432"
    volumes:
      - database:/var/lib/postgresql/data
    networks:
      - store-network

volumes:
  database:

networks:
  store-network:
    driver: bridge

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
Pronto, você tem o seu servidor no ar.

(não esqueça de executar `docker-compose down` antes disso, se você ainda estiver com o projeto anterior no ar)
E pronto, nosso novo servidor está no ar.

Para fazer a interface do Node.js com bancos relacionais como o Postgres, utilizamos o ORM [Sequelize](https://sequelize.org/). O Sequelize vai cuidar de toda a comunicação com o banco, sem que a gente precise mais se preocupar em fazer *queries* (`SELECT`, `INSERT`, etc) como no projeto anterior. Utilizaremos a partir de agora a sintaxe do Sequelize, que é mais intuitiva.

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
├── node-modules
├── node_modules
├── api
│   ├── index.js
│   └── server
│       └── src
│           ├── config
│           │   └── config.js
│           ├── migrations
│           ├── models
│           │   └── index.js
│           └── seeders
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
module.exports = {
  "development": {
    "username": "postgres",
    "password": null,
    "database": "new_store_development",
    "host": "db",
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "test": {
    "username": "postgres",
    "password": null,
    "database": "new_store_test",
    "host": "db",
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "production": {
    "username": "postgres",
    "password": null,
    "database": "new_store_production",
    "host": "db",
    "dialect": "postgres",
    "operatorsAliases": false
  }
}
```

### Criando seu banco de dados, modelos e arquivos de migração

O arquivo de configuração referencia um banco de dados chamado "new_store_development" e outro chamado "new_store_test", ambos para os ambientes que não são de produção. Vamos criar esses bancos da mesma forma que no tutorial anterior. Primeiros vamos subir o serviço de banco de dados, exatamente como tinhamos feito anteriormente também (não esqueça do `docker-compose down` antes, se o anterior ainda estiver no ar):
```
$ docker-compose up db
```
Agora que você subiu o banco de dados, é só criar todos os bancos que criamos anteriormente em _new_store_. Lembra como fizemos isso nos passos anteriores? Em caso de dúvida volte alguns passos para relembrar. Mas agora não precisa inserir nenhum cadastro de livro, como fizemos anteriormente, pois vamos fazer isso com modelos.

Vamos criar agora o nosso primeiro modelo, usando uma _feature_ do Sequelize.
No terminal, navegue até a pasta raiz `new_store`. Vamos usar a linha de comando para criar um *modelo* para cadastrar primeiro os autores, com os campos que já conhecemos do antigo banco (nome, se está vivo). Vamos começar pelos autores para podermos usar suas informações como *chaves estrangeiras* em outras tabelas. Então sempre criamos os modelos a partir do mais básico, depois o mais completo (dos que não têm chaves estrangeiras para os que têm):

```
$ npx sequelize-cli model:create --name Author --attributes name:string,is_alive:boolean
```
Se você ler o comando acima com atenção, vai ver que não foram criados os campos `id` e nem `created_at`.
Esse comando criou, dentro da pasta `models`, um novo arquivo `author.js` e o Sequelize já até colocou algum código dentro dele pra facilitar a nossa vida (essa é uma das grandes vantagens de usá-lo). Vamos ver o que tem nele em `./new_store/api/server/src/models/author.js`:

```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    name: DataTypes.STRING,
    is_alive: DataTypes.BOOLEAN
  }, {});
  Author.associate = function(models) {
    // associations can be defined here
  };
  return Author;
};
```
O que está acontecendo nesse código? Leia cada linha com calma, e quando ver algum método que não reconheça (por exemplo, o método `.define` do Sequelize), faça uma pesquisa na documentação ou no Google mesmo. Depois, se quisermos, podemos modificar algumas coisas nele.

Agora, baseado nisso, criaremos as migrações necessárias da seguinte forma (até este momento para apenas uma tabela, a `Author`), vamos alterar o script de inicialização do `package.json` e também nosso `docker-compose.yml`.

`package.json`:
```json
"scripts": {
  "migrate": "npx sequelize-cli db:migrate",
  "test": "export NODE_ENV=test &&  sequelize db:migrate:undo:all  && sequelize db:migrate  && nyc --require @babel/register mocha ./api/test/*-test.js --timeout 20000 --exit",
  "dev": "nodemon --exec babel-node ./api/index.js"
}
```

`docker-compose.yml`:
```yml
services:
  dev:
    image: node:12-alpine
    container_name: new_store_api_dev
    command:  sh -c "npm run migrate && npm run dev"
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./:/app:cached
    networks:
      - store-network
    depends_on:
      - db

  test:
    image: node:12-alpine
    container_name: new_store_api_test
    command:  sh -c "npm run migrate && npm run test"
    working_dir: /app
    ports:
      - "3001:3000"
    volumes:
      - ./:/app:cached
    networks:
      - store-network
    depends_on:
      - db
```

Foi criado neste momento um script que toda vez que você iniciar seu container a primeira coisa que ele irá fazer é executar a migração, com isso não precisaremos nos preocupar em executar de forma individual, basta baixar e subir o contaier. um processo que costuma ser bem rápido.

Então se logarmos no banco (volte alguns passos se tiver que relembrar como) e procurarmos a tabela, veremos que ela foi criada com alguns campos extras, o que chamamos de campos de auditoria e o de identificação; os ORMs costumam fazer desta forma. Notamos também que a tabela está com o nome no plural.

```
new_store_development=# select * from "Authors";
 id | name | is_alive | createdAt | updatedAt
----+------+----------+-----------+-----------
(0 rows)

```

Veja que o comando acima também criou um arquivo na pasta `migrations`, que normalmente inicia com a data/hora. Enquanto este tutorial está sendo criado, o nome e caminho é `./new_store/api/server/src/migrations/20200113215229-create-author.js` (o seu vai ter um número diferente, claro), e ele deve conter o seguinte conteúdo:

```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Authors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      is_alive: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Authors');
  }
};
```
Note que o arquivo foi criado com os campos que "estranhamos" existirem no banco de dados (`id`, `createdAt` e `updatedAt`). A ORM do Sequelize já faz esse trabalho pra gente, então quando criarmos as tabelas só temos que nos preocupar com as informações que queremos.

Vamos criar agora também os modelos de Book e Publisher. Seguindo a lógica que vimos anteriormente, vamos criar primeiro o de Publisher (editora), pois vamos precisar dos dados dessa tabela como referência para a tabela Books.

Agora é com você! Utilizando as ferramentas de linha de comando do Sequelize, crie o modelo de Publisher e depois criaremos juntos o de Book. Pode usar os mesmos campos que usamos anteriormente, quando criamos as tabelas "na mão". Confirme nas pastas `model` e `migrations` se está tudo certinho!

Então vamos à tabela Books. Aqui vamos fazer um pouco diferente, escrevendo tanto o modelo quanto a migração de forma manual. Não deve ser difícil, uma vez que os arquivos que o Sequelize criou pra gente já dão uma "cola" de como eles devem ser.

O modelo se chamará `Book` e a migration será a `create-book`. Você pode fazer direto no seu editor de código.

`book.js`
```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: DataTypes.STRING,
    isbn: DataTypes.STRING,
    buyValue: DataTypes.DECIMAL(10,2),
    sellValue: DataTypes.DECIMAL(10,2)

  }, {});
  return Book;
};

```

`create-book.js`

```js
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isbn: {
        type: Sequelize.STRING
      },
      buyValue: {
        allowNull: false,
        type: Sequelize.DECIMAL
      },
      sellValue: {
        allowNull: false,
        type: Sequelize.DECIMAL
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      authorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      publisherId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Books');
  }
};

```

Agora que já temos todas as tabelas que precisamos, é hora de integrar tudo!
Vamos alterar os arquivos de modelo de Autores e Editoras, para que eles possam ter suas associações criadas (veja que o Sequelize até deixou um comentário no trecho de código):

`author.js`

```js
.
.
.
  Author.associate = function(models) {
    Author.hasMany(models.Book)
  };
  return Author;
};

```

`publisher.js`
```js
.
.
.
  Publisher.associate = function(models) {
    Publisher.hasMany(models.Book)
  };
  return Author;
};

```

Criação das chaves estrangeiras nas tabelas:

`create-books.js`
```js
// arquivo de migração com chaves estrangeiras

authorId: {
  allowNull: false,
  type: Sequelize.INTEGER,
  references: {model:'Authors', key:'id'}
},

publisherId: {
  allowNull: false,
  type: Sequelize.INTEGER,
  references: {model:'Publishers', key:'id'}
}

```
Dessa forma, estamos associando as tabelas `Publishers` e `Authors` à tabela `Books`, através da chave (_key_) `id`.

### Criando nossos serviços controladores e rotas

#### Serviços

Agora talvez você esteja achando um pouco exagerada (e talvez um pouco confusa) a separação em tantos arquivos. Mas acredite, é muito melhor cada coisa estar em seu lugar certinho e muito bem separada, inclusive para manutenção e isolamento. Lembre-se que essa não é uma ***single file application*** e inclusive se você se deparar com isso em sua vida profissional, acredite, você estará em maus lençóis.

Mas o que são esses serviços? Eles a princípio não existiam no modelo MVC, mas eles te ajudam em fazer, neste caso, o acesso aos modelos, não sendo o modelo acessado diretamente pelo controlador (já vamos falar mais dos controladores). É especificamente bom criá-los porque, se em algum momento alterarmos o banco de dados, não precisaremos alterar o controlador. Ou seja, alteração passa a ser mais atômica, e com isso mais fácil de ser executada e encontrar possíveis bugs no sistema.

Vamos criar o diretório de serviços dentro do diretório `server` com o nome `services`. Dentro de `services`, vamos criar o arquivo `AuthorService.js`, com o seguinte conteúdo:

`./new_store/api/server/services/AuthorService.js`
```js
import database from '../src/models'

class AuthorService {
  static async getAllAuthors() {
    try {
      return await database.Author.findAll()
    } catch (error) {
      throw error
    }
  }

  static async addAuthor(newAuthor) {
    try {
      return await database.Author.create(newAuthor)
    } catch (error) {
      throw error
    }
  }

  static async updateAuthor(id, updateAuthor) {
    try {
      const authorToUpdate = await database.Author.findOne({
        where: { id: Number(id) }
      })

      if (authorToUpdate) {
        await database.Author.update(updateAuthor, { where: { id: Number(id) } })

        return updateAuthor
      }
      return null
    } catch (error) {
      throw error
    }
  }

  static async getAuthor(id) {
    try {
      const theAuthor = await database.Author.findOne({
        where: { id: Number(id) }
      })

      return theAuthor
    } catch (error) {
      throw error
    }
  }

  static async deleteAuthor(id) {
    try {
      const authorToDelete = await database.Author.findOne({ where: { id: Number(id) } })

      if (authorToDelete) {
        const deletedAuthor = await database.Author.destroy({
          where: { id: Number(id) }
        })
        return deletedAuthor
      }
      return null
    } catch (error) {
      throw error
    }
  }
}

export default AuthorService

```

#### Controladores

Controladores são os responsáveis pelas regras de negócio da sua aplicação. Elas recebem as chamadas das rotas e fazem os tratamentos necessários nos retornos dos serviços. Normalmente é no controlador que implementamos, por exemplo, as regras de acesso a uma rota específica.

Agora vamos criar o controlador de autor.

Para isso, criamos um diretório chamado `controllers` dentro do diretório `server`, e dentro dele criamos o arquivo `Authorcontroller.js`, com o seguinte conteúdo:

```js
import AuthorService from '../services/AuthorService'
import Util from '../utils/Utils'

const util = new Util()

class AuthorController {
  static async getAllAuthors(req, res) {
    try {
      const allAuthors = await AuthorService.getAllAuthors()
      if (allAuthors.length > 0) {
        util.setSuccess(200, 'Authors retrieved', allAuthors)
      } else {
        util.setSuccess(200, 'No Author found')
      }
      return util.send(res)
    } catch (error) {
      util.setError(400, error)
      return util.send(res)
    }
  }

  static async addAuthor(req, res) {
    console.log(req.body.name, req.body.is_alive)
    if (!req.body.name || !req.body.is_alive ) {
      util.setError(400, 'Please provide complete details')
      return util.send(res)
    }
    const newAuthor = req.body
    try {
      const createdAuthor = await AuthorService.addAuthor(newAuthor)
      util.setSuccess(201, 'Author Added!', createdAuthor)
      return util.send(res)
    } catch (error) {
      util.setError(400, error.message)
      return util.send(res)
    }
  }

  static async updatedAuthor(req, res) {
    const alteredAuthor = req.body
    const { id } = req.params
    if (!Number(id)) {
      util.setError(400, 'Please input a valid numeric value')
      return util.send(res)
    }
    try {
      const updateAuthor = await AuthorService.updateAuthor(id, alteredAuthor)
      if (!updateAuthor) {
        util.setError(404, `Cannot find author with the id: ${id}`)
      } else {
        util.setSuccess(200, 'Author updated', updateAuthor)
      }
      return util.send(res)
    } catch (error) {
      util.setError(404, error)
      return util.send(res)
    }
  }

  static async getAuthor(req, res) {
    const { id } = req.params

    if (!Number(id)) {
      util.setError(400, 'Please input a valid numeric value')
      return util.send(res)
    }

    try {
      const theAuthor = await AuthorService.getAuthor(id)

      if (!theAuthor) {
        util.setError(404, `Cannot find Author with the id ${id}`)
      } else {
        util.setSuccess(200, 'Found Author', theAuthor)
      }
      return util.send(res)
    } catch (error) {
      util.setError(404, error)
      return util.send(res)
    }
  }

  static async deleteAuthor(req, res) {
    const { id } = req.params

    if (!Number(id)) {
      util.setError(400, 'Please provide a numeric value')
      return util.send(res)
    }

    try {
      const authorToDelete = await AuthorService.deleteAuthor(id)

      if (authorToDelete) {
        util.setSuccess(200, 'Author deleted')
      } else {
        util.setError(404, `Author with the id ${id} cannot be found`)
      }
      return util.send(res)
    } catch (error) {
      util.setError(400, error)
      return util.send(res)
    }
  }
}

export default AuthorController

```

Como você observa eu importei no começo do arquivo o utils, mas ele ainda não existe. Vamos criá-lo agora também.
O arquivo de utils ficará dentro do diretório utils (`./api/server/utils/Utils.js`) e terá o seguinte conteúdo:

```js
export default class Util {
  constructor() {
    this.statusCode = null
    this.type = null
    this.data = null
    this.message = null
  }

  setSuccess(statusCode, message, data) {
    this.statusCode = statusCode
    this.message = message
    this.data = data
    this.type = 'success'
  }

  setError(statusCode, message) {
    this.statusCode = statusCode
    this.message = message
    this.type = 'error'
  }

  send(res) {
    const result = {
      status: this.type,
      message: this.message,
      data: this.data,
    }

    if (this.type === 'success') {
      return res.status(this.statusCode).json(result)
    }
    return res.status(this.statusCode).json({
      status: this.type,
      message: this.message,
    })
  }
}
```

Cuidado com a utilização do `Utils`! Normalmente utils são arquivos que não pensamos direito para criar e quando não sabemos onde colocar alguma função da aplicação, colocamos lá dentro. Talvez para a versão 2.0 desse tutorial ele tenha um nome melhor (me cobrem), mas por enquanto fica utils mesmo.

Agora vamos rodar nossa migração com todas as alterações e executar nosso código:

```
$ npx sequelize-cli db:migrate
```

### Rotas

As rotas são parecidas com as que criamos para o tutorial anterior (aquele do *single file application*), mas agora temos que separar bem as coisas dentro do sistema.

Vamos criar um diretório chamado `routes` dentro de `./api/server` e, dentro dele, criar o arquivo `AuthorRoutes.js`, que será o responsável por determinar qual controlador cada rota chamará.

Segue o arquivo:
```js
import { Router } from 'express'
import AuthorController from '../controllers/AuthorController'

const router = Router()
router.get('/', AuthorController.getAllAuthors)
router.post('/', AuthorController.addAuthor)
router.get('/:id', AuthorController.getAuthor)
router.put('/:id', AuthorController.updatedAuthor)
router.delete('/:id', AuthorController.deleteAuthor)
export default router

```

Se lermos o código acima, dá pra ver que está tudo apontando para o '/'. Como assim?
Vamos também alterar o arquivo principal, o `./api/index.js`, aí tudo vai fazer sentido. Faça da seguinte forma:

```JS
import express from 'express'
import bodyParser from 'body-parser'
import authorRoutes from './server/routes/AuthorRoutes';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.use('/api/authors', authorRoutes);

// quando recebe uma rota não listada
app.get('*', (req, res) => res.status(200).send({
  message: 'Boas-vindas à API!',
}));

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

module.exports = app

```
Note que o arquivo recebeu o `import` do arquivo da rota de autores, e o método `app.use` define a rota `/api/author` para receber as requisições de autor. Ou seja: todas as rotas que estão no arquivo `AuthorRoutes.js` como "/" na verdade estão apontando (como você já deve ter concluído) para `/api/author`. O mesmo deve se repetir para todas as outras rotas.

Depois disso basta reiniciar nosso container:

```
$ docker-compose up dev
```

Hora de usar o Postman para ver as rotas funcionando!
Use-o para enviar requisições `GET` para http://localhost:3000/ e http://localhost:3000/api/authors e veja o que acontece! Consegue localizar no código os trechos correspondentes às respostas dessas requisições?

Agora temos a primeira fase na nossa API rodando, com exatamente todos os comandos necessários para criar, editar, consultar e apagar um autor. A partir daqui, você deve conseguir fazer o que falta para as editoras e os livros ;)

### Escrevendo testes

Vamos criar alguns testes de integração.

Antes de tudo, instalar as bibliotecas de testes:
```
npm install --save-dev mocha chai chai-http nyc
```
Agora vamos criar o arquivo de testes em `./api/test/author-api-test.js`


```js
import chai from 'chai'
import chatHttp from 'chai-http'
import 'chai/register-should'
import app from '../index'
chai.use(chatHttp)
const { expect } = chai

describe('Testing the author endpoints:', () => {
  it('It should create a author', (done) => {
    const author = {
      name: 'First Awesome author',
      is_alive: true
    }
    chai.request(app)
      .post('/api/authors')
      .set('Accept', 'application/json')
      .send(author)
      .end((err, res) => {
        expect(res.status).to.equal(201)
        expect(res.body.data).to.include({
          id: 1,
          name: author.name,
          is_alive: author.is_alive
        })
        done()
      })
  })

  it('It should not create a author with incomplete parameters', (done) => {
    const author = {
      is_alive: true
    }
    chai.request(app)
      .post('/api/authors')
      .set('Accept', 'application/json')
      .send(author)
      .end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
  })

  it('It should get all authors', (done) => {
    chai.request(app)
      .get('/api/authors')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        res.body.data[0].should.have.property('id')
        res.body.data[0].should.have.property('name')
        res.body.data[0].should.have.property('is_alive')
        done()
      })
  })

  it('It should get a particular author', (done) => {
    const authorId = 1
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        res.body.data.should.have.property('id')
        res.body.data.should.have.property('name')
        res.body.data.should.have.property('is_alive')
        done()
      })
  })

  it('It should not get a particular author with invalid id', (done) => {
    const authorId = 8888
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Cannot find Author with the id ${authorId}`)
        done()
      })
  })

  it('It should not get a particular author with non-numeric id', (done) => {
    const authorId = 'aaa'
    chai.request(app)
      .get(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message')
                            .eql('Please input a valid numeric value')
        done()
      })
  })

  it('It should update a author', (done) => {
    const authorId = 1
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.data.id).equal(updatedAuthor.id)
        expect(res.body.data.name).equal(updatedAuthor.name)
        expect(res.body.data.is_alive).equal(updatedAuthor.is_alive)
        done()
      })
  })

  it('It should not update a author with invalid id', (done) => {
    const authorId = '9999'
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author again',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Cannot find author with the id: ${authorId}`)
        done()
      })
  })

  it('It should not update a author with non-numeric id value', (done) => {
    const authorId = 'ggg'
    const updatedAuthor = {
      id: authorId,
      name: 'Updated Awesome author again',
      is_alive: false
    }
    chai.request(app)
      .put(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .send(updatedAuthor)
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message')
                            .eql('Please input a valid numeric value')
        done()
      })
  })


  it('It should delete a author', (done) => {
    const authorId = 1
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.data).to.include({})
        done()
      })
  })

  it('It should not delete a author with invalid id', (done) => {
    const authorId = 777
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(404)
        res.body.should.have.property('message')
                            .eql(`Author with the id ${authorId} cannot be found`)
        done()
      })
  })

  it('It should not delete a author with non-numeric id', (done) => {
    const authorId = 'bbb'
    chai.request(app)
      .delete(`/api/authors/${authorId}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400)
        res.body.should.have.property('message').eql('Please provide a numeric value')
        done()
      })
  })
})

```
Estes são testes de integração, eles recevem esse nome porque tratam de um fluxo que passa por várias rotinas do programa, ao contrário dos testes unitários, que se preocupam apenas com a sua função mais básica, sem considerar todo o fluxo, ou boa parte dele.
O teste é o que chamamos de documentação viva de um programa. Toda vez que um programa é mudado, ele deve ter um teste dizendo como é esperado que o programa se comporte, e aqui podemos ver isso claramente. Para cada um dos endpoints de autor, temos um teste dizendo o que se espera que aconteça, incluindo os casos de erro.

Este é um bom exemplo de como testes podem testar todo um código sem precisar de testes unitários. Testes devem sempre ser escritos se fizerem sentido; nesse caso, não fazia sentido fazer testes para os códigos gerados automaticamente pelos frameworks. Só devemos acreditar que eles funcionam, pois é responsabilidade de cada *framework* ou biblioteca escrever os testes para suas próprias funcionalidades.

Vamos editar novamente o `package.json` e incluir a parte dos testes:

```json
"test": "export NODE_ENV=test &&  sequelize db:migrate:undo:all  && sequelize db:migrate  && nyc --require @babel/register mocha ./api/test/*-test.js --timeout 20000 --exit",
```
Veja o primeiro comando do teste: ele diz que vamos usar o ENV (*environment*, ambiente) chamado `test`. Caso não se lembre onde está isso no código, dê uma olhada no arquivo `config/config.js`. A partir daí, criamos a migração do teste e com isso teremos um banco completamente vazio, e depois disso executamos os testes. A intenção é ter um banco somente para isso, fazer os testes sem mexer no banco de desenvolvimento, ou pior, de produção.

Vamos também adicionar a parte de testes no `docker-compose`.

```yml
services:
.
.
.
  test:
    image: node:12-alpine
    container_name: new_store_api_test
    command:  npm run test
    working_dir: /app
    ports:
      - "3001:3000"
    volumes:
      - ./:/app:cached
    networks:
      - store-network
    depends_on:
      - db
```
Note que a porta de saída do teste é a 3001, mesmo rodando internamente na porta 3000. Isso acontece porque compartilhamos a porta como "localhost" no nosso computador e não conseguimos rodar 2 aplicações na mesma porta.

A partir daqui já podemos fazer o serviço completo para todas as outras APIs necessárias para executar seu projeto.
