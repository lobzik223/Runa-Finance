import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type CreditAccount, type DepositAccount } from '../../services/api';
import { formatAmountDisplay, parseAmount, validateAmount } from '../../utils/amountFormatter';
import AmountInput from '../common/AmountInput';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreditDetailsViewProps {
  onBack?: () => void;
  creditId?: number | null;
  depositId?: number | null;
  mode?: 'credit' | 'deposit';
}

const CreditDetailsView: React.FC<CreditDetailsViewProps> = ({ 
  onBack,
  creditId,
  depositId,
  mode,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [credit, setCredit] = useState<CreditAccount | null>(null);
  const [deposit, setDeposit] = useState<DepositAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDeposit = mode === 'deposit' || !!depositId;

  // Форма редактирования для кредита
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('');
  const [editMonthlyPayment, setEditMonthlyPayment] = useState('');
  const [editPaymentDay, setEditPaymentDay] = useState('');

  const parseNum = (v: string): number => {
    const cleaned = v.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : NaN;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isDeposit && depositId) {
          const accounts = await apiService.listDepositAccounts();
          const found = accounts.find(a => a.id === depositId);
          setDeposit(found || null);
        } else if (!isDeposit && creditId) {
          const accounts = await apiService.listCreditAccounts();
          const found = accounts.find(a => a.id === creditId);
          setCredit(found || null);
        }
      } catch (e: any) {
        Alert.alert('Ошибка', e?.message || 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [creditId, depositId, isDeposit]);

  // Инициализация формы редактирования при загрузке данных
  useEffect(() => {
    if (credit && !isDeposit) {
      setEditName(credit.name);
      setEditAmount(credit.kind === 'CREDIT_CARD' ? (credit.creditLimit || 0).toString() : (credit.principal || 0).toString());
      setEditInterestRate(credit.interestRate?.toString() || '');
      setEditMonthlyPayment(credit.minimumPayment?.toString() || '');
      setEditPaymentDay(credit.kind === 'CREDIT_CARD' ? (credit.billingDay?.toString() || '') : (credit.paymentDay?.toString() || ''));
    }
  }, [credit, isDeposit]);

  const handleDelete = () => {
    Alert.alert(
      'Удаление',
      `Удалить ${isDeposit ? 'вклад' : 'кредит'}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isDeposit && depositId) {
                await apiService.deleteDepositAccount(depositId);
              } else if (!isDeposit && creditId) {
                await apiService.deleteCreditAccount(creditId);
              }
              Alert.alert('Успех', `${isDeposit ? 'Вклад' : 'Кредит'} удалён`);
              onBack?.();
            } catch (e: any) {
              Alert.alert('Ошибка', e?.message || 'Не удалось удалить');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Восстанавливаем значения из credit
    if (credit) {
      setEditName(credit.name);
      setEditAmount(credit.kind === 'CREDIT_CARD' ? (credit.creditLimit || 0).toString() : (credit.principal || 0).toString());
      setEditInterestRate(credit.interestRate?.toString() || '');
      setEditMonthlyPayment(credit.minimumPayment?.toString() || '');
      setEditPaymentDay(credit.kind === 'CREDIT_CARD' ? (credit.billingDay?.toString() || '') : (credit.paymentDay?.toString() || ''));
    }
  };

  const handleSaveEdit = async () => {
    if (!credit || !creditId) return;

    setSaving(true);
    try {
      const name = editName.trim();
      if (!name) {
        Alert.alert('Ошибка', 'Введите название');
        setSaving(false);
        return;
      }

      const amount = parseAmount(editAmount);
      if (credit.kind === 'CREDIT_CARD') {
        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
          Alert.alert('Ошибка', amountValidation.error || 'Введите сумму больше 0');
          setSaving(false);
          return;
        }
      } else {
        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
          Alert.alert('Ошибка', amountValidation.error || 'Введите сумму больше 0');
          setSaving(false);
          return;
        }
      }

      const rate = editInterestRate ? parseNum(editInterestRate) : undefined;
      if (rate !== undefined && (rate < 0 || rate > 100)) {
        Alert.alert('Ошибка', 'Процент должен быть от 0 до 100');
        setSaving(false);
        return;
      }

      const minPay = editMonthlyPayment ? parseNum(editMonthlyPayment) : undefined;
      const day = editPaymentDay ? parseInt(editPaymentDay.replace(/[^\d]/g, ''), 10) : undefined;

      const updateData: any = { name };
      
      if (credit.kind === 'CREDIT_CARD') {
        updateData.creditLimit = amount;
        if (day !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
          updateData.billingDay = day;
        }
      } else {
        updateData.principal = amount;
        if (day !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
          updateData.paymentDay = day;
        }
        if (minPay !== undefined && !isNaN(minPay)) {
          updateData.minimumPayment = minPay;
        }
      }

      if (rate !== undefined && !isNaN(rate)) {
        updateData.interestRate = rate;
      }

      await apiService.updateCreditAccount(creditId, updateData);
      
      // Перезагружаем данные
      const accounts = await apiService.listCreditAccounts();
      const updated = accounts.find(a => a.id === creditId);
      setCredit(updated || null);
      
      setIsEditing(false);
      Alert.alert('Успех', 'Кредит обновлён');
    } catch (e: any) {
      Alert.alert('Ошибка', e?.message || 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const account = isDeposit ? deposit : credit;
  if (!account) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Детали</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Данные не найдены</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Детали</Text>
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
        <Text style={styles.headerSubtitle}>{account.name}</Text>

        {isEditing && !isDeposit && credit ? (
          /* Edit Form */
          <View style={styles.editForm}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Название кредита</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInputField}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder=""
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {credit.kind === 'CREDIT_CARD' ? 'Лимит:' : 'Сумма кредита:'}
              </Text>
              <View style={styles.amountInputWrapper}>
                <AmountInput
                  style={styles.inputField}
                  value={editAmount}
                  onValueChange={setEditAmount}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <Text style={styles.rubleSign}>₽</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Процентная ставка (%)</Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInputField}
                  value={editInterestRate}
                  onChangeText={setEditInterestRate}
                  placeholder=""
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {credit.kind === 'LOAN' && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Ежемесячный платёж</Text>
                <View style={styles.textInputWrapper}>
                  <TextInput
                    style={styles.textInputField}
                    value={editMonthlyPayment}
                    onChangeText={setEditMonthlyPayment}
                    placeholder=""
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {credit.kind === 'CREDIT_CARD' ? 'День выставления счёта:' : 'День платежа:'}
              </Text>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInputField}
                  value={editPaymentDay}
                  onChangeText={setEditPaymentDay}
                  placeholder="1-31"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.editButtonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} disabled={saving}>
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Summary Card */
          <View style={styles.summaryCard}>
            {isDeposit ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Сумма вклада:</Text>
                  <Text style={styles.summaryValue}>{formatAmountDisplay(deposit.principal)}₽</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Процентная ставка:</Text>
                  <Text style={styles.summaryValue}>{deposit.interestRate}% годовых</Text>
                </View>
                {deposit.nextPayoutAt && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Следующее начисление:</Text>
                    <Text style={styles.summaryValue}>
                      {new Date(deposit.nextPayoutAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </Text>
                  </View>
                )}
                {deposit.maturityAt && (
                  <View style={[styles.summaryRow, styles.summaryRowLast]}>
                    <Text style={styles.summaryLabel}>Дата окончания:</Text>
                    <Text style={styles.summaryValue}>
                      {new Date(deposit.maturityAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {credit.kind === 'CREDIT_CARD' ? 'Лимит:' : 'Сумма кредита:'}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {formatAmountDisplay(credit.kind === 'CREDIT_CARD' ? (credit.creditLimit || 0) : (credit.principal || 0))}₽
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {credit.kind === 'CREDIT_CARD' ? 'Долг:' : 'Остаток долга:'}
                  </Text>
                  <Text style={styles.summaryValue}>{formatAmountDisplay(credit.currentBalance)}₽</Text>
                </View>
                {credit.minimumPayment && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Следующий платеж:</Text>
                    <Text style={styles.summaryValue}>{formatAmountDisplay(credit.minimumPayment)}₽</Text>
                  </View>
                )}
                {credit.nextPaymentAt && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Дата платежа:</Text>
                    <Text style={styles.summaryValue}>
                      {new Date(credit.nextPaymentAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Процентная ставка:</Text>
                  <Text style={styles.summaryValue}>
                    {credit.interestRate ? `${credit.interestRate}% годовых` : '—'}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <>
            {!isDeposit && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Редактировать</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Удалить</Text>
            </TouchableOpacity>
          </>
        )}
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A0522D',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  summaryCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconContainerPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paymentIconPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
  },
  paymentContent: {
    flex: 1,
  },
  paymentMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  paymentStatusPaid: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  paymentStatusPending: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
  },
  editButton: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#9A031E',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editForm: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
  textInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInputField: {
    fontSize: 16,
    color: '#333333',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  rubleSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7A9A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1D4981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    borderTopWidth: 0,
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
  navIconImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
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

export default CreditDetailsView;

