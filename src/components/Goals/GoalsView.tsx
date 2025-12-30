import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddGoalView from './AddGoalView';
import EditGoalView from './EditGoalView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GoalsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);

  if (showEditGoal) {
    return (
      <EditGoalView
        onBack={() => setShowEditGoal(false)}
      />
    );
  }

  if (showAddGoal) {
    return (
      <AddGoalView
        onBack={() => setShowAddGoal(false)}
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
        {/* Goal Card */}
        <View style={styles.goalCard}>
          {/* Goal Title */}
          <Text style={styles.goalTitle}>Путешествие в Тайланд</Text>
          
          {/* Goal Details */}
          <View style={styles.goalDetails}>
            <Text style={styles.goalDetailText}>
              <Text style={styles.goalDetailLabel}>Цель: </Text>
              <Text style={styles.goalDetailValue}>200 000₽</Text>
            </Text>
            <Text style={styles.goalDetailText}>
              <Text style={styles.goalDetailLabel}>Накоплено: </Text>
              <Text style={styles.goalDetailValue}>45 000₽</Text>
            </Text>
            <Text style={styles.goalDetailText}>
              <Text style={styles.goalDetailLabel}>Осталось: </Text>
              <Text style={styles.goalDetailValue}>155 000₽</Text>
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBar}>
                <View style={[styles.progressBarFilled, { width: '25%' }]} />
                <View style={styles.progressBarRemaining} />
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelFilled}>25%</Text>
              <Text style={styles.progressLabelRemaining}>75%</Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditGoal(true)}
          >
            <Text style={styles.editButtonText}>Редактировать</Text>
          </TouchableOpacity>
        </View>
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

