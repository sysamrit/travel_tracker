const { scheduleJob } = require('../utils/emailService');

const cronsController = require('../controller/traveltrackerCronsController');

const jobs = [...cronsController];

const initSchedulers = () => {
    jobs.forEach(({ cronTime, jobFunction, jobName }) => {
        scheduleJob(cronTime, jobFunction, jobName);
    });
};

module.exports = { initSchedulers };