import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddStockViewProps {
  onBack?: () => void;
}

const AddStockView: React.FC<AddStockViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [securityName, setSecurityName] = useState('');
  const [assetType, setAssetType] = useState<'bonds' | 'stocks' | 'indices' | 'futures' | null>(null);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
          <Text style={styles.fieldLabel}>Название бумаги</Text>
          <TextInput
            style={styles.inputField}
            value={securityName}
            onChangeText={setSecurityName}
            placeholder=""
            placeholderTextColor="#999"
          />
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
              <Text style={styles.currencyIcon}>$</Text>
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
        <TouchableOpacity style={styles.addButton}>
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
});

export default AddStockView;

