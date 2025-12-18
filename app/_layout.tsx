import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent={true} backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.stackWrapper}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#788FAC', flex: 1, marginTop: 0, paddingTop: 0 },
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#788FAC',
    marginTop: 0,
    paddingTop: 0,
    overflow: 'hidden',
  },
  stackWrapper: {
    flex: 1,
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: '#788FAC',
  },
});

