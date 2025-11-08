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
    uiManager = new UIManager(knowledgeBase.seedTypes || [], engine);

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
    const knowledge = await fetch('data/knowledge.json').then(r => r.json());
    const seedTypes = await fetch('data/seed-types.json').then(r => r.json());
    const provinces = await fetch('data/provinces.json').then(r => r.json());

    return {
      knowledge: knowledge,
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

  // سازی شناور رویدادهای رویدادهای صفحه اصلی
  document.addEventListener('click', (e) => {
    if (e.target.id === 'analyzeBtn') {
      handleAnalysis();
    }
    if (e.target.id === 'clearBtn') {
      handleClear();
    }
    if (e.target.id === 'backBtn') {
      navigateTo('home');
    }
  });
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
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalysis);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }
}

/**
 * مدیریت تجزیه و تحلیل
 */
function handleAnalysis() {
  const input = getFormData();
  
  // اعتبار سنجی
  const validation = Utils.validateInput(input);
  if (!validation.isValid) {
    showError(validation.errors.join('\n'));
    return;
  }

  // تبدیل اعداد فارسی به انگلیسی اگر لازم باشد
  const processedInput = {
    seedType: input.seedType,
    germinationRate: input.germinationRate ? parseFloat(Utils.persianToEnglish(input.germinationRate.toString())) : undefined,
    moisture: input.moisture ? parseFloat(Utils.persianToEnglish(input.moisture.toString())) : undefined,
    purity: input.purity ? parseFloat(Utils.persianToEnglish(input.purity.toString())) : undefined,
    diseaseResistance: input.diseaseResistance,
    season: input.season,
    province: input.province,
    temperature: input.temperature ? parseFloat(Utils.persianToEnglish(input.temperature.toString())) : undefined,
    rainfall: input.rainfall ? parseFloat(Utils.persianToEnglish(input.rainfall.toString())) : undefined,
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
  return {
    seedType: document.getElementById('seedType')?.value || '',
    germinationRate: document.getElementById('germinationRate')?.value || '',
    moisture: document.getElementById('moisture')?.value || '',
    purity: document.getElementById('purity')?.value || '',
    diseaseResistance: document.getElementById('diseaseResistance')?.value || '',
    season: document.getElementById('season')?.value || '',
    province: document.getElementById('province')?.value || '',
    temperature: document.getElementById('temperature')?.value || '',
    rainfall: document.getElementById('rainfall')?.value || '',
    soilType: document.getElementById('soilType')?.value || ''
  };
}

/**
 * نمایش نتایج
 */
function displayResults(result) {
  const mainContent = document.getElementById('mainContent');
  mainContent.innerHTML = uiManager.renderResults(result);

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo('analyzer'));
  }
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
 * نمایش پیام خطا
 */
function showError(message) {
  const notification = document.getElementById('notification') || createNotification();
  notification.textContent = message;
  notification.className = 'notification error';
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

/**
 * نمایش پیام موفقیت
 */
function showSuccess(message) {
  const notification = document.getElementById('notification') || createNotification();
  notification.textContent = message;
  notification.className = 'notification success';
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
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