import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { getDishHistory, Dish } from '@/api/pantry';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface LoggedDish extends Dish {
  logged_at: string;
}

export default function HistoryScreen() {
  const [groupedDishes, setGroupedDishes] = useState<{ dateLabel: string; dishes: LoggedDish[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { isDark, colors } = useAppTheme();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getDishHistory();
      if (response && response.data) {
        groupDishes(response.data as LoggedDish[]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch dish history.');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const groupDishes = (dishes: LoggedDish[]) => {
    const groups: { [key: string]: LoggedDish[] } = {};
    const todayStr = new Date().toDateString();

    dishes.forEach(dish => {
      if (!dish.logged_at) return;
      
      const dateObj = new Date(dish.logged_at);
      const isToday = dateObj.toDateString() === todayStr;
      
      let dateLabel = '';
      if (isToday) {
        dateLabel = 'Today';
      } else {
        const day = dateObj.getDate();
        const suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                       (day === 2 || day === 22) ? 'nd' :
                       (day === 3 || day === 23) ? 'rd' : 'th';
        const month = dateObj.toLocaleString('default', { month: 'long' });
        dateLabel = `${day}${suffix} ${month}`;
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(dish);
    });

    const groupedArray = Object.keys(groups).map(key => ({
      dateLabel: key,
      dishes: groups[key]
    }));

    setGroupedDishes(groupedArray);
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };

  const cardBg = isDark ? '#1C1C1E' : '#fff';
  const cardBorder = isDark ? '#2C2C2E' : '#eee';
  const shadow = isDark
    ? {}
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
      };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Dish History</Text>
        
        {isLoading && !hasFetched ? (
          <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
        ) : groupedDishes.length > 0 ? (
          groupedDishes.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.dateGroup}>
              <Text style={[styles.dateHeading, { color: colors.textSecondary }]}>{group.dateLabel}</Text>
              
              {group.dishes.map((dish, dishIndex) => (
                <View key={dishIndex} style={[styles.dishCard, { backgroundColor: cardBg, borderColor: cardBorder }, shadow]}>
                  <Text style={[styles.dishTitle, { color: colors.text }]}>{dish.title}</Text>
                  
                  <View style={styles.macrosRow}>
                    <View style={styles.macroCol}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros.calories}</Text>
                    </View>
                    <View style={styles.macroCol}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros.protein}g</Text>
                    </View>
                    <View style={styles.macroCol}>
                      <Text style={styles.macroLabel}>Fats</Text>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros.fat}g</Text>
                    </View>
                  </View>
                  
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>Logged at {formatTime(dish.logged_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : hasFetched ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You have not logged any dishes yet.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.four,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: Spacing.four,
  },
  dateHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.three,
  },
  dishCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  dishTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 13,
  },
});
