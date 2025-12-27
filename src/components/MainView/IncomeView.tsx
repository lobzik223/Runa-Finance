import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IncomeViewProps {
  onBack?: () => void;
}

interface Transaction {
  id: string;
  category: string;
  icon: string;
  amount: string;
  paymentMethod: string;
  date: string;
}

const IncomeView: React.FC<IncomeViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  const transactions: Transaction[] = [
    {
      id: '1',
      category: 'Зарплата',
      icon: '💼',
      amount: '+50 000₽',
      paymentMethod: 'Банковский перевод',
      date: '22.12.2025',
    },
    {
      id: '2',
      category: 'Фриланс',
      icon: '💻',
      amount: '+10 000₽',
      paymentMethod: 'Дебетовая карта',
      date: '20.12.2025',
    },
    {
      id: '3',
      category: 'Премия',
      icon: '🎁',
      amount: '+5 000₽',
      paymentMethod: 'Банковский перевод',
      date: '15.12.2025',
    },
  ];

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Доходы</Text>
        {onBack && <View style={styles.backButton} />}
      </View>

      {/* Summary Card - Fixed */}
      <View style={styles.summaryCardContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>65 000₽</Text>
          <Text style={styles.summarySubtitle}>за месяц</Text>
        </View>
      </View>

      {/* Transactions List - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionIcon}>{transaction.icon}</Text>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionPaymentMethod}>{transaction.paymentMethod}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>{transaction.amount}</Text>
          </View>
        ))}
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
    height: SCREEN_HEIGHT * 2,
    backgroundColor: '#788FAC',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  summaryCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
    overflow: 'hidden',
  },
  summaryCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  summaryAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  transactionPaymentMethod: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666666',
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4981',
    marginLeft: 12,
  },
});

export default IncomeView;

