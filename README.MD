# 🌊 Surf Forecast API

Esta é um API que provê dados meteorológicos para as melhores condições de Surf. Por meio de um front-end o usuário pode se autenticar na API e cadastrar as suas praias favoritas, as quais esta API ira requisitar os dados meteorológicos a uma API externa e fazer todo o tratamanto dos dados e devolve ao usuário a pontuação das melhores praias com as melhores ondas nas próximas 24 horas. Sim, essa API é uma Previsão do Tempo para surfar. Consulte a documentaçao da API no próprio link oficial:

## <a href="https://brunohubner-surf-forecast.herokuapp.com/docs" target="_blank">📚 Documentação oficial</a>

#
### As tecnologias utilizadas na criação desta API foram:

- Node.JS
- TypeScript
- Jest
- MongoDB
- Github Actions
- Heroku
#
Para executar a API localmente em sua maquina execute os seguintes comandos:

- Para instalar as dependências:
````
$ yarn install
````

- Para rodar em modo desenvolvedor:
````
$ yarn dev
````

- Para rodar em modo producão:
````
$ yarn start:local
````

- Para rodar todos testes:
````
$ yarn test 
````

Por padrão a app vai ouvir na porta 3333.