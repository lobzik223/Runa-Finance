import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingView from './src/components/LoadingView';
import RegistrationView from './src/components/RegistrationView';
import LoginView from './src/components/LoginView';
import PinCodeView from './src/components/PinCodeView';
import MaintenanceScreen from './src/components/MaintenanceScreen';
// Ленивая загрузка MainView для избежания проблем с expo-file-system при импорте
import { apiService } from './src/services/api';
import { ToastProvider } from './src/contexts/ToastContext';

type ScreenType = 'loading' | 'login' | 'registration' | 'pincode' | 'main' | 'maintenance';
const AUTH_COMPLETED_KEY = '@runa_finance:auth_completed';
const LAST_SCREEN_KEY = '@runa_finance:last_screen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [pinCodeMode, setPinCodeMode] = useState<'create' | 'enter'>('enter');
  const navigationDirection = useRef<'forward' | 'backward'>('forward');
  const [MainViewComponent, setMainViewComponent] = useState<React.ComponentType<any> | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingAfterPin, setIsLoadingAfterPin] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [savedScreen, setSavedScreen] = useState<ScreenType | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Глобальный хендлер: если сессия умерла (refresh тоже невалиден) — возвращаем на логин.
  useEffect(() => {
    apiService.setAuthInvalidatedHandler(() => {
      setMainViewComponent(null);
      setPinCodeMode('enter');
      setIsCheckingAuth(false);
      setCurrentScreen('login');
    });

    // Хендлер для недоступности бэкенда
    apiService.setBackendUnavailableHandler(() => {
      if (currentScreen !== 'maintenance') {
        const current = currentScreen;
        if (current !== 'maintenance' && current !== 'loading') {
          setSavedScreen(current);
          void AsyncStorage.setItem(LAST_SCREEN_KEY, current);
        }
        setIsMaintenance(true);
        setCurrentScreen('maintenance');
      }
    });

    return () => {
      apiService.setAuthInvalidatedHandler(null);
      apiService.setBackendUnavailableHandler(null);
    };
  }, [currentScreen]);

  const handleNavigate = useCallback((screen: ScreenType) => {
    setCurrentScreen((prevScreen) => {
      const screenOrder: ScreenType[] = ['loading', 'login', 'registration', 'pincode'];
      const currentIndex = screenOrder.indexOf(prevScreen);
      const nextIndex = screenOrder.indexOf(screen);
      
      navigationDirection.current = nextIndex > currentIndex ? 'forward' : 'backward';
      
      // Сохраняем экран (кроме maintenance и loading)
      if (screen !== 'maintenance' && screen !== 'loading') {
        void AsyncStorage.setItem(LAST_SCREEN_KEY, screen);
      }
      
      return screen;
    });
  }, []);

  // Проверка соединения с бэкендом
  const checkBackendConnection = useCallback(async (showMaintenance: boolean = true) => {
    try {
      await apiService.healthCheck(3, 1000);
      // Соединение восстановлено
      if (isMaintenance) {
        setIsMaintenance(false);
        // Восстанавливаем сохраненный экран
        if (savedScreen && savedScreen !== 'maintenance' && savedScreen !== 'loading') {
          handleNavigate(savedScreen);
        } else if (isAuthed) {
          // Если был авторизован, возвращаем на main
          handleNavigate('main');
        } else {
          handleNavigate('login');
        }
        setSavedScreen(null);
        // Очищаем сохраненный экран из AsyncStorage
        void AsyncStorage.removeItem(LAST_SCREEN_KEY);
      }
      return true;
    } catch (error) {
      // Бэкенд недоступен
      if (showMaintenance && !isMaintenance) {
        // Сохраняем текущий экран перед показом maintenance
        const current = currentScreen;
        if (current !== 'maintenance' && current !== 'loading') {
          setSavedScreen(current);
          void AsyncStorage.setItem(LAST_SCREEN_KEY, current);
        }
        setIsMaintenance(true);
        setCurrentScreen('maintenance');
      }
      return false;
    }
  }, [isMaintenance, savedScreen, isAuthed, currentScreen, handleNavigate]);

  // Периодическая проверка соединения при показе maintenance
  useEffect(() => {
    if (isMaintenance) {
      // Проверяем каждые 5 секунд
      healthCheckIntervalRef.current = setInterval(() => {
        void checkBackendConnection(false);
      }, 5000);
    } else {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [isMaintenance, checkBackendConnection]);

  const handleLoginComplete = () => {
    // После логина считаем сессию валидной и проверяем: есть ли PIN. Если нет — создаём.
    void (async () => {
      try {
        setIsAuthed(true);
        await AsyncStorage.setItem(AUTH_COMPLETED_KEY, 'true');
        const status = await apiService.getPinStatus();
        setPinCodeMode(status.pinSet ? 'enter' : 'create');
        handleNavigate('pincode');
      } catch {
        // Если бэкенд недоступен — fallback на ввод PIN (UX), но без проверки.
        setIsAuthed(true);
        await AsyncStorage.setItem(AUTH_COMPLETED_KEY, 'true');
        setPinCodeMode('enter');
        handleNavigate('pincode');
      }
    })();
  };

  const handleRegistrationComplete = () => {
    setIsAuthed(true);
    void AsyncStorage.setItem(AUTH_COMPLETED_KEY, 'true');
    setPinCodeMode('create');
    handleNavigate('pincode');
  };

  const handlePinCodeComplete = () => {
    // Переходим на экран загрузки для подгрузки данных
    setIsLoadingAfterPin(true);
    handleNavigate('loading');
  };

  // Проверка авторизации при старте приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Восстанавливаем сохраненный экран из AsyncStorage
        const savedScreenFromStorage = await AsyncStorage.getItem(LAST_SCREEN_KEY);
        if (savedScreenFromStorage && savedScreenFromStorage !== 'maintenance' && savedScreenFromStorage !== 'loading') {
          setSavedScreen(savedScreenFromStorage as ScreenType);
        }

        // Сначала проверяем соединение с бэкендом
        const isConnected = await checkBackendConnection(true);
        if (!isConnected) {
          // Если бэкенд недоступен, maintenance экран уже показан
          return;
        }

        const token = await apiService.getToken();
        const refreshToken = await apiService.getRefreshToken();

        // Проверяем, завершал ли пользователь полноценный вход (флаг)
        const authCompleted = await AsyncStorage.getItem(AUTH_COMPLETED_KEY);

        // Если нет токенов или не завершён вход ранее — всё очищаем и на логин
        if ((!token && !refreshToken) || authCompleted !== 'true') {
          setIsAuthed(false);
          setIsCheckingAuth(false);
          await apiService.clearAuth();
          await AsyncStorage.removeItem(AUTH_COMPLETED_KEY);
          handleNavigate('login');
          return;
        }

        // Важно: на PIN пускаем ТОЛЬКО после успешной валидации токена (getMe)
        // либо после успешного refresh.
        let authed = false;
        if (token) {
          try {
            await apiService.getMe();
            authed = true;
          } catch (e: any) {
            const errorMsg = String(e?.message || '').toLowerCase();
            if ((errorMsg.includes('unauthorized') || errorMsg.includes('401')) && refreshToken) {
              try {
                await apiService.refreshAccessToken();
                await apiService.getMe();
                authed = true;
              } catch (refreshError) {
                console.warn('Ошибка обновления токена:', refreshError);
              }
            } else {
              console.warn('Ошибка проверки токена:', e);
            }
          }
        } else if (refreshToken) {
          try {
            await apiService.refreshAccessToken();
            await apiService.getMe();
            authed = true;
          } catch (e) {
            console.warn('Не удалось восстановить сессию по refresh token:', e);
          }
        }

        if (!authed) {
          // Если сессия не валидна — чистим и уводим на логин.
          await apiService.clearAuth();
          await AsyncStorage.removeItem(AUTH_COMPLETED_KEY);
          setIsAuthed(false);
          setIsCheckingAuth(false);
          handleNavigate('login');
          return;
        }

        setIsAuthed(true);

        // Сессия валидна — проверяем PIN статус и идем на PIN
        try {
          const status = await apiService.getPinStatus();
          setPinCodeMode(status.pinSet ? 'enter' : 'create');
        } catch {
          setPinCodeMode('enter');
        } finally {
          setIsCheckingAuth(false);
          handleNavigate('pincode');
        }
        return;
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthed(false);
        await AsyncStorage.removeItem(AUTH_COMPLETED_KEY);
        setIsCheckingAuth(false);
        handleNavigate('login');
      }
    };

    void checkAuth();
  }, [handleNavigate, checkBackendConnection]);

  // Обработка возврата в приложение для перезагрузки данных
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // При возврате в приложение проверяем соединение с бэкендом
        void (async () => {
          try {
            // Проверяем соединение (не показываем maintenance сразу, только если действительно недоступен)
            await checkBackendConnection(false);
            
            // Если на главном экране, проверяем токен и обновляем данные
            if (currentScreen === 'main') {
              const token = await apiService.getToken();
              if (token) {
                // Пробуем обновить токен если нужно
                try {
                  await apiService.getMe();
                } catch (e: any) {
                  // Если токен истек, пробуем обновить
                  const errorMsg = String(e?.message || '').toLowerCase();
                  if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
                    const refreshToken = await apiService.getRefreshToken();
                    if (refreshToken) {
                      try {
                        await apiService.refreshAccessToken();
                      } catch (refreshError) {
                        // Если не удалось обновить, очищаем и переходим на логин
                        console.warn('Ошибка обновления токена при возврате:', refreshError);
                        await apiService.clearAuth();
                        handleNavigate('login');
                      }
                    } else {
                      await apiService.clearAuth();
                      handleNavigate('login');
                    }
                  } else {
                    // Другая ошибка, просто логируем
                    console.warn('Ошибка при возврате в приложение:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Ошибка при возврате в приложение:', error);
          }
        })();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentScreen, handleNavigate, checkBackendConnection]);

  // Загружаем MainView и данные после ввода PIN
  React.useEffect(() => {
    if (currentScreen === 'loading' && isLoadingAfterPin) {
      const loadMainViewAndData = async () => {
        try {
          // Загружаем MainView компонент
          if (!MainViewComponent) {
            const mainViewModule = await import('./src/components/MainView');
            setMainViewComponent(() => mainViewModule.default);
          }
          
          // Небольшая задержка для плавности
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Переходим на главный экран
          setIsLoadingAfterPin(false);
          handleNavigate('main');
        } catch (err) {
          console.error('Ошибка загрузки MainView:', err);
          setIsLoadingAfterPin(false);
          // В случае ошибки все равно переходим на главный экран
          // Но если авторизация невалидна — не пускаем дальше
          if (isAuthed) {
            handleNavigate('main');
          } else {
            handleNavigate('login');
          }
        }
      };
      
      void loadMainViewAndData();
    }
  }, [currentScreen, isLoadingAfterPin, MainViewComponent, handleNavigate, isAuthed]);

  // Загружаем MainView заранее, если мы на экране main
  React.useEffect(() => {
    if (currentScreen === 'main' && !MainViewComponent) {
      import('./src/components/MainView').then((module) => {
        setMainViewComponent(() => module.default);
      }).catch((err) => {
        console.error('Ошибка загрузки MainView:', err);
      });
    }
  }, [currentScreen, MainViewComponent]);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={styles.container}>
          <StatusBar style="light" translucent={true} backgroundColor="transparent" />
        {currentScreen === 'loading' && (
          <View key="loading" style={styles.animatedContainer}>
            <LoadingView onContinue={isCheckingAuth ? undefined : () => handleNavigate('login')} />
          </View>
        )}
        {currentScreen === 'login' && (
          <View key="login" style={styles.animatedContainer}>
            <LoginView 
              onNavigateToRegistration={() => handleNavigate('registration')}
              onComplete={handleLoginComplete}
            />
          </View>
        )}
        {currentScreen === 'registration' && (
          <View key="registration" style={styles.animatedContainer}>
            <RegistrationView 
              onNavigateToLogin={() => handleNavigate('login')}
              onComplete={handleRegistrationComplete}
            />
          </View>
        )}
        {currentScreen === 'pincode' && (
          <View key="pincode" style={styles.animatedContainer}>
            <PinCodeView 
              mode={pinCodeMode}
              onComplete={handlePinCodeComplete}
            />
          </View>
        )}
        {currentScreen === 'main' && (
          <View key="main" style={styles.animatedContainer}>
            {MainViewComponent ? (
              <MainViewComponent
                onLogout={() => {
                  void (async () => {
                    // Важно: при выходе чистим токены, иначе приложение будет снова вести на PIN.
                    await apiService.clearAuth();
                    await AsyncStorage.removeItem(AUTH_COMPLETED_KEY);
                    setIsAuthed(false);
                    setMainViewComponent(null);
                    setPinCodeMode('enter');
                    handleNavigate('login');
                  })();
                }}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#788FAC' }}>
                <Text style={{ color: '#FFFFFF' }}>Загрузка...</Text>
              </View>
            )}
          </View>
        )}
        {currentScreen === 'maintenance' && (
          <View key="maintenance" style={styles.animatedContainer}>
            <MaintenanceScreen message="Ведутся работы на сервере" />
          </View>
        )}
        </View>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#788FAC',
    marginTop: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1,
    width: '100%',
  },
});

