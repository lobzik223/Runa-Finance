import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReferralView from './ReferralView';
import PremiumView from './PremiumView';
import PrivacyPolicyView from './PrivacyPolicyView';
import { apiService, type User } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onNavigate, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [showReferral, setShowReferral] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUser = async (alive: boolean) => {
    const cached = await apiService.getUser();
    if (alive) {
      setUser(cached);
      if (cached) setNewName(cached.name);
    }
    // Refresh from backend if possible
    try {
      const token = await apiService.getToken();
      if (!token) return;
      const me = await apiService.getMe();
      await apiService.saveUser(me.user);
      if (alive) {
        setUser(me.user);
        setNewName(me.user.name);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let alive = true;
    void fetchUser(alive);
    return () => {
      alive = false;
    };
  }, []);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }
    if (newName.trim().length > 15) {
      Alert.alert('Ошибка', 'Имя должно быть не длиннее 15 символов');
      return;
    }
    if (newName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setSaving(true);
    try {
      const res = await apiService.updateProfile({ name: newName.trim() });
      await apiService.saveUser(res.user);
      setUser(res.user);
      setNewName(res.user.name);
      setIsEditingName(false);
      Alert.alert('Успех', 'Имя обновлено');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось обновить имя');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditName = () => {
    setNewName(user?.name || '');
    setIsEditingName(false);
  };

  if (showReferral) {
    return <ReferralView onBack={() => setShowReferral(false)} />;
  }

  if (showPremium) {
    return <PremiumView onBack={() => setShowPremium(false)} />;
  }

  if (showPrivacy) {
    return <PrivacyPolicyView onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Профиль</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card with Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            {/* Avatar centered on the top border */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Image 
                  source={require('../icon/chatlogo.png')}
                  style={styles.avatarImage}
                />
              </View>
            </View>

            <View style={styles.userInfo}>
              {isEditingName ? (
                <TextInput
                  style={styles.userNameInput}
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                  maxLength={15}
                  placeholder="Новое имя"
                  editable={!saving}
                />
              ) : (
                <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
              )}
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>

            <View style={styles.actionButtonsContainer}>
              {isEditingName ? (
                <>
                  <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: '#6B7A9A' }]}
                    onPress={handleCancelEditName}
                    disabled={saving}
                  >
                    <Text style={styles.logoutButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, { backgroundColor: '#4CAF50' }]} 
                    onPress={handleUpdateName}
                    disabled={saving}
                  >
                    <Text style={styles.editButtonText}>{saving ? '...' : 'Сохранить'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    disabled={saving}
                    onPress={() => {
                      void (async () => {
                        await apiService.clearAuth();
                        onLogout?.();
                      })();
                    }}
                  >
                    <Text style={styles.logoutButtonText}>Выйти</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => setIsEditingName(true)}
                  >
                    <Text style={styles.editButtonText}>Редактировать</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setShowPremium(true)}
          >
            <View style={styles.optionLeft}>
              <Image source={require('../icon/home.png')} style={styles.smallIcon} tintColor="#333" />
              <Text style={styles.optionText}>Подписка RUNA Premium</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setShowReferral(true)}
          >
            <View style={styles.optionLeft}>
              <Image source={require('../icon/home.png')} style={styles.smallIcon} tintColor="#333" />
              <Text style={styles.optionText}>Реферальная программа</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Image source={require('../icon/home.png')} style={styles.smallIcon} tintColor="#333" />
              <Text style={styles.optionText}>Поддержка</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => setShowPrivacy(true)}
          >
            <View style={styles.optionLeft}>
              <Image source={require('../icon/home.png')} style={styles.smallIcon} tintColor="#333" />
              <Text style={styles.optionText}>Политика конфиденциальности</Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 80, // Даем место для аватара
  },
  profileSection: {
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarContainer: {
    position: 'absolute',
    top: -55, // Выносим ровно на половину (высота 110 / 2)
    alignSelf: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1D4981',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userNameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1D4981',
    paddingHorizontal: 10,
    textAlign: 'center',
    minWidth: 150,
  },
  proStatus: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#800000',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#1D4981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDEBD0',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  optionArrow: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '400',
  },
});

export default ProfileView;
