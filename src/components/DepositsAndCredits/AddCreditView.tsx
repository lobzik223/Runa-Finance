import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddCreditViewProps {
  onBack?: () => void;
}

const AddCreditView: React.FC<AddCreditViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'credit' | 'card'>('credit');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [creditName, setCreditName] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

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
          <Text style={styles.headerTitle}>Добавление кредита</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[
              styles.tab,
              styles.tabLeft,
              activeTab === 'credit' && styles.tabActive
            ]}
            onPress={() => setActiveTab('credit')}
          >
            <Text style={[styles.tabText, activeTab === 'credit' && styles.tabTextActive]}>
              Кредит
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              styles.tabRight,
              activeTab === 'card' && styles.tabActive
            ]}
            onPress={() => setActiveTab('card')}
          >
            <Text style={[styles.tabText, activeTab === 'card' && styles.tabTextActive]}>
              Кредитная карта
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View
        style={[styles.scrollView, styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Credit Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Название кредита</Text>
          <TextInput
            style={styles.inputField}
            value={creditName}
            onChangeText={setCreditName}
            placeholder=""
            placeholderTextColor="#999"
          />
        </View>

        {/* Credit Amount Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Сумма кредита</Text>
          <TextInput
            style={styles.inputField}
            value={creditAmount}
            onChangeText={setCreditAmount}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Interest Rate Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Процентная ставка (%)</Text>
          <TextInput
            style={styles.inputField}
            value={interestRate}
            onChangeText={setInterestRate}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Monthly Payment Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Ежемесячный платёж</Text>
          <TextInput
            style={styles.inputField}
            value={monthlyPayment}
            onChangeText={setMonthlyPayment}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Payment Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Дата ежемесячного платежа</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInputField}
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>

        {/* Reminder Toggle */}
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderLabel}>Напоминание</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#D4C5B0', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D4C5B0"
          />
        </View>

        {/* Add Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Добавить кредит</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    zIndex: 1,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
  },
  tabLeft: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  tabRight: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabActive: {
    backgroundColor: '#1D4981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  buttonContainer: {
    paddingTop: 20,
    paddingBottom: 0,
    zIndex: 1,
  },
  addButton: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
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

export default AddCreditView;

