/**
 * مدیریت رابط کاربری
 * User Interface Manager
 */

class UIManager {
  constructor(knowledgeBase, engine) {
    this.knowledgeBase = knowledgeBase;
    this.engine = engine;
    this.currentResult = null;
  }

  /**
   * نمایش فرم ورودی
   */
  renderInputForm() {
    return `
      <div class="input-form">
        <h2>اطلاعات بذر و شرایط محیط</h2>
        
        <div class="form-section">
          <h3>مشخصات بذر</h3>
          
          <div class="form-group">
            <label for="seedType">نوع بذر *</label>
            <select id="seedType" required>
              <option value="">انتخاب کنید</option>
              ${this.getSeedTypeOptions()}
            </select>
          </div>

          <div class="form-group">
            <label for="germinationRate">درصد جوانه‌زنی (%)</label>
            <input type="number" id="germinationRate" min="0" max="100" placeholder="0-100">
            <small>بهترین: بالاتر از 85%</small>
          </div>

          <div class="form-group">
            <label for="moisture">رطوبت (%)</label>
            <input type="number" id="moisture" min="0" max="30" step="0.1" placeholder="0-30">
            <small>بهترین: 8-14%</small>
          </div>

          <div class="form-group">
            <label for="purity">خلوص (%)</label>
            <input type="number" id="purity" min="0" max="100" placeholder="0-100">
            <small>بهترین: بالاتر از 90%</small>
          </div>

          <div class="form-group">
            <label for="diseaseResistance">مقاومت بیماری</label>
            <select id="diseaseResistance">
              <option value="">انتخاب کنید</option>
              <option value="زیاد">زیاد</option>
              <option value="متوسط">متوسط</option>
              <option value="کم">کم</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3>شرایط محیط</h3>

          <div class="form-group">
            <label for="season">فصل کاشت</label>
            <select id="season">
              <option value="">انتخاب کنید</option>
              <option value="بهار">بهار</option>
              <option value="تابستان">تابستان</option>
              <option value="پاییز">پاییز</option>
              <option value="زمستان">زمستان</option>
            </select>
          </div>

          <div class="form-group">
            <label for="province">استان</label>
            <select id="province">
              <option value="">انتخاب کنید</option>
              ${this.getProvinceOptions()}
            </select>
          </div>

          <div class="form-group">
            <label for="temperature">دمای میانگین (°C)</label>
            <input type="number" id="temperature" min="-20" max="50" placeholder="-20 تا 50">
          </div>

          <div class="form-group">
            <label for="rainfall">میانگین بارندگی (میلی‌متر)</label>
            <input type="number" id="rainfall" min="0" max="2000" placeholder="0-2000">
          </div>

          <div class="form-group">
            <label for="soilType">نوع خاک</label>
            <select id="soilType">
              <option value="">انتخاب کنید</option>
              <option value="رسی">رسی</option>
              <option value="لومی">لومی</option>
              <option value="ماسه‌ای">ماسه‌ای</option>
              <option value="رسی آلی">رسی آلی</option>
              <option value="لومی آلی">لومی آلی</option>
            </select>
          </div>
        </div>

        <button id="analyzeBtn" class="btn btn-primary">تحلیل و ارزیابی</button>
        <button id="clearBtn" class="btn btn-secondary">پاک کردن</button>
      </div>
    `;
  }

  /**
   * نمایش نتایج
   */
  renderResults(result) {
    this.currentResult = result;

    const statusClass = `status-${result.statusColor}`;
    const scoreColor = Utils.getColorByScore(result.score);

    return `
      <div class="results-container">
        <div class="result-header ${statusClass}">
          <h2>نتیجه تحلیل</h2>
          <div class="status-badge">${result.status}</div>
        </div>

        <div class="score-section">
          <div class="score-circle" style="background-color: ${scoreColor};">
            <div class="score-value">${result.score}</div>
            <div class="score-text">/ 100</div>
          </div>
          <div class="score-description">
            <p><strong>نمره کلی:</strong> بذر شما ${this.getScoreDescription(result.score)} است.</p>
          </div>
        </div>

        ${result.warnings.length > 0 ? `
          <div class="warnings-section">
            <h3>⚠️ هشدارها و نکات اهم</h3>
            <ul>
              ${result.warnings.map(w => `
                <li>
                  <strong>${w.rule}:</strong> ${w.message}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="facts-section">
          <h3>📊 داده‌های ورودی</h3>
          <div class="facts-list">
            ${result.facts.map(f => `
              <div class="fact-item">
                <span class="fact-label">${f.description}</span>
              </div>
            `).join('')}
          </div>
        </div>

        ${result.recommendations && result.recommendations.length > 0 ? `
          <div class="recommendations-section">
            <h3>💡 توصیه‌های بهبود</h3>
            <ul>
              ${result.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="analysis-details">
          <h3>📈 جزئیات تحلیل</h3>
          <table>
            <tr>
              <td>تعداد قوانین بررسی شده:</td>
              <td>${result.analysisDetails.totalRulesChecked}</td>
            </tr>
            <tr>
              <td>قوانین اعمال شده:</td>
              <td>${result.analysisDetails.rulesApplied}</td>
            </tr>
            <tr>
              <td>تعداد هشدارها:</td>
              <td>${result.analysisDetails.warningsCount}</td>
            </tr>
          </table>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" onclick="UIManager.exportToJSON()">دانلود JSON</button>
          <button class="btn btn-secondary" onclick="UIManager.exportToCSV()">دانلود CSV</button>
          <button class="btn btn-info" onclick="UIManager.printResult()">چاپ</button>
        </div>

        <button id="backBtn" class="btn btn-default">بازگشت</button>
      </div>
    `;
  }

  /**
   * دریافت توصیف نمره
   */
  getScoreDescription(score) {
    if (score >= 85) return 'بسیار مناسب و قابل‌اعتماد';
    if (score >= 70) return 'مناسب با شرایطی';
    if (score >= 50) return 'قابل‌قبول اما نیاز به بهبود دارد';
    return 'نامناسب و نیاز به تغییر دارد';
  }

  /**
   * دریافت گزینه‌های نوع بذر
   */
  getSeedTypeOptions() {
    const seedTypes = this.knowledgeBase?.seedTypes || [];
    if (!seedTypes || seedTypes.length === 0) return '';
    
    const types = [...new Set(seedTypes.map(s => s.type))];
    let html = '';
    
    types.forEach(type => {
      const seeds = seedTypes.filter(s => s.type === type);
      html += `<optgroup label="${type}">`;
      seeds.forEach(seed => {
        html += `<option value="${seed.name}">${seed.name}</option>`;
      });
      html += `</optgroup>`;
    });
    
    return html;
  }

  /**
   * دریافت گزینه‌های استان
   */
  getProvinceOptions() {
    const provinces = this.knowledgeBase?.provinces || [];
    if (!provinces || provinces.length === 0) return '';
    
    return provinces.map(p => 
      `<option value="${p.name}">${p.name}</option>`
    ).join('');
  }

  /**
   * نمایش صفحه اطلاعات
   */
  renderInfoPage() {
    return `
      <div class="info-page">
        <h2>درباره سیستم خبره</h2>
        <p>این سیستم برای کمک به کشاورزان در انتخاب صحیح بذر طراحی شده است.</p>
        
        <h3>معیارهای ارزیابی:</h3>
        <table class="criteria-table">
          <thead>
            <tr>
              <th>معیار</th>
              <th>شاخص پایین</th>
              <th>شاخص قابل‌قبول</th>
              <th>شاخص عالی</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>جوانه‌زنی</td>
              <td>&lt; 75%</td>
              <td>75-85%</td>
              <td>&gt; 85%</td>
            </tr>
            <tr>
              <td>رطوبت</td>
              <td>&gt; 16%</td>
              <td>12-16%</td>
              <td>&lt; 12%</td>
            </tr>
            <tr>
              <td>خلوص</td>
              <td>&lt; 90%</td>
              <td>90-95%</td>
              <td>&gt; 95%</td>
            </tr>
            <tr>
              <td>مقاومت بیماری</td>
              <td>کم</td>
              <td>متوسط</td>
              <td>زیاد</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * نمایش تاریخچه
   */
  renderHistory() {
    const history = Utils.getAnalysisHistory();
    
    if (history.length === 0) {
      return '<p>هیچ تجزیه‌ای انجام نشده است.</p>';
    }

    return `
      <div class="history-container">
        <h2>تاریخچه تجزیه‌ها</h2>
        <div class="history-list">
          ${history.slice().reverse().map((item, index) => `
            <div class="history-item">
              <div class="history-date">${Utils.formatDate(item.timestamp)}</div>
              <div class="history-status" style="color: ${Utils.getColorByScore(item.result.score)};">
                نمره: ${item.result.score} - ${item.result.status}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * صادر کردن به JSON
   */
  static exportToJSON() {
    if (this.currentResult) {
      Utils.exportToJSON(this.currentResult);
    }
  }

  /**
   * صادر کردن به CSV
   */
  static exportToCSV() {
    if (this.currentResult) {
      Utils.exportToCSV(this.currentResult);
    }
  }

  /**
   * چاپ نتایج
   */
  static printResult() {
    window.print();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}