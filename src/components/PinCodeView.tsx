import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PinCodeViewProps {
  mode: 'create' | 'enter';
  onComplete?: () => void;
}

const PinCodeView: React.FC<PinCodeViewProps> = ({ mode, onComplete }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'create' ? 'enter' : 'enter');
  const PIN_LENGTH: 4 = 4;
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
        toast.error(e?.message || 'Неверный PIN');
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
      toast.error('PIN не совпадает. Попробуйте ещё раз.');
      setPin([]);
      setConfirmPin([]);
      setStep('enter');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.setPin({ pin: value, pinLength: PIN_LENGTH, biometricEnabled: false });
      onComplete?.();
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось установить PIN');
      resetAll();
    } finally {
      setSubmitting(false);
    }
  };

  const handleNumberPress = (number: string) => {
    if (submitting) return;
    const current = activeDigits;
    if (current.length >= PIN_LENGTH) return;

    const next = [...current, number];
    if (mode === 'create' && step === 'confirm') setConfirmPin(next);
    else setPin(next);

    if (next.length === PIN_LENGTH) {
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
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
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
      ['0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.keypadRow, rowIndex === numbers.length - 1 && styles.keypadRowLast]}>
            {rowIndex === numbers.length - 1 && <View style={styles.keypadButtonSpacer} />}
            {row.map((item, colIndex) => {
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
                  disabled={activeDigits.length >= PIN_LENGTH || submitting}
                >
                  <Text style={[styles.keypadText, (activeDigits.length >= PIN_LENGTH || submitting) && styles.keypadTextDisabled]}>
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
      <View pointerEvents="none" style={styles.backgroundOverlay} />
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

        <View style={styles.singleOptionHolder}>
          <Text style={styles.singleOptionText}>4 цифры</Text>
        </View>

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
  singleOptionHolder: {
    marginBottom: 24,
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  singleOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  keypadRowLast: {
    justifyContent: 'space-between',
  },
  keypadButtonSpacer: {
    width: 80,
    height: 80,
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

