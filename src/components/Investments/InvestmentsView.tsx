import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddStockView from './AddStockView';
import AssetDetailsView from './AssetDetailsView';
import { apiService, type InvestmentsPortfolioResponse, type MarketNewsItem } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface InvestmentsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number>(0);
  const [selectedAssetName, setSelectedAssetName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<InvestmentsPortfolioResponse | null>(null);
  const [news, setNews] = useState<MarketNewsItem[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [p, n] = await Promise.all([
        apiService.getInvestmentsPortfolio(),
        apiService.getMarketNews(10),
      ]);
      setPortfolio(p);
      setNews(n);
    } catch {
      setPortfolio({ assets: [], totalCost: 0, totalCurrentValue: null, totalPnlValue: null, totalPnlPercent: null });
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    void reload();
  }, [reload]);

  const assets = useMemo(() => portfolio?.assets ?? [], [portfolio]);

  if (showAssetDetails) {
    return (
      <AssetDetailsView
        onBack={async (deleted) => {
          setShowAssetDetails(false);
          if (deleted) {
            await reload();
          }
        }}
        assetId={selectedAssetId}
        assetName={selectedAssetName}
      />
    );
  }

  if (showAddStock) {
    return (
      <AddStockView
        onBack={async (updated) => {
          setShowAddStock(false);
          if (updated) {
            await reload();
          }
        }}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Инвестиции</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
                Доступный баланс
              </Text>
              <Text style={{ color: '#1D4981', fontSize: 24, fontWeight: '700' }}>
                {(100000 - (portfolio?.totalCost || 0)).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
                Вложено
              </Text>
              <Text style={{ color: '#A0522D', fontSize: 20, fontWeight: '700' }}>
                {(portfolio?.totalCost || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
              </Text>
            </View>
          </View>
        </View>

        {/* Portfolio Summary */}
        <View style={styles.graphCard}>
          <Text style={styles.newsSectionTitle}>Мои инвестиции</Text>
          {loading ? (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <ActivityIndicator />
            </View>
          ) : assets.length === 0 ? (
            <Text style={{ color: '#666', fontSize: 14, lineHeight: 20 }}>
              Пока нет активов. Нажмите "Добавить акцию" чтобы начать инвестировать
            </Text>
          ) : (
            <>
              {assets.map((a) => {
                const pnl = a.pnlValue ?? 0;
                const pct = a.totalCost > 0 && a.currentValue !== null ? (pnl / a.totalCost) * 100 : null;
                const positive = pnl >= 0;
                return (
                  <TouchableOpacity
                    key={a.assetId}
                    style={styles.investmentCard}
                    onPress={() => {
                      setSelectedAssetId(a.assetId);
                      setSelectedAssetName(a.name);
                      setShowAssetDetails(true);
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.investmentName}>{a.name}</Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                          {a.symbol}
                        </Text>
                      </View>
                      <Text style={[styles.investmentAmount, { textAlign: 'right' }]}>
                        {(a.currentValue || a.totalCost).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        Вложено: {a.totalCost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                      </Text>
                      <Text style={positive ? styles.investmentChangePositive : styles.investmentChangeNegative}>
                        {positive ? '+' : ''}
                        {Math.round(pnl).toLocaleString('ru-RU')} ₽
                        {pct !== null ? ` (${positive ? '+' : ''}${pct.toFixed(2)}%)` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        {/* Add Stock Button */}
        <TouchableOpacity 
          style={styles.addStockButton}
          onPress={() => setShowAddStock(true)}
        >
          <Text style={styles.addStockButtonText}>Добавить акцию</Text>
        </TouchableOpacity>

        {/* Stock Market News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.newsSectionTitle}>Новости фондового рынка</Text>
          {news.length === 0 ? (
            <View style={styles.newsCard}>
              <Text style={styles.newsText}>Пока нет новостей</Text>
            </View>
          ) : (
            news.map((n) => (
              <View key={n.id} style={styles.newsCard}>
                <Text style={styles.newsText}>{n.title}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#7792B8',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2,
    backgroundColor: '#7792B8',
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
  headerPlaceholder: {
    width: 40,
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  graphCard: {
    backgroundColor: '#A8C5E0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  graphContainer: {
    flexDirection: 'row',
    height: 220,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  graphArea: {
    flex: 1,
    height: 200,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D4C5B0',
    opacity: 0.3,
  },
  graphLineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  graphLineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#1D4981',
  },
  graphPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4981',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  investmentCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  investmentCard: {
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
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  investmentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A0522D',
    marginBottom: 4,
  },
  investmentChangePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  investmentChangeNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  addStockButton: {
    backgroundColor: '#1D4981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addStockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  newsSection: {
    marginBottom: 20,
  },
  newsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 16,
  },
  newsCard: {
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
  newsText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 22,
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

export default InvestmentsView;

