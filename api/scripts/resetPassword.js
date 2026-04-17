const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const resetPassword = async (email, newPassword) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`✗ User with email ${email} not found`);
      await mongoose.disconnect();
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`✓ Password reset successfully for ${email}`);
    console.log(`✓ New password: ${newPassword}`);
    console.log('⚠️  Make sure to change this password after logging in!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error resetting password:', error.message);
    process.exit(1);
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node resetPassword.js <email> <newPassword>');
  console.log('Example: node resetPassword.js nans@gmail.com newpassword123');
  process.exit(1);
}

resetPassword(email, newPassword);
