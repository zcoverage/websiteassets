// -------------------------
// GitHub-compatible backend
// -------------------------

// Receive JSON POST from GitHub form
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById("1mTfFG6ZReI9MmQGUzy5y_MPKngeSbYoFvskHaUyQqvo"); // Your Sheet ID
    const sheet = ss.getSheetByName("Submissions"); // Your tab name
    const householdID = generateHouseholdID();
    const timestamp = new Date();

    const buildRow = (type, d) => [
      householdID,
      type,
      d.fullname || '',
      d.dob || '',
      d.age || '',
      d.tobaccouse || '',
      d.email || '',
      d.phone || '',
      d.zip || '',
      d.insurancetype || '',
      d.householdsize || '',
      d.householdincome || '',
      d.currentlyinsured || '',
      d.coveragestartdate || '',
      d.relationship || '',
      d.currentcoveragecarrier || '',
      d.prescriptionmedications || '',
      d.primarycarephysician || '',
      d.preexistingconditions || '',
      d.notes || '',
      d.preferredcontactmethod || '',
      d.besttimetocontact || '',
      timestamp
    ];

    // Save Applicant
    sheet.appendRow(buildRow("Applicant", data.applicant));

    // Save Spouse
    if (data.spouse) {
      sheet.appendRow(buildRow("Spouse", data.spouse));
    }

    // Save Dependents
    if (data.dependents && data.dependents.length > 0) {
      data.dependents.forEach(dep => {
        sheet.appendRow(buildRow("Dependent", dep));
      });
    }

    // -------------------------
    // Email notification
    // -------------------------
    try {
      const email = "your-email@example.com"; // <-- Replace with your email
      const subject = `New Quote Submission - ${householdID}`;
      let body = `Household ID: ${householdID}\n\nApplicant Info:\n`;
      for (const [key, value] of Object.entries(data.applicant)) {
        body += `${key}: ${value}\n`;
      }
      if (data.spouse) {
        body += `\nSpouse Info:\n`;
        for (const [key, value] of Object.entries(data.spouse)) {
          body += `${key}: ${value}\n`;
        }
      }
      if (data.dependents && data.dependents.length > 0) {
        data.dependents.forEach((dep, i) => {
          body += `\nDependent ${i+1}:\n`;
          for (const [key, value] of Object.entries(dep)) {
            body += `${key}: ${value}\n`;
          }
        });
      }
      MailApp.sendEmail(email, subject, body);
    } catch(errEmail) {
      Logger.log("Email not sent: " + errEmail);
    }

    // Return JSON success
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------
// Existing helpers
// -------------------------

function generateHouseholdID() {
  const ss = SpreadsheetApp.openById('1mTfFG6ZReI9MmQGUzy5y_MPKngeSbYoFvskHaUyQqvo');
  const sheet = ss.getSheetByName('Submissions');
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return 'ZC001';
  const lastID = sheet.getRange(lastRow, 1).getValue();
  const num = parseInt(lastID.replace('ZC','')) + 1;
  return 'ZC' + num.toString().padStart(3,'0');
}

function calculateAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m<0 || (m===0 && today.getDate()<birth.getDate())) age--;
  return age;
}
