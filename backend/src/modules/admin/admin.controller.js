const adminModel = require('./admin.model');
const userModel = require('../user/user.model');
const captainModel = require('../captain/captain.model');
const rideModel = require('../ride/ride.model');
const { validationResult } = require('express-validator');

// Admin Login
module.exports.loginAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const admin = await adminModel.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Admin account is deactivated' });
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = admin.generateAuthToken();

        res.status(200).json({ token, admin });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Admin Profile
module.exports.getAdminProfile = async (req, res) => {
    res.status(200).json({ admin: req.admin });
};

// Dashboard Statistics
module.exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const activeUsers = await userModel.countDocuments({ socketId: { $ne: null } });
        
        const totalCaptains = await captainModel.countDocuments();
        const activeCaptains = await captainModel.countDocuments({ status: 'active' });
        const inactiveCaptains = await captainModel.countDocuments({ status: 'inactive' });
        
        const totalRides = await rideModel.countDocuments();
        const pendingRides = await rideModel.countDocuments({ status: 'pending' });
        const ongoingRides = await rideModel.countDocuments({ status: 'ongoing' });
        const completedRides = await rideModel.countDocuments({ status: 'completed' });
        const cancelledRides = await rideModel.countDocuments({ status: 'cancelled' });

        // Calculate total revenue
        const revenueData = await rideModel.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$fare' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Recent rides
        const recentRides = await rideModel.find()
            .sort({ date: -1 })
            .limit(5)
            .populate('user', 'fullname email')
            .populate('captain', 'fullname email');

        res.status(200).json({
            users: { total: totalUsers, active: activeUsers },
            captains: { total: totalCaptains, active: activeCaptains, inactive: inactiveCaptains },
            rides: { 
                total: totalRides, 
                pending: pendingRides, 
                ongoing: ongoingRides, 
                completed: completedRides,
                cancelled: cancelledRides
            },
            revenue: totalRevenue,
            recentRides
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Users
module.exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await userModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await userModel.countDocuments();

        res.status(200).json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Captains
module.exports.getAllCaptains = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const captains = await captainModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await captainModel.countDocuments();

        res.status(200).json({
            captains,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get captains error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Rides
module.exports.getAllRides = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const rides = await rideModel.find()
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'fullname email')
            .populate('captain', 'fullname email vehicle');

        const total = await rideModel.countDocuments();

        res.status(200).json({
            rides,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get rides error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete User
module.exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await userModel.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Captain
module.exports.deleteCaptain = async (req, res) => {
    try {
        const { captainId } = req.params;
        await captainModel.findByIdAndDelete(captainId);
        res.status(200).json({ message: 'Captain deleted successfully' });
    } catch (error) {
        console.error('Delete captain error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Captain Status
module.exports.updateCaptainStatus = async (req, res) => {
    try {
        const { captainId } = req.params;
        const { status } = req.body;

        const captain = await captainModel.findByIdAndUpdate(
            captainId,
            { status },
            { new: true }
        );

        res.status(200).json({ message: 'Captain status updated', captain });
    } catch (error) {
        console.error('Update captain status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
