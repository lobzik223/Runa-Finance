import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService, { type User } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatActiveUntil(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

interface PremiumViewProps {
  onBack: () => void;
}

const PremiumView: React.FC<PremiumViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '6months' | '1year'>('1month');
  const [siteUrl, setSiteUrl] = useState<string>('https://runafinance.online/premium');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await apiService.getPaymentConfig();
        if (config.subscriptionSiteUrl) {
          setSiteUrl(config.subscriptionSiteUrl);
        }
      } catch (error) {
        console.warn('[PremiumView] Failed to fetch payment config:', error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: me } = await apiService.getMe();
        setUser(me);
        await apiService.saveUser(me);
      } catch (error) {
        console.warn('[PremiumView] Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const premiumUntil = user?.premiumUntil ?? user?.subscription?.currentPeriodEnd ?? null;
  const isActive = premiumUntil && new Date(premiumUntil) > new Date();
  const activeUntilFormatted = formatActiveUntil(premiumUntil);
  const isFromStore = user?.subscription?.store === 'APPLE' || user?.subscription?.store === 'GOOGLE';

  const handleGoToSite = async () => {
    try {
      await Linking.openURL(siteUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const handleOpenSubscriptionManagement = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions').catch(() => {});
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions').catch(() => {});
    }
  };

  const features = [
    {
      title: 'Неограниченный ИИ-чат',
      description: 'Безлимитные сообщения и консультации\nВ бесплатной версии — лимит',
      icon: require('../../../images/icon/chaticon.png'),
    },
    {
      title: 'Глубокий анализ доходов и расходов',
      description: 'Полная статистика по категориям, динамика, графики\nПомогает понять, куда уходят деньги',
      icon: require('../../../images/icon/analitik.png'),
    },
    {
      title: 'Прогнозы по инвестициям',
      description: 'Прогнозы по акциям, облигациям и другим инструментам\nИИ анализирует тренды и подсказывает момент входа',
      icon: require('../../../images/icon/Analiz2icon.png'),
    },
    {
      title: 'Индивидуальные финансовые планы',
      description: 'Персонализированные рекомендации для достижения целей',
      icon: require('../../../images/icon/analitickksicon3.png'),
    },
    {
      title: 'Анализ фондового рынка',
      description: 'Ежедневные сводки и прогнозы по текущим трендам',
      icon: require('../../../images/icon/kruganalitik.png'),
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image source={require('../../../images/runalogo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Активная подписка: срок и действия */}
        {isActive && activeUntilFormatted && (
          <View style={styles.activeSubscriptionBlock}>
            <Text style={styles.activeUntilLabel}>Подписка активна до {activeUntilFormatted}</Text>
            {!isFromStore && (
              <TouchableOpacity
                style={styles.cancelSupportButton}
                onPress={() => Linking.openURL('mailto:support@runafinance.online')}
              >
                <Text style={styles.cancelSupportButtonText}>Отменить подписку? Обратиться в поддержку</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Features List */}
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Image source={feature.icon} style={styles.featureIcon} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}

        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === '1month' && styles.planCardActive]}
            onPress={() => setSelectedPlan('1month')}
          >
            <Text style={[styles.planDuration, selectedPlan === '1month' && styles.textWhite]}>1 месяц</Text>
            <Text style={styles.planPrice}>400 ₽</Text>
            <Text style={[styles.planSubtext, selectedPlan === '1month' && styles.textWhite]}>Месяц полного доступа</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === '6months' && styles.planCardActive]}
            onPress={() => setSelectedPlan('6months')}
          >
            <Text style={[styles.planDuration, selectedPlan === '6months' && styles.textWhite]}>6 месяцев</Text>
            <Text style={styles.planPrice}>1800 ₽</Text>
            <Text style={[styles.planSubtext, selectedPlan === '6months' && styles.textWhite]}>Лучший выбор</Text>
            <Text style={styles.planSavings}>Экономия 600 ₽</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === '1year' && styles.planCardActive]}
            onPress={() => setSelectedPlan('1year')}
          >
            <Text style={[styles.planDuration, selectedPlan === '1year' && styles.textWhite]}>1 год</Text>
            <Text style={styles.planPrice}>2500 ₽</Text>
            <Text style={[styles.planSubtext, selectedPlan === '1year' && styles.textWhite]}>Максимальная выгода</Text>
            <Text style={[styles.planSavings, selectedPlan === '1year' && styles.planSavingsActive]}>Экономия 2300 ₽</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleGoToSite}>
          <Text style={styles.subscribeButtonText}>Оформить подписку</Text>
        </TouchableOpacity>

        {isActive && isFromStore && (
          <TouchableOpacity style={styles.manageSubscriptionButton} onPress={handleOpenSubscriptionManagement}>
            <Text style={styles.manageSubscriptionButtonText}>Управление подпиской</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ИЛИ</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.siteButton}
          onPress={handleGoToSite}
        >
          <Text style={styles.siteButtonTitle}>Перейти на сайт</Text>
          <Text style={styles.siteButtonSubtitle}>Для оплаты и проверки условий и цен</Text>
        </TouchableOpacity>

        {isActive && isFromStore && (
          <Text style={styles.storeCancelHint}>
            Отмена подписки: Настройки устройства → Подписки
          </Text>
        )}

        <Text style={styles.disclaimerText}>
          Для покупки требуется обработка данных
        </Text>
      </ScrollView>
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
    height: SCREEN_HEIGHT,
    backgroundColor: '#788FAC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '400',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40,
  },
  logo: {
    width: 160,
    height: 40,
  },
  premiumText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1D4981',
    marginTop: -5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  activeSubscriptionBlock: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  activeUntilLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  cancelSupportButton: {
    backgroundColor: '#1D4981',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  cancelSupportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featureCard: {
    backgroundColor: '#FDEBD0',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#333',
    lineHeight: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FDEBD0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardActive: {
    backgroundColor: '#1D4981',
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A0522D',
    marginVertical: 8,
  },
  planSubtext: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  planSavings: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
    textAlign: 'center',
  },
  planSavingsActive: {
    color: '#A5D6A7',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  subscribeButton: {
    backgroundColor: '#1D4981',
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  manageSubscriptionButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1D4981',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  manageSubscriptionButtonText: {
    color: '#1D4981',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  siteButton: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  siteButtonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  siteButtonSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  storeCancelHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  disclaimerText: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});

export default PremiumView;

