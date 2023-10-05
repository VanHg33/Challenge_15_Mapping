// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Console log the data retrieved 
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});


// Create function for createFeatures
function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the title, time, mag and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3>
    <hr><p>Date: ${new Date(feature.properties.time)}</p>
    <p>Magnitude: ${feature.properties.mag}</p>
    <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Function to determine marker color by depth
  function colorScheme(depth) {
    if (depth > 90) {
      return "#ea2c2c";
    }
    if (depth > 70) {
      return "#ea822c";
    }
    if (depth > 50) {
      return "#ee9c00";
    }
    if (depth > 30) {
      return "#eecc00";
    }
    if (depth > 10) {
      return "#d4ee00";
    }
    return "#98ee00";
  }
  
  // Function to determine marker size
  function markerSize(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 50000;
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    // poinToLayer is used to alter markers (in this case, marker will show the size and colour) 
    pointToLayer: function (feature, latlng) {
      // Determine the style of markers based on properties
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: colorScheme(feature.geometry.coordinates[2]),
        fillOpacity: 1,
        color: "#000000",
        stroke: true,
        weight: 0.5
      }
      return L.circle(latlng, markers);
    }
  });
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}


// Creating our initial map object:
function createMap(earthquakes) {

  // Build base map
  // Adding a tile layer (the background map image) to our map:
  // We use the addTo() method to add objects to our map.
  var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // We set the longitude, latitude, and starting zoom level.
  // This gets inserted into the div with an id of "map".
  var myMap = L.map("map", {
    center: [8, 78.96288],
    zoom: 3,
    layers: [basemap, earthquakes]
  });

  // Add legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [-10, 10, 30, 50, 70, 90];

    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);


}