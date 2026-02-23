const requireAuth = require('../helpers/requireAuth');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const router = express.Router();

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

/*
---------------------------------------------------
REGISTER USER (PUBLIC)
---------------------------------------------------
*/
router.post('/register', async (req, res) => {
    try {
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 12),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        });

        user = await user.save();

        res.status(201).json({
            id: user.id,
            email: user.email
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

/*
---------------------------------------------------
LOGIN (ISSUE ACCESS + REFRESH TOKEN) (PUBLIC)
---------------------------------------------------
*/
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send('User with given Email not found');
        }

        const passwordValid = bcrypt.compareSync(
            req.body.password,
            user.passwordHash
        );

        if (!passwordValid) {
            return res.status(400).send('Password mismatch');
        }

        const accessToken = jwt.sign(
            {
                userID: user.id,
                isAdmin: user.isAdmin
            },
            process.env.secret,
            { expiresIn: '15m' }
        );

        const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshTokenRaw)
            .digest('hex');

        const refreshToken = new RefreshToken({
            tokenHash: refreshTokenHash,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await refreshToken.save();

        res.status(200).json({
            accessToken,
            refreshToken: refreshTokenRaw
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
---------------------------------------------------
REFRESH TOKEN (ROTATION) (PUBLIC)
---------------------------------------------------
*/
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).send('Refresh token required');
        }

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const existingToken = await RefreshToken.findOne({
            tokenHash: refreshTokenHash,
            revoked: false
        }).populate('user');

        if (!existingToken) {
            return res.status(403).send('Invalid refresh token');
        }

        if (existingToken.expiresAt < new Date()) {
            return res.status(403).send('Refresh token expired');
        }

        existingToken.revoked = true;
        await existingToken.save();

        const newRefreshRaw = crypto.randomBytes(64).toString('hex');
        const newRefreshHash = crypto
            .createHash('sha256')
            .update(newRefreshRaw)
            .digest('hex');

        const newRefreshToken = new RefreshToken({
            tokenHash: newRefreshHash,
            user: existingToken.user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await newRefreshToken.save();

        const newAccessToken = jwt.sign(
            {
                userID: existingToken.user.id,
                isAdmin: existingToken.user.isAdmin
            },
            process.env.secret,
            { expiresIn: '15m' }
        );

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshRaw
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
---------------------------------------------------
LOGOUT (REVOKE REFRESH TOKEN) (PUBLIC)
---------------------------------------------------
*/
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).send('Refresh token required');
        }

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        await RefreshToken.findOneAndUpdate(
            { tokenHash: refreshTokenHash },
            { revoked: true }
        );

        res.status(200).json({ message: 'Logged out successfully' });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
---------------------------------------------------
PROTECTED ROUTES
---------------------------------------------------
*/

/*
GET USER COUNT (PROTECTED)
*/
router.get('/get/count', requireAuth, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.status(200).json({ userCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
GET ALL USERS (PROTECTED)
*/
router.get('/', requireAuth, async (req, res) => {
    try {
        const userList = await User.find().select('-passwordHash');
        res.status(200).send(userList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
GET USER BY ID (PROTECTED)
*/
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).send(user);

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
DELETE USER (PROTECTED)
*/
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
