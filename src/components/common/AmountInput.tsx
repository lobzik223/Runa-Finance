import React, { useState, useRef, useEffect } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { handleAmountInput, formatAmountDisplay } from '../../utils/amountFormatter';

type AmountInputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string;
  onValueChange: (cleaned: string) => void;
};

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onValueChange,
  style,
  keyboardType = 'numeric',
  placeholder = '0',
  placeholderTextColor = '#999',
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');
  const isFocusedRef = useRef(false);

  // При потере фокуса форматируем значение
  const handleBlur = () => {
    isFocusedRef.current = false;
    if (value) {
      const formatted = formatAmountDisplay(value);
      setDisplayValue(formatted);
    }
  };

  // При получении фокуса показываем сырое значение для удобного ввода
  const handleFocus = () => {
    isFocusedRef.current = true;
    setDisplayValue(value || '');
  };

  const handleChange = (text: string) => {
    const cleaned = handleAmountInput(text);
    setDisplayValue(cleaned);
    onValueChange(cleaned);
  };

  // Синхронизируем displayValue с value при изменении извне
  useEffect(() => {
    if (!isFocusedRef.current) {
      if (value) {
        setDisplayValue(formatAmountDisplay(value));
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue(value || '');
    }
  }, [value]);

  return (
    <TextInput
      {...rest}
      style={style}
      value={displayValue}
      onChangeText={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
    />
  );
};

export default AmountInput;
