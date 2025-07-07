import { useState, useEffect } from 'react';

export interface NotificationSettings {
  emailNotifications: boolean;
  weeklyReflections: boolean;
  dailyChallenges: boolean;
  progressReminders: boolean;
  darkMode: boolean;
}

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  weeklyReflections: true,
  dailyChallenges: true,
  progressReminders: false,
  darkMode: true
};

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage and backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First, try to load from localStorage for immediate UI update
        const savedSettings = localStorage.getItem('userNotificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }

        // Then fetch from backend for authoritative data
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings.notifications) {
            setSettings(data.settings.notifications);
            localStorage.setItem('userNotificationSettings', JSON.stringify(data.settings.notifications));
          }
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    // Save to localStorage immediately
    localStorage.setItem('userNotificationSettings', JSON.stringify(updatedSettings));
    
    try {
      // Save to backend
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          settingType: 'notifications',
          settings: updatedSettings 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return { success: false, error };
    }
  };

  return {
    settings,
    updateSetting,
    isLoading
  };
}