import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getProgressActivity } from "./api";
import type { ProgressActivityItem } from "./types";

export function ProgressActivityPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProgressActivityItem[]>([]);
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

        const response = await getProgressActivity();
        if (mounted) {
          setItems(response.items);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить активность");
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
    return <ErrorState title="Не удалось открыть активность" description={error} />;
  }

  if (isLoading) {
    return <LoadingState title="Активность" description="Собираем недавнюю историю..." />;
  }

  return (
    <section className="progress-page">
      <header className="progress-header">
        <Link className="back-link" to="/bottle">
          К бутылке
        </Link>
        <span>Личная история</span>
        <h1>Активность</h1>
        <p>Приватная история действий, которые уже наполнили бутылку.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Активность появится позже"
          description="Здесь будет приватная история того, что наполняло бутылку: уроки, квизы и заметки дневника."
          action={
            <>
              <Link className="primary-action" to="/learn">
                Продолжить уроки
              </Link>
              <Link className="ghost-action" to="/diary/new">
                Добавить заметку
              </Link>
            </>
          }
        />
      ) : (
        <div className="activity-list">
          {items.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityCard({ item }: { item: ProgressActivityItem }) {
  const content = (
    <article className="activity-card">
      <span>{formatActivityDate(item.occurred_at)}</span>
      <h2>{item.title}</h2>
      <p>{item.description}</p>
    </article>
  );

  if (item.href) {
    return (
      <Link className="activity-card-link" to={item.href}>
        {content}
      </Link>
    );
  }

  return content;
}

export function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
