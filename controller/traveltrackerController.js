const { db } = require("../db/db");
const { sendQuaterlyMail, sendTenReminderMail, sendSixReminderMail, sendTwoReminderMail, sendFirstRemarksMail, sendSecondRemarksMail, sendQuaterlyReminderMail, sendPasswordResetEmail } = require("../utils/traveltrackermail");

// const getEmpList = async () => {
//   try {
//     const empQuery = `SELECT hr_mantra_id, name, email FROM tbl_emp`;

//     const result = await db.query(empQuery);

//     if (!result || !result.rows || result.rows.length == 0) {
//       console.log("No travel reminders to send today.");
//       return;
//     }

//     for (const row of result.rows) {
//       sendQuaterlyMail(row.name, row.email, row.hr_mantra_id);
//     }
//   } catch (err) {
//     console.error('Error fetching employee list:', err);
//   }
// };

const sendMailtoHOD = async () => {
  try {

    const query = `
      SELECT DISTINCT tp.hr_mantra_id,
                      e.co_person_id,
                      e.name,
                      e.email
      FROM tbl_travel_plan tp
      JOIN tbl_emp e ON tp.hr_mantra_id = e.hr_mantra_id
      WHERE tp.mail_sent_date::date = CURRENT_DATE
    `;

    const { rows } = await db.query(query);

    if (!rows.length) {
      console.log('No row present');
      return;
    }

    for (const row of rows) {

      let ccEmails = [];

      if (row.co_person_id && row.co_person_id.trim() !== '') {

        const coPersonIds = row.co_person_id.split(',').map(id => id.trim());

        const { rows: coPersons } = await db.query(
          `SELECT coperson_email
           FROM tbl_coperson
           WHERE hr_mantra_id = ANY($1)`,
          [coPersonIds]
        );

        ccEmails = coPersons.map(p => p.coperson_email);
      }

      await sendQuaterlyMail(
        row.name,
        row.email,
        row.hr_mantra_id,
        ccEmails
      );
    }

    await db.query(`
      UPDATE tbl_travel_plan
      SET mail_sent = 'YES'
      WHERE mail_sent_date::date = CURRENT_DATE
    `);

    console.log('Mail sent successfully');

  } catch (err) {
    console.error('Error sending mails:', err);
  }
};

const sendFirstDayMailtoHOD = async () => {
  try {

    const query = `
      SELECT DISTINCT
             tp.plan_id,
             tp.hr_mantra_id,
             e.co_person_id,
             e.name,
             e.email
      FROM tbl_travel_plan tp
      JOIN tbl_emp e
        ON tp.hr_mantra_id = e.hr_mantra_id
      WHERE tp.month_start::date = CURRENT_DATE
    `;

    const { rows } = await db.query(query);

    if (!rows.length) {
      console.log('No row present');
      return;
    }

    const processedPlanIds = [];

    for (const row of rows) {

      let ccEmails = [];

      if (row.co_person_id && row.co_person_id.trim() !== '') {

        const coPersonIds = row.co_person_id
          .split(',')
          .map(id => id.trim());

        const { rows: coPersons } = await db.query(
          `
          SELECT coperson_email
          FROM tbl_coperson
          WHERE hr_mantra_id = ANY($1)
          `,
          [coPersonIds]
        );

        ccEmails = coPersons.map(p => p.coperson_email);
      }

      await sendQuaterlyMail(
        row.name,
        row.email,
        row.hr_mantra_id,
        ccEmails
      );

      processedPlanIds.push(row.plan_id);
    }

    console.log("Calling procedure...");

    await db.query(`CALL travel_plan_calculation()`);

    console.log("Procedure completed");

    if (processedPlanIds.length > 0) {
      await db.query(
        `
        UPDATE tbl_travel_plan
        SET mail_sent = ''
        WHERE plan_id = ANY($1)
        `,
        [processedPlanIds]
      );
    }

    console.log('Mail sent successfully');

  } catch (err) {
    console.error('Error sending mails:', err);
  }
};

const sendMailRemindertoHOD = async () => {
  try {

    const query = `
      SELECT DISTINCT tp.hr_mantra_id, e.name, e.email
      FROM tbl_travel_plan tp
      JOIN tbl_emp e ON tp.hr_mantra_id = e.hr_mantra_id
      WHERE tp.two_days_prior_date::date = CURRENT_DATE
    `;

    const { rows } = await db.query(query);

    if (!rows.length) {
      console.log('No row present');
    }

    for (const row of rows) {
      await sendQuaterlyReminderMail(row.name, row.email, row.hr_mantra_id);
    }

    // await db.query(`CALL travel_plan_calculation()`);

    console.log('Mail sent successfully:');

  } catch (err) {
    console.error('Error sending mails:', err);
  }
};

const sendMailReminder2toHOD = async () => {
  try {

    const query = `
      SELECT DISTINCT tp.hr_mantra_id, e.name, e.email
      FROM tbl_travel_plan tp
      JOIN tbl_emp e ON tp.hr_mantra_id = e.hr_mantra_id
      WHERE tp.six_days_prior_date::date = CURRENT_DATE
    `;

    const { rows } = await db.query(query);

    if (!rows.length) {
      console.log('No row present');
    }

    for (const row of rows) {
      await sendQuaterlyReminderMail(row.name, row.email, row.hr_mantra_id);
    }

    // await db.query(`CALL travel_plan_calculation()`);

    console.log('Mail sent successfully:');

  } catch (err) {
    console.error('Error sending mails:', err);
  }
};

const sendMailReminder3toHOD = async () => {
  try {

    const query = `
      SELECT DISTINCT tp.hr_mantra_id, e.name, e.email
      FROM tbl_travel_plan tp
      JOIN tbl_emp e ON tp.hr_mantra_id = e.hr_mantra_id
      WHERE tp.ten_days_prior_date::date = CURRENT_DATE
    `;

    const { rows } = await db.query(query);

    if (!rows.length) {
      console.log('No row present');
    }

    for (const row of rows) {
      await sendQuaterlyReminderMail(row.name, row.email, row.hr_mantra_id);
    }

    // await db.query(`CALL travel_plan_calculation()`);

    console.log('Mail sent successfully:');

  } catch (err) {
    console.error('Error sending mails:', err);
  }
};

// const setTravelDetails = async (req, res) => {
//   try {
//     console.log(req.body);
//     let { hr_mantra_id, dept, travelDetails } = req.body;

//     const insertTravelQuery = `
//       INSERT INTO tbl_travel_response
//       (hr_mantra_id, department, from_date, to_date, destination, coperson_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING res_id, to_date
//     `;

//     const insertCoPersonQuery = `
//       INSERT INTO tbl_travel_coperson
//       (res_id, coperson_id, after_visit_24hr, after_visit_48hr)
//       VALUES ($1, $2, $3, $4)
//     `;

//     for (const detail of travelDetails) {
//       const {
//         fromDate,
//         toDate,
//         destination,
//         coperson
//       } = detail;

//       // Convert co-person array → comma-separated string or NULL
//       const coPersonValue =
//         Array.isArray(coperson) && coperson.length > 0
//           ? coperson.join(',')
//           : null;

//       // Insert travel record
//       const travelResult = await db.query(insertTravelQuery, [
//         hr_mantra_id,
//         dept,
//         fromDate,
//         toDate,
//         destination,
//         coPersonValue
//       ]);

//       const { res_id } = travelResult.rows[0];

//       // Calculate follow-up dates
//       const baseDate = new Date(toDate);

//       const afterVisit24hr = new Date(baseDate);
//       afterVisit24hr.setDate(afterVisit24hr.getDate() + 1);

//       const afterVisit48hr = new Date(baseDate);
//       afterVisit48hr.setDate(afterVisit48hr.getDate() + 3);

//       // Insert co-person rows
//       if (Array.isArray(coperson) && coperson.length > 0) {
//         await Promise.all(
//           coperson.map(coperson_id =>
//             db.query(insertCoPersonQuery, [
//               res_id,
//               coperson_id,
//               afterVisit24hr,
//               afterVisit48hr
//             ])
//           )
//         );
//       }
//     }

//     return res.status(200).json({
//       status: 200,
//       message: "Travel details and co-persons inserted successfully"
//     });

//   } catch (error) {
//     console.error("Error processing data:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Internal Server Error"
//     });
//   }
// };

const setTravelDetails = async (req, res) => {
  try {
    console.log(req.body);
    const { hr_mantra_id, dept, travelDetails } = req.body;

    const insertTravelQuery = `
      INSERT INTO tbl_travel_response
      (
        hr_mantra_id,
        department,
        from_date,
        to_date,
        destination,
        coperson_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING res_id, to_date
    `;

    const insertCoPersonQuery = `
      INSERT INTO tbl_travel_coperson
      (
        res_id,
        coperson_id,
        after_visit_24hrs,
        after_visit_48hrs
      )
      VALUES ($1, $2, $3, $4)
    `;

    const updateTravelFormQuery = `
      UPDATE tbl_travel_form
      SET
        from_date = $1,
        to_date = $2,
        travel_companion = $3
      WHERE form_id = $4
    `;

    for (const detail of travelDetails) {
      const {
        form_id,
        destination_id,
        fromDate,
        toDate,
        coperson
      } = detail;

      const coPersonValue =
        Array.isArray(coperson) && coperson.length > 0
          ? coperson.join(',')
          : null;

      // Update tbl_travel_form
      await db.query(updateTravelFormQuery, [
        fromDate,
        toDate,
        coPersonValue,
        form_id
      ]);

      // Insert into tbl_travel_response
      const travelResult = await db.query(insertTravelQuery, [
        hr_mantra_id,
        dept,
        fromDate,
        toDate,
        destination_id,
        coPersonValue
      ]);

      const { res_id } = travelResult.rows[0];

      // Calculate follow-up dates
      const baseDate = new Date(toDate);

      const afterVisit24hr = new Date(baseDate);
      afterVisit24hr.setDate(afterVisit24hr.getDate() + 1);

      const afterVisit48hr = new Date(baseDate);
      afterVisit48hr.setDate(afterVisit48hr.getDate() + 3);

      // Insert co-person records
      if (Array.isArray(coperson) && coperson.length > 0) {
        await Promise.all(
          coperson.map((coperson_id) =>
            db.query(insertCoPersonQuery, [
              res_id,
              coperson_id,
              afterVisit24hr,
              afterVisit48hr
            ])
          )
        );
      }
    }

    return res.status(200).json({
      status: 200,
      message:
        "Travel form updated and travel response records inserted successfully"
    });

  } catch (error) {
    console.error("Error processing travel details:", error);

    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
  }
};

const sendTenDaysReminder = async () => {
  try {
    const travelQuery = `
      SELECT res_id, hr_mantra_id, from_date, destination
      FROM tbl_travel_response
      WHERE ten_prior_mail = CURRENT_DATE
    `;

    const travelResult = await db.query(travelQuery);

    if (!travelResult?.rows?.length) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {

      /* -------- EMPLOYEE DETAILS -------- */
      const empQuery = `
        SELECT name, email, co_person_id
        FROM tbl_emp
        WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult?.rows?.length) continue;

      const empData = empResult.rows[0];

      /* -------- DESTINATION -------- */
      const destQuery = `
        SELECT area_name
        FROM tbl_area
        WHERE area_code = $1
      `;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult?.rows?.length) continue;

      const destinationName = destResult.rows[0].area_name;

      /* -------- CO-PERSON EMAILS -------- */
      let ccEmails = [];

      if (empData.co_person_id) {
        const copersonIds = empData.co_person_id
          .split(',')
          .map(id => id.trim())
          .filter(Boolean);

        if (copersonIds.length) {
          const copersonQuery = `
            SELECT coperson_email
            FROM tbl_coperson
            WHERE hr_mantra_id = ANY($1::text[])
          `;

          const copersonResult = await db.query(copersonQuery, [copersonIds]);

          ccEmails = copersonResult.rows
            .map(r => r.coperson_email)
            .filter(Boolean);
        }
      }

      /* -------- SEND MAIL -------- */
      sendTenReminderMail(
        empData.name,
        empData.email,
        travelRow.from_date,
        destinationName,
        ccEmails
      );
    }

  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const sendSixDaysReminder = async () => {
  try {
    const travelQuery = `
      SELECT hr_mantra_id, from_date, destination
      FROM tbl_travel_response
      WHERE six_prior_mail = CURRENT_DATE
    `;

    const travelResult = await db.query(travelQuery);

    if (!travelResult?.rows?.length) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {
      /* =====================
         EMPLOYEE
      ===================== */
      const empQuery = `
        SELECT name, email, co_person_id
        FROM tbl_emp
        WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult.rows.length) continue;

      /* =====================
         DESTINATION
      ===================== */
      const destQuery = `
        SELECT area_name
        FROM tbl_area
        WHERE area_code = $1
      `;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult.rows.length) continue;

      /* =====================
         CO-PERSON CC EMAILS
      ===================== */
      let ccEmails = [];

      if (empData.co_person_id) {
        const copersonIds = empData.co_person_id
          .split(',')
          .map(id => id.trim())
          .filter(Boolean);

        if (copersonIds.length) {
          const copersonQuery = `
            SELECT coperson_email
            FROM tbl_coperson
            WHERE hr_mantra_id = ANY($1::text[])
          `;

          const copersonResult = await db.query(copersonQuery, [copersonIds]);

          ccEmails = copersonResult.rows
            .map(r => r.coperson_email)
            .filter(Boolean);
        }
      }

      /* =====================
         SEND MAIL
      ===================== */
      const empData = empResult.rows[0];
      const destinationName = destResult.rows[0].area_name;

      await sendSixReminderMail(
        empData.name,
        empData.email,
        travelRow.from_date,
        destinationName,
        ccEmails
      );
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const sendTwoDaysReminder = async () => {
  try {
    const travelQuery = `
      SELECT hr_mantra_id, from_date, destination, coperson_id
      FROM tbl_travel_response
      WHERE two_prior_mail = CURRENT_DATE
    `;

    const travelResult = await db.query(travelQuery);

    if (!travelResult?.rows?.length) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {
      /* =====================
         EMPLOYEE
      ===================== */
      const empQuery = `
        SELECT name, email
        FROM tbl_emp
        WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult.rows.length) continue;

      /* =====================
         DESTINATION
      ===================== */
      const destQuery = `
        SELECT area_name
        FROM tbl_area
        WHERE area_code = $1
      `;
      const destResult = await db.query(destQuery, [travelRow.destination]);

      if (!destResult.rows.length) continue;

      /* =====================
         CO-PERSON CC EMAILS
      ===================== */
      let ccEmails = [];

      if (empData.co_person_id) {
        const copersonIds = empData.co_person_id
          .split(',')
          .map(id => id.trim())
          .filter(Boolean);

        if (copersonIds.length) {
          const copersonQuery = `
            SELECT coperson_email
            FROM tbl_coperson
            WHERE hr_mantra_id = ANY($1::text[])
          `;

          const copersonResult = await db.query(copersonQuery, [copersonIds]);

          ccEmails = copersonResult.rows
            .map(r => r.coperson_email)
            .filter(Boolean);
        }
      }

      /* =====================
         SEND MAIL
      ===================== */
      const empData = empResult.rows[0];
      const destinationName = destResult.rows[0].area_name;

      await sendTwoReminderMail(
        empData.name,
        empData.email,
        travelRow.from_date,
        destinationName,
        ccEmails
      );
    }
  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const sendFirstRemarks = async () => {
  try {
    const travelQuery = `
      SELECT res_id, from_date, hr_mantra_id
      FROM tbl_travel_response 
      WHERE after_visit_24hr = CURRENT_DATE;
    `;

    const travelResult = await db.query(travelQuery);

    if (!travelResult?.rows?.length) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {

      // 🔹 Get employee details
      const empQuery = `
        SELECT name, email, co_person_id 
        FROM tbl_emp 
        WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult?.rows?.length) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      const empData = empResult.rows[0];

      // 🔹 Build CC emails (kept for future use)
      let ccEmails = [];

      if (empData.co_person_id) {
        const copersonIds = empData.co_person_id
          .split(',')
          .map(id => id.trim())
          .filter(Boolean);

        if (copersonIds.length) {
          const copersonQuery = `
            SELECT coperson_email
            FROM tbl_coperson
            WHERE hr_mantra_id = ANY($1::text[])
          `;

          const copersonResult = await db.query(copersonQuery, [copersonIds]);

          ccEmails = copersonResult.rows
            .map(r => r.coperson_email)
            .filter(Boolean);
        }
      }

      // 🔹 Send email (CC NOT used currently)
      await sendFirstRemarksMail(
        empData.name,
        empData.email,
        travelRow.from_date,
        travelRow.hr_mantra_id,
        travelRow.res_id
        // ccEmails ← keep commented if not needed now
      );
    }

  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const sendCoFirstRemarks = async () => {
  try {
    const coPersonQuery = `
      SELECT travel_co_id, coperson_id, res_id
      FROM tbl_travel_coperson
      WHERE after_visit_24hr = CURRENT_DATE
    `;
    const coPersonResult = await db.query(coPersonQuery);

    if (!coPersonResult?.rows?.length) {
      console.log("No co-person reminders to send today.");
      return;
    }

    for (const coRow of coPersonResult.rows) {

      const travelQuery = `
        SELECT res_id, from_date
        FROM tbl_travel_response
        WHERE res_id = $1
      `;
      const travelResult = await db.query(travelQuery, [coRow.res_id]);

      if (!travelResult?.rows?.length) {
        console.warn(`No travel found for res_id: ${coRow.res_id}`);
        continue;
      }

      const travelData = travelResult.rows[0];

      const coEmpQuery = `
        SELECT coperson_name, coperson_email, hr_mantra_id
        FROM tbl_coperson
        WHERE coperson_id = $1
      `;
      const coEmpResult = await db.query(coEmpQuery, [coRow.coperson_id]);

      if (!coEmpResult?.rows?.length) {
        console.warn(`No co-person found for ID: ${coRow.coperson_id}`);
        continue;
      }

      const coPerson = coEmpResult.rows[0];

      // ✅ CORRECT VALUES
      await sendFirstRemarksMail(
        coPerson.coperson_name,
        coPerson.coperson_email,
        travelData.from_date,
        coPerson.hr_mantra_id,
        coRow.travel_co_id   // ✅ THIS is what you wanted
      );
    }
  } catch (err) {
    console.error("Error processing co-person reminders:", err);
  }
};

const sendCoSecondRemarks = async () => {
  try {
    const coPersonQuery = `
      SELECT travel_co_id, coperson_id, res_id
      FROM tbl_travel_coperson
      WHERE after_visit_48hr = CURRENT_DATE
    `;
    const coPersonResult = await db.query(coPersonQuery);

    if (!coPersonResult?.rows?.length) {
      console.log("No co-person reminders to send today.");
      return;
    }

    for (const coRow of coPersonResult.rows) {

      const travelQuery = `
        SELECT res_id, from_date
        FROM tbl_travel_response
        WHERE res_id = $1
      `;
      const travelResult = await db.query(travelQuery, [coRow.res_id]);

      if (!travelResult?.rows?.length) {
        console.warn(`No travel found for res_id: ${coRow.res_id}`);
        continue;
      }

      const travelData = travelResult.rows[0];

      const coEmpQuery = `
        SELECT coperson_name, coperson_email, hr_mantra_id
        FROM tbl_coperson
        WHERE coperson_id = $1
      `;
      const coEmpResult = await db.query(coEmpQuery, [coRow.coperson_id]);

      if (!coEmpResult?.rows?.length) {
        console.warn(`No co-person found for ID: ${coRow.coperson_id}`);
        continue;
      }

      const coPerson = coEmpResult.rows[0];

      // ✅ CORRECT VALUES
      await sendSecondRemarksMail(
        coPerson.coperson_name,
        coPerson.coperson_email,
        travelData.from_date,
        coPerson.hr_mantra_id,
        coRow.travel_co_id  
      );
    }
  } catch (err) {
    console.error("Error processing co-person reminders:", err);
  }
};

const sendSecondRemarks = async () => {
  try {
    const travelQuery = `
      SELECT res_id, from_date, hr_mantra_id
      FROM tbl_travel_response 
      WHERE after_visit_48hr = CURRENT_DATE 
      AND (is_visited = '' OR is_visited IS NULL);
    `;

    const travelResult = await db.query(travelQuery);

    if (!travelResult || !travelResult.rows || travelResult.rows.length === 0) {
      console.log("No travel reminders to send today.");
      return;
    }

    for (const travelRow of travelResult.rows) {

      // ✅ Fetch co_person_id from tbl_emp
      const empQuery = `
        SELECT name, email, co_person_id 
        FROM tbl_emp 
        WHERE hr_mantra_id = $1
      `;
      const empResult = await db.query(empQuery, [travelRow.hr_mantra_id]);

      if (!empResult || empResult.rows.length === 0) {
        console.warn(`No employee found for HR Mantra ID: ${travelRow.hr_mantra_id}`);
        continue;
      }

      const empData = empResult.rows[0];

      // ✅ Build CC emails
      let ccEmails = [];

      if (empData.co_person_id) {
        const copersonIds = empData.co_person_id
          .split(',')
          .map(id => id.trim())
          .filter(Boolean);

        if (copersonIds.length) {
          const copersonQuery = `
            SELECT coperson_email
            FROM tbl_coperson
            WHERE hr_mantra_id = ANY($1::text[])
          `;

          const copersonResult = await db.query(copersonQuery, [copersonIds]);

          ccEmails = copersonResult.rows
            .map(r => r.coperson_email)
            .filter(Boolean);
        }
      }

      // ✅ Send mail with CC
      await sendSecondRemarksMail(
        empData.name,
        empData.email,
        travelRow.from_date,
        travelRow.hr_mantra_id,
        travelRow.res_id
        // ccEmails
      );
    }

  } catch (err) {
    console.error("Error processing data:", err);
  }
};

const setTravelRemarks = async (req, res) => {
  try {
    const { did_travel, res_id, remarks = "" } = req.body;

    if (!res_id) {
      return res.status(400).json({
        status: 400,
        message: "Doer is not Correct"
      });
    }

    // Step 1: Try updating main travel response
    const updateTravelQuery = `
      UPDATE tbl_travel_response
      SET is_visited = $1,
          not_visited_reason = $2
      WHERE res_id = $3
    `;

    const travelResult = await db.query(updateTravelQuery, [
      did_travel,
      remarks,
      res_id
    ]);

    // Step 2: If NOT found, update co-person table
    if (travelResult.rowCount === 0) {

      const updateCoPersonQuery = `
        UPDATE tbl_travel_coperson
        SET is_visited = $1,
            not_visited_reason = $2
        WHERE travel_co_id = $3
      `;

      const coResult = await db.query(updateCoPersonQuery, [
        did_travel,
        remarks,
        res_id   // res_id maps to travel_co_id here
      ]);

      if (coResult.rowCount === 0) {
        return res.status(404).json({
          status: 404,
          message: "Invalid travel reference"
        });
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Travel remarks updated successfully"
    });

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
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

const getCoPerson = async (req, res) => {
  try {
    const query = `SELECT coperson_id, coperson_name FROM tbl_coperson`;
    const result = await db.query(query);

    return res.status(200).json({status: 200, data: result.rows});

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

function formatToISTDate(date) {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const getTravelDetailsDashboard = async (req, res) => {
  try {
    let { from_date = '', to_date = '' } = req.body;

    let fromDate = from_date;
    let toDate = to_date;

    let conditions = [];
    let values = [];

    // ✅ Case 1: Only fromDate → from that date onward
    if (fromDate && !toDate) {
      values.push(fromDate);
      conditions.push(`tr.from_date >= $${values.length}`);
    }

    // ✅ Case 2: Both fromDate & toDate → inclusive range
    if (fromDate && toDate) {
      values.push(fromDate);
      values.push(toDate);

      // Important: include full toDate (handles timestamp issue)
      conditions.push(
        `tr.from_date >= $${values.length - 1} 
         AND tr.from_date < ($${values.length}::date + INTERVAL '1 day')`
      );
    }

    // ✅ Build WHERE clause dynamically
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        tr.res_id,
        tr.hr_mantra_id,
        emp.name,
        tr.department,

        tr.from_date,
        tr.to_date,

        tr.destination AS area_code,
        ar.area_name AS destination_name,

        tr.ten_prior_mail,
        tr.six_prior_mail,
        tr.two_prior_mail,
        tr.after_visit_24hr,
        tr.after_visit_48hr,
        tr.is_visited,
        tr.not_visited_reason,
        tr.coperson_id

      FROM tbl_travel_response tr

      LEFT JOIN tbl_emp emp
        ON emp.hr_mantra_id = tr.hr_mantra_id

      LEFT JOIN tbl_area ar
        ON ar.area_code = tr.destination

      ${whereClause}

      ORDER BY tr.res_id DESC
    `;

    const result = await db.query(query, values);

    const formattedData = result.rows.map(row => ({
      ...row,
      from_date: formatToISTDate(row.from_date),
      to_date: formatToISTDate(row.to_date),
      ten_prior_mail: formatToISTDate(row.ten_prior_mail),
      six_prior_mail: formatToISTDate(row.six_prior_mail),
      two_prior_mail: formatToISTDate(row.two_prior_mail),
      after_visit_24hr: formatToISTDate(row.after_visit_24hr),
      after_visit_48hr: formatToISTDate(row.after_visit_48hr)
    }));

    return res.status(200).json({
      status: 200,
      count: formattedData.length,
      data: formattedData
    });

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
  }
};

const getCoPersonDetails = async (req, res) => {
  try {
    const { res_id } = req.params;

    if (!res_id) {
      return res.status(400).json({
        status: 400,
        message: "res_id is required"
      });
    }

    const query = `
      SELECT
        tc.travel_co_id,
        tc.res_id,
        tc.coperson_id,
        emp.coperson_name,
        tc.after_visit_24hr,
        tc.after_visit_48hr,
        tc.is_visited,
        tc.not_visited_reason
      FROM tbl_travel_coperson tc
      LEFT JOIN tbl_coperson emp
        ON emp.coperson_id = tc.coperson_id
      WHERE tc.res_id = $1
      ORDER BY tc.travel_co_id ASC
    `;

    const result = await db.query(query, [res_id]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        status: 200,
        count: 0,
        msg: "No co person added for travel"
      });
    }

    const formattedData = result.rows.map(row => ({
      ...row,
      after_visit_24hr: formatToISTDate(row.after_visit_24hr),
      after_visit_48hr: formatToISTDate(row.after_visit_48hr)
    }));

    return res.status(200).json({
      status: 200,
      count: formattedData.length,
      data: formattedData
    });

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
  }
};

const setLogin = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "hr_mantra_id and password are required"
      });
    }

    let hr_mantra_id = username;

    const loginQuery = `
      SELECT *
      FROM tbl_login
      WHERE hr_mantra_id = $1 AND password = $2
    `;

    const loginResult = await db.query(loginQuery, [hr_mantra_id, password]);

    if (loginResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const user = loginResult.rows[0];

    if (user.designation !== "EA") {
      return res.status(200).json({
        message: "Login successful",
        data: user,
        mappedUsers: []
      });
    }

    const empQuery = `
      SELECT hr_mantra_id
      FROM tbl_emp
      WHERE co_person_id IS NOT NULL
      AND $1 = ANY(string_to_array(REPLACE(co_person_id, ' ', ''), ','))
    `;

    const empResult = await db.query(empQuery, [hr_mantra_id]);

    const mappedIds = [...new Set(
      empResult.rows.map(row => row.hr_mantra_id)
    )];

    if (mappedIds.length === 0) {
      return res.status(200).json({
        message: "Login successful (no mapped users)",
        data: user,
        mappedUsers: []
      });
    }

    const mappedQuery = `
      SELECT hr_mantra_id, name, designation, email
      FROM tbl_login
      WHERE hr_mantra_id = ANY($1)
    `;

    const mappedResult = await db.query(mappedQuery, [mappedIds]);

    return res.status(200).json({
      message: "Login successful",
      data: user,
      mappedUsers: mappedResult.rows
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

const getTravelDashboardbyID = async (req, res) => {
  try {
    let {hr_mantra_id} = req.params;
    if (!hr_mantra_id) {
      return res.status(400).json({
        status: 400,
        message: "Hr Mantra ID is required"
      });
    }
    const query = `
      SELECT
        tr.res_id,
        tr.hr_mantra_id,
        emp.name,
        tr.department,

        tr.from_date,
        tr.to_date,

        tr.destination AS area_code,
        ar.area_name AS destination_name,

        tr.ten_prior_mail,
        tr.six_prior_mail,
        tr.two_prior_mail,
        tr.after_visit_24hr,
        tr.after_visit_48hr,
        tr.is_visited,
        tr.not_visited_reason,
        tr.coperson_id

      FROM tbl_travel_response tr

      LEFT JOIN tbl_emp emp
        ON emp.hr_mantra_id = tr.hr_mantra_id

      LEFT JOIN tbl_area ar
        ON ar.area_code = tr.destination

      WHERE tr.hr_mantra_id = $1

      ORDER BY tr.res_id DESC
    `;

    const result = await db.query(query, [hr_mantra_id]);

    const formattedData = result.rows.map(row => ({
      ...row,
      from_date: formatToISTDate(row.from_date),
      to_date: formatToISTDate(row.to_date),
      ten_prior_mail: formatToISTDate(row.ten_prior_mail),
      six_prior_mail: formatToISTDate(row.six_prior_mail),
      two_prior_mail: formatToISTDate(row.two_prior_mail),
      after_visit_24hr: formatToISTDate(row.after_visit_24hr),
      after_visit_48hr: formatToISTDate(row.after_visit_48hr)
    }));


    return res.status(200).json({
      status: 200,
      count: formattedData.length,
      data: formattedData
    });

  } catch (error) {
    console.error("Error processing data:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error"
    });
  }
}

const getTravelDetailsbyResID = async (req, res) => {
  try {
    const { res_id } = req.params;

    if (!res_id) {
      return res.status(400).json({
        message: "res_id is required"
      });
    }

    const query = `
      SELECT 
        tr.res_id,
        tr.hr_mantra_id,
        emp.name,
        tr.department,
        tr.from_date,
        tr.to_date,
        tr.destination AS area_code,
        ar.area_name
      FROM tbl_travel_response tr
      LEFT JOIN tbl_emp emp 
        ON tr.hr_mantra_id = emp.hr_mantra_id
      LEFT JOIN tbl_area ar
        ON tr.destination = ar.area_code
      WHERE tr.res_id = $1
    `;

    const result = await db.query(query, [res_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No travel record found"
      });
    }

    const data = result.rows[0];

    // ✅ Function to convert to IST and format YYYY-MM-DD
    const formatToDate = (date) => {
      if (!date) return null;

      const d = new Date(date);
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    data.from_date = formatToISTDate(data.from_date);
    data.to_date = formatToISTDate(data.to_date);

    return res.status(200).json({
      message: "Travel details fetched successfully",
      data
    });

  } catch (error) {
    console.error("Error fetching travel details:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

const setTravelDetailsbyResID = async (req, res) => {
  try {
    const { res_id, from_date, to_date } = req.body;

    // ✅ Validation
    if (!res_id || !from_date || !to_date) {
      return res.status(400).json({
        message: "res_id, from_date and to_date are required"
      });
    }

    const query = `
      UPDATE tbl_travel_response
      SET 
        from_date = $1,
        to_date = $2
      WHERE res_id = $3
      RETURNING *
    `;

    const result = await db.query(query, [from_date, to_date, res_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No record found with this res_id"
      });
    }

    return res.status(200).json({
      message: "Travel dates updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error updating travel details:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

const getIdForChangePassword = async (req, res) => {
    try {
        const { hr_mantra_id } = req.body;

        if (!hr_mantra_id) {
            return res.status(400).json({
                status: 400,
                message: "Please provide hr_mantra_id."
            });
        }

        const emailQuery = `
            SELECT email
            FROM tbl_login
            WHERE hr_mantra_id = $1
            LIMIT 1
        `;

        const result = await db.query(emailQuery, [hr_mantra_id]);

        // Check if user exists
        if (result.rows.length <= 0) {
            return res.status(401).json({
                status: 401,
                message: "Please provide correct id."
            });
        }

        const email = result.rows[0].email;

        const emailResponse = await sendPasswordResetEmail(email, hr_mantra_id);

        return res.status(emailResponse.status).json(emailResponse);

    } catch (error) {
        console.error("Error sending mail:", error);

        return res.status(500).json({
            status: 500,
            message: "Error sending mail."
        });
    }
};

const setDoerPassword = async (req, res) => {
    try {
        const { hr_mantra_id, newPassword, confirmPassword } = req.body;

        // Check required fields
        if (!hr_mantra_id || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required."
            });
        }

        // Check password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 400,
                message: "Passwords do not match."
            });
        }

        const setPassQuery = `
            UPDATE tbl_login
            SET password = $1
            WHERE hr_mantra_id = $2
        `;

        const result = await db.query(setPassQuery, [
            confirmPassword,
            hr_mantra_id
        ]);

        // Check if row updated
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 404,
                message: "User not found."
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Password updated successfully."
        });

    } catch (error) {
        console.error("Error setting password:", error);

        return res.status(500).json({
            status: 500,
            message: "Error setting password."
        });
    }
};

const getTravelFormDetailsbyID = async (req, res) => {
    try {

        const { traveller_name } = req.params;

        const date = new Date();

        // If today is not the first day, move to next month
        if (date.getDate() > 20) {
            date.setMonth(date.getMonth() + 1);
        }

        const monthName = date.toLocaleString('en-US', {
            month: 'long'
        });

        const query = `
            SELECT
                tf.*,
                l.name,
                a.area_name
            FROM tbl_travel_form tf
            LEFT JOIN tbl_login l
                ON tf.traveller_name = l.hr_mantra_id
            LEFT JOIN tbl_area a
                ON tf.destination_id = a.area_code
            WHERE tf.traveller_name = $1
            AND tf.month_name = $2
        `;

        const result = await db.query(query, [
            traveller_name,
            monthName
        ]);

        return res.status(200).json({
            status: 200,
            month: monthName,
            data: result.rows
        });

    } catch (error) {

        console.error(
            "Error fetching travel details:",
            error
        );

        return res.status(500).json({
            status: 500,
            message: "Error fetching travel details."
        });
    }
};

const getTravelLocation = async (req, res) => {
    try {
        let { hr_mantra_id, month } = req.params;

        // If month not provided -> use current month
        if (!month) {
            month = new Date().toISOString().slice(0, 7);
        }

        month = month.trim();

        let params = [hr_mantra_id];

        params.push(`${month}-01`);
        const dateIndex = params.length;

        const monthFilter = `
            AND tf.from_date >= $${dateIndex}::date
            AND tf.from_date < ($${dateIndex}::date + INTERVAL '1 month')
        `;

        const areaQuery = `
            SELECT
                a.area_name,
                COUNT(tf.destination) AS count
            FROM tbl_area a
            LEFT JOIN tbl_travel_response tf
                ON a.area_code = tf.destination
                AND tf.hr_mantra_id = $1
                ${monthFilter}
            GROUP BY a.area_code, a.area_name
            ORDER BY a.area_name
        `;

        const totalQuery = `
            SELECT COUNT(area_code) AS total_count
            FROM tbl_area
        `;

        const visitedQuery = `
            SELECT
                COUNT(DISTINCT tf.destination) AS visited
            FROM tbl_travel_response tf
            WHERE tf.hr_mantra_id = $1
            AND tf.destination IS NOT NULL
            ${monthFilter}
        `;

        const topDestinationQuery = `
            SELECT
                a.area_name,
                COUNT(tf.destination) AS visit_count
            FROM tbl_travel_response tf
            INNER JOIN tbl_area a
                ON a.area_code = tf.destination
            WHERE tf.hr_mantra_id = $1
            AND tf.destination IS NOT NULL
            ${monthFilter}
            GROUP BY a.area_code, a.area_name
            ORDER BY visit_count DESC
            LIMIT 1
        `;

        console.log("month:", month);
        console.log("params:", params);

        const areaResult = await db.query(areaQuery, params);
        const totalResult = await db.query(totalQuery);
        const visitedResult = await db.query(visitedQuery, params);
        const topDestinationResult = await db.query(
            topDestinationQuery,
            params
        );

        return res.status(200).json({
            status: 200,
            total_count: parseInt(totalResult.rows[0]?.total_count || 0),
            visited: parseInt(visitedResult.rows[0]?.visited || 0),
            not_visited:
                parseInt(totalResult.rows[0]?.total_count || 0) -
                parseInt(visitedResult.rows[0]?.visited || 0),

            most_visited_location: {
                area_name: topDestinationResult.rows[0]?.area_name || null,
                count: parseInt(
                    topDestinationResult.rows[0]?.visit_count || 0
                )
            },

            data: areaResult.rows
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: 500,
            message: "Error fetching travel details"
        });
    }
};

const getResponseCount = async (req, res) => {
    try {

        const { hr_mantra_id } = req.params;

        const query = `
        SELECT
            TO_CHAR(
                months.month,
                'Mon YYYY'
            ) AS month,

            COALESCE(
                COUNT(
                    tr.from_date
                )::INT,
                0
            ) AS count

        FROM (

            SELECT
                generate_series(
                    DATE_TRUNC(
                        'month',
                        CURRENT_DATE
                    ) - INTERVAL '6 months',

                    DATE_TRUNC(
                        'month',
                        CURRENT_DATE
                    ),

                    INTERVAL '1 month'
                ) AS month

        ) months

        LEFT JOIN
        tbl_travel_response tr

        ON DATE_TRUNC(
            'month',
            tr.from_date
        ) = months.month

        AND tr.hr_mantra_id = $1

        GROUP BY
            months.month

        ORDER BY
            months.month ASC
        `;

        const result =
        await db.query(
            query,
            [hr_mantra_id]
        );

        return res.status(200).json({
            status: 200,
            data: result.rows
        });

    } catch (error) {

        console.error(
            "Error fetching response count:",
            error
        );

        return res.status(500).json({
            status: 500,
            message:
            "Error fetching response count"
        });

    }
};

const getEmployee = async (req, res) => {
    try {

        const query = `
            SELECT 
                hr_mantra_id,
                name
            FROM tbl_emp
            ORDER BY name ASC
        `;

        const result = await db.query(query);

        return res.status(200).json({
            status: 200,
            data: result.rows
        });

    } catch (error) {
        console.error("Error fetching employee details:", error);

        return res.status(500).json({
            status: 500,
            message: "Error fetching employee details."
        });
    }
};

module.exports = {sendMailtoHOD, setTravelDetails, sendTenDaysReminder, sendSixDaysReminder, sendTwoDaysReminder, sendFirstRemarks, sendSecondRemarks, setTravelRemarks, getDestination, getCoPerson, sendCoFirstRemarks, sendCoSecondRemarks, getTravelDetailsDashboard, getCoPersonDetails, sendMailRemindertoHOD, sendMailReminder2toHOD, sendMailReminder3toHOD, setLogin, getTravelDashboardbyID, getTravelDetailsbyResID, setTravelDetailsbyResID, getIdForChangePassword, setDoerPassword, getTravelFormDetailsbyID, sendFirstDayMailtoHOD, getTravelLocation, getEmployee, getResponseCount}