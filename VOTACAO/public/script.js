const socket = new WebSocket(`ws://${window.location.host}`);

let opcoes = [];
let votou = false;

socket.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.tipo === 'init' || data.tipo === 'update') {
        atualizarTela(data.titulo, data.opcoes, data.votos);
    }
};

function atualizarTela(titulo, listaOpcoes, votos) {
    document.getElementById('titulo').innerText = titulo || 'Aguardando votação...';
    const divVotacao = document.getElementById('votacao');
    divVotacao.innerHTML = '';

    if (titulo) {
        opcoes = listaOpcoes;
        opcoes.forEach(op => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'voto';
            radio.value = op;
            label.appendChild(radio);
            label.append(` ${op}`);
            divVotacao.appendChild(label);
            divVotacao.appendChild(document.createElement('br'));
        });
        document.getElementById('btnVotar').disabled = votou;
    } else {
        document.getElementById('btnVotar').disabled = true;
    }

    const divResultados = document.getElementById('resultados');
    divResultados.innerHTML = '';

    if (votos) {
        for (const [opcao, qtde] of Object.entries(votos)) {
            const p = document.createElement('p');
            p.textContent = `${opcao}: ${qtde} voto(s)`;
            divResultados.appendChild(p);
        }
    }
}

function votar() {
    if (votou) return;

    const selecionado = document.querySelector('input[name="voto"]:checked');
    if (selecionado) {
        const dados = {
            tipo: 'voto',
            opcao: selecionado.value
        };
        socket.send(JSON.stringify(dados));
        votou = true;
        document.getElementById('btnVotar').disabled = true;
    } else {
        alert('Selecione uma opção para votar.');
    }
}
