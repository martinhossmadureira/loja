/**
 * @file main.js
 * @description Lógica principal da Epignósis Digital Book, responsável por carregar
 * dados, exibir livros, gerenciar filtros, pesquisa e interações básicas.
 */

let todosOsLivros = []; // Variável global para armazenar todos os livros carregados

// Função assíncna para carregar livros do arquivo JSON
async function carregarLivros() {
    try {
        const response = await fetch('./data/livros.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar livros: ${response.statusText}`);
        }
        const livros = await response.json();
        todosOsLivros = livros; // Armazena os livros carregados na variável global
        return livros;
    } catch (error) {
        console.error("Erro ao carregar os dados dos livros:", error);
        // Mensagem de erro para a página de destaques (index.html)
        const destaqueGrid = document.getElementById('livros-destaque-grid');
        if (destaqueGrid) {
            destaqueGrid.innerHTML = '<p class="text-center col-span-full text-red-600">Não foi possível carregar os livros em destaque. Por favor, tente novamente mais tarde.</p>';
        }
        // Mensagem de erro para a página de todos os livros (livros.html)
        const todosLivrosGrid = document.getElementById('todos-livros-grid');
        if (todosLivrosGrid) {
            todosLivrosGrid.innerHTML = '<p class="text-center col-span-full text-red-600">Não foi possível carregar a lista de livros. Por favor, tente novamente mais tarde.</p>';
        }
        return [];
    }
}

// Função para renderizar um único card de livro
function criarCardLivro(livro) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="${livro.imagem}" alt="Capa do livro ${livro.titulo}" class="w-full h-72 object-cover">
            <div class="p-6">
                <h3 class="font-merriweather text-xl font-semibold text-blue-900 mb-2">${livro.titulo}</h3>
                <p class="text-sm text-gray-600 mb-4">${livro.categoria}</p>
                <div class="flex flex-col space-y-3">
                    <a href="livro.html?slug=${livro.slug}" class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full text-center transition duration-300">
                        Ver Detalhes
                    </a>
                    ${livro.linkCompra ? `
                        <a href="${livro.linkCompra}" target="_blank" class="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-2 px-4 rounded-full text-center transition duration-300">
                            Comprar
                        </a>
                    ` : ''}
                    ${livro.linkAmostra ? `
                        <a href="${livro.linkAmostra}" target="_blank" class="border border-blue-700 text-blue-700 hover:bg-blue-100 font-bold py-2 px-4 rounded-full text-center transition duration-300">
                            Download Amostra
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// --- Funções para a Página Inicial (index.html) ---

function exibirLivrosEmDestaque(livros) {
    const destaqueGrid = document.getElementById('livros-destaque-grid');
    if (!destaqueGrid) return; // Sai se não estiver na página inicial

    destaqueGrid.innerHTML = '';
    const livrosDestaque = livros.filter(livro => livro.destaque);

    if (livrosDestaque.length === 0) {
        destaqueGrid.innerHTML = '<p class="text-center col-span-full text-gray-600">Nenhum livro em destaque no momento.</p>';
        return;
    }

    livrosDestaque.forEach(livro => {
        destaqueGrid.innerHTML += criarCardLivro(livro);
    });
}

// --- Funções para a Página "Todos os Livros" (livros.html) ---

// Função para exibir todos os livros (ou filtrados/pesquisados)
function exibirTodosOsLivros(livrosParaExibir) {
    const todosLivrosGrid = document.getElementById('todos-livros-grid');
    const noResultsMessage = document.getElementById('no-results-message');

    if (!todosLivrosGrid || !noResultsMessage) return; // Sai se não estiver na página de livros

    todosLivrosGrid.innerHTML = ''; // Limpa o grid antes de adicionar os livros

    if (livrosParaExibir.length === 0) {
        todosLivrosGrid.classList.add('hidden'); // Esconde o grid
        noResultsMessage.classList.remove('hidden'); // Mostra a mensagem de "nenhum resultado"
    } else {
        todosLivrosGrid.classList.remove('hidden'); // Mostra o grid
        noResultsMessage.classList.add('hidden'); // Esconde a mensagem
        livrosParaExibir.forEach(livro => {
            todosLivrosGrid.innerHTML += criarCardLivro(livro);
        });
    }
}

// Função para popular as opções dos filtros (Categorias e Tipos)
function popularFiltros() {
    const categoryFilter = document.getElementById('category-filter');
    const typeFilter = document.getElementById('type-filter');

    if (!categoryFilter || !typeFilter) return; // Sai se não estiver na página de livros

    const categorias = [...new Set(todosOsLivros.map(livro => livro.categoria))];
    const tipos = [...new Set(todosOsLivros.map(livro => livro.tipo))];

    // Popula Categorias
    categorias.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    // Popula Tipos
    tipos.sort().forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        typeFilter.appendChild(option);
    });
}

// Função para aplicar filtros e pesquisa
function aplicarFiltrosPesquisa() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const typeFilter = document.getElementById('type-filter');

    if (!searchInput || !categoryFilter || !typeFilter) return; // Sai se não estiver na página de livros

    const termoPesquisa = searchInput.value.toLowerCase().trim();
    const categoriaSelecionada = categoryFilter.value;
    const tipoSelecionado = typeFilter.value;

    let livrosFiltrados = todosOsLivros;

    // Aplica filtro por categoria
    if (categoriaSelecionada !== 'todos') {
        livrosFiltrados = livrosFiltrados.filter(livro => livro.categoria === categoriaSelecionada);
    }

    // Aplica filtro por tipo
    if (tipoSelecionado !== 'todos') {
        livrosFiltrados = livrosFiltrados.filter(livro => livro.tipo === tipoSelecionado);
    }

    // Aplica pesquisa por título
    if (termoPesquisa) {
        livrosFiltrados = livrosFiltrados.filter(livro =>
            livro.titulo.toLowerCase().includes(termoPesquisa)
        );
    }

    exibirTodosOsLivros(livrosFiltrados);
}

// Função para limpar todos os filtros
function limparFiltros() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const typeFilter = document.getElementById('type-filter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = 'todos';
    if (typeFilter) typeFilter.value = 'todos';

    aplicarFiltrosPesquisa(); // Reaplica os filtros para mostrar todos os livros
}


// --- Inicialização da Página ---

// Este trecho de código executa a lógica correta dependendo da página
document.addEventListener('DOMContentLoaded', async () => {
    await carregarLivros(); // Carrega os livros uma única vez

    // Lógica para a página inicial (index.html)
    if (document.getElementById('livros-destaque-grid')) {
        exibirLivrosEmDestaque(todosOsLivros);
    }

    // Lógica para a página de todos os livros (livros.html)
    if (document.getElementById('todos-livros-grid')) {
        popularFiltros(); // Popula os dropdowns de categoria e tipo
        exibirTodosOsLivros(todosOsLivros); // Exibe todos os livros inicialmente

        // Adiciona ouvintes de evento para os filtros e pesquisa
        document.getElementById('search-input')?.addEventListener('input', aplicarFiltrosPesquisa);
        document.getElementById('category-filter')?.addEventListener('change', aplicarFiltrosPesquisa);
        document.getElementById('type-filter')?.addEventListener('change', aplicarFiltrosPesquisa);
        document.getElementById('clear-filters-btn')?.addEventListener('click', limparFiltros);
    }
});
// --- Funções para a Página de Detalhes do Livro (livro.html) ---

function exibirDetalhesLivro(livros) {
    const livroDetalhesDiv = document.getElementById('livro-detalhes');
    const livroNaoEncontradoDiv = document.getElementById('livro-nao-encontrado');

    if (!livroDetalhesDiv || !livroNaoEncontradoDiv) return; // Sai se não estiver na página de detalhes

    // Limpa qualquer conteúdo inicial
    livroDetalhesDiv.innerHTML = '';
    livroNaoEncontradoDiv.classList.add('hidden'); // Garante que esteja oculto

    // Obtém o slug da URL
    const urlParams = new URLSearchParams(window.location.search);
    const slugDesejado = urlParams.get('slug');

    if (!slugDesejado) {
        livroDetalhesDiv.classList.add('hidden');
        livroNaoEncontradoDiv.classList.remove('hidden');
        document.title = "Livro Não Encontrado | Epignósis Digital Book";
        return;
    }

    const livro = livros.find(l => l.slug === slugDesejado);

    if (!livro) {
        livroDetalhesDiv.classList.add('hidden');
        livroNaoEncontradoDiv.classList.remove('hidden');
        document.title = "Livro Não Encontrado | Epignósis Digital Book";
        return;
    }

    // Preenche o conteúdo da página
    livroDetalhesDiv.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 items-start">
            <div class="md:w-1/3 flex-shrink-0">
                <img src="${livro.imagem}" alt="Capa do livro ${livro.titulo}" class="w-full h-auto rounded-lg shadow-xl">
            </div>
            <div class="md:w-2/3">
                <h1 class="text-4xl font-merriweather font-bold text-blue-900 mb-4">${livro.titulo}</h1>
                <p class="text-xl text-gray-700 mb-4"><strong>Autor:</strong> Martinho S. S. Madureira</p>
                <p class="text-md text-gray-600 mb-6"><strong>Categoria:</strong> ${livro.categoria} | <strong>Tipo:</strong> ${livro.tipo} | <strong>Publicação:</strong> ${new Date(livro.dataPublicacao).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <h2 class="text-2xl font-semibold text-blue-800 mb-3">Sinopse</h2>
                <p class="text-gray-800 leading-relaxed mb-8">${livro.descricao}</p>

                <div class="flex flex-col space-y-4">
                    ${livro.linkCompra ? `
                        <a href="${livro.linkCompra}" target="_blank" class="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center transition duration-300">
                            Comprar eBook
                        </a>
                    ` : ''}
                    ${livro.linkAmostra ? `
                        <a href="${livro.linkAmostra}" target="_blank" class="border border-blue-700 text-blue-700 hover:bg-blue-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg text-center transition duration-300">
                            Download Amostra Gratuita
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Atualiza o Título e Meta Descrição da página para SEO
    document.title = `${livro.titulo} | Epignósis Digital Book`;
    document.querySelector('meta[name="description"]').setAttribute('content', livro.descricao.substring(0, 150) + '...'); // Limita para meta description

    // Adiciona Schema.org para Book e Product
    const bookSchema = {
      "@context": "https://schema.org",
      "@type": ["Book", "Product"],
      "name": livro.titulo,
      "description": livro.descricao,
      "image": window.location.origin + livro.imagem, // Caminho completo da imagem
      "author": {
        "@type": "Person",
        "name": "Martinho S. S. Madureira"
      },
      "bookFormat": "https://schema.org/EBook",
      "datePublished": livro.dataPublicacao,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "AOA", // Assumindo moeda Angolana, ajuste se necessário
        "price": "0.00", // Preço pode ser dinâmico ou placeholder
        "availability": "https://schema.org/InStock",
        "url": livro.linkCompra || window.location.href // Link de compra ou URL da página
      }
    };
    // Se o livro for gratuito, ajusta o preço e a oferta para não ter link de compra
    if (livro.tipo === "eBook Grátis") {
        bookSchema.offers.price = "0.00";
        bookSchema.offers.url = livro.linkAmostra || window.location.href;
    } else {
        // Para livros pagos, você precisaria de um campo de preço no seu JSON
        // Por enquanto, usaremos um placeholder ou você pode adicionar um valor fixo.
        // Ex: bookSchema.offers.price = "9.99";
    }


    const schemaScript = document.getElementById('book-schema');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(bookSchema);
    }
}

// --- Atualização da Inicialização da Página no final do main.js ---

// Este trecho de código executa a lógica correta dependendo da página
document.addEventListener('DOMContentLoaded', async () => {
    await carregarLivros(); // Carrega os livros uma única vez

    // Lógica para a página inicial (index.html)
    if (document.getElementById('livros-destaque-grid')) {
        exibirLivrosEmDestaque(todosOsLivros);
    }

    // Lógica para a página de todos os livros (livros.html)
    if (document.getElementById('todos-livros-grid')) {
        popularFiltros(); // Popula os dropdowns de categoria e tipo
        exibirTodosOsLivros(todosOsLivros); // Exibe todos os livros inicialmente

        // Adiciona ouvintes de evento para os filtros e pesquisa
        document.getElementById('search-input')?.addEventListener('input', aplicarFiltrosPesquisa);
        document.getElementById('category-filter')?.addEventListener('change', aplicarFiltrosPesquisa);
        document.getElementById('type-filter')?.addEventListener('change', aplicarFiltrosPesquisa);
        document.getElementById('clear-filters-btn')?.addEventListener('click', limparFiltros);
    }

    // Lógica para a página de detalhes do livro (livro.html)
    if (document.getElementById('livro-detalhes')) {
        exibirDetalhesLivro(todosOsLivros);
    }
});

// Comentários explicativos para leigos:
// ... (mantenha os comentários existentes e adicione os novos para as funções de detalhes) ...

// 'exibirDetalhesLivro()': Esta é a nova função para 'livro.html'.
// 1. Ela primeiro olha na URL para ver qual livro foi clicado (usando o 'slug').
// 2. Procura esse livro na sua lista 'todosOsLivros'.
// 3. Se encontrar, monta o layout do livro com a capa, título, descrição e botões.
// 4. Se não encontrar, mostra uma mensagem de "Livro não encontrado".
// 5. O mais importante é que ela também atualiza o título da aba do navegador, a descrição para o Google,
//    e adiciona informações especiais (Schema.org) que ajudam o Google a entender que é um produto/livro.
//    (Nota: Para o Schema.org de preço, assumi AOA como moeda e um preço "0.00" por padrão,
//    você pode precisar adicionar um campo 'preco' no seu JSON para livros pagos.)

// A parte final do 'DOMContentLoaded' foi atualizada para verificar se você está
// na página 'livro.html' e, em caso afirmativo, chamar a função 'exibirDetalhesLivro()'.

// Comentários explicativos para leigos:
// 'todosOsLivros': Uma caixa onde guardamos a lista completa de livros uma vez que eles são carregados.

// 'carregarLivros()': Esta função agora é usada tanto para a página inicial quanto para a de livros.
// Ela busca os livros do arquivo 'livros.json' e os guarda na caixa 'todosOsLivros'.

// 'criarCardLivro()': É uma função auxiliar que cria o HTML para um único cartão de livro.
// Isso evita que a gente repita o mesmo código em vários lugares.

// 'exibirLivrosEmDestaque()': Continua fazendo a mesma coisa que antes, mas agora usa 'todosOsLivros'.

// 'exibirTodosOsLivros()': Esta é a nova função para a página 'livros.html'.
// Ela recebe uma lista de livros (que pode ser a lista completa ou uma lista filtrada/pesquisada)
// e os mostra na tela. Se não houver livros para mostrar, ela exibe uma mensagem.

// 'popularFiltros()': Percorre a lista de livros para encontrar todas as categorias e tipos únicos.
// Depois, ela adiciona essas categorias e tipos como opções nos menus suspensos (dropdowns) de filtro.

// 'aplicarFiltrosPesquisa()': É a função mais importante para a página de livros.
// Toda vez que você digita na pesquisa, ou muda um filtro, esta função é chamada.
// Ela pega o que foi digitado/selecionado, filtra a lista 'todosOsLivros' com base nisso,
// e então chama 'exibirTodosOsLivros()' para mostrar apenas os livros que correspondem.

// 'limparFiltros()': Zera a barra de pesquisa e redefine os filtros para "Todas as Categorias" e "Todos os Tipos".
// Depois, ela chama 'aplicarFiltrosPesquisa()' novamente para mostrar todos os livros sem filtro.

// No final, o 'DOMContentLoaded' agora verifica qual página está sendo carregada:
// Se for a página inicial, ele exibe os destaques.
// Se for a página de livros, ele popula os filtros, exibe todos os livros e configura os ouvintes
// para que, quando você interagir com a pesquisa ou os filtros, a função 'aplicarFiltrosPesquisa()' seja chamada.