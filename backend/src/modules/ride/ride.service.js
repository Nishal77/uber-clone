const rideModel = require('./ride.model');
const mapService = require('../../utils/distance');
const fareCalculator = require('../../utils/fareCalculator');
const crypto = require('crypto');

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: fareCalculator.calculateFare(distanceTime.distance.value, distanceTime.duration.value),
        car: fareCalculator.calculateFare(distanceTime.distance.value, distanceTime.duration.value) * 1.5,
        moto: fareCalculator.calculateFare(distanceTime.distance.value, distanceTime.duration.value) * 0.8
    };

    return baseFare;
}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async ({
    user, pickup, destination, vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination);

    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[ vehicleType ]
    })

    return ride;
}
