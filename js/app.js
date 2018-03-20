'use strict';

// Global Vars
let map;
let infoWindow;

const initialPlaces = [
	
];

// Storing all data into an object
const Place = function(data){
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.geometry.location.lat);
	this.lng = ko.observable(data.geometry.location.lng);
	this.formatted_address = ko.observable(data.formatted_address);
	this.icon = ko.observable(data.icon);
	this.marker = ko.observable(data.marker);
	this.openInfoWindow = function(){

		let marker = this.marker();
		let infoWindow = new google.maps.InfoWindow();

		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 3500);

		infoWindow.open(map, marker);
		infoWindow.setContent(this.name());
	}
}

const ViewModel = function(){

	const self = this;

	let markers = [];
	let infoWindow = new google.maps.InfoWindow();

	self.placesList = ko.observableArray();

	// Show Markers
	self.showMarkers = function(markers){
		markers.forEach(function(marker){
			marker.setMap(map);
		})
	}

	// Hide Markers
	self.hideMarkers = function(markers){
		markers.forEach(function(marker){
			marker.setMap(null);
			marker.setVisible(false);
		})
	}

	// Markers Creation
	self.createMarkers = function(places){
		self.hideMarkers(markers)
		//let bounds = new google.maps.LatLngBounds();
		// Iterate through places and create markers for each
		for (let i = 0; i < places.length; i++){
			let place = places[i];
			let marker = new google.maps.Marker({
				title: place.name,
				position: place.geometry.location,
				animation: google.maps.Animation.DROP,
				id: i
			});
			// Add click listeners to generate maker info windows
			marker.addListener('click', function(){
				infoWindow.open(map, this);
				infoWindow.setContent(this.title);
			})
			markers.push(marker);
			place.marker = marker;
			self.placesList.push(new Place(place));
		}
		self.showMarkers(markers);
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
		})
	}

	// For sidenav results
	self.returnResults = function(places){
		self.placesList.removeAll()
		places.forEach(function(place){
			self.placesList.push(new Place(place));
		});
	}

	self.createMarkers(initialPlaces);
}

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.7749, lng: -122.4194},
		zoom: 12
	});
};

var initApp = function() {
    initMap();
    ko.applyBindings(new ViewModel());
};