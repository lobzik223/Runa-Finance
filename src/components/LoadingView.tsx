import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  onContinue?: () => void;
}

const LoadingView: React.FC<LoadingViewProps> = ({ 
  message = 'Загрузка...', 
  size = 'large',
  onContinue
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.wrapper, { top: -insets.top, height: SCREEN_HEIGHT + insets.top + 100 }]}>
      <View style={[styles.backgroundOverlay, { top: -insets.top - 200, height: SCREEN_HEIGHT + insets.top + 400 }]} />
      {onContinue && (
        <TouchableOpacity 
          style={[styles.topRightButton, { top: insets.top + 20 }]} 
          onPress={onContinue}
        >
          <Text style={styles.topRightButtonText}>Далее</Text>
        </TouchableOpacity>
      )}
      <View style={[styles.content, { paddingTop: insets.top + 180, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.topSection}>
          <Image 
            source={require('../../images/runalogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Твой финансовый помощник</Text>
        </View>
        <View style={styles.spacer} />
        <Image 
          source={require('../../images/runalogo2.png')} 
          style={styles.robot}
          resizeMode="contain"
        />
        <View style={styles.loadingSection}>
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Загрузка</Text>
        </View>
        {onContinue && (
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Далее</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#788FAC',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
  },
  backgroundOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#788FAC',
    zIndex: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  topSection: {
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 95,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#10396D',
    fontWeight: '400',
    marginTop: 0,
  },
  spacer: {
    flex: 0.8,
  },
  robot: {
    width: 360,
    height: 480,
    marginBottom: 30,
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  continueButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minWidth: 100,
  },
  continueButtonText: {
    fontSize: 14,
    color: '#788FAC',
    fontWeight: '600',
    textAlign: 'center',
  },
  topRightButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  topRightButtonText: {
    fontSize: 14,
    color: '#788FAC',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingView;

