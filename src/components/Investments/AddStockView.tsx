import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type InvestmentAssetType } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddStockViewProps {
  onBack?: (updated?: boolean) => void;
}

const AddStockView: React.FC<AddStockViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [securityName, setSecurityName] = useState('');
  const [assetType, setAssetType] = useState<'bonds' | 'stocks' | 'indices' | 'futures' | null>(null);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const parseNum = (v: string) => {
    const n = Number(String(v).replace(/[^\d.,]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  };

  const mapType = (t: typeof assetType): InvestmentAssetType | undefined => {
    if (t === 'stocks') return 'STOCK';
    if (t === 'bonds') return 'BOND';
    if (t === 'indices') return 'ETF';
    if (t === 'futures') return 'OTHER';
    return undefined;
  };

  const mapTinkoffTypeToAssetType = (tinkoffType: string): InvestmentAssetType => {
    const upper = tinkoffType.toUpperCase();
    if (upper.includes('SHARE') || upper.includes('STOCK')) return 'STOCK';
    if (upper.includes('BOND')) return 'BOND';
    if (upper.includes('ETF')) return 'ETF';
    return 'OTHER';
  };

  const searchInstruments = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearching(true);
    try {
      const results = await apiService.searchTinkoffInstruments(query);
      
      if (results.success && results.instruments) {
        setSearchResults(results.instruments);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(results.error || 'Поиск недоступен');
      }
    } catch (error: any) {
      console.error('Tinkoff search failed:', error);
      setSearchResults([]);
      setSearchError('Поиск недоступен');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSecurityName(text);
    setSelectedInstrument(null);
    setSearchError(null);
    if (text.length >= 2) {
      searchInstruments(text);
    } else {
      setSearchResults([]);
    }
  };

  const selectInstrument = (instrument: any) => {
    setSelectedInstrument(instrument);
    setSecurityName(`${instrument.ticker} - ${instrument.name}`);
    setSearchResults([]);
    
    // Автоматически определяем тип по данным из Tinkoff
    if (instrument.type) {
      const typeUpper = instrument.type.toUpperCase();
      if (typeUpper.includes('SHARE') || typeUpper.includes('STOCK')) {
        setAssetType('stocks');
      } else if (typeUpper.includes('BOND')) {
        setAssetType('bonds');
      } else if (typeUpper.includes('ETF')) {
        setAssetType('indices');
      }
    }
  };

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
          <Text style={styles.headerTitle}>Добавление акции</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Поиск инструмента</Text>
          <Text style={[styles.fieldLabel, { fontSize: 13, fontWeight: '400', color: '#666', marginBottom: 12, marginTop: -8 }]}>
            Введите тикер или название: SBER, Газпром, YNDX
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.inputField}
              value={securityName}
              onChangeText={handleSearchChange}
              placeholder="Введите тикер или название..."
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
            {searching && (
              <View style={styles.searchingIndicator}>
                <Text style={styles.searchingText}>Поиск...</Text>
              </View>
            )}
            {searchResults.length > 0 && !selectedInstrument && (
              <View style={styles.searchResultsContainer}>
                <ScrollView style={styles.searchResultsList} nestedScrollEnabled>
                  {searchResults.map((instrument, index) => (
                    <TouchableOpacity
                      key={`${instrument.figi}-${index}`}
                      style={styles.searchResultItem}
                      onPress={() => selectInstrument(instrument)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchResultTicker}>{instrument.ticker}</Text>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {instrument.name}
                        </Text>
                        <Text style={styles.searchResultType}>{instrument.type} • {instrument.currency}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {!!searchError && !selectedInstrument && searchResults.length === 0 && securityName.trim().length >= 2 && (
              <View style={styles.searchErrorBox}>
                <Text style={styles.searchErrorText}>
                  {searchError}. Если у тебя 404 — перезапусти backend в Docker (сборка/обновление).
                </Text>
              </View>
            )}
            {selectedInstrument && (
              <View style={styles.selectedInstrument}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedInstrumentTicker}>
                    {selectedInstrument.ticker}
                  </Text>
                  <Text style={styles.selectedInstrumentName}>
                    {selectedInstrument.name}
                  </Text>
                  <Text style={styles.selectedInstrumentType}>
                    {selectedInstrument.type} • {selectedInstrument.currency}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedInstrument(null);
                    setSecurityName('');
                    setSearchResults([]);
                  }}
                  style={styles.clearSelectionButton}
                >
                  <Text style={styles.clearSelectionText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Asset Type Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Тип актива</Text>
          <View style={styles.radioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                assetType === 'bonds' && styles.radioButtonActive
              ]}
              onPress={() => setAssetType('bonds')}
            >
              <View style={styles.radioCircle}>
                {assetType === 'bonds' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioButtonText}>Облигации</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                assetType === 'stocks' && styles.radioButtonActive
              ]}
              onPress={() => setAssetType('stocks')}
            >
              <View style={styles.radioCircle}>
                {assetType === 'stocks' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioButtonText}>Акции</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                assetType === 'indices' && styles.radioButtonActive
              ]}
              onPress={() => setAssetType('indices')}
            >
              <View style={styles.radioCircle}>
                {assetType === 'indices' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioButtonText}>Индексы</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                assetType === 'futures' && styles.radioButtonActive
              ]}
              onPress={() => setAssetType('futures')}
            >
              <View style={styles.radioCircle}>
                {assetType === 'futures' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioButtonText}>Фьючерсы</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Количество</Text>
          <TextInput
            style={styles.inputField}
            value={quantity}
            onChangeText={setQuantity}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Purchase Price Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Цена покупки</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInputField}
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              placeholder="Цена за 1 шт."
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.currencyButton}>
              <Text style={styles.currencyIcon}>₽</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Purchase Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Дата покупки</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInputField}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            void (async () => {
              // Проверяем, что выбран реальный инструмент из Tinkoff
              if (!selectedInstrument) {
                Alert.alert(
                  'Ошибка',
                  'Пожалуйста, выберите инструмент из списка Tinkoff Invest. Введите тикер или название и выберите из результатов поиска.'
                );
                return;
              }

              const qty = parseNum(quantity);
              if (!Number.isFinite(qty) || qty <= 0) {
                Alert.alert('Ошибка', 'Введите количество');
                return;
              }

              const price = parseNum(purchasePrice);
              if (!Number.isFinite(price) || price < 0) {
                Alert.alert('Ошибка', 'Введите цену покупки');
                return;
              }

              let boughtAt: string;
              if (purchaseDate.trim()) {
                // Try to parse user input
                const parsed = new Date(purchaseDate.trim());
                if (Number.isNaN(parsed.getTime())) {
                  Alert.alert('Ошибка', 'Неверный формат даты. Используйте YYYY-MM-DD или оставьте пустым');
                  return;
                }
                boughtAt = parsed.toISOString();
              } else {
                // Use current date if not provided
                boughtAt = new Date().toISOString();
              }

              // Проверяем, что выбран реальный инструмент из Tinkoff
              if (!selectedInstrument) {
                Alert.alert(
                  'Выберите инструмент',
                  'Введите тикер или название в поле поиска и выберите из списка результатов.'
                );
                return;
              }

              const t = mapType(assetType);
              if (!t) {
                Alert.alert('Ошибка', 'Выберите тип актива');
                return;
              }

              try {
                // Используем данные из Tinkoff для создания актива
                const mappedType = mapTinkoffTypeToAssetType(selectedInstrument.type);
                
                console.log('[AddStock] Создание актива из Tinkoff:', { 
                  ticker: selectedInstrument.ticker,
                  name: selectedInstrument.name,
                  type: mappedType,
                  figi: selectedInstrument.figi
                });
                
                const asset: any = await apiService.addInvestmentAsset({ 
                  tickerOrName: selectedInstrument.ticker,
                  assetType: mappedType,
                  exchange: 'MOEX'
                });
                console.log('[AddStock] Актив создан:', asset);
                
                if (!asset || !asset.id) {
                  Alert.alert('Ошибка', 'Актив не был создан. Попробуйте еще раз.');
                  return;
                }

                console.log('[AddStock] Добавление лота:', { assetId: asset.id, quantity: qty, pricePerUnit: price, boughtAt });
                await apiService.addInvestmentLot({
                  assetId: Number(asset.id),
                  quantity: qty,
                  pricePerUnit: price,
                  boughtAt,
                });
                console.log('[AddStock] Лот добавлен успешно');
                Alert.alert('Готово', `${selectedInstrument.name} добавлен в портфель`);
                onBack?.(true);
              } catch (e: any) {
                console.error('[AddStock] Ошибка:', e);
                const errorMsg = e?.message || e?.response?.data?.message || 'Не удалось добавить актив';
                Alert.alert('Ошибка', errorMsg);
              }
            })();
          }}
        >
          <Text style={styles.addButtonText}>Добавить акцию</Text>
        </TouchableOpacity>
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
  searchingIndicator: {
    position: 'absolute',
    right: 18,
    top: 16,
    zIndex: 10,
  },
  searchingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: '#1D4981',
  },
  searchErrorBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(163, 31, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(163, 31, 36, 0.35)',
  },
  searchErrorText: {
    color: '#A31F24',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  searchResultsList: {
    maxHeight: 350,
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D4',
    backgroundColor: '#FFFFFF',
  },
  searchResultTicker: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 6,
  },
  searchResultName: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    lineHeight: 20,
  },
  searchResultType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  selectedInstrument: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedInstrumentTicker: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedInstrumentName: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedInstrumentType: {
    fontSize: 12,
    color: '#4CAF50',
  },
  clearSelectionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  clearSelectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddStockView;

