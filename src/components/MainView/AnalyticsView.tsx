import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { apiService, type TransactionsAnalyticsResponse } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnalyticsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [analytics, setAnalytics] = useState<TransactionsAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const timezoneName = useMemo(() => {
    try {
      return (Intl as any)?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void (async () => {
      try {
        const res = await apiService.getTransactionsAnalytics({ timezone: timezoneName });
        if (alive) setAnalytics(res);
      } catch {
        if (alive) {
          setAnalytics({
            period: { from: new Date().toISOString(), to: new Date().toISOString(), timezone: timezoneName },
            totals: { income: 0, expense: 0, total: 0 },
            donutChart: { incomePercent: 0, expensePercent: 0 },
            breakdown: { income: [], expense: [] },
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [timezoneName]);

  const breakdown = useMemo(() => 
    activeTab === 'expense' ? analytics?.breakdown.expense || [] : analytics?.breakdown.income || [],
    [analytics, activeTab]
  );

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={[styles.chartPlaceholderText, { color: '#FFFFFF' }]}>Загрузка данных...</Text>
        </View>
      );
    }
    
    if (breakdown.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={[styles.chartPlaceholderText, { color: '#FFFFFF' }]}>Нет данных для анализа</Text>
        </View>
      );
    }

    const totalAmount = breakdown.reduce((acc, item) => acc + item.amount, 0);
    const size = 160;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    const colors = [
      '#F4A460', '#A8C5E0', '#4CAF50', '#E53935', 
      '#9C27B0', '#FF9800', '#009688', '#795548',
      '#607D8B', '#FFEB3B'
    ];

    let currentOffset = 0;

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            {breakdown.map((item, index) => {
              const percentage = totalAmount > 0 ? item.amount / totalAmount : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset * circumference;
              currentOffset += percentage;

              return (
                <Circle
                  key={item.categoryId}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.chartCenterText}>
          <Text style={styles.chartCenterAmount}>
            {Math.round(totalAmount).toLocaleString('ru-RU')}₽
          </Text>
          <Text style={styles.chartCenterLabel}>
            {activeTab === 'expense' ? 'Расходы' : 'Доходы'}
          </Text>
        </View>
      </View>
    );
  };

  const expensePercent = analytics?.donutChart.expensePercent || 0;
  const incomePercent = analytics?.donutChart.incomePercent || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.backgroundOverlay} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Аналитика</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            {renderChart()}
            <View style={styles.summaryTextContainer}>
              {breakdown.slice(0, 4).map((item, index) => (
                <View key={item.categoryId} style={styles.legendItem}>
                  <View style={[styles.legendColor, { 
                    backgroundColor: [
                      '#F4A460', '#A8C5E0', '#4CAF50', '#E53935', 
                      '#9C27B0', '#FF9800', '#009688', '#795548'
                    ][index % 8] 
                  }]} />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {item.categoryName}
                  </Text>
                  <Text style={styles.legendPercent}>{Math.round(item.percent)}%</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
              onPress={() => setActiveTab('expense')}
            >
              <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Расходы</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'income' && styles.tabActive]}
              onPress={() => setActiveTab('income')}
            >
              <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Доходы</Text>
            </TouchableOpacity>
          </View>

          {!loading && breakdown.length === 0 ? (
            <View style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Нет данных</Text>
              <Text style={styles.amountText}>0₽</Text>
            </View>
          ) : (
            breakdown.map((row) => (
              <View key={`${activeTab}-${row.categoryId}`} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: '#1D4981' }]}>{row.categoryName}</Text>
                  <Text style={styles.categoryPercent}>{Math.round(row.percent)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, row.percent))}%`, backgroundColor: '#1D4981' }]} />
                </View>
                <Text style={styles.amountText}>{Math.round(row.amount).toLocaleString('ru-RU')}₽</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#788FAC',
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#788FAC',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#788FAC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 12,
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
  headerTitle: {
    flex: 1,
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  summaryCard: {
    backgroundColor: '#1D4981',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  chartContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartCenterLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  summaryTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FDEBD0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#1D4981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D4981',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  categoryCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryPercent: {
    fontSize: 14,
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  amountText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    marginTop: 2,
  },
  chartPlaceholder: {
    flex: 1,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default AnalyticsView;
