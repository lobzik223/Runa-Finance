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
import CreditDetailsView from './CreditDetailsView';
import AddCreditView from './AddCreditView';
import AddDepositView from './AddDepositView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DepositsAndCreditsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const DepositsAndCreditsView: React.FC<DepositsAndCreditsViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'credits' | 'deposits'>('credits');
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [selectedCreditTitle, setSelectedCreditTitle] = useState('Кредит на телефон');

  if (showAddDeposit) {
    return (
      <AddDepositView
        onBack={() => setShowAddDeposit(false)}
      />
    );
  }

  if (showAddCredit) {
    return (
      <AddCreditView
        onBack={() => setShowAddCredit(false)}
      />
    );
  }

  if (showCreditDetails) {
    return (
      <CreditDetailsView
        onBack={() => setShowCreditDetails(false)}
        creditTitle={selectedCreditTitle}
      />
    );
  }

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Tabs */}
      <View style={[styles.tabsContainer, { paddingTop: insets.top + 60 }]}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[
              styles.tab,
              styles.tabLeft,
              activeTab === 'credits' && styles.tabActive
            ]}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={[styles.tabText, activeTab === 'credits' && styles.tabTextActive]}>
              Кредиты
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              styles.tabRight,
              activeTab === 'deposits' && styles.tabActive
            ]}
            onPress={() => setActiveTab('deposits')}
          >
            <Text style={[styles.tabText, activeTab === 'deposits' && styles.tabTextActive]}>
              Вклады
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'credits' ? (
          <>
            {/* Payment Notification Card */}
            <View style={styles.notificationCard}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationDate}>Завтра 30 ноября</Text>
                <Text style={styles.notificationLabel}>По плану финансовое действие:</Text>
                <Text style={styles.notificationAmount}>Платёж по кредиту 3 400Р</Text>
                <Text style={styles.notificationSubtext}>Не пропусти. Дисциплина = свобода</Text>
              </View>
            </View>

            {/* Add Credit Button */}
            <TouchableOpacity 
              style={styles.addCreditButton}
              onPress={() => setShowAddCredit(true)}
            >
              <Text style={styles.addCreditButtonText}>Добавить кредит</Text>
            </TouchableOpacity>

            {/* Credits Section */}
            <Text style={styles.sectionTitle}>Кредиты</Text>
            
            <View style={styles.creditCard}>
              <Text style={styles.creditCardTitle}>Кредит на телефон</Text>
              <Text style={styles.creditCardAmount}>50 000Р</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '24%' }]} />
              </View>
              
              <View style={styles.creditCardInfo}>
                <View style={styles.creditCardInfoLeft}>
                  <Text style={styles.creditCardInfoLabel}>Следующий платеж:</Text>
                  <Text style={styles.creditCardInfoValue}>3400Р</Text>
                </View>
                <View style={styles.creditCardInfoRight}>
                  <Text style={styles.creditCardInfoLabel}>Остаток:</Text>
                  <Text style={styles.creditCardInfoValue}>38000Р</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => {
                  setSelectedCreditTitle('Кредит на телефон');
                  setShowCreditDetails(true);
                }}
              >
                <Text style={styles.detailsButtonText}>Детали</Text>
              </TouchableOpacity>
            </View>

            {/* Credit Cards Section */}
            <Text style={styles.sectionTitle}>Кредитные карты</Text>
            
            <View style={styles.creditCard}>
              <Text style={styles.creditCardTitle}>Кредитная карта Сбербанк</Text>
              <Text style={styles.creditCardAmount}>50 000Р</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '24%' }]} />
              </View>
              
              <View style={styles.creditCardInfo}>
                <View style={styles.creditCardInfoLeft}>
                  <Text style={styles.creditCardInfoLabel}>Следующий платеж:</Text>
                  <Text style={styles.creditCardInfoValue}>3400Р</Text>
                </View>
                <View style={styles.creditCardInfoRight}>
                  <Text style={styles.creditCardInfoLabel}>Остаток:</Text>
                  <Text style={styles.creditCardInfoValue}>38000Р</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => {
                  setSelectedCreditTitle('Кредитная карта Сбербанк');
                  setShowCreditDetails(true);
                }}
              >
                <Text style={styles.detailsButtonText}>Детали</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Payment Notification Card for Deposits */}
            <View style={styles.notificationCard}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationDate}>Завтра 30 ноября</Text>
                <Text style={styles.notificationLabel}>По плану финансовое действие:</Text>
                <Text style={styles.notificationAmount}>Проценты по вкладу 5000Р</Text>
              </View>
            </View>

            {/* Add Deposit Button */}
            <TouchableOpacity 
              style={styles.addCreditButton}
              onPress={() => setShowAddDeposit(true)}
            >
              <Text style={styles.addCreditButtonText}>Добавить вклад</Text>
            </TouchableOpacity>

            {/* Deposit Card */}
            <View style={styles.creditCard}>
              <Text style={styles.creditCardTitle}>Вклад "Накопительный"</Text>
              <Text style={styles.creditCardAmount}>200 000 Р</Text>
              
              <View style={styles.depositInfo}>
                <Text style={styles.depositInfoLabel}>Начисление процентов:</Text>
                <Text style={styles.depositInfoValue}>15 марта</Text>
              </View>
              
              <View style={styles.depositInfo}>
                <Text style={styles.depositInfoLabel}>Ожидаемый доход:</Text>
                <Text style={styles.depositInfoValue}>1190 Р</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => {
                  setSelectedCreditTitle('Вклад "Накопительный"');
                  setShowCreditDetails(true);
                }}
              >
                <Text style={styles.detailsButtonText}>Детали</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation - Island Style */}
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
          <TouchableOpacity style={[styles.navItem, styles.navItemCredit, styles.navItemCreditDeposits]}>
            <Image 
              source={require('../icon/credit.png')} 
              style={[styles.navIconImageCredit, styles.navIconImageCreditPositionDeposits]}
            />
            <Text style={[styles.navLabel, styles.navLabelActive, styles.navLabelCreditPositionDeposits]}>Вклады</Text>
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
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => onNavigate?.('profile')}
          >
            <Image 
              source={require('../icon/profile.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Профиль</Text>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 1,
  },
  tabsWrapper: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#E8E0D4',
  },
  tabLeft: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  tabRight: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabActive: {
    backgroundColor: '#1D4981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4981',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  notificationLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  notificationAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  notificationSubtext: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  addCreditButton: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addCreditButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 8,
  },
  creditCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  creditCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  creditCardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#D4C5B0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A0522D',
    borderRadius: 4,
  },
  creditCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  creditCardInfoLeft: {
    flex: 1,
  },
  creditCardInfoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  creditCardInfoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  creditCardInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  depositInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  depositInfoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  depositInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  detailsButton: {
    backgroundColor: '#1D4981',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsButtonText: {
    fontSize: 14,
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
    borderTopWidth: 0,
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

export default DepositsAndCreditsView;

