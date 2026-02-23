/**
 * ============================================================================
 * 交通图库 - BUG数据同步模块 (bug-sync.js) v2.0
 * ============================================================================
 *
 * 【文件说明】
 * 本文件负责实现跨页面的BUG数据同步功能，完全使用JavaScript内存存储：
 * 1. 使用 BroadcastChannel 实现跨页面实时通信
 * 2. 使用 JavaScript 内存变量存储数据（脱离localStorage）
 * 3. 数据变更时广播完整数据到其他页面
 * 4. 页面间实时同步，无需持久化存储
 *
 * 【工作原理】
 * 1. 页面A提交BUG -> 更新内存 -> 广播完整BUG列表
 * 2. 页面B收到广播 -> 更新本地内存 -> 刷新列表
 *
 * 【使用方式】
 * - 在需要同步BUG数据的页面引入此文件
 * - 调用 syncBugSubmit() 提交BUG
 * - 调用 syncGetAllBugs() 获取所有BUG
 *
 * 【作者】AI Assistant
 * 【日期】2026-02-21
 * 【版本】v2.0.0
 * ============================================================================ */

// ============================================
// 第一部分：配置和初始化
// ============================================

/**
 * BroadcastChannel 名称
 * 【说明】所有页面使用相同的频道名称进行通信
 */
const BUG_SYNC_CHANNEL = 'traffic-gallery-bug-sync';

/**
 * 同步通道对象
 * 【说明】用于跨页面通信的 BroadcastChannel 实例
 */
let bugSyncChannel = null;

/**
 * 是否为主控页面
 * 【说明】第一个打开的页面作为主控页面，负责维护数据一致性
 */
let isMasterPage = false;

/**
 * 页面唯一ID
 * 【说明】用于标识不同的页面实例
 */
const pageId = 'page-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

// ============================================
// 第二部分：内存数据存储
// ============================================

/**
 * BUG数据存储对象
 * 【说明】所有BUG数据存储在JavaScript内存中
 */
const BugDataStore = {
    bugs: [],
    initialized: false
};

/**
 * 初始化同步通道
 * 【说明】在页面加载时调用，建立跨页面通信
 */
function initBugSync() {
    console.log('[BUG同步] 初始化页面:', pageId);
    
    // 检查浏览器是否支持 BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
        bugSyncChannel = new BroadcastChannel(BUG_SYNC_CHANNEL);
        
        // 监听消息
        bugSyncChannel.onmessage = function(event) {
            const data = event.data;
            
            // 忽略自己发送的消息
            if (data.pageId === pageId) {
                return;
            }
            
            console.log('[BUG同步] 收到消息:', data.type, '来自:', data.pageId);
            
            switch(data.type) {
                case 'BUG_SUBMITTED':
                    handleBugSubmitted(data.bug);
                    break;
                case 'BUG_UPDATED':
                    handleBugUpdated(data.bugId, data.updates);
                    break;
                case 'BUG_DELETED':
                    handleBugDeleted(data.bugId);
                    break;
                case 'FULL_DATA_SYNC':
                    handleFullDataSync(data.bugs);
                    break;
                case 'REQUEST_FULL_SYNC':
                    if (BugDataStore.initialized && BugDataStore.bugs.length > 0) {
                        sendFullDataSync();
                    }
                    break;
                case 'MASTER_ANNOUNCE':
                    isMasterPage = false;
                    console.log('[BUG同步] 已有主控页面，本页为从属页面');
                    break;
            }
        };
        
        // 宣布自己存在
        setTimeout(() => {
            announcePage();
        }, 100);
        
        // 请求全量数据同步
        setTimeout(() => {
            requestFullSync();
        }, 200);
        
        console.log('[BUG同步] BroadcastChannel 初始化成功');
    } else {
        console.warn('[BUG同步] 浏览器不支持 BroadcastChannel，数据将无法跨页面同步');
    }
    
    // 标记为已初始化
    BugDataStore.initialized = true;
}

/**
 * 宣布页面存在
 * 【说明】新页面打开时通知其他页面
 */
function announcePage() {
    if (!bugSyncChannel) return;
    
    bugSyncChannel.postMessage({
        type: 'PAGE_JOIN',
        pageId: pageId,
        timestamp: Date.now()
    });
}

/**
 * 请求全量数据同步
 * 【说明】新页面打开时请求其他页面发送完整数据
 */
function requestFullSync() {
    if (!bugSyncChannel) return;
    
    console.log('[BUG同步] 请求全量数据同步');
    bugSyncChannel.postMessage({
        type: 'REQUEST_FULL_SYNC',
        pageId: pageId,
        timestamp: Date.now()
    });
}

/**
 * 发送全量数据同步
 * 【说明】将当前页面的完整BUG数据广播给其他页面
 */
function sendFullDataSync() {
    if (!bugSyncChannel) return;
    
    console.log('[BUG同步] 发送全量数据:', BugDataStore.bugs.length, '个BUG');
    bugSyncChannel.postMessage({
        type: 'FULL_DATA_SYNC',
        pageId: pageId,
        bugs: BugDataStore.bugs,
        timestamp: Date.now()
    });
}

// ============================================
// 第三部分：数据操作
// ============================================

/**
 * 同步提交BUG
 * 【说明】提交BUG并广播给其他页面
 * @param {Object} bugData BUG数据
 * @returns {Object} 提交结果
 */
function syncBugSubmit(bugData) {
    // 生成唯一ID
    const bugId = 'BUG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    
    // 构建完整的BUG对象
    const bug = {
        ...bugData,
        id: bugId,
        submitTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        status: 'pending',
        replies: []
    };
    
    // 1. 保存到内存存储
    BugDataStore.bugs.unshift(bug);
    console.log('[BUG同步] BUG提交成功:', bugId, '当前总数:', BugDataStore.bugs.length);
    
    // 2. 广播给其他页面
    if (bugSyncChannel) {
        bugSyncChannel.postMessage({
            type: 'BUG_SUBMITTED',
            pageId: pageId,
            bug: bug,
            timestamp: Date.now()
        });
    }
    
    // 3. 同时更新全局_db对象（兼容性）
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    return { success: true, bugId: bugId, bug: bug };
}

/**
 * 同步更新BUG
 * 【说明】更新BUG状态并广播给其他页面
 * @param {string} bugId BUG ID
 * @param {Object} updates 更新内容
 * @returns {boolean} 是否成功
 */
function syncBugUpdate(bugId, updates) {
    const index = BugDataStore.bugs.findIndex(b => b.id === bugId);
    
    if (index === -1) {
        console.error('[BUG同步] BUG不存在:', bugId);
        return false;
    }
    
    // 更新数据
    BugDataStore.bugs[index] = {
        ...BugDataStore.bugs[index],
        ...updates,
        updateTime: new Date().toISOString()
    };
    
    console.log('[BUG同步] BUG更新成功:', bugId);
    
    // 广播给其他页面
    if (bugSyncChannel) {
        bugSyncChannel.postMessage({
            type: 'BUG_UPDATED',
            pageId: pageId,
            bugId: bugId,
            updates: updates,
            timestamp: Date.now()
        });
    }
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    return true;
}

/**
 * 同步删除BUG
 * 【说明】删除BUG并广播给其他页面
 * @param {string} bugId BUG ID
 * @returns {boolean} 是否成功
 */
function syncBugDelete(bugId) {
    const initialLength = BugDataStore.bugs.length;
    
    // 删除数据
    BugDataStore.bugs = BugDataStore.bugs.filter(b => b.id !== bugId);
    
    if (BugDataStore.bugs.length === initialLength) {
        console.error('[BUG同步] BUG不存在:', bugId);
        return false;
    }
    
    console.log('[BUG同步] BUG删除成功:', bugId);
    
    // 广播给其他页面
    if (bugSyncChannel) {
        bugSyncChannel.postMessage({
            type: 'BUG_DELETED',
            pageId: pageId,
            bugId: bugId,
            timestamp: Date.now()
        });
    }
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    return true;
}

// ============================================
// 第四部分：消息处理
// ============================================

/**
 * 处理BUG提交消息
 * @param {Object} bug BUG数据
 */
function handleBugSubmitted(bug) {
    console.log('[BUG同步] 处理BUG提交:', bug.id);
    
    // 检查是否已存在
    const exists = BugDataStore.bugs.some(b => b.id === bug.id);
    if (exists) {
        console.log('[BUG同步] BUG已存在，跳过:', bug.id);
        return;
    }
    
    // 添加到内存存储
    BugDataStore.bugs.unshift(bug);
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    // 刷新列表
    if (typeof window.refreshBugList === 'function') {
        window.refreshBugList();
    }
    
    console.log('[BUG同步] BUG已同步到本页，当前总数:', BugDataStore.bugs.length);
}

/**
 * 处理BUG更新消息
 * @param {string} bugId BUG ID
 * @param {Object} updates 更新内容
 */
function handleBugUpdated(bugId, updates) {
    console.log('[BUG同步] 处理BUG更新:', bugId);
    
    const index = BugDataStore.bugs.findIndex(b => b.id === bugId);
    if (index === -1) {
        console.warn('[BUG同步] 更新的BUG不存在:', bugId);
        return;
    }
    
    // 更新数据
    BugDataStore.bugs[index] = {
        ...BugDataStore.bugs[index],
        ...updates,
        updateTime: new Date().toISOString()
    };
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    // 刷新列表
    if (typeof window.refreshBugList === 'function') {
        window.refreshBugList();
    }
}

/**
 * 处理BUG删除消息
 * @param {string} bugId BUG ID
 */
function handleBugDeleted(bugId) {
    console.log('[BUG同步] 处理BUG删除:', bugId);
    
    BugDataStore.bugs = BugDataStore.bugs.filter(b => b.id !== bugId);
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    // 刷新列表
    if (typeof window.refreshBugList === 'function') {
        window.refreshBugList();
    }
}

/**
 * 处理全量数据同步
 * @param {Array} bugs BUG列表
 */
function handleFullDataSync(bugs) {
    console.log('[BUG同步] 处理全量数据同步:', bugs.length, '个BUG');
    
    // 合并数据（避免重复）
    const existingIds = new Set(BugDataStore.bugs.map(b => b.id));
    const newBugs = bugs.filter(b => !existingIds.has(b.id));
    
    if (newBugs.length > 0) {
        BugDataStore.bugs = [...newBugs, ...BugDataStore.bugs];
        console.log('[BUG同步] 合并后总数:', BugDataStore.bugs.length);
    }
    
    // 更新全局_db对象
    if (typeof _db !== 'undefined' && _db.bugs) {
        _db.bugs = BugDataStore.bugs;
    }
    
    // 刷新列表
    if (typeof window.refreshBugList === 'function') {
        window.refreshBugList();
    }
}

// ============================================
// 第五部分：数据获取
// ============================================

/**
 * 获取所有BUG
 * 【说明】从内存存储获取所有BUG
 * @returns {Array} BUG列表
 */
function syncGetAllBugs() {
    return BugDataStore.bugs;
}

/**
 * 根据ID获取BUG
 * @param {string} bugId BUG ID
 * @returns {Object|null} BUG对象
 */
function syncGetBugById(bugId) {
    return BugDataStore.bugs.find(b => b.id === bugId) || null;
}

/**
 * 获取BUG统计
 * @returns {Object} 统计数据
 */
function syncGetBugStatistics() {
    return {
        total: BugDataStore.bugs.length,
        pending: BugDataStore.bugs.filter(b => b.status === 'pending').length,
        processing: BugDataStore.bugs.filter(b => b.status === 'processing').length,
        resolved: BugDataStore.bugs.filter(b => b.status === 'resolved').length,
        rejected: BugDataStore.bugs.filter(b => b.status === 'rejected').length
    };
}

// ============================================
// 第六部分：初始化
// ============================================

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBugSync);
} else {
    initBugSync();
}

// 页面关闭时清理
window.addEventListener('beforeunload', function() {
    if (bugSyncChannel) {
        bugSyncChannel.postMessage({
            type: 'PAGE_LEAVE',
            pageId: pageId,
            timestamp: Date.now()
        });
    }
});

console.log('[BUG同步] bug-sync.js v2.0.0 已加载，使用纯JavaScript内存存储');
