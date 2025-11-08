/**
 * موتور استنتاج سیستم خبره
 * Inference Engine for Expert System
 * 
 * استفاده از روش استنتاج رو‌به‌جلو (Forward Chaining)
 * ترکیب قوانین و فکت‌ها برای تصمیم‌گیری
 */

class InferenceEngine {
  constructor(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
    this.facts = [];
    this.conclusions = [];
    this.usedRules = [];
    this.score = 0;
    this.warnings = [];
    this.recommendations = [];
  }

  /**
   * محاسبه نمره بر اساس معیارهای مختلف
   */
  calculateScore(userInput) {
    let totalScore = 0;
    let totalWeight = 0;

    const weights = {
      germinationRate: 10,
      moisture: 10,
      purity: 8,
      diseaseResistance: 9,
      temperature: 8,
      rainfall: 7
    };

    // محاسبه نمره جوانه‌زنی
    if (userInput.germinationRate) {
      const germScore = this.scoreGermination(userInput.germinationRate);
      totalScore += germScore * weights.germinationRate;
      totalWeight += weights.germinationRate;
    }

    // محاسبه نمره رطوبت
    if (userInput.moisture !== undefined) {
      const moistScore = this.scoreMoisture(userInput.moisture);
      totalScore += moistScore * weights.moisture;
      totalWeight += weights.moisture;
    }

    // محاسبه نمره خلوص
    if (userInput.purity) {
      const purityScore = this.scorePurity(userInput.purity);
      totalScore += purityScore * weights.purity;
      totalWeight += weights.purity;
    }

    // محاسبه نمره مقاومت بیماری
    if (userInput.diseaseResistance) {
      const diseaseScore = this.scoreDiseaseResistance(userInput.diseaseResistance);
      totalScore += diseaseScore * weights.diseaseResistance;
      totalWeight += weights.diseaseResistance;
    }

    // محاسبه نمره دما
    if (userInput.temperature && userInput.seedType) {
      const tempScore = this.scoreTemperature(userInput);
      totalScore += tempScore * weights.temperature;
      totalWeight += weights.temperature;
    }

    // محاسبه نمره بارندگی
    if (userInput.rainfall && userInput.seedType) {
      const rainfallScore = this.scoreRainfall(userInput);
      totalScore += rainfallScore * weights.rainfall;
      totalWeight += weights.rainfall;
    }

    this.score = totalWeight > 0 ? (totalScore / totalWeight) : 0;
    return Math.round(this.score);
  }

  scoreGermination(rate) {
    if (rate >= 90) return 100;
    if (rate >= 85) return 85;
    if (rate >= 75) return 60;
    if (rate >= 70) return 40;
    return 0;
  }

  scoreMoisture(moisture) {
    if (moisture >= 8 && moisture <= 14) return 100;
    if (moisture >= 6 && moisture <= 16) return 80;
    if (moisture >= 4 && moisture <= 18) return 50;
    if (moisture > 18) return 0;
    return 60;
  }

  scorePurity(purity) {
    if (purity >= 95) return 100;
    if (purity >= 90) return 85;
    if (purity >= 85) return 60;
    return 20;
  }

  scoreDiseaseResistance(resistance) {
    const scores = {
      'زیاد': 100,
      'متوسط': 70,
      'کم': 30
    };
    return scores[resistance] || 50;
  }

  scoreTemperature(userInput) {
    const seasonTemp = {
      'بهار': [15, 25],
      'تابستان': [20, 35],
      'پاییز': [12, 22],
      'زمستان': [5, 15]
    };

    const temp = userInput.temperature;
    const range = seasonTemp[userInput.season] || [15, 25];

    if (temp >= range[0] && temp <= range[1]) return 100;
    if (temp >= range[0] - 3 && temp <= range[1] + 3) return 70;
    if (temp >= range[0] - 5 && temp <= range[1] + 5) return 40;
    return 20;
  }

  scoreRainfall(userInput) {
    const seedRainfall = {
      'گندم': [300, 500],
      'برنج': [600, 1200],
      'عدس': [250, 400],
      'نخود': [300, 400],
      'آفتاب‌گردان': [250, 500],
      'ذرت': [400, 600],
      'یونجه': [200, 500]
    };

    const rainfall = userInput.rainfall;
    const optimalRange = seedRainfall[userInput.seedType] || [300, 500];

    if (rainfall >= optimalRange[0] && rainfall <= optimalRange[1]) return 100;
    if (rainfall >= optimalRange[0] - 50 && rainfall <= optimalRange[1] + 100) return 80;
    if (rainfall >= optimalRange[0] - 100 && rainfall <= optimalRange[1] + 200) return 50;
    return 30;
  }

  /**
   * اعمال قوانین و نتیجه‌گیری
   */
  inferenceForward(userInput) {
    this.facts = this.extractFacts(userInput);
    this.conclusions = [];
    this.usedRules = [];
    this.warnings = [];
    this.recommendations = [];

    const rules = this.knowledgeBase.knowledge.ruleBasedKnowledge.rules;

    // مرتب کردن قوانین بر اساس اولویت
    const sortedRules = this.sortRulesByPriority(rules);

    // اعمال هر قاعده
    for (const rule of sortedRules) {
      if (this.checkRuleConditions(rule.conditions, userInput)) {
        const conclusion = {
          ruleId: rule.id,
          ruleName: rule.name,
          conclusion: rule.conclusion,
          confidence: rule.confidence,
          type: rule.type,
          recommendations: rule.recommendations || []
        };

        this.conclusions.push(conclusion);
        this.usedRules.push(rule.id);

        // جمع‌آوری هشدارها
        if (rule.type === 'warning') {
          this.warnings.push({
            rule: rule.name,
            message: rule.conclusion,
            recommendations: rule.recommendations
          });
        }

        // جمع‌آوری توصیه‌ها
        if (rule.recommendations) {
          this.recommendations.push(...rule.recommendations);
        }
      }
    }

    return this.generateFinalConclusion(userInput);
  }

  extractFacts(userInput) {
    const facts = [];

    if (userInput.germinationRate) {
      facts.push({
        property: 'germinationRate',
        value: userInput.germinationRate,
        description: `جوانه‌زنی: ${userInput.germinationRate}%`
      });
    }

    if (userInput.moisture !== undefined) {
      facts.push({
        property: 'moisture',
        value: userInput.moisture,
        description: `رطوبت: ${userInput.moisture}%`
      });
    }

    if (userInput.purity) {
      facts.push({
        property: 'purity',
        value: userInput.purity,
        description: `خلوص: ${userInput.purity}%`
      });
    }

    if (userInput.diseaseResistance) {
      facts.push({
        property: 'diseaseResistance',
        value: userInput.diseaseResistance,
        description: `مقاومت بیماری: ${userInput.diseaseResistance}`
      });
    }

    if (userInput.season) {
      facts.push({
        property: 'season',
        value: userInput.season,
        description: `فصل: ${userInput.season}`
      });
    }

    return facts;
  }

  sortRulesByPriority(rules) {
    return rules.sort((a, b) => a.priority - b.priority);
  }

  checkRuleConditions(conditions, userInput) {
    for (const [key, value] of Object.entries(conditions)) {
      if (!this.evaluateCondition(key, value, userInput)) {
        return false;
      }
    }
    return true;
  }

  evaluateCondition(key, expectedValue, userInput) {
    const actual = userInput[this.mapConditionKey(key)];

    if (actual === undefined) {
      return true; // اگر مقدار وارد نشده، شرط را منحل کنید
    }

    // بررسی آرایه
    if (Array.isArray(expectedValue)) {
      if (key === 'seedType' || key === 'season' || key === 'soilType') {
        return expectedValue.includes(actual);
      }
      // برای محدوده‌های دمایی
      if (key === 'temperatureRange' || key === 'avgTempRange') {
        return actual >= expectedValue[0] && actual <= expectedValue[1];
      }
    }

    // بررسی شرایط مقایسه‌ای
    if (typeof expectedValue === 'string' && expectedValue.includes('>')) {
      const value = parseFloat(expectedValue.replace('>', ''));
      return actual > value;
    }

    if (typeof expectedValue === 'string' && expectedValue.includes('<')) {
      const value = parseFloat(expectedValue.replace('<', ''));
      return actual < value;
    }

    // مقایسه معمولی
    if (typeof expectedValue === 'number') {
      const conditionKey = key.replace('Min', '').replace('Max', '');
      if (key.includes('Min')) {
        return actual >= expectedValue;
      }
      if (key.includes('Max')) {
        return actual <= expectedValue;
      }
    }

    return actual === expectedValue;
  }

  mapConditionKey(key) {
    const mapping = {
      'seedType': 'seedType',
      'season': 'season',
      'germinationMin': 'germinationRate',
      'germinationRate': 'germinationRate',
      'moistureMax': 'moisture',
      'moisture': 'moisture',
      'purityMin': 'purity',
      'purity': 'purity',
      'diseaseResistance': 'diseaseResistance',
      'soilType': 'soilType',
      'temperatureRange': 'temperature',
      'avgTempRange': 'temperature',
      'temperature': 'temperature',
      'rainfallMin': 'rainfall',
      'rainfallMax': 'rainfall',
      'rainfall': 'rainfall',
      'avgRainfallMin': 'rainfall',
      'avgRainfallMax': 'rainfall'
    };
    return mapping[key] || key;
  }

  generateFinalConclusion(userInput) {
    const score = this.calculateScore(userInput);
    
    let status = 'مناسب';
    let statusColor = 'green';

    if (this.warnings.length > 0) {
      status = 'دارای مشکلات';
      statusColor = 'yellow';
    }

    if (score < 50) {
      status = 'نامناسب';
      statusColor = 'red';
    } else if (score < 70) {
      status = 'قابل‌قبول با شرایط';
      statusColor = 'orange';
    } else if (score >= 85) {
      status = 'بسیار مناسب';
      statusColor = 'green';
    }

    // بررسی موارد مهم
    if (this.conclusions.some(c => c.type === 'warning' && c.confidence >= 90)) {
      status = 'نامناسب';
      statusColor = 'red';
    }

    return {
      status: status,
      statusColor: statusColor,
      score: score,
      conclusions: this.conclusions,
      warnings: this.warnings,
      recommendations: this.deduplicateRecommendations(this.recommendations),
      usedRules: this.usedRules,
      facts: this.facts,
      analysisDetails: {
        totalRulesChecked: this.knowledgeBase.knowledge.ruleBasedKnowledge.rules.length,
        rulesApplied: this.usedRules.length,
        warningsCount: this.warnings.length
      }
    };
  }

  deduplicateRecommendations(recommendations) {
    return [...new Set(recommendations)];
  }

  /**
   * بدست آوردن سیاق قوانین
   */
  explainConclusion(ruleId) {
    const rule = this.knowledgeBase.knowledge.ruleBasedKnowledge.rules.find(r => r.id === ruleId);
    if (rule) {
      return {
        name: rule.name,
        conditions: rule.conditions,
        conclusion: rule.conclusion,
        confidence: rule.confidence,
        explanation: `اگر ${JSON.stringify(rule.conditions)}، پس ${rule.conclusion}`
      };
    }
    return null;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InferenceEngine;
}