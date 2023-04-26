// STORAGE
const STORAGE_PREFIX = 'cmbext_';

function getStorageKey(prefix, ...args) {
  return [prefix, ...args].join('');
}

function getData(key) {
  return JSON.parse(sessionStorage.getItem(key));
}

function setData(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

// CARDMARKET UTILS
function isWantCardListPage(url) {
  return /^https:\/\/www.cardmarket.com\/en\/Magic\/Wants\/\d+$/.test(url);
}

function isWantEditCardPage(url) {
  return /^https:\/\/www.cardmarket.com\/en\/Magic\/Wants\/\d+\/(\d|[a-zA-Z])+$/.test(
    url
  );
}

function getCardMarketMainContainer(document) {
  return document.querySelector('main.container');
}

function getAutoCompleteResultsElem(document) {
  return document.getElementById('AutoCompleteResult');
}

function getUserName(document) {
  return document.querySelector('#totalCreditMainNav').parentElement.children[0]
    .innerText;
}

// Other utils
// it will add at the end of url and keep the query parameters
function addToEndOfUrl(url, add) {
  const split = url.split('?');
  return `${split[0]}${add}?${split[1]}`;
}
