import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Spacing } from '@/constants/theme';
import { getSavedDishes, Dish, GetSavedDishesFilters, logDish } from '@/api/pantry';

export default function SavedScreen() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

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

  // Filters state (kept as strings for easy TextInput binding)
  const [ingredient, setIngredient] = useState('');
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [minProtein, setMinProtein] = useState('');
  const [maxCalories, setMaxCalories] = useState('');

  const fetchDishes = async (overrideFilters?: GetSavedDishesFilters) => {
    setIsLoading(true);
    try {
      let filtersToApply: GetSavedDishesFilters = {};
      
      if (overrideFilters !== undefined) {
        filtersToApply = overrideFilters;
      } else {
        const prepTime = parseInt(maxPrepTime);
        const protein = parseInt(minProtein);
        const calories = parseInt(maxCalories);

        if (ingredient.trim()) filtersToApply.ingredient = ingredient.trim();
        if (!isNaN(prepTime)) filtersToApply.maxPrepTime = prepTime;
        if (!isNaN(protein)) filtersToApply.minProtein = protein;
        if (!isNaN(calories)) filtersToApply.maxCalories = calories;
      }

      const response = await getSavedDishes(filtersToApply);
      if (response && response.savedDishes) {
        setDishes(response.savedDishes);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch saved dishes.');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Auto-fetch on mount/focus, applying current filters if any
      fetchDishes();
    }, [])
  );

  const handleApplyFilters = () => {
    fetchDishes();
  };

  const handleClearFilters = () => {
    setIngredient('');
    setMaxPrepTime('');
    setMinProtein('');
    setMaxCalories('');
    
    // Pass empty filters explicitly to bypass state before re-render
    fetchDishes({});
  };

  const isFiltersActive = !!(ingredient || maxPrepTime || minProtein || maxCalories);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Saved Dishes</Text>
        
        {/* Search & Filters */}
        <View style={styles.filterSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredient or title..."
            value={ingredient}
            onChangeText={setIngredient}
            placeholderTextColor="#999"
          />
          
          <View style={styles.numericFiltersRow}>
            <View style={styles.numericFilter}>
              <Text style={styles.filterLabel}>Max Prep (m)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 30"
                value={maxPrepTime}
                onChangeText={setMaxPrepTime}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.numericFilter}>
              <Text style={styles.filterLabel}>Min Protein (g)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 25"
                value={minProtein}
                onChangeText={setMinProtein}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.numericFilter}>
              <Text style={styles.filterLabel}>Max Calories</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 500"
                value={maxCalories}
                onChangeText={setMaxCalories}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.filterActionsRow}>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApplyFilters}
              disabled={isLoading}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.clearButton, !isFiltersActive && styles.clearButtonDisabled]} 
              onPress={handleClearFilters}
              disabled={isLoading || !isFiltersActive}
            >
              <Text style={[styles.clearButtonText, !isFiltersActive && styles.clearButtonTextDisabled]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        ) : dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <View key={index} style={styles.dishCard}>
              <Text style={styles.dishTitle}>{dish.title}</Text>
              <Text style={styles.dishSubtitle}>Serving: {dish.serving_size} | Prep: {dish.prep_time} mins</Text>
              <Text style={styles.sectionHeader}>Macros:</Text>
              <View style={styles.macrosContainer}>
                <Text style={styles.macroText}>Calories: {dish.macros.calories}</Text>
                <Text style={styles.macroText}>Pro: {dish.macros.protein}g</Text>
                <Text style={styles.macroText}>Carbs: {dish.macros.carbs}g</Text>
                <Text style={styles.macroText}>Fat: {dish.macros.fat}g</Text>
              </View>

              <Text style={styles.sectionHeader}>Ingredients:</Text>
              {dish.ingredients.map((ing, i) => (
                <Text key={i} style={styles.ingredientText}>• {ing.name} — {ing.amount}</Text>
              ))}

              <Text style={styles.sectionHeader}>Recipe:</Text>
              {dish.recipe.map((step, i) => (
                <Text key={i} style={styles.recipeStep}>{i + 1}. {step}</Text>
              ))}

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.logButton]} 
                  onPress={() => handleLogDish(dish, index)}
                  disabled={actionLoading[`log_${index}`]}
                >
                  {actionLoading[`log_${index}`] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.logButtonText}>Log Dish</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : hasFetched ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isFiltersActive ? "No dishes match your filters." : "No saved dishes yet."}
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
    backgroundColor: '#fff',
  },
  container: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: Spacing.four,
  },
  filterSection: {
    backgroundColor: '#f9f9f9',
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: Spacing.three,
    backgroundColor: '#fff',
  },
  numericFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  numericFilter: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  clearButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButtonTextDisabled: {
    color: '#aaa',
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
    color: '#666',
    textAlign: 'center',
  },
  dishCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    backgroundColor: '#fafafa',
  },
  dishTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  dishSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  macroText: {
    fontSize: 14,
    color: '#444',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  recipeStep: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButton: {
    backgroundColor: '#000',
  },
  logButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
