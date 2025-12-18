import { StyleSheet, View } from 'react-native';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight
} from 'react-native-reanimated';
import LoadingView from '../src/components/LoadingView';
import RegistrationView from '../src/components/RegistrationView';
import LoginView from '../src/components/LoginView';
import PinCodeView from '../src/components/PinCodeView';

type ScreenType = 'loading' | 'login' | 'registration' | 'pincode';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [pinCodeMode, setPinCodeMode] = useState<'create' | 'enter'>('enter');
  const navigationDirection = useRef<'forward' | 'backward'>('forward');
  const insets = useSafeAreaInsets();

  const handleNavigate = (screen: ScreenType) => {
    const screenOrder: ScreenType[] = ['loading', 'login', 'registration', 'pincode'];
    const currentIndex = screenOrder.indexOf(currentScreen);
    const nextIndex = screenOrder.indexOf(screen);
    
    navigationDirection.current = nextIndex > currentIndex ? 'forward' : 'backward';
    setCurrentScreen(screen);
  };

  const handleLoginComplete = () => {
    setPinCodeMode('enter');
    handleNavigate('pincode');
  };

  const handleRegistrationComplete = () => {
    setPinCodeMode('create');
    handleNavigate('pincode');
  };

  const handlePinCodeComplete = () => {
    // Здесь будет переход на главный экран приложения
    // Пока что просто возвращаемся на экран входа для демонстрации
    handleNavigate('login');
  };

  const getEnteringAnimation = (screen: ScreenType) => {
    if (screen === 'loading') {
      return FadeIn.duration(400).springify();
    }
    if (screen === 'pincode') {
      return FadeIn.duration(400).springify();
    }
    return navigationDirection.current === 'forward' 
      ? SlideInRight.duration(400).springify()
      : SlideInLeft.duration(400).springify();
  };

  const getExitingAnimation = (screen: ScreenType) => {
    if (screen === 'loading' || screen === 'pincode') {
      return FadeOut.duration(300);
    }
    return navigationDirection.current === 'forward'
      ? SlideOutLeft.duration(300)
      : SlideOutRight.duration(300);
  };

  return (
    <View style={[styles.container, { marginTop: -insets.top, paddingTop: 0 }]}>
      {currentScreen === 'loading' && (
        <Animated.View 
          key="loading"
          entering={getEnteringAnimation('loading')}
          exiting={getExitingAnimation('loading')}
          style={styles.animatedContainer}
        >
          <LoadingView onContinue={() => handleNavigate('login')} />
        </Animated.View>
      )}
      {currentScreen === 'login' && (
        <Animated.View 
          key="login"
          entering={getEnteringAnimation('login')}
          exiting={getExitingAnimation('login')}
          style={styles.animatedContainer}
        >
          <LoginView 
            onNavigateToRegistration={() => handleNavigate('registration')}
            onComplete={handleLoginComplete}
          />
        </Animated.View>
      )}
      {currentScreen === 'registration' && (
        <Animated.View 
          key="registration"
          entering={getEnteringAnimation('registration')}
          exiting={getExitingAnimation('registration')}
          style={styles.animatedContainer}
        >
          <RegistrationView 
            onNavigateToLogin={() => handleNavigate('login')}
            onComplete={handleRegistrationComplete}
          />
        </Animated.View>
      )}
      {currentScreen === 'pincode' && (
        <Animated.View 
          key="pincode"
          entering={getEnteringAnimation('pincode')}
          exiting={getExitingAnimation('pincode')}
          style={styles.animatedContainer}
        >
          <PinCodeView 
            mode={pinCodeMode}
            onComplete={handlePinCodeComplete}
          />
        </Animated.View>
      )}
    </View>
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
