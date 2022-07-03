import axios from 'axios';

export default class PictureApi {
  constructor() {
    this.APIKEY = '28415158-90f05cd520acc7bacb808566f';
    this.BASE_URL = 'https://pixabay.com/api/';
    this.page = 1;
    this.searchQuery = '';
  }

  async fetchImages() {
  const searchParams = new CurrentSearchParams({
    key: this.APIKEY,
    q: this.searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    sefasearch: 'true',
    per_page: 40,
    page: this.page,
  });

  const response = await axios.get(`${this.BASE_URL}${searchParams}`);

  this.nextPage();

  return response.data;
  };
  
  nextPage() {
    this.page += 1;
  }

  clearPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}