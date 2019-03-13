var express = require('express');
var router = express.Router();
const axios = require('axios')
var app = express();
var jwt = require('jwt-simple')
var qiniu = require("qiniu")
var {db, jwtKey} = require('../config')
const log = require('../config/log')
var moment = require('moment')
var merchantService = require('./merchantService');

router.use('/merchantService', merchantService);
module.exports = router;