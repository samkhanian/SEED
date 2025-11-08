/**
 * سیستم خبره انتخاب بذر کاشت
 * موتور استنتاج (Inference Engine)
 * استاد: دکتر نمیریان
 * درس: سیستم‌های خبره
 */

class InferenceEngine {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.results = [];
    this.appliedRules = [];
    this.score = 0;
    this.recommendations = [];
  }

  /**
   * تابع اصلی: تحلیل و ارزیابی بذر
   */
  analyzeSeed(input) {
    this.results = [];
    this.appliedRules = [];
    this.recommendations = [];
    this.score = 0;

    // 1. یافتن بذر انتخابی
    const seed = this.findSeed(input.seedId);
    if (!seed) {
      return {
        success: false,
        error: "بذر انتخابی یافت نشد",
        verdict: "❌ خطا"
      };
    }

    // 2. یافتن اطلاعات منطقه
    const province = this.findProvince(input.provinceId);
    if (!province) {
      return {
        success: false,
        error: "منطقه انتخابی یافت نشد",
        verdict: "❌ خطا"
      };
    }

    // 3. بررسی شرایط ورودی
    const validationResult = this.validateInput(input, seed);
    if (!validationResult.valid) {
      return validationResult;
    }

    // 4. اعمال قواعل
    this.applyRules(input, seed, province);

    // 5. محاسبه امتیاز کلی
    this.calculateTotalScore(input, seed, province);

    // 6. تولید نتیجه نهایی
    return this.generateFinalResult(seed, province, input);
  }

  /**
   * یافتن بذر از پایگاه دانش
   */
  findSeed(seedId) {
    return this.kb.seeds.find(s => s.id === seedId);
  }

  /**
   * یافتن استان/منطقه
   */
  findProvince(provinceId) {
    return this.kb.provinces.find(p => p.id === provinceId);
  }

  /**
   * تصدیق صحت داده‌های ورودی
   */
  validateInput(input, seed) {
    const errors = [];

    // بررسی جوانه‌زنی
    if (input.germination < 0 || input.germination > 100) {
      errors.push("جوانه‌زنی باید بین 0 و 100 باشد");
    }

    // بررسی رطوبت
    if (input.moisture < 0 || input.moisture > 25) {
      errors.push("رطوبت باید بین 0 و 25 باشد");
    }

    // بررسی خلوص
    if (input.purity < 0 || input.purity > 100) {
      errors.push("خلوص باید بین 0 و 100 باشد");
    }

    if (errors.length > 0) {
      return {
        success: false,
        valid: false,
        errors: errors,
        verdict: "❌ داده‌های نامعتبر"
      };
    }

    return { valid: true };
  }

  /**
   * اعمال قواعل (Forward Chaining)
   */
  applyRules(input, seed, province) {
    const rules = this.kb.rules;

    for (let rule of rules) {
      if (this.ruleMatches(rule, input, seed, province)) {
        this.appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          conclusion: rule.conclusion,
          confidence: rule.confidence,
          weight: rule.weight,
          recommendation: rule.recommendation || ""
        });

        // اضافه کردن توصیه اگر موجود باشد
        if (rule.recommendation) {
          if (!this.recommendations.includes(rule.recommendation)) {
            this.recommendations.push(rule.recommendation);
          }
        }
      }
    }
  }

  /**
   * بررسی منطبق بودن شرایط قاعله
   */
  ruleMatches(rule, input, seed, province) {
    const conditions = rule.conditions;

    // بررسی نوع بذر
    if (conditions.seedType) {
      const seedTypes = Array.isArray(conditions.seedType)
        ? conditions.seedType
        : [conditions.seedType];
      if (!seedTypes.includes(seed.type)) {
        return false;
      }
    }

    // بررسی فصل
    if (conditions.season) {
      const seasons = Array.isArray(conditions.season)
        ? conditions.season
        : [conditions.season];
      if (!seasons.includes(input.season)) {
        return false;
      }
    }

    // بررسی حداقل جوانه‌زنی
    if (conditions.germinationMin && input.germination < conditions.germinationMin) {
      return false;
    }

    // بررسی حداکثر رطوبت
    if (conditions.moistureMax && input.moisture > conditions.moistureMax) {
      return false;
    }

    // بررسی نوع خاک
    if (conditions.soilType) {
      const soilTypes = Array.isArray(conditions.soilType)
        ? conditions.soilType
        : [conditions.soilType];
      if (!soilTypes.includes(input.soilType)) {
        return false;
      }
    }

    // بررسی دمای میانگین
    if (conditions.avgTempRange) {
      const [min, max] = conditions.avgTempRange;
      if (province.avgTemperature < min || province.avgTemperature > max) {
        return false;
      }
    }

    // بررسی بارندگی
    if (conditions.avgRainfallMin && province.avgRainfall < conditions.avgRainfallMin) {
      return false;
    }
    if (conditions.avgRainfallMax && province.avgRainfall > conditions.avgRainfallMax) {
      return false;
    }

    // بررسی مقاومت بیماری
    if (conditions.diseaseResistance) {
      const resistances = Array.isArray(conditions.diseaseResistance)
        ? conditions.diseaseResistance
        : [conditions.diseaseResistance];
      if (!resistances.includes(seed.features.diseaseResistance)) {
        return false;
      }
    }

    // بررسی رطوبت دقیق
    if (conditions.moisture) {
      const condition = conditions.moisture;
      if (typeof condition === "string") {
        if (condition.startsWith(">") && input.moisture <= parseInt(condition.substring(1))) {
          return false;
        }
        if (condition.startsWith("<") && input.moisture >= parseInt(condition.substring(1))) {
          return false;
        }
      }
    }

    // بررسی خلوص
    if (conditions.purityMin && input.purity < conditions.purityMin) {
      return false;
    }

    return true;
  }

  /**
   * محاسبه امتیاز کلی (Scoring)
   */
  calculateTotalScore(input, seed, province) {
    const weights = this.kb.weights;
    const qualityLevels = this.kb.qualityLevels;

    // امتیاز جوانه‌زنی
    const germinationScore = this.getQualityScore(
      input.germination,
      qualityLevels.germination
    );

    // امتیاز رطوبت
    const moistureScore = this.getQualityScore(
      input.moisture,
      qualityLevels.moisture
    );

    // امتیاز خلوص
    const purityScore = this.getQualityScore(
      input.purity,
      qualityLevels.purity
    );

    // امتیاز مقاومت بیماری
    const diseaseScore = this.getDiseaseResistanceScore(seed.features.diseaseResistance);

    // امتیاز تناسب محیطی
    const environmentalScore = this.getEnvironmentalFitnessScore(input, seed, province);

    // محاسبه امتیاز وزن‌دار
    this.score = Math.round(
      (germinationScore * weights.germination +
        moistureScore * weights.moisture +
        purityScore * weights.purity +
        diseaseScore * weights.diseaseResistance +
        environmentalScore * weights.environmentalFitness) * 100
    ) / 100;

    // ذخیره امتیازات تفصیلی
    this.detailedScores = {
      germination: { value: input.germination, score: germinationScore },
      moisture: { value: input.moisture, score: moistureScore },
      purity: { value: input.purity, score: purityScore },
      diseaseResistance: { value: seed.features.diseaseResistance, score: diseaseScore },
      environmental: { score: environmentalScore }
    };
  }

  /**
   * گرفتن امتیاز کیفی برای یک معیار
   */
  getQualityScore(value, levels) {
    for (let level in levels) {
      const range = levels[level];
      if (value >= range.min && value <= range.max) {
        return range.score;
      }
    }
    return 0;
  }

  /**
   * امتیاز مقاومت بیماری
   */
  getDiseaseResistanceScore(resistance) {
    switch (resistance) {
      case "زیاد":
        return 100;
      case "متوسط":
        return 70;
      case "کم":
        return 30;
      default:
        return 0;
    }
  }

  /**
   * امتیاز تناسب محیطی
   */
  getEnvironmentalFitnessScore(input, seed, province) {
    let score = 0;
    let factors = 0;

    // بررسی تناسب نوع خاک
    if (province.soilTypes.includes(input.soilType)) {
      score += 100;
    } else {
      score += 40;
    }
    factors++;

    // بررسی تناسب فصل
    if (seed.suitableSeasons.includes(input.season)) {
      score += 100;
    } else {
      score += 30;
    }
    factors++;

    // بررسی تناسب منطقه
    if (seed.suitableProvinces.includes(province.name)) {
      score += 100;
    } else {
      score += 50;
    }
    factors++;

    return Math.round(score / factors);
  }

  /**
   * تولید نتیجه نهایی
   */
  generateFinalResult(seed, province, input) {
    let verdict = "";
    let status = "";
    let statusEmoji = "";

    if (this.score >= 85) {
      verdict = "✅ بذر مناسب برای کاشت است";
      status = "مناسب";
      statusEmoji = "✅";
    } else if (this.score >= 70) {
      verdict = "⚠️ بذر نیاز به بهبود دارد";
      status = "قابل‌قبول";
      statusEmoji = "⚠️";
    } else {
      verdict = "❌ بذر نامناسب است";
      status = "نامناسب";
      statusEmoji = "❌";
    }

    return {
      success: true,
      seedName: seed.name,
      seedType: seed.type,
      provinceName: province.name,
      season: input.season,
      overallScore: this.score,
      verdict: verdict,
      status: status,
      statusEmoji: statusEmoji,
      details: this.detailedScores,
      appliedRules: this.appliedRules,
      recommendations: this.recommendations,
      additionalInfo: {
        climate: province.climate,
        avgTemperature: province.avgTemperature,
        avgRainfall: province.avgRainfall,
        seedColor: seed.features.color
      }
    };
  }

  /**
   * دریافت فهرست تمام بذرها
   */
  getAllSeeds() {
    return this.kb.seeds;
  }

  /**
   * دریافت فهرست تمام استان‌ها
   */
  getAllProvinces() {
    return this.kb.provinces;
  }

  /**
   * جستجو برای بهترین بذرهای جایگزین
   */
  findAlternativeSeeds(input, currentSeed, topN = 3) {
    const alternatives = [];

    for (let seed of this.kb.seeds) {
      if (seed.id === currentSeed.id) continue;

      // بررسی تناسب فصل و منطقه
      if (
        seed.suitableSeasons.includes(input.season) &&
        seed.suitableProvinces.some(p =>
          this.kb.provinces.find(prov => prov.id === input.provinceId).name === p
        )
      ) {
        // شبیه‌سازی ارزیابی
        const simInput = { ...input, seedId: seed.id };
        const simResult = this.analyzeSeed(simInput);
        if (simResult.success) {
          alternatives.push({
            seedName: seed.name,
            score: simResult.overallScore,
            verdict: simResult.verdict
          });
        }
      }
    }

    // مرتب‌سازی و برگرداندن بهترین‌ها
    return alternatives.sort((a, b) => b.score - a.score).slice(0, topN);
  }
}

// صادر کردن برای استفاده در HTML
if (typeof module !== "undefined" && module.exports) {
  module.exports = InferenceEngine;
}