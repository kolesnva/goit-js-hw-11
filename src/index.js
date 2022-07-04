import { GetPixabayPicApi } from './pictureApi';
import {Notify} from 'notiflix';
import simpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more'),
}

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreButton.addEventListener('click', onLoadMoreBtn);

let lightBox = new simpleLightbox('.gallery a', {
  captions: true,
  captionsselector: 'self',
  captionsType: 'attr',
  captionsAttribute: 'title',
  captionPosition: 'bottom',
  captionDelay: 300,
  showCounter: false,
});

const getPixabayPicApi = new GetPixabayPicApi();

function makeGallaryMarkup(searchedImages) {
  return searchedImages
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
        <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes: ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views: ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments: ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads: ${downloads}</b>
          </p></a>
          </div>
        </div>`
    )
    .join('');
}

function renderGallery(searchedImages) {
  refs.gallery.insertAdjacentHTML('beforeend', makeGallaryMarkup(searchedImages));
}

async function onFormSubmit(event) {
  event.preventDefault();
  clearGalleryMarkup();
  getPixabayPicApi.resetPage();

  if (!refs.loadMoreButton.classList.contains('is-hidden')) {
    hideLoadMoreBtn();
  }

 

  const request = event.target.elements.searchQuery.value.trim();

  if (!request) {
    return Notify.info("Please type your request.");
  }

  getPixabayPicApi.currentSearchQuery = request;

  try {
    const { hits, totalHits} = await getPixabayPicApi.fetchImages();

    if (!totalHits) {
      return Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    } 

    if (totalHits <= getPixabayPicApi.per_page) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
      lightBox.refresh();
      hideLoadMoreBtn();
    }

    else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
      lightBox.refresh();
      showLoadMoreBtn();
    }
  } catch (error) {
    console.log(error.message);
  }
  event.target.reset();
}

async function onLoadMoreBtn() {
  try {
    const { hits, totalHits } = await getPixabayPicApi.fetchImages();
    renderGallery(hits);
    lightBox.refresh();

    if (hits.length === 0 && totalHits !== 0) {
      hideLoadMoreBtn();
      Notify.warning(`We're sorry, but you've reached the end of search results.`);
      return; 
    }   

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    
  } catch (error) {
    console.log(error.message);
  }
}

function clearGalleryMarkup() {
  refs.gallery.innerHTML = '';
}

function hideLoadMoreBtn() {
  refs.loadMoreButton.classList.add('is-hidden');
}

function showLoadMoreBtn() {
  refs.loadMoreButton.classList.remove('is-hidden');
}