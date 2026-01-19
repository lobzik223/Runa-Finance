/**
 * Утилиты для форматирования и валидации денежных сумм
 */

// Максимальная сумма: 10 миллиардов рублей
export const MAX_AMOUNT = 10_000_000_000;

/**
 * Обработка ввода суммы с поддержкой копеек и ограничением
 * @param text - введённый текст
 * @returns очищенная и валидированная строка
 */
export const handleAmountInput = (text: string): string => {
  // Убираем все нецифровые символы кроме точки и запятой
  // Также убираем пробелы (разделители тысяч) которые могут быть в отформатированном тексте
  let cleaned = text.replace(/[^\d.,]/g, '').replace(/\s/g, '').replace(',', '.');
  
  // Разрешаем только одну точку для десятичных
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Ограничиваем до 2 знаков после запятой (копейки)
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  // Проверяем максимальную сумму
  const num = parseFloat(cleaned) || 0;
  if (num > MAX_AMOUNT) {
    cleaned = MAX_AMOUNT.toString();
  }
  
  return cleaned;
};

/**
 * Форматирование суммы для отображения (с разделителями тысяч и копейками)
 * Всегда показывает копейки и разделители тысяч для удобства пользователя
 * @param value - строка или число
 * @returns отформатированная строка (например: "1.000,00")
 */
export const formatAmountDisplay = (value: string | number): string => {
  if (!value || value === '0' || value === '') return '0,00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(num) || num === 0) return '0,00';
  
  // Всегда форматируем с разделителями тысяч и копейками
  // Используем русскую локаль: точки для тысяч, запятая для десятичных
  return num.toLocaleString('ru-RU', { 
    minimumFractionDigits: 2,  // Всегда показываем копейки
    maximumFractionDigits: 2,
    useGrouping: true
  });
};

/**
 * Парсинг суммы из строки
 * @param value - строка с суммой
 * @returns число или NaN
 */
export const parseAmount = (value: string): number => {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : NaN;
};

/**
 * Валидация суммы
 * @param amount - сумма для проверки
 * @returns объект с результатом валидации
 */
export const validateAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: 'Введите сумму больше 0' };
  }
  
  if (amount > MAX_AMOUNT) {
    return { 
      valid: false, 
      error: `Максимальная сумма: ${MAX_AMOUNT.toLocaleString('ru-RU')}₽` 
    };
  }
  
  return { valid: true };
};
