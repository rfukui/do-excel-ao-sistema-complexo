## Banco de Dados Relacionais

### O que são bancos de dados relacionais

"Um banco de dados relacional é um banco de dados que modela os dados de forma que eles sejam percebidos pelo usuário como tabelas, ou mais formalmente relações.
O termo é aplicado aos próprios dados, quando organizados dessa forma, ou a um Sistema Gerenciador de Banco de Dados Relacional (SGBDR) – do inglês Relational Database Management System (RDBMS) – um programa de computador que implementa a abstração." [**Wikipédia**](https://pt.wikipedia.org/wiki/Banco_de_dados_relacional)

Mas o que significa tudo isso?

Um Banco de Dados é o lugar onde normalmente se [persistem](https://pt.wikipedia.org/wiki/Persist%C3%AAncia_(ci%C3%AAncia_da_computa%C3%A7%C3%A3o)) os dados em sistemas computacionais. Sendo assim, podemos dizer que ele é nosso armazém de dados, o lugar onde vamos buscar as informações e as gravamos de forma "padronizada", seguindo regras muito bem definidas para gravação, alteração e consulta.

Para quem não conhece o sistema de tabelas, ele é muito similar ao que existem em planilhas; inclusive a abstração de tabelas para planilhas é bem comum. Porém, a forma de se fazer pesquisas e agrupamentos difere muito da forma como normalmente é feito em sistemas como o MS Excel ou o Google Sheets.

Neste curso não entraremos em detalhes sobre como são feitos os **SGDBR**. Eu não recomendaria, neste momento, tentar entender muito bem como eles funcionam; apenas assumiremos que eles funcionam muito bem. Mas, para matar a curiosidade, aqui está o [código fonte](https://github.com/postgres/postgres) do Postgres, o banco que utilizaremos de agora em diante no nosso curso. Ele é escrito em C bem avançado.

## Como instalar um Banco de Dados

Neste curso usaremos uma máquina virtual Docker para fazer a instalação. Para entender mais sobre Docker, recomendo o livro [Docker Para Desenvolvedores](https://github.com/gomex/docker-para-desenvolvedores) de Rafael Gomes ([gomex](https://twitter.com/gomex)).

Crie um diretório em seu computador com o nome que achar melhor. Eu recomendaria um nome mnemônico, como livraria, ou loja. Aqui vamos usar _store_, porque costumo usar nomes em inglês para meus serviços, principalmente os de código aberto, assim eles ficam mais fáceis de serem lidos em qualquer parte do mundo que não seja lusófona. Dentro dele, copie o arquivo `docker-compose.yml` que se encontra aqui no diretório do nosso curso.

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
Após instalar o Docker e copiar o arquivo no diretório do projeto, execute (no diretório raiz do projeto) o comando:
```
$ docker-compose up
```
***ATENÇÃO: o $ significa que o comando está sendo executado como usuário normal e não root, quando algo for executado como root o # será o primeiro caracter***

Caso não esteja usando o Linux, ou não se sentir confortável com a linha de comando, existe uma série de programas (como o [dbeaver](https://dbeaver.io/)) para conectar e trabalhar com bancos de dados. Caso não tenha problemas, instale o cliente de conexão ao banco Postgres diretamente pelo terminal.

```
# apt install postgresql-client
```

Em outro terminal, rode
```
$ psql -h 127.0.0.1 -U postgres
```
E você se conectará ao banco de dados.

Após se conectar ao banco criaremos o nosso primeiro *database* com o comando

```SQL
CREATE DATABASE store;
```
***Mais um ponto de atenção! O comando deverá terminar com ;***

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
Note que o *database* store foi criado (a base de dados do nosso projeto).
******

Depois criaremos as tabelas de livros, autores e editoras fazendo suas ligações. Se você quiser, pode rascunhar essas tabelas em um caderno, ou mesmo em uma planilha, para ter sempre à mão os nomes das tabelas que acabamos de criar e também quais colunas (nome, endereço, etc) constam em cada uma.


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
    is_alive    BOOLEAN   NOT NULL,
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

Neste caso, criamos as tabelas usando apenas as chaves primárias (uma chave/identificador único, indexado, que pode ou não ser uma representação de negócio), mas uma das coisas mais importantes de um banco de dados relacional é exatamente que ele pode *relacionar* tabelas a uma outra tabela ou mais, utilizando chaves estrangeiras (_foreign keys_). Mas o que é isso, você pode estar se perguntando?

Chaves estrangeiras são o que conecta uma tabela a outra.

Vamos tomar por base nosso exemplo. Nosso banco de dados poderia ter apenas uma única tabela que chamasse dados, e ser algo próximo disso:

```SQL
\c store
CREATE TABLE dados(
    id                 SERIAL        PRIMARY KEY,
    book_name          CHAR(255)     NOT NULL,
    publisher_name     CHAR(255)     NOT NULL,
    publisher_address  CHAR(255)     NULL,
    buy_value          DECIMAL(10,2) NOT NULL,
    sell_value         DECIMAL(10,2) NOT NULL,
    author_name        CHAR(255)     NOT NULL,
    author_is_alive    BOOLEAN       NOT NULL,
    created_at         TIMESTAMP     DEFAULT NOW());
```
Digamos que por exemplo, a editora mudou de endereço, então você teria que fazer um *update* na tabela com algo assim:

```SQL
UPDATE dados
SET publisher_address = 'endereço novo'
WHERE publisher_name = 'nome da editora' /* caso eu tenha colocado o nome certo em todos os meus cadastros de livros*/
;
COMMIT;
```
Aí você se pergunta: Ok, mas o que isso tem que ver com chaves estrangeiras?

Quando criamos um banco de dados existem algumas padronizações, conhecidas como formas normais. Elas servem para evitarmos qualquer tipo de dado duplicado em tabelas, como por exemplo o endereço de uma pessoa ou dados compostos por outros dados.
Não precisamos gravar várias vezes o mesmo endereço de uma editora, se ele é único. Da mesma forma que não precisamos gravar a idade de alguém se temos sua data de nascimento (o que neste caso é ainda pior, porque em um sistema grande, com muitas pessoas cadastradas, a chance de ter alguém mudando de idade todos os dias é bem grande, concorda?).
Neste nosso sitema utilizaremos a [quarta forma normal](https://pt.wikipedia.org/wiki/Normaliza%C3%A7%C3%A3o_de_dados).

Após entender o que são formas normais, precisamos ligar os bancos, porque não é apenas criar os campos com nomes *bonitinhos* que eles passam a assumir os dados de outras tabelas, eles precisam estar ligados por chave primária e estrangeira.


```SQL
\c store
ALTER TABLE books
ADD CONSTRAINT authors_x_books FOREIGN KEY (author_id) REFERENCES authors (id);
ALTER TABLE books
ADD CONSTRAINT publishers_x_books FOREIGN KEY (publisher_id) REFERENCES publishers (id);
```
Neste momento a tabela de livros somente aceitará dados nos campos author_id e publisher_id que existirem nas tabelas mães.

### Inserindo dados nas tabelas existentes
Pode parecer um pouco estranha essa abordagem a princípio, mas você só pode criar um livro se ja existirem editoras e escritores cadastrados.
Mas como inserimos esses dados?
Usando o DML (_Data Modeling Language_) de INSERT.

```SQL
BEGIN TRANSACTION;
INSERT INTO authors
(name, is_alive)
values
('Erich Von Däniken', TRUE);
INSERT INTO authors
(name, is_alive)
values
('Ursula K LeGuin', TRUE);
COMMIT;
```
Agora vamos consultar os dados que cadastramos com o DML SELECT;
```SQL
SELECT * FROM authors;
```
Você verá que eu errei o estado de vida da Ursula LeGuin, talvez porque eu goste muito dela e gostaria que ela estivesse viva. Mas, voltando ao assunto, precisamos corrigir essa informação no banco de dados, e vamos fazer isso com um _update_ na tabela.

```SQL
BEGIN TRANSACTION;
UPDATE authors
SET is_alive = FALSE
WHERE ID = 2;
COMMIT;
```
Talvez tenha notado que toda alteração em uma tabela comece com *BEGIN TRANSACTION* e finalize com *COMMIT*. Utilizamos essa notação para que, se acontecer qualquer erro durante o processo de alterar os dados das tabelas, os dados não são salvos. Façam o teste a seguir:

```SQL
BEGIN TRANSACTION;
INSERT INTO authors
(name, is_alive)
values
('Erich Von Däniken', TRUE);
INSERT INTO authors
(name, is_alive)
values
('Ursula K Le Guin', FALSE);
select * from authors;
ROLLBACK;
select * from authors;
```
o ROLLBACK fez o que chamamos de "voltar ao ponto de início da transação". Isso é muito importante para quando trabalhamos com uma série de dados em sequência para serem salvos e não podemos nos dar ao luxo de salvar parcialmente esses dados. Assim, ou todos são inseridos ou devemos voltar ao estado anterior.

Baseado nestes dados crie também as editoras e livros, esteja livre para inserir quantos livros quiser e quantas editoras e autores quiser também :)
