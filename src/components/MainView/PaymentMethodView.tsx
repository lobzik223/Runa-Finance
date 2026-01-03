import React, { useState } from 'react';
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

interface PaymentMethodViewProps {
  onBack: () => void;
  onSelect?: (method: string) => void;
}

const PaymentMethodView: React.FC<PaymentMethodViewProps> = ({ onBack, onSelect }) => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'cash', name: 'Наличные деньги', icon: require('../../../images/icon/cash.png') },
    { id: 'debit', name: 'Дебетовая карта', icon: require('../../../images/icon/debit.png') },
    { id: 'credit', name: 'Кредитная карта', icon: require('../../../images/icon/creditkart.png') },
  ];

  const handleSelect = (methodId: string, methodName: string) => {
    setSelectedMethod(methodId);
    if (onSelect) {
      onSelect(methodName);
    }
    // Автоматически возвращаемся назад после выбора
    setTimeout(() => {
      onBack();
    }, 200);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Способ оплаты</Text>
        <View style={styles.backButton} />
      </View>

      {/* Payment Methods List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              selectedMethod === method.id && styles.methodItemSelected
            ]}
            onPress={() => handleSelect(method.id, method.name)}
          >
            <View style={styles.methodLeft}>
              <Image source={method.icon} style={styles.methodIconImage} resizeMode="contain" />
              <Text style={styles.methodText}>{method.name}</Text>
            </View>
            <Text style={styles.methodArrow}>→</Text>
          </TouchableOpacity>
        ))}
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  methodItem: {
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
  methodItemSelected: {
    backgroundColor: '#D4C5B0',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodIconImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  methodArrow: {
    fontSize: 20,
    color: '#333333',
    marginLeft: 12,
  },
});

export default PaymentMethodView;

