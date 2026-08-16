# استمارة البيانات الأكاديمية ورغبات الجامعة 🎓

تطبيق ويب حديث ومتجاوب لجمع البيانات الشخصية والأكاديمية للطلاب وتسجيل رغباتهم الجامعية (7 رغبات) وحفظها مباشرة في **Google Sheets**.

---

## 🌟 المميزات الرئيسية (Key Features)

1. **تصميم عصري وجذاب (Modern & Premium UI)**:
   - دعم كامل للغة العربية والاتجاه من اليمين إلى اليسار (RTL).
   - واجهة مكونة من 3 خطوات متتابعة (Multi-Step Form Wizard):
     1. البيانات الشخصية والأكاديمية.
     2. الرغبات الجامعية (من الرغبة 1 إلى 7).
     3. المراجعة وتأكيد البيانات.
   - دعم الوضع الداكن والفاتح (Dark/Light Theme Toggle).
   - حفظ تلقائي للمسودة في المتصفح (Local Draft Auto-Save).
   - مراجعة وطباعة الاستمارة قبل أو بعد الإرسال (`window.print`).

2. **الحقول المشمولة في الاستمارة (Form Fields)**:
   - **البيانات الشخصية والأكاديمية**:
     - الإسم رباعي ***
     - الرقم القومي (14 رقم) ***
     - رقم التليفون (الطالب - 11 رقم) ***
     - رقم الجلوس ***
     - التخصص (علمي علوم / علمي رياضة) ***
     - هل تم التقديم للجامعة ؟ (نعم / لا) ***
     - المجموع قبل المعامل ***
     - المجموع بعد المعامل ***
     - GPA ***
     - المحافظة ***
     - المدرسة ***
   - **الرغبات الجامعية (من 1 إلى 7)**:
     - اسم الجامعة (الرغبة 1 إلى 7) ***
     - التخصص (الرغبة 1 إلى 7) ***

3. **الربط المباشر مع Google Sheets**:
   - يتم إرسال كافة البيانات فور الضغط على إرسال وتخزينها في صفحة Google Sheet المحددة:
   - **رابط الجدول**: [https://docs.google.com/spreadsheets/d/1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80/edit](https://docs.google.com/spreadsheets/d/1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80/edit)

---

## ⚙️ طريقة إعداد Google Apps Script (خطوة بخطوة)

1. افتح جدول البيانات الخاص بك على Google Sheets:
   `https://docs.google.com/spreadsheets/d/1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80/edit`
2. من القائمة العلوية، اختر **الإضافات (Extensions)** $\rightarrow$ **Apps Script**.
3. انسخ جميع المحتويات الموجودة داخل ملف `google-apps-script.gs` والصقها داخل ملف `Code.gs` في محرّر السكربت.
4. اضغط على زر **نشر (Deploy)** في الأعلى ثم اختر **نشر جديد (New deployment)**.
5. اختر نوع التثبيت: **تطبيق ويب (Web app)**.
6. اضغط على الإعدادات وضبط ما يلي:
   - **تنفيذ كـ (Execute as)**: أنا (`Me`).
   - **من يملك إمكانية الوصول (Who has access)**: أي شخص (`Anyone`).
7. اضغط على **نشر (Deploy)** ووافق على الصلاحيات المطلوبة (Authorize access).
8. **رابط تطبيق الويب المفعّل حالياً (Active Web App Endpoint)**:
   `https://script.google.com/macros/s/AKfycbxC_L7iE8dRishH_WPC4QlgjxuOfKskb5_ygFct29Z1EdrG6MM2z3-K_z7sYSJZ5VPI/exec`

---

## 🚀 التشغيل المحلي (Local Run)

يمكنك فتح ملف `index.html` في أي متصفح مباشرة، أو تشغيله عبر سيرفر محلي:

```bash
npx http-server ./
```

---

## 📤 رفع المشروع على GitHub (Push to GitHub)

تم ربط المشروع ورفعه على المستودع التالي:
`https://github.com/mustfamaheer-dotcom/Student-AcademicInformation-University-Specialization-Preferences.git`

لاعادة الرفع في أي وقت:
```bash
git add .
git commit -m "Update student survey application"
git push origin main
```
