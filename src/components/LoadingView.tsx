import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingView: React.FC<LoadingViewProps> = ({ 
  message = 'Загрузка...', 
  size = 'large' 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Runa Finance</Text>
      <ActivityIndicator size={size} color="#007AFF" style={styles.indicator} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 32,
  },
  indicator: {
    marginBottom: 16,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});

export default LoadingView;

