'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const tabInfo = document.querySelector('.tab-info');
const tabContentInfo = document.querySelector('.tab-content-info');
const tabForm = document.querySelector('.tab-form');
const tabContentForm = document.querySelector('.tab-content-form');
const tabList = document.querySelector('.tab-list');
const tabContentList = document.querySelector('.tab-content-list');
const form = document.querySelector('.form');
const containerStreetFood = document.querySelector('.streetFood');
const vendorType = document.querySelector('.form__vendor--type');
const foodType = document.querySelector('.form__food--type');
const seating = document.querySelector('.form__checkbox--seating');

let map, mapEvent;

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      });
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      const coords = [latitude, longitude];
      const options = {
        center: coords,
        layers: basemap,
        zoom: 16
      };
      map = L.map('map', options).locate({
        watch:true
      });

      L.circleMarker(coords, {
        interactive: false,
        className: 'pulse',
        radius: 3,
        weight: 2,
        color: '#F7B40A',
        fillColor: '#F7B40A',
        fillOpacity: 0.4
      }).addTo(map)

      map.on('click', function (mapE) {
        mapEvent = mapE;
        tabForm.classList.remove('tab-disabled');
        tabInfo.classList.remove('is-active');
        tabList.classList.remove('is-active');
        tabForm.classList.add('is-active');
        tabContentInfo.classList.remove('is-active');
        tabContentList.classList.remove('is-active');
        tabContentForm.classList.add('is-active');
        vendorType.focus();
      });

    },
    function() {
      alert('Could not get your position')
    }
  );

  document.getElementById('form__btn').addEventListener("click", function() {
    //e.preventDefault();
    document.getElementById('form').reset();

    const {lat, lng} = mapEvent.latlng;

        L.marker([lat,lng])
          .addTo(map)
          .bindTooltip(
            L.tooltip({
              className: 'stand-tooltip'
            })
          )
          .setTooltipContent('Vegetarian/Vegan Cuisine')
  });