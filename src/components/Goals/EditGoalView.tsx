import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type Goal } from '../../services/api';
import { handleAmountInput, formatAmountDisplay, parseAmount, validateAmount } from '../../utils/amountFormatter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditGoalViewProps {
  goal: Goal | null;
  onBack?: (updated?: boolean) => void;
}

const EditGoalView: React.FC<EditGoalViewProps> = ({ onBack, goal }) => {
  const insets = useSafeAreaInsets();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    setGoalName(goal?.name || '');
    setTargetAmount(goal ? String(goal.targetAmount) : '');
  }, [goal]);


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
          <Text style={styles.headerTitle}>Редактирование цели</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <View style={[styles.content, { paddingTop: 24, paddingBottom: insets.bottom + 100 }]}>
        {/* Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Название</Text>
          <TextInput
            style={styles.inputField}
            value={goalName}
            onChangeText={setGoalName}
            placeholder=""
            placeholderTextColor="#999"
          />
        </View>

        {/* Target Amount Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Целевая сумма</Text>
          <View style={styles.amountInputWrapper}>
            <TextInput
              style={styles.inputField}
              value={formatAmountDisplay(targetAmount)}
              onChangeText={(text) => setTargetAmount(handleAmountInput(text))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Text style={styles.rubleSign}>₽</Text>
          </View>
        </View>

        {/* Accumulated Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Добавить сумму</Text>
          <View style={styles.amountInputWrapper}>
            <TextInput
              style={styles.inputField}
              value={formatAmountDisplay(addAmount)}
              onChangeText={(text) => setAddAmount(handleAmountInput(text))}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Text style={styles.rubleSign}>₽</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => onBack?.()}>
            <Text style={styles.buttonText}>Отменить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              void (async () => {
                if (!goal) return;
                const name = goalName.trim();
                const target = parseAmount(targetAmount);
                if (!name) {
                  Alert.alert('Ошибка', 'Введите название');
                  return;
                }
                const targetValidation = validateAmount(target);
                if (!targetValidation.valid) {
                  Alert.alert('Ошибка', targetValidation.error || 'Введите целевую сумму');
                  return;
                }

                const add = addAmount ? parseAmount(addAmount) : 0;
                if (addAmount) {
                  const addValidation = validateAmount(add);
                  if (!addValidation.valid) {
                    Alert.alert('Ошибка', addValidation.error || 'Введите сумму пополнения');
                    return;
                  }
                }

                try {
                  await apiService.updateGoal(goal.id, { name, targetAmount: target });
                  if (add > 0) {
                    await apiService.addGoalContribution(goal.id, { amount: add });
                  }
                  Alert.alert('Успех', 'Сохранено');
                  onBack?.(true);
                } catch (e: any) {
                  Alert.alert('Ошибка', e?.message || 'Не удалось сохранить');
                }
              })();
            }}
          >
            <Text style={styles.buttonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            if (!goal) return;
            Alert.alert('Удалить цель?', 'Цель будет скрыта из активных', [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Удалить',
                style: 'destructive',
                onPress: () => {
                  void (async () => {
                    try {
                      await apiService.deleteGoal(goal.id);
                      onBack?.(true);
                    } catch (e: any) {
                      Alert.alert('Ошибка', e?.message || 'Не удалось удалить');
                    }
                  })();
                },
              },
            ]);
          }}
        >
          <Text style={styles.deleteButtonText}>Удалить цель</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
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
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    textAlign: 'right',
    paddingRight: 8,
  },
  rubleSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
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
  saveButton: {
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
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#A31F24',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
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
});

export default EditGoalView;

