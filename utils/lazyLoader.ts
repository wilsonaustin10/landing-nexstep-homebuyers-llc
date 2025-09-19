// Utility for ultra-lazy loading based on user interaction patterns
export class LazyLoader {
  private static instance: LazyLoader;
  private loadQueue: Map<string, () => Promise<void>> = new Map();
  private observer: IntersectionObserver | null = null;
  private idleCallbackId: number | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupObserver();
      this.setupIdleCallback();
    }
  }

  static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader();
    }
    return LazyLoader.instance;
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const loadKey = element.dataset.lazyLoad;
            if (loadKey && this.loadQueue.has(loadKey)) {
              const loader = this.loadQueue.get(loadKey);
              if (loader) {
                loader();
                this.loadQueue.delete(loadKey);
                this.observer?.unobserve(element);
              }
            }
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );
  }

  private setupIdleCallback(): void {
    if ('requestIdleCallback' in window) {
      this.idleCallbackId = requestIdleCallback(
        () => {
          // Load low-priority scripts when browser is idle
          this.loadQueue.forEach((loader, key) => {
            if (key.includes('low-priority')) {
              loader();
              this.loadQueue.delete(key);
            }
          });
        },
        { timeout: 10000 }
      );
    }
  }

  registerLazyLoad(
    key: string,
    loader: () => Promise<void>,
    element?: HTMLElement
  ): void {
    this.loadQueue.set(key, loader);
    
    if (element && this.observer) {
      element.dataset.lazyLoad = key;
      this.observer.observe(element);
    }
  }

  loadNow(key: string): void {
    const loader = this.loadQueue.get(key);
    if (loader) {
      loader();
      this.loadQueue.delete(key);
    }
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.idleCallbackId !== null) {
      cancelIdleCallback(this.idleCallbackId);
    }
    this.loadQueue.clear();
  }
}