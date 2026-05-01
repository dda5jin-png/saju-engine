"use client";

import { useEffect, useMemo, useState } from "react";

const BASE_COUNT = 12402;
const VISITED_KEY = "orabit:home-visit-counted";

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

export default function VisitorCounter() {
  const [count, setCount] = useState(BASE_COUNT);
  const [displayCount, setDisplayCount] = useState(BASE_COUNT);

  useEffect(() => {
    let cancelled = false;

    async function syncCounter() {
      const alreadyCounted = window.localStorage.getItem(VISITED_KEY) === "true";
      const method = alreadyCounted ? "GET" : "POST";

      try {
        const response = await fetch("/api/visit-counter", {
          method,
          cache: "no-store",
        });
        const data = (await response.json()) as { count?: number };
        const nextCount = Number(data.count ?? (alreadyCounted ? BASE_COUNT : BASE_COUNT + 1));

        if (!cancelled) {
          setCount(nextCount);
          if (!alreadyCounted) {
            window.localStorage.setItem(VISITED_KEY, "true");
          }
        }
      } catch {
        if (!cancelled && !alreadyCounted) {
          setCount(BASE_COUNT + 1);
          window.localStorage.setItem(VISITED_KEY, "true");
        }
      }
    }

    void syncCounter();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (displayCount === count) return;

    const start = displayCount;
    const distance = count - start;
    const duration = 800;
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + distance * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [count, displayCount]);

  const label = useMemo(() => formatCount(displayCount), [displayCount]);

  return (
    <p className="text-center text-sm text-[#F8F4EA]/42" aria-live="polite">
      현재까지 <span className="font-bold text-[#D6B46A]/80 tabular-nums">{label}</span>명의 사주가 분석되었습니다.
    </p>
  );
}
