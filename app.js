let balance = 1000;
let portfolio = {};
let totalPL = 0;

function updateDashboard() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('pl').innerText = totalPL.toFixed(2);
}

function deposit() {
    const amount = parseFloat(document.getElementById('amount').value);
    if(amount > 0) {
        balance += amount;
        updateDashboard();
        alert(`Deposited $${amount}`);
    }
}

function withdraw() {
    const amount = parseFloat(document.getElementById('amount').value);
    if(amount > 0 && amount <= balance) {
        balance -= amount;
        updateDashboard();
        alert(`Withdrew $${amount}`);
    } else {
        alert('Insufficient balance!');
    }
}

async function fetchCryptoPrices() {
    const coins = ['bitcoin', 'ethereum', 'litecoin'];
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
    const data = await response.json();

    const container = document.getElementById('crypto-cards');
    container.innerHTML = '';

    coins.forEach(coin => {
        const price = data[coin].usd;
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.innerHTML = `
            <h3>${coin.charAt(0).toUpperCase() + coin.slice(1)}</h3>
            <p>Price: $${price}</p>
            <button class="buy-btn" onclick="buy('${coin}', ${price})">Buy</button>
            <button class="sell-btn" onclick="sell('${coin}', ${price})">Sell</button>
        `;
        container.appendChild(card);
    });
}

function buy(coin, price) {
    const amount = parseFloat(prompt(`Enter amount of ${coin} to buy:`));
    if(amount > 0 && amount * price <= balance) {
        balance -= amount * price;
        portfolio[coin] = (portfolio[coin] || 0) + amount;
        updateDashboard();
        alert(`Bought ${amount} ${coin}`);
    } else {
        alert('Insufficient balance or invalid amount');
    }
}

function sell(coin, price) {
    const amount = parseFloat(prompt(`Enter amount of ${coin} to sell:`));
    if(portfolio[coin] >= amount) {
        balance += amount * price;
        portfolio[coin] -= amount;
        totalPL += amount * price; // simplified P/L simulation
        updateDashboard();
        alert(`Sold ${amount} ${coin}`);
    } else {
        alert('Not enough coins to sell');
    }
}

// Refresh prices every 15 seconds
setInterval(fetchCryptoPrices, 15000);

// Initial load
fetchCryptoPrices();
updateDashboard();