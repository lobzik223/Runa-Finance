import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumViewProps {
  onBack: () => void;
}

const PremiumView: React.FC<PremiumViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '6months' | '1year'>('1month');

  const features = [
    {
      title: 'Неограниченный ИИ-чат',
      description: 'Безлимитные сообщения и консультации\nВ бесплатной версии — лимит',
      icon: require('../icon/chatlogo.png'),
    },
    {
      title: 'Глубокий анализ доходов и расходов',
      description: 'Полная статистика по категориям, динамика, графики\nПомогает понять, куда уходят деньги',
      icon: require('../icon/analiz.png'),
    },
    {
      title: 'Прогнозы по инвестициям',
      description: 'Прогнозы по акциям, облигациям и другим инструментам\nИИ анализирует тренды и подсказывает момент входа',
      icon: require('../icon/invist.png'),
    },
    {
      title: 'Индивидуальные финансовые планы',
      description: 'Персонализированные рекомендации для достижения целей',
      icon: require('../icon/credit.png'),
    },
    {
      title: 'Анализ фондового рынка',
      description: 'Ежедневные сводки и прогнозы по текущим трендам',
      icon: require('../icon/analiz.png'),
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

        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Оформить подписку</Text>
        </TouchableOpacity>
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
});

export default PremiumView;

