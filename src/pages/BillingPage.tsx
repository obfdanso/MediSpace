import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, X, Zap, Shield, Loader2, Sun, Moon, User, CreditCard, Settings } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { getHealthProfile, upsertHealthProfile, isPremium } from "@/lib/supabase";
import { getPlans, startCheckout, verifyPayment } from "@/lib/api";
import type { Plan } from "@/lib/api";

type Tab = "plan" | "profile" | "preferences";

const CONDITIONS = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Hypertension", "Heart Disease",
  "Asthma", "COPD", "Thyroid Disorder", "Arthritis",
  "Depression", "Anxiety", "Migraine", "Chronic Pain",
  "Kidney Disease", "Liver Disease", "Cancer (current/past)", "None",
];

const COMMON_ALLERGIES = [
  "Penicillin", "Sulfa drugs", "Aspirin / NSAIDs", "Codeine",
  "Latex", "Peanuts", "Tree nuts", "Shellfish",
  "Eggs", "Milk / Dairy", "Soy", "Wheat / Gluten", "None",
];

export default function BillingPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading, user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>("plan");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/auth");
  }, [isLoggedIn, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</span>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="text-sm text-emerald-600 hover:underline font-medium"
        >
          ← Back to Chat
        </button>
      </div>

      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="overflow-x-auto mb-6 sm:mb-8">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit min-w-full sm:min-w-0">
          {([
            { id: "plan", label: "Plan & Billing", icon: CreditCard },
            { id: "profile", label: "Health Profile", icon: User },
            { id: "preferences", label: "Preferences", icon: Settings },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none whitespace-nowrap ${
                tab === id
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
          </div>
        </div>

        {tab === "plan" && <PlanTab />}
        {tab === "profile" && <ProfileTab userId={user?.id ?? null} tier={isPremium(profile) ? "premium" : "free"} onUpgrade={() => setTab("plan")} />}
        {tab === "preferences" && <PreferencesTab theme={theme} toggleTheme={toggleTheme} logout={logout} />}
      </div>
    </div>
  );
}

// ─── Plan Tab ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

function PlanTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const { profile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => setMessage({ type: "error", text: "Failed to load plans." }))
      .finally(() => setLoading(false));
  }, []);

  // Back from Paystack: it adds ?reference=... to the return address
  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) return;
    setChecking(true);
    verifyPayment(reference)
      .then(async (result) => {
        if (result.status === "credited") {
          await refreshProfile();
          setMessage({ type: "success", text: `Payment received. Premium is active until ${formatDate(result.premiumUntil)}.` });
        } else if (result.status === "pending") {
          setMessage({ type: "info", text: "Your payment is still processing. Premium switches on by itself once it is confirmed, so check back in a minute." });
        } else {
          setMessage({ type: "error", text: result.message });
        }
      })
      .catch(() => {
        setMessage({ type: "info", text: "We couldn't confirm your payment just now. If you paid, Premium switches on by itself once Paystack confirms it, so check back in a few minutes." });
      })
      .finally(() => {
        setChecking(false);
        setSearchParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coming back from Paystack with the Back button restores this page as it
  // was, button still saying "Opening Paystack...", so reset it
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) setPaying(false); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const handlePay = async () => {
    setPaying(true);
    setMessage(null);
    try {
      window.location.href = await startCheckout();
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not start the payment." });
      setPaying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  const premium = isPremium(profile);
  const currentTier = premium ? "premium" : "free";

  return (
    <div>
      {checking && (
        <div className="mb-6 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Loader2 size={16} className="animate-spin" /> Confirming your payment...
        </div>
      )}

      {message && (
        <div className={`mb-6 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center justify-between gap-3 ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            : message.type === "info"
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <div className="mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Current plan: <span className="text-emerald-600 dark:text-emerald-400 capitalize">{currentTier}</span>
          {premium && profile?.premium_until && (
            <span className="font-normal text-gray-500 dark:text-gray-400">· until {formatDate(profile.premium_until)}</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const isPremiumPlan = plan.id === "premium";

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 flex flex-col ${
                isPremiumPlan
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white shadow-sm"
              }`}
            >
              {isCurrent && (
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${
                  isPremiumPlan ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                }`}>
                  Current plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isPremiumPlan ? "bg-white/20" : "bg-emerald-100 dark:bg-emerald-900/40"
                }`}>
                  {isPremiumPlan
                    ? <Zap size={20} className="text-white" />
                    : <Shield size={20} className="text-emerald-600 dark:text-emerald-400" />
                  }
                </div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `${plan.currency} ${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className={`text-sm ml-1 ${isPremiumPlan ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"}`}>
                    / {plan.interval}
                  </span>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={16} className={`mt-0.5 flex-shrink-0 ${isPremiumPlan ? "text-white" : "text-emerald-500"}`} />
                    <span className={isPremiumPlan ? "text-emerald-50" : "text-gray-700 dark:text-gray-300"}>{f}</span>
                  </li>
                ))}
                {plan.unavailable.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-50">
                    <X size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isPremiumPlan ? (
                <button
                  onClick={handlePay}
                  disabled={paying || checking}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {paying
                    ? <><Loader2 size={16} className="animate-spin" /> Opening Paystack...</>
                    : premium
                    ? `Add ${plan.interval} · ${plan.currency} ${plan.price}`
                    : `Get Premium · ${plan.currency} ${plan.price}`
                  }
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {isCurrent ? "Active plan" : "Included with Premium"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
        Payments are handled securely by Paystack. Pay with card or Mobile Money. Each payment adds 30 days of Premium and does not renew automatically.
      </p>
    </div>
  );
}

// ─── Health Profile Tab ───────────────────────────────────────────────────────

function ProfileTab({ userId, tier, onUpgrade }: { userId: string | null; tier: "free" | "premium"; onUpgrade: () => void }) {
  if (tier !== "premium") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-12 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <Zap size={26} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Premium feature</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Health profile personalisation is available on the Premium plan. Upgrade to let the AI tailor responses to your medical history.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <Zap size={15} /> Upgrade to Premium
        </button>
      </div>
    );
  }
  return <ProfileForm userId={userId} />;
}

// Kept separate from the upsell above so its hooks always run in the same order
function ProfileForm({ userId }: { userId: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customCondition, setCustomCondition] = useState("");
  const [customAllergy, setCustomAllergy] = useState("");
  const [customMed, setCustomMed] = useState("");

  const [data, setData] = useState({
    date_of_birth: "", gender: "", height_cm: "", weight_kg: "", blood_type: "",
    existing_conditions: [] as string[], allergies: [] as string[],
    current_medications: [] as string[], smoking_status: "", alcohol_consumption: "",
    exercise_frequency: "", primary_health_goal: "",
  });

  useEffect(() => {
    if (!userId) return;
    getHealthProfile(userId).then(hp => {
      if (hp) {
        setData({
          date_of_birth: hp.date_of_birth ?? "",
          gender: hp.gender ?? "",
          height_cm: hp.height_cm?.toString() ?? "",
          weight_kg: hp.weight_kg?.toString() ?? "",
          blood_type: hp.blood_type ?? "",
          existing_conditions: hp.existing_conditions ?? [],
          allergies: hp.allergies ?? [],
          current_medications: hp.current_medications ?? [],
          smoking_status: hp.smoking_status ?? "",
          alcohol_consumption: hp.alcohol_consumption ?? "",
          exercise_frequency: hp.exercise_frequency ?? "",
          primary_health_goal: hp.primary_health_goal ?? "",
        });
      }
      setLoading(false);
    });
  }, [userId]);

  const set = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const toggleChip = (key: "existing_conditions" | "allergies", item: string) => {
    setData(prev => {
      const arr = prev[key];
      if (item === "None") return { ...prev, [key]: arr.includes("None") ? [] : ["None"] };
      const without = arr.filter(i => i !== "None");
      return { ...prev, [key]: without.includes(item) ? without.filter(i => i !== item) : [...without, item] };
    });
  };

  const addItem = (key: "existing_conditions" | "allergies" | "current_medications", val: string) => {
    const t = val.trim();
    if (!t) return;
    setData(prev => ({ ...prev, [key]: prev[key].includes(t) ? prev[key] : [...prev[key].filter(i => i !== "None"), t] }));
  };

  const removeItem = (key: "existing_conditions" | "allergies" | "current_medications", item: string) =>
    setData(prev => ({ ...prev, [key]: prev[key].filter(i => i !== item) }));

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage(null);
    const { error } = await upsertHealthProfile({
      user_id: userId,
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
    });
    setSaving(false);
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Health profile saved." });
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-5 py-3.5 rounded-xl text-sm font-medium flex items-center justify-between ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Label>Date of Birth</Label>
            <input type="date" value={data.date_of_birth} onChange={e => set("date_of_birth", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <Label>Gender</Label>
            <div className="flex flex-wrap gap-2">
              {[{ v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "non_binary", l: "Non-binary" }, { v: "prefer_not_to_say", l: "Prefer not to say" }].map(o => (
                <Chip key={o.v} selected={data.gender === o.v} onClick={() => set("gender", o.v)}>{o.l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Height (cm)</Label>
            <input type="number" value={data.height_cm} onChange={e => set("height_cm", e.target.value)} placeholder="e.g. 170" className={inputCls} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <input type="number" value={data.weight_kg} onChange={e => set("weight_kg", e.target.value)} placeholder="e.g. 70" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <Label>Blood Type</Label>
            <div className="flex flex-wrap gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"].map(bt => (
                <Chip key={bt} selected={data.blood_type === bt} onClick={() => set("blood_type", bt)} small>{bt === "unknown" ? "Unknown" : bt}</Chip>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Medical History */}
      <Section title="Medical History">
        <div className="space-y-6">
          <div>
            <Label>Existing Conditions</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CONDITIONS.map(c => <Chip key={c} selected={data.existing_conditions.includes(c)} onClick={() => toggleChip("existing_conditions", c)}>{c}</Chip>)}
            </div>
            <div className="flex gap-2">
              <input type="text" value={customCondition} onChange={e => setCustomCondition(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem("existing_conditions", customCondition); setCustomCondition(""); } }}
                placeholder="Add other condition..." className={inputCls} />
              <button onClick={() => { addItem("existing_conditions", customCondition); setCustomCondition(""); }} className={addBtnCls}>Add</button>
            </div>
            <TagList items={data.existing_conditions.filter(c => !CONDITIONS.includes(c))} onRemove={i => removeItem("existing_conditions", i)} />
          </div>
          <div>
            <Label>Known Allergies</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_ALLERGIES.map(a => <Chip key={a} selected={data.allergies.includes(a)} onClick={() => toggleChip("allergies", a)}>{a}</Chip>)}
            </div>
            <div className="flex gap-2">
              <input type="text" value={customAllergy} onChange={e => setCustomAllergy(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem("allergies", customAllergy); setCustomAllergy(""); } }}
                placeholder="Add other allergy..." className={inputCls} />
              <button onClick={() => { addItem("allergies", customAllergy); setCustomAllergy(""); }} className={addBtnCls}>Add</button>
            </div>
            <TagList items={data.allergies.filter(a => !COMMON_ALLERGIES.includes(a))} onRemove={i => removeItem("allergies", i)} />
          </div>
          <div>
            <Label>Current Medications</Label>
            <div className="flex gap-2">
              <input type="text" value={customMed} onChange={e => setCustomMed(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem("current_medications", customMed); setCustomMed(""); } }}
                placeholder="e.g. Metformin 500mg..." className={inputCls} />
              <button onClick={() => { addItem("current_medications", customMed); setCustomMed(""); }} className={addBtnCls}>Add</button>
            </div>
            <TagList items={data.current_medications} onRemove={i => removeItem("current_medications", i)} color="blue" />
          </div>
        </div>
      </Section>

      {/* Lifestyle */}
      <Section title="Lifestyle">
        <div className="space-y-6">
          <div>
            <Label>Smoking Status</Label>
            <div className="flex flex-wrap gap-2">
              {[{ v: "never", l: "Never" }, { v: "former", l: "Former smoker" }, { v: "occasional", l: "Occasional" }, { v: "daily", l: "Daily" }].map(o => (
                <Chip key={o.v} selected={data.smoking_status === o.v} onClick={() => set("smoking_status", o.v)}>{o.l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Alcohol Consumption</Label>
            <div className="flex flex-wrap gap-2">
              {[{ v: "never", l: "Never" }, { v: "rarely", l: "Rarely" }, { v: "moderate", l: "Moderate" }, { v: "frequent", l: "Frequent" }].map(o => (
                <Chip key={o.v} selected={data.alcohol_consumption === o.v} onClick={() => set("alcohol_consumption", o.v)}>{o.l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Label>Physical Activity</Label>
            <div className="flex flex-wrap gap-2">
              {[{ v: "sedentary", l: "Sedentary" }, { v: "light", l: "Light" }, { v: "moderate", l: "Moderate" }, { v: "active", l: "Active" }, { v: "very_active", l: "Very Active" }].map(o => (
                <Chip key={o.v} selected={data.exercise_frequency === o.v} onClick={() => set("exercise_frequency", o.v)}>{o.l}</Chip>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Health Goal */}
      <Section title="Primary Health Goal">
        <div className="flex flex-wrap gap-2">
          {["General health monitoring", "Manage a chronic condition", "Medication management", "Weight management", "Mental health support", "Symptom assessment", "Preventive care", "Other"].map(g => (
            <Chip key={g} selected={data.primary_health_goal === g} onClick={() => set("primary_health_goal", g)}>{g}</Chip>
          ))}
        </div>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-sm"
      >
        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Health Profile"}
      </button>
    </div>
  );
}

// ─── Preferences Tab ──────────────────────────────────────────────────────────

function PreferencesTab({ theme, toggleTheme, logout }: {
  theme: string;
  toggleTheme: () => void;
  logout: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Section title="Appearance">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            }`}
          >
            {theme === "dark"
              ? <><Moon size={15} /> Dark</>
              : <><Sun size={15} /> Light</>
            }
          </button>
        </div>
      </Section>

      <Section title="Account">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <button
              onClick={async () => { await logout(); navigate("/auth"); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";
const addBtnCls = "px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{children}</p>;
}

function Chip({ children, selected, onClick, small }: {
  children: React.ReactNode; selected: boolean; onClick: () => void; small?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`${small ? "px-3 py-1 text-xs" : "px-3 py-1.5 text-xs"} rounded-full border font-semibold transition-all ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

function TagList({ items, onRemove, color = "emerald" }: {
  items: string[]; onRemove: (i: string) => void; color?: "emerald" | "blue";
}) {
  if (items.length === 0) return null;
  const cls = color === "blue"
    ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
    : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map(item => (
        <span key={item} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
          {item}
          <button onClick={() => onRemove(item)} className="opacity-60 hover:opacity-100">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
