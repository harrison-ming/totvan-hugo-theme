/**
 * 高性能图片懒加载实现
 * 支持Intersection Observer API和fallback
 */

(function() {
  'use strict';
  
  // 检查浏览器支持
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsClassList = 'classList' in document.createElement('div');
  
  if (!supportsClassList) return;

  // 配置选项
  const config = {
    rootMargin: '50px 0px',
    threshold: 0.01
  };

  // 图片加载函数
  function loadImage(img) {
    return new Promise((resolve, reject) => {
      const imageLoader = new Image();
      
      imageLoader.onload = function() {
        // 设置实际图片源
        img.src = img.dataset.src;
        img.classList.remove('lazyload');
        img.classList.add('lazyloaded');
        
        // 添加淡入效果
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
        
        // 强制重绘后应用淡入
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });
        
        resolve();
      };
      
      imageLoader.onerror = reject;
      imageLoader.src = img.dataset.src;
    });
  }

  // Intersection Observer 实现
  function createIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // 停止观察
          observer.unobserve(img);
          
          // 加载图片
          loadImage(img).catch(() => {
            // 加载失败处理
            img.classList.add('lazyload-error');
            console.warn('Failed to load image:', img.dataset.src);
          });
        }
      });
    }, config);
    
    return observer;
  }

  // Fallback 滚动实现
  function createScrollHandler() {
    let ticking = false;
    
    function checkImages() {
      const images = document.querySelectorAll('img.lazyload');
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;
      
      Array.prototype.forEach.call(images, function(img) {
        const rect = img.getBoundingClientRect();
        const threshold = 50; // 提前50px加载
        
        if (rect.top <= windowHeight + threshold && rect.bottom >= -threshold) {
          loadImage(img).catch(() => {
            img.classList.add('lazyload-error');
          });
        }
      });
      
      ticking = false;
    }
    
    return function() {
      if (!ticking) {
        requestAnimationFrame(checkImages);
        ticking = true;
      }
    };
  }

  // 初始化懒加载
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazyload');
    
    if (lazyImages.length === 0) return;

    if (supportsIntersectionObserver) {
      // 使用 Intersection Observer
      const observer = createIntersectionObserver();
      
      Array.prototype.forEach.call(lazyImages, function(img) {
        observer.observe(img);
      });
      
    } else {
      // 使用滚动事件 fallback
      const scrollHandler = createScrollHandler();
      
      // 绑定滚动事件
      window.addEventListener('scroll', scrollHandler);
      window.addEventListener('resize', scrollHandler);
      
      // 初始检查
      scrollHandler();
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
  
  // 支持动态内容加载后重新初始化
  window.reinitLazyLoading = initLazyLoading;
  
})();