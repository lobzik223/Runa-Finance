import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { GoogleIcon } from './common/icons/GoogleIcon';
import { useToast } from '../contexts/ToastContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RegistrationViewProps {
  onNavigateToLogin?: () => void;
  onComplete?: () => void;
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ onNavigateToLogin, onComplete }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistration = async () => {
    // Валидация
    if (!name.trim()) {
      toast.error('Введите имя');
      return;
    }
    if (name.trim().length > 15) {
      toast.error('Имя должно быть не длиннее 15 символов');
      return;
    }

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

    if (password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);

    try {
      console.log('[Registration] Начало регистрации:', { name, email });
      
      // Подготовка данных для регистрации
      const registerData: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };
      
      // Добавляем referralCode только если он не пустой
      const trimmedReferralCode = referralCode.trim();
      if (trimmedReferralCode) {
        registerData.referralCode = trimmedReferralCode;
      }
      
      const response = await apiService.register(registerData);

      console.log('[Registration] Успешная регистрация:', response.user);
      toast.success(`Добро пожаловать, ${response.user.name}!`);
      // Небольшая задержка для показа уведомления
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
    } catch (error: any) {
      console.error('[Registration] Ошибка регистрации:', error);
      const errorMessage = error.message || 'Ошибка при регистрации. Попробуйте еще раз.';
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
      <View style={styles.backgroundOverlay} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../images/runalogo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Логотип RUNA"
            />
          </View>

          <Text style={styles.title}>Регистрация</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Имя"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={15}
              editable={!loading}
            />
          </View>

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
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Реферальный код (необязательно)"
              placeholderTextColor="#999"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleRegistration}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Зарегистрироваться</Text>
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
            <Text style={styles.socialButtonText}>Зарегистрироваться с Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => {
              if (onComplete) {
                onComplete();
              }
            }}
            disabled={loading}
          >
            <View style={[styles.socialIcon, styles.socialIconWhite]}>
              <GoogleIcon size={20} />
            </View>
            <Text style={styles.socialButtonText}>Зарегистрироваться с Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={onNavigateToLogin} disabled={loading}>
              <Text style={styles.footerLink}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    flexGrow: 1,
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

export default RegistrationView;
