import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { getOnboardingStatus } from "../onboarding/api";

type DiscoveryPost = {
  id: string;
  type: "post" | "tip" | "video" | "social";
  title: string;
  body: string;
  tag: string;
};

const discoveryPosts: DiscoveryPost[] = [
  {
    id: "friday-sparkling",
    type: "tip",
    title: "Игристое не только для праздников",
    body: "Если хочется лёгкого вечера, попробуй сухое игристое к солёным закускам или мягкому сыру.",
    tag: "wine tip",
  },
  {
    id: "label-photo",
    type: "social",
    title: "Сфотографируй этикетку",
    body: "Самый простой способ не забыть бутылку: фото этикетки плюс одна честная фраза в дневнике.",
    tag: "заметка",
  },
  {
    id: "video-placeholder",
    type: "video",
    title: "Мини-видео: как держать бокал",
    body: "Скоро здесь появятся короткие видео-подсказки. Пока сохраняем место под формат.",
    tag: "video soon",
  },
  {
    id: "first-date-wine",
    type: "post",
    title: "Вино для спокойного знакомства",
    body: "Не бери самое сложное. Лучше свежий понятный стиль, который не спорит с разговором.",
    tag: "lifestyle",
  },
  {
    id: "rose-mood",
    type: "tip",
    title: "Розе — это не только лето",
    body: "Сухое розе хорошо работает с пастой, рыбой и вечерами, где хочется лёгкости без сладости.",
    tag: "pairing",
  },
];

const typeLabels: Record<DiscoveryPost["type"], string> = {
  post: "пост",
  tip: "tip",
  video: "video",
  social: "соцсеть",
};

export function DiscoveriesPage() {
  const navigate = useNavigate();
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
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Не удалось открыть открытия");
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
    return <LoadingState title="Открытия" description="Готовим ленту коротких wine tips..." />;
  }

  return (
    <section className="discoveries-page discoveries-page--feed">
      <header className="discoveries-header">
        <span>Wine girl notes</span>
        <h1>Открытия</h1>
        <p>Короткие посты, идеи и lifestyle-подсказки. Обучение теперь живёт в уроках, а здесь — лёгкая лента.</p>
      </header>

      <div className="discovery-feed">
        {discoveryPosts.map((post) => (
          <article className={`discovery-feed-card discovery-feed-card--${post.type}`} key={post.id}>
            <div className="discovery-meta">
              <span>{typeLabels[post.type]}</span>
              <span>{post.tag}</span>
            </div>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            {post.type === "video" && <div className="discovery-video-placeholder">Video placeholder</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
