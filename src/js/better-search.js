function getDeckName(document) {
  return document
    .querySelector('main [typeof="BreadcrumbList"]')
    .children[2].querySelector('a').lastElementChild.innerText;
}

function getParent(elem, predicate) {
  if (!elem?.parentElement) return null;
  if (!predicate) return elem.parentElement;
  if (predicate(elem.parentElement)) return elem.parentElement;
  return getParent(elem.parentElement, predicate);
}

function setUrlInStorage(user, wantDeckName, url) {
  setData(getStorageKey(STORAGE_PREFIX, user, wantDeckName), {
    user,
    wantDeckName,
    url,
  });
}

function getUrlFromStorage(user, wantDeckName) {
  return getData(getStorageKey(STORAGE_PREFIX, user, wantDeckName))?.url;
}

function getHrefFromParentAnchor(elem) {
  let currentElement = elem;
  while (currentElement && !currentElement.href) {
    currentElement = currentElement.parentElement;
  }
  return currentElement?.href;
}

function getCardLinkOfRow(otherRowElem) {
  const row = getParent(otherRowElem, (e) => e.tagName === 'TR');
  return row.querySelector('.name').firstElementChild;
}

function addIframeEnLoadHandler(iframeElem) {
  // keep saving the new urls to storage
  iframeElem.onload = (e) => {
    setUrlInStorage(
      getUserName(document),
      getDeckName(document),
      e.target.contentWindow.location.href
    );
  };
}

function addIframeToPage(searchPreviewerElem, src) {
  if (searchPreviewerElem.lastChild?.tagName === 'IFRAME') {
    searchPreviewerElem.removeChild(searchPreviewerElem.lastChild);
  }
  searchPreviewerElem.innerHTML += `<iframe src="${src}"></iframe>`;
  const iframeElem = searchPreviewerElem.children[0];

  searchPreviewerElem.classList.remove('booster-hidden');
  const cardmarketMainContainer = getCardMarketMainContainer(document);
  cardmarketMainContainer.classList.add('booster-container');

  addIframeEnLoadHandler(iframeElem);

  setUrlInStorage(getUserName(document), getDeckName(document), src);
}

function addSearchPreviewerMainContainer(maybeSessionUrl) {
  const bodyElem = document.querySelector('body');
  const mainElem = getCardMarketMainContainer(document);

  const searchPreviewerElem = document.createElement('div');
  searchPreviewerElem.className = 'booster-search-previewer booster-hidden';

  bodyElem.insertBefore(searchPreviewerElem, mainElem);

  if (maybeSessionUrl) {
    addIframeToPage(searchPreviewerElem, maybeSessionUrl);
  }
  return searchPreviewerElem;
}

function overrideSearchListClickBehaviour(searchPreviewerElem) {
  const searchResults = getAutoCompleteResultsElem(document);

  searchResults.addEventListener('click', (event) => {
    event.preventDefault();
    const maybeSrc = getHrefFromParentAnchor(event.target);
    // in case search is empty (happens when card doesn't exist)
    if (!maybeSrc) return;
    addIframeToPage(searchPreviewerElem, maybeSrc);
  });
}

function overrideCardLinkClickBehaviour(searchPreviewerElem) {
  const cardsTableElem = document.querySelector('#WantsListTable tbody');

  cardsTableElem.addEventListener('click', (event) => {
    // check if
    const isCardEditClickFn = (elem) => {
      return (
        elem.classList.contains('fonticon-edit') ||
        elem.firstElementChild?.classList?.contains('fonticon-edit')
      );
    };
    const isCardNameClick = event.target.parentNode.classList.contains('name');
    const isCardEditClick = !isCardNameClick && isCardEditClickFn(event.target);

    if (!isCardNameClick && !isCardEditClick) return;
    if (!isCardEditClick) event.preventDefault();

    const cardLinkElem = isCardEditClick
      ? getCardLinkOfRow(event.target)
      : event.target;

    const maybeSrc = getHrefFromParentAnchor(cardLinkElem);
    // in case search is empty (happens when card doesn't exist)
    if (!maybeSrc) return;

    // check if the card has expansion selected
    const isExpansionSelected = maybeSrc.includes('Products/Singles');
    // if not redirect to card versions, so it's easier to choose expansion
    const src = isExpansionSelected
      ? maybeSrc
      : addToEndOfUrl(maybeSrc, `/Versions`);
    addIframeToPage(searchPreviewerElem, src);
  });
}

// MAIN
window.onload = function () {
  if (!isWantCardListPage(location.href) && !isWantEditCardPage(location.href))
    return;

  const userName = getUserName(document);
  const deckName = getDeckName(document);
  const maybeSessionUrl = getUrlFromStorage(userName, deckName);
  const searchPreviewerElem = addSearchPreviewerMainContainer(maybeSessionUrl);

  if (isWantCardListPage(location.href)) {
    overrideSearchListClickBehaviour(searchPreviewerElem);
    overrideCardLinkClickBehaviour(searchPreviewerElem);
  }
};
