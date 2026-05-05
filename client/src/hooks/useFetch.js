import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn - async function that returns data
 * @param {Array} deps - dependency array (like useEffect)
 * @param {boolean} immediate - fetch on mount (default true)
 */
export function useFetch(fetchFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Something went wrong";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { data, isLoading, error, refetch: execute };
}
