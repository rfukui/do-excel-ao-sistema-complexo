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

## DML

DML vem do inglês, data manipulation language, ou seja, linguagem de manipulação de dados, serve, como o próprio nome diz, para manipular dados.
Os tipos de DML são, SELECT, INSERT, UPDATE e DELETE.

Existem algumas regras básicas para se trabalhar com SQL, que é a linguagem dml de banco de dados relacionais.

### Selects

Selects são a forma de se consultar alguma informação, nela, podendo inclusive se usar várias tabelas para se fazer o mesmo.

Exemplo de selects:
```SQL
SELECT * FROM books;
-- traz todo o conteudo da tabela.

SELECT * FROM books where name = 'Pedro';
-- traz todo o conteudo da tabela que o nome seja exatamente igual Pedro

SELECT * FROM books where name like 'Pedro%';
-- traz todo o conteudo da tabela que o nome comece com Pedro

SELECT * FROM books where name like '%Pedro%';
-- traz todo o conteudo da tabela que o nome contenha Pedro

SELECT * FROM books b
INNER JOIN authors a
ON b."authorsID" = a."id"
where name like '%Pedro%';
-- traz todo o conteudo das 2 tabelas que o nome contenha Pedro

SELECT a.name, count(a.name) FROM "Authors" a
INNER JOIN "books" b
ON a."id" = b."AuthorsId"
where a.name = 'Cecília Meireles'
group by a.name;
-- conta quantas vezes o nome cecilia meireles aparece em Authors

select * from books where isbn is null;
--- traz todos os livros sem isbn

select * from books where isbn = null;
--- não traz nenhuma informação

```
***ATENÇÃO: particularidades do SQL, comparar qualquer coisa com nulo retorna nulo da comparação, para saber se algo é nulo usamos a comparação is null***


Existem outros tipos de selects que podem ser feitos, porém acredito que estes são os mais uteis.

### Inserts

os inserts são as intruções que populam as tabelas, existem algumas formas de se fazer inserts, porém a mais usual é a seguinte:

```SQL
INSERT INTO books
(name,isbn,creation_date)
values
('o homem que copiava','isbn do livro', NOW());
```
aqui ignoramos o valor do id de propósito, quando não passamos um valor para um campo ele automaticamente passa a receber o valor default dele, caso nenhum valor seja passado ele é considerado nulo.

### Updates

São os responsaveis por alterar o conteudo de uma tabela. cuidado com eles, updates sem *where* são extremamente perigosos, pois os mesmos podem acabar com toda sua tabela. é impossivel alterar os dados de mais de uma tabela ao mesmo tempo

```SQL
UPDATE books
SET name = 'José de Alencar'
where name = 'Jose de alencar';
--altera todas as linhas da tabela que o nome seja 'Jose de alencar' para 'José de Alencar'
```
### Deletes

Deletes apagam todas as linhas de uma coluna que aceitem determinada condição, assim como no update, um delete sem where significa que você vai apagar todas as linhas da tabela. é impossivel deletar dados de mais de uma tabela ao mesmo tempo.

```SQL
Delete from books
where name = 'Jose de alencar';
--apaga todas as linhas da tabela que o nome seja 'Jose de alencar'
```
