const BASE_URL = `http://192.168.1.60:4020/api/v1/tt`;

let destinations = [];

async function loadDestinations() {
  try {
    showLoadingIndicator();

    const res = await fetch(`${BASE_URL}/getdestination`);
    const data = await res.json();

    if (data.status == 200 && Array.isArray(data.data)) {
      destinations = data.data;
    } else {
      console.error("Failed to load destinations");
      alert("Failed to load destinations. Please try again later.");
    }
  } catch (err) {
    console.error("Error fetching destinations:", err);
    alert("Error loading destinations. Please check your connection.");
  } finally {
    hideLoadingIndicator();
  }
}


// Parse query params to display Name and ID
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name") || "Unknown";
const empId = urlParams.get("emp_id") || "N/A";
const expiresRaw = urlParams.get("expires");
let expiresAt = expiresRaw ? new Date(decodeURIComponent(expiresRaw)).getTime() : null;
if (expiresAt) {
  expiresAt += 19800000; // Add 5 hrs 30 mins
}

const now = Date.now();

if (expiresAt && now > expiresAt) {
  document.body.innerHTML = `
    <div style="text-align: center; margin-top: 50px;">
      <div style="display: inline-block; padding: 20px; border: 2px solid red; border-radius: 10px;">
        <h2 style="color: red;">This link has <strong>expired</strong>.</h2>
      </div>
    </div>
  `;
} else {
  document.getElementById("headerName").textContent = name;
  document.getElementById("headerEmpId").textContent = empId;

  const travelEntriesContainer = document.getElementById("travelEntries");
  const addEntryBtn = document.getElementById("addEntry");

  addEntryBtn.disabled = true;


  loadDestinations().then(() => {
    if (destinations.length > 0) {
      addTravelEntry(false);
      addEntryBtn.disabled = false;
    }
  });

  addEntryBtn.addEventListener("click", () => {
    addTravelEntry(true);
  });

  function addTravelEntry(canRemove) {
    const entry = document.createElement("div");
    entry.className = "travel-entry row g-3 align-items-end mt-3";

    const fromCol = document.createElement("div");
    fromCol.className = "col-md-4";
    fromCol.innerHTML = `
      <label class="form-label">From Date <span class="text-danger">*</span></label>
      <input type="date" name="from_date[]" class="form-control from-date" required>
    `;

    const toCol = document.createElement("div");
    toCol.className = "col-md-4";
    toCol.innerHTML = `
      <label class="form-label">To Date <span class="text-danger">*</span></label>
      <input type="date" name="to_date[]" class="form-control to-date" required disabled>
    `;

    const destCol = document.createElement("div");
    destCol.className = "col-md-3";

    // Build dropdown from destinations array
    let optionsHtml = `<option value="">Select Destination</option>`;
    destinations.forEach(dest => {
      optionsHtml += `<option value="${dest.area_code}">${dest.area_name}</option>`;
    });

    destCol.innerHTML = `
      <label class="form-label">Destination <span class="text-danger">*</span></label>
      <select name="destination[]" class="form-select" required>
        ${optionsHtml}
      </select>
    `;

    entry.appendChild(fromCol);
    entry.appendChild(toCol);
    entry.appendChild(destCol);

    if (canRemove) {
      const removeCol = document.createElement("div");
      removeCol.className = "col-md-1 d-flex";
      removeCol.innerHTML = `<button type="button" class="btn btn-outline-danger mt-2 remove-entry">X</button>`;
      entry.appendChild(removeCol);

      removeCol.querySelector(".remove-entry").addEventListener("click", () => {
        entry.remove();
      });
    }

    travelEntriesContainer.appendChild(entry);
    attachDateHandlers(entry);
  }

  function attachDateHandlers(entry) {
    const fromInput = entry.querySelector(".from-date");
    const toInput = entry.querySelector(".to-date");

    if (!fromInput || !toInput) return;

    // Calculate current quarter
    const today = new Date();
    const currentMonth = today.getMonth();
    const year = today.getFullYear();

    let quarterStart, quarterEnd;
    if (currentMonth < 3) {
      quarterStart = new Date(year, 0, 1);
      quarterEnd = new Date(year, 2, 31);
    } else if (currentMonth < 6) {
      quarterStart = new Date(year, 3, 1);
      quarterEnd = new Date(year, 5, 30);
    } else if (currentMonth < 9) {
      quarterStart = new Date(year, 6, 1);
      quarterEnd = new Date(year, 8, 30);
    } else {
      quarterStart = new Date(year, 9, 1);
      quarterEnd = new Date(year, 11, 31);
    }

    const qStartStr = quarterStart.toISOString().split("T")[0];
    const qEndStr = quarterEnd.toISOString().split("T")[0];

    // Apply quarter range to from-date
    fromInput.min = qStartStr;
    fromInput.max = qEndStr;

    fromInput.addEventListener("change", () => {
      const fromVal = fromInput.value;
      if (fromVal) {
        const fromDate = new Date(fromVal);

        // Enable and restrict to-date
        toInput.disabled = false;
        toInput.min = fromVal;
        toInput.max = qEndStr;

        // Clear if out of bounds
        if (toInput.value && (toInput.value < toInput.min || toInput.value > toInput.max)) {
          toInput.value = "";
        }
      } else {
        toInput.disabled = true;
        toInput.value = "";
      }
    });
  }
}

// Form submission
const submitBtn = document.querySelector("button[type='submit']");
document.getElementById("travelForm").addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const fromObj = Object.fromEntries(formData);

  if (!fromObj.department || fromObj.department.trim() == "") {
    alert("Department is required.");
    return;
  }

  const entries = Array.from(document.querySelectorAll(".travel-entry"));
  const travelDetails = [];

  for (const entry of entries) {
    const from = entry.querySelector(".from-date").value;
    const to = entry.querySelector(".to-date").value;
    const dest = entry.querySelector("select").value; // <-- area_code

    if (!from || !to || !dest) {
      alert("All travel fields (From Date, To Date, Destination) are required.");
      return;
    }

    travelDetails.push({ from_date: from, to_date: to, destination: dest });
  }

  const payload = {
    hr_mantra_id: empId,
    dept: fromObj.department,
    travel_details: travelDetails
  };

  try {
    showLoadingIndicator();
    submitBtn.disabled = true;

    const response = await fetch(`${BASE_URL}/settraveldetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status == 200) {
      alert("Travel details submitted successfully.");
      location.reload();
    } else {
      alert("Failed to submit: " + result.message);
    }
  } catch (err) {
    console.log("Submission error:", err);
    alert("Something went wrong.");
  } finally {
    hideLoadingIndicator();
    submitBtn.disabled = false;
  }
});

function hideLoadingIndicator() {
  var loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = "none";
}

function showLoadingIndicator() {
  var loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = "block";
}
