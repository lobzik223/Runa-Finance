import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoriesView from './CategoriesView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MainView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('0');
  const [showCategories, setShowCategories] = useState(false);

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
              source={require('../../images/runalogo.png')}
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
          <View style={[styles.summaryCard, styles.summaryCardLeft]}>
            <Text style={styles.summaryTitle}>Доходы</Text>
            <Text style={styles.summarySubtitle}>за месяц</Text>
            <Text style={styles.summaryAmount}>65 000 Р</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardRight]}>
            <Text style={styles.summaryTitle}>Расходы</Text>
            <Text style={styles.summarySubtitle}>за месяц</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>-20 000Р</Text>
          </View>
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
        <TouchableOpacity style={styles.detailField}>
          <Text style={styles.detailFieldLabel}>Способ оплаты</Text>
          <View style={styles.detailFieldValue}>
            <Text style={styles.detailFieldValueText}>Карта</Text>
            <Text style={[styles.detailFieldArrow, { marginLeft: 8 }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Добавить</Text>
        </TouchableOpacity>

        {/* AI Chat Section */}
        <TouchableOpacity style={styles.aiChatCard}>
          <View style={styles.aiChatIcon}>
            <Text style={styles.aiChatEmoji}>🤖</Text>
          </View>
          <View style={styles.aiChatContent}>
            <Text style={styles.aiChatTitle}>Чат с ИИ</Text>
            <Text style={styles.aiChatDescription}>
              Запросите совет или попросите проанализировать ваши расходы
            </Text>
          </View>
        </TouchableOpacity>

        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Аналитика</Text>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Детали</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - Island Style */}
      <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={[styles.navLabel, styles.navLabelActive]}>Главная</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏦</Text>
            <Text style={styles.navLabel}>Вклады и кредиты</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navLabel}>Цели</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>📊</Text>
            <Text style={styles.navLabel}>Инвестиции</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Профиль</Text>
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
  aiChatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8E0D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiChatEmoji: {
    fontSize: 28,
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

