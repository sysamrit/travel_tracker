const BASE_URL = `http://192.168.1.60:4020/api/v1/tt`;

let destinations = [];
let coPersons = [];

/* =========================
   LOAD DESTINATIONS
========================= */
async function loadDestinations() {
  const res = await fetch(`${BASE_URL}/getdestination`);
  const data = await res.json();

  if (data.status === 200 && Array.isArray(data.data)) {
    destinations = data.data;
  } else {
    throw new Error("Failed to load destinations");
  }
}

/* =========================
   LOAD CO-PERSONS
========================= */
async function loadCoPersons() {
  const res = await fetch(`${BASE_URL}/getcopersons`);
  const data = await res.json();

  if (data.status === 200 && Array.isArray(data.data)) {
    coPersons = data.data;
  } else {
    throw new Error("Failed to load co-persons");
  }
}

/* =========================
   QUERY PARAMS
========================= */
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get("name") || "Unknown";
const empId = urlParams.get("emp_id") || "N/A";
const expiresRaw = urlParams.get("expires");

let expiresAt = expiresRaw
  ? new Date(decodeURIComponent(expiresRaw)).getTime()
  : null;

if (expiresAt) expiresAt += 19800000;

if (expiresAt && Date.now() > expiresAt) {
  document.body.innerHTML = `
    <div style="text-align:center;margin-top:50px;">
      <div style="display:inline-block;padding:20px;border:2px solid red;border-radius:10px;">
        <h2 style="color:red;">This link has <strong>expired</strong>.</h2>
      </div>
    </div>
  `;
} else {

  document.getElementById("headerName").textContent = name;
  document.getElementById("headerEmpId").textContent = empId;

  const travelEntriesContainer = document.getElementById("travelEntries");
  const addEntryBtn = document.getElementById("addEntry");

  addEntryBtn.disabled = true;

  /* =========================
     INITIAL LOAD
  ========================= */
  (async () => {
    try {
      showLoadingIndicator();
      await Promise.all([loadDestinations(), loadCoPersons()]);
      addTravelEntry(false);
      addEntryBtn.disabled = false;
    } catch (err) {
      alert(err.message);
    } finally {
      hideLoadingIndicator();
    }
  })();

  addEntryBtn.addEventListener("click", () => addTravelEntry(true));

  /* =========================
     ADD TRAVEL ENTRY
  ========================= */
  function addTravelEntry(canRemove) {
    const entry = document.createElement("div");
    entry.className = "travel-entry row g-3 align-items-end mt-3";

    entry.innerHTML += `
      <div class="col-md-3">
        <label class="form-label">From Date *</label>
        <input type="date" class="form-control from-date" required>
      </div>

      <div class="col-md-3">
        <label class="form-label">To Date *</label>
        <input type="date" class="form-control to-date" required disabled>
      </div>

      <div class="col-md-3">
        <label class="form-label">Destination *</label>
        <select class="form-select destination" required>
          <option value="">Select Destination</option>
          ${destinations.map(d =>
            `<option value="${d.area_code}">${d.area_name}</option>`
          ).join("")}
        </select>
      </div>

      <div class="col-md-3">
        <label class="form-label">Co-Person</label>

        <div class="coperson-wrapper">
          <div class="selected-tags"></div>

          <select class="form-select coperson-dropdown">
            <option value="">Select Co-Person</option>
            ${coPersons.map(p =>
              `<option value="${p.coperson_id}">${p.coperson_name}</option>`
            ).join("")}
          </select>
        </div>
      </div>
    `;

    if (canRemove) {
      entry.innerHTML += `
        <div class="col-md-1 d-flex">
          <button type="button" class="btn btn-outline-danger remove-entry">X</button>
        </div>
      `;
    }

    travelEntriesContainer.appendChild(entry);

    if (canRemove) {
      entry.querySelector(".remove-entry")
        .addEventListener("click", () => entry.remove());
    }

    attachDateHandlers(entry);
    attachCoPersonLogic(entry);
  }

  /* =========================
     CO-PERSON TAG LOGIC
  ========================= */
  function attachCoPersonLogic(entry) {
    const dropdown = entry.querySelector(".coperson-dropdown");
    const tagContainer = entry.querySelector(".selected-tags");

    const selectedMap = new Map(); // id -> name

    dropdown.addEventListener("change", () => {
      const id = dropdown.value;
      const text = dropdown.options[dropdown.selectedIndex].text;

      if (!id || selectedMap.has(id)) {
        dropdown.value = "";
        return;
      }

      selectedMap.set(id, text);

      const tag = document.createElement("div");
      tag.className = "tag";
      tag.dataset.id = id;
      tag.innerHTML = `${text} <span>&times;</span>`;

      tag.querySelector("span").addEventListener("click", () => {
        selectedMap.delete(id);
        tag.remove();
      });

      tagContainer.appendChild(tag);
      dropdown.value = "";
    });

    entry._selectedCoPersons = selectedMap;
  }

  /* =========================
     DATE HANDLERS
  ========================= */
  function attachDateHandlers(entry) {
    const fromInput = entry.querySelector(".from-date");
    const toInput = entry.querySelector(".to-date");

    fromInput.addEventListener("change", () => {
      if (fromInput.value) {
        toInput.disabled = false;
        toInput.min = fromInput.value;
      } else {
        toInput.disabled = true;
        toInput.value = "";
      }
    });
  }
}

/* =========================
   FORM SUBMIT
========================= */
document.getElementById("travelForm").addEventListener("submit", async e => {
  e.preventDefault();

  const dept = e.target.department.value.trim();
  if (!dept) {
    alert("Department is required");
    return;
  }

  const entries = document.querySelectorAll(".travel-entry");
  const travelDetails = [];

  for (const entry of entries) {
    const from = entry.querySelector(".from-date").value;
    const to = entry.querySelector(".to-date").value;
    const dest = entry.querySelector(".destination").value;

    if (!from || !to || !dest) {
      alert("All travel fields are required");
      return;
    }

    const coPersonIds = entry._selectedCoPersons
      ? Array.from(entry._selectedCoPersons.keys())
      : [];

    travelDetails.push({
      from_date: from,
      to_date: to,
      destination: dest,
      co_persons: coPersonIds
    });
  }

  const payload = {
    hr_mantra_id: empId,
    dept,
    travel_details: travelDetails
  };

  try {
    showLoadingIndicator();
    const res = await fetch(`${BASE_URL}/settraveldetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("Travel details submitted successfully");
      location.reload();
    } else {
      alert(result.message || "Submission failed");
    }
  } catch (err) {
    alert("Something went wrong");
  } finally {
    hideLoadingIndicator();
  }
});

/* =========================
   LOADER
========================= */
function showLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "block";
}
function hideLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "none";
}