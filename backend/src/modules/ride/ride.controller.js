const rideService = require('./ride.service');
const { validationResult } = require('express-validator');

const mapService = require('../../utils/distance');
const { sendMessageToSocketId } = require('../../config/socket');
const rideModel = require('./ride.model');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
        console.log('✅ Ride created:', ride._id);
        res.status(201).json(ride);

        const pickupCoordinates = await mapService.getCoordinates(pickup);
        console.log('📍 Pickup coordinates:', pickupCoordinates);
        
        // Increased radius to 50km for testing
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 50);
        console.log(`🚗 Searching for captains within 50km of pickup`);
        console.log(`🚗 Found ${captainsInRadius.length} captains:`, captainsInRadius.map(c => ({ 
            id: c._id.toString().slice(-6), 
            socketId: c.socketId, 
            status: c.status,
            location: c.location 
        })));

        if (captainsInRadius.length === 0) {
            console.log('⚠️ No active captains found in radius!');
        }

        ride.otp = ""
        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {
            console.log(`📤 Sending ride ${ride._id} to captain ${captain._id} via socket ${captain.socketId}`);
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })
        })

    } catch (err) {
        console.log('❌ Error creating ride:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
