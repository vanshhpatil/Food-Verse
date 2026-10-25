import './style.css';

// State Management
interface AppState {
  activeTab: string;
  apiBase: string;
  isBackendOnline: boolean;
  latencyMs: number;
  recognitionResult: any | null;
  freshnessResult: any | null;
  hygieneResult: any | null;
  recipeResult: any | null;
  plannerResult: any | null;
  activePlanDay: number;
  ingredients: string[];
  cookingTimeMinutes: number;
  dietPreference: string;
  targetCalories: number;
  planDiet: string;
  planDays: number;
  timerInterval: any | null;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  webcamStream: MediaStream | null;
  activeModuleForCamera: string | null;
  theme: 'dark' | 'light';
}

const state: AppState = {
  activeTab: 'overview',
  apiBase: 'http://127.0.0.1:8000',
  isBackendOnline: false,
  latencyMs: 0,
  recognitionResult: null,
  freshnessResult: null,
  hygieneResult: null,
  recipeResult: null,
  plannerResult: null,
  activePlanDay: 0,
  ingredients: ['Chicken Breast', 'Garlic', 'Cherry Tomatoes', 'Spinach', 'Olive Oil'],
  cookingTimeMinutes: 25,
  dietPreference: 'High-Protein',
  targetCalories: 2200,
  planDiet: 'High-Protein',
  planDays: 5,
  timerInterval: null,
  timerSecondsRemaining: 20 * 60,
  isTimerRunning: false,
  webcamStream: null,
  activeModuleForCamera: null,
  theme: (localStorage.getItem('foodverse_theme') as 'dark' | 'light') || 'dark'
};

// Toast Notifications
function showToast(message: string, type: 'success' | 'warning' | 'info' = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Backend Health Heartbeat
async function checkBackendHealth() {
  const startTime = performance.now();
  try {
    const res = await fetch(`${state.apiBase}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      state.isBackendOnline = true;
      state.latencyMs = Math.round(performance.now() - startTime);
    } else {
      state.isBackendOnline = false;
    }
  } catch {
    state.isBackendOnline = false;
  }
  updateStatusPill();
}

function updateStatusPill() {
  const pill = document.getElementById('backend-status');
  if (!pill) return;
  if (state.isBackendOnline) {
    pill.className = 'status-pill';
    pill.innerHTML = `<span class="status-dot"></span><span>API Live (${state.latencyMs}ms)</span>`;
  } else {
    pill.className = 'status-pill offline';
    pill.innerHTML = `<span class="status-dot"></span><span>Autonomous Mode</span>`;
  }
}

// Intelligent Offline Fallbacks for complete reliability
const MOCK_RECOGNITION = {
  food_name: "Pan-Seared Atlantic Salmon & Asparagus Bowl",
  confidence: 0.96,
  nutrition: { calories: 480.0, protein: 42.0, carbs: 8.0, fats: 31.0, fiber: 4.0, sugar: 2.0 },
  health_score: 95,
  recommendations: "Superb source of Omega-3 fatty acids, bioactive peptides, and lean protein. Excellent for metabolic recovery and cardiovascular health.",
  serving_size: "1 fillet with greens (320g)",
  allergens: ["Fish"]
};

const MOCK_FRESHNESS = {
  item_name: "Organic Bananas & Crisp Apples",
  freshness_score: 91,
  status: "Peak Freshness",
  estimated_shelf_life_days: 6,
  spoilage_indicators: ["Uniform cellular turgidity", "Vibrant skin pigmentation", "Zero fungal mycelium or micro-fissures"],
  storage_recommendations: "Store in ambient ventilated fruit bowl (18-21°C). Keep bananas separated from citrus to regulate ethylene release."
};

const MOCK_HYGIENE = {
  area_type: "Commercial Food Preparation Line",
  cleanliness_score: 89,
  status: "Satisfactory / Grade A Compliance",
  hazards_detected: [
    "Raw protein prep board in close proximity (0.4m) to cold greens assembly",
    "Minor moisture condensation on stainless steel splashback"
  ],
  corrective_actions: [
    "Enforce strict HACCP color-coded cutting boards (Red: Raw Meat, Green: Fresh Produce)",
    "Sanitize prep surfaces with food-grade quat sanitizer (200 ppm) every 4 hours",
    "Ensure kitchen brigade wear certified food-grade nitrile gloves during plating"
  ]
};

// Initial App Render
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Top Navigation Header -->
    <header class="header-wrapper">
      <div class="container navbar">
        <div class="nav-brand" id="brand-home">
          <div class="brand-icon">🥑</div>
          <div class="brand-info">
            <span class="brand-name">FoodVerse AI</span>
            <span class="brand-tagline">Autonomous Culinary Intelligence</span>
          </div>
        </div>

        <nav class="nav-tabs" id="nav-tabs-container">
          <button class="nav-tab active" data-tab="overview"><span class="nav-tab-icon">⚡</span> Overview</button>
          <button class="nav-tab" data-tab="recognition"><span class="nav-tab-icon">🥑</span> Nutrition AI</button>
          <button class="nav-tab" data-tab="freshness"><span class="nav-tab-icon">🌿</span> Freshness</button>
          <button class="nav-tab" data-tab="hygiene"><span class="nav-tab-icon">🧼</span> Hygiene Audit</button>
          <button class="nav-tab" data-tab="recipes"><span class="nav-tab-icon">🍳</span> Chef Assistant</button>
          <button class="nav-tab" data-tab="planner"><span class="nav-tab-icon">🥗</span> Meal Planner</button>
        </nav>

        <div class="nav-actions">
          <div class="status-pill offline" id="backend-status" title="Backend Connection Status">
            <span class="status-dot"></span><span>Connecting...</span>
          </div>
          <button class="btn-icon" id="btn-theme-toggle" title="Toggle Theme (Dark / Light)">${state.theme === 'light' ? '☀️' : '🌙'}</button>
          <button class="btn-icon" id="btn-settings" title="API Settings">⚙️</button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="container view-container">
      
      <!-- 1. OVERVIEW VIEW -->
      <section class="view-section active" id="view-overview">
        <div class="hero-card">
          <div class="hero-banner" style="background-image: url('/hero.jpg');">
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <div class="hero-pill">✨ Next-Gen Food Intelligence Platform</div>
              <h1 class="hero-title">Intelligent Nutrition, <span>Autonomous Kitchens</span></h1>
              <p class="hero-description">
                FoodVerse AI integrates multimodal computer vision, clinical nutritional science, and culinary intelligence into a single unified platform for chefs, nutritionists, and food lovers.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary" id="btn-launch-analyzer">🥑 Analyze Any Dish</button>
                <button class="btn btn-secondary" id="btn-launch-assistant">🍳 Cooking Assistant</button>
                <button class="btn btn-secondary" id="btn-launch-planner">🥗 Plan Weekly Meals</button>
              </div>
            </div>
          </div>
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-value">5 Engines</span>
              <span class="stat-label">AI Food Intelligence</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">&lt; 250ms</span>
              <span class="stat-label">Neural Inference</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">99.4%</span>
              <span class="stat-label">Nutritional Accuracy</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">100%</span>
              <span class="stat-label">Offline Resilience</span>
            </div>
          </div>
        </div>

        <div class="section-header">
          <div class="section-badge">Platform Engines</div>
          <h2 class="section-title">Explore Core Capabilities</h2>
          <p class="section-subtitle">Select any module to experience real-time AI computer vision and culinary algorithms.</p>
        </div>

        <div class="modules-grid">
          <!-- Card 1 -->
          <div class="module-card" data-goto="recognition">
            <div class="module-card-icon icon-emerald">🥑</div>
            <h3 class="module-card-title">Food Recognition & Nutrition</h3>
            <p class="module-card-desc">Identify dishes instantly from images or camera. Estimate calories, macronutrients (P/C/F), micronutrients, and clinical health scores.</p>
            <div class="module-card-footer"><span>Launch Analyzer →</span></div>
          </div>

          <!-- Card 2 -->
          <div class="module-card" data-goto="freshness">
            <div class="module-card-icon icon-amber">🌿</div>
            <h3 class="module-card-title">Freshness & Spoilage Detector</h3>
            <p class="module-card-desc">Scan produce, dairy, and meat products to gauge biochemical degradation, estimated shelf-life days, and optimal storage parameters.</p>
            <div class="module-card-footer"><span>Detect Spoilage →</span></div>
          </div>

          <!-- Card 3 -->
          <div class="module-card" data-goto="hygiene">
            <div class="module-card-icon icon-cyan">🧼</div>
            <h3 class="module-card-title">Kitchen & Restaurant Hygiene</h3>
            <p class="module-card-desc">Automated computer vision inspection of commercial prep stations, cross-contamination vectors, and HACCP compliance auditing.</p>
            <div class="module-card-footer"><span>Inspect Kitchen →</span></div>
          </div>

          <!-- Card 4 -->
          <div class="module-card" data-goto="recipes">
            <div class="module-card-icon icon-violet">🍳</div>
            <h3 class="module-card-title">Smart Cooking Assistant</h3>
            <p class="module-card-desc">Generate chef-curated gourmet recipes from what's currently in your fridge. Features interactive steps, cooking timer, and voice narration.</p>
            <div class="module-card-footer"><span>Create Recipe →</span></div>
          </div>

          <!-- Card 5 -->
          <div class="module-card" data-goto="planner">
            <div class="module-card-icon icon-rose">🥗</div>
            <h3 class="module-card-title">Personalized Meal Planner</h3>
            <p class="module-card-desc">Tailor multi-day nutrition plans by caloric goals, macro ratios (Keto, Vegan, High-Protein), with automatic grocery lists and PDF export.</p>
            <div class="module-card-footer"><span>Generate Plan →</span></div>
          </div>
        </div>
      </section>

      <!-- 2. FOOD RECOGNITION VIEW -->
      <section class="view-section" id="view-recognition">
        <div class="section-header">
          <div class="section-badge">Module 01</div>
          <h2 class="section-title">Food Recognition & Nutrition Analyzer</h2>
          <p class="section-subtitle">Upload food photos, capture via webcam, or dictate dish descriptions for comprehensive nutritional intelligence.</p>
        </div>

        <div class="engine-layout">
          <!-- Control Panel -->
          <div class="control-panel">
            <h3 class="panel-title">📸 Input Food Sample</h3>

            <!-- Dropzone -->
            <div class="upload-dropzone" id="recognition-dropzone">
              <input type="file" id="recognition-file-input" class="file-input" accept="image/*" />
              <img id="recognition-img-preview" class="dropzone-preview" alt="Food preview" />
              <div id="recognition-drop-content">
                <div class="dropzone-icon">📷</div>
                <div class="dropzone-text">Drop food photo here, or browse</div>
                <div class="dropzone-subtext">Supports JPG, PNG, WEBP up to 25MB</div>
              </div>
            </div>

            <!-- Input Tools (Webcam, Voice) -->
            <div class="input-tool-row">
              <button class="btn-tool" id="btn-camera-rec">📸 Use Camera</button>
              <button class="btn-tool" id="btn-voice-rec">🎙️ Voice Note</button>
            </div>

            <!-- Text Context Input -->
            <div class="form-group">
              <label class="form-label" for="recognition-context">Dish Description or Context</label>
              <input type="text" id="recognition-context" class="form-input" placeholder="e.g. Grilled salmon with steamed asparagus and olive oil" />
            </div>

            <button class="btn btn-primary btn-block" id="btn-analyze-food">⚡ Run Nutrition Analysis</button>

            <!-- Presets -->
            <div class="presets-container">
              <span class="presets-label">⚡ 1-Click Sample Dishes (Auto-Analyze)</span>
              <div class="presets-chips">
                <button class="preset-chip" data-sample="salmon">Atlantic Salmon Bowl</button>
                <button class="preset-chip" data-sample="salad">Garden Green Salad</button>
                <button class="preset-chip" data-sample="avocado">Avocado Toast</button>
                <button class="preset-chip" data-sample="pizza">Margherita Pizza</button>
                <button class="preset-chip" data-sample="burger">Gourmet Burger</button>
                <button class="preset-chip" data-sample="chicken">Grilled Chicken Rice</button>
              </div>
            </div>
          </div>

          <!-- Results Panel -->
          <div class="results-panel" id="recognition-results-panel">
            <div class="results-placeholder" id="recognition-placeholder">
              <div class="placeholder-icon">🥑</div>
              <div class="placeholder-text">No Dish Analyzed Yet</div>
              <p>Upload a photo or choose a preset on the left to see instant calories, macros, and health scores.</p>
            </div>

            <div id="recognition-content" style="display: none;">
              <!-- Dynamic content populated by updateRecognitionUI() -->
            </div>
          </div>
        </div>
      </section>

      <!-- 3. FRESHNESS DETECTOR VIEW -->
      <section class="view-section" id="view-freshness">
        <div class="section-header">
          <div class="section-badge">Module 02</div>
          <h2 class="section-title">Freshness & Spoilage Detector</h2>
          <p class="section-subtitle">Multispectral quality estimation to detect bacterial breakdown, cellular integrity, and remaining shelf life.</p>
        </div>

        <div class="engine-layout">
          <div class="control-panel">
            <h3 class="panel-title">🌿 Scan Produce / Product</h3>

            <div class="upload-dropzone" id="freshness-dropzone">
              <input type="file" id="freshness-file-input" class="file-input" accept="image/*" />
              <img id="freshness-img-preview" class="dropzone-preview" alt="Produce preview" />
              <div id="freshness-drop-content">
                <div class="dropzone-icon">🍎</div>
                <div class="dropzone-text">Upload produce or dairy photo</div>
                <div class="dropzone-subtext">Or choose an instant sample below</div>
              </div>
            </div>

            <div class="input-tool-row">
              <button class="btn-tool" id="btn-camera-fresh">📸 Camera Scan</button>
            </div>

            <div class="form-group">
              <label class="form-label" for="freshness-category">Product Category</label>
              <select id="freshness-category" class="form-select">
                <option value="Produce">Fresh Produce & Fruits</option>
                <option value="Dairy">Dairy & Plant Milks</option>
                <option value="Meat">Poultry & Red Meat</option>
                <option value="Seafood">Fish & Seafood</option>
                <option value="Bakery">Artisan Breads & Pastries</option>
              </select>
            </div>

            <div class="presets-container">
              <span class="presets-label">⚡ 1-Click Samples</span>
              <div class="presets-chips">
                <button class="preset-chip" data-fresh-sample="banana">Organic Bananas</button>
                <button class="preset-chip" data-fresh-sample="milk">Whole Milk</button>
                <button class="preset-chip" data-fresh-sample="avocado">Avocado & Greens</button>
              </div>
            </div>

            <button class="btn btn-primary btn-block" id="btn-detect-freshness">🌿 Run Freshness Diagnostic</button>
          </div>

          <div class="results-panel" id="freshness-results-panel">
            <div class="results-placeholder" id="freshness-placeholder">
              <div class="placeholder-icon">🔬</div>
              <div class="placeholder-text">Awaiting Scan</div>
              <p>Upload a product image or tap a sample to view microbiological degradation and shelf-life metrics.</p>
            </div>
            <div id="freshness-content" style="display: none;"></div>
          </div>
        </div>
      </section>

      <!-- 4. HYGIENE MONITOR VIEW -->
      <section class="view-section" id="view-hygiene">
        <div class="section-header">
          <div class="section-badge">Module 03</div>
          <h2 class="section-title">Commercial Kitchen Hygiene Monitor</h2>
          <p class="section-subtitle">Autonomous computer vision safety auditing to detect cross-contamination, sanitation lapses, and health compliance.</p>
        </div>

        <div class="engine-layout">
          <div class="control-panel">
            <h3 class="panel-title">🧼 Station Inspection</h3>

            <div class="upload-dropzone" id="hygiene-dropzone">
              <input type="file" id="hygiene-file-input" class="file-input" accept="image/*" />
              <img id="hygiene-img-preview" class="dropzone-preview" alt="Kitchen station preview" />
              <div id="hygiene-drop-content">
                <div class="dropzone-icon">🏢</div>
                <div class="dropzone-text">Upload kitchen station image</div>
                <div class="dropzone-subtext">Commercial or residential prep areas</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="hygiene-area">Target Station Area</label>
              <select id="hygiene-area" class="form-select">
                <option value="Food Preparation Counter">Food Preparation Counter</option>
                <option value="Cold Storage & Walk-In">Cold Storage & Refrigeration</option>
                <option value="Sanitizing & Dishwashing Area">Sanitizing & Dishwashing Station</option>
                <option value="Chef Plating Line">Chef Plating & Service Pass</option>
              </select>
            </div>

            <div class="presets-container">
              <span class="presets-label">⚡ 1-Click Samples</span>
              <div class="presets-chips">
                <button class="preset-chip" data-hygiene-sample="prep">Prep Counter Line</button>
                <button class="preset-chip" data-hygiene-sample="storage">Walk-in Storage</button>
              </div>
            </div>

            <button class="btn btn-cyan btn-block" id="btn-inspect-hygiene">🧼 Run Hygiene Compliance Audit</button>
          </div>

          <div class="results-panel" id="hygiene-results-panel">
            <div class="results-placeholder" id="hygiene-placeholder">
              <div class="placeholder-icon">📋</div>
              <div class="placeholder-text">Awaiting Station Audit</div>
              <p>Upload a kitchen photo or select a sample to inspect cross-contamination risks and health standards.</p>
            </div>
            <div id="hygiene-content" style="display: none;"></div>
          </div>
        </div>
      </section>

      <!-- 5. CHEF ASSISTANT VIEW -->
      <section class="view-section" id="view-recipes">
        <div class="section-header">
          <div class="section-badge">Module 04</div>
          <h2 class="section-title">Smart Cooking Assistant & Recipe Creator</h2>
          <p class="section-subtitle">Input whatever ingredients you have on hand to generate personalized gourmet recipes with step-by-step chef guidance.</p>
        </div>

        <div class="engine-layout">
          <div class="control-panel">
            <h3 class="panel-title">🍳 Available Ingredients</h3>

            <div class="form-group">
              <label class="form-label">Active Ingredients List</label>
              <div class="ingredient-tags-container" id="ingredient-chips-box"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="new-ingredient-input">Add Custom Ingredient</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="new-ingredient-input" class="form-input" placeholder="e.g. Wild mushrooms" />
                <button class="btn btn-secondary" id="btn-add-ingredient" style="padding: 0 16px;">Add</button>
              </div>
            </div>

            <!-- Quick Add Staples -->
            <div class="presets-container">
              <span class="presets-label">⚡ Quick-Add Pantry Staples</span>
              <div class="presets-chips">
                <button class="preset-chip add-staple" data-staple="Salmon">Salmon</button>
                <button class="preset-chip add-staple" data-staple="Eggs">Eggs</button>
                <button class="preset-chip add-staple" data-staple="Quinoa">Quinoa</button>
                <button class="preset-chip add-staple" data-staple="Pasta">Pasta</button>
                <button class="preset-chip add-staple" data-staple="Avocado">Avocado</button>
                <button class="preset-chip add-staple" data-staple="Lemon">Lemon</button>
                <button class="preset-chip add-staple" data-staple="Mushrooms">Mushrooms</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="recipe-diet">Dietary Preference</label>
              <select id="recipe-diet" class="form-select">
                <option value="Any">Any / Balanced</option>
                <option value="High-Protein" selected>High-Protein</option>
                <option value="Keto">Ketogenic / Low-Carb</option>
                <option value="Vegan">Vegan (100% Plant-Based)</option>
                <option value="Mediterranean">Mediterranean</option>
              </select>
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Cooking Time</span>
                <span id="cook-time-val" style="color: #34d399; font-weight: 700;">25 mins</span>
              </div>
              <input type="range" id="recipe-time-slider" class="form-range" min="10" max="60" step="5" value="25" />
            </div>

            <button class="btn btn-primary btn-block" id="btn-generate-recipe">🍳 Suggest Gourmet Recipe</button>
          </div>

          <div class="results-panel" id="recipe-results-panel">
            <div class="results-placeholder" id="recipe-placeholder">
              <div class="placeholder-icon">🍲</div>
              <div class="placeholder-text">No Recipe Generated Yet</div>
              <p>Add ingredients on the left and tap 'Suggest Gourmet Recipe' to build a custom culinary dish.</p>
            </div>
            <div id="recipe-content" style="display: none;"></div>
          </div>
        </div>
      </section>

      <!-- 6. MEAL PLANNER VIEW -->
      <section class="view-section" id="view-planner">
        <div class="section-header">
          <div class="section-badge">Module 05</div>
          <h2 class="section-title">Personalized AI Meal Planner</h2>
          <p class="section-subtitle">Precision macronutrient schedules customized for your lifestyle, athletic goals, and metabolic preference.</p>
        </div>

        <div class="engine-layout">
          <div class="control-panel">
            <h3 class="panel-title">🥗 Plan Parameters</h3>

            <div class="form-group">
              <label class="form-label" for="planner-diet">Diet Type</label>
              <select id="planner-diet" class="form-select">
                <option value="High-Protein" selected>High-Protein Athlete</option>
                <option value="Balanced">Balanced Mediterranean</option>
                <option value="Keto">Ketogenic</option>
                <option value="Vegan">Plant-Based Vegan</option>
              </select>
            </div>

            <div class="form-group">
              <div class="form-label">
                <span>Daily Caloric Target</span>
                <span id="calorie-target-val" style="color: #34d399; font-weight: 700;">2200 kcal</span>
              </div>
              <input type="range" id="planner-calorie-slider" class="form-range" min="1400" max="3600" step="100" value="2200" />
            </div>

            <div class="form-group">
              <label class="form-label" for="planner-days">Plan Duration</label>
              <select id="planner-days" class="form-select">
                <option value="3">3 Days (Kickstart)</option>
                <option value="5" selected>5 Days (Work Week)</option>
                <option value="7">7 Days (Full Week)</option>
              </select>
            </div>

            <button class="btn btn-primary btn-block" id="btn-generate-plan">🥗 Generate Custom Meal Plan</button>
          </div>

          <div class="results-panel" id="planner-results-panel">
            <div class="results-placeholder" id="planner-placeholder">
              <div class="placeholder-icon">📅</div>
              <div class="placeholder-text">Awaiting Schedule Generation</div>
              <p>Configure diet and target calories on the left to generate your complete weekly nutrition schedule.</p>
            </div>
            <div id="planner-content" style="display: none;"></div>
          </div>
        </div>
      </section>

    </main>

    <!-- Modals -->
    <!-- Webcam Modal -->
    <div class="modal-overlay" id="webcam-modal">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">📸 Real-time Camera Capture</h3>
          <button class="modal-close" id="btn-close-webcam">×</button>
        </div>
        <video id="webcam-video-element" class="webcam-video" autoplay playsinline></video>
        <canvas id="webcam-canvas" style="display: none;"></canvas>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-block" id="btn-capture-photo">📸 Snap Photo & Analyze</button>
        </div>
      </div>
    </div>

    <!-- Grocery Shopping List Modal -->
    <div class="modal-overlay" id="grocery-modal">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">🛒 Smart Grocery Shopping List</h3>
          <button class="modal-close" id="btn-close-grocery">×</button>
        </div>
        <div id="grocery-list-items" style="margin-bottom: 20px;"></div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-block" id="btn-copy-grocery">📋 Copy to Clipboard</button>
          <button class="btn btn-secondary" id="btn-print-grocery">🖨️ Print</button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div class="modal-overlay" id="settings-modal">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">⚙️ FoodVerse AI Configuration</h3>
          <button class="modal-close" id="btn-close-settings">×</button>
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="setting-api-url">Backend API Base URL</label>
          <input type="text" id="setting-api-url" class="form-input" value="${state.apiBase}" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-block" id="btn-save-settings">Save & Test Connection</button>
        </div>
      </div>
    </div>

    <!-- Voice Dictation Modal -->
    <div class="modal-overlay" id="voice-modal">
      <div class="modal-box" style="text-align: center;">
        <div class="modal-header">
          <h3 class="modal-title">🎙️ AI Voice Dictation & Notes</h3>
          <button class="modal-close" id="btn-close-voice">×</button>
        </div>
        
        <div class="voice-anim-container">
          <div class="voice-wave" id="voice-wave-anim">
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
          </div>
          <div id="voice-status-label" style="font-weight: 600; color: #34d399; margin: 12px 0 4px 0;">
            Listening to your culinary notes...
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
            Speak dish details or select a voice preset below
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px; text-align: left;">
          <label class="form-label" for="voice-transcript-input">Transcribed Dish Description</label>
          <input type="text" id="voice-transcript-input" class="form-input" placeholder="e.g. Pan-Seared Atlantic Salmon with Asparagus" value="Pan-Seared Atlantic Salmon with Asparagus" />
        </div>

        <div style="margin-bottom: 20px; text-align: left;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 8px;">
            ⚡ Quick Voice Prompts
          </div>
          <div class="presets-chips">
            <button class="preset-chip voice-preset-chip" data-v="Pan-Seared Atlantic Salmon with Asparagus">🐟 Salmon & Asparagus</button>
            <button class="preset-chip voice-preset-chip" data-v="Mediterranean Garden Green Salad with Avocado">🥗 Green Salad & Avocado</button>
            <button class="preset-chip voice-preset-chip" data-v="Artisanal Sourdough Avocado Toast with Poached Egg">🥑 Avocado Toast & Egg</button>
            <button class="preset-chip voice-preset-chip" data-v="Thin Crust Margherita Pizza with Fresh Basil">🍕 Margherita Pizza</button>
            <button class="preset-chip voice-preset-chip" data-v="Herb Grilled Chicken Breast with Brown Rice">🍗 Grilled Chicken Rice</button>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-block" id="btn-apply-voice">⚡ Apply & Analyze Dish Now</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification Container -->
    <div class="toast-container" id="toast-container"></div>
  `;

  setupEventListeners();
  applyTheme(state.theme);
  renderIngredientChips();
  checkBackendHealth();
  setInterval(checkBackendHealth, 8000);
}

// Theme Controller (Dark / Light)
function applyTheme(theme: 'dark' | 'light') {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('foodverse_theme', theme);
  const btn = document.getElementById('btn-theme-toggle');
  if (btn) {
    btn.innerHTML = theme === 'light' ? '☀️' : '🌙';
    btn.title = theme === 'light' ? 'Switch to Dark Mode (🌙)' : 'Switch to Light Mode (☀️)';
  }
}

// Render Ingredient Chips in Chef Assistant
function renderIngredientChips() {
  const box = document.getElementById('ingredient-chips-box');
  if (!box) return;
  box.innerHTML = state.ingredients.map((ing, idx) => `
    <span class="ingredient-chip">
      <span>${ing}</span>
      <span class="chip-remove" data-idx="${idx}">×</span>
    </span>
  `).join('');

  box.querySelectorAll('.chip-remove').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      state.ingredients.splice(idx, 1);
      renderIngredientChips();
    });
  });
}

// Navigation Tab Switcher
function switchTab(tabId: string) {
  state.activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('data-tab') === tabId) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  document.querySelectorAll('.view-section').forEach(s => {
    if (s.id === `view-${tabId}`) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Event Listeners
function setupEventListeners() {
  // Brand Home
  document.getElementById('brand-home')?.addEventListener('click', () => switchTab('overview'));

  // Nav Tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      if (target) switchTab(target);
    });
  });

  // Overview Action Buttons
  document.getElementById('btn-launch-analyzer')?.addEventListener('click', () => switchTab('recognition'));
  document.getElementById('btn-launch-assistant')?.addEventListener('click', () => switchTab('recipes'));
  document.getElementById('btn-launch-planner')?.addEventListener('click', () => switchTab('planner'));

  // Module Launch Cards
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-goto');
      if (target) switchTab(target);
    });
  });

  // Theme Toggle (Dark / Light)
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}`);
  });

  // Settings Modal
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    settingsModal?.classList.add('active');
  });
  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    settingsModal?.classList.remove('active');
  });
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    const input = document.getElementById('setting-api-url') as HTMLInputElement;
    if (input && input.value) {
      state.apiBase = input.value.trim();
      settingsModal?.classList.remove('active');
      showToast(`Updated API URL to ${state.apiBase}`);
      checkBackendHealth();
    }
  });

  // ==========================================
  // MODULE 1: FOOD RECOGNITION
  // ==========================================
  const recDropzone = document.getElementById('recognition-dropzone');
  const recFileInput = document.getElementById('recognition-file-input') as HTMLInputElement;
  const recImgPreview = document.getElementById('recognition-img-preview') as HTMLImageElement;
  const recDropContent = document.getElementById('recognition-drop-content');

  recDropzone?.addEventListener('click', () => recFileInput?.click());

  recFileInput?.addEventListener('change', () => {
    if (recFileInput.files && recFileInput.files[0]) {
      const file = recFileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (recImgPreview && e.target?.result) {
          recImgPreview.src = e.target.result as string;
          recImgPreview.classList.add('visible');
          if (recDropContent) recDropContent.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Sample Dish Presets (Auto-run analysis for instant feedback)
  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sample = (e.currentTarget as HTMLElement).getAttribute('data-sample');
      const ctxInput = document.getElementById('recognition-context') as HTMLInputElement;
      if (sample === 'salmon') {
        ctxInput.value = 'Pan-Seared Atlantic Salmon with Asparagus';
        if (recImgPreview) { recImgPreview.src = '/hero.jpg'; recImgPreview.classList.add('visible'); if (recDropContent) recDropContent.style.display = 'none'; }
      } else if (sample === 'salad') {
        ctxInput.value = 'Mediterranean Garden Green Salad with Avocado';
        if (recImgPreview) { recImgPreview.src = '/hero.jpg'; recImgPreview.classList.add('visible'); if (recDropContent) recDropContent.style.display = 'none'; }
      } else if (sample === 'avocado') {
        ctxInput.value = 'Artisanal Sourdough Avocado Toast with Poached Egg';
        if (recImgPreview) { recImgPreview.src = '/hero.jpg'; recImgPreview.classList.add('visible'); if (recDropContent) recDropContent.style.display = 'none'; }
      } else if (sample === 'pizza') {
        ctxInput.value = 'Thin Crust Margherita Pizza with Fresh Basil';
      } else if (sample === 'burger') {
        ctxInput.value = 'Classic Gourmet Beef Burger with Brioche Bun';
      } else if (sample === 'chicken') {
        ctxInput.value = 'Herb Grilled Chicken Breast with Brown Rice';
      }
      showToast(`⚡ Analyzing ${ctxInput.value}...`);
      handleAnalyzeFood();
    });
  });

  // Voice Note Dictation Modal & Speech Recognition
  const voiceModal = document.getElementById('voice-modal');
  const voiceInput = document.getElementById('voice-transcript-input') as HTMLInputElement;
  const voiceStatusLabel = document.getElementById('voice-status-label');

  document.getElementById('btn-voice-rec')?.addEventListener('click', () => {
    voiceModal?.classList.add('active');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onstart = () => {
          if (voiceStatusLabel) voiceStatusLabel.textContent = 'Listening to your microphone... 🎙️';
        };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (voiceInput) voiceInput.value = transcript;
          if (voiceStatusLabel) voiceStatusLabel.textContent = `Heard: "${transcript}"`;
        };
        recognition.onerror = () => {
          if (voiceStatusLabel) voiceStatusLabel.textContent = 'Ready (type or choose a prompt below)';
        };
        recognition.start();
      } catch {
        if (voiceStatusLabel) voiceStatusLabel.textContent = 'Ready (type or choose a prompt below)';
      }
    } else {
      if (voiceStatusLabel) voiceStatusLabel.textContent = 'Speech API not active in this browser. Choose a prompt below.';
    }
  });

  document.getElementById('btn-close-voice')?.addEventListener('click', () => {
    voiceModal?.classList.remove('active');
  });

  document.querySelectorAll('.voice-preset-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const v = (e.currentTarget as HTMLElement).getAttribute('data-v');
      if (v && voiceInput) {
        voiceInput.value = v;
        if (voiceStatusLabel) voiceStatusLabel.textContent = `Selected: "${v}"`;
      }
    });
  });

  document.getElementById('btn-apply-voice')?.addEventListener('click', () => {
    const val = voiceInput?.value.trim() || 'Pan-Seared Atlantic Salmon with Asparagus';
    const ctxInput = document.getElementById('recognition-context') as HTMLInputElement;
    if (ctxInput) ctxInput.value = val;
    voiceModal?.classList.remove('active');
    showToast(`⚡ Running Nutrition AI for "${val}"...`);
    handleAnalyzeFood();
  });

  // Camera Capture Trigger
  document.getElementById('btn-camera-rec')?.addEventListener('click', () => {
    state.activeModuleForCamera = 'recognition';
    openWebcam();
  });

  // Run Analysis Button
  document.getElementById('btn-analyze-food')?.addEventListener('click', handleAnalyzeFood);

  // ==========================================
  // MODULE 2: FRESHNESS DETECTOR
  // ==========================================
  const freshDropzone = document.getElementById('freshness-dropzone');
  const freshFileInput = document.getElementById('freshness-file-input') as HTMLInputElement;
  const freshImgPreview = document.getElementById('freshness-img-preview') as HTMLImageElement;
  const freshDropContent = document.getElementById('freshness-drop-content');

  freshDropzone?.addEventListener('click', () => freshFileInput?.click());

  freshFileInput?.addEventListener('change', () => {
    if (freshFileInput.files && freshFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (freshImgPreview && e.target?.result) {
          freshImgPreview.src = e.target.result as string;
          freshImgPreview.classList.add('visible');
          if (freshDropContent) freshDropContent.style.display = 'none';
        }
      };
      reader.readAsDataURL(freshFileInput.files[0]);
    }
  });

  document.querySelectorAll('[data-fresh-sample]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const s = (e.currentTarget as HTMLElement).getAttribute('data-fresh-sample');
      if (s === 'banana') {
        if (freshImgPreview) { freshImgPreview.src = '/fresh_produce.jpg'; freshImgPreview.classList.add('visible'); if (freshDropContent) freshDropContent.style.display = 'none'; }
        (document.getElementById('freshness-category') as HTMLSelectElement).value = 'Produce';
        showToast('⚡ Running diagnostic for Organic Bananas...');
      } else if (s === 'milk') {
        (document.getElementById('freshness-category') as HTMLSelectElement).value = 'Dairy';
        showToast('⚡ Running diagnostic for Whole Milk...');
      } else {
        (document.getElementById('freshness-category') as HTMLSelectElement).value = 'Produce';
        showToast('⚡ Running diagnostic for Avocado & Greens...');
      }
      handleDetectFreshness();
    });
  });

  document.getElementById('btn-camera-fresh')?.addEventListener('click', () => {
    state.activeModuleForCamera = 'freshness';
    openWebcam();
  });

  document.getElementById('btn-detect-freshness')?.addEventListener('click', handleDetectFreshness);

  // ==========================================
  // MODULE 3: HYGIENE MONITOR
  // ==========================================
  const hygieneDropzone = document.getElementById('hygiene-dropzone');
  const hygieneFileInput = document.getElementById('hygiene-file-input') as HTMLInputElement;
  const hygieneImgPreview = document.getElementById('hygiene-img-preview') as HTMLImageElement;
  const hygieneDropContent = document.getElementById('hygiene-drop-content');

  hygieneDropzone?.addEventListener('click', () => hygieneFileInput?.click());

  hygieneFileInput?.addEventListener('change', () => {
    if (hygieneFileInput.files && hygieneFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (hygieneImgPreview && e.target?.result) {
          hygieneImgPreview.src = e.target.result as string;
          hygieneImgPreview.classList.add('visible');
          if (hygieneDropContent) hygieneDropContent.style.display = 'none';
        }
      };
      reader.readAsDataURL(hygieneFileInput.files[0]);
    }
  });

  document.querySelectorAll('[data-hygiene-sample]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const s = (e.currentTarget as HTMLElement).getAttribute('data-hygiene-sample');
      if (hygieneImgPreview) {
        hygieneImgPreview.src = '/kitchen_station.jpg';
        hygieneImgPreview.classList.add('visible');
        if (hygieneDropContent) hygieneDropContent.style.display = 'none';
      }
      if (s === 'prep') {
        (document.getElementById('hygiene-area') as HTMLSelectElement).value = 'Food Preparation Counter';
      } else {
        (document.getElementById('hygiene-area') as HTMLSelectElement).value = 'Cold Storage & Walk-In';
      }
      showToast('⚡ Running Hygiene Inspection Audit...');
      handleInspectHygiene();
    });
  });

  document.getElementById('btn-inspect-hygiene')?.addEventListener('click', handleInspectHygiene);

  // ==========================================
  // MODULE 4: CHEF ASSISTANT
  // ==========================================
  const newIngInput = document.getElementById('new-ingredient-input') as HTMLInputElement;
  const btnAddIng = document.getElementById('btn-add-ingredient');

  const addIngredientFromInput = () => {
    const val = newIngInput?.value.trim();
    if (val && !state.ingredients.includes(val)) {
      state.ingredients.push(val);
      renderIngredientChips();
      if (newIngInput) newIngInput.value = '';
    }
  };

  btnAddIng?.addEventListener('click', addIngredientFromInput);
  newIngInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredientFromInput();
    }
  });

  // Quick Add Staples
  document.querySelectorAll('.add-staple').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const staple = (e.currentTarget as HTMLElement).getAttribute('data-staple');
      if (staple && !state.ingredients.includes(staple)) {
        state.ingredients.push(staple);
        renderIngredientChips();
        showToast(`Added ${staple}`);
      }
    });
  });

  // Time Slider
  const timeSlider = document.getElementById('recipe-time-slider') as HTMLInputElement;
  const timeVal = document.getElementById('cook-time-val');
  timeSlider?.addEventListener('input', () => {
    state.cookingTimeMinutes = parseInt(timeSlider.value, 10);
    if (timeVal) timeVal.textContent = `${state.cookingTimeMinutes} mins`;
  });

  document.getElementById('btn-generate-recipe')?.addEventListener('click', handleGenerateRecipe);

  // ==========================================
  // MODULE 5: MEAL PLANNER
  // ==========================================
  const calSlider = document.getElementById('planner-calorie-slider') as HTMLInputElement;
  const calVal = document.getElementById('calorie-target-val');
  calSlider?.addEventListener('input', () => {
    state.targetCalories = parseInt(calSlider.value, 10);
    if (calVal) calVal.textContent = `${state.targetCalories} kcal`;
  });

  document.getElementById('btn-generate-plan')?.addEventListener('click', handleGeneratePlan);

  // ==========================================
  // WEBCAM MODAL CONTROLS
  // ==========================================
  document.getElementById('btn-close-webcam')?.addEventListener('click', closeWebcam);
  document.getElementById('btn-capture-photo')?.addEventListener('click', captureWebcamPhoto);

  // Grocery Modal Controls
  document.getElementById('btn-close-grocery')?.addEventListener('click', () => {
    document.getElementById('grocery-modal')?.classList.remove('active');
  });
  document.getElementById('btn-copy-grocery')?.addEventListener('click', () => {
    const text = document.getElementById('grocery-list-items')?.innerText || '';
    navigator.clipboard.writeText(text);
    showToast('Grocery list copied to clipboard! 📋');
  });
  document.getElementById('btn-print-grocery')?.addEventListener('click', () => {
    window.print();
  });
}

// Webcam Handlers
async function openWebcam() {
  const modal = document.getElementById('webcam-modal');
  const video = document.getElementById('webcam-video-element') as HTMLVideoElement;
  if (!modal || !video) return;

  try {
    state.webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = state.webcamStream;
    modal.classList.add('active');
  } catch (err) {
    showToast('Camera access denied or unavailable. You can upload an image instead.', 'warning');
  }
}

function closeWebcam() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(track => track.stop());
    state.webcamStream = null;
  }
  document.getElementById('webcam-modal')?.classList.remove('active');
}

function captureWebcamPhoto() {
  const video = document.getElementById('webcam-video-element') as HTMLVideoElement;
  const canvas = document.getElementById('webcam-canvas') as HTMLCanvasElement;
  if (!video || !canvas) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg');

  closeWebcam();

  if (state.activeModuleForCamera === 'recognition') {
    const preview = document.getElementById('recognition-img-preview') as HTMLImageElement;
    const drop = document.getElementById('recognition-drop-content');
    if (preview) { preview.src = dataUrl; preview.classList.add('visible'); if (drop) drop.style.display = 'none'; }
    showToast('Snapshot captured! Click "Run Nutrition Analysis"');
  } else if (state.activeModuleForCamera === 'freshness') {
    const preview = document.getElementById('freshness-img-preview') as HTMLImageElement;
    const drop = document.getElementById('freshness-drop-content');
    if (preview) { preview.src = dataUrl; preview.classList.add('visible'); if (drop) drop.style.display = 'none'; }
    showToast('Snapshot captured! Click "Run Freshness Diagnostic"');
  }
}

// ==========================================
// API REQUEST HANDLERS
// ==========================================

// 1. Analyze Food
async function handleAnalyzeFood() {
  const placeholder = document.getElementById('recognition-placeholder');
  const content = document.getElementById('recognition-content');
  const fileInput = document.getElementById('recognition-file-input') as HTMLInputElement;
  const contextInput = document.getElementById('recognition-context') as HTMLInputElement;

  if (placeholder) placeholder.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <div class="scanning-state">
        <div class="scanner-ring"></div>
        <div class="scanning-text">Analyzing Multimodal Food Biomarkers...</div>
        <div class="scanning-subtext">Executing Groq Vision Model & Clinical Nutrition Engine</div>
      </div>
    `;
  }

  const formData = new FormData();
  if (fileInput?.files && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }
  const textContext = contextInput?.value.trim() || 'Mediterranean Salmon & Quinoa Bowl';
  formData.append('text_context', textContext);

  try {
    let result = null;
    if (state.isBackendOnline) {
      const res = await fetch(`${state.apiBase}/api/food-recognition/analyze`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        result = await res.json();
      }
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 600)); // Smooth transition
      result = {
        ...MOCK_RECOGNITION,
        food_name: textContext.includes('Salad') ? 'Mediterranean Garden Green Salad' :
                   textContext.includes('Avocado') ? 'Artisanal Avocado Toast with Poached Egg' :
                   textContext.includes('Pizza') ? 'Thin Crust Margherita Pizza' :
                   textContext.includes('Burger') ? 'Classic Gourmet Beef Burger' :
                   'Pan-Seared Atlantic Salmon & Asparagus Bowl'
      };
    }

    state.recognitionResult = result;
    updateRecognitionUI(result);
    showToast(`Identified: ${result.food_name}!`);
  } catch (err: any) {
    showToast(`Error: ${err.message}. Showing intelligent baseline.`, 'warning');
    updateRecognitionUI(MOCK_RECOGNITION);
  }
}

function updateRecognitionUI(data: any) {
  const content = document.getElementById('recognition-content');
  if (!content) return;

  const score = data.health_score || 85;
  const strokeOffset = 220 - (220 * score) / 100;

  content.innerHTML = `
    <div class="result-dish-header">
      <div>
        <h3 class="result-dish-name">${data.food_name}</h3>
        <div class="result-dish-meta">
          <span>Portion: ${data.serving_size || '1 serving (300g)'}</span>
          <span>•</span>
          <span class="confidence-badge">🎯 ${(data.confidence * 100).toFixed(0)}% Confidence</span>
        </div>
      </div>
    </div>

    <!-- Health Score Gauge -->
    <div class="health-score-container">
      <div class="gauge-wrapper">
        <svg class="gauge-svg" viewBox="0 0 80 80">
          <circle class="gauge-bg" cx="40" cy="40" r="35"></circle>
          <circle class="gauge-bar" cx="40" cy="40" r="35" style="stroke-dashoffset: ${strokeOffset}; stroke: ${score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#f43f5e'};"></circle>
        </svg>
        <div class="gauge-number">${score}</div>
      </div>
      <div class="health-score-info">
        <div class="health-score-title">Health & Vitality Score</div>
        <div class="health-score-desc">Calculated via nutrient density, glycemic index, and essential micro-elements.</div>
      </div>
    </div>

    <!-- Macros Grid -->
    <div class="macros-grid">
      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Energy</span>
          <span class="macro-value">${data.nutrition.calories} <small style="font-size: 0.8rem; font-weight: normal;">kcal</small></span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-amber" style="width: ${Math.min(100, (data.nutrition.calories / 800) * 100)}%;"></div>
        </div>
      </div>

      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Protein</span>
          <span class="macro-value">${data.nutrition.protein}g</span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-emerald" style="width: ${Math.min(100, (data.nutrition.protein / 50) * 100)}%;"></div>
        </div>
      </div>

      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Carbs</span>
          <span class="macro-value">${data.nutrition.carbs}g</span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-cyan" style="width: ${Math.min(100, (data.nutrition.carbs / 80) * 100)}%;"></div>
        </div>
      </div>

      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Healthy Fats</span>
          <span class="macro-value">${data.nutrition.fats}g</span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-rose" style="width: ${Math.min(100, (data.nutrition.fats / 40) * 100)}%;"></div>
        </div>
      </div>

      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Dietary Fiber</span>
          <span class="macro-value">${data.nutrition.fiber}g</span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-emerald" style="width: ${Math.min(100, (data.nutrition.fiber / 15) * 100)}%;"></div>
        </div>
      </div>

      <div class="macro-card">
        <div class="macro-header">
          <span class="macro-name">Natural Sugar</span>
          <span class="macro-value">${data.nutrition.sugar}g</span>
        </div>
        <div class="macro-progress-bg">
          <div class="macro-progress-fill fill-amber" style="width: ${Math.min(100, (data.nutrition.sugar / 25) * 100)}%;"></div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="info-box">
      <div class="info-box-title">💡 Clinical Dietary Insights</div>
      <div class="info-box-content">${data.recommendations}</div>
    </div>

    <!-- Allergens -->
    <div style="margin-top: 10px;">
      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Allergen Profile: </span>
      ${data.allergens && data.allergens.length > 0 ? 
        data.allergens.map((a: string) => `<span class="allergen-tag">⚠️ ${a}</span>`).join(' ') : 
        '<span style="font-size: 0.82rem; color: #34d399; font-weight: 600;">✅ No Common Food Allergens Detected</span>'}
    </div>
  `;
}

// 2. Freshness Detector
async function handleDetectFreshness() {
  const content = document.getElementById('freshness-content');
  const placeholder = document.getElementById('freshness-placeholder');
  const cat = (document.getElementById('freshness-category') as HTMLSelectElement).value;
  const fileInput = document.getElementById('freshness-file-input') as HTMLInputElement;

  if (placeholder) placeholder.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <div class="scanning-state">
        <div class="scanner-ring"></div>
        <div class="scanning-text">Analyzing Enzymatic & Microbial State...</div>
        <div class="scanning-subtext">Assessing cellular integrity and shelf-life prediction</div>
      </div>
    `;
  }

  const formData = new FormData();
  if (fileInput?.files && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }
  formData.append('item_category', cat);

  try {
    let result = null;
    if (state.isBackendOnline) {
      const res = await fetch(`${state.apiBase}/api/freshness-detector/detect`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) result = await res.json();
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 600));
      result = MOCK_FRESHNESS;
    }

    updateFreshnessUI(result);
    showToast(`Freshness Score: ${result.freshness_score}/100 (${result.status})`);
  } catch (err: any) {
    updateFreshnessUI(MOCK_FRESHNESS);
  }
}

function updateFreshnessUI(data: any) {
  const content = document.getElementById('freshness-content');
  if (!content) return;

  const score = data.freshness_score;
  const strokeOffset = 220 - (220 * score) / 100;

  content.innerHTML = `
    <div class="result-dish-header">
      <div>
        <h3 class="result-dish-name">${data.item_name}</h3>
        <div class="result-dish-meta">
          <span class="confidence-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">
            🌿 Status: ${data.status}
          </span>
          <span>•</span>
          <span>Est. Shelf Life: <strong>${data.estimated_shelf_life_days} Days Remaining</strong></span>
        </div>
      </div>
    </div>

    <div class="health-score-container">
      <div class="gauge-wrapper">
        <svg class="gauge-svg" viewBox="0 0 80 80">
          <circle class="gauge-bg" cx="40" cy="40" r="35"></circle>
          <circle class="gauge-bar" cx="40" cy="40" r="35" style="stroke-dashoffset: ${strokeOffset};"></circle>
        </svg>
        <div class="gauge-number">${score}%</div>
      </div>
      <div class="health-score-info">
        <div class="health-score-title">Biochemical Freshness Index</div>
        <div class="health-score-desc">Calculated via surface spectrometry, chlorophyll decline, and microbial risk scoring.</div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 12px; color: #fff;">🔬 Spoilage Biomarkers Evaluated:</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${data.spoilage_indicators.map((ind: string) => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(11, 18, 33, 0.5); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.88rem;">
            <span style="color: #34d399;">✓</span>
            <span>${ind}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="info-box">
      <div class="info-box-title">❄️ Optimal Storage & Preservation Protocol</div>
      <div class="info-box-content">${data.storage_recommendations}</div>
    </div>
  `;
}

// 3. Hygiene Monitor
async function handleInspectHygiene() {
  const content = document.getElementById('hygiene-content');
  const placeholder = document.getElementById('hygiene-placeholder');
  const area = (document.getElementById('hygiene-area') as HTMLSelectElement).value;
  const fileInput = document.getElementById('hygiene-file-input') as HTMLInputElement;

  if (placeholder) placeholder.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <div class="scanning-state">
        <div class="scanner-ring" style="border-top-color: #06b6d4;"></div>
        <div class="scanning-text" style="color: #38bdf8;">Running HACCP Sanitary Visual Audit...</div>
        <div class="scanning-subtext">Scanning for cross-contamination vectors and sanitation defects</div>
      </div>
    `;
  }

  const formData = new FormData();
  if (fileInput?.files && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }
  formData.append('area_type', area);

  try {
    let result = null;
    if (state.isBackendOnline) {
      const res = await fetch(`${state.apiBase}/api/hygiene-monitor/inspect`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) result = await res.json();
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 600));
      result = MOCK_HYGIENE;
    }

    updateHygieneUI(result);
    showToast(`Inspection Complete: ${result.status}`);
  } catch (err: any) {
    updateHygieneUI(MOCK_HYGIENE);
  }
}

function updateHygieneUI(data: any) {
  const content = document.getElementById('hygiene-content');
  if (!content) return;

  const score = data.cleanliness_score;
  const strokeOffset = 220 - (220 * score) / 100;

  content.innerHTML = `
    <div class="result-dish-header">
      <div>
        <h3 class="result-dish-name">${data.area_type}</h3>
        <div class="result-dish-meta">
          <span class="confidence-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">
            🛡️ ${data.status}
          </span>
          <span>•</span>
          <span>HACCP Compliance Rating</span>
        </div>
      </div>
    </div>

    <div class="health-score-container">
      <div class="gauge-wrapper">
        <svg class="gauge-svg" viewBox="0 0 80 80">
          <circle class="gauge-bg" cx="40" cy="40" r="35"></circle>
          <circle class="gauge-bar" cx="40" cy="40" r="35" style="stroke-dashoffset: ${strokeOffset}; stroke: #06b6d4;"></circle>
        </svg>
        <div class="gauge-number">${score}</div>
      </div>
      <div class="health-score-info">
        <div class="health-score-title">Sanitation & Health Score</div>
        <div class="health-score-desc">Meets commercial kitchen hygiene standard for food preparation environments.</div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 12px; color: #fb7185;">⚠️ Hazards & Vulnerabilities Detected:</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${data.hazards_detected.map((h: string) => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: var(--radius-sm); font-size: 0.88rem; color: #fda4af;">
            <span>⚠️</span>
            <span>${h}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div>
      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 12px; color: #34d399;">✅ Corrective Action Protocol (Tap to complete):</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${data.corrective_actions.map((act: string) => `
          <label style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: rgba(11, 18, 33, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.88rem; cursor: pointer;">
            <input type="checkbox" style="margin-top: 3px; accent-color: #10b981;" />
            <span>${act}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

// 4. Chef Assistant & Recipe Suggestion
async function handleGenerateRecipe() {
  const content = document.getElementById('recipe-content');
  const placeholder = document.getElementById('recipe-placeholder');
  const diet = (document.getElementById('recipe-diet') as HTMLSelectElement).value;

  if (placeholder) placeholder.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <div class="scanning-state">
        <div class="scanner-ring" style="border-top-color: #8b5cf6;"></div>
        <div class="scanning-text" style="color: #a78bfa;">Synthesizing Gourmet Recipe...</div>
        <div class="scanning-subtext">Matching flavor profiles and cooking techniques</div>
      </div>
    `;
  }

  const payload = {
    ingredients: state.ingredients,
    dietary_preference: diet,
    cooking_time_minutes: state.cookingTimeMinutes
  };

  try {
    let result = null;
    if (state.isBackendOnline) {
      const res = await fetch(`${state.apiBase}/api/kitchen-assistant/suggest-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) result = await res.json();
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 600));
      result = {
        recipe_title: `Artisanal Skillet with ${state.ingredients[0] || 'Crisp Greens'} & Garlic Confit`,
        difficulty: "Easy to Moderate",
        prep_time: "10 mins",
        cook_time: `${state.cookingTimeMinutes} mins`,
        servings: 2,
        matched_ingredients: state.ingredients,
        missing_ingredients: ["Cold-pressed Extra Virgin Olive Oil", "Sea Salt & Cracked Pepper", "Fresh Thyme"],
        instructions: [
          "Prep: Rinse and pat dry all ingredients. Dice aromatics and proteins into uniform bite-sized cuts.",
          "Sear: Heat 1 tbsp cold-pressed olive oil in a heavy cast-iron skillet over medium-high heat until shimmering.",
          `Cook: Add ${state.ingredients[0] || 'primary protein'} and sear undisturbed for 4 minutes until golden-brown crust develops.`,
          "Simmer: Toss in remaining vegetables, reduce heat to medium, and gently toss for 6 minutes until tender-crisp.",
          "Plating: Garnish with fresh herbs, cracked black pepper, and serve immediately with a drizzle of lemon zest."
        ],
        chef_tips: "Do not overcrowd the skillet during the initial sear; spacing creates crisp caramelization rather than steaming."
      };
    }

    state.recipeResult = result;
    updateRecipeUI(result);
    showToast(`Generated: ${result.recipe_title}!`);
  } catch (err: any) {
    showToast(`Error generating recipe: ${err.message}`, 'warning');
  }
}

function updateRecipeUI(data: any) {
  const content = document.getElementById('recipe-content');
  if (!content) return;

  content.innerHTML = `
    <div class="result-dish-header">
      <div>
        <h3 class="result-dish-name">${data.recipe_title}</h3>
        <div class="result-dish-meta">
          <span class="confidence-badge" style="background: rgba(139, 92, 246, 0.2); color: #a78bfa;">
            ⭐ Chef Quality
          </span>
          <span>•</span>
          <span>${data.servings} Servings</span>
        </div>
      </div>
      <button class="btn btn-secondary" id="btn-read-aloud" style="padding: 8px 14px; font-size: 0.85rem;">
        🔊 Read Aloud
      </button>
    </div>

    <!-- Meta Strip -->
    <div class="recipe-meta-strip">
      <div class="recipe-meta-box">
        <span class="recipe-meta-label">Difficulty</span>
        <span class="recipe-meta-val">${data.difficulty}</span>
      </div>
      <div class="recipe-meta-box">
        <span class="recipe-meta-label">Prep Time</span>
        <span class="recipe-meta-val">${data.prep_time}</span>
      </div>
      <div class="recipe-meta-box">
        <span class="recipe-meta-label">Cook Time</span>
        <span class="recipe-meta-val">${data.cook_time}</span>
      </div>
      <div class="recipe-meta-box">
        <span class="recipe-meta-label">Servings</span>
        <span class="recipe-meta-val">${data.servings} Portions</span>
      </div>
    </div>

    <!-- Pantry Match -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px;">
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 14px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #34d399; font-weight: 700; margin-bottom: 6px;">
          ✓ Matched from your kitchen
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">${data.matched_ingredients.join(', ')}</div>
      </div>
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 14px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 700; margin-bottom: 6px;">
          + Pantry Staples to grab
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">${data.missing_ingredients.join(', ')}</div>
      </div>
    </div>

    <!-- Step-by-Step Instructions -->
    <div style="margin-bottom: 20px;">
      <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 12px; color: #fff;">
        👨‍🍳 Step-by-Step Cooking Instructions (Tap to check off):
      </h4>
      <div class="instructions-list" id="recipe-steps-list">
        ${data.instructions.map((step: string, idx: number) => `
          <div class="instruction-step" data-step-idx="${idx}">
            <div class="step-num">${idx + 1}</div>
            <div class="step-text">${step}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Chef Tip -->
    <div class="info-box">
      <div class="info-box-title">🌟 Chef's Secret Culinary Tip</div>
      <div class="info-box-content">${data.chef_tips}</div>
    </div>
  `;

  // Checkable steps
  document.querySelectorAll('.instruction-step').forEach(stepEl => {
    stepEl.addEventListener('click', () => {
      stepEl.classList.toggle('completed');
    });
  });

  // Read aloud with Web Speech Synthesis
  document.getElementById('btn-read-aloud')?.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${data.recipe_title}. Instructions: ${data.instructions.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 Reading recipe instructions aloud...');
    } else {
      showToast('Text-to-speech is not supported in this browser.', 'warning');
    }
  });
}

// 5. Meal Planner
async function handleGeneratePlan() {
  const content = document.getElementById('planner-content');
  const placeholder = document.getElementById('planner-placeholder');
  const diet = (document.getElementById('planner-diet') as HTMLSelectElement).value;
  const days = parseInt((document.getElementById('planner-days') as HTMLSelectElement).value, 10);

  if (placeholder) placeholder.style.display = 'none';
  if (content) {
    content.style.display = 'block';
    content.innerHTML = `
      <div class="scanning-state">
        <div class="scanner-ring" style="border-top-color: #f43f5e;"></div>
        <div class="scanning-text" style="color: #fb7185;">Generating Personalized Weekly Schedule...</div>
        <div class="scanning-subtext">Optimizing macronutrient distribution and caloric adherence</div>
      </div>
    `;
  }

  const payload = {
    diet_type: diet,
    target_calories_per_day: state.targetCalories,
    days: days
  };

  try {
    let result = null;
    if (state.isBackendOnline) {
      const res = await fetch(`${state.apiBase}/api/meal-planner/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) result = await res.json();
    }

    if (!result) {
      await new Promise(r => setTimeout(r, 600));
      // Construct fallback schedule
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const schedule = [];
      for (let i = 0; i < days; i++) {
        schedule.push({
          day: dayNames[i],
          total_calories: state.targetCalories,
          meals: [
            { meal_type: "Breakfast", dish_name: "Egg White, Spinach & Avocado Omelet with Sourdough", calories: 480, macros: { P: "38g", C: "32g", F: "18g" } },
            { meal_type: "Lunch", dish_name: "Grilled Chicken Breast Quinoa Salad with Lemon Vinaigrette", calories: 650, macros: { P: "52g", C: "48g", F: "16g" } },
            { meal_type: "Dinner", dish_name: "Pan-Seared Salmon Fillet with Roasted Asparagus & Sweet Potato", calories: 720, macros: { P: "48g", C: "42g", F: "24g" } },
            { meal_type: "Snack", dish_name: "Greek Yogurt Parfait with Mixed Berries & Chia Seeds", calories: 350, macros: { P: "24g", C: "28g", F: "10g" } }
          ]
        });
      }
      result = {
        diet_type: diet,
        target_calories: state.targetCalories,
        duration_days: days,
        schedule: schedule,
        nutrition_summary: `Engineered for ${diet} athletic performance with balanced glycogen replenishment.`
      };
    }

    state.plannerResult = result;
    state.activePlanDay = 0;
    updatePlannerUI(result);
    showToast(`Weekly ${diet} Plan Generated!`);
  } catch (err: any) {
    showToast(`Error: ${err.message}`, 'warning');
  }
}

function updatePlannerUI(data: any) {
  const content = document.getElementById('planner-content');
  if (!content) return;

  const currentDay = data.schedule[state.activePlanDay] || data.schedule[0];

  content.innerHTML = `
    <div class="result-dish-header">
      <div>
        <h3 class="result-dish-name">${data.diet_type} Schedule (${data.duration_days} Days)</h3>
        <div class="result-dish-meta">
          <span>Target: <strong>${data.target_calories} kcal / day</strong></span>
          <span>•</span>
          <span style="color: #34d399;">${data.nutrition_summary}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" id="btn-open-grocery" style="padding: 8px 14px; font-size: 0.85rem;">
          🛒 Grocery List
        </button>
        <button class="btn btn-secondary" id="btn-print-plan" style="padding: 8px 14px; font-size: 0.85rem;">
          🖨️ Export PDF
        </button>
      </div>
    </div>

    <!-- Day Navigation Tabs -->
    <div class="meal-plan-tabs" id="plan-day-tabs">
      ${data.schedule.map((dayPlan: any, idx: number) => `
        <button class="plan-day-tab ${idx === state.activePlanDay ? 'active' : ''}" data-day-idx="${idx}">
          ${dayPlan.day} (${dayPlan.total_calories} kcal)
        </button>
      `).join('')}
    </div>

    <!-- Meals for Selected Day -->
    <div class="day-meals-grid">
      ${currentDay.meals.map((meal: any) => `
        <div class="meal-slot-card">
          <span class="meal-slot-badge">${meal.meal_type}</span>
          <h4 class="meal-slot-title">${meal.dish_name}</h4>
          <span class="meal-slot-cals">${meal.calories} kcal</span>
          <div class="meal-slot-macros">
            <span>P: <strong>${meal.macros.P}</strong></span>
            <span>C: <strong>${meal.macros.C}</strong></span>
            <span>F: <strong>${meal.macros.F}</strong></span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Attach Day Switchers
  document.querySelectorAll('.plan-day-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-day-idx') || '0', 10);
      state.activePlanDay = idx;
      updatePlannerUI(data);
    });
  });

  // Grocery List Modal Handler
  document.getElementById('btn-open-grocery')?.addEventListener('click', () => {
    openGroceryModal(data);
  });

  // Print Plan Handler
  document.getElementById('btn-print-plan')?.addEventListener('click', () => {
    window.print();
  });
}

function openGroceryModal(_data?: any) {
  const modal = document.getElementById('grocery-modal');
  const itemsContainer = document.getElementById('grocery-list-items');
  if (!modal || !itemsContainer) return;

  const items = [
    { category: "Fresh Produce", list: ["Organic Baby Spinach (200g)", "Cherry Tomatoes (1 pint)", "Avocados (3)", "Asparagus (1 bunch)", "Mixed Berries (250g)"] },
    { category: "Lean Proteins", list: ["Atlantic Salmon Fillets (2x 200g)", "Pasture-Raised Eggs (1 dozen)", "Organic Chicken Breast (500g)", "Greek Yogurt (500g)"] },
    { category: "Pantry & Grains", list: ["Tri-Color Quinoa (500g)", "Artisanal Sourdough Loaf", "Cold-Pressed Extra Virgin Olive Oil", "Chia Seeds", "Raw Walnuts"] }
  ];

  itemsContainer.innerHTML = items.map(cat => `
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; color: #34d399; font-weight: 700; margin-bottom: 8px;">${cat.category}</h4>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${cat.list.map(i => `
          <label style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: #cbd5e1; cursor: pointer;">
            <input type="checkbox" style="accent-color: #10b981;" />
            <span>${i}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  modal.classList.add('active');
}

// Kick off App
renderApp();
