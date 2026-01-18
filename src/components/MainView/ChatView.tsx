import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { apiService, type AiChatResponse } from '../../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'runa' | 'user';
  senderName: string;
  chartData?: AiChatResponse['chartData'];
}

interface ChatViewProps {
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState('Пользователь');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Чем я могу тебе помощь? Хочешь могу проанализировать твои расходы?',
      sender: 'runa',
      senderName: 'Runa',
    },
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', scrollToBottom);
    return () => {
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const token = await apiService.getToken();
        if (!token) return;
        const me = await apiService.getMe();
        if (alive) setUserName(me.user?.name || 'Пользователь');
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const colors = useMemo(
    () => ['#1D4981', '#A0522D', '#4CAF50', '#E53935', '#9C27B0', '#FF9800', '#009688', '#795548'],
    [],
  );

  const Donut: React.FC<{ title: string; total: number; items: Array<{ name: string; value: number }> }> = ({ title, total, items }) => {
    const size = 140;
    const stroke = 18;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    let acc = 0;

    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontWeight: '700', color: '#333333', marginBottom: 6 }}>{title}</Text>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E8E0D4" strokeWidth={stroke} fill="none" />
            {items
              .filter((x) => x.value > 0)
              .map((x, idx) => {
                const frac = total > 0 ? x.value / total : 0;
                const len = c * frac;
                const dashArray = `${len} ${c - len}`;
                const dashOffset = -c * acc;
                acc += frac;
                return (
                  <Circle
                    key={`${x.name}-${idx}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                  />
                );
              })}
          </G>
        </Svg>
        <Text style={{ marginTop: 6, color: '#333333', fontWeight: '700' }}>{Math.round(total).toLocaleString('ru-RU')} ₽</Text>
      </View>
    );
  };

  const handleSend = () => {
    if (message.trim()) {
      const userText = message.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: userText,
        sender: 'user',
        senderName: userName,
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      void (async () => {
        setSending(true);
        try {
          const res = await apiService.sendAiMessage({ message: userText, threadId });
          setThreadId(res.threadId);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${res.messageId}`,
              text: res.message,
              sender: 'runa',
              senderName: 'Runa',
              chartData: res.chartData,
            },
          ]);
        } catch (e: any) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-err-${Date.now()}`,
              text: e?.message || 'Не удалось получить ответ от ИИ',
              sender: 'runa',
              senderName: 'Runa',
            },
          ]);
        } finally {
          setSending(false);
        }
      })();
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
        <Text style={styles.headerTitle}>Чат с ИИ</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.messagesContainer, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'user' ? styles.messageWrapperRight : styles.messageWrapperLeft,
              ]}
            >
              {msg.sender === 'runa' && (
                <View style={styles.avatarLeft}>
                  <Image source={require('../../../images/runalogo2.png')} style={styles.avatarImage} />
                </View>
              )}
              
              <View style={styles.messageContent}>
                <Text style={[styles.senderName, msg.sender === 'user' ? styles.senderNameRight : styles.senderNameLeft]}>
                  {msg.senderName}
                </Text>
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.messageBubbleRight : styles.messageBubbleLeft,
                  ]}
                >
                  <Text style={[styles.messageText, msg.sender === 'user' ? styles.messageTextRight : styles.messageTextLeft]}>
                    {msg.text}
                  </Text>

                  {msg.sender === 'runa' && msg.chartData?.chartType === 'donut' && (
                    <View style={{ marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, minWidth: SCREEN_WIDTH * 0.7 }}>
                      <Text style={{ fontWeight: '800', color: '#1D4981', marginBottom: 10 }}>
                        График доходов и расходов
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <Donut title="Доходы" total={msg.chartData.incomeTotal} items={msg.chartData.incomeByCategory} />
                        <Donut title="Расходы" total={msg.chartData.expenseTotal} items={msg.chartData.expenseByCategory} />
                      </View>
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: '700', color: '#333333', marginBottom: 6 }}>Топ расходов</Text>
                        {msg.chartData.expenseByCategory.slice(0, 4).map((x, idx) => (
                          <View key={`${x.name}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[idx % colors.length], marginRight: 6 }} />
                            <Text style={{ color: '#333333', fontSize: 12, flex: 1 }}>{x.name}</Text>
                            <Text style={{ color: '#333333', fontSize: 12, fontWeight: '600' }}>{Math.round(x.value).toLocaleString('ru-RU')} ₽</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {/* Bubble Tails */}
                  {msg.sender === 'runa' ? (
                    <View style={styles.tailLeft} />
                  ) : (
                    <View style={styles.tailRight} />
                  )}
                </View>
              </View>

              {msg.sender === 'user' && (
                <View style={styles.avatarRight}>
                  <View style={styles.userAvatarCircle}>
                    <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          {sending && (
            <View style={styles.messageWrapperLeft}>
              <View style={styles.avatarLeft}>
                <Image source={require('../../../images/runalogo2.png')} style={styles.avatarImage} />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleLeft]}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Введите сообщение..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !message.trim()}>
              <View style={[styles.sendIconCircle, (!message.trim() || sending) && { opacity: 0.6 }]}>
                <Text style={styles.sendButtonText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '400',
  },
  headerTitle: {
    flex: 1,
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
    textAlign: 'center',
    marginRight: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  avatarLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E0D4',
    marginRight: -10,
    zIndex: 2,
    marginBottom: -5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C5B0',
  },
  avatarRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E0D4',
    marginLeft: -10,
    zIndex: 2,
    marginBottom: -5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C5B0',
  },
  avatarImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  userAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D4981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageContent: {
    maxWidth: '80%',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    paddingHorizontal: 15,
  },
  senderNameLeft: {
    color: '#D4A373',
    textAlign: 'left',
  },
  senderNameRight: {
    color: '#333',
    textAlign: 'right',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 25,
    minWidth: 100,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageBubbleLeft: {
    backgroundColor: '#1D4981',
    borderBottomLeftRadius: 5,
  },
  messageBubbleRight: {
    backgroundColor: '#FDEBD0',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  messageTextLeft: {
    color: '#FFFFFF',
  },
  messageTextRight: {
    color: '#8B4513',
  },
  tailLeft: {
    position: 'absolute',
    left: -8,
    bottom: 0,
    width: 15,
    height: 15,
    backgroundColor: '#1D4981',
    borderBottomLeftRadius: 15,
    zIndex: -1,
  },
  tailRight: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    width: 15,
    height: 15,
    backgroundColor: '#FDEBD0',
    borderBottomRightRadius: 15,
    zIndex: -1,
  },
  inputWrapper: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEBD0',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 80,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1D4981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: -4,
  },
});

export default ChatView;
