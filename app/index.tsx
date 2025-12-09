import { StatusBar } from 'expo-status-bar';
import LoadingView from '../src/components/LoadingView';

export default function Page() {
  return (
    <>
      <StatusBar style="auto" />
      <LoadingView />
    </>
  );
}
