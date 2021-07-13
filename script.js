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
const foodError = document.querySelector('.food-error');
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
      tabList.classList.remove('is-active');
      tabForm.classList.add('is-active');
      tabContentList.classList.remove('is-active');
      tabContentForm.classList.add('is-active');
      vendorError.classList.remove('is-active');
      foodError.classList.remove('is-active');
      inputVendorType.focus();
  }

  _newLocation(e) {
    e.preventDefault();

    // get data from form
    const vendor = inputVendorType.value;
    const food = inputFoodType.value;
    const seating = inputSeating.checked;
    const {lat,lng} = this.#mapEvent.latlng;
    let card;

    if (
      vendor === ''
    ) 
      return vendorError.classList.add('is-active');

    if (
        food === ''
    ) 
      return foodError.classList.add('is-active');

    // create new card object
    card = new Card({lat,lng}, vendor, food, seating);
    this.#cards.push(card);
    console.log(card);
    
    this._renderMarker(card);
    //this._renderCard(card);

    legend.classList.remove('legend-disabled');
    tabForm.classList.remove('is-active');
    tabContentForm.classList.remove('is-active');
    tabList.classList.add('is-active');
    tabContentList.classList.add('is-active');
    tabForm.classList.add('tab-disabled');
    document.getElementById('form').reset();
  }

  _renderMarker(card) {

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
    const foodType = card.food;

    if (markerType === "food truck") {
      L.marker(card.coords, {
        icon: blueMarker,
        draggable: true
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
    };
  };

  // _renderCard(card) {
  //   let html = `
  //     <li class="workout workout--${workout.type}" data-id="${workout.id}">
  //       <h2 class="workout__title">${workout.description}</h2>
  //       <div class="workout__details">
  //         <span class="workout__icon">${
  //           workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
  //         }</span>
  //         <span class="workout__value">${workout.distance}</span>
  //         <span class="workout__unit">km</span>
  //       </div>
  //       <div class="workout__details">
  //         <span class="workout__icon">⏱</span>
  //         <span class="workout__value">${workout.duration}</span>
  //         <span class="workout__unit">min</span>
  //       </div>
  //   `;

  //   <p class="font-size--1 trailer-half">🍕 A food truck serving American cuisine was spotted on July 9</p>

  //   if (workout.type === 'cycling')
  //     html += `
  //       <div class="workout__details">
  //         <span class="workout__icon">⚡️</span>
  //         <span class="workout__value">${workout.speed.toFixed(1)}</span>
  //         <span class="workout__unit">km/h</span>
  //       </div>
  //       <div class="workout__details">
  //         <span class="workout__icon">⛰</span>
  //         <span class="workout__value">${workout.elevationGain}</span>
  //         <span class="workout__unit">m</span>
  //       </div>
  //     </li>
  //     `;

  // }
}

const app = new App();