import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/AuthContext'
import { getHealthProfile, upsertHealthProfile, upsertProfile } from '@/lib/supabase'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthData {
  date_of_birth: string
  gender: string
  height_cm: string
  weight_kg: string
  blood_type: string
  existing_conditions: string[]
  allergies: string[]
  current_medications: string[]
  smoking_status: string
  alcohol_consumption: string
  exercise_frequency: string
  primary_health_goal: string
}

const STEPS = ['Basic Info', 'Medical History', 'Lifestyle', 'Health Goals']

const CONDITIONS = [
  'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Hypertension', 'Heart Disease',
  'Asthma', 'COPD', 'Thyroid Disorder', 'Arthritis',
  'Depression', 'Anxiety', 'Migraine', 'Chronic Pain',
  'Kidney Disease', 'Liver Disease', 'Cancer (current/past)', 'None',
]

const COMMON_ALLERGIES = [
  'Penicillin', 'Sulfa drugs', 'Aspirin / NSAIDs', 'Codeine',
  'Latex', 'Peanuts', 'Tree nuts', 'Shellfish',
  'Eggs', 'Milk / Dairy', 'Soy', 'Wheat / Gluten', 'None',
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isEditMode = !!profile?.onboarding_completed

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customCondition, setCustomCondition] = useState('')
  const [customAllergy, setCustomAllergy] = useState('')
  const [customMed, setCustomMed] = useState('')

  const [data, setData] = useState<HealthData>({
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    blood_type: '',
    existing_conditions: [],
    allergies: [],
    current_medications: [],
    smoking_status: '',
    alcohol_consumption: '',
    exercise_frequency: '',
    primary_health_goal: '',
  })

  // Pre-load existing health profile when in edit mode
  useEffect(() => {
    if (!isEditMode || !user) return
    getHealthProfile(user.id).then(hp => {
      if (!hp) return
      setData({
        date_of_birth: hp.date_of_birth ?? '',
        gender: hp.gender ?? '',
        height_cm: hp.height_cm?.toString() ?? '',
        weight_kg: hp.weight_kg?.toString() ?? '',
        blood_type: hp.blood_type ?? '',
        existing_conditions: hp.existing_conditions ?? [],
        allergies: hp.allergies ?? [],
        current_medications: hp.current_medications ?? [],
        smoking_status: hp.smoking_status ?? '',
        alcohol_consumption: hp.alcohol_consumption ?? '',
        exercise_frequency: hp.exercise_frequency ?? '',
        primary_health_goal: hp.primary_health_goal ?? '',
      })
    })
  }, [isEditMode, user?.id])

  const set = <K extends keyof HealthData>(key: K, value: HealthData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayItem = (key: 'existing_conditions' | 'allergies', item: string) => {
    setData(prev => {
      const arr = prev[key]
      if (item === 'None') return { ...prev, [key]: arr.includes('None') ? [] : ['None'] }
      const without = arr.filter(i => i !== 'None')
      return {
        ...prev,
        [key]: without.includes(item) ? without.filter(i => i !== item) : [...without, item],
      }
    })
  }

  const addCustomItem = (key: 'existing_conditions' | 'allergies' | 'current_medications', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setData(prev => ({
      ...prev,
      [key]: prev[key].includes(trimmed) ? prev[key] : [...prev[key].filter(i => i !== 'None'), trimmed],
    }))
  }

  const removeItem = (key: 'existing_conditions' | 'allergies' | 'current_medications', item: string) => {
    setData(prev => ({ ...prev, [key]: prev[key].filter(i => i !== item) }))
  }

  const canProceed = () => {
    if (step === 0) return data.date_of_birth && data.gender
    if (step === 1) return true // optional
    if (step === 2) return data.smoking_status && data.alcohol_consumption && data.exercise_frequency
    return true
  }

  const handleSkip = async () => {
    if (!user) return
    setSaving(true)
    await upsertProfile({ id: user.id, onboarding_completed: true })
    await refreshProfile()
    navigate('/chat')
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)
    setError('')

    const { error: healthErr } = await upsertHealthProfile({
      user_id: user.id,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
      weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
      blood_type: data.blood_type || null,
      existing_conditions: data.existing_conditions,
      allergies: data.allergies,
      current_medications: data.current_medications,
      smoking_status: data.smoking_status || null,
      alcohol_consumption: data.alcohol_consumption || null,
      exercise_frequency: data.exercise_frequency || null,
      primary_health_goal: data.primary_health_goal || null,
    })

    if (healthErr) {
      setError(healthErr.message)
      setSaving(false)
      return
    }

    await upsertProfile({ id: user.id, onboarding_completed: true })
    await refreshProfile()
    navigate(isEditMode ? '/billing' : '/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 font-lobster">MediCare AI</span>
        </div>
        {isEditMode ? (
          <button
            onClick={() => navigate('/billing')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition font-medium"
          >
            ← Back to Settings
          </button>
        ) : (
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition font-medium"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 pb-5 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-emerald-600 text-white'
                    : i === step
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${
                  i <= step ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                }`}>{label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-8 lg:w-16 h-px mx-2 ${
                    i < step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <StepCard
              title="Basic Health Information"
              subtitle="Help us personalize your experience with some basic details."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data.date_of_birth}
                    onChange={e => set('date_of_birth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'non_binary', label: 'Non-binary' },
                      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map(opt => (
                      <OptionButton
                        key={opt.value}
                        selected={data.gender === opt.value}
                        onClick={() => set('gender', opt.value)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Height (cm) <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    value={data.height_cm}
                    onChange={e => set('height_cm', e.target.value)}
                    placeholder="e.g. 170"
                    min={100} max={250}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Weight (kg) <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <input
                    type="number"
                    value={data.weight_kg}
                    onChange={e => set('weight_kg', e.target.value)}
                    placeholder="e.g. 70"
                    min={20} max={300}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Blood Type <span className="text-gray-400 font-normal">optional</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'].map(bt => (
                      <OptionButton
                        key={bt}
                        selected={data.blood_type === bt}
                        onClick={() => set('blood_type', bt)}
                        small
                      >
                        {bt === 'unknown' ? 'Unknown' : bt}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* Step 1: Medical History */}
          {step === 1 && (
            <StepCard
              title="Medical History"
              subtitle="Select any conditions or allergies that apply. This helps us give you more accurate guidance."
            >
              <div className="space-y-7">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Existing Medical Conditions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CONDITIONS.map(c => (
                      <ToggleChip
                        key={c}
                        selected={data.existing_conditions.includes(c)}
                        onClick={() => toggleArrayItem('existing_conditions', c)}
                      >
                        {c}
                      </ToggleChip>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCondition}
                      onChange={e => setCustomCondition(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem('existing_conditions', customCondition); setCustomCondition('') } }}
                      placeholder="Add other condition..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => { addCustomItem('existing_conditions', customCondition); setCustomCondition('') }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Add
                    </button>
                  </div>
                  {data.existing_conditions.filter(c => !CONDITIONS.includes(c)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.existing_conditions.filter(c => !CONDITIONS.includes(c)).map(c => (
                        <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                          {c}
                          <button onClick={() => removeItem('existing_conditions', c)} className="hover:text-emerald-900 dark:hover:text-emerald-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Known Allergies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_ALLERGIES.map(a => (
                      <ToggleChip
                        key={a}
                        selected={data.allergies.includes(a)}
                        onClick={() => toggleArrayItem('allergies', a)}
                      >
                        {a}
                      </ToggleChip>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAllergy}
                      onChange={e => setCustomAllergy(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem('allergies', customAllergy); setCustomAllergy('') } }}
                      placeholder="Add other allergy..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => { addCustomItem('allergies', customAllergy); setCustomAllergy('') }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Add
                    </button>
                  </div>
                  {data.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(a => (
                        <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                          {a}
                          <button onClick={() => removeItem('allergies', a)} className="hover:text-emerald-900 dark:hover:text-emerald-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Medications
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={customMed}
                      onChange={e => setCustomMed(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem('current_medications', customMed); setCustomMed('') } }}
                      placeholder="e.g. Metformin 500mg, Lisinopril..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => { addCustomItem('current_medications', customMed); setCustomMed('') }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Add
                    </button>
                  </div>
                  {data.current_medications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {data.current_medications.map(m => (
                        <span key={m} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          {m}
                          <button onClick={() => removeItem('current_medications', m)} className="hover:text-blue-900 dark:hover:text-blue-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </StepCard>
          )}

          {/* Step 2: Lifestyle */}
          {step === 2 && (
            <StepCard
              title="Lifestyle Information"
              subtitle="Your lifestyle choices play a significant role in your health. All fields are required."
            >
              <div className="space-y-7">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Smoking Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'never', label: 'Never' },
                      { value: 'former', label: 'Former smoker' },
                      { value: 'occasional', label: 'Occasional' },
                      { value: 'daily', label: 'Daily' },
                    ].map(opt => (
                      <OptionButton
                        key={opt.value}
                        selected={data.smoking_status === opt.value}
                        onClick={() => set('smoking_status', opt.value)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Alcohol Consumption <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'never', label: 'Never' },
                      { value: 'rarely', label: 'Rarely' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'frequent', label: 'Frequent' },
                    ].map(opt => (
                      <OptionButton
                        key={opt.value}
                        selected={data.alcohol_consumption === opt.value}
                        onClick={() => set('alcohol_consumption', opt.value)}
                      >
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Physical Activity Level <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                      { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
                      { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
                      { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
                      { value: 'very_active', label: 'Very Active', desc: 'Very intense daily exercise or physical job' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('exercise_frequency', opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                          data.exercise_frequency === opt.value
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        <div>
                          <span className={`text-sm font-semibold ${data.exercise_frequency === opt.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {opt.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{opt.desc}</span>
                        </div>
                        {data.exercise_frequency === opt.value && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* Step 3: Health Goals */}
          {step === 3 && (
            <StepCard
              title="Primary Health Goal"
              subtitle="What is your main reason for using MediCare AI? This helps us tailor your experience."
            >
              <div className="space-y-3">
                {[
                  { value: 'General health monitoring', desc: 'Stay on top of my overall health' },
                  { value: 'Manage a chronic condition', desc: 'Get guidance on living with a long-term condition' },
                  { value: 'Medication management', desc: 'Track medications and check interactions' },
                  { value: 'Weight management', desc: 'Support for diet, nutrition, and weight goals' },
                  { value: 'Mental health support', desc: 'Information and resources for mental wellbeing' },
                  { value: 'Symptom assessment', desc: 'Understand symptoms before seeing a doctor' },
                  { value: 'Preventive care', desc: 'Learn how to prevent illness and stay healthy' },
                  { value: 'Other', desc: 'Something else' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('primary_health_goal', opt.value)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all ${
                      data.primary_health_goal === opt.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${data.primary_health_goal === opt.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {opt.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                    {data.primary_health_goal === opt.value && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 ml-3">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'w-6 bg-emerald-600' : i < step ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition shadow-md disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {isEditMode ? 'Save Changes' : 'Complete Setup'} <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-7">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">{subtitle}</p>
      {children}
    </div>
  )
}

function OptionButton({ children, selected, onClick, small }: {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} rounded-xl border font-semibold transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleChip({ children, selected, onClick }: {
  children: React.ReactNode
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {children}
    </button>
  )
}
