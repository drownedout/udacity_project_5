'use strict';

// Global Vars
let map;
let infoWindow;

const initialPlaces = [
	
];

// Storing all data into an object
const Place = function(data){
	this.name = ko.observable(data.name);
	this.location = ko.observable(data.geometry.location);
	this.lat = ko.observable(data.geometry.location.lat);
	this.lng = ko.observable(data.geometry.location.lng);
	this.formatted_address = ko.observable(data.formatted_address);
	this.icon = ko.observable(data.icon);
	this.marker = ko.observable(data.marker);
}

const ViewModel = function(){

	const self = this;

	let markers = [];
	let infoWindow = new google.maps.InfoWindow();

	self.placesList = ko.observableArray();

	// Make Marker
	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34));
		return markerImage;
    }

    // "Palette #1: 343838,005F6B,008C9E,00B4CC,00DFFC"
    // "Palette #3: FF4E50,FC913A,F9D423,EDE574,E1F5C4"
    // "Palette #4: 99B898,FECEA8,FF847C,E84A5F,2A363B"

    // Default Marker Color
    var defaultIcon = makeMarkerIcon('00B4CC');

	// Show Markers
	self.showMarkers = function(){
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          markers[i].setVisible(true);
        }
	}

	// Hide Markers
	self.hideMarkers = function(){
		 for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
          markers[i].setVisible(false);
        }
	}

	// Marker Creation
	self.createMarkers = function(places){
		self.hideMarkers()
		// let bounds = new google.maps.LatLngBounds();
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
			marker.addListener('click', function(){
				map.setCenter(this.position);
				map.setZoom(16);
				infoWindow.open(map, this);
				infoWindow.setContent(this.title);
			})
			markers.push(marker);
			place.marker = marker;
			self.placesList.push(new Place(place));
		}
		self.showMarkers();
		//map.fitBounds(bounds)
	}

	// Search Box
	self.searchTextBox = ko.observable('');
	const placesService = new google.maps.places.PlacesService(map);

	// Search Submit
	self.searchTextBoxSubmit = function(){
		placesService.textSearch({
			query: self.searchTextBox(),
			bounds: map.getBounds()
		}, function(places){
			if (places.length < 1){
				alert('No results found!');
			}
			self.createMarkers(places);
			self.returnResults(places);
		});
	}

	// For sidenav results
	self.returnResults = function(places){
		// Clear list of places
		self.placesList.removeAll()
		// Push new list of Place objects to placesList array
		places.forEach(function(place){
			self.placesList.push(new Place(place));
		});
	}

	// Open Window Method
	self.openInfoWindow = function(place){
		let marker = place.marker();
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1500);

		map.setCenter(place.location());
		map.setZoom(16);

		infoWindow.open(map, marker);
		infoWindow.setContent(place.name());
	}

	self.createMarkers(initialPlaces);
}


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

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.7749, lng: -122.4194},
		styles: styles,
		zoom: 12,
		mapTypeControl: false
	});
};

var initApp = function() {
    initMap();
    ko.applyBindings(new ViewModel());
};