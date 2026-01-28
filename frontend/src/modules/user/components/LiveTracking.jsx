import React, { useState, useEffect } from 'react'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const options = {
    zoomControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    styles: [
        {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [ { "weight": "2.00" } ]
        },
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [ { "color": "#9c9c9c" } ]
        },
        {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [ { "visibility": "on" } ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [ { "color": "#f2f2f2" } ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [ { "color": "#ffffff" } ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [ { "color": "#ffffff" } ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [ { "visibility": "off" } ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [ { "saturation": -100 }, { "lightness": 45 } ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [ { "color": "#eeeeee" } ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [ { "color": "#7b7b7b" } ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [ { "color": "#ffffff" } ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [ { "visibility": "simplified" } ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [ { "visibility": "off" } ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [ { "visibility": "off" } ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [ { "color": "#46bcec" }, { "visibility": "on" } ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [ { "color": "#c8d7d4" } ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [ { "color": "#070707" } ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [ { "color": "#ffffff" } ]
        }
    ]
}

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(center);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;

                console.log('Position updated:', latitude, longitude);

                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });
        };

        updatePosition(); // Initial update

        const intervalId = setInterval(updatePosition, 1000); // Update every 10 seconds

    }, [])

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition}
                zoom={15}
                options={options}
            >
                <Marker position={currentPosition} />
            </GoogleMap>
        </LoadScript>
    )
}

export default LiveTracking
