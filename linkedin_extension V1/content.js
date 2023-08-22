console.log("LinkedIn Commenter extension is running!");

// ======================
// Section 1 : Commentaires LinkedIn
// ======================

function addButtonToCommentBox() {
  const targetElements = document.querySelectorAll('.comments-comment-box__form');

  targetElements.forEach((element) => {
      if (element.querySelector('.linkassistant-button')) return;

      const linkAssistantButton = document.createElement('button');
      linkAssistantButton.textContent = 'LinkAssistant';
      linkAssistantButton.className = 'linkassistant-button';
      linkAssistantButton.addEventListener('click', handleCommentButtonClick);

      const commentTextEditorDiv = element.querySelector('.comments-comment-box-comment__text-editor');
      commentTextEditorDiv.appendChild(linkAssistantButton);

      // Create regenerate emoji
      const regenerateEmoji = document.createElement('span');
      regenerateEmoji.textContent = '🔀';
      regenerateEmoji.className = 'regenerate-emoji';
      regenerateEmoji.style.display = 'none';
      regenerateEmoji.style.fontSize = '20px';
      regenerateEmoji.style.marginLeft = '10px';
      regenerateEmoji.addEventListener('click', handleCommentButtonClick);
      commentTextEditorDiv.appendChild(regenerateEmoji);
  });
}

function handleCommentButtonClick(event) {
  const postContentElement = event.target.closest('.feed-shared-update-v2').querySelector('.update-components-text');

  if (!postContentElement) {
      console.error("Failed to find post content element");
      return;
  }

  const postContent = postContentElement.textContent.trim();
  generateComment(postContent, event.target);
}

async function generateComment(postContent, buttonElement) {
  try {
      const response = await fetch('http://localhost:3000/analyze-text', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: postContent }),
      });

      if (!response.ok) {
          throw new Error("Server responded with an error.");
      }

      const data = await response.json();
      const comment = data.text;

      const commentBox = buttonElement.closest('.comments-comment-box__form').querySelector('.ql-editor');
      commentBox.innerHTML = comment;

      const commentForm = buttonElement.closest('.comments-comment-box__form');
      let clearButton = commentForm.querySelector('.clear-button');

      if (!clearButton) {
          clearButton = document.createElement('button');
          clearButton.textContent = 'Clear';
          clearButton.className = 'clear-button artdeco-button artdeco-button--1 artdeco-button--muted ml2';
          clearButton.style.display = 'none';
          clearButton.addEventListener('click', (event) => {
              event.preventDefault();
              commentBox.innerHTML = '';
              clearButton.style.display = 'none';
              regenerateEmoji.style.display = 'none';
          });
          commentForm.appendChild(clearButton);
      }

      const displayValue = comment ? 'inline-block' : 'none';
      clearButton.style.display = displayValue;

      const regenerateEmoji = commentForm.querySelector('.regenerate-emoji');
      regenerateEmoji.style.display = displayValue;

  } catch (error) {
      console.error('Failed to generate comment:', error);
  }
}

function checkForNewCommentBoxes() {
  addButtonToCommentBox();
  setTimeout(checkForNewCommentBoxes, 2000);
}

checkForNewCommentBoxes();


// ======================
// Section 2 : Invitation automatique sur la page Pro
// ======================

let loadAttempts = 0;  // Limit the number of loading attempts to avoid infinite loop
const MAX_LOAD_ATTEMPTS = 10;

async function selectPeople() {
  let creditsText = document.querySelector('.t-14.t-black--light').innerText;
  let creditsAvailable = parseInt(creditsText.split(' ')[0]);
  console.log("Available credits: ", creditsAvailable);

  let peopleSelected = 0;
  while (peopleSelected < creditsAvailable && loadAttempts < MAX_LOAD_ATTEMPTS) {
    let checkboxes = document.querySelectorAll('.invitee-picker-connections-result-item--can-invite input[type=checkbox]');
    console.log("Number of checkboxes found: ", checkboxes.length);

    for (let i = 0; i < checkboxes.length && peopleSelected < creditsAvailable; i++) {
      if (!checkboxes[i].classList.contains('auto-invite-selected')) {
        checkboxes[i].click();
        checkboxes[i].classList.add('auto-invite-selected');
        peopleSelected++;
      }
    }
    console.log("Selected people: ", peopleSelected);

    if (peopleSelected < creditsAvailable) {
      let scrollContainer = document.querySelector('.scaffold-finite-scroll__content');
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 2000));
      loadAttempts++;
    }
  }
}

function startExtension() {
  selectPeople();
}

let addButtonIntervalId = null;

function addButton() {
  let buttonContainer = document.querySelector('.flex-1.text-align-right');
  if (!buttonContainer) {
    console.log("Button container not found. Retrying in 1 second.");
    addButtonIntervalId = setTimeout(addButton, 1000);
    return;
  }

  clearInterval(addButtonIntervalId);

  let customButton = document.createElement('button');
  customButton.innerText = 'Selection Automatique';
  customButton.classList.add('artdeco-button', 'artdeco-button--2', 'artdeco-button--primary');
  customButton.style.backgroundColor = '#e6007E';
  buttonContainer.appendChild(customButton);
  console.log("Custom button added to the page");

  customButton.addEventListener('click', () => {
    startExtension();
    customButton.disabled = true;
  });
}

addButton();