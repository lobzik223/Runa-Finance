import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type AssetSearchResult } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AssetViewScreenProps {
  onBack?: () => void;
  asset: AssetSearchResult | { ticker: string; name: string; price?: number; logo?: string };
  onBuy?: (ticker: string, quantity: number, price: number) => Promise<void>;
  onDelete?: () => Promise<void>;
}

type Timeframe = '1W' | '1M' | '3M' | '1Y' | '5Y';

const AssetViewScreen: React.FC<AssetViewScreenProps> = ({ onBack, asset, onBuy, onDelete }) => {
  const insets = useSafeAreaInsets();
  const resolvedTicker = (asset as any).ticker || (asset as any).symbol || '';
  const resolvedName = (asset as any).name || resolvedTicker || 'Актив';
  const [currentPrice, setCurrentPrice] = useState<number | null>((asset as any).price || null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [candles, setCandles] = useState<Array<{ time: string; close: number }>>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const hasQuantity = buyQuantity && !isNaN(parseFloat(buyQuantity)) && parseFloat(buyQuantity) > 0;

  // Отслеживание состояния клавиатуры
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadAssetData = useCallback(async () => {
    setLoading(true);
    try {
      // Получаем текущую котировку
      try {
        const quote = await apiService.getAssetQuote(resolvedTicker);
        setCurrentPrice(quote.price);
        setBuyPrice(quote.price);
      } catch (quoteError: any) {
        console.warn('Не удалось получить котировку:', quoteError);
        // Используем цену из пропсов если есть
        if ((asset as any).price) {
          setCurrentPrice((asset as any).price);
          setBuyPrice((asset as any).price);
        }
      }

      // Загружаем исторические данные для графика
      const to = new Date();
      const from = new Date();
      
      switch (selectedTimeframe) {
        case '1W':
          from.setDate(from.getDate() - 7);
          break;
        case '1M':
          from.setMonth(from.getMonth() - 1);
          break;
        case '3M':
          from.setMonth(from.getMonth() - 3);
          break;
        case '1Y':
          from.setFullYear(from.getFullYear() - 1);
          break;
        case '5Y':
          from.setFullYear(from.getFullYear() - 5);
          break;
      }

      try {
        const candleData = await apiService.getAssetCandles({
          ticker: resolvedTicker,
          from: from.toISOString().split('T')[0],
          to: to.toISOString().split('T')[0],
          interval: 'DAY',
        });

        if (candleData && candleData.length > 0) {
          setCandles(candleData.map((c) => ({ time: c.time, close: c.close })));
          
          // Рассчитываем изменение цены
          const firstPrice = candleData[0].close;
          const lastPrice = candleData[candleData.length - 1].close;
          const change = lastPrice - firstPrice;
          const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
          setPriceChange(change);
          setPriceChangePercent(changePercent);
        }
      } catch (candleError: any) {
        console.warn('Не удалось загрузить исторические данные:', candleError);
        setCandles([]);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных актива:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedTicker, selectedTimeframe]);

  useEffect(() => {
    void loadAssetData();
  }, [loadAssetData]);

  const handleBuy = () => {
    if (!buyPrice || !buyQuantity) {
      Alert.alert('Ошибка', 'Введите количество акций');
      return;
    }

    const quantity = parseFloat(buyQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество');
      return;
    }

    const total = quantity * buyPrice;
    Alert.alert(
      'Подтверждение покупки',
      `Купить ${quantity} шт. × ${buyPrice.toFixed(2)} ₽ = ${total.toFixed(2)} ₽?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Купить',
          onPress: async () => {
            try {
              if (onBuy) {
                await onBuy(resolvedTicker, quantity, buyPrice);
                setShowBuyModal(false);
                setBuyQuantity('');
                Alert.alert('Успешно', 'Акции добавлены в портфель');
              }
            } catch (error: any) {
              Alert.alert('Ошибка', error?.message || 'Не удалось купить акции');
            }
          },
        },
      ],
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator color="#1D4981" size="large" />
          <Text style={styles.chartPlaceholderText}>Загрузка графика...</Text>
        </View>
      );
    }
    
    if (candles.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Нет данных для графика</Text>
          <Text style={styles.chartPlaceholderSubtext}>
            Исторические данные временно недоступны
          </Text>
        </View>
      );
    }

    const values = candles.map((c) => c.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const chartHeight = 200;
    const chartWidth = SCREEN_WIDTH - 80;

    const points = candles.map((candle, index) => {
      const x = (index / (candles.length - 1 || 1)) * chartWidth;
      const y = chartHeight - ((candle.close - min) / range) * chartHeight;
      return { x, y, value: candle.close };
    });

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <View
              key={ratio}
              style={[
                styles.gridLine,
                {
                  bottom: ratio * chartHeight,
                },
              ]}
            />
          ))}
          
          {/* Chart line */}
          {points.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = points[index - 1];
            const length = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2),
            );
            const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.chartLine,
                  {
                    left: prevPoint.x,
                    bottom: prevPoint.y,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    backgroundColor: priceChange >= 0 ? '#4CAF50' : '#E53935',
                  },
                ]}
              />
            );
          })}
          
          {/* Chart points */}
          {points.map((point, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.chartPoint,
                {
                  left: point.x - 3,
                  bottom: point.y - 3,
                  backgroundColor: priceChange >= 0 ? '#4CAF50' : '#E53935',
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.chartLabels}>
          {candles.length > 0 && (
            <>
              <Text style={styles.chartLabel}>
                {new Date(candles[0].time).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
              </Text>
              <Text style={styles.chartLabel}>
                {new Date(candles[candles.length - 1].time).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { marginTop: -insets.top, marginBottom: -insets.bottom }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 50 }]}>
        <TouchableOpacity onPress={() => onBack?.()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
            Аналитика
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Info */}
        <View style={styles.assetInfoCard}>
          <View style={styles.assetLogoContainer}>
            <Image
              source={{
                uri: `https://invest-brands.cdn-tinkoff.ru/${resolvedTicker.toLowerCase()}x160.png`,
              }}
              style={styles.assetLogo}
              onError={() => {
                // Fallback handled by background color
              }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.assetName} numberOfLines={2}>
            {resolvedName}
          </Text>
          <Text style={styles.assetTicker}>{resolvedTicker}</Text>
        </View>

        {/* Current Price */}
        {loading ? (
          <View style={styles.priceCard}>
            <ActivityIndicator color="#1D4981" size="large" />
          </View>
        ) : currentPrice ? (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Текущая цена</Text>
            <Text style={styles.currentPrice}>
              {currentPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
            </Text>
            <View style={styles.priceChangeRow}>
              <Text style={priceChange >= 0 ? styles.priceChangePositive : styles.priceChangeNegative}>
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)} ₽ ({priceChange >= 0 ? '+' : ''}
                {priceChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        ) : null}

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Динамика стоимости</Text>
          
          {/* Timeframe Selector */}
          <View style={styles.timeframeSelector}>
            {(['1W', '1M', '3M', '1Y', '5Y'] as Timeframe[]).map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[styles.timeframeButton, selectedTimeframe === tf && styles.timeframeButtonActive]}
                onPress={() => setSelectedTimeframe(tf)}
              >
                <Text style={[styles.timeframeText, selectedTimeframe === tf && styles.timeframeTextActive]}>
                  {tf === '1W' ? 'Неделя' : tf === '1M' ? 'Месяц' : tf === '3M' ? 'Полгода' : tf === '1Y' ? 'Год' : '5 лет'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderChart()}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { flex: 1, marginRight: 12 }]}
              onPress={async () => {
                Alert.alert(
                  'Удалить актив?',
                  `Удалить "${resolvedName}" из портфеля? Это действие нельзя отменить.`,
                  [
                    { text: 'Отмена', style: 'cancel' },
                    {
                      text: 'Удалить',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await onDelete();
                        } catch (error: any) {
                          Alert.alert('Ошибка', error?.message || 'Не удалось удалить актив');
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={styles.deleteButtonText}>Удалить</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.buyButton, { flex: 1 }]}
            onPress={() => setShowBuyModal(true)}
          >
            <Text style={styles.buyButtonText}>Купить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Buy Modal */}
      <Modal
        visible={showBuyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBuyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBuyModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.modalKeyboardView}
            keyboardVerticalOffset={
              Platform.OS === 'ios' 
                ? (hasQuantity && keyboardVisible ? 100 : hasQuantity ? 50 : -10)
                : (hasQuantity && keyboardVisible ? 60 : hasQuantity ? 30 : 0)
            }
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[
                styles.modalContent, 
                { 
                  paddingBottom: Platform.OS === 'ios' 
                    ? (hasQuantity && keyboardVisible ? Math.max(insets.bottom + 20, 30) : hasQuantity ? Math.max(insets.bottom + 15, 25) : Math.max(insets.bottom + 8, 18))
                    : (hasQuantity && keyboardVisible ? Math.max(insets.bottom + 20, 30) : hasQuantity ? Math.max(insets.bottom + 15, 25) : Math.max(insets.bottom + 10, 20)),
                  maxHeight: hasQuantity && keyboardVisible
                    ? (Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.65)
                    : hasQuantity
                    ? (Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.5 : SCREEN_HEIGHT * 0.55)
                    : (Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.4 : SCREEN_HEIGHT * 0.45),
                }
              ]}>
                <Text style={styles.modalTitle}>Покупка {resolvedTicker}</Text>
                <Text style={styles.modalSubtitle}>{resolvedName}</Text>

                {buyPrice && (
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceInfoLabel}>Цена за 1 акцию</Text>
                    <Text style={styles.priceInfoValue}>{buyPrice.toFixed(2)} ₽</Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Количество акций</Text>
                  <TextInput
                    style={styles.input}
                    value={buyQuantity}
                    onChangeText={setBuyQuantity}
                    placeholder="Введите количество"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                {buyPrice && buyQuantity && !isNaN(parseFloat(buyQuantity)) && parseFloat(buyQuantity) > 0 && (
                  <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Итого к оплате</Text>
                    <Text style={styles.totalValue}>
                      {(parseFloat(buyQuantity) * buyPrice).toFixed(2)} ₽
                    </Text>
                    <Text style={styles.totalDetails}>
                      {buyQuantity} шт. × {buyPrice.toFixed(2)} ₽
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowBuyModal(false)}
                  >
                    <Text style={styles.modalButtonCancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonBuy]}
                    onPress={handleBuy}
                  >
                    <Text style={styles.modalButtonBuyText}>Купить</Text>
                  </TouchableOpacity>
                </View>
                {(hasQuantity && keyboardVisible) && (
                  <View style={styles.modalBottomSpacer} />
                )}
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
    width: Math.max(40, SCREEN_WIDTH * 0.1),
    height: Math.max(40, SCREEN_WIDTH * 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  backArrow: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Math.max(8, SCREEN_WIDTH * 0.02),
  },
  headerTitle: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  headerPlaceholder: {
    width: Math.max(40, SCREEN_WIDTH * 0.1),
  },
  closeButton: {
    paddingHorizontal: Math.max(12, SCREEN_WIDTH * 0.03),
    paddingVertical: 6,
    minWidth: 60,
  },
  closeButtonText: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  assetInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  assetLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  assetLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  assetName: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 4,
    textAlign: 'center',
  },
  assetTicker: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: '#FDF7E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: Math.min(36, SCREEN_WIDTH * 0.09),
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 8,
  },
  priceChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangePositive: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  priceChangeNegative: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E53935',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  timeframeButton: {
    paddingHorizontal: Math.min(12, SCREEN_WIDTH * 0.03),
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#1D4981',
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    height: 220,
    marginBottom: 16,
  },
  chart: {
    flex: 1,
    position: 'relative',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E0E0E0',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.3,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Math.max(20, SCREEN_WIDTH * 0.05),
    maxHeight: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.4 : SCREEN_HEIGHT * 0.45,
    width: '100%',
  },
  modalTitle: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: '#666',
    marginBottom: 24,
  },
  priceInfo: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceInfoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4981',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  totalInfo: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: Math.min(28, SCREEN_WIDTH * 0.07),
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 4,
  },
  totalDetails: {
    fontSize: 14,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonBuy: {
    backgroundColor: '#4CAF50',
  },
  modalButtonBuyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBottomSpacer: {
    height: 100,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -Math.max(20, SCREEN_WIDTH * 0.05),
    marginTop: 10,
    marginBottom: -Math.max(20, SCREEN_WIDTH * 0.05),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});

export default AssetViewScreen;
