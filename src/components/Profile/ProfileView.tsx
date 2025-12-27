import React from 'react';
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

interface ProfileViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Avatar - Overlapping both sections */}
      <View style={styles.avatarOverlay}>
        <View style={styles.avatar}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          {/* Name and Status */}
          <Text style={styles.userName}>Вася</Text>
          <Text style={styles.proStatus}>PRO</Text>
          <Text style={styles.userEmail}>vasya@gmail.com</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Выйти</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {/* Premium Subscription */}
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>👑</Text>
              <Text style={styles.optionText}>Подписка RUNA Premium</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          {/* Referral Program */}
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🎁</Text>
              <Text style={styles.optionText}>Реферальная программа</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          {/* Support */}
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🎧</Text>
              <Text style={styles.optionText}>Поддержка</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>📄</Text>
              <Text style={styles.optionText}>Политика конфиденциальности</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]} 
            onPress={() => onNavigate ? onNavigate('main') : onBack?.()}
          >
            <Image 
              source={require('../icon/home.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Главная</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit, styles.navItemCreditDeposits]}
            onPress={() => onNavigate?.('deposits')}
          >
            <Image 
              source={require('../icon/credit.png')} 
              style={[styles.navIconImageCredit, styles.navIconImageCreditPositionDeposits]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPositionDeposits]}>Вклады</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => onNavigate?.('goals')}
          >
            <Image 
              source={require('../icon/analiz.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Цели</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => onNavigate?.('investments')}
          >
            <Image 
              source={require('../icon/invist.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Инвестиции</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemCredit]}>
            <Image 
              source={require('../icon/profile.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelActive, styles.navLabelCreditPosition]}>Профиль</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
    marginTop: 140,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: '#E8E0D4',
  },
  profileCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 20,
    padding: 24,
    paddingTop: 70,
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 20,
    width: SCREEN_WIDTH - 80,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#D4C5B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  proStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#A31F24',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    flex: 1,
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
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  optionArrow: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
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
    color: '#E8E0D4',
  },
});

export default ProfileView;

