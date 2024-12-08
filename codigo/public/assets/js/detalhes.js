const apiKey = 'e180f9fcb9cda51170d90de17a0f37cf';
const jsonServerUrl = 'http://localhost:3000/avaliacoes';
const favoritosUrl = 'http://localhost:3000/favoritos';

async function carregarDetalhesFilme() {
    const params = new URLSearchParams(window.location.search);
    const filmeId = params.get('id');

    if (!filmeId) {
        console.error('ID do filme não encontrado na URL.');
        return;
    }

    const url = `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=pt-BR`;

    try {
        const response = await fetch(url);
        const filme = await response.json();
        const detalhesFilmeContainer = document.getElementById('detalhes-filme');
        const poster = filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

        detalhesFilmeContainer.innerHTML = `
            <div class="col-12 col-md-4">
                <img src="${poster}" alt="${filme.title}" class="img-fluid">
            </div>
            <div class="col-12 col-md-8 filme-info">
                <h1>${filme.title}</h1>
                <p><strong>Data de lançamento:</strong> ${filme.release_date || 'Não disponível'}</p>
                <p><strong>Nota:</strong> ${filme.vote_average || 'Não avaliado'} / 10</p>
                <p><strong>Sinopse:</strong> ${filme.overview || 'Descrição não disponível.'}</p>
                <div class="generos">
                    <strong>Gêneros:</strong>
                    ${filme.genres.map(genero => `<span>${genero.name}</span>`).join(' ')}
                </div>
                <!-- Adicionando o botão de coração -->
                <button id="favorito-btn" class="favorito-btn">
                    <span id="favorito-icon">♡</span> Favoritar
                </button>
            </div>
        `;

    
        adicionarAvaliacoes(filme.id);

    
        verificarFavorito(filme.id);

    
        const favoritoBtn = document.getElementById('favorito-btn');
        favoritoBtn.addEventListener('click', () => {
            favoritarDesfavoritar(filme.id);
        });

    } catch (error) {
        console.error('Erro ao carregar os detalhes do filme:', error);
    }
}

async function verificarFavorito(filmeId) {
    try {
        const response = await fetch(`${favoritosUrl}?filmeId=${filmeId}`);
        const favoritos = await response.json();
        const favoritoBtn = document.getElementById('favorito-btn');
        const favoritoIcon = document.getElementById('favorito-icon');

        if (favoritos.length > 0) {
        
            favoritoBtn.classList.add('favorito');
            favoritoIcon.textContent = '♥';
        } else {
        
            favoritoBtn.classList.remove('favorito');
            favoritoIcon.textContent = '♡';
        }
    } catch (error) {
        console.error('Erro ao verificar favorito:', error);
    }
}

async function favoritarDesfavoritar(filmeId) {
    const favoritoBtn = document.getElementById('favorito-btn');
    const favoritoIcon = document.getElementById('favorito-icon');

    try {
        const response = await fetch(`${favoritosUrl}?filmeId=${filmeId}`);
        const favoritos = await response.json();

        if (favoritos.length > 0) {
        
            await fetch(`${favoritosUrl}/${favoritos[0].id}`, {
                method: 'DELETE',
            });
            favoritoBtn.classList.remove('favorito');
            favoritoIcon.textContent = '♡';
        } else {
        
            await fetch(favoritosUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filmeId }),
            });
            favoritoBtn.classList.add('favorito');
            favoritoIcon.textContent = '♥';
        }
    } catch (error) {
        console.error('Erro ao favoritar/desfavoritar filme:', error);
    }
}

function adicionarAvaliacoes(filmeId) {
    const estrelasContainer = document.getElementById('avaliacao-estrelas');
    const feedback = document.getElementById('avaliacao-feedback');


    for (let i = 1; i <= 5; i++) {
        const estrela = document.createElement('span');
        estrela.textContent = '★';
        estrela.dataset.valor = i;

    
        estrela.addEventListener('mouseover', () => {
            destacarEstrelas(i);
        });

    
        estrela.addEventListener('click', async () => {
            try {
                await salvarAvaliacao(filmeId, i);
                feedback.textContent = `Você avaliou este filme com ${i} estrela(s).`;
                recuperarAvaliacao(filmeId);
            } catch (error) {
                feedback.textContent = 'Erro ao salvar sua avaliação. Tente novamente mais tarde.';
            }
        });

        estrelasContainer.appendChild(estrela);
    }


    estrelasContainer.addEventListener('mouseleave', () => {
        recuperarAvaliacao(filmeId);
    });


    recuperarAvaliacao(filmeId);
}

function destacarEstrelas(valor) {
    const estrelas = document.querySelectorAll('#avaliacao-estrelas span');
    estrelas.forEach((estrela) => {
        estrela.classList.toggle('avaliado', estrela.dataset.valor <= valor);
    });
}

function limparEstrelas() {
    const estrelas = document.querySelectorAll('#avaliacao-estrelas span');
    estrelas.forEach((estrela) => estrela.classList.remove('avaliado'));
}

async function recuperarAvaliacao(filmeId) {
    try {
        const response = await fetch(`${jsonServerUrl}?filmeId=${filmeId}`);
        const avaliacao = await response.json();

        if (avaliacao.length > 0) {
            const nota = avaliacao[0].nota;
        
            const estrelas = document.querySelectorAll('#avaliacao-estrelas span');
            estrelas.forEach((estrela) => {
                estrela.classList.toggle('avaliado', estrela.dataset.valor <= nota);
            });
        } else {
        
            limparEstrelas();
        }
    } catch (error) {
        console.error('Erro ao recuperar avaliação:', error);
    }
}

async function salvarAvaliacao(filmeId, nota) {

    const response = await fetch(`${jsonServerUrl}?filmeId=${filmeId}`);
    const dadosAvaliacao = await response.json();

    if (dadosAvaliacao.length > 0) {
    
        await fetch(`${jsonServerUrl}/${dadosAvaliacao[0].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filmeId, nota }),
        });
    } else {
    
        await fetch(jsonServerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filmeId, nota }),
        });
    }
}

document.addEventListener('DOMContentLoaded', carregarDetalhesFilme);
