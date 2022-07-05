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

  const request = event.target.elements.searchQuery.value.trim();
  getPixabayPicApi.currentSearchQuery = request;

  try {
    const { hits, totalHits } = await getPixabayPicApi.fetchImages();

    if (!request) {
      return Notify.info("Please type your request.");
    }

    if (totalHits > 0 && totalHits < getPixabayPicApi.per_page) {
      hideLoadMoreBtn();
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
      lightBox.refresh();
    }

    if (totalHits > 0 && totalHits > getPixabayPicApi.per_page) {
      showLoadMoreBtn();
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
      lightBox.refresh();
    }

    if (totalHits < 1) {
      hideLoadMoreBtn();
      Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    }

    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });

  } catch (error) {
    console.log(error.message);
  }
  event.target.reset();
}

async function onLoadMoreBtn() {
  try {
    const { hits, totalHits } = await getPixabayPicApi.fetchImages();

    if (hits.length < getPixabayPicApi.per_page) {
      hideLoadMoreBtn();
      Notify.warning("We're sorry, but you've reached the end of search results.");
      renderGallery(hits);
      lightBox.refresh();
    }

    if (totalHits > 0 && totalHits > getPixabayPicApi.per_page) {
      renderGallery(hits);
      lightBox.refresh();
    }

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