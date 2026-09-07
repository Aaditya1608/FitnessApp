import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { getCustomDishes, logDish, saveDish, Dish, Ingredient } from '@/api/pantry';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDishesScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  
  // Modal state
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const { isDark, colors } = useAppTheme();

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const response = await getCustomDishes();
      if (response && response.data) {
        setDishes(response.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch custom dishes.');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDishes();
    }, [])
  );

  const handleLogDish = async (dish: Dish, index: number) => {
    const actionKey = `log_${index}`;
    if (actionLoading[actionKey]) return;

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      await logDish(dish);
      Alert.alert('Success', 'Dish logged successfully!');
    } catch (err: any) {
      Alert.alert('Log Failed', err.message || 'Failed to log dish.');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleSaveDish = async (dish: Dish, index: number) => {
    const actionKey = `save_${index}`;
    if (actionLoading[actionKey]) return;

    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    try {
      await saveDish(dish);
      Alert.alert('Success', 'Dish saved successfully!');
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Failed to save dish.');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const openDetails = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const closeDetails = () => {
    setSelectedDish(null);
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
        <Text style={[styles.title, { color: colors.text }]}>Custom Dishes</Text>
        
        {isLoading && !hasFetched ? (
          <ActivityIndicator size="large" color="#208AEF" style={styles.loader} />
        ) : dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.dishCard, { backgroundColor: cardBg, borderColor: cardBorder }, shadow]}
              activeOpacity={0.8}
              onPress={() => openDetails(dish)}
            >
              <Text style={[styles.dishTitle, { color: colors.text }]}>{dish.title}</Text>
              
              <View style={styles.macrosRow}>
                <View style={styles.macroCol}>
                  <Text style={styles.macroLabel}>Calories</Text>
                  <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros?.calories ?? '—'}</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros?.protein ?? '—'}g</Text>
                </View>
                <View style={styles.macroCol}>
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={[styles.macroValue, { color: colors.text }]}>{dish.macros?.fat ?? '—'}g</Text>
                </View>
              </View>

              <Text style={styles.ingredientsLabel}>Ingredients:</Text>
              <Text style={[styles.ingredientsList, { color: colors.textSecondary }]} numberOfLines={2}>
                {dish.ingredients?.map(i => i.name).join(', ') || 'No ingredients listed'}
              </Text>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.logButton]} 
                  onPress={() => handleLogDish(dish, index)}
                  disabled={actionLoading[`log_${index}`]}
                >
                  {actionLoading[`log_${index}`] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Log Dish</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton, { borderColor: isDark ? '#3A3A3C' : '#D1D1D6' }]} 
                  onPress={() => handleSaveDish(dish, index)}
                  disabled={actionLoading[`save_${index}`]}
                >
                  {actionLoading[`save_${index}`] ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Text style={[styles.actionButtonTextSecondary, { color: colors.text }]}>Save Dish</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : hasFetched ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No custom dishes found.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedDish}
        animationType="slide"
        transparent
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {selectedDish?.title}
              </Text>
              <TouchableOpacity onPress={closeDetails} style={styles.modalCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Ingredients</Text>
              <View style={[styles.ingredientsTable, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}>
                <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderBottomColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { color: colors.text }]}>Ingredient</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { color: colors.text }]}>Amount</Text>
                </View>
                {selectedDish?.ingredients?.map((ing, i) => (
                  <View key={i} style={[styles.tableRow, { borderBottomColor: isDark ? '#3A3A3C' : '#E5E5EA', borderBottomWidth: i === selectedDish.ingredients.length - 1 ? 0 : 1 }]}>
                    <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{ing.name}</Text>
                    <Text style={[styles.tableCell, { color: colors.textSecondary }]}>{ing.amount}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionHeader, { color: colors.text, marginTop: Spacing.six }]}>Recipe</Text>
              <View style={styles.recipeList}>
                {selectedDish?.recipe?.map((step, i) => (
                  <View key={i} style={styles.recipeStepContainer}>
                    <Text style={[styles.recipeNumber, { color: colors.text }]}>{i + 1}.</Text>
                    <Text style={[styles.recipeStepText, { color: colors.textSecondary }]}>{step}</Text>
                  </View>
                ))}
              </View>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dishCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  dishTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  macroCol: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  ingredientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButton: {
    backgroundColor: '#208AEF',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  actionButtonTextSecondary: {
    fontWeight: '600',
    fontSize: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: Spacing.two,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: Spacing.four,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  ingredientsTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  tableHeaderCell: {
    fontWeight: '600',
  },
  recipeList: {
    marginTop: Spacing.two,
  },
  recipeStepContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
  },
  recipeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    width: 24,
  },
  recipeStepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
