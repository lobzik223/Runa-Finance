import React from 'react';
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

interface CreditDetailsViewProps {
  onBack?: () => void;
  creditTitle?: string;
  mode?: 'credit' | 'deposit';
}

const CreditDetailsView: React.FC<CreditDetailsViewProps> = ({ 
  onBack,
  creditTitle = 'Кредит на телефон',
  mode,
}) => {
  const insets = useSafeAreaInsets();
  const isDeposit = mode === 'deposit' || creditTitle.toLowerCase().includes('вклад');

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Детали</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>{creditTitle}</Text>

        {/* Credit Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isDeposit ? 'Сумма вклада:' : 'Сумма кредита:'}</Text>
            <Text style={styles.summaryValue}>{isDeposit ? '200 000₽' : '50 000₽'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isDeposit ? 'Ожидаемый доход:' : 'Остаток долга:'}</Text>
            <Text style={styles.summaryValue}>{isDeposit ? '1 190₽' : '38 000₽'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isDeposit ? 'Начисление процентов:' : 'Следующий платеж:'}</Text>
            <Text style={styles.summaryValue}>{isDeposit ? '15 марта' : '3 400₽'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isDeposit ? 'Срок:' : 'Дата платежа:'}</Text>
            <Text style={styles.summaryValue}>{isDeposit ? '12 месяцев' : '30 ноября'}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>Процентная ставка:</Text>
            <Text style={styles.summaryValue}>12% годовых</Text>
          </View>
        </View>

        {/* Payment Schedule Section */}
        <Text style={styles.sectionTitle}>{isDeposit ? 'График начислений' : 'График платежей'}</Text>
        
        <View style={styles.paymentItem}>
          <View style={styles.paymentIconContainer}>
            <Text style={styles.paymentIcon}>✓</Text>
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentMonth}>{isDeposit ? 'Сентябрь — 1 190₽' : 'Сентябрь — 3 400₽'}</Text>
          </View>
          <Text style={styles.paymentStatusPaid}>Оплачено</Text>
        </View>

        <View style={styles.paymentItem}>
          <View style={styles.paymentIconContainer}>
            <Text style={styles.paymentIcon}>✓</Text>
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentMonth}>{isDeposit ? 'Октябрь — 1 190₽' : 'Октябрь — 3 400₽'}</Text>
          </View>
          <Text style={styles.paymentStatusPaid}>Оплачено</Text>
        </View>

        <View style={styles.paymentItem}>
          <View style={styles.paymentIconContainerPending}>
            <View style={styles.paymentIconPending} />
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentMonth}>{isDeposit ? 'Ноябрь — 1 190₽' : 'Ноябрь — 3 400₽'}</Text>
          </View>
          <Text style={styles.paymentStatusPending}>Ожидается</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Редактировать</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>{isDeposit ? 'Закрыть вклад' : 'Закрыть кредит'}</Text>
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
    fontSize: 32,
    color: '#000000',
    fontWeight: '400',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A0522D',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconContainerPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paymentIconPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
  },
  paymentContent: {
    flex: 1,
  },
  paymentMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  paymentStatusPaid: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  paymentStatusPending: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  editButton: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#9A031E',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  navIconImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
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

export default CreditDetailsView;

