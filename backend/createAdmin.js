const mongoose = require('mongoose');
const adminModel = require('./src/modules/admin/admin.model');
require('dotenv').config();

async function createDefaultAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email: 'admin@uber.com' });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        // Create default admin
        const hashedPassword = await adminModel.hashPassword('admin123');
        
        const admin = await adminModel.create({
            fullname: {
                firstname: 'Super',
                lastname: 'Admin'
            },
            email: 'admin@uber.com',
            password: hashedPassword,
            role: 'superadmin',
            isActive: true
        });

        console.log('✅ Default admin created successfully!');
        console.log('Email: admin@uber.com');
        console.log('Password: admin123');
        console.log('⚠️  Please change this password after first login');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createDefaultAdmin();
