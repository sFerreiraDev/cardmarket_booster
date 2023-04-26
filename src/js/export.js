CARD_XML_TEMPLATE = '<card number="%AMOUNT%" name="%NAME%">';
DECK_XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<cockatrice_deck version="1">
\t<deckname>"%DECK_NAME%"</deckname>
\t<comments></comments>
\t<zone="main">
%DECK_CARDS%
\t</zone>
\t<zone="side"></zone>
</cockatrice_deck>`;

MODAL_CONTAINER_STYLE = `
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  background-color: rgba(0,0,0,0.3);
  backdrop-filter: blur(5px);
`;

MODAL_STYLE = `
  position: sticky;
  top: calc(50vh - 240px / 2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  width: 280px;
  height: 240px;
  padding: 40px;
  padding-top: 20px;
  border-radius: 3.75px;
`;

FIX_BUTTONS_STYLE = `
  display: flex;
  justify-content: space-between;
  margin-left: 1rem;
`;

function createExportButton(click) {
  const buttonList = document.querySelector(
    'main.container div div.d-flex.align-items-center'
  );
  if (!buttonList) {
    return;
  }

  const button = document.createElement('a');
  button.classList.add('btn');
  button.classList.add('btn-outline-success');
  button.classList.add('ml-3');
  button.addEventListener('click', click);

  const icon = document.createElement('span');
  icon.classList.add('fonticon-download');
  icon.classList.add('mr-2');

  const span = document.createElement('span');
  span.innerHTML = 'Export Deck';

  button.appendChild(icon);
  button.appendChild(span);
  buttonList.appendChild(button);
}

function createButton(text, clickCallback = null) {
  const button = document.createElement('button');
  button.classList.add('btn');
  button.classList.add('btn-primary');
  button.innerText = text;

  if (clickCallback) {
    button.addEventListener('click', clickCallback);
  }

  return button;
}

function createCopyDeckButton() {
  const buttonList = document.querySelector(
    'main.container div div.d-flex.align-items-center'
  );
  if (!buttonList) {
    return;
  }

  const button = document.createElement('a');
  button.classList.add('btn');
  button.classList.add('btn-outline-success');
  button.classList.add('ml-3');

  const icon = document.createElement('span');
  icon.classList.add('fonticon-clipboard');

  button.addEventListener('click', () =>
    copyDeckToClipboard(() => {
      icon.classList.replace('fonticon-clipboard', 'fonticon-check-circle');

      setTimeout(() => {
        icon.classList.replace('fonticon-check-circle', 'fonticon-clipboard');
      }, 1000);
    })
  );

  button.appendChild(icon);
  buttonList.appendChild(button);
}

function copyDeckToClipboard(callback) {
  const data =
    getCardList()
      .map((item) => `${item.amount} ${item.name}`)
      .join('\n') || 'Invalid Data';
  navigator.clipboard
    .writeText(data)
    .then(callback)
    .catch(() => console.warn('could not copy deck to clipboard'));
}

function openModal() {
  const modalContainer = document.createElement('div');
  modalContainer.setAttribute('id', 'modal-container');
  modalContainer.style = MODAL_CONTAINER_STYLE;

  const modal = document.createElement('div');
  modal.style = MODAL_STYLE;

  const title = document.createElement('h4');
  title.innerText = 'Choose format';
  title.style = `
    color: #012169;
    font-weight: 700;
  `;

  const txtButton = createButton('Text (.txt)', exportTextFile);
  txtButton.style = 'width: 200px';

  const csvButton = createButton('Spreadsheet (.csv)', exportCsvFile);
  csvButton.style = 'width: 200px';

  const xmlButton = createButton('Cockatrice (.cod)', exportCockatriceFile);
  xmlButton.style = 'width: 200px';

  modal.appendChild(title);
  modal.appendChild(txtButton);
  modal.appendChild(csvButton);
  modal.appendChild(xmlButton);

  modalContainer.appendChild(modal);
  document.querySelector('body').appendChild(modalContainer);

  setTimeout(
    () =>
      modalContainer.addEventListener(
        'click',
        (event) => event.target === modalContainer && closeModal()
      ),
    0
  );
}

function closeModal() {
  document.getElementById('modal-container').remove();
}

function getCardList() {
  const list = document.querySelector('#WantsListTable table tbody');
  const data = Array.from(list.children).map((tr) => ({
    amount: tr.children[2].textContent.trim(),
    name: tr.children[3].textContent.trim(),
  }));

  return data;
}

const saveData = (function () {
  const a = document.createElement('a');
  return function (data, fileName) {
    const blob = new Blob([data], { type: 'octet/stream' }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    closeModal();
  };
})();

function exportTextFile() {
  const data =
    getCardList()
      .map((item) => `${item.amount} ${item.name}`)
      .join('\n') || 'Invalid Data';
  const fileName = `${getDeckName()}.txt`;
  saveData(data, fileName);
}

function exportCsvFile() {
  const data =
    getCardList()
      .map((item) => `${item.amount},${item.name}`)
      .join('\n') || 'Invalid Data';
  const fileName = `${getDeckName(document)}.csv`;
  saveData(data, fileName);
}

function exportCockatriceFile() {
  const data = getCardList() || [];
  const fileName = `${getDeckName(document)}.cod`;
  const tabIndent = '\t\t';

  const xmlCards = data
    .map(
      (card) =>
        tabIndent +
        CARD_XML_TEMPLATE.replace('%AMOUNT%', card.amount).replace(
          '%NAME%',
          card.name
        )
    )
    .join('\n');

  const deck = DECK_XML_TEMPLATE.replace(
    '%DECK_NAME%',
    getDeckName(document)
  ).replace('%DECK_CARDS%', xmlCards);

  saveData(deck, fileName);
}

function fixButtonsTemplate() {
  const buttonSellersWithMostCards = document.querySelector(
    'main.container [href="#SellersWithMostCards"]'
  );
  const buttonsRightContainer = buttonSellersWithMostCards.parentElement;
  buttonsRightContainer.style = FIX_BUTTONS_STYLE;
}

createExportButton(openModal);
createCopyDeckButton();
fixButtonsTemplate();
