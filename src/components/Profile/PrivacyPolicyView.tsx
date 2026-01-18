import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Конфиденциальность</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.policyTitle}>Политика конфиденциальности приложения RUNA</Text>
          <Text style={styles.policyDate}>Дата обновления: 15 января 2026 г.</Text>
          <Text style={styles.policySection}>Владелец приложения: Индивидуальный предприниматель / физическое лицо (ФИО, ИНН — будет добавлено)</Text>

          <Text style={styles.sectionTitle}>1. Общие положения</Text>
          <Text style={styles.paragraph}>
            Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей мобильного приложения RUNA (далее — Приложение).
          </Text>
          <Text style={styles.paragraph}>
            Мы уважаем права пользователей и соблюдаем Федеральный закон РФ №152‑ФЗ «О персональных данных».
          </Text>
          <Text style={styles.paragraph}>
            Используя Приложение, пользователь подтверждает согласие с данной Политикой.
          </Text>

          <Text style={styles.sectionTitle}>2. Какие данные мы собираем</Text>
          <Text style={styles.paragraph}>
            Мы собираем только те данные, которые необходимы для работы Приложения и предоставления его функций.
          </Text>
        
          <Text style={styles.subSectionTitle}>2.1. Данные, предоставляемые пользователем</Text>
          <Text style={styles.listItem}>• имя или никнейм;</Text>
          <Text style={styles.listItem}>• email (при регистрации вручную);</Text>
          <Text style={styles.listItem}>• данные, полученные через авторизацию (Google / Apple ID — если используется);</Text>
          <Text style={styles.listItem}>• данные о статусе подписки;</Text>
          <Text style={styles.listItem}>• финансовая информация, которую пользователь вводит самостоятельно (доходы, расходы, цели, категории).</Text>

          <Text style={styles.subSectionTitle}>2.2. Сообщения и взаимодействие с ИИ</Text>
          <Text style={styles.paragraph}>
            Мы сохраняем и обрабатываем тексты сообщений пользователя, запросы и ответы ИИ. Это необходимо для корректной работы Приложения, улучшения качества рекомендаций и улучшения продукта.
          </Text>

          <Text style={styles.subSectionTitle}>2.3. Технические данные (не персонализированные)</Text>
          <Text style={styles.listItem}>• информация об устройстве (модель, ОС, версия);</Text>
          <Text style={styles.listItem}>• техническая информация о запросах (время, тип события, IP);</Text>
          <Text style={styles.listItem}>• диагностические данные (ошибки/сбои) для улучшения стабильности.</Text>

          <Text style={styles.sectionTitle}>3. Как мы используем собранные данные</Text>
          <Text style={styles.paragraph}>Ваши данные используются исключительно для:</Text>
          <Text style={styles.listItem}>• регистрации и авторизации;</Text>
          <Text style={styles.listItem}>• работы чата с ИИ и финансовой аналитики;</Text>
          <Text style={styles.listItem}>• предоставления функций RUNA Premium;</Text>
          <Text style={styles.listItem}>• улучшения работы Приложения;</Text>
          <Text style={styles.listItem}>• обеспечения безопасности и предотвращения злоупотреблений.</Text>
          <Text style={styles.paragraph}>Мы не продаём персональные данные.</Text>

          <Text style={styles.sectionTitle}>4. Хранение и защита данных</Text>
          <Text style={styles.paragraph}>
            Мы используем современные меры защиты: шифрование, защищённые каналы связи (HTTPS), ограничение доступа и мониторинг подозрительной активности.
          </Text>

          <Text style={styles.sectionTitle}>5. Права пользователя</Text>
          <Text style={styles.listItem}>• получать информацию о своих данных;</Text>
          <Text style={styles.listItem}>• изменять свои данные в профиле;</Text>
          <Text style={styles.listItem}>• удалить аккаунт и данные (по запросу);</Text>
          <Text style={styles.listItem}>• отзывать согласие на обработку данных.</Text>

          <Text style={styles.sectionTitle}>6. Удаление данных</Text>
          <Text style={styles.paragraph}>
            Удаление данных выполняется по запросу пользователя через службу поддержки. После удаления данные уничтожаются без возможности восстановления.
          </Text>

          <Text style={styles.sectionTitle}>7. Контакты</Text>
          <Text style={styles.paragraph}>По вопросам защиты данных: support@runa.app</Text>
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
    height: SCREEN_HEIGHT,
    backgroundColor: '#788FAC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#E8E0D4',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D4981',
    marginBottom: 10,
  },
  policyDate: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 5,
  },
  policySection: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginTop: 25,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
    paddingLeft: 10,
    marginBottom: 5,
  },
});

export default PrivacyPolicyView;
