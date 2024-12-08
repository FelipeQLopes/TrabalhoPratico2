const apiKey = 'e180f9fcb9cda51170d90de17a0f37cf';
const resultsContainer = document.getElementById('results-container');
const genreFilter = document.getElementById('genre-filter');
const typeFilter = document.getElementById('type-filter');
const ratingFilter = document.getElementById('rating-filter');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const applyFiltersBtn = document.getElementById('apply-filters');
const paginationContainer = document.getElementById('pagination-container');

let currentPage = 1; 
const resultsPerPage = 20; 
const totalPages = 1000; 


async function carregarGeneros() {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=pt-BR`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}


async function buscarConteudo(query = '', filters = {}, page = 1) {
    const { genre, type, rating } = filters;
    const baseUrl = query
        ? `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(query)}`
        : `https://api.themoviedb.org/3/discover/${type || 'movie'}?api_key=${apiKey}&language=pt-BR`;

    const url = `${baseUrl}&page=${page}&with_genres=${genre || ''}&vote_average.gte=${rating || ''}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results.length) {
            resultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
            return;
        }

        
        resultsContainer.innerHTML = '';
        data.results.forEach(item => {
            const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sem+Imagem';
            const title = item.title || item.name || 'Título não disponível';
            const type = item.media_type === 'movie' ? 'Filme' : 'Série';

            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
            card.innerHTML = `
                <a href="detalhes.html?id=${item.id}&type=${item.media_type || type}" class="card-link">
                    <div class="card">
                        <img src="${poster}" class="card-img-top" alt="${title}">
                        <div class="card-body">
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">${type}</p>
                        </div>
                    </div>
                </a>
            `;
            resultsContainer.appendChild(card);
        });

        
        renderizarPaginacao(data.page, data.total_pages);
    } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        resultsContainer.innerHTML = '<p>Erro ao carregar resultados.</p>';
    }
}


function renderizarPaginacao(currentPage, totalPages) {
    paginationContainer.innerHTML = '';

    if (currentPage > 1) {
        paginationContainer.innerHTML += `<button class="btn btn-primary" onclick="mudarPagina(${currentPage - 1})">Anterior</button>`;
    }

    if (currentPage < totalPages) {
        paginationContainer.innerHTML += `<button class="btn btn-primary ms-2" onclick="mudarPagina(${currentPage + 1})">Próxima</button>`;
    }
}


function mudarPagina(page) {
    currentPage = page;
    const genre = genreFilter.value;
    const type = typeFilter.value;
    const rating = ratingFilter.value;
    const query = searchInput.value.trim();

    buscarConteudo(query, { genre, type, rating }, currentPage);
}


searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        currentPage = 1; 
        buscarConteudo(query);
    }
});

applyFiltersBtn.addEventListener('click', () => {
    const genre = genreFilter.value;
    const type = typeFilter.value;
    const rating = ratingFilter.value;

    currentPage = 1; 
    buscarConteudo('', { genre, type, rating });
});


document.addEventListener('DOMContentLoaded', () => {
    carregarGeneros();
    buscarConteudo(); 
});
