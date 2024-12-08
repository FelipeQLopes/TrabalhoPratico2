const apiKey = 'e180f9fcb9cda51170d90de17a0f37cf';

async function carregarFilmesPopulares() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const carouselFilmes = document.getElementById('carousel-filmes');

        carouselFilmes.innerHTML = '';

        data.results.forEach((filme, index) => {
            const activeClass = index === 0 ? 'active' : '';
            const poster = filme.poster_path
                ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

            carouselFilmes.innerHTML += `
                <div class="carousel-item ${activeClass}">
                    <a href="detalhes.html?id=${filme.id}" class="card-link">
                        <img src="${poster}" class="d-block w-100" alt="${filme.title}">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>${filme.title}</h5>
                            <p>${filme.overview || 'Descrição não disponível.'}</p>
                        </div>
                    </a>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar filmes populares:', error);
    }
}

async function carregarFilmesNovos() {
    const filmesNovosContainer = document.getElementById('filmes-novos');
    const generosUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`;
    const filmesUrl = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=pt-BR&page=1`;

    try {
        
        const generosResponse = await fetch(generosUrl);
        const generosData = await generosResponse.json();
        const generos = generosData.genres.reduce((map, genero) => {
            map[genero.id] = genero.name;
            return map;
        }, {});

        
        const filmesResponse = await fetch(filmesUrl);
        const filmesData = await filmesResponse.json();

        filmesNovosContainer.innerHTML = '';

        filmesData.results.forEach((filme) => {
            const poster = filme.poster_path
                ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sem+Imagem';
            const generoFilme = filme.genre_ids.map((id) => generos[id]).join(', ') || 'Sem gênero';

            filmesNovosContainer.innerHTML += `
                <div class="col-12 col-sm-6 col-md-3 mb-4">
                    <a href="detalhes.html?id=${filme.id}" class="card-link">
                        <div class="card">
                            <img src="${poster}" class="card-img-top" alt="${filme.title}">
                            <div class="card-body">
                                <h5 class="card-title">${filme.title}</h5>
                                <p class="card-text">${generoFilme}</p>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar filmes novos:', error);
    }
}

async function carregarFavoritos() {
    const favoritosLista = document.getElementById('favoritos-lista');
    favoritosLista.innerHTML = ''; 

    try {
        
        const response = await fetch(favoritosUrl);
        const favoritos = await response.json();

        if (favoritos.length === 0) {
            favoritosLista.innerHTML = '<p>Você ainda não adicionou nenhum filme ou série aos favoritos.</p>';
            return;
        }

        
        for (const favorito of favoritos) {
            const url = `https://api.themoviedb.org/3/movie/${favorito.filmeId}?api_key=${apiKey}&language=pt-BR`;

            try {
                const filmeResponse = await fetch(url);
                const filme = await filmeResponse.json();

                const poster = filme.poster_path
                    ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
                    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

                const card = document.createElement('div');
                card.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
                card.innerHTML = `
                    <a href="detalhes.html?id=${filme.id}" class="card-link">
                        <div class="card">
                            <img src="${poster}" class="card-img-top" alt="${filme.title}">
                            <div class="card-body">
                                <h5 class="card-title">${filme.title}</h5>
                            </div>
                        </div>
                    </a>
                `;
                favoritosLista.appendChild(card);
            } catch (error) {
                console.error('Erro ao carregar detalhes do filme favorito:', error);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        favoritosLista.innerHTML = '<p>Não foi possível carregar os favoritos.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    
    const seriesFavoritas = ['Breaking Bad', 'Stranger Things', 'Game of Thrones'];

    
    const favoritasSeriesElement = document.getElementById('favoritas-series');
    
    if (seriesFavoritas.length > 0) {
        favoritasSeriesElement.textContent = seriesFavoritas.join(', ');
    } else {
        favoritasSeriesElement.textContent = 'Nenhuma série favorita definida.';
    }
});

const favoritosUrl = 'http://localhost:3000/favoritos'; 
const favoritasSeriesElement = document.getElementById('favoritas-series'); 


async function carregarFavoritas() {
    try {
        
        const response = await fetch(favoritosUrl);
        const data = await response.json();

        if (data && data.length > 0) {
            
            const filmes = await Promise.all(data.map(async (favorito) => {
                const filmeResponse = await fetch(`https://api.themoviedb.org/3/movie/${favorito.filmeId}?api_key=${apiKey}&language=pt-BR`);
                const filme = await filmeResponse.json();
                return filme.title; 
            }));

            
            if (filmes.length > 0) {
                favoritasSeriesElement.textContent = filmes.join(', ');
            } else {
                favoritasSeriesElement.textContent = 'Nenhum filme favorito encontrado.';
            }
        } else {
            favoritasSeriesElement.textContent = 'Nenhum filme favorito encontrado.';
        }
    } catch (error) {
        console.error('Erro ao carregar filmes favoritos:', error);
        favoritasSeriesElement.textContent = 'Erro ao carregar filmes favoritos.';
    }
}



document.addEventListener('DOMContentLoaded', () => {
    carregarFilmesPopulares();
    carregarFilmesNovos();
    carregarFavoritas();
    carregarFavoritos(); 
});
