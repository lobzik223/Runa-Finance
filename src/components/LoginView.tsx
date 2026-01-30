import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import { apiService } from '../services/api';
import { GoogleIcon } from './common/icons/GoogleIcon';
import { useToast } from '../contexts/ToastContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

interface LoginViewProps {
  onNavigateToRegistration?: () => void;
  onComplete?: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onNavigateToRegistration, onComplete }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleHandled = useRef(false);

  const [, result, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: Platform.OS === 'ios' ? (GOOGLE_IOS_CLIENT_ID || undefined) : undefined,
    androidClientId: Platform.OS === 'android' ? (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? undefined) : undefined,
  });

  useEffect(() => {
    if (!result || googleHandled.current) return;
    if (result.type === 'dismiss' || result.type === 'error') {
      setLoading(false);
      googleHandled.current = true;
      return;
    }
    if (result.type === 'success') {
      const idToken = (result.params as { id_token?: string })?.id_token ?? result.authentication?.idToken ?? null;
      if (!idToken) {
        setLoading(false);
        googleHandled.current = true;
        toast.error('Не удалось получить данные от Google');
        return;
      }
      googleHandled.current = true;
      (async () => {
        try {
          const response = await apiService.loginWithGoogle(idToken);
          toast.success(`Добро пожаловать, ${response.user.name}!`);
          setTimeout(() => onComplete?.(), 500);
        } catch (err: any) {
          toast.error(err?.message ?? 'Ошибка входа через Google');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [result, onComplete, toast]);

  const handleGooglePress = () => {
    if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
      toast.error('Настройте Google Client ID в app.json (extra)');
      return;
    }
    setLoading(true);
    googleHandled.current = false;
    promptAsync();
  };

  const handleLogin = async () => {
    // Валидация
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    if (!password) {
      toast.error('Введите пароль');
      return;
    }

    setLoading(true);

    try {
      console.log('[Login] Начало входа:', { email });
      const response = await apiService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log('[Login] Успешный вход:', response.user);
      toast.success(`Добро пожаловать, ${response.user.name}!`);
      // Небольшая задержка для показа уведомления
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
    } catch (error: any) {
      console.error('[Login] Ошибка входа:', error);
      const errorMessage = error?.message || 'Ошибка при входе. Проверьте email и пароль.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View pointerEvents="none" style={styles.backgroundOverlay} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 120, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../images/runalogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Войти</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Войти</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>или</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => {
              if (onComplete) {
                onComplete();
              }
            }}
            disabled={loading}
          >
            <View style={styles.socialIcon}>
              <Image 
                source={require('../../images/icon/appleicon.png')} 
                style={{ width: 26, height: 26 }} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.socialButtonText}>Войти с помощью Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleGooglePress}
            disabled={loading}
          >
            <View style={[styles.socialIcon, styles.socialIconWhite]}>
              <GoogleIcon size={20} />
            </View>
            <Text style={styles.socialButtonText}>Войти с помощью Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Нет аккаунта? </Text>
            <TouchableOpacity onPress={onNavigateToRegistration} disabled={loading}>
              <Text style={styles.footerLink}>Зарегистрируйтесь</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#788FAC',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: '#788FAC',
    zIndex: 0,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 240,
    height: 95,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#E8E0D4',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#A0522D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#FFFFFF',
  },
  socialButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#6B7A9A',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconWhite: {
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    color: '#1D4981',
    fontWeight: '700',
  },
});

export default LoginView;
