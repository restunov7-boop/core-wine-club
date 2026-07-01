import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getDiscoveries } from "./api";
import type { DiscoveryListItem } from "./types";

const categoryLabels: Record<string, string> = {
  basics: "Основы",
  taste: "Вкус",
  ritual: "Ритуал",
  pairing: "Сочетания",
  culture: "Культура",
};

const difficultyLabels: Record<string, string> = {
  beginner: "Новичок",
  curious: "Любопытно",
  confident: "Уверенно",
};

export function DiscoveriesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DiscoveryListItem[]>([]);
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

        const response = await getDiscoveries();
        if (mounted) {
          setItems(response.items);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить открытия");
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
    return <ErrorState title="Не удалось открыть открытия" description={error} />;
  }

  if (isLoading) {
    return <LoadingState title="Открытия" description="Собираем первые винные маршруты..." />;
  }

  return (
    <section className="discoveries-page">
      <header className="discoveries-header">
        <span>Wine Club</span>
        <h1>Открытия</h1>
        <p>Короткие винные маршруты, чтобы увереннее выбирать, пробовать и понимать.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Открытий пока нет"
          description="Первые материалы появятся здесь после локального seed. Пока можно вернуться на главную."
          action={
            <Link className="primary-action" to="/home">
              На главную
            </Link>
          }
        />
      ) : (
        <div className="discoveries-list">
          {items.map((item) => (
            <Link className="discovery-card" key={item.slug} to={`/discoveries/${item.slug}`}>
              <article>
                <div className="discovery-meta">
                  <span>{categoryLabels[item.category] ?? item.category}</span>
                  <span>{difficultyLabels[item.difficulty] ?? item.difficulty}</span>
                  {item.estimated_minutes && <span>{item.estimated_minutes} мин</span>}
                </div>
                <h2>{item.title}</h2>
                {item.subtitle && <p className="discovery-card__subtitle">{item.subtitle}</p>}
                <p>{item.summary}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
