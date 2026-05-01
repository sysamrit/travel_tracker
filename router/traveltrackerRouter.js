const express = require('express');
const { setTravelDetails, setTravelRemarks, getDestination, getCoPerson, getTravelDetailsDashboard, getCoPersonDetails, setLogin, getTravelDashboardbyID } = require('../controller/traveltrackerController');

const travtrack = express.Router();
    
travtrack.post('/settraveldetails', setTravelDetails);
travtrack.post('/login', setLogin);
travtrack.put('/settravelremarks', setTravelRemarks);
travtrack.get('/getdestination', getDestination);
travtrack.get('/getcopersons', getCoPerson);
travtrack.post('/get/details/dashboard', getTravelDetailsDashboard);
travtrack.get('/get/details/dashboard/:hr_mantra_id', getTravelDashboardbyID);
travtrack.get('/get/codetails/dashboard/:res_id', getCoPersonDetails);

module.exports = travtrack;