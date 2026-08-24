import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.description}>
          Profile editing and settings will be implemented here.
        </Text>
        
        {/* Basic logout button using plain Text to verify logout still works */}
        <Text style={styles.logoutButton} onPress={logout}>
          Log Out
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.two,
    color: '#000',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: Spacing.six,
  },
  logoutButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
    padding: Spacing.three,
  }
});
