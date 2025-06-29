const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let votos = {};
let opcoes = [];
let titulo = '';

wss.on('connection', ws => { // servidor recebe uma mensagem de um cliente
    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            if (data.tipo === 'criar') {
                // Admin cria a votação
                titulo = data.titulo;
                opcoes = data.opcoes;
                votos = {};
                opcoes.forEach(op => votos[op] = 0);
                enviarParaTodos();
            }

            if (data.tipo === 'voto') {
                const opcao = data.opcao;
                if (votos[opcao] !== undefined) {
                    votos[opcao] += 1;
                    enviarParaTodos(); //atualiza a votação em tempo real pra todos
                }
            }
        } catch (e) {
            console.log('Erro:', e);
        }
    });

    ws.send(JSON.stringify({
        tipo: 'init',
        titulo,
        opcoes,
        votos
    }));
});

//função envia dados da votação em tempo real
function enviarParaTodos() {
    const dados = JSON.stringify({
        tipo: 'update',
        titulo,
        opcoes,
        votos
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(dados);
        }
    });
}

//arquivos -> site
app.use(express.static(path.join(__dirname, 'public')));

// servidor
server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
