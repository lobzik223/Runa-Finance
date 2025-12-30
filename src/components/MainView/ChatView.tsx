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
  Image,
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
                <View style={styles.avatarLeft}>
                  <Image source={require('../icon/chatlogo.png')} style={styles.avatarImage} />
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
                  <Image source={require('../icon/profile.png')} style={styles.avatarImage} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area - Redesigned to match image */}
        <View style={[styles.inputWrapper, { marginBottom: insets.bottom + 15 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Введите сообщения"
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <View style={styles.sendIconCircle}>
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
    borderRadius: 35,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
