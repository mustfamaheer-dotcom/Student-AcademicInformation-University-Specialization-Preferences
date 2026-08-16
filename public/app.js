/**
 * Student Academic Information & University Preferences Form Application
 */

document.addEventListener('DOMContentLoaded', () => {

  // Deployed Google Apps Script Web App URL for Google Sheet (1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80)
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxC_L7iE8dRishH_WPC4QlgjxuOfKskb5_ygFct29Z1EdrG6MM2z3-K_z7sYSJZ5VPI/exec';

  // DOM Elements
  const surveyForm = document.getElementById('surveyForm');
  const stepPanels = document.querySelectorAll('.step-panel');
  const stepItems = document.querySelectorAll('.step-item');
  const progressFill = document.getElementById('progressFill');
  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const printSummaryBtn = document.getElementById('printSummaryBtn');
  
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  
  const draftStatus = document.getElementById('draftText');
  
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const toastContainer = document.getElementById('toastContainer');

  let currentStep = 1;
  const totalSteps = 3;

  // Initialize Web App Config URL
  const savedGasUrl = localStorage.getItem('survey_gas_url') || DEFAULT_GAS_URL;

  // Theme Management
  const currentTheme = localStorage.getItem('survey_theme') || 'light';
  applyTheme(currentTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(activeTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('survey_theme', theme);
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
      themeLabel.textContent = 'المظهر الفاتح';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeLabel.textContent = 'المظهر الداكن';
    }
  }

  // Radio Card Selection Styling Helper
  document.querySelectorAll('.radio-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const name = e.target.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.radio-card')?.classList.remove('selected');
      });
      if (e.target.checked) {
        e.target.closest('.radio-card')?.classList.add('selected');
      }
      clearFieldError(e.target.closest('.form-group'));
      triggerAutoSave();
    });
  });

  // Auto-Save Draft to LocalStorage
  function triggerAutoSave() {
    const formData = new FormData(surveyForm);
    const dataObj = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });
    localStorage.setItem('survey_draft_data', JSON.stringify(dataObj));
    if (draftStatus) {
      draftStatus.textContent = 'تم حفظ المسودة';
      setTimeout(() => {
        if (draftStatus) draftStatus.textContent = 'جاري الحفظ التلقائي...';
      }, 2000);
    }
  }

  // Load Saved Draft
  function loadDraft() {
    const saved = localStorage.getItem('survey_draft_data');
    if (!saved) return;
    try {
      const dataObj = JSON.parse(saved);
      Object.keys(dataObj).forEach(key => {
        const field = surveyForm.elements[key];
        if (field) {
          if (field instanceof NodeList || field.length > 1) {
            Array.from(field).forEach(radio => {
              if (radio.value === dataObj[key]) {
                radio.checked = true;
                radio.closest('.radio-card')?.classList.add('selected');
              }
            });
          } else {
            field.value = dataObj[key];
          }
        }
      });
    } catch (e) {
      console.error('Error loading draft data', e);
    }
  }
  loadDraft();

  // Field Level Validation Rules
  function validateGroup(group) {
    const inputs = group.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (input.type === 'radio') {
        const name = input.name;
        const checked = surveyForm.querySelector(`input[name="${name}"]:checked`);
        if (input.hasAttribute('required') && !checked) {
          isValid = false;
        }
      } else if (input.hasAttribute('required')) {
        const val = input.value.trim();
        if (!val) {
          isValid = false;
        } else if (input.id === 'nationalId' && !/^\d{14}$/.test(val)) {
          isValid = false;
        } else if (input.id === 'phone' && !/^01\d{9}$/.test(val)) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      group.classList.add('has-error');
      inputs.forEach(i => i.classList.add('is-invalid'));
    } else {
      clearFieldError(group);
    }

    return isValid;
  }

  function clearFieldError(group) {
    if (!group) return;
    group.classList.remove('has-error');
    group.querySelectorAll('.form-control').forEach(i => i.classList.remove('is-invalid'));
  }

  // Real-time Input Clearing on Typing
  surveyForm.querySelectorAll('.form-control').forEach(control => {
    control.addEventListener('input', (e) => {
      const group = e.target.closest('.form-group');
      if (group) clearFieldError(group);
      triggerAutoSave();
    });
  });

  // Restrict Numeric Fields (National ID, Phone, Seat Number) to Digits Only
  ['nationalId', 'phone', 'seatNumber'].forEach(fieldId => {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      // Normalize Arabic-Indic digits (٠-٩) to ASCII digits (0-9)
      let val = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
      // Remove any non-digit character
      val = val.replace(/\D/g, '');
      e.target.value = val;
    });
  });

  // Step Validation Check
  function validateCurrentStep(step) {
    const stepPanel = document.getElementById(`step${step}`);
    if (!stepPanel) return true;

    const formGroups = stepPanel.querySelectorAll('.form-group');
    let stepValid = true;

    formGroups.forEach(group => {
      if (!validateGroup(group)) {
        stepValid = false;
      }
    });

    if (!stepValid) {
      showToast('يرجى التأكد من استكمال كافة الحقول المطلوبة بشكل صحيح', 'error');
    }

    return stepValid;
  }

  // Navigation Logic
  function goToStep(targetStep) {
    if (targetStep < 1 || targetStep > totalSteps) return;

    stepPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`step${targetStep}`)?.classList.add('active');

    stepItems.forEach(item => {
      const stepNum = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active', 'completed');
      if (stepNum === targetStep) {
        item.classList.add('active');
      } else if (stepNum < targetStep) {
        item.classList.add('completed');
      }
    });

    // Update Progress Line Fill Percentage
    const fillPercent = ((targetStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${fillPercent}%`;

    currentStep = targetStep;

    // Update Control Buttons Visibility
    prevBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';

    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
      printSummaryBtn.style.display = 'inline-flex';
      renderReviewSummary();
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
      printSummaryBtn.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextBtn?.addEventListener('click', () => {
    if (validateCurrentStep(currentStep)) {
      goToStep(currentStep + 1);
    }
  });

  prevBtn?.addEventListener('click', () => {
    goToStep(currentStep - 1);
  });

  // Step item header click directly
  stepItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = parseInt(item.getAttribute('data-step'), 10);
      if (target < currentStep) {
        goToStep(target);
      } else if (target > currentStep) {
        if (validateCurrentStep(currentStep)) {
          goToStep(target);
        }
      }
    });
  });

  // Render Step 3 Review Data
  function renderReviewSummary() {
    const formData = new FormData(surveyForm);
    const data = Object.fromEntries(formData.entries());

    const academicGrid = document.getElementById('reviewAcademicGrid');
    const prefTableBody = document.getElementById('reviewPrefTableBody');

    if (academicGrid) {
      academicGrid.innerHTML = `
        <div class="review-item"><span class="review-key">الاسم رباعي:</span><span class="review-val">${escapeHtml(data.fullName || '-')}</span></div>
        <div class="review-item"><span class="review-key">الرقم القومي:</span><span class="review-val">${escapeHtml(data.nationalId || '-')}</span></div>
        <div class="review-item"><span class="review-key">رقم التليفون:</span><span class="review-val">${escapeHtml(data.phone || '-')}</span></div>
        <div class="review-item"><span class="review-key">رقم الجلوس:</span><span class="review-val">${escapeHtml(data.seatNumber || '-')}</span></div>
        <div class="review-item"><span class="review-key">التخصص:</span><span class="review-val">${escapeHtml(data.specialization || '-')}</span></div>
        <div class="review-item"><span class="review-key">هل تم التقديم للجامعة:</span><span class="review-val">${escapeHtml(data.appliedToUniversity || '-')}</span></div>
        <div class="review-item"><span class="review-key">المجموع قبل المعامل:</span><span class="review-val">${escapeHtml(data.scoreBefore || '-')}</span></div>
        <div class="review-item"><span class="review-key">المجموع بعد المعامل:</span><span class="review-val">${escapeHtml(data.scoreAfter || '-')}</span></div>
        <div class="review-item"><span class="review-key">GPA:</span><span class="review-val">${escapeHtml(data.gpa || '-')}</span></div>
        <div class="review-item"><span class="review-key">المحافظة:</span><span class="review-val">${escapeHtml(data.governorate || '-')}</span></div>
        <div class="review-item full-width"><span class="review-key">المدرسة:</span><span class="review-val">${escapeHtml(data.school || '-')}</span></div>
      `;
    }

    if (prefTableBody) {
      let tableRows = '';
      for (let i = 1; i <= 7; i++) {
        const uni = data[`pref${i}_university`] || '-';
        const spec = data[`pref${i}_specialization`] || '-';
        tableRows += `
          <tr>
            <td><strong>الرغبة ${i}</strong></td>
            <td>${escapeHtml(uni)}</td>
            <td>${escapeHtml(spec)}</td>
          </tr>
        `;
      }
      prefTableBody.innerHTML = tableRows;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Print button
  printSummaryBtn?.addEventListener('click', () => {
    window.print();
  });

  // Form Submission Handler
  surveyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCurrentStep(currentStep)) return;

    const targetUrl = savedGasUrl;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> جاري الإرسال...`;

    const formData = new FormData(surveyForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      // POST payload to Google Apps Script
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors', // Standard cross-origin posting to Google Apps Script
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Clear draft storage on successful submission
      localStorage.removeItem('survey_draft_data');

      // Show success modal
      successModal.classList.add('active');
      showToast('تم إرسال كافة البيانات بنجاح إلى جوجل شيت!', 'success');

    } catch (err) {
      console.error('Submission Error:', err);
      showToast('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى أو التحقق من الاتصال.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>تأكيد وإرسال الاستمارة</span>`;
    }
  });

  closeModalBtn?.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  // Toast Helper
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Security: Lock Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Security: Disable DevTools & View Source Keyboard Shortcuts (F12, Ctrl+U, Ctrl+Shift+I, etc.)
  document.addEventListener('keydown', (e) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (
      e.key === 'I' || e.key === 'i' || e.keyCode === 73 ||
      e.key === 'J' || e.key === 'j' || e.keyCode === 74 ||
      e.key === 'C' || e.key === 'c' || e.keyCode === 67
    )) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
  });

});
