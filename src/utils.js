/**
 * توابع کمکی سیستم خبره
 * Utility Functions
 */

class Utils {
  /**
   * بارگذاری داده‌های JSON
   */
  static async loadKnowledgeBase(path) {
    try {
      const response = await fetch(path);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('خطا در بارگذاری پایگاه دانش:', error);
      return null;
    }
  }

  /**
   * ذخیره نتایج در LocalStorage
   */
  static saveAnalysisResult(result) {
    try {
      const results = JSON.parse(localStorage.getItem('analysisResults')) || [];
      results.push({
        timestamp: new Date().toISOString(),
        result: result
      });
      localStorage.setItem('analysisResults', JSON.stringify(results));
      return true;
    } catch (error) {
      console.error('خطا در ذخیره نتایج:', error);
      return false;
    }
  }

  /**
   * دریافت تاریخچه تجزیه‌های قبلی
   */
  static getAnalysisHistory() {
    try {
      return JSON.parse(localStorage.getItem('analysisResults')) || [];
    } catch (error) {
      console.error('خطا در دریافت تاریخچه:', error);
      return [];
    }
  }

  /**
   * صادر کردن نتیجه‌ها به JSON
   */
  static exportToJSON(data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seed-analysis-${new Date().getTime()}.json`;
    link.click();
  }

  /**
   * صادر کردن نتیجه‌ها به CSV
   */
  static exportToCSV(data) {
    let csv = 'معیار,مقدار,وضعیت\n';
    csv += `جوانه‌زنی,${data.germinationRate || 'نامشخص'},${data.germinationRate >= 85 ? 'مناسب' : 'نامناسب'}\n`;
    csv += `رطوبت,${data.moisture || 'نامشخص'},${data.moisture <= 14 ? 'مناسب' : 'نامناسب'}\n`;
    csv += `خلوص,${data.purity || 'نامشخص'},${data.purity >= 90 ? 'مناسب' : 'نامناسب'}\n`;
    csv += `مقاومت بیماری,${data.diseaseResistance || 'نامشخص'},${data.diseaseResistance === 'زیاد' ? 'بسیار مناسب' : data.diseaseResistance === 'متوسط' ? 'قابل‌قبول' : 'ضعیف'}\n`;

    const csvBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seed-analysis-${new Date().getTime()}.csv`;
    link.click();
  }

  /**
   * تبدیل اعداد فارسی به انگلیسی
   */
  static persianToEnglish(str) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = str.toString();
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }
    return result;
  }

  /**
   * تبدیل اعداد انگلیسی به فارسی
   */
  static englishToPersian(str) {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    let result = str.toString();
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
    }
    return result;
  }

  /**
   * حرکت صاف برای آنیمیشن‌ها
   */
  static smoothScroll(element) {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * تولید رنگ بر اساس نمره
   */
  static getColorByScore(score) {
    if (score >= 85) return '#4CAF50'; // سبز
    if (score >= 70) return '#FFC107'; // زرد
    if (score >= 50) return '#FF9800'; // نارنجی
    return '#F44336'; // قرمز
  }

  /**
   * فرمت‌کردن تاریخ
   */
  static formatDate(date) {
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fa-IR', options);
  }

  /**
   * ایجاد یک نمودار ساده برای امتیازات
   */
  static createScoreChart(scores) {
    return Object.entries(scores).map(([name, score]) => {
      const percentage = (score / 100) * 100;
      return `
        <div class="score-item">
          <label>${name}</label>
          <div class="score-bar">
            <div class="score-fill" style="width: ${percentage}%; background-color: ${this.getColorByScore(score)};">
              ${Math.round(score)}%
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * اعتبار سنجی ورودی‌ها
   */
  static validateInput(input) {
    const errors = [];

    // بررسی فیلدهای الزامی (ضروری)
    if (!input.seedType || input.seedType.trim() === '') {
      errors.push('نوع بذر الزامی است');
    }

    // برای فیلدهای عددی، بررسی کنید که string خالی نیست (صفر مقدار معتبری است)
    if (input.germinationRate === '' || input.germinationRate === null || input.germinationRate === undefined) {
      errors.push('درصد جوانه‌زنی الزامی است');
    } else {
      const value = parseFloat(input.germinationRate);
      if (isNaN(value) || value < 0 || value > 100) {
        errors.push('جوانه‌زنی باید بین 0 و 100 باشد');
      }
    }

    if (input.moisture === '' || input.moisture === null || input.moisture === undefined) {
      errors.push('درصد رطوبت الزامی است');
    } else {
      const value = parseFloat(input.moisture);
      if (isNaN(value) || value < 0 || value > 30) {
        errors.push('رطوبت باید بین 0 و 30 باشد');
      }
    }

    if (input.purity === '' || input.purity === null || input.purity === undefined) {
      errors.push('درصد خلوص الزامی است');
    } else {
      const value = parseFloat(input.purity);
      if (isNaN(value) || value < 0 || value > 100) {
        errors.push('خلوص باید بین 0 و 100 باشد');
      }
    }

    if (!input.diseaseResistance || input.diseaseResistance.trim() === '') {
      errors.push('مقاومت بیماری الزامی است');
    }

    if (!input.season || input.season.trim() === '') {
      errors.push('فصل کاشت الزامی است');
    }

    if (!input.province || input.province.trim() === '') {
      errors.push('استان الزامی است');
    }

    if (input.temperature === '' || input.temperature === null || input.temperature === undefined) {
      errors.push('دمای میانگین الزامی است');
    } else {
      const value = parseFloat(input.temperature);
      if (isNaN(value) || value < -20 || value > 50) {
        errors.push('دما باید بین -20 و 50 درجه سانتی‌گراد باشد');
      }
    }

    if (input.rainfall === '' || input.rainfall === null || input.rainfall === undefined) {
      errors.push('میانگین بارندگی الزامی است');
    } else {
      const value = parseFloat(input.rainfall);
      if (isNaN(value) || value < 0 || value > 2000) {
        errors.push('بارندگی باید بین 0 و 2000 میلی‌متر باشد');
      }
    }

    if (!input.soilType || input.soilType.trim() === '') {
      errors.push('نوع خاک الزامی است');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * دریافت پیشنهادات برای بهبود
   */
  static getImprovementSuggestions(result) {
    const suggestions = [];

    if (result.score < 70) {
      suggestions.push({
        priority: 'بالا',
        message: 'نمره کل پایین است. لطفا شرایط بذر و محیط را بازبینی کنید.'
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        suggestions.push({
          priority: 'بالا',
          message: warning.message
        });
      });
    }

    return suggestions;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}