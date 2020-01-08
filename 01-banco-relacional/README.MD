## Banco de Dados Relacionais

### O que são bancos de dados relacionais

"Um banco de dados relacional é um banco de dados que modela os dados de uma forma que eles sejam percebidos pelo usuário como tabelas, ou mais formalmente relações.
O termo é aplicado aos próprios dados, quando organizados dessa forma, ou a um Sistema Gerenciador de Banco de Dados Relacional (SGBDR) – do inglês Relational database management system (RDBMS) – um programa de computador que implementa a abstração."  [**Wikipédia**](https://pt.wikipedia.org/wiki/Banco_de_dados_relacional)

Mas o que significa tudo isso?

Um Banco de dados é o lugar onde normalmente se [persistem](https://pt.wikipedia.org/wiki/Persist%C3%AAncia_(ci%C3%AAncia_da_computa%C3%A7%C3%A3o)) os dados em sistemas computacionais, sendo assim podemos dizer que ele é nosso armazém de dados, o lugar onde vamos buscar as informações e gravamos informações de forma "padronizada" que seguem regras muito bem definidas para serem gravadas, alteradas e consultadas.

Para quem não conhece o sistema de tabelas, ele é muito similar ao que existem em planilhas, inclusive a abstração de tabelas para planilhas é bem comum, porém a forma de se fazer pesquisas e agrupamentos difere muito da forma como normalmente é feito em sistemas como o excel ou o sheets.

Neste curso não entraremos em detalhes de como são feitos **SGDBR**, Eu não recomendaria neste momento tentar entender muito bem como eles funcionam, apenas assumiremos que eles funcionam muito bem, mas para matar a curiosidade, aqui está o [codigo fonte](https://github.com/postgres/postgres) do postgres, o banco que utilizaremos de agora em diante no nosso curso. Ele é escrito em C bem avançado.

## Como instalar um banco de Dados

Neste curso usaremos uma maquina virtual Docker para fazer isso, para entender mais sobre docker, recomendo o Livro [Docker para desenvolvedores](https://github.com/gomex/docker-para-desenvolvedores) de Rafael Gomes([gomex](https://twitter.com/gomex)).

Crie um diretório em seu computador com o nome que achar melhor, eu recomendaria um nome mnemônico, como livraria, ou loja, eu vou usar store, porque costumo usar nomes em inglês para meus serviços, principalmente os de código aberto, já que eles ficam mais fáceis de serem lidos em qualquer parte do mundo que não seja lusófona, e dentro dele o arquivo `docker-compose.yml` que se encontra aqui no nosso curso.

```yml
version: '3.4'

services:
  db:
    image: postgres
    container_name: store_db
    ports:
      - "5432:5432"
    volumes:
      - database:/var/lib/postgresql/data

volumes:
  database:

```
Após instalar o docker e criar o arquivo execute o comando
```
$ docker-compose up
```
***ATENÇÃO: o $ significa que o comando está sendo executado como usuário normal e não root, quando algo for executado como root o # será o primeiro caracter***

Caso não esteja usando o linux, ou não se sentir confortável com a linha de comando existem uma série de programas para conectar a bancos de dados, caso não tenha problemas, instale o cliente de conexão de bancos diretamente pelo terminal.

```
# apt install postgresql-client
```

Em outro terminal rode
```
$ psql -h 127.0.0.1 -U postgres
```
Você se conectará ao banco de dados.


Após se conectar ao banco criaremos o nosso primeiro *database* com o comando

```SQL
CREATE DATABASE store;
```
***Mais um ponto de atenção, o comando deverá terminar com ;***

Para conferir se o database foi criado rode o comando:
```
\l
```
ele deverá retornar algo parecido com isso:
```
                                List of databases
  Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges   
----------+----------+----------+------------+------------+-----------------------
postgres  | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
store     | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
template0 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
          |          |          |            |            | postgres=CTc/postgres
template1 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
          |          |          |            |            | postgres=CTc/postgres
(4 rows)

```
Note que o *database* store foi criado.
******

Depois criaremos as tabelas de livros, autores e editoras fazendo suas ligações.


```SQL
\c store
CREATE TABLE publishers(
    id         SERIAL    PRIMARY KEY,
    name       CHAR(255) NOT NULL,
    adress     CHAR(255) NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE authors(
    id         SERIAL    PRIMARY KEY,
    name       CHAR(255) NOT NULL,
    is_live    BOOLEAN   NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE books(
    id            SERIAL       PRIMARY KEY,
    name          CHAR(255)    NOT NULL,
    buy_value     DECIMAL(10,2) NOT NULL,
    sell_value    DECIMAL(10,2) NOT NULL,
    author_id     INTEGER      NOT NULL,
    publisher_id  INTEGER      NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW());
```

Neste caso criamos as tabelas usando apenas as chaves primárias, mas uma das coisas mais importantes de um banco de dados relacional é exatamente que ele pode *relacionar* tabelas por uma ou mais tabelas com chaves estrangeiras, mas o que é isso, você pode estar se perguntando.

Chaves estrangeiras são o que conecta uma tabela com a outra.

Vamos tomar por base nosso exemplo. Nosso banco de dados poderia ter apenas uma unica tabela que chamasse dados e ser algo próximo disso:

```SQL
\c store
CREATE TABLE dados(
    id                SERIAL       PRIMARY KEY,
    book_name         CHAR(255)    NOT NULL,
    publisher_name    CHAR(255)    NOT NULL,
    publisher_adress  CHAR(255)    NULL,
    buy_value         DECIMAL(10,2) NOT NULL,
    sell_value        DECIMAL(10,2) NOT NULL,
    author_name       CHAR(255)    NOT NULL,
    author_is_live    BOOLEAN      NOT NULL,
    created_at        TIMESTAMP    DEFAULT NOW());
```
Digamos que por exemplo, a ediitora mudou de endereço, você teria que fazer um *update* na tabela com algo assim:

```SQL
UPDATE dados
SET publisher_adress = 'endereço novo'
WHERE publisher_name = 'nome da editora' /* caso eu tenha colocado o nome certo em todos os meus cadastros de livros*/
;
COMMIT;
```
Mas você agora se pergunta, ok, mas o que isso tem que ver com o problema de chaves estrangeiras?

Quando criamos um banco de dados existem algumas padronizações, conhecidas como formas normais, elas servem para evitarmos qualquer tipo de dado duplicado em tabelas, como por exemplo o endereço de uma pessoa ou dados compostos por outros dados.
Não precisamos gravar várias vezes o mesmo endereço de uma editora, se ele é unico. Da mesma forma que não precisamos gravar a idade de alguém se temos sua data de nascimento (o que neste caso é ainda pior, porque em um sistema com muitas pessoas a chance de você ter alguém mudando de idade todos os dias é bem grande, concorda?)
Neste nosso sitema utilizaremos a [quarta forma normal](https://pt.wikipedia.org/wiki/Normaliza%C3%A7%C3%A3o_de_dados).

Após entender o que são formas normais precisamos ligar os bancos, porque não é apenas criar os campos com nomes *bonitinhos* que eles passam a assumir os dados de outras tabelas, eles precisam estar ligados por chave primária e extrangeira.


```SQL
\c store
ALTER TABLE books
ADD CONSTRAINT authors_x_books FOREIGN KEY (author_id) REFERENCES authors (id);
ALTER TABLE books
ADD CONSTRAINT publishers_x_books FOREIGN KEY (publisher_id) REFERENCES publishers (id);
```
Neste momento a tabela de livros somente aceitará dados nos campos author_id e publisher_id que existirem nas tabelas mães.

### Inserindo dados nas tabelas existentes
Pode parecer um pouco estranho essa abordagem a princípio, mas você só pode criar um livro se ja existirem editoras e escritores cadastrados.
Mas como inserimos esses dados?
Usando o DML de INSERT.

```SQL
BEGIN TRANSACTION;
INSERT INTO authors
(name, is_live)
values
('Erich Von Däniken', FALSE);
INSERT INTO authors
(name, is_live)
values
('Ursula K Le Guin', FALSE);
COMMIT;
```
agora vamos consultar os dados que cadastramos com o DML SELECT;
```SQL
SELECT * FROM authors;
```
Você verá que eu errei o estado de vida do autor de eram os deuses astronautas, talvez porque eu preferia que ele estivesse morto e não a Ursula, mas voltando ao assunto, precisamos corrigir essa informação no banco de dados, e vamos fazer um update na tabela.

```SQL
BEGIN TRANSACTION;
UPDATE authors
SET is_live = TRUE
WHERE ID = 1;
COMMIT;
```
Talvez tenha notado que eu toda vez que vou fazer uma alteração em uma tabela eu comece com *BEGIN TRANSACTION* e finalizo com *COMMIT*, mas o motivo você talvez não entenda ainda, eu utilizo essa notação para que se acontecer qualquer erro durante o processo de alterar os dados das minhas tabelas, se acontecer qualquer erro os dados não são salvos, façam o teste a seguir:

```SQL
BEGIN TRANSACTION;
INSERT INTO authors
(name, is_live)
values
('Erich Von Däniken', FALSE);
INSERT INTO authors
(name, is_live)
values
('Ursula K Le Guin', FALSE);
select * from authors;
ROLLBACK;
select * from authors;
```
o ROLLBACK fez o que chamamos de voltar ao ponto de início da transação, isso é muito importante para quando trabalhamos com uma série de dados em sequência para serem salvos e não podemos nos dar ao luxo de salvar parcialmente os dados, ou todos são inseridos ou devemos voltar ao estado anterior.

Baseado nestes dados crie também as editoras e livros, esteja livre para inserir quantos livros quiser e quantas editora e autores quiser também :)
