import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../auth/store";

import { completeOnboarding, getOnboardingStatus } from "./api";
import type { OnboardingData, OnboardingGoal, TastePreference, WineExperienceLevel } from "./types";

const experienceOptions: Array<{ value: WineExperienceLevel; label: string; description: string }> = [
  { value: "beginner", label: "Новичок", description: "Хочу спокойно разобраться с основами и перестать теряться у полки." },
  { value: "curious", label: "Любопытно", description: "Уже пробую разное и хочу замечать больше связей во вкусе." },
  { value: "confident", label: "Уверенно", description: "Есть опыт, хочется глубины, точности и красивого языка описания." },
];

const tasteOptions: Array<{ value: TastePreference; label: string }> = [
  { value: "red", label: "Красное" },
  { value: "white", label: "Белое" },
  { value: "sparkling", label: "Игристое" },
  { value: "rose", label: "Розе" },
  { value: "sweet", label: "Сладкое" },
  { value: "dry", label: "Сухое" },
  { value: "not_sure", label: "Пока не знаю" },
];

const goalOptions: Array<{ value: OnboardingGoal; label: string }> = [
  { value: "understand_wine", label: "Понимать вино" },
  { value: "choose_bottle", label: "Выбирать бутылку" },
  { value: "build_taste", label: "Понять свои предпочтения" },
  { value: "feel_confident", label: "Чувствовать уверенность" },
  { value: "explore_culture", label: "Исследовать культуру" },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const updateSessionProfile = useAuthStore((state) => state.updateSessionProfile);
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wineExperienceLevel, setWineExperienceLevel] = useState<WineExperienceLevel>("beginner");
  const [tastePreferences, setTastePreferences] = useState<TastePreference[]>([]);
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let mounted = true;
    getOnboardingStatus()
      .then((status) => {
        if (mounted) {
          setIsCompleted(status.is_completed);
          setIsLoading(false);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось проверить онбординг");
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const canContinue = useMemo(() => {
    if (step === 2) {
      return tastePreferences.length > 0;
    }
    if (step === 3) {
      return goals.length > 0;
    }
    return true;
  }, [goals.length, step, tastePreferences.length]);

  async function finish() {
    const payload: OnboardingData = {
      wine_experience_level: wineExperienceLevel,
      taste_preferences: tastePreferences,
      goals,
    };

    if (displayName.trim()) {
      payload.display_name = displayName.trim();
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await completeOnboarding(payload);
      updateSessionProfile(result.user, result.project_user);
      navigate("/home", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось завершить онбординг");
      setIsSubmitting(false);
    }
  }

  function toggleTaste(value: TastePreference) {
    setTastePreferences((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function toggleGoal(value: OnboardingGoal) {
    setGoals((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  if (isLoading) {
    return (
      <section className="onboarding-page">
        <div className="onboarding-panel">
          <span>Дочь винодела</span>
          <h1>Готовим вход</h1>
          <p>Проверяем твоё клубное пространство.</p>
        </div>
      </section>
    );
  }

  if (isCompleted) {
    return (
      <section className="onboarding-page">
        <div className="onboarding-panel">
          <span>Дочь винодела</span>
          <h1>Онбординг уже завершён</h1>
          <p>Можно сразу вернуться на главную страницу клуба.</p>
          <button className="primary-action" type="button" onClick={() => navigate("/home", { replace: true })}>
            На главную
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="onboarding-page">
      <div className="onboarding-panel">
        <span>Шаг {step + 1} из 6</span>
        {step === 0 && (
          <>
            <h1>Добро пожаловать в Дочь винодела</h1>
            <p>Мягкое пространство, где можно изучать вино, замечать вкус и увереннее выбирать бутылку.</p>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Как ты сейчас чувствуешь себя с вином?</h1>
            <p>Это не экзамен. Просто отметь точку, с которой хочется начать.</p>
            <div className="option-list">
              {experienceOptions.map((option) => (
                <button
                  className={wineExperienceLevel === option.value ? "option-pill option-pill--active" : "option-pill"}
                  key={option.value}
                  type="button"
                  onClick={() => setWineExperienceLevel(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Какие вкусы тебе ближе?</h1>
            <p>Можно выбрать несколько. Если пока не знаешь, это тоже хороший старт.</p>
            <div className="chip-grid">
              {tasteOptions.map((option) => (
                <button
                  className={tastePreferences.includes(option.value) ? "choice-chip choice-chip--active" : "choice-chip"}
                  key={option.value}
                  type="button"
                  onClick={() => toggleTaste(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Что тебе хочется чувствовать рядом с вином?</h1>
            <p>Выбери то, что откликается сейчас. Это поможет собрать личный маршрут, а не сухой список уроков.</p>
            <div className="chip-grid">
              {goalOptions.map((option) => (
                <button
                  className={goals.includes(option.value) ? "choice-chip choice-chip--active" : "choice-chip"}
                  key={option.value}
                  type="button"
                  onClick={() => toggleGoal(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Как к тебе обращаться?</h1>
            <p>Можно пропустить. Имя нужно только для более тёплого приветствия.</p>
            <input
              className="text-input"
              type="text"
              value={displayName}
              placeholder="Имя или ник"
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </>
        )}

        {step === 5 && (
          <>
            <h1>Всё готово</h1>
            <p>Сохраним первые настройки и откроем главную страницу клуба.</p>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="onboarding-actions">
          {step > 0 && (
            <button
              className="ghost-action ghost-action--icon"
              type="button"
              aria-label="Назад"
              onClick={() => setStep((current) => current - 1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          )}
          {step < 5 ? (
            <button
              className="primary-action"
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((current) => current + 1)}
            >
              Далее
            </button>
          ) : (
            <button className="primary-action" type="button" disabled={isSubmitting} onClick={finish}>
              {isSubmitting ? "Сохраняем..." : "Завершить"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
