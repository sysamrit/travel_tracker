const { db } = require("../db/db");
const { sendQuaterlyMail, sendTenReminderMail, sendSixReminderMail, sendTwoReminderMail, sendFirstRemarksMail, sendSecondRemarksMail } = require("../utils/traveltrackermail");

const getEmpList = async () => {
  try {
    const empQuery = `SELECT hr_mantra_id, name, email FROM tbl_emp`;

    const result = await db.query(empQuery);

    if (!result || !result.rows || result.rows.length == 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const row of result.rows) {
      sendQuaterlyMail(row.name, row.email, row.hr_mantra_id);
    }
  } catch (err) {
    console.error('Error fetching employee list:', err);
  }
};

const setTravelDetails = async (req, res) => {
  try {
    const { hr_mantra_id, dept, travel_details } = req.body;

    const insertQuery = `INSERT INTO tbl_travel_response (hr_mantra_id, department, from_date, to_date, destination) VALUES ($1, $2, $3, $4, $5)`;

    const insertPromises = travel_details.map(detail => {
      const { to_date, from_date, destination } = detail;
      return db.query(insertQuery, [hr_mantra_id,dept,from_date,to_date,destination]);
    });

    await Promise.all(insertPromises);

    return res.status(200).json({
      status: 200, message: "Travel details inserted successfully."
    });
  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({status: 500, message: "Internal Server Error"});
  }
};

const sendTenDaysReminder = async () => {
  try {
    const travelQuery = `SELECT hr_mantra_id, from_date, destination FROM tbl_travel_response WHERE ten_prior_mail = CURRENT_DATE;`;

    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    // Step 2: Loop through each travel record
    for (const travelRow of travelResult.rows) {
      // Get employee details
      const empQuery = `SELECT name, email FROM tbl_emp WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || !empResult.rows || empResult.rows.length === 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      // Get destination name
      const destQuery = `SELECT area_name FROM tbl_area WHERE area_code = $1`;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult || !destResult.rows || destResult.rows.length === 0) {
        console.warn(`No destination found for area_code: ${travelRow.destination}`);
        continue;
      }

      const empData = empResult.rows[0];
      const destinationName = destResult.rows[0].area_name;
      sendTenReminderMail(empData.name, empData.email, travelRow.from_date, destinationName);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};


const sendSixDaysReminder = async () => {
  try{
    const travelQuery = `SELECT hr_mantra_id, from_date, destination FROM tbl_travel_response WHERE six_prior_mail = CURRENT_DATE;`;
    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    // Step 2: Loop through each travel record
    for (const travelRow of travelResult.rows) {
      // Get employee details
      const empQuery = `SELECT name, email FROM tbl_emp WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || !empResult.rows || empResult.rows.length === 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      // Get destination name
      const destQuery = `SELECT area_name FROM tbl_area WHERE area_code = $1`;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult || !destResult.rows || destResult.rows.length === 0) {
        console.warn(`No destination found for area_code: ${travelRow.destination}`);
        continue;
      }

      const empData = empResult.rows[0];
      const destinationName = destResult.rows[0].area_name;
      sendSixReminderMail(empData.name, empData.email, travelRow.from_date, destinationName);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
}

const sendTwoDaysReminder = async () => {
  try {
    // Step 1: Get basic travel details
    const travelQuery = `SELECT hr_mantra_id, from_date, destination FROM tbl_travel_response WHERE two_prior_mail = CURRENT_DATE;`;
    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    // Step 2: Loop through each travel record
    for (const travelRow of travelResult.rows) {
      // Get employee details
      const empQuery = `SELECT name, email FROM tbl_emp WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || !empResult.rows || empResult.rows.length === 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      // Get destination name
      const destQuery = `SELECT area_name FROM tbl_area WHERE area_code = $1`;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult || !destResult.rows || destResult.rows.length === 0) {
        console.warn(`No destination found for area_code: ${travelRow.destination}`);
        continue;
      }

      const empData = empResult.rows[0];
      const destinationName = destResult.rows[0].area_name;

      // Step 3: Send email
      await sendTwoReminderMail(empData.name, empData.email, travelRow.from_date, destinationName);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};


const sendFirstRemarks = async () => {
  try {
    const travelQuery = `SELECT res_id, from_date, hr_mantra_id FROM tbl_travel_response WHERE after_visit_24hr = CURRENT_DATE;`;
    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {
      const empQuery = `SELECT name, email FROM tbl_emp WHERE hr_mantra_id = $1`;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || !empResult.rows || empResult.rows.length == 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      const empData = empResult.rows[0];

      // Step 3: Send the email
      await sendFirstRemarksMail(empData.name, empData.email, travelRow.from_date, travelRow.hr_mantra_id, travelRow.res_id);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};


const sendSecondRemarks = async () => {
  try {
    const travelQuery = `SELECT res_id, from_date, hr_mantra_id FROM tbl_travel_response WHERE after_visit_48hr = CURRENT_DATE AND (is_visited = '' OR is_visited IS NULL);`;

    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {
      const empQuery = `SELECT name, email FROM tbl_emp WHERE hr_mantra_id = $1`;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || !empResult.rows || empResult.rows.length == 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      const empData = empResult.rows[0];

      sendSecondRemarksMail(empData.name, empData.email, travelRow.from_date, travelRow.hr_mantra_id, travelRow.res_id);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const setTravelRemarks = async (req, res) => {
  try {
    const { did_travel, res_id, remarks = "" } = req.body;

    // Validation
    if (!res_id) {
      return res.status(400).json({ status: 400, message: "Doer is not Correct" });
    }

    // Update query
    const query = `UPDATE tbl_travel_response SET is_visited = $1, not_visited_reason = $2 WHERE res_id = $3`;

    await db.query(query, [did_travel, remarks, res_id]);

    return res.status(200).json({ status: 200, message: "Travel remarks updated successfully" });

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

const getDestination = async (req, res) => {
  try {
    const query = `SELECT area_code, area_name FROM tbl_area`;
    const result = await db.query(query);

    return res.status(200).json({status: 200, data: result.rows});

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

module.exports = {getEmpList, setTravelDetails, sendTenDaysReminder, sendSixDaysReminder, sendTwoDaysReminder, sendFirstRemarks, sendSecondRemarks, setTravelRemarks, getDestination}