const express = require('express');
const { setTravelDetails, setTravelRemarks, getDestination, getCoPerson, getTravelDetailsDashboard, getCoPersonDetails, setLogin, getTravelDashboardbyID, getTravelDetailsbyResID, setTravelDetailsbyResID, getIdForChangePassword, setDoerPassword, getTravelFormDetailsbyID, getTravelLocation, getEmployee, getResponseCount, getEmployeeDetailsbyID, getTravelLocationYearly } = require('../controller/traveltrackerController');

const travtrack = express.Router();
    
travtrack.post('/settraveldetails', setTravelDetails);
travtrack.post('/login', setLogin);
travtrack.put('/settravelremarks', setTravelRemarks);
travtrack.get('/getdestination', getDestination);
travtrack.get('/getcopersons', getCoPerson);
travtrack.post('/get/details/dashboard', getTravelDetailsDashboard);
travtrack.put('/update/single/details', setTravelDetailsbyResID);
travtrack.get('/get/details/dashboard/:hr_mantra_id', getTravelDashboardbyID);
travtrack.get('/get/single/details/:res_id', getTravelDetailsbyResID);
travtrack.get('/get/emp/details/:res_id', getEmployeeDetailsbyID);
travtrack.get('/get/codetails/dashboard/:res_id', getCoPersonDetails);
travtrack.post('/getid', getIdForChangePassword);
travtrack.put('/setpassword', setDoerPassword);
travtrack.get('/details/:traveller_name', getTravelFormDetailsbyID);
travtrack.get('/location/details/yearly/:hr_mantra_id', getTravelLocationYearly);
travtrack.get('/location/details/yearly/:hr_mantra_id/:year',getTravelLocationYearly);
travtrack.get('/location/details/:hr_mantra_id', getTravelLocation);
travtrack.get('/location/details/:hr_mantra_id/:month',getTravelLocation);
travtrack.get('/response/count/:hr_mantra_id',getResponseCount);
travtrack.get('/employee', getEmployee);

module.exports = travtrack;