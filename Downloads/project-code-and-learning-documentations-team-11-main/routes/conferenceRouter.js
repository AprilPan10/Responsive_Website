"use strict";

const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');

router.get('/', conferenceController.index);

router.get('/lobby', conferenceController.lobby);

router.get('/servererror', conferenceController.serverError);

router.get('/newRoom', conferenceController.newRoom);

router.get('/:room', conferenceController.connectToRoom);

router.use('/', conferenceController.pageNotFoundError);

module.exports = router;
