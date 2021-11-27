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

  constructor() {
    // get user position
    this._getPosition();

    // get data from local storage
    this._getLocalStorage();

    // attach event handlers
    document.getElementById('form__btn').addEventListener('click', this._newLocation.bind(this));
    containerCards.addEventListener('click', this._moveToMarker.bind(this));
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
    
    this.#map = L.map('map', options).locate({
      watch: true
    });

    new L.Control.Zoom({ position: 'topright' }).addTo(this.#map);

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

    this.#cards.forEach(cardLS => {
      this._renderMapMarker(cardLS);
      legend.classList.remove('legend-disabled');
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
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
    console.log(card);
    
    this._renderMapMarker(card);
    this._renderCard(card);

    // set local storage
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
    });
    const greenMarker = new markerOptions ({
      iconUrl: 'img/marker-green.svg',
    });
    const blueMarker = new markerOptions ({
      iconUrl: 'img/marker-blue.svg',
    });

    const markerType = card.vendor;
    const foodType = card.foodSelected;

    if (markerType === "truck") {
       L.marker(card.coords, {
        icon: blueMarker,
      })
        .addTo(this.#map)
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
        .addTo(this.#map)
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
        .addTo(this.#map)
        .bindTooltip(
          L.tooltip({
            className: `${card.vendor}-tooltip`
          })
        )
        .setTooltipContent(foodType)
    };

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

  _setLocalStorage() {
    localStorage.setItem('cards', JSON.stringify(this.#cards));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('cards'));
  
    if (!data) return;

    this.#cards = data;

    this.#cards.forEach(cardLS => {
      this._renderCard(cardLS);
    });
  }

  reset() {
    localStorage.removeItem('cards');
    location.reload();
  }

};

const app = new App();