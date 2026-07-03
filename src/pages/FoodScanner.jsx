import React, { useState, useRef, useEffect } from 'react'
import { IconScan } from '../components/Icons'
import './FoodScanner.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const MAX_SCANS = 20
const SCAN_COUNT_KEY = 'tribefit_scan_count'
const GOALS_KEY = 'tribefit_nutrition_goals'
const HISTORY_KEY = 'tribefit_nutrition_history'

const MOCK_RESULTS = [
  { food: 'Grilled Chicken Breast with Rice', calories: 480, protein: 42, carbs: 52, fat: 8 },
  { food: 'Caesar Salad with Croutons', calories: 320, protein: 18, carbs: 22, fat: 18 },
  { food: 'Protein Smoothie Bowl', calories: 380, protein: 28, carbs: 45, fat: 10 },
  { food: 'Salmon with Vegetables', calories: 520, protein: 38, carbs: 18, fat: 28 },
  { food: 'Pasta Bolognese', calories: 620, protein: 25, carbs: 72, fat: 22 },
  { food: 'Avocado Toast with Egg', calories: 350, protein: 14, carbs: 28, fat: 20 },
]

// --- LocalStorage helpers ---
function getScanCount() {
  return parseInt(localStorage.getItem(SCAN_COUNT_KEY) || '0', 10)
}
function incrementScanCount() {
  const count = getScanCount() + 1
  localStorage.setItem(SCAN_COUNT_KEY, count.toString())
  return count
}

function getGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) || null
  } catch { return null }
}
function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

function getHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
    // Keep only last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return history.filter(entry => entry.timestamp > thirtyDaysAgo)
  } catch { return [] }
}
function addToHistory(entry) {
  const history = getHistory()
  history.push({ ...entry, timestamp: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

function getTodayTotals(history) {
  const today = new Date().toDateString()
  const todayEntries = history.filter(e => new Date(e.timestamp).toDateString() === today)
  return todayEntries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
    meals: acc.meals + 1,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 })
}

function getWeeklyAverage(history) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekEntries = history.filter(e => e.timestamp > weekAgo)
  if (weekEntries.length === 0) return null
  const days = new Set(weekEntries.map(e => new Date(e.timestamp).toDateString())).size
  const totals = weekEntries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  return {
    calories: Math.round(totals.calories / days),
    protein: Math.round(totals.protein / days),
    carbs: Math.round(totals.carbs / days),
    fat: Math.round(totals.fat / days),
    days,
  }
}

export default function FoodScanner() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [goals, setGoals] = useState(getGoals)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [history, setHistory] = useState(getHistory)
  const [activeTab, setActiveTab] = useState('scan') // scan | tracker | goals
  const fileInputRef = useRef(null)

  useEffect(() => {
    setHistory(getHistory())
  }, [result])

  const handleCapture = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imagePreview) return
    if (getScanCount() >= MAX_SCANS) {
      setError('Scan limit reached. Try again tomorrow.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!OPENAI_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const mockResult = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
        setResult(mockResult)
        addToHistory(mockResult)
        incrementScanCount()
        setLoading(false)
        return
      }

      const base64Image = imagePreview.split(',')[1]
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a nutrition analyst. Analyze the food in the image and estimate its macronutrient content. Respond ONLY in this JSON format: {"food": "name of food", "calories": number, "protein": number (grams), "carbs": number (grams), "fat": number (grams)}. Be concise with the food name. Give your best estimate based on typical serving sizes.' },
            { role: 'user', content: [
              { type: 'text', text: 'Analyze this food image and estimate the macros.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } }
            ]}
          ],
          max_tokens: 200,
        }),
      })

      if (!response.ok) throw new Error('Failed to analyze image')
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setResult(parsed)
        addToHistory(parsed)
        incrementScanCount()
      } else {
        throw new Error('Could not parse response')
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveGoals = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newGoals = {
      objective: formData.get('objective'),
      dailyCalories: parseInt(formData.get('dailyCalories')) || 2000,
      dailyProtein: parseInt(formData.get('dailyProtein')) || 150,
      dailyCarbs: parseInt(formData.get('dailyCarbs')) || 200,
      dailyFat: parseInt(formData.get('dailyFat')) || 60,
      trainingDays: parseInt(formData.get('trainingDays')) || 4,
      targetWeight: formData.get('targetWeight') ? parseFloat(formData.get('targetWeight')) : null,
    }
    saveGoals(newGoals)
    setGoals(newGoals)
    setShowGoalForm(false)
  }

  const todayTotals = getTodayTotals(history)
  const weeklyAvg = getWeeklyAverage(history)
  const scansRemaining = MAX_SCANS - getScanCount()

  const progressPercent = (current, target) => {
    if (!target) return 0
    return Math.min(100, Math.round((current / target) * 100))
  }

  return (
    <div className="food-scanner">
      <div className="food-scanner-header">
        <h2>Nutrition</h2>
        <span className="scans-remaining">{scansRemaining} scans left</span>
      </div>

      {/* Tab navigation */}
      <div className="scanner-tabs">
        <button className={`scanner-tab ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>Scan</button>
        <button className={`scanner-tab ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>Tracker</button>
        <button className={`scanner-tab ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>Goals</button>
      </div>

      {/* === SCAN TAB === */}
      {activeTab === 'scan' && (
        <>
          <p className="food-scanner-subtitle">Snap a photo of your meal for AI macro estimation</p>

          {!imagePreview && (
            <div className="scanner-capture-area">
              <label className="scanner-capture-btn" htmlFor="food-camera-input">
                <IconScan size={32} />
                <span>Take Photo</span>
              </label>
              <input ref={fileInputRef} id="food-camera-input" type="file" accept="image/*" capture="environment" onChange={handleCapture} className="scanner-file-input" />
              <p className="scanner-hint">Or upload from gallery</p>
              <label className="scanner-upload-btn" htmlFor="food-upload-input">Upload Image</label>
              <input id="food-upload-input" type="file" accept="image/*" onChange={handleCapture} className="scanner-file-input" />
            </div>
          )}

          {imagePreview && (
            <div className="scanner-preview">
              <img src={imagePreview} alt="Food to analyze" className="scanner-preview-img" />
              <div className="scanner-preview-actions">
                {!result && <button className="btn-primary scanner-analyze-btn" onClick={handleAnalyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Macros'}</button>}
                <button className="btn-secondary scanner-retake-btn" onClick={handleReset}>{result ? 'Scan Another' : 'Retake'}</button>
              </div>
            </div>
          )}

          {loading && <div className="scanner-loading"><div className="loading-spinner" /><p>Analyzing your meal...</p></div>}
          {error && <div className="scanner-error"><p>{error}</p><button className="btn-secondary" onClick={() => setError(null)}>Dismiss</button></div>}

          {result && (
            <div className="scanner-results">
              <h3 className="scanner-results-title">{result.food}</h3>
              <div className="macro-grid">
                <div className="macro-card macro-calories"><span className="macro-value">{result.calories}</span><span className="macro-label">Calories</span></div>
                <div className="macro-card macro-protein"><span className="macro-value">{result.protein}g</span><span className="macro-label">Protein</span></div>
                <div className="macro-card macro-carbs"><span className="macro-value">{result.carbs}g</span><span className="macro-label">Carbs</span></div>
                <div className="macro-card macro-fat"><span className="macro-value">{result.fat}g</span><span className="macro-label">Fat</span></div>
              </div>
              <p className="scanner-disclaimer">Estimates based on AI analysis. Actual values may vary.</p>
            </div>
          )}
        </>
      )}

      {/* === TRACKER TAB === */}
      {activeTab === 'tracker' && (
        <div className="tracker-section">
          <h3 className="tracker-title">Today's Progress</h3>
          {goals ? (
            <div className="tracker-progress">
              <ProgressBar label="Calories" current={todayTotals.calories} target={goals.dailyCalories} unit="kcal" color="var(--accent-primary)" />
              <ProgressBar label="Protein" current={todayTotals.protein} target={goals.dailyProtein} unit="g" color="var(--accent-success)" />
              <ProgressBar label="Carbs" current={todayTotals.carbs} target={goals.dailyCarbs} unit="g" color="var(--accent-info)" />
              <ProgressBar label="Fat" current={todayTotals.fat} target={goals.dailyFat} unit="g" color="#fbbf24" />
            </div>
          ) : (
            <div className="tracker-no-goals">
              <p>Set your nutrition goals to start tracking</p>
              <button className="btn-primary" onClick={() => setActiveTab('goals')}>Set Goals</button>
            </div>
          )}

          <div className="tracker-today-summary">
            <span className="tracker-meals">{todayTotals.meals} meal{todayTotals.meals !== 1 ? 's' : ''} logged today</span>
          </div>

          {weeklyAvg && (
            <div className="tracker-weekly">
              <h3 className="tracker-title">7-Day Average</h3>
              <div className="weekly-stats">
                <div className="weekly-stat"><span className="weekly-stat-value">{weeklyAvg.calories}</span><span className="weekly-stat-label">Cal/day</span></div>
                <div className="weekly-stat"><span className="weekly-stat-value">{weeklyAvg.protein}g</span><span className="weekly-stat-label">Protein</span></div>
                <div className="weekly-stat"><span className="weekly-stat-value">{weeklyAvg.carbs}g</span><span className="weekly-stat-label">Carbs</span></div>
                <div className="weekly-stat"><span className="weekly-stat-value">{weeklyAvg.fat}g</span><span className="weekly-stat-label">Fat</span></div>
              </div>
              <p className="weekly-note">Based on {weeklyAvg.days} day{weeklyAvg.days !== 1 ? 's' : ''} of logging</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="tracker-history">
              <h3 className="tracker-title">Recent Meals</h3>
              <div className="history-list">
                {history.slice(-10).reverse().map((entry, i) => (
                  <div key={i} className="history-item">
                    <div className="history-item-name">{entry.food}</div>
                    <div className="history-item-macros">
                      <span>{entry.calories} kcal</span>
                      <span>{entry.protein}g P</span>
                      <span>{entry.carbs}g C</span>
                      <span>{entry.fat}g F</span>
                    </div>
                    <div className="history-item-time">{new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === GOALS TAB === */}
      {activeTab === 'goals' && (
        <div className="goals-section">
          {goals && !showGoalForm ? (
            <div className="goals-display">
              <h3 className="tracker-title">Your Goals</h3>
              <div className="goals-summary">
                <div className="goal-item"><span className="goal-label">Objective</span><span className="goal-value">{goals.objective}</span></div>
                <div className="goal-item"><span className="goal-label">Daily Calories</span><span className="goal-value">{goals.dailyCalories} kcal</span></div>
                <div className="goal-item"><span className="goal-label">Daily Protein</span><span className="goal-value">{goals.dailyProtein}g</span></div>
                <div className="goal-item"><span className="goal-label">Daily Carbs</span><span className="goal-value">{goals.dailyCarbs}g</span></div>
                <div className="goal-item"><span className="goal-label">Daily Fat</span><span className="goal-value">{goals.dailyFat}g</span></div>
                <div className="goal-item"><span className="goal-label">Training Days/Week</span><span className="goal-value">{goals.trainingDays}</span></div>
                {goals.targetWeight && <div className="goal-item"><span className="goal-label">Target Weight</span><span className="goal-value">{goals.targetWeight} kg</span></div>}
              </div>
              <button className="btn-secondary" onClick={() => setShowGoalForm(true)}>Edit Goals</button>
            </div>
          ) : (
            <form className="goals-form" onSubmit={handleSaveGoals}>
              <h3 className="tracker-title">{goals ? 'Edit Goals' : 'Set Your Goals'}</h3>

              <div className="form-field">
                <label htmlFor="goal-objective">Objective</label>
                <select id="goal-objective" name="objective" defaultValue={goals?.objective || 'weight_loss'}>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="muscle_building">Muscle Building</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="performance">Athletic Performance</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="goal-calories">Daily Calorie Target</label>
                <input id="goal-calories" name="dailyCalories" type="number" defaultValue={goals?.dailyCalories || 2000} min="1000" max="5000" />
              </div>

              <div className="form-field">
                <label htmlFor="goal-protein">Daily Protein (g)</label>
                <input id="goal-protein" name="dailyProtein" type="number" defaultValue={goals?.dailyProtein || 150} min="30" max="400" />
              </div>

              <div className="form-field">
                <label htmlFor="goal-carbs">Daily Carbs (g)</label>
                <input id="goal-carbs" name="dailyCarbs" type="number" defaultValue={goals?.dailyCarbs || 200} min="30" max="600" />
              </div>

              <div className="form-field">
                <label htmlFor="goal-fat">Daily Fat (g)</label>
                <input id="goal-fat" name="dailyFat" type="number" defaultValue={goals?.dailyFat || 60} min="20" max="200" />
              </div>

              <div className="form-field">
                <label htmlFor="goal-training">Training Days Per Week</label>
                <input id="goal-training" name="trainingDays" type="number" defaultValue={goals?.trainingDays || 4} min="0" max="7" />
              </div>

              <div className="form-field">
                <label htmlFor="goal-weight">Target Weight (kg, optional)</label>
                <input id="goal-weight" name="targetWeight" type="number" step="0.1" defaultValue={goals?.targetWeight || ''} placeholder="e.g. 70" />
              </div>

              <div className="goals-form-actions">
                <button type="submit" className="btn-primary">Save Goals</button>
                {goals && <button type="button" className="btn-secondary" onClick={() => setShowGoalForm(false)}>Cancel</button>}
              </div>
            </form>
          )}

          {/* Fitness Influencer Blog Links */}
          <div className="nutrition-blogs">
            <h3 className="tracker-title">Recommended Reading</h3>
            <div className="blog-links-list">
              <BlogLink title="High-Protein Meal Prep for the Week" author="FitNadia" category="Meal Prep" time="2d ago" />
              <BlogLink title="How to Calculate Your TDEE Accurately" author="Coach Maya" category="Fitness Goals" time="3d ago" />
              <BlogLink title="5 Pre-Workout Snacks for Maximum Energy" author="RunWithJake" category="Nutrition" time="4d ago" />
              <BlogLink title="Carb Cycling: A Beginner's Guide" author="StrengthByAlex" category="Meal Prep" time="5d ago" />
              <BlogLink title="Recovery Nutrition: What to Eat Post-Workout" author="SwimCoachLee" category="Workout Tips" time="1w ago" />
              <BlogLink title="Building a Sustainable Calorie Deficit" author="TrailBlazerTom" category="Fitness Goals" time="1w ago" />
              <BlogLink title="My Morning Routine for Peak Performance" author="CycleQueenSara" category="Routines" time="1w ago" />
              <BlogLink title="Intermittent Fasting for Athletes" author="YogaWithRen" category="Nutrition" time="2w ago" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressBar({ label, current, target, unit, color }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-numbers">{current} / {target} {unit}</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function BlogLink({ title, author, category, time }) {
  return (
    <div className="blog-link-item">
      <div className="blog-link-content">
        <h4 className="blog-link-title">{title}</h4>
        <div className="blog-link-meta">
          <span className="blog-link-author">{author}</span>
          <span className="blog-link-category">{category}</span>
          <span className="blog-link-time">{time}</span>
        </div>
      </div>
    </div>
  )
}
