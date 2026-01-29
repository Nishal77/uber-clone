const axios = require('axios');
const captainModel = require('../modules/captain/captain.model');

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    // Mock distance and time for development/demo purposes
    // Since Google Maps API key is likely invalid/billing disabled
    const mockDistance = Math.floor(Math.random() * 10) + 2; // Random distance between 2-12 km
    const mockDuration = mockDistance * 3; // Approx 3 mins per km

    return {
        distance: {
            text: `${mockDistance} km`,
            value: mockDistance * 1000 // Convert to meters
        },
        duration: {
            text: `${mockDuration} mins`,
            value: mockDuration * 60 // Convert to seconds
        },
        status: 'OK'
    };

    /* 
    // Original Google Maps implementation preserved for production use
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }
            return response.data.rows[ 0 ].elements[ 0 ];
        } else {
            throw new Error('Unable to fetch distance and time');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
    */
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: input,
                format: 'json',
                limit: 5,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'UberCloneApp/1.0' // Nominatim requires a User-Agent
            }
        });
        
        return response.data.map(result => ({
            description: result.display_name
        }));
    } catch (err) {
        console.error('Nominatim API error, falling back to mock data:', err.message);
        
        // Fallback to mock data if API fails
        const mockSuggestions = [
            "Mumbai, Maharashtra, India",
            "Delhi, India",
            "Bangalore, Karnataka, India",
            "Hyderabad, Telangana, India",
            "Ahmedabad, Gujarat, India",
            "Chennai, Tamil Nadu, India",
            "Kolkata, West Bengal, India",
            "Pune, Maharashtra, India",
            "Jaipur, Rajasthan, India",
            "Surat, Gujarat, India",
            "Lucknow, Uttar Pradesh, India",
            "Kanpur, Uttar Pradesh, India",
            "Nagpur, Maharashtra, India",
            "Indore, Madhya Pradesh, India",
            "Thane, Maharashtra, India",
            "Bhopal, Madhya Pradesh, India",
            "Visakhapatnam, Andhra Pradesh, India",
            "Pimpri-Chinchwad, Maharashtra, India",
            "Patna, Bihar, India",
            "Vadodara, Gujarat, India",
            "Ghaziabad, Uttar Pradesh, India",
            "Ludhiana, Punjab, India",
            "Agra, Uttar Pradesh, India",
            "Nashik, Maharashtra, India",
            "Faridabad, Haryana, India",
            "Meerut, Uttar Pradesh, India",
            "Rajkot, Gujarat, India",
            // ... add more if needed
        ];

        return mockSuggestions
            .filter(location => location.toLowerCase().includes(input.toLowerCase()))
            .slice(0, 5)
            .map(location => ({ description: location }));
    }
}

module.exports.getCoordinates = async (address) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'UberCloneApp/1.0'
            }
        });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                ltd: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (err) {
        console.error('Nominatim Geocoding error:', err.message);
        throw err;
    }
    
    // Fallback/Original Google Maps implementation
    /*
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
    */
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // Radius in km
    const captains = await captainModel.find({
        status: 'active'
    });

    return captains.filter(captain => {
        if (!captain.location || !captain.location.ltd || !captain.location.lng) {
            return false;
        }
        const distance = getDistanceFromLatLonInKm(ltd, lng, captain.location.ltd, captain.location.lng);
        return distance <= radius;
    });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
