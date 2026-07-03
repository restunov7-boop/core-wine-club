import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { BackButton } from "../../shared/ui/BackButton";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getBottleProgress } from "./api";
import { BottleVisual } from "./BottleVisual";
import type { BottleProgress } from "./types";

export function BottlePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<BottleProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const onboarding = await getOnboardingStatus();
        if (!mounted) {
          return;
        }

        if (!onboarding.is_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const response = await getBottleProgress();
        if (mounted) {
          setProgress(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р±СѓС‚С‹Р»РєСѓ");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return <ErrorState title="РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ Р±СѓС‚С‹Р»РєСѓ" description={error} />;
  }

  if (isLoading || !progress) {
    return <LoadingState title="РњРѕСЏ Р±СѓС‚С‹Р»РєР°" description="РЎРјРѕС‚СЂРёРј С‚РµРєСѓС‰РёР№ РїСЂРѕРіСЂРµСЃСЃ..." />;
  }

  return (
    <section className="bottle-page">
      <header className="bottle-header">
        <BackButton to="/my-path" label="Назад к маршруту" />
        <span>Wine Club</span>
        <h1>{progress.title}</h1>
        <p>{progress.subtitle}</p>
      </header>

      <article className="bottle-panel">
        <BottleVisual fillPercent={progress.fill_percent} />

        <div className="bottle-panel__content">
          <span>Р§С‚Рѕ Р·Р°РїРѕР»РЅСЏРµС‚ Р±СѓС‚С‹Р»РєСѓ</span>
          <strong>{progress.fill_percent}%</strong>
          <p>
            Р—Р°РїРѕР»РЅРµРЅРѕ {progress.completed_units} РёР· {progress.total_units}. РЎРµР№С‡Р°СЃ СѓС‡РёС‚С‹РІР°СЋС‚СЃСЏ Р·Р°РІРµСЂС€С‘РЅРЅС‹Рµ СѓСЂРѕРєРё,
            РґРѕ {progress.breakdown.diary.target_notes_count} Р·Р°РјРµС‚РѕРє РґРЅРµРІРЅРёРєР° Рё Р·Р°РІРµСЂС€С‘РЅРЅС‹Рµ РєРІРёР·С‹.
          </p>
          <div className="bottle-panel__stats">
            <div>
              <strong>
                {progress.breakdown.learning.completed_lessons_count} РёР·{" "}
                {progress.breakdown.learning.available_lessons_count}
              </strong>
              <small>СѓСЂРѕРєРё Р·Р°РІРµСЂС€РµРЅС‹</small>
            </div>
            <div>
              <strong>
                {progress.breakdown.diary.notes_count} РёР· {progress.breakdown.diary.target_notes_count}
              </strong>
              <small>Р·Р°РјРµС‚РєРё РІ РґРЅРµРІРЅРёРєРµ</small>
            </div>
            <div>
              <strong>
                {progress.breakdown.quizzes.completed_quizzes_count} РёР·{" "}
                {progress.breakdown.quizzes.available_quizzes_count}
              </strong>
              <small>РєРІРёР·С‹ Р·Р°РІРµСЂС€РµРЅС‹</small>
            </div>
          </div>
          <Link className="primary-action bottle-panel__action" to={progress.next_action.href}>
            {progress.next_action.label}
          </Link>
          {progress.completed_units === 0 && (
            <p className="bottle-panel__hint">
              РЎРµР№С‡Р°СЃ Р±СѓС‚С‹Р»РєР° РїСѓСЃС‚Р°СЏ вЂ” СЌС‚Рѕ РЅРѕСЂРјР°Р»СЊРЅРѕРµ РЅР°С‡Р°Р»Рѕ. Р—Р°РІРµСЂС€Рё РїРµСЂРІС‹Р№ СѓСЂРѕРє РёР»Рё РґРѕР±Р°РІСЊ Р·Р°РјРµС‚РєСѓ, Рё Р·РґРµСЃСЊ РїРѕСЏРІРёС‚СЃСЏ
              РїРµСЂРІС‹Р№ РІРёРґРёРјС‹Р№ РїСЂРѕРіСЂРµСЃСЃ.
            </p>
          )}
        </div>
      </article>

      <section className="activity-preview-panel">
        <div className="activity-preview-panel__header">
          <div>
            <span>РќРµРґР°РІРЅСЏСЏ Р°РєС‚РёРІРЅРѕСЃС‚СЊ</span>
            <h2>Р§С‚Рѕ РЅР°РїРѕР»РЅРёР»Рѕ Р±СѓС‚С‹Р»РєСѓ</h2>
          </div>
          <Link className="ghost-action" to="/progress">
            Р’СЃСЏ Р°РєС‚РёРІРЅРѕСЃС‚СЊ
          </Link>
        </div>

        {progress.activity_preview.length === 0 ? (
          <p className="activity-preview-panel__empty">
            РџРѕРєР° РЅРµС‚ РґРµР№СЃС‚РІРёР№. РЈСЂРѕРєРё, РєРІРёР·С‹ Рё Р·Р°РјРµС‚РєРё РїРѕСЏРІСЏС‚СЃСЏ Р·РґРµСЃСЊ, РєРѕРіРґР° РЅР°С‡РЅСѓС‚ РЅР°РїРѕР»РЅСЏС‚СЊ Р±СѓС‚С‹Р»РєСѓ.
          </p>
        ) : (
          <div className="activity-preview-list">
            {progress.activity_preview.map((item) => {
              const content = (
                <article className="activity-preview-item">
                  <span>{formatActivityDate(item.occurred_at)}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              );

              return item.href ? (
                <Link className="activity-preview-link" key={item.id} to={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

