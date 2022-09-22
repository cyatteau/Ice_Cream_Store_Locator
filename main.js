import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import * as locator from "@arcgis/core/rest/locator";
import Graphic from "@arcgis/core/Graphic";

esriConfig.apiKey =
  "YOUR_API_KEY";

const map = new Map({
  basemap: "arcgis-navigation",
});

const view = new MapView({
  container: "viewDiv",
  center: [-77.0365, 38.8977], // Longitude, latitude
  zoom: 13, // Zoom level
  map: map,
});

function clicked() {
  let long = document.getElementById("centerlong").value;
  let lat = document.getElementById("centerlat").value;
  view.center = [`${long}`, `${lat}`];
}

let btn = document.getElementById("btn");
btn.addEventListener("click", clicked);

const places = [
  "Select POI Type",
  "Ice Cream Shop"
];

const select = document.createElement("select", "");
select.setAttribute("class", "esri-widget esri-select");
select.setAttribute(
  "style",
  "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em"
);

places.forEach(function (p) {
  const option = document.createElement("option");
  option.value = p;
  option.innerHTML = p;
  select.appendChild(option);
});

view.ui.add(select, "top-right");

const locatorUrl =
  "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

// Find places and add them to the map
function findPlaces(category, pt) {
  locator
    .addressToLocations(locatorUrl, {
      location: pt,
      categories: [category],
      maxLocations: 25,
      outFields: ["Place_addr", "PlaceName"],
    })

    .then(function (results) {
      view.popup.close();
      view.graphics.removeAll();

      results.forEach(function (result) {
        view.graphics.add(
          new Graphic({
            attributes: result.attributes, // Data attributes returned
            geometry: result.location, // Point returned
            symbol: {
              type: "simple-marker",
              color: "#000000",
              size: "12px",
              outline: {
                color: "#ffffff",
                width: "2px",
              },
            },

            popupTemplate: {
              title: "{PlaceName}", // Data attribute names
              content: "{Place_addr}",
            },
          })
        );
      });
    });
}

// Search for places in center of map
view.watch("stationary", function (val) {
  if (val) {
    findPlaces(select.value, view.center);
  }
});

// Listen for category changes and find places
select.addEventListener("change", function (event) {
  findPlaces(event.target.value, view.center);
});
