import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type Transaction, type Category } from '../../services/api';
import { formatAmountDisplay } from '../../utils/amountFormatter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExpensesViewProps {
  onBack?: () => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const iconByKey: Record<string, any> = useMemo(
    () => ({
      groceries: require('../../../images/icon/produckt.png'),
      cafe: require('../../../images/icon/cafe-restoraunt.png'),
      transport: require('../../../images/icon/car.png'),
      housing: require('../../../images/icon/komunalka.png'),
      communication: require('../../../images/icon/subb.png'),
      health: require('../../../images/icon/healt.png'),
      education: require('../../../images/icon/book.png'),
      entertainment: require('../../../images/icon/razvlich.png'),
      other_expense: require('../../../images/icon/homee.png'),
    }),
    [],
  );

  const timezoneName = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tz = (Intl as any)?.DateTimeFormat?.().resolvedOptions?.().timeZone;
      return tz || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const loadData = useCallback(async (alive: boolean) => {
    setLoading(true);
    try {
      const analytics = await apiService.getTransactionsAnalytics({ timezone: timezoneName });
      const list = await apiService.listTransactions({ type: 'EXPENSE', timezone: timezoneName, limit: 50, page: 1 });
      if (!alive) return;
      setTotal(analytics.totals.expense || 0);
      setTransactions(list.data || []);
    } catch {
      if (!alive) return;
      setTotal(0);
      setTransactions([]);
    } finally {
      if (alive) setLoading(false);
    }
  }, [timezoneName]);

  useEffect(() => {
    let alive = true;
    void loadData(alive);
    return () => {
      alive = false;
    };
  }, [loadData]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Удаление',
      'Удалить эту операцию?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTransaction(id);
              await loadData(true);
            } catch (e: any) {
              Alert.alert('Ошибка', e.message || 'Не удалось удалить');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Расходы</Text>
        {onBack && <View style={styles.backButton} />}
      </View>

      {/* Summary Card - Fixed */}
      <View style={styles.summaryCardContainer}>
        <View style={styles.summaryCard}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.summaryAmount}>-{formatAmountDisplay(total)}₽</Text>
          )}
          <Text style={styles.summarySubtitle}>за месяц</Text>
        </View>
      </View>

      {/* Transactions List - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {!loading && transactions.length === 0 ? (
          <View style={styles.transactionCard}>
            <Text style={styles.transactionCategory}>Нет операций</Text>
            <Text style={styles.transactionAmount}>0₽</Text>
          </View>
        ) : (
          transactions.map((t) => {
            const cat = (t as any).category as Category | undefined;
            const iconKey = cat?.iconKey || 'other_expense';
            const iconSource = iconByKey[iconKey] || iconByKey['other_expense'];

            return (
              <TouchableOpacity 
                key={t.id} 
                style={styles.transactionCard}
                onLongPress={() => handleDelete(t.id)}
                delayLongPress={500}
              >
                <View style={styles.transactionLeft}>
                  <Image source={iconSource} style={styles.transactionIconImage} resizeMode="contain" />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>{t.category?.name || 'Без категории'}</Text>
                    <Text style={styles.transactionPaymentMethod}>{t.paymentMethod?.name || '—'}</Text>
                    <Text style={styles.transactionDate}>{new Date(t.occurredAt).toLocaleDateString('ru-RU')}</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>-{formatAmountDisplay(t.amount)}₽</Text>
              </TouchableOpacity>
            );
          })
        )}
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
    color: '#A0522D',
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
  transactionIconImage: {
    width: 40,
    height: 40,
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
    color: '#A0522D',
    marginLeft: 12,
  },
});

export default ExpensesView;

