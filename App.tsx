import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoadingView from './src/components/LoadingView';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <LoadingView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

