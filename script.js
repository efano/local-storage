'use strict';

class Card {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, vendor, food, seating) {
    this.coords = coords;
    this.vendor = vendor;
    this.food = food;
    this.seating = seating;
  }
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const tabInfo = document.querySelector('.tab-info');
const tabContentInfo = document.querySelector('.tab-content-info');
const tabForm = document.querySelector('.tab-form');
const tabContentForm = document.querySelector('.tab-content-form');
const tabList = document.querySelector('.tab-list');
const tabContentList = document.querySelector('.tab-content-list');
const form = document.querySelector('.form');
const containerStreetFood = document.querySelector('.streetFood');
const inputVendorType = document.querySelector('.form__vendor--type');
const vendorError = document.querySelector('.vendor-error');
const inputFoodType = document.querySelector('.form__food--type');
const inputSeating = document.querySelector('.checkbox');
const legend = document.querySelector('.legend');

class App {
  #map;
  #mapEvent;
  #cards = [];

  constructor() {
    this._getPosition();
    document.getElementById('form__btn').addEventListener('click', this._newLocation.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position')
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
      zoom: 16
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
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
      tabForm.classList.remove('tab-disabled');
      tabInfo.classList.remove('is-active');
      tabList.classList.remove('is-active');
      tabForm.classList.add('is-active');
      tabContentInfo.classList.remove('is-active');
      tabContentList.classList.remove('is-active');
      tabContentForm.classList.add('is-active');
      inputVendorType.focus();
  }

  _newLocation(e) {
    e.preventDefault();
    // document.getElementById('form').reset();
    legend.classList.remove('legend-disabled');

    // get data from form
    const vendor = inputVendorType.value;
    const food = inputFoodType.value;
    const seating = inputSeating.checked;
    const {lat,lng} = this.#mapEvent.latlng;
    let card;
    
    // create new card object
    card = new Card({lat,lng}, vendor, food, seating);
    this.#cards.push(card);
    console.log(card);
    
    // render marker on map
    this._renderMarker(card);

    // render workout on list

    // hide form and clear input fields
  }

  _renderMarker(card) {
    const redMarker = L.icon({
      iconUrl: 'img/marker-red.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      tooltipAnchor:  [15, -25]
    });

    const greenMarker = L.icon({
      iconUrl: 'img/marker-green.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      tooltipAnchor:  [15, -25]
    });

    const blueMarker = L.icon({
      iconUrl: 'img/marker-blue.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      tooltipAnchor:  [15, -25]
    });

    const markerType = card.vendor;
    const foodType = card.food;

    if (markerType === "food truck") {
      L.marker(card.coords, {
        icon: blueMarker,
        draggable: true,
      })
        .addTo(this.#map)
        .bindTooltip(
          L.tooltip({
            className: 'truck-tooltip'
          })
        )
        .setTooltipContent(foodType);
    };

    if (markerType === "food cart") {
      L.marker(card.coords, {
        icon: greenMarker,
        draggable: true,
      })
        .addTo(this.#map)
        .bindTooltip(
          L.tooltip({
            className: 'cart-tooltip'
          })
        )
        .setTooltipContent(foodType);
    };

    if (markerType === "food stand") {
      L.marker(card.coords, {
        icon: redMarker,
        draggable: true,
      })
        .addTo(this.#map)
        .bindTooltip(
          L.tooltip({
            className: 'stand-tooltip'
          })
        )
        .setTooltipContent(foodType);
    }
  };
}

const app = new App();