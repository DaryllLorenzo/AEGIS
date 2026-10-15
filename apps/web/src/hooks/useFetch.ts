"use client";

import { useEffect, useState } from "react";

type UseFetchResult<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Flip loading during render when deps change: setState inside an effect is
  // not allowed (react-hooks/set-state-in-effect). Callers pass primitive deps,
  // so a JSON key matches React's element-wise dep comparison.
  const depsKey = JSON.stringify(deps);
  const [prevDepsKey, setPrevDepsKey] = useState(depsKey);
  if (prevDepsKey !== depsKey) {
    setPrevDepsKey(depsKey);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading };
}
