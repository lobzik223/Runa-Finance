import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'runa' | 'user';
  senderName: string;
}

interface ChatViewProps {
  onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Чем я могу тебе помощь? Хочешь могу проанализировать твои расходы?',
      sender: 'runa',
      senderName: 'Runa',
    },
    {
      id: '2',
      text: 'Привет, сделай расчет по моим инвестициям',
      sender: 'user',
      senderName: 'Вася',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        senderName: 'Вася',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Чат с ИИ</Text>
        {onBack && <View style={styles.backButton} />}
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.messagesContainer, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
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
                <View style={[styles.avatar, styles.avatarRuna]}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarEmoji}>🤖</Text>
                  </View>
                </View>
              )}
              <View style={styles.messageContent}>
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.messageBubbleRight : styles.messageBubbleLeft,
                  ]}
                >
                  <Text
                    style={[
                      styles.senderName,
                      msg.sender === 'user' ? styles.senderNameRight : styles.senderNameLeft,
                    ]}
                  >
                    {msg.senderName}
                  </Text>
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.messageTextRight : styles.messageTextLeft,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  {msg.sender === 'runa' && (
                    <View style={styles.bubbleTailLeft} />
                  )}
                  {msg.sender === 'user' && (
                    <View style={styles.bubbleTailRight} />
                  )}
                </View>
              </View>
              {msg.sender === 'user' && (
                <View style={styles.avatar}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput
            style={styles.input}
            placeholder="Введите сообщения"
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>›</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  messageWrapperLeft: {
    justifyContent: 'flex-start',
  },
  messageWrapperRight: {
    justifyContent: 'flex-end',
  },
  messageContent: {
    maxWidth: '75%',
    marginHorizontal: 10,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 14,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  messageBubbleLeft: {
    backgroundColor: '#1D4981',
    borderBottomLeftRadius: 6,
  },
  messageBubbleRight: {
    backgroundColor: '#E8E0D4',
    borderBottomRightRadius: 6,
  },
  senderName: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  senderNameLeft: {
    color: '#D4C5B0',
    textAlign: 'left',
  },
  senderNameRight: {
    color: '#A0522D',
    textAlign: 'left',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  messageTextLeft: {
    color: '#FFFFFF',
  },
  messageTextRight: {
    color: '#333333',
  },
  bubbleTailLeft: {
    position: 'absolute',
    left: -10,
    bottom: 14,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: 'transparent',
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: '#1D4981',
  },
  bubbleTailRight: {
    position: 'absolute',
    right: -10,
    bottom: 14,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: 'transparent',
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
    borderLeftWidth: 10,
    borderLeftColor: '#E8E0D4',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8E0D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    borderWidth: 2,
    borderColor: '#D4C5B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarRuna: {
    marginTop: 44,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#788FAC',
    borderTopWidth: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#E8E0D4',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    maxHeight: 100,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1D4981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ChatView;

