import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';
import { parseAmount, validateAmount } from '../../utils/amountFormatter';
import AmountInput from '../common/AmountInput';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const parseNum = (v: string): number => {
  const cleaned = v.replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : NaN;
};

interface AddDepositViewProps {
  onBack?: () => void;
}

const AddDepositView: React.FC<AddDepositViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [depositType, setDepositType] = useState<'indefinite' | 'term'>('term');
  const [depositName, setDepositName] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [interestAccrualDate, setInterestAccrualDate] = useState('25 число каждого месяца');
  const [endDate, setEndDate] = useState('');
  const [interestRate, setInterestRate] = useState('');


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
          <Text style={styles.headerTitle}>Добавление вклада</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Deposit Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Название вклада</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInputField}
              value={depositName}
              onChangeText={setDepositName}
              placeholder=""
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Deposit Type Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Тип вклада</Text>
          
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setDepositType('indefinite')}
          >
            <View style={styles.radioCircle}>
              {depositType === 'indefinite' && <View style={styles.radioCircleFilled} />}
            </View>
            <Text style={styles.radioText}>Бессрочный вклад</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setDepositType('term')}
          >
            <View style={styles.radioCircle}>
              {depositType === 'term' && <View style={styles.radioCircleFilled} />}
            </View>
            <Text style={styles.radioText}>Срочный вклад</Text>
          </TouchableOpacity>
        </View>

        {/* Deposit Amount Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Сумма вклада</Text>
          <View style={styles.amountInputWrapper}>
            <AmountInput
              style={styles.inputField}
              value={depositAmount}
              onValueChange={setDepositAmount}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Text style={styles.rubleSign}>₽</Text>
          </View>
        </View>

        {/* Interest Accrual Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Дата начисления процентов</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInputField}
              value={interestAccrualDate}
              onChangeText={setInterestAccrualDate}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>

        {/* End Date Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Дата окончания вклада</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInputField}
              value={endDate}
              onChangeText={setEndDate}
              placeholder=""
              placeholderTextColor="#999"
            />
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>

        {/* Interest Rate Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Процентная ставка</Text>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInputField}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder=""
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Add Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              void (async () => {
                const name = depositName.trim();
                if (!name) {
                  Alert.alert('Ошибка', 'Введите название');
                  return;
                }

                const principal = parseAmount(depositAmount);
                const principalValidation = validateAmount(principal);
                if (!principalValidation.valid) {
                  Alert.alert('Ошибка', principalValidation.error || 'Введите сумму больше 0');
                  return;
                }

                const rate = parseNum(interestRate);
                if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
                  Alert.alert('Ошибка', 'Введите процент (0–100)');
                  return;
                }

                // Сейчас принимаем дату как YYYY-MM-DD (или ISO). Если пусто — backend сам поставит ближайшую.
                const nextPayoutAt = interestAccrualDate.trim();
                const maturity = endDate.trim();

                try {
                  await apiService.createDepositAccount({
                    name,
                    principal,
                    interestRate: rate,
                    payoutSchedule: 'MONTHLY',
                    ...(nextPayoutAt ? { nextPayoutAt } : {}),
                    ...(depositType === 'term' && maturity ? { maturityAt: maturity } : {}),
                  });

                  Alert.alert('Успех', 'Вклад добавлен');
                  onBack?.();
                } catch (e: any) {
                  Alert.alert('Ошибка', e?.message || 'Не удалось добавить вклад');
                }
              })();
            }}
          >
            <Text style={styles.addButtonText}>Добавить вклад</Text>
          </TouchableOpacity>
        </View>
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
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputWrapper: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputField: {
    fontSize: 16,
    color: '#333333',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    paddingRight: 8,
  },
  rubleSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A0522D',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#A0522D',
  },
  radioText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
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

export default AddDepositView;

