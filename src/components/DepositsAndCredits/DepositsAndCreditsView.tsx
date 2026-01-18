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
import CreditDetailsView from './CreditDetailsView';
import AddCreditView from './AddCreditView';
import AddDepositView from './AddDepositView';
import { apiService, type CreditAccount, type DepositAccount } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DepositsAndCreditsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
  initialTab?: 'credits' | 'deposits';
}

const DepositsAndCreditsView: React.FC<DepositsAndCreditsViewProps> = ({ onBack, onNavigate, initialTab = 'credits' }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'credits' | 'deposits'>(initialTab);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [selectedCreditTitle, setSelectedCreditTitle] = useState('Кредит на телефон');
  const [selectedDetailsMode, setSelectedDetailsMode] = useState<'credit' | 'deposit'>('credit');
  const [loading, setLoading] = useState(false);
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([]);
  const [depositAccounts, setDepositAccounts] = useState<DepositAccount[]>([]);

  const reload = async () => {
    setLoading(true);
    try {
      const [credits, deposits] = await Promise.all([
        apiService.listCreditAccounts(),
        apiService.listDepositAccounts(),
      ]);
      setCreditAccounts(credits);
      setDepositAccounts(deposits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const creditCards = useMemo(() => creditAccounts.filter((a) => a.kind === 'CREDIT_CARD'), [creditAccounts]);
  const loans = useMemo(() => creditAccounts.filter((a) => a.kind === 'LOAN'), [creditAccounts]);

  if (showAddDeposit) {
    return (
      <AddDepositView
        onBack={async () => {
          setShowAddDeposit(false);
          await reload();
        }}
      />
    );
  }

  if (showAddCredit) {
    return (
      <AddCreditView
        onBack={async () => {
          setShowAddCredit(false);
          await reload();
        }}
      />
    );
  }

  if (showCreditDetails) {
    return (
      <CreditDetailsView
        onBack={() => setShowCreditDetails(false)}
        creditTitle={selectedCreditTitle}
        mode={selectedDetailsMode}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Tabs */}
      <View style={[styles.tabsContainer, { paddingTop: insets.top + 20 }]}>
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'credits' ? (
          <>
            {/* Payment Notification Card (placeholder until scheduled-events UI is wired) */}
            <View style={styles.notificationCard}>
              <Image
                source={require('../../../images/Attache2d_image.png')}
                style={styles.notificationIconImage}
                resizeMode="contain"
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationDate}>Ближайшие события</Text>
                <Text style={styles.notificationLabel}>Пуш-уведомления появятся, когда добавишь кредит/вклад</Text>
                <Text style={styles.notificationSubtext}>Дисциплина = свобода</Text>
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

            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator />
              </View>
            ) : loans.length === 0 ? (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', opacity: 0.9, fontWeight: '600' }}>
                  Пока нет кредитов — добавь первый.
                </Text>
              </View>
            ) : (
              loans.map((loan) => (
                <View key={loan.id} style={styles.creditCard}>
                  <Text style={styles.creditCardTitle}>{loan.name}</Text>
                  <Text style={styles.creditCardAmount}>{Number(loan.currentBalance || 0).toLocaleString('ru-RU')}₽</Text>

                  <View style={styles.creditCardInfo}>
                    <View style={styles.creditCardInfoLeft}>
                      <Text style={styles.creditCardInfoLabel}>Ставка:</Text>
                      <Text style={styles.creditCardInfoValue}>{loan.interestRate ? `${loan.interestRate}%` : '—'}</Text>
                    </View>
                    <View style={styles.creditCardInfoRight}>
                      <Text style={styles.creditCardInfoLabel}>Платёж:</Text>
                      <Text style={styles.creditCardInfoValue}>
                        {loan.minimumPayment ? `${Number(loan.minimumPayment).toLocaleString('ru-RU')}₽` : '—'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => {
                      setSelectedCreditTitle(loan.name);
                      setSelectedDetailsMode('credit');
                      setShowCreditDetails(true);
                    }}
                  >
                    <Text style={styles.detailsButtonText}>Детали</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Credit Cards Section */}
            <Text style={styles.sectionTitle}>Кредитные карты</Text>

            {loading ? null : creditCards.length === 0 ? (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', opacity: 0.9, fontWeight: '600' }}>
                  Пока нет кредитных карт — добавь карту, чтобы работала синхронизация лимита.
                </Text>
              </View>
            ) : (
              creditCards.map((card) => {
                const limit = Number(card.creditLimit || 0);
                const debt = Number(card.currentBalance || 0);
                const available = Math.max(0, limit - debt);
                const pct = limit > 0 ? Math.min(100, Math.round((debt / limit) * 100)) : 0;
                return (
                  <View key={card.id} style={styles.creditCard}>
                    <Text style={styles.creditCardTitle}>{card.name}</Text>
                    <Text style={styles.creditCardAmount}>{available.toLocaleString('ru-RU')}₽ доступно</Text>

                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${pct}%` }]} />
                    </View>

                    <View style={styles.creditCardInfo}>
                      <View style={styles.creditCardInfoLeft}>
                        <Text style={styles.creditCardInfoLabel}>Долг:</Text>
                        <Text style={styles.creditCardInfoValue}>{debt.toLocaleString('ru-RU')}₽</Text>
                      </View>
                      <View style={styles.creditCardInfoRight}>
                        <Text style={styles.creditCardInfoLabel}>Лимит:</Text>
                        <Text style={styles.creditCardInfoValue}>{limit.toLocaleString('ru-RU')}₽</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => {
                        setSelectedCreditTitle(card.name);
                        setSelectedDetailsMode('credit');
                        setShowCreditDetails(true);
                      }}
                    >
                      <Text style={styles.detailsButtonText}>Детали</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Payment Notification Card for Deposits (placeholder) */}
            <View style={styles.notificationCard}>
              <Image
                source={require('../../../images/Attache2d_image.png')}
                style={styles.notificationIconImage}
                resizeMode="contain"
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationDate}>Ближайшие события</Text>
                <Text style={styles.notificationLabel}>Пуш-уведомления появятся после добавления вкладов</Text>
              </View>
            </View>

            {/* Add Deposit Button */}
            <TouchableOpacity 
              style={styles.addCreditButton}
              onPress={() => setShowAddDeposit(true)}
            >
              <Text style={styles.addCreditButtonText}>Добавить вклад</Text>
            </TouchableOpacity>

            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator />
              </View>
            ) : depositAccounts.length === 0 ? (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: '#FFFFFF', opacity: 0.9, fontWeight: '600' }}>
                  Пока нет вкладов — добавь первый.
                </Text>
              </View>
            ) : (
              depositAccounts.map((dep) => (
                <View key={dep.id} style={styles.creditCard}>
                  <Text style={styles.creditCardTitle}>{dep.name}</Text>
                  <Text style={styles.creditCardAmount}>{Number(dep.principal || 0).toLocaleString('ru-RU')}₽</Text>

                  <View style={styles.depositInfo}>
                    <Text style={styles.depositInfoLabel}>Ставка:</Text>
                    <Text style={styles.depositInfoValue}>{dep.interestRate}%</Text>
                  </View>

                  <View style={styles.depositInfo}>
                    <Text style={styles.depositInfoLabel}>След. начисление:</Text>
                    <Text style={styles.depositInfoValue}>{dep.nextPayoutAt ? new Date(dep.nextPayoutAt).toLocaleDateString('ru-RU') : '—'}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => {
                      setSelectedCreditTitle(dep.name);
                      setSelectedDetailsMode('deposit');
                      setShowCreditDetails(true);
                    }}
                  >
                    <Text style={styles.detailsButtonText}>Детали</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
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
    backgroundColor: '#FDEBD0',
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  tabLeft: {
    // Больше не нужны отдельные радиусы, используем общий
  },
  tabRight: {
    // Больше не нужны отдельные радиусы, используем общий
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  notificationIconImage: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4981',
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

