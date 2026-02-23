/**
 * 开屏公告功能
 * 参考 xzphotos.cn 的开屏公告实现
 * 
 * 【功能说明】
 * 1. 页面加载时自动显示开屏公告
 * 2. 支持用户关闭公告
 * 3. 记录用户关闭状态，一定时间内不再显示
 * 4. 响应式设计，适配不同屏幕尺寸
 * 5. 支持HTML内容，可包含图片、链接等
 * 6. 平滑的显示/隐藏动画效果
 * 
 * 【使用方式】
 * 1. 在HTML文件中引入此脚本
 * 2. 在页面加载完成后调用 initSplashAnnouncement() 初始化
 * 3. 可通过配置对象自定义公告内容和行为
 */

/**
 * 从localStorage获取数据
 * @param {string} key - 存储键名
 * @returns {any} 解析后的数据
 */
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting data from localStorage:', error);
        return null;
    }
}

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 */
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

/**
 * 从localStorage删除数据
 * @param {string} key - 存储键名
 */
function removeData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data from localStorage:', error);
    }
}

/**
 * 开屏公告配置
 * @type {Object}
 */
const SPLASH_ANNOUNCEMENT_CONFIG = {
    // 公告ID，用于本地存储标识
    id: 'splash_announcement_20260221',
    // 公告标题
    title: '🎉 交通图库系统更新公告',
    // 公告摘要内容（支持HTML）
    content: `
        <div class="splash-content">
            <h2 style="color: #333; margin-bottom: 10px;">TG 系统更新公告</h2>
            <h4 style="color: #666; margin-bottom: 15px;">2026年2月21日</h4>
            <p style="color: #555; line-height: 1.6;">尊敬的用户，交通图库系统已完成重要更新：</p>
            <ul style="color: #555; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                <li>✨ 新增作品分类筛选功能</li>
                <li>✨ 优化上传体验，支持批量上传</li>
                <li>✨ 新增作品审核流程</li>
                <li>✨ 改进用户界面，提升视觉体验</li>
                <li>✨ 修复已知bug，提升系统稳定性</li>
            </ul>
            <p style="color: #555; line-height: 1.6; margin-top: 15px;">感谢您一直以来的支持和理解！</p>
        </div>
    `,
    // 公告详情内容（点击"查看详情"后显示）
    detailContent: `
        <div class="splash-detail-content">
            <h2 style="color: #333; margin-bottom: 15px;">🚀 交通图库 v1.0.0 正式发布</h2>
            <p style="color: #666; margin-bottom: 20px;">发布日期：2026年2月21日</p>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4CAF50; margin-bottom: 10px;">📸 新增功能</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                    <li><strong>作品分类系统</strong> - 支持铁路、航空、陆运、水运、特殊交通、风景人文六大分类</li>
                    <li><strong>智能搜索</strong> - 支持按标题、标签、摄影师搜索作品</li>
                    <li><strong>批量上传</strong> - 支持一次性上传多张图片，提升效率</li>
                    <li><strong>作品审核</strong> - 新增审核机制，保证内容质量</li>
                    <li><strong>用户等级</strong> - 根据活跃度自动升级，享受更多权益</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2196F3; margin-bottom: 10px;">⚡ 性能优化</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                    <li>图片懒加载，页面加载速度提升 60%</li>
                    <li>优化数据库查询，响应时间缩短 40%</li>
                    <li>改进缓存策略，减少服务器压力</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #FF9800; margin-bottom: 10px;">🐛 问题修复</h3>
                <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
                    <li>修复移动端导航栏显示问题</li>
                    <li>修复图片上传时的格式验证问题</li>
                    <li>修复用户登录状态同步问题</li>
                    <li>修复分页组件在部分浏览器下的兼容性问题</li>
                </ul>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4 style="color: #333; margin-bottom: 10px;">💡 使用提示</h4>
                <p style="color: #666; line-height: 1.6;">
                    快捷键 <kbd style="background: #fff; padding: 2px 6px; border-radius: 3px; border: 1px solid #ddd;">?</kbd> 
                    可查看所有快捷键，<kbd style="background: #fff; padding: 2px 6px; border-radius: 3px; border: 1px solid #ddd;">/</kbd> 
                    快速聚焦搜索框。
                </p>
            </div>
            
            <p style="color: #999; margin-top: 20px; font-size: 0.9rem;">
                如有任何问题或建议，欢迎通过 <a href="contact.html" style="color: #4CAF50;">联系我们</a> 反馈。
            </p>
        </div>
    `,
    // 公告显示时长（毫秒），0表示不自动关闭
    duration: 0,
    // 关闭后多长时间内不再显示（毫秒），默认7天
    expireTime: 7 * 24 * 60 * 60 * 1000,
    // 是否显示关闭按钮
    showCloseButton: true,
    // 是否显示"不再显示"选项
    showDoNotShowAgain: true,
    // 是否显示"查看详情"按钮
    showDetailButton: true,
    // 动画持续时间（毫秒）
    animationDuration: 300,
    // 背景透明度
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    // 公告容器样式
    containerStyle: {
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
    }
};

/**
 * 初始化开屏公告
 * @param {Object} config - 自定义配置（可选）
 */
function initSplashAnnouncement(config = {}) {
    // 合并配置
    const finalConfig = { ...SPLASH_ANNOUNCEMENT_CONFIG, ...config };
    
    // 检查是否应该显示公告
    if (!shouldShowAnnouncement(finalConfig.id)) {
        return;
    }
    
    // 创建公告元素
    createSplashAnnouncement(finalConfig);
}

/**
 * 检查是否应该显示公告
 * @param {string} announcementId - 公告ID
 * @returns {boolean} 是否应该显示
 */
function shouldShowAnnouncement(announcementId) {
    const storageKey = `splash_announcement_closed_${announcementId}`;
    const closedInfo = getData(storageKey);
    
    if (!closedInfo) {
        return true;
    }
    
    const { timestamp, expireTime } = closedInfo;
    const now = Date.now();
    
    return now - timestamp > expireTime;
}

/**
 * 创建开屏公告
 * @param {Object} config - 公告配置
 */
function createSplashAnnouncement(config) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'splash-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${config.backgroundColor};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity ${config.animationDuration}ms ease, visibility ${config.animationDuration}ms ease;
    `;
    
    // 创建公告容器
    const container = document.createElement('div');
    container.id = 'splash-container';
    
    // 应用容器样式
    Object.entries(config.containerStyle).forEach(([property, value]) => {
        container.style[property] = value;
    });
    
    // 公告头部
    const header = document.createElement('div');
    header.className = 'splash-header';
    header.style.cssText = `
        padding: 20px;
        background-color: #4CAF50;
        color: #fff;
        border-bottom: 1px solid #eee;
    `;
    header.innerHTML = `<h2 style="margin: 0; font-size: 1.2rem;">${config.title}</h2>`;
    
    // 公告内容
    const content = document.createElement('div');
    content.className = 'splash-body';
    content.style.cssText = `
        padding: 20px;
        max-height: 50vh;
        overflow-y: auto;
    `;
    content.innerHTML = config.content;
    
    // 公告底部
    const footer = document.createElement('div');
    footer.className = 'splash-footer';
    footer.style.cssText = `
        padding: 15px 20px;
        background-color: #f9f9f9;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    // 左侧按钮组（不再显示 + 查看详情）
    const leftButtons = document.createElement('div');
    leftButtons.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
    `;

    // 不再显示选项
    if (config.showDoNotShowAgain) {
        const doNotShowAgain = document.createElement('div');
        doNotShowAgain.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        `;
        doNotShowAgain.innerHTML = `
            <input type="checkbox" id="splash-do-not-show" style="cursor: pointer;">
            <label for="splash-do-not-show" style="cursor: pointer;">7天内不再显示</label>
        `;
        leftButtons.appendChild(doNotShowAgain);
    }

    // 查看详情按钮
    if (config.showDetailButton && config.detailContent) {
        const detailButton = document.createElement('button');
        detailButton.id = 'splash-detail-btn';
        detailButton.textContent = '查看详情';
        detailButton.style.cssText = `
            padding: 8px 16px;
            background-color: #2196F3;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.3s ease;
        `;
        detailButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#1976D2';
        });
        detailButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#2196F3';
        });
        detailButton.addEventListener('click', () => {
            showAnnouncementDetail(config);
        });
        leftButtons.appendChild(detailButton);
    }

    footer.appendChild(leftButtons);

    // 关闭按钮
    if (config.showCloseButton) {
        const closeButton = document.createElement('button');
        closeButton.id = 'splash-close-btn';
        closeButton.textContent = '关闭';
        closeButton.style.cssText = `
            padding: 8px 16px;
            background-color: #4CAF50;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.3s ease;
        `;
        closeButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#45a049';
        });
        closeButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#4CAF50';
        });
        footer.appendChild(closeButton);
    }
    
    // 组装公告
    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(footer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // 显示公告
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    }, 100);
    
    // 绑定关闭事件
    if (config.showCloseButton) {
        document.getElementById('splash-close-btn').addEventListener('click', () => {
            closeSplashAnnouncement(config);
        });
    }
    
    // 自动关闭
    if (config.duration > 0) {
        setTimeout(() => {
            closeSplashAnnouncement(config);
        }, config.duration);
    }
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeSplashAnnouncement(config);
        }
    });
}

/**
 * 显示公告详情
 * @param {Object} config - 公告配置
 */
function showAnnouncementDetail(config) {
    const container = document.getElementById('splash-container');
    const content = container.querySelector('.splash-body');
    const detailBtn = document.getElementById('splash-detail-btn');

    if (!content || !detailBtn) return;

    // 检查当前状态（显示摘要还是详情）
    const isShowingDetail = detailBtn.textContent === '返回摘要';

    if (isShowingDetail) {
        // 返回摘要视图
        content.innerHTML = config.content;
        detailBtn.textContent = '查看详情';
        detailBtn.style.backgroundColor = '#2196F3';
        detailBtn.onmouseenter = function() { this.style.backgroundColor = '#1976D2'; };
        detailBtn.onmouseleave = function() { this.style.backgroundColor = '#2196F3'; };
    } else {
        // 显示详情视图
        content.innerHTML = config.detailContent;
        detailBtn.textContent = '返回摘要';
        detailBtn.style.backgroundColor = '#757575';
        detailBtn.onmouseenter = function() { this.style.backgroundColor = '#616161'; };
        detailBtn.onmouseleave = function() { this.style.backgroundColor = '#757575'; };

        // 滚动到顶部
        content.scrollTop = 0;
    }

    // 添加切换动画
    content.style.opacity = '0';
    setTimeout(() => {
        content.style.transition = 'opacity 0.3s ease';
        content.style.opacity = '1';
    }, 50);
}

/**
 * 关闭开屏公告
 * @param {Object} config - 公告配置
 */
function closeSplashAnnouncement(config) {
    const overlay = document.getElementById('splash-overlay');
    if (!overlay) return;
    
    // 检查是否勾选"不再显示"
    const doNotShowAgain = document.getElementById('splash-do-not-show');
    const shouldHide = doNotShowAgain ? doNotShowAgain.checked : false;
    
    // 记录关闭状态
    if (shouldHide) {
        const storageKey = `splash_announcement_closed_${config.id}`;
        saveData(storageKey, {
            timestamp: Date.now(),
            expireTime: config.expireTime
        });
    }
    
    // 隐藏公告
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    
    // 移除元素
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, config.animationDuration);
}

/**
 * 重置公告显示状态
 * @param {string} announcementId - 公告ID
 */
function resetSplashAnnouncement(announcementId = SPLASH_ANNOUNCEMENT_CONFIG.id) {
    const storageKey = `splash_announcement_closed_${announcementId}`;
    removeData(storageKey);
}

/**
 * 手动显示开屏公告
 * @param {Object} config - 公告配置
 */
function showSplashAnnouncement(config = {}) {
    const finalConfig = { ...SPLASH_ANNOUNCEMENT_CONFIG, ...config };
    createSplashAnnouncement(finalConfig);
}

// 导出函数（如果在模块化环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSplashAnnouncement,
        showSplashAnnouncement,
        resetSplashAnnouncement,
        shouldShowAnnouncement,
        showAnnouncementDetail
    };
}

// 全局函数
if (typeof window !== 'undefined') {
    window.initSplashAnnouncement = initSplashAnnouncement;
    window.showSplashAnnouncement = showSplashAnnouncement;
    window.resetSplashAnnouncement = resetSplashAnnouncement;
    window.showAnnouncementDetail = showAnnouncementDetail;
}
