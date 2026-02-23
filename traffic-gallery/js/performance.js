/**
 * ============================================================================
 * 交通图库 - 性能优化脚本 (performance.js)
 * ============================================================================
 * 
 * 【文件说明】
 * 本文件提供网站性能优化功能，包括：
 * - 图片懒加载
 * - 资源预加载
 * - 防抖节流
 * - 缓存管理
 * - 性能监控
 * 
 * 【主要功能】
 * 1. 懒加载：图片和内容的延迟加载
 * 2. 预加载：关键资源的提前加载
 * 3. 防抖节流：优化高频事件处理
 * 4. 缓存策略：localStorage 和内存缓存
 * 5. 性能监控：页面加载时间统计
 * 
 * 【使用方法】
 * 在页面中引入：<script src="js/performance.js"></script>
 * 图片添加 data-src 属性，自动启用懒加载
 * 
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v1.0.0
 * ============================================================================
 */

// ============================================
// 第一部分：懒加载
// ============================================

/**
 * 图片懒加载类
 * 使用 Intersection Observer API 实现高效的图片懒加载
 */
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',      // 提前加载的距离
            threshold: 0.01,         // 触发阈值
            placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
            ...options
        };
        
        this.images = new Map();
        this.observer = null;
        this.init();
    }
    
    /**
     * 初始化懒加载
     */
    init() {
        // 检查浏览器支持
        if (!('IntersectionObserver' in window)) {
            this.fallbackLoad();
            return;
        }
        
        // 创建观察器
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
        
        // 开始观察
        this.observeImages();
    }
    
    /**
     * 处理交叉观察事件
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }
    
    /**
     * 加载单张图片
     */
    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (!src) return;
        
        // 创建临时图片预加载
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            if (srcset) img.srcset = srcset;
            img.classList.add('loaded');
            img.classList.remove('lazy');
        };
        
        tempImg.onerror = () => {
            img.classList.add('error');
            img.dispatchEvent(new CustomEvent('lazyError', { detail: { src } }));
        };
        
        tempImg.src = src;
    }
    
    /**
     * 观察所有待加载图片
     */
    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (!img.classList.contains('loaded')) {
                this.observer.observe(img);
                img.classList.add('lazy');
            }
        });
    }
    
    /**
     * 降级处理（不支持 Intersection Observer 的浏览器）
     */
    fallbackLoad() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
    
    /**
     * 刷新（用于动态添加的图片）
     */
    refresh() {
        if (this.observer) {
            this.observeImages();
        }
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// ============================================
// 第二部分：防抖节流
// ============================================

/**
 * 防抖函数
 * 延迟执行，如果在延迟期间再次调用，重新计时
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 */
function debounce(func, wait = 300, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const context = this;
        
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

/**
 * 节流函数
 * 在指定时间内只执行一次
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// 第三部分：缓存管理
// ============================================

/**
 * 缓存管理器
 * 提供内存缓存和 localStorage 缓存的统一接口
 */
class CacheManager {
    constructor(options = {}) {
        this.options = {
            prefix: 'tg_cache_',     // 缓存键前缀
            defaultTTL: 3600000,     // 默认过期时间（1小时）
            maxMemorySize: 100,      // 内存缓存最大条目数
            ...options
        };
        
        this.memoryCache = new Map();
    }
    
    /**
     * 生成缓存键
     */
    generateKey(key) {
        return this.options.prefix + key;
    }
    
    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {*} value - 缓存值
     * @param {number} ttl - 过期时间（毫秒）
     * @param {string} storage - 存储类型：'memory' | 'local' | 'both'
     */
    set(key, value, ttl = this.options.defaultTTL, storage = 'memory') {
        const cacheKey = this.generateKey(key);
        const expires = Date.now() + ttl;
        const data = { value, expires };
        
        if (storage === 'memory' || storage === 'both') {
            // 检查内存缓存大小
            if (this.memoryCache.size >= this.options.maxMemorySize) {
                const firstKey = this.memoryCache.keys().next().value;
                this.memoryCache.delete(firstKey);
            }
            this.memoryCache.set(cacheKey, data);
        }
        
        if (storage === 'local' || storage === 'both') {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) {
                console.warn('localStorage 写入失败:', e);
            }
        }
    }
    
    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @param {string} storage - 存储类型：'memory' | 'local' | 'both'
     */
    get(key, storage = 'memory') {
        const cacheKey = this.generateKey(key);
        
        // 先尝试内存缓存
        if (storage === 'memory' || storage === 'both') {
            const memoryData = this.memoryCache.get(cacheKey);
            if (memoryData && memoryData.expires > Date.now()) {
                return memoryData.value;
            }
        }
        
        // 再尝试 localStorage
        if (storage === 'local' || storage === 'both') {
            try {
                const localData = localStorage.getItem(cacheKey);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed.expires > Date.now()) {
                        // 同步到内存缓存
                        if (storage === 'both') {
                            this.memoryCache.set(cacheKey, parsed);
                        }
                        return parsed.value;
                    } else {
                        localStorage.removeItem(cacheKey);
                    }
                }
            } catch (e) {
                console.warn('localStorage 读取失败:', e);
            }
        }
        
        return null;
    }
    
    /**
     * 删除缓存
     */
    remove(key, storage = 'both') {
        const cacheKey = this.generateKey(key);
        
        if (storage === 'memory' || storage === 'both') {
            this.memoryCache.delete(cacheKey);
        }
        
        if (storage === 'local' || storage === 'both') {
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {
                console.warn('localStorage 删除失败:', e);
            }
        }
    }
    
    /**
     * 清空缓存
     */
    clear(storage = 'both') {
        if (storage === 'memory' || storage === 'both') {
            this.memoryCache.clear();
        }
        
        if (storage === 'local' || storage === 'both') {
            try {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.options.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } catch (e) {
                console.warn('localStorage 清空失败:', e);
            }
        }
    }
    
    /**
     * 获取缓存统计
     */
    getStats() {
        return {
            memorySize: this.memoryCache.size,
            localSize: Object.keys(localStorage).filter(k => k.startsWith(this.options.prefix)).length
        };
    }
}

// ============================================
// 第四部分：资源预加载
// ============================================

/**
 * 资源预加载器
 */
class ResourcePreloader {
    constructor() {
        this.preloaded = new Set();
    }
    
    /**
     * 预加载图片
     */
    preloadImage(src) {
        if (this.preloaded.has(src)) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.preloaded.add(src);
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    }
    
    /**
     * 预加载多张图片
     */
    preloadImages(srcs) {
        return Promise.all(srcs.map(src => this.preloadImage(src)));
    }
    
    /**
     * 预加载下一页数据
     */
    preloadNextPage(currentPage, pageSize, dataSource) {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const nextPageData = dataSource.slice(start, end);
        
        const images = nextPageData
            .filter(item => item.imageUrl)
            .map(item => item.imageUrl);
        
        return this.preloadImages(images);
    }
}

// ============================================
// 第五部分：性能监控
// ============================================

/**
 * 性能监控器
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    /**
     * 初始化性能监控
     */
    init() {
        // 页面加载完成后的性能数据
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.collectMetrics();
            }, 0);
        });
    }
    
    /**
     * 收集性能指标
     */
    collectMetrics() {
        if (!window.performance || !window.performance.timing) return;
        
        const timing = window.performance.timing;
        
        this.metrics = {
            // DNS 查询时间
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            // TCP 连接时间
            tcpConnect: timing.connectEnd - timing.connectStart,
            // 首字节时间
            ttfb: timing.responseStart - timing.requestStart,
            // DOM 解析时间
            domParse: timing.domComplete - timing.domLoading,
            // 页面完全加载时间
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            // 白屏时间
            whiteScreen: timing.responseStart - timing.navigationStart,
            // 首屏时间（估算）
            firstScreen: timing.domInteractive - timing.navigationStart
        };
        
        // 输出到控制台（开发环境）
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('【性能指标】', this.metrics);
        }
        
        return this.metrics;
    }
    
    /**
     * 获取性能指标
     */
    getMetrics() {
        return this.metrics;
    }
    
    /**
     * 标记自定义时间点
     */
    mark(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    }
    
    /**
     * 测量两个标记之间的时间
     */
    measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            window.performance.measure(name, startMark, endMark);
            const entries = window.performance.getEntriesByName(name);
            return entries[entries.length - 1]?.duration;
        }
        return null;
    }
}

// ============================================
// 第六部分：初始化
// ============================================

// 创建全局实例
const lazyLoader = new LazyLoader();
const cacheManager = new CacheManager();
const resourcePreloader = new ResourcePreloader();
const performanceMonitor = new PerformanceMonitor();

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化懒加载
    lazyLoader.init();
    
    // 监听动态添加的内容
    const observer = new MutationObserver(debounce(() => {
        lazyLoader.refresh();
    }, 100));
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// 导出到全局
window.PerformanceUtils = {
    LazyLoader,
    CacheManager,
    ResourcePreloader,
    PerformanceMonitor,
    debounce,
    throttle,
    lazyLoader,
    cacheManager,
    resourcePreloader,
    performanceMonitor
};
