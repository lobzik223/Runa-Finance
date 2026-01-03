import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReferralViewProps {
  onBack: () => void;
}

const ReferralView: React.FC<ReferralViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const promoCode = 'RUNA7VK4';
  const [inviteUsed, setInviteUsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const v = await AsyncStorage.getItem('referral_invite_used');
        setInviteUsed(v === 'true');
      } catch {
        // ignore
      }
    };
    void load();
  }, []);

  const markInviteUsed = async () => {
    try {
      await AsyncStorage.setItem('referral_invite_used', 'true');
    } catch {
      // ignore
    }
    setInviteUsed(true);
  };

  const handleCopy = async () => {
    if (inviteUsed) {
      Alert.alert('Рефералка', 'Вы уже приглашали друга. Бонус выдаётся только один раз.');
      return;
    }

    // В демо-проекте без буфера обмена: предлагаем поделиться кодом,
    // и помечаем приглашение как использованное.
    await Share.share({ message: `Мой промокод: ${promoCode}` });
    await markInviteUsed();
    Alert.alert('Готово', 'Промокод отправлен. Бонус можно получить только один раз.');
  };

  const handleShare = async () => {
    if (inviteUsed) {
      Alert.alert('Рефералка', 'Вы уже приглашали друга. Бонус выдаётся только один раз.');
      return;
    }

    await Share.share({ message: `Мой промокод: ${promoCode}` });
    await markInviteUsed();
    Alert.alert('Готово', 'Промокод отправлен. Бонус можно получить только один раз.');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Приглашайте друзей и получайте бонусы!</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo Code Card */}
        <View style={styles.promoCard}>
          <Text style={styles.promoCode}>{promoCode}</Text>
          <View style={styles.promoButtons}>
            <TouchableOpacity style={[styles.copyButton, inviteUsed && styles.buttonDisabled]} onPress={handleCopy}>
              <Text style={styles.buttonText}>{inviteUsed ? 'Уже использовано' : 'Скопировать код'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, inviteUsed && styles.buttonDisabled]} onPress={handleShare}>
              <Text style={styles.buttonText}>{inviteUsed ? 'Уже использовано' : 'Поделиться'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.promoDescription}>
          Вы и ваш друг получите 7 дней RUNA Premium один раз — при первом приглашении и первой активации.
        </Text>

        {/* How it works Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Как работает бонус</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Вы и ваш друг получаете 7 дней бесплатного RUNA Premium, если он введёт ваш промокод при регистрации.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Бонус по приглашению можно получить только один раз (и пригласившему, и приглашённому).
            </Text>
          </View>
        </View>

        {/* What user gets Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Что получает пользователь</Text>
          <Text style={styles.subInfoText}>Один раз:</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>+7 дней Premium пользователю</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>+7 дней Premium приглашённому другу</Text>
          </View>
          <Text style={styles.exampleTitle}>Пример:</Text>
          <Text style={styles.exampleText}>
            Пригласили 1 друга → получили 7 дней Premium бесплатно.
          </Text>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: '#1D4981',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1D4981',
    textAlign: 'center',
    paddingRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  promoCard: {
    backgroundColor: '#FDEBD0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  promoCode: {
    fontSize: 36,
    fontWeight: '500',
    color: '#A0522D',
    marginBottom: 20,
    letterSpacing: 2,
  },
  promoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#D4A373',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#1D4981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  promoDescription: {
    fontSize: 15,
    color: '#1D4981',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  infoCard: {
    backgroundColor: '#FDEBD0',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A0522D',
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 18,
    color: '#000',
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  subInfoText: {
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 10,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
});

export default ReferralView;

