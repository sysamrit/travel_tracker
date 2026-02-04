const express = require('express');
const { setTravelDetails, setTravelRemarks, getDestination, getCoPerson, getTravelDetailsDashboard, getCoPersonDetails } = require('../controller/traveltrackerController');

const travtrack = express.Router();
    
travtrack.post('/settraveldetails', setTravelDetails);
travtrack.put('/settravelremarks', setTravelRemarks);
travtrack.get('/getdestination', getDestination);
travtrack.get('/getcopersons', getCoPerson);
travtrack.get('/get/details/dashboard', getTravelDetailsDashboard);
travtrack.get('/get/codetails/dashboard/:res_id', getCoPersonDetails);

module.exports = travtrack;