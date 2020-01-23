## MIGRATIONS E ASSOCIATIONS

### MIGRATIONS

_Migrations_ (ou migrações) são como criamos e alteramos nossos bancos de dados dentro de um sistema de gerenciamento independente de bancos. Eles contém normalmente o *schema* do banco e podemos adicionar neles inclusive algumas configurações iniciais, como usuário inicial do sistema e a criação de todas as configurações de bancos necessárias para o sistema funcionar.

No caso específico do Sequelize, ele já inclui os comandos para subir e destruir as migrações, os comandos `up` e `down` (você deve ter visto no código dos arquivos `<data>-create-<nome do modelo>.js` que foram gerados nos comandos de migração que fizemos no terminal). O `up` é criado quando a migração é executada e o `down` é executado com a migração quando ela é desfeita.

O `up` cria a tabela `authors` e o `down` "dropa" a tabela. Usamos "dropar" pois `DROP` é o comando que usamos em SQL para destruir algo (uma tabela, um banco) e não temos um termo melhor em português para traduzir isso :)

```js
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
```

### ASSOCIATIONS

_Associations_ (associações) são como as tabelas se relacionam. Elas podem se relacionar no modelo normal de várias formas, sendo elas:


## 1:1
Ambas as tabelas podem ter somente um registro de cada lado do relacionamento.

Cada valor da chave primária se relaciona a nenhum ou a apenas um registro na tabela relacionada.

A maioria dos relacionamentos de um para um são forçados por regras de negócios e não fluem naturalmente dos dados. Sem tal regra, geralmente você pode combinar as duas tabelas sem quebrar nenhuma regra de normalização.

## 1:n
A tabela de chave primária contém somente um registro relacionado a nenhum, a um ou a muitos registros da tabela relacionada. 

## n:n
Cada registro em ambas as tabelas pode se relacionar a nenhum ou a qualquer número de registros na outra tabela. Esses relacionamentos requerem uma terceira tabela, chamada de tabela associada ou de associação, pois os sistemas relacionais não podem acomodar diretamente o relacionamento.

Por exemplo: *1* autor pode escrever *n* livros, então em uma lista de livros não precisamos incluir manualmente, para cada livro, o nome do autor. Podemos usar uma tabela de autores para se _relacionar_ com a tabela de livros. 

No sequelize isso é definido em duas etapas, nas migrações e no modelo, sendo nas migrações da seguinte forma: Dentro da tabela de livros que contém o campo ligado a outra tabela, indicamos que ela é "filha" de autores através do `id`.

```js
authorId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {model:'Authors', key:'id'}
    },
```
Já no modelo, desta forma: Dentro da tabela mãe, indicamos que ela tem alguns filhos (`hasMany`) em livros.
```js
Author.associate = function(models) {
  Author.hasMany(models.Book)
}
```
Lembrando que `hasMany` é um método que o Sequelize disponibiliza para fazermos as associações. Utilizamos vários métodos do Sequelize para desenvolver nosso sistema, tente sempre identificá-los e consultar a documentação se tiver dúvidas sobre o que cada um faz. Isso é **muito importante**.
