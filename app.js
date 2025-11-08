/**
 * سیستم خبره انتخاب بذر کاشت
 * اسکریپت اصلی (App Logic)
 * استاد: دکتر نمیریان
 */

// متغیرهای سراسری
let knowledgeBase = null;
let inferenceEngine = null;

/**
 * بارگذاری اولیه
 */
document.addEventListener("DOMContentLoaded", async () => {
    await loadKnowledgeBase();
    populateSelects();
    setupEventListeners();
});

/**
 * بارگذاری پایگاه دانش از فایل JSON یا fallback data
 */
async function loadKnowledgeBase() {
    try {
        // سعی برای بارگذاری از فایل
        try {
            const response = await fetch("knowledge.json");
            if (response.ok) {
                knowledgeBase = await response.json();
                inferenceEngine = new InferenceEngine(knowledgeBase);
                console.log("✅ پایگاه دانش از فایل بارگذاری شد");
                return;
            }
        } catch (fetchError) {
            console.warn("⚠️ خطا در fetch - استفاده از داده embedded:", fetchError);
        }

        // استفاده از داده embedded (fallback)
        if (typeof KNOWLEDGE_BASE !== 'undefined') {
            knowledgeBase = KNOWLEDGE_BASE;
            inferenceEngine = new InferenceEngine(knowledgeBase);
            console.log("✅ پایگاه دانش از داده embedded بارگذاری شد");
        } else {
            throw new Error("نتوانست داده پایگاه دانش را بارگذاری کند");
        }
    } catch (error) {
        console.error("❌ خطای جدی:", error);
        showError("خطا در بارگذاری پایگاه دانش! لطفاً صفحه را دوباره بارگذاری کنید.");
    }
}

/**
 * تعیین گزینه‌های لیست‌های کشویی
 */
function populateSelects() {
    if (!knowledgeBase) return;

    // بذرها
    const seedSelect = document.getElementById("seedSelect");
    knowledgeBase.seeds.forEach(seed => {
        const option = document.createElement("option");
        option.value = seed.id;
        option.textContent = `${seed.name} (${seed.type})`;
        seedSelect.appendChild(option);
    });

    // استان‌ها
    const provinceSelect = document.getElementById("provinceSelect");
    knowledgeBase.provinces.forEach(province => {
        const option = document.createElement("option");
        option.value = province.id;
        option.textContent = province.name;
        provinceSelect.appendChild(option);
    });
}

/**
 * تنظیم رویدادهای فرم
 */
function setupEventListeners() {
    const form = document.getElementById("seedForm");
    form.addEventListener("submit", handleFormSubmit);
    form.addEventListener("reset", resetResults);

    // اضافه کردن slider نمایشی برای اعداد
    const rangeInputs = document.querySelectorAll(".range-input");
    rangeInputs.forEach(input => {
        input.addEventListener("input", (e) => {
            updateRangeDisplay(e.target);
        });
    });
}

/**
 * به‌روزرسانی نمایش مقدار اسلایدر
 */
function updateRangeDisplay(input) {
    const label = input.previousElementSibling || input.parentElement.querySelector("label");
    if (label) {
        // فقط مقدار را به‌روزرسانی کنید
        console.log(`${input.id}: ${input.value}`);
    }
}

/**
 * مدیریت ارسال فرم
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // جمع‌آوری داده‌های فرم
    const formData = {
        seedId: document.getElementById("seedSelect").value,
        provinceId: document.getElementById("provinceSelect").value,
        germination: parseFloat(document.getElementById("germination").value),
        moisture: parseFloat(document.getElementById("moisture").value),
        purity: parseFloat(document.getElementById("purity").value),
        season: document.getElementById("season").value,
        soilType: document.getElementById("soilType").value,
        health: document.getElementById("health").value,
        diseaseResistance: document.getElementById("diseaseResistance").value
    };

    // بررسی اعتبار
    if (!formData.seedId || !formData.provinceId || !formData.season || !formData.soilType) {
        showError("لطفاً تمام فیلدهای ضروری را پر کنید!");
        return;
    }

    // اجرای تحلیل
    const result = inferenceEngine.analyzeSeed(formData);

    if (result.success) {
        displayResults(result);
    } else {
        showError(result.error || "خطای نامشخص");
    }
}

/**
 * نمایش نتایج
 */
function displayResults(result) {
    // مخفی کردن حالات دیگر
    document.getElementById("defaultState").classList.add("hidden");
    document.getElementById("errorState").classList.add("hidden");
    document.getElementById("resultsState").classList.remove("hidden");

    // نتیجه نهایی
    document.getElementById("overallScore").textContent = result.overallScore;
    document.getElementById("verdictMessage").textContent = result.verdict;
    document.getElementById("verdictEmoji").textContent = result.statusEmoji;

    // تغییر رنگ بر اساس امتیاز
    updateVerdictColor(result.overallScore);

    // اطلاعات بذر
    document.getElementById("seedName").textContent = result.seedName;
    document.getElementById("seedType").textContent = result.seedType;
    document.getElementById("provinceName").textContent = result.provinceName;
    document.getElementById("season").textContent = result.season;

    // امتیازات تفصیلی
    displayDetailedScores(result.details);

    // توصیه‌ها
    displayRecommendations(result.recommendations);

    // اطلاعات محیطی
    document.getElementById("avgTemp").textContent = `${result.additionalInfo.avgTemperature}°C`;
    document.getElementById("avgRainfall").textContent = `${result.additionalInfo.avgRainfall} میلی‌متر`;
    document.getElementById("climate").textContent = result.additionalInfo.climate;

    // پیمایش به نتایج
    setTimeout(() => {
        document.getElementById("resultsState").scrollIntoView({ behavior: "smooth" });
    }, 100);
}

/**
 * نمایش امتیازات تفصیلی
 */
function displayDetailedScores(details) {
    // جوانه‌زنی
    updateScoreBar("germinationBar", details.germination.score);
    document.getElementById("germinationScore").textContent =
        `${Math.round(details.germination.score)}%`;

    // رطوبت
    updateScoreBar("moistureBar", details.moisture.score);
    document.getElementById("moistureScore").textContent =
        `${Math.round(details.moisture.score)}%`;

    // خلوص
    updateScoreBar("purityBar", details.purity.score);
    document.getElementById("purityScore").textContent =
        `${Math.round(details.purity.score)}%`;

    // مقاومت بیماری
    updateScoreBar("diseaseBar", details.diseaseResistance.score);
    document.getElementById("diseaseScore").textContent =
        `${Math.round(details.diseaseResistance.score)}%`;
}

/**
 * به‌روزرسانی نوار امتیاز
 */
function updateScoreBar(barId, score) {
    const bar = document.getElementById(barId);
    const percentage = Math.min(Math.max(score, 0), 100);
    bar.style.width = percentage + "%";

    // تغییر رنگ بر اساس مقدار
    if (percentage >= 80) {
        bar.style.background = "linear-gradient(90deg, #27ae60 0%, #52be80 100%)";
    } else if (percentage >= 60) {
        bar.style.background = "linear-gradient(90deg, #f39c12 0%, #f5b041 100%)";
    } else {
        bar.style.background = "linear-gradient(90deg, #e74c3c 0%, #f17060 100%)";
    }
}

/**
 * نمایش توصیه‌ها
 */
function displayRecommendations(recommendations) {
    const list = document.getElementById("recommendationsList");
    list.innerHTML = "";

    if (recommendations.length === 0) {
        list.innerHTML = '<p class="no-recommendations">توصیه‌ای وجود ندارد</p>';
        return;
    }

    recommendations.forEach(rec => {
        const item = document.createElement("div");
        item.className = "recommendation-item";
        item.innerHTML = `<span>${rec}</span>`;
        list.appendChild(item);
    });
}

/**
 * به‌روزرسانی رنگ نتیجه نهایی
 */
function updateVerdictColor(score) {
    const card = document.querySelector(".verdict-card");
    
    if (score >= 85) {
        card.style.borderColor = "rgba(39, 174, 96, 0.3)";
        card.style.background = "linear-gradient(135deg, rgba(39, 174, 96, 0.05) 0%, rgba(39, 174, 96, 0.1) 100%)";
    } else if (score >= 70) {
        card.style.borderColor = "rgba(243, 156, 18, 0.3)";
        card.style.background = "linear-gradient(135deg, rgba(243, 156, 18, 0.05) 0%, rgba(243, 156, 18, 0.1) 100%)";
    } else {
        card.style.borderColor = "rgba(231, 76, 60, 0.3)";
        card.style.background = "linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(231, 76, 60, 0.1) 100%)";
    }
}

/**
 * نمایش خطا
 */
function showError(message) {
    document.getElementById("defaultState").classList.add("hidden");
    document.getElementById("resultsState").classList.add("hidden");
    document.getElementById("errorState").classList.remove("hidden");
    document.getElementById("errorMessage").textContent = message;
}

/**
 * بازنشانی نتایج
 */
function resetResults() {
    document.getElementById("defaultState").classList.remove("hidden");
    document.getElementById("resultsState").classList.add("hidden");
    document.getElementById("errorState").classList.add("hidden");
}

/**
 * تابع بازگشت (برای دکمه خطا)
 */
function resetForm() {
    document.getElementById("seedForm").reset();
    resetResults();
}

/**
 * صادر کردن نتایج (اختیاری)
 */
function exportResults() {
    const results = {
        timestamp: new Date().toLocaleString("fa-IR"),
        seedName: document.getElementById("seedName").textContent,
        score: document.getElementById("overallScore").textContent,
        verdict: document.getElementById("verdictMessage").textContent,
        recommendations: Array.from(document.querySelectorAll(".recommendation-item"))
            .map(item => item.textContent.trim())
    };

    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seed-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * چاپ نتایج
 */
function printResults() {
    window.print();
}

/**
 * ذخیره در Local Storage
 */
function saveResults() {
    const results = {
        timestamp: new Date().toLocaleString("fa-IR"),
        seedName: document.getElementById("seedName").textContent,
        provinceName: document.getElementById("provinceName").textContent,
        season: document.getElementById("season").textContent,
        score: document.getElementById("overallScore").textContent,
        verdict: document.getElementById("verdictMessage").textContent
    };

    let history = JSON.parse(localStorage.getItem("seedAnalysisHistory") || "[]");
    history.unshift(results);
    history = history.slice(0, 10); // فقط 10 مورد اخیر

    localStorage.setItem("seedAnalysisHistory", JSON.stringify(history));
    alert("✅ نتایج ذخیره شد!");
}

/**
 * نمایش تاریخچه (اختیاری)
 */
function showHistory() {
    const history = JSON.parse(localStorage.getItem("seedAnalysisHistory") || "[]");
    if (history.length === 0) {
        alert("تاریخچه‌ای وجود ندارد");
        return;
    }

    let historyText = "📜 تاریخچه تجزیه‌ها:\n\n";
    history.forEach((item, index) => {
        historyText += `${index + 1}. ${item.seedName} - ${item.provinceName} (${item.score}/100)\n`;
        historyText += `   ${item.timestamp}\n\n`;
    });

    alert(historyText);
}

console.log("✅ اپلیکیشن آماده است!");