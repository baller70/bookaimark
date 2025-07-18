import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { logger } from '../logger';

// Performance metrics tracking
interface LoadingMetrics {
  component: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: Error;
}

class PerformanceTracker {
  private metrics: LoadingMetrics[] = [];
  private loadingComponents = new Map<string, number>();

  startLoading(component: string): void {
    const startTime = performance.now();
    this.loadingComponents.set(component, startTime);
    logger.info(`Code splitting: Loading ${component}`, { startTime });
  }

  endLoading(component: string, success: boolean = true, error?: Error): void {
    const startTime = this.loadingComponents.get(component);
    if (!startTime) return;

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric: LoadingMetrics = {
      component,
      startTime,
      endTime,
      duration,
      success,
      error
    };

    this.metrics.push(metric);
    this.loadingComponents.delete(component);

    if (success) {
      logger.info(`Code splitting: Loaded ${component}`, { duration: `${duration.toFixed(2)}ms` });
    } else {
      logger.error(`Code splitting: Failed to load ${component}`, { duration: `${duration.toFixed(2)}ms`, error });
    }
  }

  getMetrics(): LoadingMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(): number {
    const successfulLoads = this.metrics.filter(m => m.success && m.duration);
    if (successfulLoads.length === 0) return 0;
    
    const totalTime = successfulLoads.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalTime / successfulLoads.length;
  }

  getFailureRate(): number {
    if (this.metrics.length === 0) return 0;
    const failures = this.metrics.filter(m => !m.success).length;
    return (failures / this.metrics.length) * 100;
  }
}

export const performanceTracker = new PerformanceTracker();

// Enhanced lazy loading with error boundaries and retry logic
interface LazyLoadOptions {
  retryCount?: number;
  retryDelay?: number;
  fallback?: ComponentType;
  preload?: boolean;
  chunkName?: string;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    retryCount = 3,
    retryDelay = 1000,
    preload = false,
    chunkName
  } = options;

  // Enhanced import function with retry logic
  const enhancedImport = async (): Promise<{ default: T }> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        performanceTracker.startLoading(componentName);
        
        const module = await importFn();
        
        performanceTracker.endLoading(componentName, true);
        return module;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retryCount) {
          performanceTracker.endLoading(componentName, false, lastError);
          throw lastError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  };

  const LazyComponent = lazy(enhancedImport);
  
  // Add chunk name for better debugging
  if (chunkName) {
    (LazyComponent as any).displayName = chunkName;
  }
  
  // Preload if requested
  if (preload) {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      enhancedImport().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }
  
  return LazyComponent;
}

// Route-based code splitting utilities
export const RouteComponents = {
  // Dashboard components
  Dashboard: createLazyComponent(
    () => import('../../app/dashboard/page'),
    'Dashboard',
    { chunkName: 'dashboard', preload: true }
  ),
  
  // Settings components
  Settings: createLazyComponent(
    () => import('../../app/settings/page'),
    'Settings',
    { chunkName: 'settings' }
  ),
  
  AISettings: createLazyComponent(
    () => import('../../app/settings/ai/page'),
    'AISettings',
    { chunkName: 'ai-settings' }
  ),
  
  DNASettings: createLazyComponent(
    () => import('../../app/settings/dna/page'),
    'DNASettings',
    { chunkName: 'dna-settings' }
  ),
  
  OracleSettings: createLazyComponent(
    () => import('../../app/settings/oracle/page'),
    'OracleSettings',
    { chunkName: 'oracle-settings' }
  ),
  
  // AI features
  AICopilot: createLazyComponent(
    () => import('../../app/ai-copilot/page'),
    'AICopilot',
    { chunkName: 'ai-copilot' }
  ),
  
  // Marketplace
  Marketplace: createLazyComponent(
    () => import('../../app/marketplace/page'),
    'Marketplace',
    { chunkName: 'marketplace' }
  ),
  
  // Analytics
  Analytics: createLazyComponent(
    () => import('../../app/analytics/page'),
    'Analytics',
    { chunkName: 'analytics' }
  ),
  
  // Monitoring
  Monitoring: createLazyComponent(
    () => import('../../app/monitoring/page'),
    'Monitoring',
    { chunkName: 'monitoring' }
  ),
  
  // Design System
  DesignSystem: createLazyComponent(
    () => import('../../components/design-system/DesignSystemShowcase'),
    'DesignSystem',
    { chunkName: 'design-system' }
  )
};

// Feature-based code splitting
export const FeatureComponents = {
  // Authentication
  AuthForm: createLazyComponent(
    () => import('../../components/auth/AuthForm'),
    'AuthForm',
    { chunkName: 'auth' }
  ),
  
  // Dashboard features
  BookmarkGrid: createLazyComponent(
    () => import('../../components/dashboard/BookmarkGrid'),
    'BookmarkGrid',
    { chunkName: 'bookmark-grid' }
  ),
  
  BookmarkList: createLazyComponent(
    () => import('../../components/dashboard/BookmarkList'),
    'BookmarkList',
    { chunkName: 'bookmark-list' }
  ),
  
  // Oracle components
  OracleChat: createLazyComponent(
    () => import('../../components/oracle/OracleChat'),
    'OracleChat',
    { chunkName: 'oracle-chat' }
  ),
  
  OracleVoice: createLazyComponent(
    () => import('../../components/oracle/OracleVoice'),
    'OracleVoice',
    { chunkName: 'oracle-voice' }
  ),
  
  // Monitoring components
  PerformanceMonitor: createLazyComponent(
    () => import('../../components/monitoring/PerformanceMonitor'),
    'PerformanceMonitor',
    { chunkName: 'performance-monitor' }
  ),
  
  SystemMetrics: createLazyComponent(
    () => import('../../components/monitoring/SystemMetrics'),
    'SystemMetrics',
    { chunkName: 'system-metrics' }
  )
};

// Heavy library code splitting
export const LibraryComponents = {
  // Chart libraries
  Charts: createLazyComponent(
    () => import('recharts').then(module => ({ default: module })),
    'Charts',
    { chunkName: 'charts' }
  ),
  
  // Code editor
  CodeEditor: createLazyComponent(
    () => import('@monaco-editor/react').then(module => ({ default: module.default })),
    'CodeEditor',
    { chunkName: 'code-editor' }
  ),
  
  // PDF viewer
  PDFViewer: createLazyComponent(
    () => import('react-pdf').then(module => ({ default: module })),
    'PDFViewer',
    { chunkName: 'pdf-viewer' }
  )
};

// Dynamic import utilities
export async function loadComponentDynamically<T>(
  importFn: () => Promise<T>,
  componentName: string
): Promise<T> {
  try {
    performanceTracker.startLoading(componentName);
    const module = await importFn();
    performanceTracker.endLoading(componentName, true);
    return module;
  } catch (error) {
    performanceTracker.endLoading(componentName, false, error as Error);
    throw error;
  }
}

// Bundle analysis utilities
export function getBundleInfo() {
  const metrics = performanceTracker.getMetrics();
  const componentsByChunk = new Map<string, LoadingMetrics[]>();
  
  metrics.forEach(metric => {
    const chunk = metric.component;
    if (!componentsByChunk.has(chunk)) {
      componentsByChunk.set(chunk, []);
    }
    componentsByChunk.get(chunk)!.push(metric);
  });
  
  return {
    totalComponents: metrics.length,
    averageLoadTime: performanceTracker.getAverageLoadTime(),
    failureRate: performanceTracker.getFailureRate(),
    chunkBreakdown: Array.from(componentsByChunk.entries()).map(([chunk, chunkMetrics]) => ({
      chunk,
      loadCount: chunkMetrics.length,
      averageLoadTime: chunkMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / chunkMetrics.length,
      successRate: (chunkMetrics.filter(m => m.success).length / chunkMetrics.length) * 100
    }))
  };
}

// Preloading utilities
export function preloadRoute(routeName: keyof typeof RouteComponents) {
  const component = RouteComponents[routeName];
  if (component) {
    // Trigger preload
    component.preload?.();
  }
}

export function preloadFeature(featureName: keyof typeof FeatureComponents) {
  const component = FeatureComponents[featureName];
  if (component) {
    // Trigger preload
    component.preload?.();
  }
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof window === 'undefined') return;
  
  const head = document.head;
  
  // Add DNS prefetch for external resources
  const dnsPrefetchUrls = [
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ];
  
  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    head.appendChild(link);
  });
  
  // Add preconnect for critical resources
  const preconnectUrls = [
    'https://fonts.gstatic.com'
  ];
  
  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    head.appendChild(link);
  });
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  return {
    metrics: performanceTracker.getMetrics(),
    averageLoadTime: performanceTracker.getAverageLoadTime(),
    failureRate: performanceTracker.getFailureRate(),
    bundleInfo: getBundleInfo()
  };
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Add resource hints
  addResourceHints();
  
  // Monitor bundle loading performance
  window.addEventListener('load', () => {
    const bundleInfo = getBundleInfo();
    logger.info('Bundle performance summary', bundleInfo);
  });
  
  // Log performance metrics periodically
  setInterval(() => {
    const metrics = performanceTracker.getMetrics();
    if (metrics.length > 0) {
      logger.info('Performance metrics update', {
        totalLoads: metrics.length,
        averageLoadTime: performanceTracker.getAverageLoadTime(),
        failureRate: performanceTracker.getFailureRate()
      });
    }
  }, 60000); // Every minute
} 