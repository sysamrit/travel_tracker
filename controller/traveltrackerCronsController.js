const { getEmpList, sendTenDaysReminder, sendSixDaysReminder, sendTwoDaysReminder, sendFirstRemarks, sendSecondRemarks } = require("./traveltrackerController");

module.exports = [
    {
        cronTime: '0 6 15 3,6,9,12 *',
        jobFunction: getEmpList,
        jobName: 'All Employee Email',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendTenDaysReminder,
        jobName: 'Ten Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendSixDaysReminder,
        jobName: 'Six Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendTwoDaysReminder,
        jobName: 'Two Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendFirstRemarks,
        jobName: 'One Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendSecondRemarks,
        jobName: 'Three Days Travel Reminder',
    },
    {
        cronTime: '* * * * *',
        jobFunction: sendTenDaysReminder,
        jobName: 'All Employee Email',
    }
]