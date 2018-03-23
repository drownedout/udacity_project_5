/* globals ko, google, $ */
let map;


// SideNav Toggle - for responsive navigation

function sideMenuOpen(){
	$(document).ready(function() {
        $("#toggler").bind("click",function(){
        	// $(this).toggleClass("rotated");
        	$(".sidenav").toggleClass("menu-open");
        	return false;
        });
    });
	$("#toggle-off").bind("click",function(){
	  $(".sidenav").toggleClass("menu-open");
	  return false;
	});
	$(".list-group-item").bind("click",function(){
	  $(".sidenav").toggleClass("menu-open");
	  return false;
	});
}

// Inital locations to be populated on the map
const initialLocations = [
	{
		name: "Smithsonian National Zoological Park",
		geometry: {location: {lat: 38.931083, lng: -77.049731}},
		formatted_address: "3001 Connecticut Ave NW, Washington, DC 20008",
		icon: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"
	},
	{
		name: "The White House",
		geometry: {location: {lat: 38.8977, lng: -77.0365}},
		formatted_address: "1600 Pennsylvania Ave NW, Washington, DC 20500",
		icon: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"
	},
	{
		name: "United States Capitol",
		geometry: {location: {lat: 38.889819, lng: -77.009066}},
		formatted_address: "East Capitol St NE & First St SE, Washington, DC 20004",
		icon: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"
	},
	{
		name: "Lincoln Memorial",
		geometry: {location: {lat: 38.889306, lng: -77.050111}},
		formatted_address: "2 Lincoln Memorial Cir NW, Washington, DC 20037",
		icon: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"
	},
	{
		name: "Washington Monument",
		geometry: {location: {lat: 38.889469, lng: -77.035258}},
		formatted_address: "2 15th St NW, Washington, DC 20024",
		icon: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"
	}	
];

// Storing all data for Place into an object
const Place = function(data){
	this.name = ko.observable(data.name);
	this.location = ko.observable(data.geometry.location);
	this.lat = ko.observable(data.geometry.location.lat);
	this.lng = ko.observable(data.geometry.location.lng);
	this.formatted_address = ko.observable(data.formatted_address);
	this.icon = ko.observable(data.icon);
	this.marker = ko.observable(data.marker);
};

const ViewModel = function(){
	"use strict";

	const self = this;

	let markers = [];
	let infoWindow = new google.maps.InfoWindow();

	// Initialize arrays
	self.placesList = ko.observableArray();
	self.favoritePlaces = ko.observableArray();

	// Make Marker
	function makeMarkerIcon(markerColor) {
		let markerImage = new google.maps.MarkerImage(
		`http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${markerColor}
		|40|_|%E2%80%A2`,
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34));
		return markerImage;
    }

    // Default Marker Color
    let defaultIcon = makeMarkerIcon("00B4CC");

	// Show Markers
	self.showMarkers = function(){
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          markers[i].setVisible(true);
        }
	};

	// Hide Markers
	self.hideMarkers = function(){
		 for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
          markers[i].setVisible(false);
        }
	};

	// Marker Creation, list population
	self.createMarkers = function(places){
		// Hide Markers
		self.hideMarkers();
		markers = [];
		// Clears placesList
		self.placesList.removeAll();
		// Iterate through places and create markers for each
		for (let i = 0; i < places.length; i++){
			let place = places[i];
			let marker = new google.maps.Marker({
				title: place.name,
				position: place.geometry.location,
				animation: google.maps.Animation.DROP,
				icon: defaultIcon,
				id: i
			});
			// Add click listeners to generate info windows
			self.addWindowListener(marker, place);
			// Push markers to markers array
			markers.push(marker);
			// Adds marker to Place object
			place.marker = marker;
			self.placesList.push(new Place(place));
		}
		self.showMarkers();
		self.getStreetView(self.placesList()[0]);
	};

	// Wikipedia API
	self.getWikipedia = function(name, address){
		// Fires off Ajax request
		$.ajax({
			url: `https://en.wikipedia.org/w/api.php?action=opensearch&search=${name}&format=json`,
			dataType: "jsonp"
		}).done(function(res){
			// Concats content for info window - wikiSnippet and wikiLink utilize inline conditionals
			// to see if any data is available to be retrieved, else returns empty string
			let wikiSnippet = res[2][0] ? res[2][0] : "";
			let wikiLink = res[1][0] ? `<p class='info'><a href='https://en.wikipedia.org/wiki/${res[1][0]}'>Read More</></p>` : "";
			let infoWindowContent = `<p class='info wiki-title'>${name}</p>
									 <p class='info'>${address}</p>
									 <p class='info'>${wikiSnippet}</p>` +
									 wikiLink;
			infoWindow.setContent(infoWindowContent);
		}).fail(function(err){
			console.log(err);
		});
	};

	// Search Box
	self.searchTextBox = ko.observable("");

	// Places Service from Google Maps API
	const placesService = new google.maps.places.PlacesService(map);

	// Search Submit
	self.searchTextBoxSubmit = function(){
		// placesService(request, callback)
		placesService.textSearch({
			query: self.searchTextBox(),
			bounds: map.getBounds()
		}, function(places){
			if (places.length === 0){
				alert("No results found!");
			}
			self.createMarkers(places);
			map.setZoom(12);
		});
	};

	self.addWindowListener = function(marker, place){
		marker.addListener("click", function(){
			map.setCenter(this.position);
			map.setZoom(16);
			self.getWikipedia(place.name, place.formatted_address);
			infoWindow.open(map, this);
		});
	};

	// Open Window Method
	self.openInfoWindow = function(place){
		let marker = place.marker();
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1500);
		map.setCenter(place.location());
		map.setZoom(16);
		self.getWikipedia(place.name(), place.formatted_address());
		infoWindow.open(map, marker);
	};

	self.getStreetView = function(place){
		if(google.maps.StreetViewStatus.OK){
			new google.maps.StreetViewService();
			let radius = 50;
			let streetViewLocation = place.location();
			let streetViewOptions = {
				position: streetViewLocation,
				pov: {
					heading: 40,
					pitch: 0
				}
			};
			let streetViewPanorama = new google.maps.StreetViewPanorama(
				document.getElementById('street-view-image'), streetViewOptions
			);
		}
	};

	self.openSideBarInfo = function(place){
		self.openInfoWindow(place);
		self.getStreetView(place);
	};

	// Takes a place and adds it to the favoritePlaces array
	self.addToFavorites = function(place){
		// Checks to see if place already exists. If not, add to favorites
		let index = self.favoritePlaces.indexOf(place);
		if (index < 0){
			self.favoritePlaces.push(place);
		}
	};

	// Removes a place from the favoritePlaces arrays
	self.removeFavorite = function(place){
		let index = self.favoritePlaces.indexOf(place);
		// Checks to see if place alreay exists - if it does, remove from favorites
		if(index > -1){
			self.favoritePlaces.splice(index, 1);
		}
	};

	// Clears entire placesList
	self.clearResults = function(place){
		self.hideMarkers();
		self.placesList.removeAll();
	};

	// Clears entire favoritePlaces list
	self.clearFavorites = function(place){
		self.favoritePlaces.removeAll();
	};


	// Initialize app with default places
	self.createMarkers(initialLocations);

};

// Error Handling
function errorHandler(){
	alert("Something went wrong");
}


// Initialize map with styles, properties
function initMap(){
	let styles = [
	  {
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#ebe3cd"
	      }
	    ]
	  },
	  {
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#523735"
	      }
	    ]
	  },
	  {
	    "elementType": "labels.text.stroke",
	    "stylers": [
	      {
	        "color": "#f5f1e6"
	      }
	    ]
	  },
	  {
	    "featureType": "administrative",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      {
	        "color": "#c9b2a6"
	      }
	    ]
	  },
	  {
	    "featureType": "administrative.land_parcel",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      {
	        "color": "#dcd2be"
	      }
	    ]
	  },
	  {
	    "featureType": "administrative.land_parcel",
	    "elementType": "labels",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "administrative.land_parcel",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#ae9e90"
	      }
	    ]
	  },
	  {
	    "featureType": "landscape.natural",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#dfd2ae"
	      }
	    ]
	  },
	  {
	    "featureType": "poi",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#dfd2ae"
	      }
	    ]
	  },
	  {
	    "featureType": "poi",
	    "elementType": "labels.text",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "poi",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#93817c"
	      }
	    ]
	  },
	  {
	    "featureType": "poi.business",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "poi.park",
	    "elementType": "geometry.fill",
	    "stylers": [
	      {
	        "color": "#a5b076"
	      }
	    ]
	  },
	  {
	    "featureType": "poi.park",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#447530"
	      }
	    ]
	  },
	  {
	    "featureType": "road",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#f5f1e6"
	      }
	    ]
	  },
	  {
	    "featureType": "road",
	    "elementType": "labels.icon",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "road.arterial",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#fdfcf8"
	      }
	    ]
	  },
	  {
	    "featureType": "road.arterial",
	    "elementType": "labels",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "road.highway",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#f8c967"
	      }
	    ]
	  },
	  {
	    "featureType": "road.highway",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      {
	        "color": "#e92434"
	      }
	    ]
	  },
	  {
	    "featureType": "road.highway",
	    "elementType": "labels",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "road.highway.controlled_access",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#e98d58"
	      }
	    ]
	  },
	  {
	    "featureType": "road.highway.controlled_access",
	    "elementType": "geometry.stroke",
	    "stylers": [
	      {
	        "color": "#db8555"
	      }
	    ]
	  },
	  {
	    "featureType": "road.local",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "road.local",
	    "elementType": "labels",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "road.local",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#806b63"
	      }
	    ]
	  },
	  {
	    "featureType": "transit",
	    "stylers": [
	      {
	        "visibility": "off"
	      }
	    ]
	  },
	  {
	    "featureType": "transit.line",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#dfd2ae"
	      }
	    ]
	  },
	  {
	    "featureType": "transit.line",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#8f7d77"
	      }
	    ]
	  },
	  {
	    "featureType": "transit.line",
	    "elementType": "labels.text.stroke",
	    "stylers": [
	      {
	        "color": "#ebe3cd"
	      }
	    ]
	  },
	  {
	    "featureType": "transit.station",
	    "elementType": "geometry",
	    "stylers": [
	      {
	        "color": "#dfd2ae"
	      }
	    ]
	  },
	  {
	    "featureType": "water",
	    "elementType": "geometry.fill",
	    "stylers": [
	      {
	        "color": "#83d3c1"
	      }
	    ]
	  },
	  {
	    "featureType": "water",
	    "elementType": "labels.text.fill",
	    "stylers": [
	      {
	        "color": "#92998d"
	      }
	    ]
	  }
	];

	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 38.904722, lng: -77.016389},
		styles: styles,
		zoom: 12,
		mapTypeControl: false
	});
}

// Intialize App
var initApp = function() {
    initMap();
    ko.applyBindings(new ViewModel());
    sideMenuOpen();
};