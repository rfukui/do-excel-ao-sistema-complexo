# Do Excel ao sistema complexo
Curso básico de criação de serviços em JS

Todo mundo em algum momento do desenvolvimento vai pegar algum sistema que ~FUNCIONA MUITO BEM NO EXCEL~ mas que precisa virar um sistema de verdade. Neste curso vamos usar este desafio para aprender um pouco de conceitos básicos de SQL, ORM, MVC e outros conceitos, quase sempre esquecidos, de desenvolvimento de software.

## O Problema

Temos a livraria ou sebo de um tio que está com um problema grande. Ele comecou o sistema dele rodando todo em um Google Sheets, e agora está com um volume de catálogo grande demais para continuar administrando assim.
Ele te passou o seguinte [sheet](https://docs.google.com/spreadsheets/d/1BtONL9b6yW7KYzuG8dT_Gks3R-9rVhHO9lUr7zOP-7o/edit#gid=0) como o que ele usa como sistema.
Como podem observar é um sistema bem básico. Nem deveríamos chamar muito de sistema, mas ele guarda as informações de forma inteligente.

##  Como trabalharemos

Vamos estruturar em 3 etapas:
* Converter esses dados para um banco de dados relacional (aqui usaremos Postgres), onde trabalharemos os conceitos de DML e DDL.
* Em um processo seguinte colocaremos o trabalho em uma API que retorna e inclui as informações diretamente, usando comandos de bancos de dados (DDL).
* Após essa etapa refatoraremos o código para usarmos o Sequelize, substituindo os selects, inserts e updates por comandos deste ORM.
