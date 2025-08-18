const express = require('express');
const { setTravelDetails, setTravelRemarks, getDestination } = require('../controller/traveltrackerController');

const travtrack = express.Router();
    
travtrack.post('/settraveldetails', setTravelDetails);
travtrack.put('/settravelremarks', setTravelRemarks);
travtrack.get('/getdestination', getDestination);

module.exports = travtrack;