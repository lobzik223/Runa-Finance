import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PinCodeViewProps {
  mode: 'create' | 'enter';
  onComplete?: () => void;
}

const PinCodeView: React.FC<PinCodeViewProps> = ({ mode, onComplete }) => {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'create' ? 'enter' : 'enter');
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeDigits = useMemo(() => {
    return mode === 'create' && step === 'confirm' ? confirmPin : pin;
  }, [mode, step, confirmPin, pin]);

  const resetAll = () => {
    setPin([]);
    setConfirmPin([]);
    setStep(mode === 'create' ? 'enter' : 'enter');
  };

  const submitEnter = async (digits: string[]) => {
    const value = digits.join('');
    if (mode === 'enter') {
      setSubmitting(true);
      try {
        await apiService.verifyPin({ pin: value });
        onComplete?.();
      } catch (e: any) {
        Alert.alert('PIN', e?.message || 'Неверный PIN');
        resetAll();
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // create mode: move to confirm
    setStep('confirm');
  };

  const submitConfirm = async (digits: string[]) => {
    const value = digits.join('');
    if (value !== pin.join('')) {
      Alert.alert('PIN', 'PIN не совпадает. Попробуйте ещё раз.');
      setPin([]);
      setConfirmPin([]);
      setStep('enter');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.setPin({ pin: value, pinLength, biometricEnabled });
      onComplete?.();
    } catch (e: any) {
      Alert.alert('PIN', e?.message || 'Не удалось установить PIN');
      resetAll();
    } finally {
      setSubmitting(false);
    }
  };

  const handleNumberPress = (number: string) => {
    if (submitting) return;
    const current = activeDigits;
    if (current.length >= pinLength) return;

    const next = [...current, number];
    if (mode === 'create' && step === 'confirm') setConfirmPin(next);
    else setPin(next);

    if (next.length === pinLength) {
      setTimeout(() => {
        if (mode === 'create' && step === 'confirm') {
          void submitConfirm(next);
        } else {
          void submitEnter(next);
        }
      }, 200);
    }
  };

  const handleDelete = () => {
    if (submitting) return;
    const current = activeDigits;
    if (current.length === 0) return;
    const next = current.slice(0, -1);
    if (mode === 'create' && step === 'confirm') setConfirmPin(next);
    else setPin(next);
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              activeDigits.length > index && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item, colIndex) => {
              if (item === '') {
                return <View key={colIndex} style={styles.keypadButton} />;
              }
              
              if (item === 'delete') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.keypadButton}
                    onPress={handleDelete}
                    disabled={activeDigits.length === 0 || submitting}
                  >
                    <Text style={[styles.keypadText, (activeDigits.length === 0 || submitting) && styles.keypadTextDisabled]}>
                      ⌫
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.keypadButton}
                  onPress={() => handleNumberPress(item)}
                  disabled={activeDigits.length >= pinLength || submitting}
                >
                  <Text style={[styles.keypadText, (activeDigits.length >= pinLength || submitting) && styles.keypadTextDisabled]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 180, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.title}>
          {mode === 'create'
            ? (step === 'confirm' ? 'Повторите PIN' : 'Создайте PIN')
            : 'Введите PIN'}
        </Text>

        {mode === 'create' && step === 'enter' && (
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionPill, pinLength === 4 && styles.optionPillActive]}
              onPress={() => setPinLength(4)}
              disabled={submitting || pin.length > 0}
            >
              <Text style={[styles.optionText, pinLength === 4 && styles.optionTextActive]}>4 цифры</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionPill, pinLength === 6 && styles.optionPillActive]}
              onPress={() => setPinLength(6)}
              disabled={submitting || pin.length > 0}
            >
              <Text style={[styles.optionText, pinLength === 6 && styles.optionTextActive]}>6 цифр</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionPill, biometricEnabled && styles.optionPillActive]}
              onPress={() => setBiometricEnabled((v) => !v)}
              disabled={submitting}
            >
              <Text style={[styles.optionText, biometricEnabled && styles.optionTextActive]}>Биометрия</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderPinDots()}

        {renderKeypad()}
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 48,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
    gap: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  optionPillActive: {
    backgroundColor: '#1D4981',
    borderColor: '#1D4981',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#1D4981',
    borderColor: '#1D4981',
    shadowColor: '#1D4981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keypadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  keypadText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  keypadTextDisabled: {
    opacity: 0.3,
  },
});

export default PinCodeView;

