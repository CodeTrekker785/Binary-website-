let balance = 1000;
let portfolio = {};
let totalPL = 0;
let currentUser = null;

const priceHistory = { bitcoin: [], ethereum: [], litecoin: [] };
const maxPoints = 20;
let cryptoChart;

// Show pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display='none');
    document.getElementById(pageId).style.display='block';
}

// Login / Signup / Logout
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if(email && password){
        currentUser = { email, name: email.split('@')[0] };
        document.getElementById('profile-name').innerText = currentUser.name;
        document.getElementById('profile-email').innerText = currentUser.email;
        alert('Logged in!');
        showPage('dashboard');
    } else { alert('Please enter email and password'); }
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    if(name && email && password){
        currentUser = { name, email };
        document.getElementById('profile-name').innerText = name;
        document.getElementById('profile-email').innerText = email;
        alert('Account created!');
        showPage('dashboard');
    } else { alert('Please fill all fields'); }
}

function logout() {
    currentUser = null;
    balance = 1000; portfolio={}; totalPL=0;
    updateDashboard();
    showPage('login');
}

// Dashboard update
function updateDashboard() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    document.getElementById('pl').innerText = totalPL.toFixed(2);
}

// Copy wallet address
function copyWallet(){
    const wallet = document.getElementById('wallet-address').innerText;
    navigator.clipboard.writeText(wallet).then(()=>alert('Wallet address copied!'));
}

// Animate deposit / withdraw
function animateTransaction(amount, type){
    const anim = document.createElement('div');
    anim.className = `transaction ${type}`;
    anim.innerText = `${type==='deposit'?'+':'-'}$${amount.toFixed(2)}`;
    document.body.appendChild(anim);

    const walletDiv = document.querySelector('.wallet-info');
    const rect = walletDiv.getBoundingClientRect();
    anim.style.left = rect.left + rect.width/2 + 'px';
    anim.style.top = rect.top + 'px';

    anim.animate([{transform:'translateY(0)', opacity:1},{transform:'translateY(-100px)', opacity:0}],{duration:1500,easing:'ease-out'});
    setTimeout(()=>anim.remove(),1500);
}

// Deposit / Withdraw
function deposit(){
    const amount=parseFloat(document.getElementById('amount').value);
    if(amount>0){ balance+=amount; updateDashboard(); animateTransaction(amount,'deposit'); alert(`Deposited $${amount}`); }
}
function withdraw(){
    const amount=parseFloat(document.getElementById('amount').value);
    if(amount>0 && amount<=balance){ balance-=amount; updateDashboard(); animateTransaction(amount,'withdraw'); alert(`Withdrew $${amount}`);}
    else{ alert('Insufficient balance!'); }
}

// Initialize Chart
function initChart(){
    const ctx = document.getElementById('crypto-chart').getContext('2d');
    cryptoChart = new Chart(ctx,{ type:'line', data:{ labels:Array(maxPoints).fill(''), datasets:[
        { label:'Bitcoin', data:Array(maxPoints).fill(0), borderColor:'#f7931a', fill:false, tension:0.3 },
        { label:'Ethereum', data:Array(maxPoints).fill(0), borderColor:'#627eea', fill:false, tension:0.3 },
        { label:'Litecoin', data:Array(maxPoints).fill(0), borderColor:'#b8b8b8', fill:false, tension:0.3 }
    ]}, options:{ responsive:true, plugins:{ legend:{ position:'top' }}, scales:{ y:{ beginAtZero:false }}}});
}

// Update chart
function updateChart(data){
    ['bitcoin','ethereum','litecoin'].forEach((coin,i)=>{
        if(priceHistory[coin].length>=maxPoints) priceHistory[coin].shift();
        priceHistory[coin].push(data[coin].usd);
        cryptoChart.data.datasets[i].data = [...priceHistory[coin]];
    });
    cryptoChart.update();
}

// Fetch crypto prices
async function fetchCryptoPrices(){
    const coins=['bitcoin','ethereum','litecoin'];
    const response=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
    const data=await response.json();

    // Update live market cards
    const container=document.getElementById('crypto-cards');
    container.innerHTML='';
    coins.forEach(coin=>{
        const price=data[coin].usd;
        const card=document.createElement('div');
        card.className='crypto-card';
        const lastPrice=priceHistory[coin].slice(-1)[0]||price;
        const change=price-lastPrice;
        card.innerHTML=`
            <h3>${coin.charAt(0).toUpperCase()+coin.slice(1)}</h3>
            <p>Price: $${price} <span style="color:${change>=0?'#4caf50