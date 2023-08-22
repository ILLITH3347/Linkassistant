document.addEventListener('DOMContentLoaded', fetchConfigurations);

// Récupération des configurations depuis le serveur et mise à jour de l'UI
function fetchConfigurations() {
  fetch('https://linkassistant-091e1f34e752.herokuapp.com/get-config')
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('prompt').value = data.currentPrompt;
      document.getElementById('wordLimit').value = data.wordLimit;
      document.getElementById('api-key').value = maskAPIKey(data.apiKey);
    })
    .catch((error) => {
      console.error(error);
    });
}

document.getElementById('update-prompt').addEventListener('click', updatePrompt);
document.getElementById('reset-prompt').addEventListener('click', resetPrompt);
document.getElementById('save-api-key').addEventListener('click', saveAPIKey);
document.getElementById('update-word-limit').addEventListener('click', updateWordLimit);

function updatePrompt() {
  const newPrompt = document.getElementById('prompt').value;
  sendDataToServer('update-prompt', { prompt: newPrompt }, 'Prompt updated');
}

function resetPrompt() {
  sendDataToServer('reset-prompt', {}, 'Prompt reset to default');
}

function saveAPIKey() {
  const apiKey = document.getElementById('api-key').value;
  sendDataToServer('update-api-key', { key: apiKey }, 'API key updated');
}

function updateWordLimit() {
  const newLimit = parseInt(document.getElementById('wordLimit').value);
  if (isNaN(newLimit) || newLimit <= 0) {
    alert('Veuillez entrer une limite valide.');
    return;
  }
  sendDataToServer('update-word-limit', { limit: newLimit }, 'Word limit updated');
}

function sendDataToServer(endpoint, data, successMessage) {
  fetch(`https://linkassistant-091e1f34e752.herokuapp.com/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then((res) => res.text())
  .then((text) => {
    document.getElementById('status').textContent = successMessage;
    fetchConfigurations();
  })
  .catch((error) => {
    document.getElementById('status').textContent = `Error: ${error.message}`;
    console.error(error);
  });
}

function maskAPIKey(apiKey) {
  if (!apiKey) return '';
  return '*'.repeat(apiKey.length - 4) + apiKey.slice(-4);
}
