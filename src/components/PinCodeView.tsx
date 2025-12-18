import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PinCodeViewProps {
  mode: 'create' | 'enter';
  onComplete?: () => void;
}

const PinCodeView: React.FC<PinCodeViewProps> = ({ mode, onComplete }) => {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<string[]>([]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, number];
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Автоматически переходим дальше после ввода 4 цифр
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
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
                    disabled={pin.length === 0}
                  >
                    <Text style={[styles.keypadText, pin.length === 0 && styles.keypadTextDisabled]}>
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
                  disabled={pin.length >= 4}
                >
                  <Text style={[styles.keypadText, pin.length >= 4 && styles.keypadTextDisabled]}>
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
          {mode === 'create' ? 'Создайте пин-код' : 'Введите пин-код'}
        </Text>

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

