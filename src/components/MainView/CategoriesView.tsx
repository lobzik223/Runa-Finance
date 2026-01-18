import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, type BackendTransactionType, type Category } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoriesViewProps {
  type: 'income' | 'expense';
  onBack: () => void;
  onSelect?: (category: { id: number; name: string }) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ type, onBack, onSelect }) => {
  const insets = useSafeAreaInsets();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const iconByKey: Record<string, any> = useMemo(
    () => ({
      salary: require('../../../images/icon/zarplata.png'),
      freelance: require('../../../images/icon/freelance.png'),
      biznes: require('../../../images/icon/biznes.png'),
      dohodinvest: require('../../../images/icon/dohodinvest.png'),
      pasifdohod: require('../../../images/icon/pasifdohod.png'),
      arenda: require('../../../images/icon/arenda.png'),
      hediye: require('../../../images/icon/hediye.png'),
      soc: require('../../../images/icon/soc.png'),
      sale: require('../../../images/icon/sale.png'),
      procdohod: require('../../../images/icon/procdohod.png'),

      produckt: require('../../../images/icon/produckt.png'),
      'cafe-restoraunt': require('../../../images/icon/cafe-restoraunt.png'),
      car: require('../../../images/icon/car.png'),
      komunalka: require('../../../images/icon/komunalka.png'),
      subb: require('../../../images/icon/subb.png'),
      pokup: require('../../../images/icon/pokup.png'),
      healt: require('../../../images/icon/healt.png'),
      sport: require('../../../images/icon/sport.png'),
      book: require('../../../images/icon/book.png'),
      airplane: require('../../../images/icon/airplane.png'),
      donate: require('../../../images/icon/donate.png'),
      homee: require('../../../images/icon/homee.png'),
      razvlich: require('../../../images/icon/razvlich.png'),
      other_expense: require('../../../images/icon/homee.png'),
    }),
    [],
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void (async () => {
      const apiType: BackendTransactionType = type === 'income' ? 'INCOME' : 'EXPENSE';
      try {
        const res = await apiService.listCategories({ type: apiType });
        if (alive) setCategories(res);
      } catch {
        if (alive) setCategories([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [type]);

  const mainCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  const getSubcategories = (parentId: number) => categories.filter(c => c.parentId === parentId);

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
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : mainCategories.length === 0 ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Категории не найдены</Text>
          </View>
        ) : (
          mainCategories.map((category) => {
            const isExpanded = expandedCategory === String(category.id);
            const subs = getSubcategories(category.id);

            return (
              <View key={category.id}>
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    isExpanded && styles.categoryItemMain,
                    isExpanded && subs.length > 0 && styles.categoryItemExpanded
                  ]}
                  onPress={() => {
                    if (subs.length > 0) {
                      setExpandedCategory(isExpanded ? null : String(category.id));
                    } else {
                      onSelect?.({ id: category.id, name: category.name });
                      onBack();
                    }
                  }}
                >
                  <View style={styles.categoryLeft}>
                    <Image
                      source={(category.iconKey && iconByKey[category.iconKey]) || require('../../../images/icon/homee.png')}
                      style={styles.categoryIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </View>
                  <Text style={[styles.categoryArrow, isExpanded && { transform: [{ rotate: '90deg' }] }]}>→</Text>
                </TouchableOpacity>

                {isExpanded && subs.length > 0 && (
                  <View style={styles.subcategoriesContainer}>
                    {subs.map((sub) => (
                      <TouchableOpacity
                        key={sub.id}
                        style={styles.subcategoryItem}
                        onPress={() => {
                          onSelect?.({ id: sub.id, name: sub.name });
                          onBack();
                        }}
                      >
                        <Text style={styles.subcategoryText}>{sub.name}</Text>
                        <Text style={styles.categoryArrow}>→</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })
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

