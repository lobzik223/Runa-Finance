import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import LoadingView from './src/components/LoadingView';
import RegistrationView from './src/components/RegistrationView';
import LoginView from './src/components/LoginView';
import PinCodeView from './src/components/PinCodeView';
// Ленивая загрузка MainView для избежания проблем с expo-file-system при импорте
import { apiService } from './src/services/api';

type ScreenType = 'loading' | 'login' | 'registration' | 'pincode' | 'main';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [pinCodeMode, setPinCodeMode] = useState<'create' | 'enter'>('enter');
  const navigationDirection = useRef<'forward' | 'backward'>('forward');
  const [MainViewComponent, setMainViewComponent] = useState<React.ComponentType<any> | null>(null);

  const handleNavigate = (screen: ScreenType) => {
    const screenOrder: ScreenType[] = ['loading', 'login', 'registration', 'pincode'];
    const currentIndex = screenOrder.indexOf(currentScreen);
    const nextIndex = screenOrder.indexOf(screen);
    
    navigationDirection.current = nextIndex > currentIndex ? 'forward' : 'backward';
    setCurrentScreen(screen);
  };

  const handleLoginComplete = () => {
    // После логина проверяем: есть ли PIN. Если нет — создаём.
    void (async () => {
      try {
        const status = await apiService.getPinStatus();
        setPinCodeMode(status.pinSet ? 'enter' : 'create');
        handleNavigate('pincode');
      } catch {
        // Если бэкенд недоступен — fallback на ввод PIN (UX), но без проверки.
        setPinCodeMode('enter');
        handleNavigate('pincode');
      }
    })();
  };

  const handleRegistrationComplete = () => {
    setPinCodeMode('create');
    handleNavigate('pincode');
  };

  const handlePinCodeComplete = () => {
    // ВРЕМЕННО: загружаем MainView с задержкой для диагностики
    if (!MainViewComponent) {
      setTimeout(() => {
        import('./src/components/MainView').then((module) => {
          setMainViewComponent(() => module.default);
          handleNavigate('main');
        }).catch((err) => {
          console.error('Ошибка загрузки MainView:', err);
        });
      }, 1000);
    } else {
      handleNavigate('main');
    }
  };

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
      <View style={styles.container}>
        <StatusBar style="light" translucent={true} backgroundColor="transparent" />
        {currentScreen === 'loading' && (
          <View key="loading" style={styles.animatedContainer}>
            <LoadingView onContinue={() => handleNavigate('login')} />
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
              <MainViewComponent onLogout={() => handleNavigate('login')} />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#788FAC' }}>
                <Text style={{ color: '#FFFFFF' }}>Загрузка...</Text>
              </View>
            )}
          </View>
        )}
      </View>
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

