import axios from 'axios';
const API_KEY = '28415158-90f05cd520acc7bacb808566f';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export class GetPixabayPicApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }
  
  async fetchImages() {
    const searchParams = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.page,
      per_page: 40,
    });

    const { data } = await axios.get(`?${searchParams}`);
    this.incrementPage();
    return data;
  }

  get currentSearchQuery() {
    return this.searchQuery;
  }

  set currentSearchQuery(newSearchQuery) {
    this.searchQuery = newSearchQuery;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}