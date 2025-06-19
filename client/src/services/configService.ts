// 配置服务
interface AppConfig {
  viewMode: 'single' | 'feed'; // 单个问题视图 或 Feed流视图
  feedAutoRefresh: boolean; // Feed流是否自动刷新
  darkMode: boolean; // 暗色模式
  language: 'zh' | 'en'; // 语言设置
}

const CONFIG_STORAGE_KEY = 'thinking_tool_config';

const defaultConfig: AppConfig = {
  viewMode: 'single',
  feedAutoRefresh: false,
  darkMode: false,
  language: 'zh'
};

export const configService = {
  // 获取配置
  getConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
      return defaultConfig;
    } catch (error) {
      console.error('Failed to load config:', error);
      return defaultConfig;
    }
  },

  // 保存配置
  saveConfig(config: Partial<AppConfig>): AppConfig {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    } catch (error) {
      console.error('Failed to save config:', error);
      return this.getConfig();
    }
  },

  // 重置配置
  resetConfig(): AppConfig {
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      return defaultConfig;
    } catch (error) {
      console.error('Failed to reset config:', error);
      return defaultConfig;
    }
  }
};

export type { AppConfig };