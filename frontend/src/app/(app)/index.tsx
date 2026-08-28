import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, PanResponder, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { statsApi } from '@/api/stats';
import { aiApi } from '@/api/ai';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const formatDate = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function StatsScreen() {
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'dashboard' | 'calendar'>('dashboard');
  
  // Dashboard state
  const [todayStats, setTodayStats] = useState<any>(null);
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [chartEndDate, setChartEndDate] = useState<Date>(new Date());
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  
  // Shared state
  const [monthlyDataCache, setMonthlyDataCache] = useState<Record<string, any[]>>({});
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  
  // Custom Dish state
  const [isCustomDishModalVisible, setIsCustomDishModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customIngredients, setCustomIngredients] = useState([{ name: '', amount: '' }]);
  const [customRecipeText, setCustomRecipeText] = useState('');
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);

  
  const focusStateRef = useRef({ chartEndDate, mode, currentMonth });
  useEffect(() => {
    focusStateRef.current = { chartEndDate, mode, currentMonth };
  }, [chartEndDate, mode, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchTodayStats();
      
      const { chartEndDate: end, mode: currentMode, currentMonth: cMonth } = focusStateRef.current;
      
      if (currentMode === 'dashboard') {
        const endDate = new Date(end);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        
        const m1 = { year: startDate.getFullYear(), month: startDate.getMonth() + 1 };
        const m2 = { year: endDate.getFullYear(), month: endDate.getMonth() + 1 };
        
        fetchMonthlyData(m1.year, m1.month, true);
        if (m1.year !== m2.year || m1.month !== m2.month) {
          fetchMonthlyData(m2.year, m2.month, true);
        }
      } else {
        fetchMonthlyData(cMonth.year, cMonth.month, true);
      }
    }, [])
  );
  
  useEffect(() => {
    if (mode === 'dashboard') {
      fetchTodayStats();
    }
  }, [mode]);
  
  const fetchTodayStats = async () => {
    try {
      setIsLoadingToday(true);
      const data = await statsApi.getDaily();
      setTodayStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingToday(false);
    }
  };
  
  const fetchMonthlyData = async (year: number, month: number, forceRefresh: boolean = false) => {
    const key = `${year}-${month}`;
    if (!forceRefresh && monthlyDataCache[key]) return;
    try {
      setIsLoadingMonthly(true);
      const data = await statsApi.getMonthly(year, month);
      setMonthlyDataCache(prev => ({ ...prev, [key]: data.dailySummaries || [] }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMonthly(false);
    }
  };
  
  // Fetch required months for chart
  const prevModeRef = useRef(mode);

  useEffect(() => {
    const isModeSwitch = prevModeRef.current !== mode;
    prevModeRef.current = mode;

    if (mode === 'dashboard') {
      const end = new Date(chartEndDate);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      
      const m1 = { year: start.getFullYear(), month: start.getMonth() + 1 };
      const m2 = { year: end.getFullYear(), month: end.getMonth() + 1 };
      
      fetchMonthlyData(m1.year, m1.month, isModeSwitch);
      if (m1.year !== m2.year || m1.month !== m2.month) {
        fetchMonthlyData(m2.year, m2.month, isModeSwitch);
      }
    } else {
      fetchMonthlyData(currentMonth.year, currentMonth.month, isModeSwitch);
    }
  }, [chartEndDate, mode, currentMonth.year, currentMonth.month]);
  
  useEffect(() => {
    if (selectedDate) {
      const fetchDaily = async () => {
        try {
          setIsLoadingDaily(true);
          const data = await statsApi.getDaily(selectedDate);
          setDailyStats(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingDaily(false);
        }
      };
      fetchDaily();
    } else {
      setDailyStats(null);
    }
  }, [selectedDate]);

  // Generate 7 days for chart
  const chartDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(chartEndDate);
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      const mKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      
      const monthData = monthlyDataCache[mKey] || [];
      const dayData = monthData.find(item => item.date === dStr);
      
      days.push({
        date: d,
        dateStr: dStr,
        calories: dayData ? parseInt(dayData.total_calories) || 0 : 0,
      });
    }
    return days;
  }, [chartEndDate, monthlyDataCache]);

  const maxChartCalories = useMemo(() => {
    const max = Math.max(...chartDays.map(d => d.calories), 2000); // minimum scale
    return max;
  }, [chartDays]);

  // Dashboard swipe/tap handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          // Tap
          setMode('calendar');
        } else if (gestureState.dx > 50) {
          // Swipe Right (Go back in time)
          handleSwipe('backward');
        } else if (gestureState.dx < -50) {
          // Swipe Left (Go forward in time)
          handleSwipe('forward');
        }
      },
    })
  ).current;

  const handleSwipe = (direction: 'backward' | 'forward') => {
    setChartEndDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'backward') {
        newDate.setDate(newDate.getDate() - 7);
        if (user?.created_at) {
          const startDate = new Date(user.created_at);
          startDate.setHours(0, 0, 0, 0);
          
          const startOfNewWeek = new Date(newDate);
          startOfNewWeek.setDate(startOfNewWeek.getDate() - 6);
          startOfNewWeek.setHours(0,0,0,0);
          
          const startOfPrevWeek = new Date(prev);
          startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 6);
          startOfPrevWeek.setHours(0,0,0,0);
          
          if (startOfNewWeek < startDate && startOfPrevWeek <= startDate) {
             return prev; 
          }
        }
      } else {
        newDate.setDate(newDate.getDate() + 7);
        const today = new Date();
        if (newDate > today) {
          return today;
        }
      }
      return newDate;
    });
  };

  // Calendar calculations
  const monthlyTotals = useMemo(() => {
    const key = `${currentMonth.year}-${currentMonth.month}`;
    const data = monthlyDataCache[key] || [];
    let calories = 0, protein = 0, dishes = 0;
    data.forEach(d => {
      calories += parseInt(d.total_calories) || 0;
      protein += parseInt(d.total_protein) || 0;
      dishes += parseInt(d.total_dishes) || 0;
    });
    return { calories, protein, dishes };
  }, [currentMonth, monthlyDataCache]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const firstDay = new Date(currentMonth.year, currentMonth.month - 1, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.year, currentMonth.month - 1, i);
      const dStr = formatDate(date);
      const key = `${currentMonth.year}-${currentMonth.month}`;
      const monthData = monthlyDataCache[key] || [];
      const hasData = monthData.some(d => d.date === dStr);
      days.push({ date, dStr, day: i, hasData });
    }
    return days;
  }, [currentMonth, monthlyDataCache]);

  // Custom Dish Functions
  const handleAddIngredient = () => {
    setCustomIngredients([...customIngredients, { name: '', amount: '' }]);
  };

  const handleUpdateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...customIngredients];
    updated[index][field] = value;
    setCustomIngredients(updated);
  };

  const handlePostDish = async () => {
    const title = customTitle.trim();
    if (!title) {
      Alert.alert('Validation Error', 'Please enter a title for the dish.');
      return;
    }

    const ingredientsObj: Record<string, string> = {};
    for (const item of customIngredients) {
      const name = item.name.trim();
      const amount = item.amount.trim();
      if (name && amount) {
        ingredientsObj[name] = amount;
      } else if (name || amount) {
        Alert.alert('Validation Error', 'Please provide both name and amount for all ingredients, or leave empty rows completely blank.');
        return;
      }
    }

    if (Object.keys(ingredientsObj).length === 0) {
      Alert.alert('Validation Error', 'Please add at least one valid ingredient.');
      return;
    }

    const recipe = customRecipeText
      .split(".")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `${line}.`);

    if (recipe.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one recipe step.');
      return;
    }

    try {
      setIsSubmittingDish(true);
      await aiApi.postCustomDish({ title, ingredients: ingredientsObj, recipe });
      console.log(
  "Posting custom dish payload:",
  JSON.stringify({ title, ingredients: ingredientsObj, recipe }, null, 2)
);
      Alert.alert('Success', 'Custom dish analyzed and created successfully!');
      setIsCustomDishModalVisible(false);
      setCustomTitle('');
      setCustomIngredients([{ name: '', amount: '' }]);
      setCustomRecipeText('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create custom dish. Please try again later.');
    } finally {
      setIsSubmittingDish(false);
    }
  };


  const renderDashboardMode = () => {
    const startStr = chartDays[0].dateStr;
    const endStr = chartDays[6].dateStr;
    const todayStr = formatDate(new Date());

    const { targetCalories, consumed } = todayStats || { targetCalories: 0, consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
    const remaining = targetCalories - consumed?.calories;
    const isExceeded = remaining < 0;

    return (
      <View style={styles.dashboardContainer} {...panResponder.panHandlers}>
        <View style={styles.statsBox}>
          <Text style={styles.statsBoxTitle}>Today's Summary</Text>
          {isLoadingToday ? (
             <ActivityIndicator size="small" color="#208AEF" />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.statItem}>
                   <Text style={styles.statValue}>{targetCalories || 0}</Text>
                   <Text style={styles.statLabel}>Target</Text>
                </View>
                <View style={styles.statItem}>
                   <Text style={styles.statValue}>{consumed?.calories || 0}</Text>
                   <Text style={styles.statLabel}>Consumed</Text>
                </View>
                <View style={styles.statItem}>
                   <Text style={[styles.statValue, isExceeded && styles.exceededValue]}>{Math.abs(remaining || 0)}</Text>
                   <Text style={[styles.statLabel, isExceeded && styles.exceededLabel]}>{isExceeded ? 'Exceeded' : 'Remaining'}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.macroText}>Protein: {consumed?.protein || 0}g</Text>
                <Text style={styles.macroText}>Fat: {consumed?.fat || 0}g</Text>
                <Text style={styles.macroText}>Carbs: {consumed?.carbs || 0}g</Text>
              </View>
            </>
          )}
          
          <View style={styles.divider} />
          
          <Text style={styles.statsBoxTitle}>
            {endStr === todayStr ? 'Last 7 Days' : `${startStr} - ${endStr}`}
          </Text>
          <View style={styles.chartContainer}>
            {chartDays.map((d, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${(d.calories / maxChartCalories) * 100}%` }]} />
                </View>
                <Text style={styles.barLabel}>{d.dateStr === todayStr ? 'Today' : d.date.toLocaleString('default', { weekday: 'short' })}</Text>
                <Text style={styles.barValue}>{d.calories}</Text>
              </View>
            ))}
          </View>
          {/*<Text style={styles.swipeHint}>Swipe left/right to change week. Tap to open calendar.</Text>*/}
        </View>

        <View style={styles.customDishSection}>
          <Text style={styles.customDishTitle}>Create Custom Dish</Text>
          <Text style={styles.customDishDesc}>Add your own custom dish and let AI calculate its nutritional details.</Text>
          <TouchableOpacity 
            style={styles.addCustomDishBtn} 
            onPress={() => setIsCustomDishModalVisible(true)}
          >
            <Text style={styles.addCustomDishBtnText}>Add Custom Dish</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  const renderCalendarMode = () => {
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => setMode('dashboard')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#208AEF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => setCurrentMonth(p => p.month === 1 ? {year: p.year-1, month: 12} : {...p, month: p.month-1})}>
            <Text style={styles.monthNavText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
             {new Date(currentMonth.year, currentMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(p => p.month === 12 ? {year: p.year+1, month: 1} : {...p, month: p.month+1})}>
            <Text style={styles.monthNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {selectedDate ? (
          <View style={styles.mBox}>
            <View style={styles.mBoxHeader}>
              <Text style={styles.mBoxTitle}>{selectedDate}</Text>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                 <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {isLoadingDaily ? (
              <ActivityIndicator size="small" color="#208AEF" />
            ) : dailyStats ? (
              <>
                <Text style={styles.mBoxStat}>Total Calories : {dailyStats.consumed?.calories || 0}</Text>
                <Text style={styles.mBoxStat}>Total Protein Intake : {dailyStats.consumed?.protein || 0}g</Text>
                <Text style={styles.mBoxStat}>Total Dishes Logged : {dailyStats.totalDishes || 0}</Text>
              </>
            ) : (
              <Text style={styles.mBoxStat}>No data for this day.</Text>
            )}
          </View>
        ) : (
          <View style={styles.mBox}>
            <Text style={styles.mBoxTitle}>Monthly Summary</Text>
            <Text style={styles.mBoxStat}>Total Calories : {monthlyTotals.calories}</Text>
            <Text style={styles.mBoxStat}>Total Protein Intake : {monthlyTotals.protein}g</Text>
            <Text style={styles.mBoxStat}>Total Dishes Logged : {monthlyTotals.dishes}</Text>
          </View>
        )}

        <View style={styles.calendarGrid}>
          <View style={styles.weekDaysRow}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
               <Text key={`wd-${i}`} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
          <View style={styles.daysRow}>
            {calendarDays.map((item, i) => {
              if (!item) return <View key={`empty-${i}`} style={styles.dayCell} />;
              const isSelected = item.dStr === selectedDate;
              return (
                <TouchableOpacity 
                  key={item.dStr} 
                  style={[styles.dayCell, isSelected && styles.dayCellSelected, item.hasData && !isSelected && styles.dayCellHasData]}
                  onPress={() => setSelectedDate(item.dStr)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{item.day}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={mode !== 'dashboard'}>
        <Text style={styles.headerTitle}>Stats</Text>
        {mode === 'dashboard' ? renderDashboardMode() : renderCalendarMode()}
      </ScrollView>

      <Modal
        visible={isCustomDishModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isSubmittingDish && setIsCustomDishModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add Custom Dish</Text>
              <TouchableOpacity 
                onPress={() => setIsCustomDishModalVisible(false)}
                disabled={isSubmittingDish}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add Title of the Dish"
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={styles.sectionLabel}>Ingredients:</Text>
              {customIngredients.map((ing, idx) => (
                <View key={`ing-${idx}`} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.textInput, { flex: 2, marginRight: Spacing.two }]}
                    placeholder="Ingredient (e.g. Eggs)"
                    value={ing.name}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'name', val)}
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Amount (e.g. 2)"
                    value={ing.amount}
                    onChangeText={(val) => handleUpdateIngredient(idx, 'amount', val)}
                    placeholderTextColor="#999"
                  />
                </View>
              ))}
              <TouchableOpacity onPress={handleAddIngredient} style={styles.addMoreBtn}>
                <Text style={styles.addMoreBtnText}>Add More +</Text>
              </TouchableOpacity>

              <Text style={styles.sectionLabel}>Recipe:</Text>
              <View style={styles.recipeRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, minHeight: 120, textAlignVertical: 'top' }]}
                  placeholder="Write the recipe."
                  value={customRecipeText}
                  onChangeText={setCustomRecipeText}
                  multiline
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.postDishBtn, isSubmittingDish && styles.postDishBtnDisabled]}
                onPress={handlePostDish}
                disabled={isSubmittingDish}
              >
                {isSubmittingDish ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.postDishBtnText}>Post Dish</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: Spacing.four, paddingBottom: Spacing.eight },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: Spacing.four, color: '#000' },
  
  // Dashboard
  dashboardContainer: { flex: 1 },
  statsBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: Spacing.four, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statsBoxTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.four, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.three },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  statLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase' },
  exceededValue: { color: '#FF3B30' },
  exceededLabel: { color: '#FF3B30', fontWeight: '600' },
  macroText: { fontSize: 14, color: '#444', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: Spacing.four },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 180, alignItems: 'flex-end', paddingTop: Spacing.four },
  barContainer: { alignItems: 'center', flex: 1 },
  barTrack: { height: 150, width: 24, backgroundColor: '#f0f0f0', borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { backgroundColor: '#208AEF', width: '100%', borderRadius: 12 },
  barLabel: { fontSize: 10, color: '#666', marginTop: 4 },
  barValue: { fontSize: 10, color: '#000', fontWeight: 'bold', marginTop: 2 },
  swipeHint: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: Spacing.four, fontStyle: 'italic' },
  
  // Calendar
  calendarContainer: { flex: 1 },
  calHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.four },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, color: '#208AEF', marginLeft: Spacing.one },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  monthNavText: { fontSize: 24, fontWeight: 'bold', color: '#208AEF', paddingHorizontal: Spacing.four },
  monthText: { fontSize: 18, fontWeight: '600' },
  mBox: { backgroundColor: '#fff', borderRadius: 12, padding: Spacing.four, marginBottom: Spacing.four,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  mBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  mBoxTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: Spacing.two },
  mBoxStat: { fontSize: 16, color: '#444', marginBottom: Spacing.one },
  calendarGrid: { backgroundColor: '#fff', borderRadius: 12, padding: Spacing.two },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.two },
  weekDayText: { fontSize: 14, color: '#888', fontWeight: 'bold', width: 40, textAlign: 'center' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  dayCellHasData: { backgroundColor: '#eef6ff', borderRadius: 20 },
  dayCellSelected: { backgroundColor: '#208AEF', borderRadius: 20 },
  dayText: { fontSize: 16, color: '#333' },
  dayTextSelected: { color: '#fff', fontWeight: 'bold' },
  
  // Custom Dish
  customDishSection: {
    marginTop: Spacing.two,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  customDishTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: Spacing.two },
  customDishDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: Spacing.four },
  addCustomDishBtn: { backgroundColor: '#208AEF', paddingVertical: Spacing.three, paddingHorizontal: Spacing.six, borderRadius: 24 },
  addCustomDishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal
  modalSafeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalCloseBtn: { padding: Spacing.one },
  modalScrollContent: { padding: Spacing.four, paddingBottom: Spacing.eight },
  inputGroup: { marginBottom: Spacing.four },
  textInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: Spacing.three, fontSize: 14, color: '#333' },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: Spacing.four, marginBottom: Spacing.three },
  ingredientRow: { flexDirection: 'row', marginBottom: Spacing.three },
  addMoreBtn: { alignSelf: 'flex-start', paddingVertical: Spacing.two, marginBottom: Spacing.four },
  addMoreBtnText: { color: '#208AEF', fontWeight: 'bold', fontSize: 16 },
  recipeRow: { marginBottom: Spacing.three },
  modalFooter: { padding: Spacing.four, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  postDishBtn: { backgroundColor: '#208AEF', paddingVertical: Spacing.four, borderRadius: 12, alignItems: 'center' },
  postDishBtnDisabled: { backgroundColor: '#90C4F7' },
  postDishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
