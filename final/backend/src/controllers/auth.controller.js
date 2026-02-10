const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const config = require('../config/config');

// ===========================
// REGISTER USER WITH USERTYPE
// ===========================
exports.register = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // ensure role exists or create it
    let role = await Role.findOne({ name: userType || 'donor' });
    if (!role) {
      role = await Role.create({
        name: userType || 'donor',
        permissions: []
      });
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role._id,
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: user._id,
      userType: role.name
    });

  } catch (error) {
    next(error);
  }
};


// ===========================
// LOGIN VALIDATION WITH USERTYPE
// ===========================
exports.login = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email }).populate('role');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure userType matches assigned role
    if (userType && user.role.name !== userType) {
      return res.status(403).json({
        error: `Account registered as '${user.role.name}', not '${userType}'.`
      });
    }

    // Create JWT containing role
    const token = jwt.sign(
      {
        userId: user._id,
        userType: user.role.name
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role.name
      }
    });

  } catch (error) {
    next(error);
  }
};
