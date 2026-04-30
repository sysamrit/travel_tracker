const { sendMailtoHOD, sendTenDaysReminder, sendSixDaysReminder, sendTwoDaysReminder, sendFirstRemarks, sendSecondRemarks, sendCoFirstRemarks, sendCoSecondRemarks, sendMailRemindertoHOD, sendMailReminder2toHOD, sendMailReminder3toHOD } = require("./traveltrackerController");

module.exports = [
    // {
    //     cronTime: '0 6 1 3,6,9,12 *',
    //     jobFunction: getEmpList,
    //     jobName: 'All Employee Email',
    // }, 
    {
        cronTime: '0 6 * * *',
        jobFunction: sendMailtoHOD,
        jobName: 'HOD Travel Mail Send',
    },
    // {
    //     cronTime: '0 6 * * *',
    //     jobFunction: sendMailRemindertoHOD,
    //     jobName: 'HOD Travel Mail Send Reminder',
    // },
    // {
    //     cronTime: '0 6 * * *',
    //     jobFunction: sendMailReminder2toHOD,
    //     jobName: 'HOD Travel Mail Send Reminder 2',
    // },
    {
        cronTime: '0 6 * * *',
        jobFunction: sendMailReminder3toHOD,
        jobName: 'HOD Travel Mail Send Reminder 3',
    },
    // {
    //     cronTime: '0 6 * * *',
    //     jobFunction: sendTenDaysReminder,
    //     jobName: 'Ten Days Travel Reminder',
    // }, 
    {
        cronTime: '0 6 * * *',
        jobFunction: sendSixDaysReminder,
        jobName: 'Six Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendTwoDaysReminder,
        jobName: 'Two Days Travel Reminder',
    },
    {
        cronTime: '* * * * *',
        jobFunction: sendFirstRemarks,
        jobName: 'One Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendSecondRemarks,
        jobName: 'Three Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendCoFirstRemarks,
        jobName: 'First Days Travel Reminder',
    }, {
        cronTime: '0 6 * * *',
        jobFunction: sendCoSecondRemarks,
        jobName: 'Second Days Travel Reminder',
    },
    // {
    //     cronTime: '* * * * *',
    //     jobFunction: sendTenDaysReminder,
    //     jobName: 'All Employee Email',
    // },
    // {
    //     cronTime: '* * * * *',
    //     jobFunction: getEmpList,
    //     jobName: 'All Employee Email',
    // }
]