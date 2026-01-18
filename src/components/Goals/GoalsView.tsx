import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddGoalView from './AddGoalView';
import EditGoalView from './EditGoalView';
import { apiService, type Goal } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GoalsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [displayMode, setDisplayMode] = useState<'percent' | 'rubles'>('percent');

  const reload = async () => {
    setLoading(true);
    try {
      const res = await apiService.listGoals();
      setGoals(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'ACTIVE'), [goals]);

  if (showEditGoal) {
    return (
      <EditGoalView
        goal={selectedGoal}
        onBack={async (updated) => {
          setShowEditGoal(false);
          setSelectedGoal(null);
          if (updated) await reload();
        }}
      />
    );
  }

  if (showAddGoal) {
    return (
      <AddGoalView
        onBack={async (created) => {
          setShowAddGoal(false);
          if (created) await reload();
        }}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Цели</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddGoal(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={[styles.content, { paddingTop: 24, paddingBottom: insets.bottom + 100 }]}>
        {/* Display Mode Toggle */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={[styles.editButton, { flex: 1, backgroundColor: displayMode === 'percent' ? '#1D4981' : '#D4C5B0' }]}
            onPress={() => setDisplayMode('percent')}
          >
            <Text style={[styles.editButtonText, { color: displayMode === 'percent' ? '#FFFFFF' : '#333333' }]}>
              Проценты
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, { flex: 1, backgroundColor: displayMode === 'rubles' ? '#1D4981' : '#D4C5B0' }]}
            onPress={() => setDisplayMode('rubles')}
          >
            <Text style={[styles.editButtonText, { color: displayMode === 'rubles' ? '#FFFFFF' : '#333333' }]}>
              Рубли
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingTop: 30, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : activeGoals.length === 0 ? (
          <View style={{ paddingTop: 20 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', opacity: 0.9 }}>
              Пока нет целей — нажми «+», чтобы создать первую.
            </Text>
          </View>
        ) : (
          activeGoals.map((g) => {
            const pct = Math.round(g.progressPercent);
            return (
              <View key={g.id} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{g.name}</Text>

                <View style={styles.goalDetails}>
                  <Text style={styles.goalDetailText}>
                    <Text style={styles.goalDetailLabel}>Цель: </Text>
                    <Text style={styles.goalDetailValue}>{g.targetAmount.toLocaleString('ru-RU')}₽</Text>
                  </Text>
                  <Text style={styles.goalDetailText}>
                    <Text style={styles.goalDetailLabel}>Накоплено: </Text>
                    <Text style={styles.goalDetailValue}>{g.currentAmount.toLocaleString('ru-RU')}₽</Text>
                  </Text>
                  <Text style={styles.goalDetailText}>
                    <Text style={styles.goalDetailLabel}>Осталось: </Text>
                    <Text style={styles.goalDetailValue}>{g.remainingAmount.toLocaleString('ru-RU')}₽</Text>
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressBarFilled, { width: `${pct}%` }]} />
                      <View style={styles.progressBarRemaining} />
                    </View>
                  </View>
                  {displayMode === 'percent' ? (
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabelFilled}>{pct}%</Text>
                      <Text style={styles.progressLabelRemaining}>{Math.max(0, 100 - pct)}%</Text>
                    </View>
                  ) : (
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabelFilled}>{g.currentAmount.toLocaleString('ru-RU')}₽</Text>
                      <Text style={styles.progressLabelRemaining}>{g.remainingAmount.toLocaleString('ru-RU')}₽</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setSelectedGoal(g);
                    setShowEditGoal(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Управление</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1D4981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  goalCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A0522D',
    marginBottom: 20,
  },
  goalDetails: {
    marginBottom: 20,
  },
  goalDetailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  goalDetailLabel: {
    color: '#333333',
    fontWeight: '500',
  },
  goalDetailValue: {
    color: '#1D4981',
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarWrapper: {
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#D4C5B0',
  },
  progressBarFilled: {
    backgroundColor: '#8B6F47',
    height: '100%',
  },
  progressBarRemaining: {
    flex: 1,
    backgroundColor: '#D4C5B0',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelFilled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0522D',
  },
  progressLabelRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  editButton: {
    backgroundColor: '#1D4981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1D4981',
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navIconCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCredit: {
    width: 36,
    height: 36,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImageCreditPositionDeposits: {
    marginTop: -4,
    marginBottom: 0,
  },
  navItemCredit: {
    paddingTop: 2,
  },
  navItemCreditDeposits: {
    paddingTop: 0,
  },
  navLabelCreditPosition: {
    marginTop: -2,
  },
  navLabelCreditPositionDeposits: {
    marginTop: 0,
  },
  navLabel: {
    fontSize: SCREEN_WIDTH < 375 ? 9 : 11,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
  },
  navLabelActive: {
    opacity: 1,
    fontWeight: '600',
  },
});

export default GoalsView;

