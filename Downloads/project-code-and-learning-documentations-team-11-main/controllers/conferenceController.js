"use strict";
const {v4:uuidv4} = require('uuid');


function index(req, res) {
    // res.render('index.ejs');
    res.render('index.ejs');
}

function lobby(req, res) {
    res.render('lobby.ejs');
}

function pageNotFoundError(req, res) {
    res.status(404);
    res.render('pagenotfound.ejs');
}

function serverError(req, res) {
    res.status(500);
    res.render('servererror.ejs');
}

function newRoom(req, res) {
    res.redirect(`/${uuidv4()}`);
}

function connectToRoom(req, res) {
    res.render('room', { roomId: req.params.room});
}

exports.index = index;
exports.lobby = lobby;
exports.pageNotFoundError = pageNotFoundError;
exports.serverError = serverError;
exports.newRoom = newRoom;
exports.connectToRoom = connectToRoom;