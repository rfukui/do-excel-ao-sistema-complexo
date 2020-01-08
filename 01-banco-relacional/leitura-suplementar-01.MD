## DDL E DML

### DDL
DDL vem do inglês, data definition language, ou seja, linguagem de definição de dados. Elas são parte importante da manipulação de um SGDBR, sendo as mais perigosas inclusive, pois um comando destes "salva" o estado do banco de dados naquele momento, sendo "impossível" reverter os dados ainda não salvos para o estado anterior. Vamos entender melhor isso quando falarmos sobre sessões em bancos de dados.

#### Tipos de comandos
Os comandos DDL são classificados em quatro tipos, CREATE, DROP, ALTER e TRUNCATE, cada qual com seus subcomandos específicos.

Neste curso trabal haremos apenas com criação e alteração de banco de dados e tabelas. Mas elas podem existir para os mais variados tipos de *coisas* que um banco de dados pode ter. Caso queira se aprofundar mais neste assunto recomendo estudar bastante estrutura de dados e adminstração de servidores e bancos. É um material bem vasto e ainda hoje um dos empregos mais bem pagos da área de Tecnologia da informação.

O postgres usa um pseudo tipo (um pseudo tipo é neste caso um *alias* para um tipo mais complexo com uma série de regras) para criar valores auto-incrementáveis. ele é o SERIAL, aconcelho ler este [material](https://www.postgresqltutorial.com/postgresql-serial/) para entender melhor.

Exemplo de criação de tabela:

```SQL
CREATE TABLE books (
    id                    SERIAL   PRIMARY KEY,
    name                  CHAR(255) NOT NULL,
    isbn                  CHAR(13)  NULL,
    creation_date         DATE      NULL
);
```
Para se apagar uma tabela ou um banco de dados usamos o comando DROP, cuidado, uma vez que um banco de dados é *DROPADO* ele também apaga junto todas as tabelas criadas nele e as informações contidas nelas.

O TRUNCATE é um tipo muito especial de DDL, ele é parecido com um DELETE sem WHERE, porém por ser um DDL, ele é impossível de ser revertido em caso executado. **USEM COM SABEDORIA**

Utilizamos o ALTER para alterar propriedades das tabelas criadas, por exemplo, caso fossemos incluir uma nova coluna na nossa tabela de livros fariamos da seguinte forma.

```SQL
ALTER TABLE books
ADD COLUMN author CHAR(255);
```
