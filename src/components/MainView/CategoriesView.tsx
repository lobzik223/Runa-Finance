import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoriesViewProps {
  type: 'income' | 'expense';
  onBack: () => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ type, onBack }) => {
  const insets = useSafeAreaInsets();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const incomeCategories = [
    {
      id: 'salary',
      name: 'Зарплата',
      icon: require('../../../images/icon/zarplata.png'),
      subcategories: [
        { id: 'bonus', name: 'Премии / бонусы' },
        { id: 'main', name: 'Основная зарплата' },
        { id: 'advance', name: 'Аванс' },
      ],
    },
    { id: 'freelance', name: 'Подработка / Фриланс', icon: require('../../../images/icon/freelance.png') },
    { id: 'business', name: 'Бизнес-доход', icon: require('../../../images/icon/biznes.png') },
    { id: 'investment', name: 'Инвестиционные доходы', icon: require('../../../images/icon/dohodinvest.png') },
    { id: 'passive', name: 'Пассивный доход', icon: require('../../../images/icon/pasifdohod.png') },
    { id: 'rent', name: 'Аренда', icon: require('../../../images/icon/arenda.png') },
    { id: 'gifts', name: 'Подарки и переводы', icon: require('../../../images/icon/donate.png') },
    { id: 'social', name: 'Социальные выплаты', icon: require('../../../images/icon/soc.png') },
    { id: 'property', name: 'Продажа имущества', icon: require('../../../images/icon/sale.png') },
    { id: 'other', name: 'Прочие доходы', icon: require('../../../images/icon/procdohod.png') },
  ];

  const expenseCategories = [
    { id: 'groceries', name: 'Продукты', icon: '🛍️' },
    { id: 'cafe', name: 'Кафе и рестораны', icon: '🍴' },
    { id: 'transport', name: 'Транспорт', icon: '🚗' },
    { id: 'housing', name: 'Жильё и коммуналка', icon: '⚡' },
    { id: 'communication', name: 'Связь и подписки', icon: '📞' },
    { id: 'shopping', name: 'Покупки и вещи', icon: '🛒' },
    { id: 'health', name: 'Здоровье', icon: '❤️' },
    { id: 'sport', name: 'Спорт', icon: '🏋️' },
    { id: 'education', name: 'Образование', icon: '📚' },
    { id: 'travel', name: 'Путешествия', icon: '✈️' },
    { id: 'gifts', name: 'Подарки', icon: '🎁' },
    { id: 'home', name: 'Дом и быт', icon: '🏠' },
    { id: 'entertainment', name: 'Развлечения', icon: '🎂' },
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Категории</Text>
        <View style={styles.backButton} />
      </View>

      {/* Categories List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <View key={category.id}>
            <TouchableOpacity
              style={[
                styles.categoryItem,
                'subcategories' in category && expandedCategory === category.id && styles.categoryItemMain,
                'subcategories' in category && expandedCategory === category.id && styles.categoryItemExpanded
              ]}
              onPress={() => {
                if ('subcategories' in category) {
                  toggleCategory(category.id);
                }
              }}
            >
              <View style={styles.categoryLeft}>
                <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
              <Text style={styles.categoryArrow}>→</Text>
            </TouchableOpacity>

            {/* Subcategories */}
            {'subcategories' in category && expandedCategory === category.id && (
              <View style={styles.subcategoriesContainer}>
                {category.subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory.id}
                    style={styles.subcategoryItem}
                  >
                    <Text style={styles.subcategoryText}>{subcategory.name}</Text>
                    <Text style={styles.categoryArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItemMain: {
    backgroundColor: '#D4C5B0',
  },
  categoryItemExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  categoryArrow: {
    fontSize: 20,
    color: '#333333',
    marginLeft: 12,
  },
  subcategoriesContainer: {
    backgroundColor: '#E8E0D4',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 54,
    paddingRight: 18,
    paddingVertical: 12,
  },
  subcategoryText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333333',
    flex: 1,
  },
});

export default CategoriesView;

