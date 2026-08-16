/**
 * Student Academic Information & University Preferences Form Application
 */

document.addEventListener('DOMContentLoaded', () => {

  // Deployed Google Apps Script Web App URL for Google Sheet (1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80)
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxC_L7iE8dRishH_WPC4QlgjxuOfKskb5_ygFct29Z1EdrG6MM2z3-K_z7sYSJZ5VPI/exec';

  // Storage Keys
  const DEVICE_SUBMITTED_KEY = 'survey_device_submitted';

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
  const deviceBlockedCard = document.getElementById('deviceBlockedCard');
  const nationalIdInput = document.getElementById('nationalId');
  const phoneInput = document.getElementById('phone');
  
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const toastContainer = document.getElementById('toastContainer');

  let currentStep = 1;
  const totalSteps = 3;

  // Initialize Web App Config URL
  const savedGasUrl = localStorage.getItem('survey_gas_url') || DEFAULT_GAS_URL;

  // ==================== Device Lock Enforcement ====================
  function isDeviceSubmitted() {
    const isLocal = localStorage.getItem(DEVICE_SUBMITTED_KEY) === 'true';
    const isCookie = document.cookie.split('; ').some(row => row.startsWith(DEVICE_SUBMITTED_KEY + '=true'));
    return isLocal || isCookie;
  }

  function markDeviceSubmitted() {
    localStorage.setItem(DEVICE_SUBMITTED_KEY, 'true');
    const d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year cookie
    document.cookie = `${DEVICE_SUBMITTED_KEY}=true; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
    applyDeviceLock();
  }

  function applyDeviceLock() {
    if (deviceBlockedCard) {
      deviceBlockedCard.style.display = 'flex';
    }
    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.classList.add('device-locked');
    }

    // Disable form controls
    surveyForm?.querySelectorAll('input, select, textarea, button').forEach(el => {
      el.disabled = true;
    });

    if (nextBtn) nextBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    if (draftStatus) {
      draftStatus.textContent = 'التقديم مغلق - تم الإرسال من هذا الجهاز مسبقاً';
    }
  }

  // Developer tool to reset device submission lock for testing
  window.resetDeviceSubmission = function() {
    localStorage.removeItem(DEVICE_SUBMITTED_KEY);
    document.cookie = `${DEVICE_SUBMITTED_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    alert('تم إلغاء قفل الجهاز بنجاح. سيتم إعادة تحميل الصفحة.');
    location.reload();
  };

  // Run initial device lock check on load
  if (isDeviceSubmitted()) {
    applyDeviceLock();
    setTimeout(() => {
      showToast('عذراً، غير مسموح باستخدام الرابط أو إرسال الاستمارة أكثر من مرة من نفس الجهاز.', 'error');
    }, 500);
  }

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
      if (isDeviceSubmitted()) return;
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
    if (isDeviceSubmitted()) return;
    const formData = new FormData(surveyForm);
    const dataObj = {};
    formData.forEach((value, key) => {
      dataObj[key] = value;
    });
    localStorage.setItem('survey_draft_data', JSON.stringify(dataObj));
    if (draftStatus) {
      draftStatus.textContent = 'تم حفظ المسودة';
      setTimeout(() => {
        if (draftStatus && !isDeviceSubmitted()) draftStatus.textContent = 'جاري الحفظ التلقائي...';
      }, 2000);
    }
  }

  // Load Saved Draft
  function loadDraft() {
    if (isDeviceSubmitted()) return;
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
    if (group.querySelector('#nationalId')) {
      resetNationalIdErrorText();
    }
    if (group.querySelector('#phone')) {
      resetPhoneErrorText();
    }
  }

  function setNationalIdError(message) {
    if (!nationalIdInput) return;
    const group = nationalIdInput.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      const errEl = group.querySelector('.error-message');
      if (errEl) errEl.textContent = message;
    }
    nationalIdInput.classList.add('is-invalid');
  }

  function resetNationalIdErrorText() {
    if (!nationalIdInput) return;
    const group = nationalIdInput.closest('.form-group');
    if (group) {
      const errEl = group.querySelector('.error-message');
      if (errEl) errEl.textContent = 'يرجى إدخال الرقم القومي صحيحاً (14 رقم)';
    }
  }

  function setPhoneError(message) {
    if (!phoneInput) return;
    const group = phoneInput.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      const errEl = group.querySelector('.error-message');
      if (errEl) errEl.textContent = message;
    }
    phoneInput.classList.add('is-invalid');
  }

  function resetPhoneErrorText() {
    if (!phoneInput) return;
    const group = phoneInput.closest('.form-group');
    if (group) {
      const errEl = group.querySelector('.error-message');
      if (errEl) errEl.textContent = 'يرجى إدخال رقم تليفون صحيح مكون من 11 رقم';
    }
  }

  // Live duplicate check for National ID & Mobile Phone
  async function checkUserCredentials(idVal, phoneVal) {
    if (!idVal && !phoneVal) return { idExists: false, phoneExists: false };
    try {
      const queryParams = new URLSearchParams({
        action: 'checkUser',
        id: idVal || '',
        phone: phoneVal || ''
      });
      const res = await fetch(`${savedGasUrl}?${queryParams.toString()}`);
      const data = await res.json();
      return {
        idExists: data && data.idExists === true,
        phoneExists: data && data.phoneExists === true
      };
    } catch (err) {
      console.warn('Live user credentials check failed:', err);
      return { idExists: false, phoneExists: false };
    }
  }

  nationalIdInput?.addEventListener('blur', async () => {
    if (isDeviceSubmitted()) return;
    const val = nationalIdInput.value.trim();
    if (/^\d{14}$/.test(val)) {
      const { idExists } = await checkUserCredentials(val, '');
      if (idExists) {
        setNationalIdError('عذراً، غير مسموح بالاستخدام أكثر من مرة بنفس الرقم القومي.');
        showToast('الرقم القومي مدخل مسبقاً في النظام!', 'error');
      }
    }
  });

  phoneInput?.addEventListener('blur', async () => {
    if (isDeviceSubmitted()) return;
    const val = phoneInput.value.trim();
    if (/^01\d{9}$/.test(val)) {
      const { phoneExists } = await checkUserCredentials('', val);
      if (phoneExists) {
        setPhoneError('عذراً، غير مسموح بالاستخدام أكثر من مرة بنفس رقم التليفون.');
        showToast('رقم التليفون مدخل مسبقاً في النظام!', 'error');
      }
    }
  });

  // Real-time Input Clearing on Typing
  surveyForm.querySelectorAll('.form-control').forEach(control => {
    control.addEventListener('input', (e) => {
      if (isDeviceSubmitted()) return;
      const group = e.target.closest('.form-group');
      if (group) clearFieldError(group);
      triggerAutoSave();
    });
  });

  // Restrict Integer Numeric Fields (National ID, Phone, Seat Number) to Digits Only
  ['nationalId', 'phone', 'seatNumber'].forEach(fieldId => {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      if (isDeviceSubmitted()) return;
      // Normalize Arabic-Indic digits (٠-٩) to ASCII digits (0-9)
      let val = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
      // Remove any non-digit character
      val = val.replace(/\D/g, '');
      e.target.value = val;
    });
  });

  // Restrict Decimal Numeric Fields (Score Before, Score After, GPA) to Numbers and Decimal Point Only
  ['scoreBefore', 'scoreAfter', 'gpa'].forEach(fieldId => {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      if (isDeviceSubmitted()) return;
      // Normalize Arabic-Indic digits (٠-٩) to ASCII digits (0-9)
      let val = e.target.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
      // Remove any character that is not a digit or decimal point
      val = val.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = val.split('.');
      if (parts.length > 2) {
        val = parts[0] + '.' + parts.slice(1).join('');
      }
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

  nextBtn?.addEventListener('click', async () => {
    if (isDeviceSubmitted()) {
      showToast('عذراً، غير مسموح باستخدام الرابط أكثر من مرة من هذا الجهاز.', 'error');
      return;
    }

    if (currentStep === 1) {
      if (!validateCurrentStep(1)) return;

      const natVal = nationalIdInput ? nationalIdInput.value.trim() : '';
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';

      if ((natVal && /^\d{14}$/.test(natVal)) || (phoneVal && /^01\d{9}$/.test(phoneVal))) {
        nextBtn.disabled = true;
        const origContent = nextBtn.innerHTML;
        nextBtn.innerHTML = `<span class="spinner"></span> جاري التحقق...`;

        const { idExists, phoneExists } = await checkUserCredentials(natVal, phoneVal);
        nextBtn.disabled = false;
        nextBtn.innerHTML = origContent;

        let hasDup = false;
        if (idExists) {
          setNationalIdError('عذراً، غير مسموح بالاستخدام أو التسجيل أكثر من مرة بنفس الرقم القومي.');
          hasDup = true;
        }
        if (phoneExists) {
          setPhoneError('عذراً، غير مسموح بالاستخدام أو التسجيل أكثر من مرة بنفس رقم التليفون.');
          hasDup = true;
        }
        if (hasDup) {
          showToast('عذراً، البيانات المدخلة (الرقم القومي أو رقم التليفون) مسجلة مسبقاً!', 'error');
          return;
        }
      }
    }

    if (validateCurrentStep(currentStep)) {
      goToStep(currentStep + 1);
    }
  });

  prevBtn?.addEventListener('click', () => {
    goToStep(currentStep - 1);
  });

  // Step item header click directly
  stepItems.forEach(item => {
    item.addEventListener('click', async () => {
      if (isDeviceSubmitted()) return;
      const target = parseInt(item.getAttribute('data-step'), 10);
      if (target < currentStep) {
        goToStep(target);
      } else if (target > currentStep) {
        if (currentStep === 1) {
          const natVal = nationalIdInput ? nationalIdInput.value.trim() : '';
          const phoneVal = phoneInput ? phoneInput.value.trim() : '';
          if ((natVal && /^\d{14}$/.test(natVal)) || (phoneVal && /^01\d{9}$/.test(phoneVal))) {
            const { idExists, phoneExists } = await checkUserCredentials(natVal, phoneVal);
            if (idExists) {
              setNationalIdError('عذراً، غير مسموح بالاستخدام أو التسجيل أكثر من مرة بنفس الرقم القومي.');
            }
            if (phoneExists) {
              setPhoneError('عذراً، غير مسموح بالاستخدام أو التسجيل أكثر من مرة بنفس رقم التليفون.');
            }
            if (idExists || phoneExists) {
              showToast('عذراً، البيانات المدخلة مسجلة مسبقاً ولا يمكن تكرار الاستخدام!', 'error');
              return;
            }
          }
        }
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
        <div class="review-item"><span class="review-key">النسبة قبل المعامل:</span><span class="review-val">${escapeHtml(data.scoreBefore || '-')}</span></div>
        <div class="review-item"><span class="review-key">النسبة بعد المعامل:</span><span class="review-val">${escapeHtml(data.scoreAfter || '-')}</span></div>
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

    if (isDeviceSubmitted()) {
      showToast('عذراً، غير مسموح بالاستخدام أو التقديم أكثر من مرة واحدة!', 'error');
      applyDeviceLock();
      return;
    }

    if (!validateCurrentStep(currentStep)) return;

    const targetUrl = savedGasUrl;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> جاري الإرسال...`;

    const formData = new FormData(surveyForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      let resData = null;
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
        resData = await response.json();
      } catch (fetchErr) {
        console.warn('POST JSON parse fallback to no-cors:', fetchErr);
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      // Handle backend duplicate National ID or Phone Number rejection
      if (resData && resData.result === 'error') {
        if (resData.code === 'DUPLICATE_NATIONAL_ID') {
          goToStep(1);
          setNationalIdError(resData.message || 'عذراً، غير مسموح بالاستخدام أكثر من مرة بنفس الرقم القومي.');
          nationalIdInput?.focus();
          showToast(resData.message || 'الرقم القومي مدخل مسبقاً!', 'error');
          return;
        } else if (resData.code === 'DUPLICATE_PHONE') {
          goToStep(1);
          setPhoneError(resData.message || 'عذراً، غير مسموح بالاستخدام أكثر من مرة بنفس رقم التليفون.');
          phoneInput?.focus();
          showToast(resData.message || 'رقم التليفون مدخل مسبقاً!', 'error');
          return;
        }
      }

      // Clear draft storage on successful submission
      localStorage.removeItem('survey_draft_data');

      // Lock device permanently for future visits
      markDeviceSubmitted();

      // Show success modal
      successModal.classList.add('active');
      showToast('تم إرسال كافة البيانات بنجاح إلى جوجل شيت!', 'success');

    } catch (err) {
      console.error('Submission Error:', err);
      showToast('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى أو التحقق من الاتصال.', 'error');
    } finally {
      if (!isDeviceSubmitted()) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> <span>تأكيد وإرسال الاستمارة</span>`;
      }
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
