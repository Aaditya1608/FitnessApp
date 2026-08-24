import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacing } from '@/constants/theme';
import { generateDishes, saveDish, logDish, Dish } from '@/api/pantry';

const PANTRY_STORAGE_KEY = '@pantry_generated_dishes';

export default function PantryScreen() {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track action loading state by dish index and action type (save/log)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      const stored = await AsyncStorage.getItem(PANTRY_STORAGE_KEY);
      if (stored) {
        setDishes(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load generated dishes from storage:', err);
    }
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;
    if (ingredients.includes(trimmed)) {
      setIngredientInput('');
      return;
    }
    setIngredients([...ingredients, trimmed]);
    setIngredientInput('');
  };

  const removeIngredient = (ingToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingToRemove));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add some ingredients first.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await generateDishes(ingredients);
      if (response && response.data) {
        const generated = response.data;
        setDishes(generated);
        await AsyncStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(generated));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      Alert.alert('Generation Failed', err.message || 'Failed to generate dishes.');
    } finally {
      setIsGenerating(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pantry</Text>
        <Text style={styles.description}>Enter what you have, and AI will generate 3 dishes!</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={ingredientInput}
            onChangeText={setIngredientInput}
            placeholder="e.g. Chicken, Tomato..."
            onSubmitEditing={addIngredient}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {ingredients.map((ing) => (
            <View key={ing} style={styles.tag}>
              <Text style={styles.tagText}>{ing}</Text>
              <TouchableOpacity onPress={() => removeIngredient(ing)} style={styles.tagClose}>
                <Text style={styles.tagCloseText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.generateButton, (isGenerating || ingredients.length === 0) && styles.generateButtonDisabled]} 
          onPress={handleGenerate}
          disabled={isGenerating || ingredients.length === 0}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Dishes</Text>
          )}
        </TouchableOpacity>

        {dishes.map((dish, index) => (
          <View key={index} style={styles.dishCard}>
            <Text style={styles.dishTitle}>{dish.title}</Text>
            <Text style={styles.dishSubtitle}>Serving: {dish.serving_size} | Prep: {dish.prep_time} mins</Text>

            <Text style={styles.sectionHeader}>Macros:</Text>
            <View style={styles.macrosContainer}>
              <Text style={styles.macroText}>Cal: {dish.macros.calories}</Text>
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
                style={[styles.actionButton, styles.saveButton]} 
                onPress={() => handleSaveDish(dish, index)}
                disabled={actionLoading[`save_${index}`]}
              >
                {actionLoading[`save_${index}`] ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.logButton]} 
                onPress={() => handleLogDish(dish, index)}
                disabled={actionLoading[`log_${index}`]}
              >
                {actionLoading[`log_${index}`] ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.logButtonText}>Log Dish</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: Spacing.four,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.four,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  tagClose: {
    padding: 2,
  },
  tagCloseText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  generateButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: '600',
  }
});
