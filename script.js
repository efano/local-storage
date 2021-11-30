'use strict';

class Card {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, vendor, foodIcon, seating, foodSelected) {
    this.coords = coords;
    this.vendor = vendor;
    this.foodIcon = foodIcon;
    this.seating = seating;
    this.foodSelected = foodSelected;
    this._setDescription();
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `A food ${this.vendor[0]}${this.vendor.slice(1)} was spotted serving ` + 
    "<span class='food'>" +
    `${this.foodSelected}` + "</span>" +
    ` on ${months[this.date.getMonth()]} ${this.date.getDate()}. ${this.seating === true ? 'Seating available.' : ''}`;
  }
};

const loader = document.querySelector('.loader');
const closeIcon = document.querySelector('.close-card-icon');
const tabInfo = document.querySelector('.tab-info');
const tabContentInfo = document.querySelector('.tab-content-info');
const tabForm = document.querySelector('.tab-form');
const tabContentForm = document.querySelector('.tab-content-form');
const tabList = document.querySelector('.tab-list');
const tabContentList = document.querySelector('.tab-content-list');
const containerCards = document.querySelector('.cards');
const listText = document.querySelector('.tab-content-text');
const form = document.querySelector('.form');
const inputVendorType = document.querySelector('.form__vendor--type');
const vendorError = document.querySelector('.vendor-error');
const inputFoodType = document.querySelector('.form__food--type');
const foodSelected = document.querySelector('.form__food--type option:checked');
const foodError = document.querySelector('.food-error');
const inputSeating = document.querySelector('.checkbox');
const legend = document.querySelector('.legend');

class App {
  #map;
  #mapZoomLevel = 16;
  #mapEvent;
  #cards = [];
  #markers = [];

  constructor() {
    // get user position
    this._getPosition();

    // get data from local storage
    this._getLocalStorage();

    // attach event handlers
    document.getElementById('form__btn').addEventListener('click', this._newLocation.bind(this));
    containerCards.addEventListener('click', this._moveToMarker.bind(this));
    closeIcon.addEventListener('click', this._removeItem.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('The application could not get your position. This is required.')
        }
      );
  }

  _loadMap(position) {
    const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    const {
      latitude
    } = position.coords;
    const {
      longitude
    } = position.coords;
    const coords = [latitude, longitude];
    const options = {
      center: coords,
      layers: basemap,
      zoomControl: false,
      zoom: this.#mapZoomLevel
    };

    loader.classList.remove('is-active');
    
    this.#map = L.map('map', options).locate({
      watch: true
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(this.#map);

    // geolocation marker
    L.circleMarker(coords, {
      interactive: false,
      className: 'pulse',
      radius: 2.5,
      weight: 0.5,
      color: '#323232',
      fillColor: '#F7B40A',
      fillOpacity: 1
    }).addTo(this.#map)

    this.#map.on('click', this._showForm.bind(this));

    this.#cards.forEach((cardLS) => {
      this._renderMapMarker(cardLS);
      legend.classList.remove('legend-disabled');
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    tabInfo.classList.remove('is-active');
    tabContentInfo.classList.remove('is-active');
    tabForm.classList.remove('tab-disabled');
    tabList.classList.remove('is-active');
    tabForm.classList.add('is-active');
    tabContentList.classList.remove('is-active');
    tabContentForm.classList.add('is-active');
    inputVendorType.focus();
  }

  _newLocation(e) {
    e.preventDefault();

    // get data from form
    const {lat,lng} = this.#mapEvent.latlng;
    const vendor = inputVendorType.value;
    const foodIcon = inputFoodType.value;
    const seating = inputSeating.checked;
    const selectedFood = (document.querySelector('.form__food--type option:checked').textContent);
    let card;

    if (vendor === '') {
      vendorError.classList.add('is-active');
      inputVendorType.focus();
      setTimeout(() => (vendorError.classList.remove('is-active')), 2500); 
    return false;
    };

    if (foodIcon === '') {
      foodError.classList.add('is-active');
      inputFoodType.focus();
      setTimeout(() => (foodError.classList.remove('is-active')), 2500); 
    return false;
    };

    // create new card object
    card = new Card({lat,lng}, vendor, foodIcon, seating, selectedFood);
    this.#cards.push(card);
    
    this._renderMapMarker(card);
    this._renderCard(card);

    this._setLocalStorage();

    legend.classList.remove('legend-disabled');
    tabForm.classList.remove('is-active');
    tabContentForm.classList.remove('is-active');
    tabList.classList.add('is-active');
    tabContentList.classList.add('is-active');
    tabForm.classList.add('tab-disabled');
    document.getElementById('form').reset();
  }

  _renderMapMarker(card) {

    let markerGroup =  L.layerGroup([]);

    const markerOptions = L.Icon.extend({
      options: {
        iconSize: [40, 40],
        iconAnchor: [20, 38],
        tooltipAnchor:  [15, -25],
       className: 'markers'
      }
    });

    const redMarker = new markerOptions ({
      iconUrl: 'img/marker-red.svg',
      className: `${card.id}`
    });
    const greenMarker = new markerOptions ({
      iconUrl: 'img/marker-green.svg',
      className: `${card.id}`
    });
    const blueMarker = new markerOptions ({
      iconUrl: 'img/marker-blue.svg',
      className: `${card.id}`
    });

    const markerType = card.vendor;
    const foodType = card.foodSelected;

    if (markerType === "truck") {
       L.marker(card.coords, {
        icon: blueMarker,
      })
        .addTo(markerGroup)
        .bindTooltip(
          L.tooltip({
            className: `${card.vendor}-tooltip`
          })
        )
        .setTooltipContent(foodType) 
    };

    if (markerType === "cart") {
      L.marker(card.coords, {
        icon: greenMarker,
      })
        .addTo(markerGroup)
        .bindTooltip(
          L.tooltip({
            className: `${card.vendor}-tooltip`
          })
        )
        .setTooltipContent(foodType);
    };

    if (markerType === "stand") {
      L.marker(card.coords, {
        icon: redMarker,
      })
        .addTo(markerGroup)
        .bindTooltip(
          L.tooltip({
            className: `${card.vendor}-tooltip`
          })
        )
        .setTooltipContent(foodType)
    };

    markerGroup.addTo(this.#map);
    this.#markers.push(markerGroup);

    this.#map.setView(card.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  };

  _renderCard(card) {
    let html = `
      <li class="card card-wide card-list card--${card.vendor}" data-id="${card.id}">
      <a href="#" class="icon-ui-close card-close" tabindex="0" role="button"></a>
        <p class="card-content">
          <span class="food__icon">${card.foodIcon}</span>
          <span class="card__description">${card.description}</span>
        </p> 
      </li>  
    `;
    listText.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(e) {
    if (!this.#map) return;

    const cardEl = e.target.closest('.card');
    const cardClose = e.target.closest('.card-close');

    if (cardClose) return e.preventDefault();
    if (!cardEl) return;

    const card = this.#cards.find(
      selectedCard => selectedCard.id === cardEl.dataset.id
    );

    this.#map.setView(card.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _removeItem(e) {
    if (!this.#map) return;

    const cardElement = e.target.closest('.card');
    const cardCloseIcon = e.target.closest('.card-close');
    
    if (!cardElement) return;
    if (!cardCloseIcon) return;

    this.#cards.find(selectedCard => 
      selectedCard.id === cardElement.dataset.id);

    const index = this.#cards.findIndex(selectedCard => 
      selectedCard.id === cardElement.dataset.id);

    this.#cards.splice(index, 1);

    const selectMarker = document.getElementsByClassName('leaflet-pane leaflet-marker-pane' && cardElement.dataset.id).item(0);
    //console.log("selectMarker: ", selectMarker);

    selectMarker.remove();
    cardElement.remove();
    
    this._setLocalStorage()
  }

  _setLocalStorage() {
    localStorage.setItem('cards', JSON.stringify(this.#cards));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('cards'));
  
    if (!data) return;

    this.#cards = data;

    const localStorageItem = this.#cards.forEach(cardLS => {
      this._renderCard(cardLS);
    });
  }

  reset() {
    localStorage.removeItem('cards');
    location.reload();
  }

};

const app = new App();