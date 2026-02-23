/**
 * 交通图库全局配置文件 v1.0.0
 * 统一管理分类体系、预设标签、全局常量
 * 所有页面均需优先引入此文件
 */

// 1. 全品类分类体系核心定义
const CATEGORIES = {
  railway: {
    id: 'railway',
    name: '铁路',
    icon: '🚄',
    themeColor: '#e74c3c',
    subCategories: [
      { id: 'highspeed', name: '高速动车组' },
      { id: 'normalspeed', name: '普速列车' },
      { id: 'metro', name: '地铁/轻轨' },
      { id: 'steam', name: '蒸汽机车' },
      { id: 'railway_scenery', name: '铁路风景' }
    ]
  },
  aviation: {
    id: 'aviation',
    name: '航空',
    icon: '✈️',
    themeColor: '#3498db',
    subCategories: [
      { id: 'civil', name: '民航客机' },
      { id: 'general', name: '通用航空' },
      { id: 'military', name: '军用飞机' },
      { id: 'aviation_scenery', name: '航空风景' },
      { id: 'airport', name: '机场设施' }
    ]
  },
  land: {
    id: 'land',
    name: '陆运',
    icon: '🚌',
    themeColor: '#2ecc71',
    subCategories: [
      { id: 'coach', name: '客车' },
      { id: 'bus', name: '公交' },
      { id: 'taxi', name: '出租车' },
      { id: 'truck', name: '货车' },
      { id: 'special_vehicle', name: '特种车辆' }
    ]
  },
  water: {
    id: 'water',
    name: '水运',
    icon: '🚢',
    themeColor: '#9b59b6',
    subCategories: [
      { id: 'cruise', name: '邮轮/客轮' },
      { id: 'cargo', name: '货轮/集装箱船' },
      { id: 'yacht', name: '游艇/帆船' },
      { id: 'port', name: '港口设施' },
      { id: 'water_scenery', name: '水上风景' }
    ]
  },
  special: {
    id: 'special',
    name: '特殊',
    icon: '🚡',
    themeColor: '#f39c12',
    subCategories: [
      { id: 'cableway', name: '索道/缆车' },
      { id: 'maglev', name: '磁悬浮' },
      { id: 'agv', name: 'AGV智能车' },
      { id: 'other', name: '其他创新交通' }
    ]
  },
  culture: {
    id: 'culture',
    name: '风景人文',
    icon: '📷',
    themeColor: '#1abc9c',
    subCategories: [
      { id: 'hub_scenery', name: '交通枢纽风景' },
      { id: 'journey_scenery', name: '旅途风光' },
      { id: 'people', name: '交通人物故事' },
      { id: 'heritage', name: '交通历史遗迹' }
    ]
  }
};

// 2. 预设标签库（用于上传快速选择、热门标签筛选）
const PRESET_TAGS = [
  '日落', '雪景', '城市夜景', '复古', '现代科技',
  '春运', '首发车', '经典机型', '港口日出', '山间铁路',
  '长安街', '高铁站', '云海', '老火车', '邮轮', '地铁'
];

// 3. 全局常量配置
const GLOBAL_CONST = {
  // 本地存储key
  STORAGE_WORKS_KEY: 'traffic_gallery_works',
  STORAGE_LIKE_KEY: 'traffic_gallery_likes',
  STORAGE_USER_KEY: 'traffic_gallery_user',
  STORAGE_LOGS_KEY: 'traffic_gallery_logs',
  STORAGE_USERS_KEY: 'traffic_gallery_users',
  STORAGE_SECRET_KEY: 'traffic_gallery_secret_key',
  // 分页配置
  PAGE_SIZE: 12,
  // 图片上传限制
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOW_IMAGE_TYPE: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  // 网站基础信息
  SITE_NAME: '交通图库',
  SITE_VERSION: '1.0.0'
};

// 4. 用户认证配置
const AUTH_CONFIG = {
  // 密钥长度
  SECRET_KEY_LENGTH: 32,
  // 密钥有效期（天）
  SECRET_KEY_EXPIRE_DAYS: 365,
  // 登录失败最大次数
  MAX_LOGIN_ATTEMPTS: 5,
  // 登录失败锁定时间（分钟）
  LOCKOUT_DURATION: 30,
  // 密码最小长度
  MIN_PASSWORD_LENGTH: 6,
  // 密码最大长度
  MAX_PASSWORD_LENGTH: 20,
  // 管理员默认账号
  ADMIN_DEFAULT: {
    username: 'admin',
    password: 'admin123',
    secretKey: 'ADMIN_SECRET_KEY_2026_TRAFFIC_GALLERY'
  }
};
