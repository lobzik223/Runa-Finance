import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoriesView from './CategoriesView';
import ExpensesView from './ExpensesView';
import IncomeView from './IncomeView';
import PaymentMethodView from './PaymentMethodView';
import ChatView from './ChatView';
import DepositsAndCreditsView from '../DepositsAndCredits';
import GoalsView from '../Goals';
import InvestmentsView from '../Investments';
import ProfileView from '../Profile';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MainView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('0');
  const [showCategories, setShowCategories] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDepositsAndCredits, setShowDepositsAndCredits] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showInvestments, setShowInvestments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Карта');
  
  // Анимация плавного перелива цвета для "ИИ"
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [currentColor, setCurrentColor] = useState('#4285F4');
  
  useEffect(() => {
    const colors = [
      { r: 66, g: 133, b: 244 },   // #4285F4 - Синий
      { r: 156, g: 39, b: 176 },   // #9C27B0 - Фиолетовый
      { r: 234, g: 67, b: 53 },    // #EA4335 - Розовый
    ];
    
    const animateColor = () => {
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => animateColor());
    };
    
    const listenerId = colorAnim.addListener(({ value }) => {
      const index = Math.floor(value);
      const progress = value - index;
      
      if (index < colors.length - 1) {
        const color1 = colors[index];
        const color2 = colors[index + 1];
        
        const r = Math.round(color1.r + (color2.r - color1.r) * progress);
        const g = Math.round(color1.g + (color2.g - color1.g) * progress);
        const b = Math.round(color1.b + (color2.b - color1.b) * progress);
        
        setCurrentColor(`rgb(${r}, ${g}, ${b})`);
      } else {
        const color1 = colors[colors.length - 1];
        const color2 = colors[0];
        const r = Math.round(color1.r + (color2.r - color1.r) * progress);
        const g = Math.round(color1.g + (color2.g - color1.g) * progress);
        const b = Math.round(color1.b + (color2.b - color1.b) * progress);
        setCurrentColor(`rgb(${r}, ${g}, ${b})`);
      }
    });
    
    animateColor();
    
    return () => {
      colorAnim.removeListener(listenerId);
    };
  }, []);

  // Navigation function
  const handleNavigate = (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => {
    setShowDepositsAndCredits(false);
    setShowGoals(false);
    setShowInvestments(false);
    setShowProfile(false);
    
    switch (screen) {
      case 'deposits':
        setShowDepositsAndCredits(true);
        break;
      case 'goals':
        setShowGoals(true);
        break;
      case 'investments':
        setShowInvestments(true);
        break;
      case 'profile':
        setShowProfile(true);
        break;
      case 'main':
      default:
        // Already on main
        break;
    }
  };

  if (showProfile) {
    return (
      <ProfileView
        onBack={() => setShowProfile(false)}
        onNavigate={handleNavigate}
      />
    );
  }

  if (showInvestments) {
    return (
      <InvestmentsView
        onBack={() => setShowInvestments(false)}
        onNavigate={handleNavigate}
      />
    );
  }

  if (showGoals) {
    return (
      <GoalsView
        onBack={() => setShowGoals(false)}
        onNavigate={handleNavigate}
      />
    );
  }

  if (showDepositsAndCredits) {
    return (
      <DepositsAndCreditsView
        onBack={() => setShowDepositsAndCredits(false)}
        onNavigate={handleNavigate}
      />
    );
  }

  if (showChat) {
    return (
      <ChatView
        onBack={() => setShowChat(false)}
      />
    );
  }

  if (showPaymentMethod) {
    return (
      <PaymentMethodView
        onBack={() => setShowPaymentMethod(false)}
        onSelect={(method) => setSelectedPaymentMethod(method)}
      />
    );
  }

  if (showIncome) {
    return (
      <IncomeView
        onBack={() => setShowIncome(false)}
      />
    );
  }

  if (showExpenses) {
    return (
      <ExpensesView
        onBack={() => setShowExpenses(false)}
      />
    );
  }

  if (showCategories) {
    return (
      <CategoriesView
        type={transactionType}
        onBack={() => setShowCategories(false)}
      />
    );
  }

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo centered and PRO badge */}
        <View style={styles.header}>
          <View style={styles.logoImageContainer}>
            <Image
              source={require('../../../images/runalogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.proBadge}>
            <Text style={styles.proCrown}>👑</Text>
            <Text style={styles.proText}>PRO</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.summaryCardLeft]}
            onPress={() => setShowIncome(true)}
          >
            <Text style={styles.summaryTitle}>Доходы</Text>
            <Text style={styles.summarySubtitle}>за месяц</Text>
            <Text style={styles.summaryAmount}>65 000 Р</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.summaryCard, styles.summaryCardRight]}
            onPress={() => setShowExpenses(true)}
          >
            <Text style={styles.summaryTitle}>Расходы</Text>
            <Text style={styles.summarySubtitle}>за месяц</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>-20 000Р</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input Section */}
        <View style={styles.amountInputSection}>
          <Text style={styles.transactionLabel}>Введите сумму:</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0Р"
            placeholderTextColor="#FFFFFF"
          />
        </View>

        {/* Transaction Type Buttons Section */}
        <View style={styles.transactionTypeSection}>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              styles.transactionTypeButtonLeft,
              transactionType === 'income' 
                ? styles.transactionTypeButtonActive 
                : styles.transactionTypeButtonInactive
            ]}
            onPress={() => setTransactionType('income')}
          >
            <Text style={[
              transactionType === 'income' 
                ? styles.transactionTypeButtonTextActive 
                : styles.transactionTypeButtonTextInactive
            ]}>
              Доходы
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              styles.transactionTypeButtonRight,
              transactionType === 'expense' 
                ? styles.transactionTypeButtonExpenseActive 
                : styles.transactionTypeButtonExpense
            ]}
            onPress={() => setTransactionType('expense')}
          >
            <Text style={[
              transactionType === 'expense' 
                ? styles.transactionTypeButtonTextExpenseActive 
                : styles.transactionTypeButtonTextExpense
            ]}>
              Расходы
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Details Section */}
        <TouchableOpacity 
          style={styles.detailField}
          onPress={() => setShowCategories(true)}
        >
          <Text style={styles.detailFieldLabel}>Категория</Text>
          <Text style={styles.detailFieldArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.detailField}
          onPress={() => setShowPaymentMethod(true)}
        >
          <Text style={styles.detailFieldLabel}>Способ оплаты</Text>
          <View style={styles.detailFieldValue}>
            <Text style={styles.detailFieldValueText}>{selectedPaymentMethod}</Text>
            <Text style={[styles.detailFieldArrow, { marginLeft: 8 }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Добавить</Text>
        </TouchableOpacity>

        {/* AI Chat Section */}
        <TouchableOpacity 
          style={styles.aiChatCard}
          onPress={() => setShowChat(true)}
        >
          <View style={styles.aiChatIconWrapper}>
            <View style={styles.aiChatIcon}>
              <Image 
                source={require('../icon/chatlogo.png')} 
                style={styles.aiChatImage}
              />
            </View>
          </View>
          <View style={styles.aiChatContent}>
            <Text style={styles.aiChatTitle}>
              Чат с <Text style={[styles.aiChatTitleHighlight, { color: currentColor }]}>ИИ</Text>
            </Text>
            <Text style={styles.aiChatDescription}>
              Запросите совет или попросите проанализировать ваши расходы
            </Text>
          </View>
        </TouchableOpacity>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Аналитика</Text>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => setShowExpenses(true)}
          >
            <Text style={styles.detailsButtonText}>Детали</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - Island Style */}
      <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, styles.navItemCredit]}>
            <Image 
              source={require('../icon/home.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelActive, styles.navLabelCreditPosition]}>Главная</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit, styles.navItemCreditDeposits]}
            onPress={() => setShowDepositsAndCredits(true)}
          >
            <Image 
              source={require('../icon/credit.png')} 
              style={[styles.navIconImageCredit, styles.navIconImageCreditPositionDeposits]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPositionDeposits]}>Вклады</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => setShowGoals(true)}
          >
            <Image 
              source={require('../icon/analiz.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Цели</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => setShowInvestments(true)}
          >
            <Image 
              source={require('../icon/invist.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Инвестиции</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => setShowProfile(true)}
          >
            <Image 
              source={require('../icon/profile.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Профиль</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    width: '100%',
  },
  logoImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 60,
  },
  proBadge: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proCrown: {
    fontSize: 16,
    marginRight: 4,
  },
  proText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryCards: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#E8E0D4',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCardLeft: {
    marginRight: 7,
  },
  summaryCardRight: {
    marginLeft: 7,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: SCREEN_WIDTH < 375 ? 18 : 22,
    fontWeight: '700',
    color: '#333',
  },
  expenseAmount: {
    color: '#A0522D',
  },
  amountInputSection: {
    backgroundColor: '#1D4981',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  transactionLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  amountInput: {
    fontSize: SCREEN_WIDTH < 375 ? 40 : 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    minHeight: 60,
  },
  transactionTypeSection: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  transactionTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionTypeButtonLeft: {
    marginRight: 6,
  },
  transactionTypeButtonRight: {
    marginLeft: 6,
  },
  transactionTypeButtonActive: {
    backgroundColor: '#E8E0D4',
  },
  transactionTypeButtonInactive: {
    backgroundColor: '#1D4981',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  transactionTypeButtonExpense: {
    backgroundColor: '#1D4981',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  transactionTypeButtonExpenseActive: {
    backgroundColor: '#E8E0D4',
    borderWidth: 0,
  },
  transactionTypeButtonTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
  },
  transactionTypeButtonTextInactive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionTypeButtonTextExpense: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionTypeButtonTextExpenseActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
  },
  detailField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailFieldLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailFieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailFieldValueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailFieldArrow: {
    fontSize: 24,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1D4981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiChatCard: {
    flexDirection: 'row',
    backgroundColor: '#D9D9D9',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aiChatIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 18,
    // Легкий перелив от цвета фона к белому
    backgroundColor: '#E8E0D4',
    // Матовая подсветка с переливом
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
    // Градиентная обводка (имитация перелива от #E8E0D4 к белому)
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  aiChatIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#E8E0D4',
    justifyContent: 'center',
    alignItems: 'center',
    // Внутренняя тень для перелива
    shadowColor: '#E8E0D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  aiChatImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  aiChatContent: {
    flex: 1,
  },
  aiChatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  aiChatTitleHighlight: {
    fontWeight: '700',
  },
  aiChatDescription: {
    fontSize: 14,
    color: '#333333',
    opacity: 0.8,
  },
  analyticsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1D4981',
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4981',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1D4981',
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderTopWidth: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navIconCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCredit: {
    width: 36,
    height: 36,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImageCreditPositionDeposits: {
    marginTop: -4,
    marginBottom: 0,
  },
  navItemCredit: {
    paddingTop: 2,
  },
  navItemCreditDeposits: {
    paddingTop: 0,
  },
  navLabelCreditPosition: {
    marginTop: -2,
  },
  navLabelCreditPositionDeposits: {
    marginTop: 0,
  },
  navLabel: {
    fontSize: SCREEN_WIDTH < 375 ? 9 : 11,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
  },
  navLabelActive: {
    opacity: 1,
    fontWeight: '600',
  },
});

export default MainView;

