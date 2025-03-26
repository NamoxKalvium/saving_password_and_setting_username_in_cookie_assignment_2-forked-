const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const resetButton = document.getElementById('reset');

let attempts = 0; // Track failed attempts

// Function to store in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Function to retrieve from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Function to generate a random 3-digit number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to clear local storage
function clearStorage() {
  localStorage.clear();
}

// Function to generate SHA256 hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Function to get or generate a SHA256 hash
async function getSHA256Hash() {
  let cachedNumber = retrieve('number');
  let cachedHash = retrieve('sha256');

  if (!cachedNumber || !cachedHash) {
    const number = getRandomNumber(MIN, MAX).toString();
    const hash = await sha256(number);
    store('number', number);
    store('sha256', hash);

    console.log(`✅ The correct 3-digit number is: ${number}`); // Show correct answer in console
    return hash;
  }

  console.log(`✅ The correct 3-digit number is: ${cachedNumber}`); // Show correct answer in console
  return cachedHash;
}

// Function to initialize the hash display
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Function to check user input
async function test() {
  const pin = pinInput.value.trim();

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Please enter a 3-digit number';
    resultView.classList.remove('hidden');
    return;
  }

  const storedHash = retrieve('sha256');
  const hashedPin = await sha256(pin);

  if (hashedPin === storedHash) {
    resultView.innerHTML = '🎉 Correct! You found the number!';
    resultView.classList.add('success');
  } else {
    attempts++;
    if (attempts >= 3) {
      const originalNumber = retrieve('number');
      resultView.innerHTML = `❌ Incorrect. Hint: The number starts with ${originalNumber[0]}`;
    } else {
      resultView.innerHTML = '❌ Incorrect. Try again!';
    }
  }
  resultView.classList.remove('hidden');
}

// Ensure input is only numbers and max 3 digits
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Function to reset the hash
async function resetGame() {
  clearStorage();
  attempts = 0;
  resultView.innerHTML = '';
  resultView.classList.add('hidden');
  main();
}

// Attach event listeners
document.getElementById('check').addEventListener('click', test);
resetButton.addEventListener('click', resetGame);

main();
