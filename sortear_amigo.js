document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const friendNameInput = document.getElementById('friend-name');
    const discordUserInput = document.getElementById('discord-user');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendsList = document.getElementById('friends-list');
    const prizeButtonContainer = document.getElementById('prize-button-container');
    const showAddPrizeBtn = document.getElementById('show-add-prize-btn');
    const addPrizeSection = document.getElementById('add-prize-section');
    const prizeNameInput = document.getElementById('prize-name');
    const prizeIconInput = document.getElementById('prize-icon');
    const addPrizeBtn = document.getElementById('add-prize-btn');
    const prizesList = document.getElementById('prizes-list');
    const prizesListSection = document.getElementById('prizes-list-section');
    const startRaffleBtn = document.getElementById('start-raffle-btn');
    const raffleSection = document.getElementById('raffle-section');
    const roulette = document.getElementById('roulette');
    const winnerDisplay = document.getElementById('winner-display');
    const winnerName = document.getElementById('winner-name');
    const winnerDiscord = document.getElementById('winner-discord');
    const winnerPrizeName = document.getElementById('winner-prize-name');
    const winnerPrizeIcon = document.getElementById('winner-prize-icon');
    const newPrizeBtn = document.getElementById('new-prize-btn');
    const nextPrizeBtn = document.getElementById('next-prize-btn');
    const newRaffleBtn = document.getElementById('new-raffle-btn');
    const includeWinnersWrapper = document.getElementById('include-winners-wrapper');
    const includePreviousWinners = document.getElementById('include-previous-winners');

    // Dados da aplicação
    let friends = [];
    let prizes = [];
    let winners = [];
    let currentPrize = null;

    // Event listeners
    addFriendBtn.addEventListener('click', addFriend);
    showAddPrizeBtn.addEventListener('click', showAddPrize);
    addPrizeBtn.addEventListener('click', addPrize);
    startRaffleBtn.addEventListener('click', startRaffle);
    newPrizeBtn.addEventListener('click', setupNewPrize);
    document.getElementById('next-prize-btn').addEventListener('click', startNextPrizeRaffle);
    newRaffleBtn.addEventListener('click', setupNewRaffle);

    // Funções
    function addFriend() {
        const name = friendNameInput.value.trim();
        const discord = discordUserInput.value.trim();
        
        if (name === '' || discord === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const friend = { name, discord };
        friends.push(friend);
        
        renderFriendsList();
        
        friendNameInput.value = '';
        discordUserInput.value = '';
        friendNameInput.focus();
        
        if (friends.length >= 2 && prizes.length === 0) {
            prizeButtonContainer.style.display = 'block';
        }
    }

    function renderFriendsList() {
        friendsList.innerHTML = '';
        
        friends.forEach((friend, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${friend.name} - ${friend.discord}</span>
                <button class="remove-btn" data-index="${index}">Remover</button>
            `;
            friendsList.appendChild(li);
            
            // Adicionar evento para remover amigo
            li.querySelector('.remove-btn').addEventListener('click', function() {
                friends.splice(index, 1);
                renderFriendsList();
                
                if (friends.length < 2) {
                    prizeButtonContainer.style.display = 'none';
                    addPrizeSection.style.display = 'none';
                    prizesListSection.style.display = 'none';
                }
            });
        });
    }

    function showAddPrize() {
        addPrizeSection.style.display = 'block';
    }

    function addPrize() {
        const name = prizeNameInput.value.trim();
        const iconFile = prizeIconInput.files[0];
        
        if (name === '') {
            alert('Por favor, informe o nome do prêmio.');
            return;
        }
        
        if (!iconFile) {
            alert('Por favor, selecione um ícone para o prêmio.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const prize = { 
                name, 
                icon: e.target.result 
            };
            prizes.push(prize);
            
            renderPrizesList();
            
            prizeNameInput.value = '';
            prizeIconInput.value = '';
            
            prizesListSection.style.display = 'block';
        };
        reader.readAsDataURL(iconFile);
    }

    function renderPrizesList() {
        prizesList.innerHTML = '';
        
        prizes.forEach((prize, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${prize.icon}" alt="${prize.name}" class="prize-icon">
                <span>${prize.name}</span>
                <button class="remove-btn" data-index="${index}">Remover</button>
            `;
            prizesList.appendChild(li);
            
            // Adicionar evento para remover prêmio
            li.querySelector('.remove-btn').addEventListener('click', function() {
                prizes.splice(index, 1);
                renderPrizesList();
                
                if (prizes.length === 0) {
                    prizesListSection.style.display = 'none';
                }
            });
        });
    }

    function startRaffle() {
        if (friends.length < 2) {
            alert('É necessário adicionar pelo menos 2 amigos para iniciar o sorteio.');
            return;
        }
        
        if (prizes.length === 0) {
            alert('É necessário adicionar pelo menos um prêmio para iniciar o sorteio.');
            return;
        }
        
        // Escolher o primeiro prêmio (ou um aleatório)
        currentPrize = prizes.shift();
        renderPrizesList();
        
        // Esconder seções anteriores
        raffleSection.style.display = 'block';
        
        // Filtrar os participantes se necessário (excluir ganhadores anteriores)
        let eligibleFriends = [...friends];
        if (winners.length > 0 && !includePreviousWinners.checked) {
            eligibleFriends = friends.filter(friend => 
                !winners.some(winner => winner.name === friend.name && winner.discord === friend.discord)
            );
            
            if (eligibleFriends.length === 0) {
                alert('Não há participantes elegíveis para este sorteio. Todos já ganharam prêmios anteriormente.');
                return;
            }
        }
        
        // Criar itens da roleta
        roulette.innerHTML = '';
        const rouletteItems = [];
        
        // Duplicar os amigos para criar efeito visual de roleta
        for (let i = 0; i < 20; i++) {
            eligibleFriends.forEach(friend => {
                const item = document.createElement('div');
                item.className = 'roulette-item';
                item.textContent = `${friend.name} - ${friend.discord}`;
                roulette.appendChild(item);
                rouletteItems.push(item);
            });
        }
        
        // Escolher um amigo aleatório
        const winnerIndex = Math.floor(Math.random() * eligibleFriends.length);
        const winner = eligibleFriends[winnerIndex];
        
        // Adicionar à lista de ganhadores
        winners.push({
            name: winner.name,
            discord: winner.discord,
            prize: currentPrize
        });
        
        // Calcular posição final da roleta
        const totalItems = rouletteItems.length;
        const middlePosition = Math.floor(totalItems / 2);
        const scrollToIndex = totalItems - middlePosition - 1 - winnerIndex;
        
        // Iniciar animação
        setTimeout(() => {
            const itemHeight = rouletteItems[0].offsetHeight;
            roulette.style.transform = `translateY(-${scrollToIndex * itemHeight}px)`;
            
            // Mostrar o vencedor após a animação
            setTimeout(showWinner, 3000);
        }, 100);
    }

    function showWinner() {
        const winner = winners[winners.length - 1];
        
        winnerName.textContent = winner.name;
        winnerDiscord.textContent = winner.discord;
        winnerPrizeName.textContent = winner.prize.name;
        winnerPrizeIcon.src = winner.prize.icon;
        
        winnerDisplay.style.display = 'block';
        
        // Mostrar o botão de próximo prêmio apenas se houver mais prêmios
        if (prizes.length > 0) {
            nextPrizeBtn.style.display = 'block';
            includeWinnersWrapper.style.display = 'block';
        } else {
            nextPrizeBtn.style.display = 'none';
            includeWinnersWrapper.style.display = 'none';
        }
    }

    function setupNewPrize() {
        winnerDisplay.style.display = 'none';
        roulette.style.transform = 'translateY(0)';
        raffleSection.style.display = 'none';
        addPrizeSection.style.display = 'block';
    }
    
    function startNextPrizeRaffle() {
        // Esconder exibição do vencedor anterior
        winnerDisplay.style.display = 'none';
        
        // Resetar a posição da roleta
        roulette.style.transform = 'translateY(0)';
        roulette.innerHTML = '';
        
        // Iniciar um novo sorteio com o próximo prêmio
        startRaffle();
    }

    function setupNewRaffle() {
        // Resetar tudo
        friends = [];
        prizes = [];
        winners = [];
        currentPrize = null;
        
        // Resetar UI
        renderFriendsList();
        renderPrizesList();
        
        // Mostrar apenas a seção inicial
        raffleSection.style.display = 'none';
        prizesListSection.style.display = 'none';
        addPrizeSection.style.display = 'none';
        prizeButtonContainer.style.display = 'none';
        winnerDisplay.style.display = 'none';
        nextPrizeBtn.style.display = 'none';
        
        // Resetar a posição da roleta
        roulette.style.transform = 'translateY(0)';
        roulette.innerHTML = '';
        
        // Focar no primeiro campo
        friendNameInput.focus();
    }
});