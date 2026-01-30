import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import {
  apiService,
  resolveAssetLogoUrl,
  type InvestmentAssetType,
  type AssetSearchResult,
  type SearchAssetType,
  type MarketNewsItem,
} from '../../services/api';
import AssetViewScreen from './AssetViewScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AssetWidget = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo: string;
  currency?: string;
  exchange?: string | null;
  type?: string;
};

const TYPE_FILTERS: Array<{ label: string; value: SearchAssetType | null }> = [
  { label: 'Все', value: null },
  { label: 'Акции', value: 'STOCK' },
  { label: 'Облигации', value: 'BOND' },
  { label: 'ETF', value: 'ETF' },
  { label: 'Крипто', value: 'CRYPTO' },
  { label: 'Фьючерсы', value: 'FUTURES' },
];

const SEARCH_TYPE_LABELS: Record<SearchAssetType, string> = {
  STOCK: 'Акция',
  BOND: 'Облигация',
  ETF: 'ETF',
  CRYPTO: 'Крипто',
  OTHER: 'Прочее',
  FUTURES: 'Фьючерс',
};

interface AddStockViewProps {
  onBack?: (updated?: boolean) => void;
  onShowAssetView?: (show: boolean) => void;
}

const AddStockView: React.FC<AddStockViewProps> = ({ onBack, onShowAssetView }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchAssetType | null>('STOCK');
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [popularAssets, setPopularAssets] = useState<AssetWidget[]>([]);
  const [fallingAssets, setFallingAssets] = useState<AssetWidget[]>([]);
  const [risingAssets, setRisingAssets] = useState<AssetWidget[]>([]);
  const [dividendAssets, setDividendAssets] = useState<AssetWidget[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<AssetSearchResult | null>(null);
  const hasLoadedAssetsOnce = useRef(false);

  const lastShowAssetView = useRef(false);
  useEffect(() => {
    const show = !!viewingAsset;
    if (lastShowAssetView.current !== show) {
      onShowAssetView?.(show);
      lastShowAssetView.current = show;
    }
  }, [viewingAsset, onShowAssetView]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setSearching(false);
      return;
    }

    let isCancelled = false;
    setSearching(true);
    setSearchError('');

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const results = await apiService.searchInvestmentAssets({
            query,
            assetType: activeFilter ?? null,
          });
          if (!isCancelled) {
            setSearchResults(results);
          }
        } catch (error: any) {
          if (!isCancelled) {
            setSearchError(error?.message || 'Не удалось найти активы');
            setSearchResults([]);
          }
        } finally {
          if (!isCancelled) {
            setSearching(false);
          }
        }
      })();
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeFilter]);

  const handleSelectAsset = (asset: AssetSearchResult) => {
    setSelectedAsset(asset);
    setSearchQuery(asset.symbol || asset.name);
    setSearchError('');
    
    // Сразу открываем аналитику при выборе из поиска
    handleSelectWidgetAsset({
      ticker: asset.symbol,
      name: asset.name,
      price: 0, // Цена подтянется в AssetViewScreen
      change: 0,
      changePercent: 0,
      logo: asset.logo || '',
      type: asset.type,
      currency: asset.currency,
      exchange: asset.exchange
    });
  };

  const handleSelectWidgetAsset = (widget: AssetWidget) => {
    const asset: AssetSearchResult = {
      symbol: widget.ticker,
      name: widget.name,
      type: (widget.type as SearchAssetType) || 'STOCK',
      currency: widget.currency || 'RUB',
      exchange: widget.exchange || null,
      logo: widget.logo,
    };
    setViewingAsset(asset);
  };

  const handleBuyFromView = async (ticker: string, quantity: number, price: number) => {
    try {
      // Создаем актив если его еще нет
      const asset: any = await apiService.addInvestmentAsset({
        tickerOrName: ticker,
        assetType: 'STOCK',
        exchange: 'MOEX',
      });

      if (!asset || !asset.id) {
        throw new Error('Не удалось создать актив');
      }

      // Добавляем лот
      await apiService.addInvestmentLot({
        assetId: Number(asset.id),
        quantity,
        pricePerUnit: price,
        boughtAt: new Date().toISOString(),
      });

      // Обновляем портфель
      if (onBack) {
        onBack(true);
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Не удалось купить акции');
    }
  };

  const reloadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const fetched = await apiService.getMarketNews(5);
      setNews(Array.isArray(fetched) ? fetched : []);
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const reloadAssets = useCallback(async () => {
    const isFirstLoad = !hasLoadedAssetsOnce.current;
    if (isFirstLoad) setLoadingAssets(true);
    try {
      const [popular, falling, rising, dividend] = await Promise.all([
        apiService.getPopularAssets('popular').catch(() => []),
        apiService.getPopularAssets('falling').catch(() => []),
        apiService.getPopularAssets('rising').catch(() => []),
        apiService.getPopularAssets('dividend').catch(() => []),
      ]);
      
      // Обновляем только цены и изменения, сохраняя порядок тикеров, чтобы UI не "прыгал"
      const updateList = (prev: AssetWidget[], next: AssetWidget[]) => {
        if (next.length === 0) return prev; // Если новые данные пустые, оставляем старые
        if (prev.length === 0) return next;
        
        // Глубокое сравнение для предотвращения лишних ререндеров
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

        // Если тикеры те же, просто обновляем данные. Если другие - заменяем.
        const prevTickers = prev.map(a => a.ticker).sort().join(',');
        const nextTickers = next.map(a => a.ticker).sort().join(',');
        
        if (prevTickers === nextTickers) {
          return prev.map(p => {
            const n = next.find(a => a.ticker === p.ticker);
            return n ? { ...p, ...n } : p;
          });
        }
        return next;
      };

      setPopularAssets(prev => updateList(prev, popular));
      setFallingAssets(prev => updateList(prev, falling));
      setRisingAssets(prev => updateList(prev, rising));
      setDividendAssets(prev => updateList(prev, dividend));
      
      hasLoadedAssetsOnce.current = true;
    } catch (error) {
      console.error('Ошибка загрузки активов:', error);
    } finally {
      if (isFirstLoad) setLoadingAssets(false);
    }
  }, []);

  useEffect(() => {
    void reloadNews();
    void reloadAssets();
  }, []); // Пустой массив, так как reloadAssets и reloadNews стабильны

  // Обновляем только цены карточек (без перерисовки всего экрана)
  useEffect(() => {
    const interval = setInterval(() => {
      void reloadAssets();
    }, 15000);

    return () => clearInterval(interval);
  }, [reloadAssets]);

  const parseNum = (val: string) => parseFloat(val.replace(',', '.'));

  const handleAddAsset = () => {
    void (async () => {
      const normalizedQuery = searchQuery.trim();
      const targetName =
        selectedAsset?.symbol?.trim() ||
        selectedAsset?.name?.trim() ||
        normalizedQuery;

      if (!targetName) {
        Alert.alert('Ошибка', 'Введите тикер или выберите актив из списка');
        return;
      }

      if (!selectedAsset && normalizedQuery.length >= 2 && searchResults.length > 1) {
        Alert.alert(
          'Уточните актив',
          'По вашему запросу найдено несколько активов. Выберите нужный из списка',
        );
        return;
      }

      const qty = parseNum(quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        Alert.alert('Ошибка', 'Введите корректное количество');
        return;
      }

      const price = parseNum(purchasePrice);
      if (!Number.isFinite(price) || price < 0) {
        Alert.alert('Ошибка', 'Введите цену покупки');
        return;
      }

      let boughtAt: string;
      if (purchaseDate.trim()) {
        const parsed = new Date(purchaseDate.trim());
        if (Number.isNaN(parsed.getTime())) {
          Alert.alert('Ошибка', 'Неверный формат даты. Используйте YYYY-MM-DD или оставьте пустым');
          return;
        }
        boughtAt = parsed.toISOString();
      } else {
        boughtAt = new Date().toISOString();
      }

      const requestData: { tickerOrName: string; assetType?: InvestmentAssetType; exchange?: string } = {
        tickerOrName: targetName,
      };

      if (selectedAsset) {
        const mappedType: InvestmentAssetType =
          selectedAsset.type === 'FUTURES' ? 'OTHER' : (selectedAsset.type as InvestmentAssetType);
        requestData.assetType = mappedType;
        if (selectedAsset.exchange) {
          requestData.exchange = selectedAsset.exchange;
        }
      }

      try {
        const asset: any = await apiService.addInvestmentAsset(requestData);
        if (!asset || !asset.id) {
          Alert.alert('Ошибка', 'Не удалось создать актив. Попробуйте снова.');
          return;
        }

        await apiService.addInvestmentLot({
          assetId: Number(asset.id),
          quantity: qty,
          pricePerUnit: price,
          boughtAt,
        });

        Alert.alert('Готово', `${targetName} добавлен в портфель`);
        setSearchQuery('');
        setSelectedAsset(null);
        setSearchResults([]);
        setSearchError('');
        setQuantity('');
        setPurchasePrice('');
        setPurchaseDate('');
        onBack?.(true);
      } catch (e: any) {
        console.error('[AddStock] Ошибка:', e);
        const errorMsg = e?.message || e?.response?.data?.message || 'Не удалось добавить актив';
        Alert.alert('Ошибка', errorMsg);
      }
    })();
  };

  const visiblePopular = useMemo(() => popularAssets.filter((asset) => asset.price > 0), [popularAssets]);
  const visibleRising = useMemo(() => risingAssets.filter((asset) => asset.price > 0), [risingAssets]);
  const visibleFalling = useMemo(() => fallingAssets.filter((asset) => asset.price > 0), [fallingAssets]);
  const visibleDividend = useMemo(() => dividendAssets.filter((asset) => asset.price > 0), [dividendAssets]);

  if (viewingAsset) {
    return (
      <AssetViewScreen
        asset={viewingAsset}
        onBack={() => {
          setViewingAsset(null);
          onShowAssetView?.(false);
        }}
        onBuy={handleBuyFromView}
      />
    );
  }

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <TouchableOpacity onPress={() => onBack?.()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Каталог акций</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Поиск и фильтры */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Поиск актива</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Тикер или название (например, SBER, GAZP)"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          <View style={styles.filterRow}>
            {TYPE_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <TouchableOpacity
                  key={filter.label}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter.value)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.searchResultsContainer}>
            {searching ? (
              <ActivityIndicator color="#1D4981" />
            ) : searchError ? (
              <Text style={styles.searchError}>{searchError}</Text>
            ) : searchResults.length === 0 ? (
              <Text style={styles.searchHint}>
                {searchQuery.trim().length < 2
                  ? 'Введите минимум 2 символа для поиска'
                  : 'Ничего не найдено'}
              </Text>
            ) : (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={`${result.symbol}-${result.name}`}
                  style={styles.searchResultCard}
                  onPress={() => handleSelectAsset(result)}
                >
                  <View style={styles.searchResultRow}>
                    <View style={styles.searchResultLogoContainer}>
                      {(() => {
                        const logoUrl = resolveAssetLogoUrl(result.logo, result.symbol);
                        if (logoUrl.endsWith('.svg')) {
                          return (
                            <SvgUri
                              uri={logoUrl}
                              width={32}
                              height={32}
                              onError={() => {
                                result.logo = `https://invest-brands.cdn-tinkoff.ru/${(result.symbol || '').toLowerCase()}x160.png`;
                              }}
                            />
                          );
                        }
                        return (
                          <Image
                            source={{ uri: logoUrl }}
                            style={{ width: 32, height: 32 }}
                            resizeMode="contain"
                          />
                        );
                      })()}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchResultTitle}>{result.name}</Text>
                      <Text style={styles.searchResultMeta}>{result.symbol} • {SEARCH_TYPE_LABELS[result.type]}</Text>
                    </View>
                    <Text style={styles.searchResultExchange}>{result.exchange || 'MOEX'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Секции виджетов */}
        {loadingAssets ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1D4981" size="large" />
            <Text style={styles.loadingText}>Загрузка активов...</Text>
          </View>
        ) : (
          <>
            <View style={styles.assetWidgets}>
              <Text style={styles.widgetSectionTitle}>Популярные</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {visiblePopular.length === 0 ? (
                  <Text style={styles.emptyText}>Нет данных</Text>
                ) : (
                  visiblePopular.map((asset) => (
                    <TouchableOpacity
                      key={asset.ticker}
                      style={styles.widgetCard}
                      onPress={() => handleSelectWidgetAsset(asset)}
                    >
                      <View style={styles.widgetLogoContainer}>
                        {(() => {
                          const logoUrl = resolveAssetLogoUrl(asset.logo, asset.ticker);
                          if (logoUrl.endsWith('.svg')) {
                            return (
                              <SvgUri
                                uri={logoUrl}
                                width={48}
                                height={48}
                                style={styles.widgetLogo}
                                onError={() => {
                                  asset.logo = `https://invest-brands.cdn-tinkoff.ru/${(asset.ticker || '').toLowerCase()}x160.png`;
                                }}
                              />
                            );
                          }
                          return (
                            <Image
                              source={{ uri: logoUrl }}
                              style={styles.widgetLogo}
                              resizeMode="contain"
                            />
                          );
                        })()}
                      </View>
                      <Text style={styles.widgetTicker}>{asset.ticker}</Text>
                      <Text style={styles.widgetName} numberOfLines={2}>
                        {asset.name}
                      </Text>
                      <Text style={styles.widgetPrice}>
                        {asset.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                      </Text>
                      <Text
                        style={
                          asset.change >= 0 ? styles.widgetChange : styles.widgetChangeNegative
                        }
                      >
                        {asset.change >= 0 ? '+' : ''}
                        {asset.change.toFixed(2)} ₽ • {asset.change >= 0 ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.assetWidgets}>
              <Text style={styles.widgetSectionTitle}>В росте</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {visibleRising.length === 0 ? (
                  <Text style={styles.emptyText}>Нет данных</Text>
                ) : (
                  visibleRising.map((asset) => (
                    <TouchableOpacity
                      key={asset.ticker}
                      style={styles.widgetCard}
                      onPress={() => handleSelectWidgetAsset(asset)}
                    >
                      <View style={styles.widgetLogoContainer}>
                        {(() => {
                          const logoUrl = resolveAssetLogoUrl(asset.logo, asset.ticker);
                          if (logoUrl.endsWith('.svg')) {
                            return (
                              <SvgUri
                                uri={logoUrl}
                                width={48}
                                height={48}
                                style={styles.widgetLogo}
                                onError={() => {
                                  asset.logo = `https://invest-brands.cdn-tinkoff.ru/${(asset.ticker || '').toLowerCase()}x160.png`;
                                }}
                              />
                            );
                          }
                          return (
                            <Image
                              source={{ uri: logoUrl }}
                              style={styles.widgetLogo}
                              resizeMode="contain"
                            />
                          );
                        })()}
                      </View>
                      <Text style={styles.widgetTicker}>{asset.ticker}</Text>
                      <Text style={styles.widgetName} numberOfLines={2}>
                        {asset.name}
                      </Text>
                      <Text style={styles.widgetPrice}>
                        {asset.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                      </Text>
                      <Text style={styles.widgetChange}>
                        +{asset.change.toFixed(2)} ₽ • +{asset.changePercent.toFixed(2)}%
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.assetWidgets}>
              <Text style={styles.widgetSectionTitle}>В падении</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {visibleFalling.length === 0 ? (
                  <Text style={styles.emptyText}>Нет данных</Text>
                ) : (
                  visibleFalling.map((asset) => (
                    <TouchableOpacity
                      key={asset.ticker}
                      style={styles.widgetCard}
                      onPress={() => handleSelectWidgetAsset(asset)}
                    >
                      <View style={styles.widgetLogoContainer}>
                        {(() => {
                          const logoUrl = resolveAssetLogoUrl(asset.logo, asset.ticker);
                          if (logoUrl.endsWith('.svg')) {
                            return (
                              <SvgUri
                                uri={logoUrl}
                                width={48}
                                height={48}
                                style={styles.widgetLogo}
                                onError={() => {
                                  asset.logo = `https://invest-brands.cdn-tinkoff.ru/${(asset.ticker || '').toLowerCase()}x160.png`;
                                }}
                              />
                            );
                          }
                          return (
                            <Image
                              source={{ uri: logoUrl }}
                              style={styles.widgetLogo}
                              resizeMode="contain"
                            />
                          );
                        })()}
                      </View>
                      <Text style={styles.widgetTicker}>{asset.ticker}</Text>
                      <Text style={styles.widgetName} numberOfLines={2}>
                        {asset.name}
                      </Text>
                      <Text style={styles.widgetPrice}>
                        {asset.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                      </Text>
                      <Text style={styles.widgetChangeNegative}>
                        {asset.change.toFixed(2)} ₽ • {asset.changePercent.toFixed(2)}%
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

            <View style={styles.assetWidgets}>
              <Text style={styles.widgetSectionTitle}>Дивидендные</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {visibleDividend.length === 0 ? (
                  <Text style={styles.emptyText}>Нет данных</Text>
                ) : (
                  visibleDividend.map((asset) => (
                    <TouchableOpacity
                      key={asset.ticker}
                      style={styles.widgetCard}
                      onPress={() => handleSelectWidgetAsset(asset)}
                    >
                      <View style={styles.widgetLogoContainer}>
                        {(() => {
                          const logoUrl = resolveAssetLogoUrl(asset.logo, asset.ticker);
                          if (logoUrl.endsWith('.svg')) {
                            return (
                              <SvgUri
                                uri={logoUrl}
                                width={48}
                                height={48}
                                style={styles.widgetLogo}
                                onError={() => {
                                  asset.logo = `https://invest-brands.cdn-tinkoff.ru/${(asset.ticker || '').toLowerCase()}x160.png`;
                                }}
                              />
                            );
                          }
                          return (
                            <Image
                              source={{ uri: logoUrl }}
                              style={styles.widgetLogo}
                              resizeMode="contain"
                            />
                          );
                        })()}
                      </View>
                      <Text style={styles.widgetTicker}>{asset.ticker}</Text>
                      <Text style={styles.widgetName} numberOfLines={2}>
                        {asset.name}
                      </Text>
                      <Text style={styles.widgetPrice}>
                        {asset.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                      </Text>
                      <Text
                        style={
                          asset.change >= 0 ? styles.widgetChange : styles.widgetChangeNegative
                        }
                      >
                        {asset.change >= 0 ? '+' : ''}
                        {asset.change.toFixed(2)} ₽ • {asset.change >= 0 ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </>
        )}

        {/* Новости */}
        <View style={styles.newsSection}>
          <Text style={styles.newsSectionTitle}>Новости фондового рынка</Text>
          {newsLoading ? (
            <View style={styles.newsCard}>
              <ActivityIndicator color="#1D4981" size="small" style={{ marginBottom: 10 }} />
              <Text style={styles.newsText}>Загрузка новостей...</Text>
            </View>
          ) : news.length === 0 ? (
            <View style={styles.newsCard}>
              <Text style={styles.newsText}>Пока нет новостей</Text>
            </View>
          ) : (
            news.map((n) => (
              <TouchableOpacity key={n.id} style={styles.newsCard}>
                <Text style={styles.newsText}>{n.title}</Text>
                <Text style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                  {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}
                </Text>
              </TouchableOpacity>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  inputField: {
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioButtonsContainer: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioButtonActive: {
    backgroundColor: '#E8E0D4',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1D4981',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1D4981',
  },
  radioButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputField: {
    flex: 1,
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInputField: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#2F5B94',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
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
  infoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  searchSection: {
    backgroundColor: '#EBF1FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1D4981',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FDF7E9',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#1D4981',
  },
  filterChipText: {
    fontSize: 14,
    color: '#1D4981',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  searchResultsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#D4D4D4',
    paddingTop: 12,
  },
  searchResultCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultLogoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchResultExchange: {
    fontSize: 12,
    color: '#1D4981',
    fontWeight: '700',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  searchResultCardActive: {
    backgroundColor: '#D0E2FF',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
  },
  searchResultMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchResultMetaRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  searchChip: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4981',
  },
  searchMetaText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  searchHint: {
    fontSize: 13,
    color: '#666',
  },
  searchError: {
    fontSize: 13,
    color: '#E53935',
  },
  selectedAssetInfo: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  selectedAssetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  selectedAssetMetaRow: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  selectedAssetTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D5E1FF',
    marginRight: 12,
    marginBottom: 4,
  },
  clearSelectionText: {
    color: '#E8F3FF',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  detailsSection: {
    marginTop: 8,
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
  assetWidgets: {
    marginBottom: 16,
  },
  widgetSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 8,
  },
  widgetCard: {
    width: 200,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
    textAlign: 'center',
  },
  widgetLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  widgetLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  widgetTicker: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4981',
  },
  widgetName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  widgetPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
  },
  widgetChange: {
    fontSize: 12,
    color: '#4CAF50',
  },
  widgetChangeNegative: {
    fontSize: 12,
    color: '#E53935',
  },
});

export default AddStockView;

