var express = require('express'),
    app = express(),
    _ = require('underscore'),
    files = require('fs');



// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))

var db = {
  jogadores : JSON.parse(files.readFileSync('server/data/jogadores.json')).players,
  jogosPorJogador : JSON.parse(files.readFileSync('server/data/jogosPorJogador.json'))
};


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???');
app.set('view engine', 'hbs');
app.set('views', 'server/views');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.get('/', function(request, response) {
  response.render('index', {
    jogador : db.jogadores
  });
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
app.get('/jogador/:id/', function(request, response) {
  var id = request.params.id,
      player = _.find(db.jogadores, function(jogador){
          if(jogador.steamid == id)
            return true;
          else
            return false;
      });

  //ordenando de forma decrescente
  player.jogos = _.sortBy(db.jogosPorJogador[id].games, function(jogo) {
    return -jogo.playtime_forever;
  });

  player.jogos = _.each(player.jogos, function(jogo) {
    jogo.playtime_forever = Math.round(Number(jogo.playtime_forever)/60);
  });

  player.quantos = _.countBy(player.jogos, function(jogo) {
    if(jogo.playtime_forever == 0)
      return 'naoJogou';
    return 'simJogou';
  });

  player.quantos.total = Number(player.quantos.naoJogou + player.quantos.simJogou);
  console.log(player.quantos);
  response.render('jogador.hbs', {
    jogador : player,
    topjogos : _.first(player.jogos, 5),
    maisjogado : player.jogos[0]
  })
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código
app.listen(3000, function () {
  console.log('Escutando em: http://localhost:3000');
});
