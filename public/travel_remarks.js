const BASE_URL = `http://192.168.1.60:4020/api/v1/tt`;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name") || "Unknown";
  const empId = urlParams.get("emp_id") || "N/A";
  const resId = urlParams.get("res_id") || "N/A";
  const expiresRaw = urlParams.get("expires");
  let expiresAt = expiresRaw ? new Date(decodeURIComponent(expiresRaw)).getTime() : null;

  document.getElementById("headerName").textContent = name;
  document.getElementById("headerEmpId").textContent = empId;

  const now = Date.now();

  // Expiry check
  if (expiresAt && now > expiresAt) {
    document.body.innerHTML = `
      <div style="text-align: center; margin-top: 50px;">
        <div style="display: inline-block; padding: 20px; border: 2px solid red; border-radius: 10px;">
          <h2 style="color: red;">This link has <strong>expired</strong>.</h2>
        </div>
      </div>
    `;
    return;
  }

  // Elements
  const travelYes = document.getElementById("travelYes");
  const travelNo = document.getElementById("travelNo");
  const remarksStar = document.getElementById("remarksStar");
  const submitBtn = document.querySelector("button[type='submit']");
  const form = document.getElementById("travelremarksForm");

  if (!travelYes || !travelNo || !remarksStar || !form) {
    console.error("One or more form elements not found in DOM.");
    return;
  }

  // Toggle star based on Yes/No
  function toggleRemarksStar() {
    remarksStar.style.display = travelNo.checked ? "inline" : "none";
  }
  travelYes.addEventListener("change", toggleRemarksStar);
  travelNo.addEventListener("change", toggleRemarksStar);
  toggleRemarksStar();

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const fromObj = Object.fromEntries(formData);

    if (!fromObj.didTravel) {
      alert("Please select whether the person traveled (Yes or No).");
      return;
    }

    if (fromObj.didTravel === "No" && (!fromObj.remarks || fromObj.remarks.trim() === "")) {
      alert("Remarks are required when the person did NOT travel.");
      document.getElementById("remarks").focus();
      return;
    }

    const payload = {
      did_travel: fromObj.didTravel,
      res_id: resId,
      remarks: fromObj.remarks || ""
    };

    try {
      showLoadingIndicator();
      submitBtn.disabled = true;

      const response = await fetch(`${BASE_URL}/settravelremarks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.status === 200) {
        alert("Travel remarks submitted successfully.");
        location.reload();
      } else {
        alert("Failed to submit: " + result.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong.");
    } finally {
      hideLoadingIndicator();
      submitBtn.disabled = false;
    }
  });
});

  // --------- Loading Indicator ---------
  function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = "none";
  }

  function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = "block";
  }