import React, { useMemo, useState, useEffect } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { formatAmountDisplay, handleAmountInput } from '../../utils/amountFormatter';

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
  const formattedValue = useMemo(
    () => formatAmountDisplay(value || '0'),
    [value],
  );

  const [selection, setSelection] = useState({
    start: formattedValue.length,
    end: formattedValue.length,
  });

  useEffect(() => {
    setSelection({
      start: formattedValue.length,
      end: formattedValue.length,
    });
  }, [formattedValue]);

  const handleChange = (text: string) => {
    const cleaned = handleAmountInput(text);
    onValueChange(cleaned);
  };

  return (
    <TextInput
      {...rest}
      style={style}
      value={formattedValue}
      onChangeText={handleChange}
      selection={selection}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
    />
  );
};

export default AmountInput;
