/**
 * Tanveer Ahmed - Admin CMS Controller
 * Allows Tanveer (who doesn't know code) to easily update all content,
 * upload new photos, edit experiences, degrees, skills, and manage backups.
 */

let currentData = null;

document.addEventListener("DOMContentLoaded", () => {
  initAuthGuard();
  initTabs();
  loadDataIntoForms();
  initPhotoUploader();
  initItemGenerators();
  initBackupRestore();
});

/**
 * Authentication Guard
 */
async function initAuthGuard() {
  const overlay = document.getElementById("admin-login-wall");
  const loginForm = document.getElementById("wall-login-form");
  const logoutBtn = document.getElementById("cms-logout-btn");

  try {
    const response = await fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) throw new Error("Please sign in to manage your portfolio.");
    sessionStorage.setItem("tanveer_admin_logged_in", "true");
    if (overlay) overlay.classList.add("hidden");
  } catch (error) {
    sessionStorage.removeItem("tanveer_admin_logged_in");
    if (overlay) overlay.classList.remove("hidden");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("wall-email").value;
      const pass = document.getElementById("wall-pass").value;

      try {
        if (await PortfolioStore.verifyAuth(email, pass)) {
          sessionStorage.setItem("tanveer_admin_logged_in", "true");
          if (overlay) overlay.classList.add("hidden");
          loadDataIntoForms();
          showAdminToast("Login successful! Welcome Tanveer.");
        } else {
          alert("Invalid email or password.");
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await PortfolioStore.logout();
      } catch (error) {
        alert(error.message);
        return;
      }
      sessionStorage.removeItem("tanveer_admin_logged_in");
      window.location.href = "index.html";
    });
  }
}

/**
 * Tab Navigation
 */
function initTabs() {
  const tabBtns = document.querySelectorAll(".admin-tab-btn");
  const panes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });
}

/**
 * Load Data into Forms
 */
function loadDataIntoForms() {
  currentData = PortfolioStore.getData();

  // Personal Info
  setVal("input-name", currentData.personal.name);
  setVal("input-title", currentData.personal.title);
  setVal("input-subtitle", currentData.personal.subTitle);
  setVal("input-location", currentData.personal.location);
  setVal("input-email", currentData.personal.email);
  setVal("input-phone-1", currentData.personal.phones && currentData.personal.phones[0] ? currentData.personal.phones[0] : "");
  setVal("input-phone-2", currentData.personal.phones && currentData.personal.phones[1] ? currentData.personal.phones[1] : "");
  setVal("input-whatsapp", currentData.personal.whatsapp || "");
  setVal("input-linkedin", currentData.personal.linkedin || "");
  setVal("input-facebook", currentData.personal.facebook || "");
  setVal("input-instagram", currentData.personal.instagram || "");
  setVal("input-bio", currentData.personal.bio);
  setVal("input-objective", currentData.personal.careerObjective);

  // Photo preview
  const previewImg = document.getElementById("admin-photo-preview");
  if (previewImg && currentData.personal.photo) {
    previewImg.src = currentData.personal.photo;
  }

  // Render Collections
  renderExperiencesList();
  renderEducationList();
  renderTrainingList();
  renderSkillsList();
  renderReferencesList();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/**
 * Photo Uploader (Base64 file reader)
 */
function initPhotoUploader() {
  const fileInput = document.getElementById("photo-file-input");
  const previewImg = document.getElementById("admin-photo-preview");
  const resetPhotoBtn = document.getElementById("btn-reset-photo");

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please choose a valid image file (JPG, PNG, WEBP).");
        return;
      }

      // Max 4MB for localStorage safety
      if (file.size > 4 * 1024 * 1024) {
        alert("Image is larger than 4MB. Please select a smaller photo for optimal web performance.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
          const maxDimension = 1200;
          const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext("2d");
          if (!context) {
            alert("Could not process this image. Please try another photo.");
            return;
          }
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const webp = canvas.toDataURL("image/webp", 0.82);
          const base64Url = webp.startsWith("data:image/webp")
            ? webp
            : canvas.toDataURL("image/jpeg", 0.82);
          currentData.personal.photo = base64Url;
          if (previewImg) previewImg.src = base64Url;
          markUnsaved();
          showAdminToast("Photo optimized. Click 'Save Changes' to publish it.");
        };
        image.onerror = () => alert("Could not process this image. Please try another photo.");
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (resetPhotoBtn) {
    resetPhotoBtn.addEventListener("click", () => {
      currentData.personal.photo = "assets/images/tanveer_avatar.jpg";
      if (previewImg) previewImg.src = "assets/images/tanveer_avatar.jpg";
      markUnsaved();
      showAdminToast("Photo reverted to default.");
    });
  }
}

/**
 * Work Experience Dynamic Editor
 */
function renderExperiencesList() {
  const container = document.getElementById("experience-editor-list");
  if (!container) return;

  container.innerHTML = (currentData.experiences || []).map((exp, idx) => `
    <div class="item-card" data-exp-index="${idx}">
      <div class="item-card-top">
        <span class="item-index-badge">Experience #${idx + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeExperience(${idx})">
          <i class="fas fa-trash-alt"></i> Remove
        </button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Designation / Role</label>
          <input type="text" class="admin-input exp-role-input" value="${escapeHtml(exp.role || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Company / Organization</label>
          <input type="text" class="admin-input exp-company-input" value="${escapeHtml(exp.company || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Duration (e.g. January 2025 – March 2025)</label>
          <input type="text" class="admin-input exp-period-input" value="${escapeHtml(exp.period || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Type (e.g. Internship / Full-time)</label>
          <input type="text" class="admin-input exp-type-input" value="${escapeHtml(exp.type || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-group">
        <label class="admin-label">Short Summary</label>
        <input type="text" class="admin-input exp-summary-input" value="${escapeHtml(exp.summary || '')}" oninput="markUnsaved()">
      </div>

      <div class="admin-form-group">
        <label class="admin-label">Key Duties & Achievements (One point per line)</label>
        <textarea class="admin-textarea exp-points-input" rows="4" oninput="markUnsaved()">${(exp.responsibilities || []).join("\n")}</textarea>
      </div>
    </div>
  `).join("");
}

window.removeExperience = function(index) {
  if (confirm("Are you sure you want to delete this experience entry?")) {
    currentData.experiences.splice(index, 1);
    renderExperiencesList();
    markUnsaved();
  }
};

/**
 * Education Dynamic Editor
 */
function renderEducationList() {
  const container = document.getElementById("education-editor-list");
  if (!container) return;

  container.innerHTML = (currentData.education || []).map((edu, idx) => `
    <div class="item-card" data-edu-index="${idx}">
      <div class="item-card-top">
        <span class="item-index-badge">Degree #${idx + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeEducation(${idx})">
          <i class="fas fa-trash-alt"></i> Remove
        </button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Degree Name</label>
          <input type="text" class="admin-input edu-degree-input" value="${escapeHtml(edu.degree || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Institution</label>
          <input type="text" class="admin-input edu-inst-input" value="${escapeHtml(edu.institution || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Department / Major</label>
          <input type="text" class="admin-input edu-dept-input" value="${escapeHtml(edu.department || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Period (e.g. Passing Year: 2025)</label>
          <input type="text" class="admin-input edu-period-input" value="${escapeHtml(edu.period || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Result / CGPA (e.g. CGPA 4.00 Out of 4.00)</label>
          <input type="text" class="admin-input edu-result-input" value="${escapeHtml(edu.result || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Highlight as Ongoing / Featured?</label>
          <select class="admin-select edu-featured-input" onchange="markUnsaved()">
            <option value="true" ${edu.isHighlighted ? 'selected' : ''}>Yes (Featured Highlight)</option>
            <option value="false" ${!edu.isHighlighted ? 'selected' : ''}>No (Standard)</option>
          </select>
        </div>
      </div>

      <div class="admin-form-group">
        <label class="admin-label">Details / Description</label>
        <textarea class="admin-textarea edu-details-input" rows="2" oninput="markUnsaved()">${escapeHtml(edu.details || '')}</textarea>
      </div>
    </div>
  `).join("");
}

window.removeEducation = function(index) {
  if (confirm("Delete this education entry?")) {
    currentData.education.splice(index, 1);
    renderEducationList();
    markUnsaved();
  }
};

/**
 * Training Dynamic Editor
 */
function renderTrainingList() {
  const container = document.getElementById("training-editor-list");
  if (!container) return;

  container.innerHTML = (currentData.training || []).map((tr, idx) => `
    <div class="item-card" data-train-index="${idx}">
      <div class="item-card-top">
        <span class="item-index-badge">Training Program #${idx + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeTraining(${idx})">
          <i class="fas fa-trash-alt"></i> Remove
        </button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Program Title</label>
          <input type="text" class="admin-input train-title-input" value="${escapeHtml(tr.title || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Duration (e.g. 6 Months Intensive)</label>
          <input type="text" class="admin-input train-duration-input" value="${escapeHtml(tr.duration || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-group">
        <label class="admin-label">Training Academy / Institute</label>
        <input type="text" class="admin-input train-inst-input" value="${escapeHtml(tr.institution || '')}" oninput="markUnsaved()">
      </div>

      <div class="admin-form-group">
        <label class="admin-label">Modules Covered (One item per line)</label>
        <textarea class="admin-textarea train-modules-input" rows="4" oninput="markUnsaved()">${(tr.modules || []).join("\n")}</textarea>
      </div>
    </div>
  `).join("");
}

window.removeTraining = function(index) {
  if (confirm("Delete this training entry?")) {
    currentData.training.splice(index, 1);
    renderTrainingList();
    markUnsaved();
  }
};

/**
 * Skills Dynamic Editor
 */
function renderSkillsList() {
  const container = document.getElementById("skills-editor-list");
  if (!container) return;

  container.innerHTML = (currentData.skills || []).map((skill, idx) => `
    <div class="item-card" style="padding: 0.85rem;" data-skill-index="${idx}">
      <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 0.5fr; gap: 0.75rem; align-items: center;">
        <input type="text" class="admin-input skill-name-input" value="${escapeHtml(skill.name || '')}" placeholder="Skill Name" oninput="markUnsaved()">
        <select class="admin-select skill-cat-input" onchange="markUnsaved()">
          <option value="merchandising" ${skill.category === 'merchandising' ? 'selected' : ''}>Apparel & Merchandising</option>
          <option value="supply_chain" ${skill.category === 'supply_chain' ? 'selected' : ''}>Supply Chain & ERP</option>
          <option value="tech" ${skill.category === 'tech' ? 'selected' : ''}>IT & Software</option>
          <option value="soft" ${skill.category === 'soft' ? 'selected' : ''}>Leadership</option>
        </select>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="number" class="admin-input skill-lvl-input" value="${skill.level || 85}" min="20" max="100" oninput="markUnsaved()">
          <span style="font-size: 0.8rem; color: #64748b;">%</span>
        </div>
        <button type="button" class="btn-remove-item" onclick="removeSkill(${idx})" style="padding: 0.45rem;">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.removeSkill = function(index) {
  currentData.skills.splice(index, 1);
  renderSkillsList();
  markUnsaved();
};

/**
 * References Dynamic Editor
 */
function renderReferencesList() {
  const container = document.getElementById("references-editor-list");
  if (!container) return;

  container.innerHTML = (currentData.references || []).map((ref, idx) => `
    <div class="item-card" data-ref-index="${idx}">
      <div class="item-card-top">
        <span class="item-index-badge">Reference #${idx + 1}</span>
        <button type="button" class="btn-remove-item" onclick="removeReference(${idx})">
          <i class="fas fa-trash-alt"></i> Remove
        </button>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Referee Full Name</label>
          <input type="text" class="admin-input ref-name-input" value="${escapeHtml(ref.name || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Official Designation</label>
          <input type="text" class="admin-input ref-title-input" value="${escapeHtml(ref.title || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Company / Institution</label>
          <input type="text" class="admin-input ref-company-input" value="${escapeHtml(ref.company || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Professional Relationship</label>
          <input type="text" class="admin-input ref-relation-input" value="${escapeHtml(ref.relation || '')}" oninput="markUnsaved()">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label class="admin-label">Email Address</label>
          <input type="email" class="admin-input ref-email-input" value="${escapeHtml(ref.email || '')}" oninput="markUnsaved()">
        </div>
        <div class="admin-form-group">
          <label class="admin-label">Phone Number</label>
          <input type="text" class="admin-input ref-phone-input" value="${escapeHtml(ref.phone || '')}" oninput="markUnsaved()">
        </div>
      </div>
    </div>
  `).join("");
}

window.removeReference = function(index) {
  if (confirm("Remove this professional reference?")) {
    currentData.references.splice(index, 1);
    renderReferencesList();
    markUnsaved();
  }
};

/**
 * Add New Item Buttons
 */
function initItemGenerators() {
  document.getElementById("btn-add-experience")?.addEventListener("click", () => {
    currentData.experiences.push({
      role: "New Role / Position",
      company: "Company Name",
      period: "2025 – Present",
      location: "Chattogram, Bangladesh",
      type: "Full-Time",
      summary: "Overview of responsibilities and impact.",
      responsibilities: ["Key achievement or responsibility 1", "Key achievement or responsibility 2"]
    });
    renderExperiencesList();
    markUnsaved();
  });

  document.getElementById("btn-add-education")?.addEventListener("click", () => {
    currentData.education.push({
      degree: "New Degree or Certification",
      institution: "Institution / Board",
      period: "Passing Year: 2026",
      result: "Grade: Pass",
      department: "Concentration / Subject",
      isHighlighted: false,
      details: "Academic description."
    });
    renderEducationList();
    markUnsaved();
  });

  document.getElementById("btn-add-training")?.addEventListener("click", () => {
    currentData.training.push({
      title: "New Training Course",
      duration: "3 Months",
      institution: "Training Academy",
      modules: ["Module 1", "Module 2"]
    });
    renderTrainingList();
    markUnsaved();
  });

  document.getElementById("btn-add-skill")?.addEventListener("click", () => {
    currentData.skills.push({
      name: "New Skill",
      category: "merchandising",
      level: 80
    });
    renderSkillsList();
    markUnsaved();
  });

  document.getElementById("btn-add-reference")?.addEventListener("click", () => {
    currentData.references.push({
      name: "Reference Name",
      title: "Designation",
      company: "Company Name",
      email: "ref@example.com",
      phone: "+880 1xxxxxxxxx",
      relation: "Professional Reference"
    });
    renderReferencesList();
    markUnsaved();
  });

  // Save changes button
  document.getElementById("btn-save-all")?.addEventListener("click", saveAllChanges);
}

/**
 * Save All Changes to PortfolioStore
 */
function saveAllChanges() {
  // 1. Gather Personal Info
  currentData.personal.name = getVal("input-name");
  currentData.personal.title = getVal("input-title");
  currentData.personal.subTitle = getVal("input-subtitle");
  currentData.personal.location = getVal("input-location");
  currentData.personal.email = getVal("input-email");
  currentData.personal.whatsapp = getVal("input-whatsapp");
  currentData.personal.linkedin = getVal("input-linkedin");
  currentData.personal.facebook = getVal("input-facebook");
  currentData.personal.instagram = getVal("input-instagram");
  currentData.personal.bio = getVal("input-bio");
  currentData.personal.careerObjective = getVal("input-objective");

  const p1 = getVal("input-phone-1");
  const p2 = getVal("input-phone-2");
  currentData.personal.phones = [p1, p2].filter(p => p.length > 0);

  // 2. Gather Experience Items
  const expCards = document.querySelectorAll("#experience-editor-list .item-card");
  currentData.experiences = Array.from(expCards).map(card => {
    const rawDuties = card.querySelector(".exp-points-input").value;
    return {
      role: card.querySelector(".exp-role-input").value.trim(),
      company: card.querySelector(".exp-company-input").value.trim(),
      period: card.querySelector(".exp-period-input").value.trim(),
      type: card.querySelector(".exp-type-input").value.trim(),
      summary: card.querySelector(".exp-summary-input").value.trim(),
      responsibilities: rawDuties.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    };
  });

  // 3. Gather Education Items
  const eduCards = document.querySelectorAll("#education-editor-list .item-card");
  currentData.education = Array.from(eduCards).map(card => {
    return {
      degree: card.querySelector(".edu-degree-input").value.trim(),
      institution: card.querySelector(".edu-inst-input").value.trim(),
      department: card.querySelector(".edu-dept-input").value.trim(),
      period: card.querySelector(".edu-period-input").value.trim(),
      result: card.querySelector(".edu-result-input").value.trim(),
      isHighlighted: card.querySelector(".edu-featured-input").value === "true",
      details: card.querySelector(".edu-details-input").value.trim()
    };
  });

  // 4. Gather Training Items
  const trainCards = document.querySelectorAll("#training-editor-list .item-card");
  currentData.training = Array.from(trainCards).map(card => {
    const rawMods = card.querySelector(".train-modules-input").value;
    return {
      title: card.querySelector(".train-title-input").value.trim(),
      duration: card.querySelector(".train-duration-input").value.trim(),
      institution: card.querySelector(".train-inst-input").value.trim(),
      modules: rawMods.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    };
  });

  // 5. Gather Skills
  const skillCards = document.querySelectorAll("#skills-editor-list .item-card");
  currentData.skills = Array.from(skillCards).map(card => {
    return {
      name: card.querySelector(".skill-name-input").value.trim(),
      category: card.querySelector(".skill-cat-input").value,
      level: parseInt(card.querySelector(".skill-lvl-input").value, 10) || 80
    };
  });

  // 6. Gather References
  const refCards = document.querySelectorAll("#references-editor-list .item-card");
  currentData.references = Array.from(refCards).map(card => {
    return {
      name: card.querySelector(".ref-name-input").value.trim(),
      title: card.querySelector(".ref-title-input").value.trim(),
      company: card.querySelector(".ref-company-input").value.trim(),
      relation: card.querySelector(".ref-relation-input").value.trim(),
      email: card.querySelector(".ref-email-input").value.trim(),
      phone: card.querySelector(".ref-phone-input").value.trim()
    };
  });

  // Save to PortfolioStore and sync globally
  PortfolioStore.saveGlobalData(currentData).then(result => {
    markSaved();
    showAdminToast(result.message || "Portfolio updated.");
  }).catch(error => {
    showAdminToast(`Save failed: ${error.message}`);
  });
}

function markUnsaved() {
  const indicator = document.getElementById("save-indicator");
  const text = document.getElementById("save-text");
  if (indicator) indicator.style.background = "#d97706";
  if (text) text.textContent = "Unsaved changes...";
}

function markSaved() {
  const indicator = document.getElementById("save-indicator");
  const text = document.getElementById("save-text");
  if (indicator) indicator.style.background = "#059669";
  if (text) {
    const now = new Date();
    text.textContent = `All changes saved at ${now.toLocaleTimeString()}`;
  }
}

/**
 * Backup & Restore Handlers
 */
function initBackupRestore() {
  // Download Backup JSON
  document.getElementById("btn-download-backup")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `tanveer_portfolio_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showAdminToast("Backup JSON file downloaded successfully!");
  });

  // Restore Backup JSON
  const restoreInput = document.getElementById("restore-file-input");
  if (restoreInput) {
    restoreInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.personal && parsed.education) {
            await PortfolioStore.saveGlobalData(parsed);
            loadDataIntoForms();
            showAdminToast("Portfolio backup restored and published.");
          } else {
            alert("Invalid backup file structure.");
          }
        } catch (err) {
          alert(`Could not restore backup: ${err.message}`);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to original CV data
  document.getElementById("btn-reset-original")?.addEventListener("click", async () => {
    if (confirm("Reset everything to original CV data? Any custom edits you made will be overwritten with initial CV details.")) {
      try {
        const defaults = window.DEFAULT_PORTFOLIO_DATA;
        await PortfolioStore.saveGlobalData(defaults);
        loadDataIntoForms();
        showAdminToast("Reset to authentic CV defaults complete.");
      } catch (error) {
        alert(`Could not reset portfolio: ${error.message}`);
      }
    }
  });
}

/**
 * Toast helper for Admin
 */
function showAdminToast(msg) {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 30px;
      background: #0f172a;
      color: #fff;
      padding: 0.85rem 1.4rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> <span>${msg}</span>`;
  toast.style.display = "flex";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
