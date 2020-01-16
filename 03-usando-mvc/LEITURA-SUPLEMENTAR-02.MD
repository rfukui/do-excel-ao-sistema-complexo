## MIGRATIONS E ASSOCIATIONS

### MIGRATIONS

Migrations são como criamos e alteramos nossos bancos de dados dentro de um sistema de gerenciamento independente de bancos, eles contém normalmente o *schema* do banco e podemos adcionar neles inclusive algumas configurações iniciais, como usuário inicial do sistema, criação de todas as configurações de bancos necessárias para o sistema conseguir funcionar.

No caso específico do sequelize ele vem com os comando para subir e destruir as migrações, são eles os comandos up e down. Sendo o up o que é criado quando a migração é executada e o down o que é executado com a migração quando ela é desfeita.
o Up cria a tabela authors e o down dropa a tabela
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

Associations são como as tabelas se relacionam, elas podem se relacionar no modelo normal de várias formas, sendo elas:


## 1:1
Ambas tabelas podem ter somente um registro de cada lado do relacionamento.

Cada valor da chave primária se relaciona a nenhum ou a apenas um registro na tabela relacionada.

A maioria dos relacionamentos de um para um são forçados por regras de negócios e não fluem naturalmente dos dados. Sem tal regra, geralmente você pode combinar as duas tabelas sem quebrar nenhuma regra de normalização.

## 1:n
A tabela de chave primária contém somente um registro relacionado a nenhum, a um ou a muitos registros da tabela relacionada.

## n:n
Cada registro em ambas as tabelas pode se relacionar a nenhum ou a qualquer número de registros na outra tabela. Esses relacionamentos requerem uma terceira tabela, chamada de tabela associada ou de associação, pois os sistemas relacionais não podem acomodar diretamente o relacionamento.

No sequelize isso é definido em duas etapas nas migrações e no modelo, sendo nas migrações da seguinte forma:

aqui dentro da tabela que contém o campo ligado a outra tabela, falando que ela  é filha de autores.

```js
authorId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {model:'Authors', key:'id'}
    },
```
Já no modelo desta forma:

Aqui dentro da tabela mãe, dizendo que ela tem alguns filhos em livros
```js
Author.associate = function(models) {
  Author.hasMany(models.Book)
}
```
