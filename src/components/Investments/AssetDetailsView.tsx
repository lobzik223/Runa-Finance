import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AssetDetailsViewProps {
  onBack?: (deleted?: boolean) => void;
  assetId: number;
  assetName?: string;
}

const AssetDetailsView: React.FC<AssetDetailsViewProps> = ({ onBack, assetId, assetName = 'Актив' }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    loadAssetData();
  }, [assetId]);

  const loadAssetData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getInvestmentAsset(assetId);
      setAssetData(data);
      
      // Пробуем получить текущую цену
      if (data.symbol) {
        loadCurrentPrice(data.symbol);
      }
    } catch (error: any) {
      console.error('Failed to load asset:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные актива');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPrice = async (symbol: string) => {
    setPriceLoading(true);
    try {
      const quote = await apiService.getAssetQuote(symbol);
      setCurrentPrice(quote.price);
    } catch (error: any) {
      console.error('Failed to load price:', error);
      setCurrentPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  // Обновление цены каждые 10 секунд
  useEffect(() => {
    if (assetData?.symbol) {
      const interval = setInterval(() => {
        void loadCurrentPrice(assetData.symbol);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [assetData?.symbol]);

  const handleDelete = () => {
    Alert.alert(
      'Удалить актив?',
      `Удалить "${assetData?.name || assetName}" из портфеля? Это действие нельзя отменить.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteInvestmentAsset(assetId);
              Alert.alert('Готово', 'Актив удален из портфеля');
              onBack?.(true);
            } catch (error: any) {
              Alert.alert('Ошибка', error?.message || 'Не удалось удалить актив');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1D4981" />
      </View>
    );
  }

  if (!assetData) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Актив не найден</Text>
        <TouchableOpacity onPress={() => onBack?.()} style={{ marginTop: 20, padding: 12, backgroundColor: '#1D4981', borderRadius: 12 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Вычисляем данные из лотов
  const lots = assetData.lots || [];
  const totalQuantity = lots.reduce((sum: number, lot: any) => sum + Number(lot.quantity), 0);
  const totalCost = lots.reduce((sum: number, lot: any) => sum + (Number(lot.quantity) * Number(lot.pricePerUnit) + Number(lot.fees || 0)), 0);
  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  
  // Расчёты прибыли/убытка
  const currentValue = currentPrice ? totalQuantity * currentPrice : null;
  const pnl = currentValue !== null ? currentValue - totalCost : null;
  const pnlPercent = pnl !== null && totalCost > 0 ? (pnl / totalCost) * 100 : null;
  const priceChange = currentPrice && averagePrice > 0 ? currentPrice - averagePrice : null;
  const priceChangePercent = priceChange !== null && averagePrice > 0 ? (priceChange / averagePrice) * 100 : null;

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
          <Text style={styles.headerTitle}>Детали актива</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Header */}
        <View style={styles.assetHeader}>
          <Text style={styles.assetName}>{assetData.name}</Text>
          <Text style={styles.assetSymbol}>{assetData.symbol}</Text>
        </View>

        {/* Current Price Card - Trading Style */}
        <View style={styles.priceCard}>
          {priceLoading ? (
            <ActivityIndicator color="#1D4981" />
          ) : currentPrice ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.currentPriceLabel}>Текущая цена</Text>
                <Text style={styles.currentPrice}>
                  {currentPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                </Text>
                {priceChange !== null && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Text style={priceChange >= 0 ? styles.priceChangePositive : styles.priceChangeNegative}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </Text>
                    {priceChangePercent !== null && (
                      <Text style={priceChange >= 0 ? styles.priceChangePositive : styles.priceChangeNegative}>
                        {' '}({priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                      </Text>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Ср. цена</Text>
                  <Text style={styles.statItemValue}>{averagePrice.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statItemLabel}>Количество</Text>
                  <Text style={styles.statItemValue}>{totalQuantity.toFixed(2)} шт</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={{ color: '#666', textAlign: 'center' }}>Цена недоступна</Text>
          )}
        </View>

        {/* Portfolio Stats */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioTitle}>Ваша позиция</Text>
          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioLabel}>Вложено</Text>
            <Text style={styles.portfolioValue}>
              {totalCost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </Text>
          </View>
          {currentValue !== null && (
            <>
              <View style={styles.portfolioRow}>
                <Text style={styles.portfolioLabel}>Текущая стоимость</Text>
                <Text style={[styles.portfolioValue, { fontSize: 18, fontWeight: '700', color: '#1D4981' }]}>
                  {currentValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                </Text>
              </View>
              {pnl !== null && (
                <View style={styles.portfolioRow}>
                  <Text style={styles.portfolioLabel}>Прибыль/Убыток</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={pnl >= 0 ? styles.pnlPositive : styles.pnlNegative}>
                      {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </Text>
                    {pnlPercent !== null && (
                      <Text style={pnl >= 0 ? styles.pnlPositive : styles.pnlNegative}>
                        ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Transactions List */}
        {lots.length > 0 && (
          <View style={styles.transactionsCard}>
            <Text style={styles.transactionsTitle}>Сделки ({lots.length})</Text>
            {lots.map((lot: any, index: number) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionBadge}>
                  <Text style={styles.transactionBadgeText}>Покупка</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.transactionQuantity}>
                    {Number(lot.quantity).toFixed(2)} шт × {Number(lot.pricePerUnit).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(lot.boughtAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.transactionTotal}>
                  {(Number(lot.quantity) * Number(lot.pricePerUnit)).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.buyButton, { marginRight: 12 }]}
            onPress={() => {
              // TODO: Add buy more functionality
              Alert.alert('Информация', 'Функция докупки будет добавлена');
            }}
          >
            <Text style={styles.buyButtonText}>Докупить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </TouchableOpacity>
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
  assetHeader: {
    marginBottom: 20,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  priceCard: {
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
  currentPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1D4981',
  },
  priceChangePositive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  priceChangeNegative: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E0D4',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8E0D4',
    marginHorizontal: 16,
  },
  portfolioCard: {
    backgroundColor: '#FDF7E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 16,
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#666',
  },
  portfolioValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pnlPositive: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  pnlNegative: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E53935',
  },
  transactionsCard: {
    backgroundColor: '#FDF7E9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D4',
  },
  transactionBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  transactionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  transactionQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4981',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#A31F24',
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
  editButton: {
    flex: 1,
    backgroundColor: '#2F5B94',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default AssetDetailsView;

