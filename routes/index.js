const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express();
const merchantService = require('./merchantService');
const user = require('./user');
const setOpenid = require('../middlewares/openid')
router.use(setOpenid)
router.use('/merchantService', merchantService);
router.use('/user', user)
module.exports = router;