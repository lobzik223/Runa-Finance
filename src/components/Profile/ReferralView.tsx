import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { apiService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReferralViewProps {
  onBack: () => void;
}

const ReferralView: React.FC<ReferralViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [promoCode, setPromoCode] = useState<string>('—');

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const token = await apiService.getToken();
        if (!token) return;
        const me = await apiService.getMe();
        if (alive) setPromoCode(me.referralCode || '—');
      } catch {
        if (alive) setPromoCode('—');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!promoCode || promoCode === '—') {
      toast.warning('Промокод пока не доступен. Попробуй позже.');
      return;
    }
    try {
      await Clipboard.setStringAsync(promoCode);
      toast.success('Промокод скопирован в буфер обмена!');
    } catch (error) {
      toast.error('Не удалось скопировать промокод');
    }
  };

  const handleSend = async () => {
    if (!promoCode || promoCode === '—') {
      toast.warning('Промокод пока не доступен. Попробуй позже.');
      return;
    }
    await Share.share({ message: `Мой промокод RUNA: ${promoCode}` });
  };

  const handleShare = async () => {
    if (!promoCode || promoCode === '—') {
      toast.warning('Промокод пока не доступен. Попробуй позже.');
      return;
    }
    await Share.share({ title: 'RUNA', message: `Присоединяйся к RUNA! Мой промокод: ${promoCode}` });
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 200 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo Code Card */}
        <View style={styles.promoCard}>
          <Text style={styles.promoCode} selectable>
            {promoCode}
          </Text>
          <Text style={styles.promoHint}>Нажми и удерживай промокод, чтобы скопировать</Text>
        </View>

        {/* Copy Button below promo code */}
        <TouchableOpacity 
          style={[styles.copyButton, styles.actionBtnSoft]} 
          onPress={handleCopy}
        >
          <Text style={[styles.copyButtonText, styles.actionTextDark]}>Скопировать</Text>
        </TouchableOpacity>

        <Text style={styles.promoDescription}>
          Вы и ваш друг получаете 7 дней RUNA Premium, если он введёт ваш промокод при регистрации.
          Если промокод не указан — 3 дня триала по умолчанию.
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

      {/* Bottom actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleSend}>
          <Text style={styles.actionText}>Отправить</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimaryDark]} onPress={handleShare}>
          <Text style={styles.actionText}>Поделиться</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  copyButton: {
    width: '100%',
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FDEBD0',
    borderWidth: 2,
    borderColor: '#FDEBD0',
    shadowColor: '#FDEBD0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  promoCode: {
    fontSize: 36,
    fontWeight: '500',
    color: '#A0522D',
    marginBottom: 10,
    letterSpacing: 2,
  },
  promoHint: {
    fontSize: 13,
    color: '#6B7A9A',
    textAlign: 'center',
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  actionBtn: {
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnSoft: {
    backgroundColor: '#FDEBD0',
    borderColor: '#FDEBD0',
    shadowColor: '#FDEBD0',
  },
  actionBtnPrimary: {
    backgroundColor: '#D4A373',
    borderColor: '#D4A373',
    shadowColor: '#D4A373',
  },
  actionBtnPrimaryDark: {
    backgroundColor: '#1D4981',
    borderColor: '#1D4981',
    shadowColor: '#1D4981',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionTextDark: {
    color: '#1A1A1A',
  },
});

export default ReferralView;

