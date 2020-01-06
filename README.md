# do-excel-ao-sistema-complexo
curso básico de criacão de servicos em js

Todo mundo em algum momento do desenvolvimento vai pegar algum sistema que ~FUNCIONA MUITO BEM NO EXCEL~ mas que precisa virar um sistema de verdade. Neste curso vou usar este desafio para ensinar um pouco de conceitos básicos de SQL, ORM, MVC e outros conceitos básicos, porém quase sempre esquecidos, de desenvolvimento de software.

## O Problema

Temos a Livraria ou sebo de um tio que está com um problema grande, ele comecou o sistema dele rodando todo em um sheets do google, e ele está com um volume um pouco grande de vendas para continuar administrando assim.
Ele te passou o seguinte [sheet](https://docs.google.com/spreadsheets/d/1BtONL9b6yW7KYzuG8dT_Gks3R-9rVhHO9lUr7zOP-7o/edit#gid=0) como o que ele usa como sistema.
Como podem observar é um sistema bem básico. Nem deveriamos chamar muito de sistema, mas ele guarda umas informacoes de forma inteligente.

##  Como trabalharemos

Vamos estruturar em 3 etapas, converter esses dados para um banco de dados relacional (Aqui usaremos um postgress), onde trabalharemos os conceitos de DML e DDL.
Em um processo seguinte colocaremos o trabalho em uma API que retorna e inclui as informações diretamente com os comandos de bancos de dados (DDL).
Após essa etapa refatoraremos o código para usarmos o Sequelize, substituindo os selects, inserts e updates por comandos deste ORM.
