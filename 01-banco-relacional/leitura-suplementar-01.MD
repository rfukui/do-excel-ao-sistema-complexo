## DDL E DML

### DDL
DDL vem do inglês _data definition language_, ou seja, linguagem de definição de dados. Elas são parte importante da manipulação de um SGDBR, sendo as mais perigosas inclusive, pois um comando destes "salva" o estado do banco de dados naquele momento, sendo "impossível" reverter os dados ainda não salvos para o estado anterior. Vamos entender melhor isso quando falarmos sobre sessões em bancos de dados.

#### Tipos de comandos
Os comandos DDL são classificados em quatro tipos, CREATE, DROP, ALTER e TRUNCATE, cada qual com seus subcomandos específicos.

Neste curso trabalharemos apenas com criação e alteração de banco de dados e tabelas. Mas elas podem existir para os mais variados tipos de *coisas* que um banco de dados pode ter. Caso queira se aprofundar mais neste assunto recomendo estudar bastante estrutura de dados e administração de servidores e bancos. É um material bem vasto e ainda hoje um dos empregos mais bem pagos da área de Tecnologia da Informação.

O Postgres usa um pseudotipo (um pseudotipo é neste caso um *alias* - um codinome, digamos assim - para um tipo mais complexo com uma série de regras) para criar valores auto-incrementáveis. ele é o SERIAL, aconselho ler este [material](https://www.postgresqltutorial.com/postgresql-serial/) para entender melhor.

Exemplo de criação de tabela:

```SQL
CREATE TABLE books (
    id                    SERIAL    PRIMARY KEY,
    name                  CHAR(255) NOT NULL,
    isbn                  CHAR(13)  NULL,
    creation_date         DATE      NULL
);
```
Para se apagar uma tabela ou um banco de dados usamos o comando DROP. Cuidado, uma vez que um banco de dados é *DROPADO* ele também apaga junto todas as tabelas criadas nele e as informações contidas nelas.

O TRUNCATE é um tipo muito especial de DDL, ele é parecido com um DELETE sem WHERE, porém por ser um DDL, ele é impossível de ser revertido em caso executado. **USEM COM SABEDORIA**

Utilizamos o ALTER para alterar propriedades das tabelas criadas, por exemplo, caso fossemos incluir uma nova coluna na nossa tabela de livros faríamos da seguinte forma:

```SQL
ALTER TABLE books
ADD COLUMN author CHAR(255);
```

## DML

DML vem do inglês _data manipulation language_, ou seja, linguagem de manipulação de dados. Serve, como o próprio nome diz, para manipular dados.
Os tipos de DML são, SELECT, INSERT, UPDATE e DELETE.

Existem algumas regras básicas para se trabalhar com SQL, que é a linguagem DML de banco de dados relacionais.

### Selects

Selects são a forma de se consultar alguma informação, podendo inclusive se usar várias tabelas para se fazer o mesmo.

Exemplo de selects:
```SQL
SELECT * FROM books;
-- traz todo o conteúdo da tabela.

SELECT * FROM books where name = 'Pedro';
-- traz todo o conteúdo da tabela onde o nome seja exatamente igual Pedro

SELECT * FROM books where name like 'Pedro%';
-- traz todo o conteudo da tabela onde o nome comece com Pedro

SELECT * FROM books where name like '%Pedro%';
-- traz todo o conteudo da tabela onde o nome contenha Pedro

SELECT * FROM books b
INNER JOIN authors a
ON b."authorsID" = a."id"
where a.name like '%Pedro%';
-- traz todo o conteudo das 2 tabelas que o nome contenha Pedro
-- a e b são apelidos para authors e books respectivamente


SELECT a.name, count(a.name) FROM "Authors" a
INNER JOIN "books" b
ON a."id" = b."AuthorsId"
where a.name = 'Cecília Meireles'
group by a.name;
-- conta quantas vezes o nome Cecília Meireles aparece em Authors

select * from books where isbn is null;
--- traz todos os livros sem isbn

select * from books where isbn = null;
--- não traz nenhuma informação

```
***ATENÇÃO: particularidades do SQL: comparar qualquer coisa com nulo retorna nulo da comparação. Para saber se algo é nulo usamos a comparação is null***

Existem outros tipos de selects que podem ser feitos, porém acredito que estes são os mais úteis.

### Inserts

os inserts são as intruções que populam as tabelas. Existem algumas formas de se fazer inserts, porém a mais usual é a seguinte:

```SQL
INSERT INTO books
(name,isbn,creation_date)
values
('o homem que copiava','isbn do livro', NOW());
```
Aqui ignoramos o valor do id de propósito, quando não passamos um valor para um campo ele automaticamente passa a receber o valor default dele, caso nenhum valor seja passado ele é considerado nulo.

### Updates

São os responsáveis por alterar o conteúdo de uma tabela. Cuidado com eles, updates sem *where* são extremamente perigosos, pois os mesmos podem acabar com toda sua tabela (se você não diz _WHERE_ - literalmente ONDE - você quer fazer o UPDATE, pode acabar trocando sem querer todas as informações de "nome" da tabela para "João"). É impossivel alterar os dados de mais de uma tabela ao mesmo tempo.

```SQL
UPDATE books
SET name = 'José de Alencar'
where name = 'Jose de alencar';
--altera todas as linhas da tabela onde o nome seja 'Jose de alencar' para 'José de Alencar'
```
### Deletes

Deletes apagam todas as linhas de uma coluna que aceitem determinada condição. Assim como no update, um delete sem where significa que você vai apagar todas as linhas da tabela. É impossivel deletar dados de mais de uma tabela ao mesmo tempo.

```SQL
Delete from books
where name = 'Jose de alencar';
--apaga todas as linhas da tabela que o nome seja 'Jose de alencar'
```

### Particularidades do SQL

Você provavelmente notou que misturamos aspas duplas `"` e aspas simples `'`, mas elas não são a mesma coisa. As aspas simples simbolizam strings e as aspas duplas são para identificação de elementos do banco, como banco de dados, tabelas, campos, sequences entre outros campos.

A regra para quando se precisa usar aspas duplas varia de banco para banco, mas no caso do Postgres sempre que um destes elementos tiver qualquer letra maiúscula deve se utilizar as aspas duplas. Nosso conselho: na dúvida se uma *query* deve ou não ser escrita com aspas duplas, utilize. Isso não vai invalidar seu SQL.
