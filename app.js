/**
 * سیستم خبره انتخاب بذر کاشت
 * Seed Selection Expert System
 * 
 * استفاده از معماری سیستم‌های خبره:
 * - پایگاه دانش (Knowledge Base)
 * - موتور استنتاج (Inference Engine)
 * - رابط کاربری (User Interface)
 */

let knowledgeBase = null;
let engine = null;
let uiManager = null;
let currentPage = 'home';
let notificationTimeout = null;
let lastFormData = null;  // ذخیره آخرین داده‌های فرم

/**
 * ابتدایی‌سازی برنامه
 */
async function initializeApp() {
  try {
    // بارگذاری پایگاه دانش
    knowledgeBase = await loadKnowledgeBase();
    
    if (!knowledgeBase) {
      showError('خطا: نمی‌توان پایگاه دانش را بارگذاری کرد');
      return;
    }

    // ایجاد موتور استنتاج
    engine = new InferenceEngine(knowledgeBase);
    
    // ایجاد مدیر رابط کاربری
    uiManager = new UIManager(knowledgeBase, engine);

    // نمایش صفحه خانه
    showHomePage();

    // اتصال رویدادهای صفحه
    setupEventListeners();

    console.log('✅ برنامه با موفقیت شروع شد');
  } catch (error) {
    console.error('❌ خطا در ابتدایی‌سازی:', error);
    showError('خطا در بارگذاری برنامه');
  }
}

/**
 * بارگذاری پایگاه دانش
 */
async function loadKnowledgeBase() {
  try {
    // بارگذاری فایل‌های JSON
    const knowledgeFile = await fetch('data/knowledge.json').then(r => r.json());
    const seedTypes = await fetch('data/seed-types.json').then(r => r.json());
    const provinces = await fetch('data/provinces.json').then(r => r.json());

    // ترکیب تمام داده‌های پایگاه دانش
    // توجه: knowledge.json دارای ساختار { knowledge: {...} } است
    return {
      knowledge: knowledgeFile.knowledge || knowledgeFile,
      seedTypes: seedTypes.seedTypes || [],
      provinces: provinces.provinces || []
    };
  } catch (error) {
    console.error('خطا در بارگذاری پایگاه دانش:', error);
    return null;
  }
}

/**
 * اتصال رویدادهای صفحه
 */
function setupEventListeners() {
  // دکمه‌های ناوبری
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // توجه: رویدادهای analyzeBtn و clearBtn در setupAnalysisListeners تنظیم می‌شوند
  // برای جلوگیری از multiple listeners
}

/**
 * ناوبری بین صفحات
 */
function navigateTo(page) {
  currentPage = page;
  const mainContent = document.getElementById('mainContent');

  switch (page) {
    case 'analyzer':
      mainContent.innerHTML = uiManager.renderInputForm();
      setupAnalysisListeners();
      // restore داده‌های فرم اگر وجود داشته باشد
      if (lastFormData) {
        restoreFormData(lastFormData);
      }
      break;
    case 'info':
      mainContent.innerHTML = uiManager.renderInfoPage();
      break;
    case 'history':
      mainContent.innerHTML = uiManager.renderHistory();
      break;
    case 'home':
    default:
      showHomePage();
  }

  // تحدیث دکمه‌های ناوبری
  updateNavButtons(page);
}

/**
 * نمایش صفحه خانه
 */
function showHomePage() {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = `
    <div class="home-container">
      <div class="welcome-section">
        <h2>خوش‌آمدید به سیستم خبره انتخاب بذر</h2>
        <p>این سیستم به کشاورزان کمک می‌کند تا بذر مناسب را برای شرایط محلی خود انتخاب کنند.</p>
      </div>

      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>تجزیه و تحلیل دقیق</h3>
          <p>با استفاده از دانش متخصصین کشاورزی</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>نمره‌دهی جامع</h3>
          <p>بر اساس معیارهای علمی و تجربی</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💡</div>
          <h3>توصیه‌های عملی</h3>
          <p>راهنمایی‌های گام‌به‌گام برای موفقیت</p>
        </div>
      </div>

      <div class="action-section">
        <button class="btn btn-primary btn-large" onclick="navigateTo('analyzer')">
          شروع تجزیه و تحلیل
        </button>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-number">${knowledgeBase?.seedTypes?.length || 0}+</div>
          <div class="stat-label">نوع بذر</div>
        </div>
        <div class="stat">
          <div class="stat-number">${knowledgeBase?.knowledge?.ruleBasedKnowledge?.rules?.length || 0}+</div>
          <div class="stat-label">قاعده منطقی</div>
        </div>
        <div class="stat">
          <div class="stat-number">${knowledgeBase?.provinces?.length || 0}</div>
          <div class="stat-label">استان ایران</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * تنظیم رویدادهای صفحه تحلیل
 */
function setupAnalysisListeners() {
  // حذف event listeners قدیمی و ایجاد جدید
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (analyzeBtn) {
    // Clone و جایگزینی برای حذف listeners قدیمی
    const newAnalyzeBtn = analyzeBtn.cloneNode(true);
    analyzeBtn.parentNode.replaceChild(newAnalyzeBtn, analyzeBtn);
    newAnalyzeBtn.addEventListener('click', handleAnalysis);
  }

  if (clearBtn) {
    // Clone و جایگزینی برای حذف listeners قدیمی
    const newClearBtn = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
    newClearBtn.addEventListener('click', handleClear);
  }

  console.log('✅ Analysis listeners تنظیم شدند');
}

/**
 * مدیریت تجزیه و تحلیل
 */
function handleAnalysis() {
  const input = getFormData();
  
  // چاپ debugging
  console.log('فرم داده‌ها:', input);
  
  // اعتبار سنجی
  const validation = Utils.validateInput(input);
  console.log('نتیجه validation:', validation);
  
  if (!validation.isValid) {
    // ایجاد پیام خطای واضح‌تر
    let errorMessage = '❌ خطاهای زیر را رفع کنید:\n\n';
    
    if (validation.errors.length === 0) {
      errorMessage += 'خطای نامشخص در validation\n\nلطفا دوباره سعی کنید';
      console.error('خطای نامشخص:', { input, validation });
    } else {
      errorMessage += validation.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
    }
    
    showError(errorMessage);
    return;
  }
  
  console.log('✅ Validation موفق! شروع تحلیل...');
  
  // ذخیره داده‌های فرم برای بازگشت بعدی
  lastFormData = { ...input };

  // تبدیل اعداد فارسی به انگلیسی اگر لازم باشد
  const processedInput = {
    seedType: input.seedType,
    germinationRate: input.germinationRate !== '' ? parseFloat(Utils.persianToEnglish(input.germinationRate.toString())) : 0,
    moisture: input.moisture !== '' ? parseFloat(Utils.persianToEnglish(input.moisture.toString())) : 0,
    purity: input.purity !== '' ? parseFloat(Utils.persianToEnglish(input.purity.toString())) : 0,
    diseaseResistance: input.diseaseResistance,
    season: input.season,
    province: input.province,
    temperature: input.temperature !== '' ? parseFloat(Utils.persianToEnglish(input.temperature.toString())) : 0,
    rainfall: input.rainfall !== '' ? parseFloat(Utils.persianToEnglish(input.rainfall.toString())) : 0,
    soilType: input.soilType
  };

  // اجرای موتور استنتاج
  const result = engine.inferenceForward(processedInput);

  // ذخیره نتیجه
  Utils.saveAnalysisResult(result);

  // نمایش نتایج
  displayResults(result);
}

/**
 * دریافت داده‌های فرم
 */
function getFormData() {
  const data = {
    seedType: (document.getElementById('seedType')?.value || '').toString().trim(),
    germinationRate: (document.getElementById('germinationRate')?.value || '').toString().trim(),
    moisture: (document.getElementById('moisture')?.value || '').toString().trim(),
    purity: (document.getElementById('purity')?.value || '').toString().trim(),
    diseaseResistance: (document.getElementById('diseaseResistance')?.value || '').toString().trim(),
    season: (document.getElementById('season')?.value || '').toString().trim(),
    province: (document.getElementById('province')?.value || '').toString().trim(),
    temperature: (document.getElementById('temperature')?.value || '').toString().trim(),
    rainfall: (document.getElementById('rainfall')?.value || '').toString().trim(),
    soilType: (document.getElementById('soilType')?.value || '').toString().trim()
  };
  
  console.log('داده‌های خام فرم:', data);
  return data;
}

/**
 * بازیابی داده‌های فرم
 */
function restoreFormData(data) {
  if (!data) return;
  
  const fieldIds = [
    'seedType', 'germinationRate', 'moisture', 'purity',
    'diseaseResistance', 'season', 'province', 'temperature',
    'rainfall', 'soilType'
  ];

  fieldIds.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field && data[fieldId]) {
      field.value = data[fieldId];
    }
  });

  console.log('✅ داده‌های فرم بازیابی شدند');
}

/**
 * نمایش نتایج
 */
function displayResults(result) {
  // پاک کردن پیام اخطار/خطای قبلی
  clearNotification();

  const mainContent = document.getElementById('mainContent');
  
  // ایجاد یک wrapper برای نتایج
  const resultsWrapper = document.createElement('div');
  resultsWrapper.innerHTML = uiManager.renderResults(result);
  
  // حذف تمام محتوای قبلی
  mainContent.innerHTML = '';
  
  // اضافه کردن نتایج
  mainContent.appendChild(resultsWrapper.firstElementChild);

  // تأخیر کوچک برای اطمینان از DOM update
  setTimeout(() => {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        navigateTo('analyzer');
      });
    }
  }, 100);
}

/**
 * حذف داده‌های فرم
 */
function handleClear() {
  const formFields = [
    'seedType', 'germinationRate', 'moisture', 'purity',
    'diseaseResistance', 'season', 'province', 'temperature',
    'rainfall', 'soilType'
  ];

  formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = '';
    }
  });

  showSuccess('فرم پاک شد');
}

/**
 * به روز رسانی دکمه‌های ناوبری
 */
function updateNavButtons(page) {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-page') === page) {
      btn.classList.add('active');
    }
  });
}

/**
 * پاک کردن پیام اخطار
 */
function clearNotification() {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  const notification = document.getElementById('notification');
  if (notification) {
    notification.style.display = 'none';
  }
}

/**
 * نمایش پیام خطا
 */
function showError(message) {
  clearNotification();
  const notification = document.getElementById('notification') || createNotification();
  // استفاده از innerHTML برای نمایش line breaks
  notification.innerHTML = message.split('\n').map(line => line || '<br>').join('<br>');
  notification.className = 'notification error';
  notification.style.display = 'block';
  notification.style.whiteSpace = 'pre-wrap';
  notification.style.textAlign = 'right';
  notificationTimeout = setTimeout(() => {
    notification.style.display = 'none';
    notificationTimeout = null;
  }, 7000); // زمان بیشتر برای خواندن خطاهای متعدد
}

/**
 * نمایش پیام موفقیت
 */
function showSuccess(message) {
  clearNotification();
  const notification = document.getElementById('notification') || createNotification();
  notification.textContent = message;
  notification.className = 'notification success';
  notification.style.display = 'block';
  notificationTimeout = setTimeout(() => {
    notification.style.display = 'none';
    notificationTimeout = null;
  }, 3000);
}

/**
 * ایجاد عنصر اطلاع‌رسانی
 */
function createNotification() {
  const notification = document.createElement('div');
  notification.id = 'notification';
  document.body.appendChild(notification);
  return notification;
}

/**
 * بارگذاری برنامه هنگام آماده شدن DOM
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}