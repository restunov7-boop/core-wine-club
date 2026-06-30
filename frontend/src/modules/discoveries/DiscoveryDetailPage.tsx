import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getOnboardingStatus } from "../onboarding/api";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";

import { getDiscovery } from "./api";
import type { DiscoveryDetail } from "./types";

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

export function DiscoveryDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [discovery, setDiscovery] = useState<DiscoveryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!slug) {
        setError("Не указан материал");
        setIsLoading(false);
        return;
      }

      try {
        const onboarding = await getOnboardingStatus();
        if (!mounted) {
          return;
        }

        if (!onboarding.is_completed) {
          navigate("/onboarding", { replace: true });
          return;
        }

        const response = await getDiscovery(slug);
        if (mounted) {
          setDiscovery(response);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось загрузить открытие");
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
  }, [navigate, slug]);

  const paragraphs = useMemo(
    () => discovery?.body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) ?? [],
    [discovery?.body],
  );

  if (error) {
    return <ErrorState title="Не удалось открыть материал" description={error} />;
  }

  if (isLoading || !discovery) {
    return <LoadingState title="Открытие" description="Открываем материал..." />;
  }

  return (
    <article className="discovery-detail">
      <Link className="back-link" to="/discoveries">
        Назад к открытиям
      </Link>

      <header className="discovery-detail__header">
        <div className="discovery-meta">
          <span>{categoryLabels[discovery.category] ?? discovery.category}</span>
          <span>{difficultyLabels[discovery.difficulty] ?? discovery.difficulty}</span>
          {discovery.estimated_minutes && <span>{discovery.estimated_minutes} мин</span>}
        </div>
        <h1>{discovery.title}</h1>
        {discovery.subtitle && <p className="discovery-detail__subtitle">{discovery.subtitle}</p>}
        <p>{discovery.summary}</p>
      </header>

      <div className="discovery-body">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
