import { useRef, useCallback } from 'react';

type UseInfiniteScrollOptions = {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
};

export const useInfiniteScrollObserver = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getObserverRef = useCallback(
    (node: HTMLDivElement | null, options: UseInfiniteScrollOptions) => {
      const { hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = options;

      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    []
  );

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return { getObserverRef, disconnect };
};