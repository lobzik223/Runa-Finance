import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddStockView from './AddStockView';
import AssetDetailsView from './AssetDetailsView';
import AssetViewScreen from './AssetViewScreen';
import { apiService, resolveAssetLogoUrl, type InvestmentsPortfolioResponse, type MarketNewsItem } from '../../services/api';
import { SvgUri } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface InvestmentsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
  onShowAssetView?: (show: boolean) => void;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ onBack, onNavigate, onShowAssetView }) => {
  const insets = useSafeAreaInsets();
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAssetView, setShowAssetView] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number>(0);
  const [selectedAssetName, setSelectedAssetName] = useState<string>('');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('');
  const [selectedAssetPrice, setSelectedAssetPrice] = useState<number | null>(null);
  const [selectedAssetTotalCost, setSelectedAssetTotalCost] = useState<number>(0);
  const [selectedAssetLogo, setSelectedAssetLogo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<InvestmentsPortfolioResponse | null>(null);
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const reload = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [p, n] = await Promise.all([
        apiService.getInvestmentsPortfolio(),
        apiService.getMarketNews(10),
      ]);
      
      // Глубокое сравнение для предотвращения мерцания
      setPortfolio(prev => {
        const nextStr = JSON.stringify(p);
        const prevStr = JSON.stringify(prev);
        if (nextStr === prevStr) return prev;
        return p;
      });
      
      setNews(prev => {
        const nextStr = JSON.stringify(n);
        const prevStr = JSON.stringify(prev);
        if (nextStr === prevStr) return prev;
        return n;
      });
    } catch {
      // Если ошибка при фоновом обновлении, не сбрасываем данные
      if (!silent) {
        setPortfolio({ assets: [], totalCost: 0, totalCurrentValue: null, totalPnlValue: null, totalPnlPercent: null });
        setNews([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Обновление цен для реальных инвестиций пользователя каждые 15 секунд (тихое)
  useEffect(() => {
    const interval = setInterval(() => {
      void reload(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [reload]);



  useEffect(() => {
    void reload();
  }, [reload]);

  const assets = useMemo(() => portfolio?.assets ?? [], [portfolio]);

  const handleLogoError = useCallback((symbol: string) => {
    if (!symbol) return;
    setFailedLogos((prev) => ({ ...prev, [symbol]: true }));
  }, []);

  const getAssetLogoUri = (symbol: string) => {
    if (!symbol) return null;
    const slug = symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
    return slug ? `https://invest-brands.cdn-tinkoff.ru/${slug}x160.png` : null;
  };

  const lastShowAssetView = useRef(false);
  useEffect(() => {
    if (lastShowAssetView.current !== showAssetView) {
      onShowAssetView?.(showAssetView);
      lastShowAssetView.current = showAssetView;
    }
  }, [showAssetView, onShowAssetView]);

  if (showAssetView) {
    return (
      <AssetViewScreen
        onBack={async () => {
          setShowAssetView(false);
          onShowAssetView?.(false);
          await reload();
        }}
        asset={{
          ticker: selectedAssetSymbol,
          name: selectedAssetName,
          price: selectedAssetPrice,
          totalCost: selectedAssetTotalCost,
          logo: selectedAssetLogo,
        }}
        onBuy={async (ticker: string, quantity: number, price: number) => {
          try {
            await apiService.addInvestmentAsset({
              tickerOrName: ticker,
              assetType: 'STOCK',
              exchange: 'MOEX',
              quantity,
              purchasePrice: price,
            });
            await reload();
            setShowAssetView(false);
          } catch (error: any) {
            console.error('Failed to buy asset:', error);
          }
        }}
        onDelete={async () => {
          try {
            await apiService.deleteInvestmentAsset(selectedAssetId);
            await reload();
            setShowAssetView(false);
          } catch (error: any) {
            console.error('Failed to delete asset:', error);
          }
        }}
      />
    );
  }

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
        onShowAssetView={(show) => {
          onShowAssetView?.(show);
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
                const currentVal = a.currentValue ?? a.totalCost;
                const pnl = a.pnlValue ?? (a.currentValue != null ? a.currentValue - a.totalCost : 0);
                const pct = a.totalCost > 0 && a.currentValue !== null ? (pnl / a.totalCost) * 100 : (a.pnlPercent ?? null);
                const positive = pnl >= 0;
                const currentValue = currentVal;
                const formattedMarketValue = currentValue.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const formattedInvested = a.totalCost.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const pnlFormatted = Math.abs(pnl) >= 1
                  ? pnl.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : pnl.toFixed(2);
                const displaySymbol = (a.symbol || '').trim().toUpperCase();
                const symbolLabel = displaySymbol || (a.symbol || '').trim() || '—';
                const logoUrl = resolveAssetLogoUrl(a.logo, displaySymbol);
                const hasPnl = pct !== null && pct !== undefined && Number.isFinite(pct);

                return (
                  <TouchableOpacity
                    key={a.assetId}
                    style={styles.investmentCard}
                    onPress={() => {
                      setSelectedAssetId(a.assetId);
                      setSelectedAssetName(a.name);
                      setSelectedAssetSymbol(symbolLabel);
                      setSelectedAssetPrice(currentValue);
                      setSelectedAssetTotalCost(a.totalCost);
                      setSelectedAssetLogo(a.logo);
                      setShowAssetView(true);
                    }}
                  >
                    <View style={styles.investmentCardHeader}>
                      <View style={styles.assetLogoWrapper}>
                        {(() => {
                          if (logoUrl.endsWith('.svg')) {
                            return (
                              <SvgUri
                                uri={logoUrl}
                                width={40}
                                height={40}
                                style={styles.assetLogo}
                                onError={() => {
                                  a.logo = `https://invest-brands.cdn-tinkoff.ru/${(a.symbol || '').toLowerCase()}x160.png`;
                                }}
                              />
                            );
                          }
                          return (
                            <Image
                              source={{ uri: logoUrl }}
                              style={styles.assetLogo}
                              resizeMode="contain"
                            />
                          );
                        })()}
                      </View>
                      <View style={styles.investmentTextBlock}>
                        <Text style={styles.investmentName} numberOfLines={2}>
                          {a.name}
                        </Text>
                        <Text style={styles.investmentSymbol}>{symbolLabel}</Text>
                      </View>
                      <View style={styles.investmentPriceBlock}>
                        <Text style={styles.investmentAmount}>{formattedMarketValue} ₽</Text>
                        <Text style={styles.priceLabel}>Стоимость на рынке</Text>
                        {hasPnl && (
                          <Text style={positive ? styles.investmentPnlPositive : styles.investmentPnlNegative}>
                            {positive ? '+' : ''}{pnlFormatted} ₽  ({positive ? '+' : ''}{pct.toFixed(2)}%)
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.investmentCardDivider} />
                    <View style={styles.investmentFooterRow}>
                      <Text style={styles.investmentFooterText}>
                        Вложено: {formattedInvested} ₽
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
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  investmentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetLogoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8E0D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  assetLogo: {
    width: 40,
    height: 40,
  },
  assetLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D3D6DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetLogoFallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4981',
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
    marginBottom: 4,
  },
  investmentTextBlock: {
    flex: 1,
  },
  investmentSymbol: {
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#666666',
  },
  investmentPriceBlock: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  investmentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: '#888888',
  },
  investmentPnlPositive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 4,
  },
  investmentPnlNegative: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
    marginTop: 4,
  },
  investmentCardDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 8,
  },
  investmentFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentFooterText: {
    fontSize: 12,
    color: '#6B7280',
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

