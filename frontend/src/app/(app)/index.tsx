import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert, PanResponder, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { statsApi } from '@/api/stats';
import { aiApi } from '@/api/ai';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useFocusEffect } from 'expo-router';

// Reusable Components
import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';

const formatDate = (date: Date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function StatsScreen() {
  const { user } = useAuth();
  const { colors, colorScheme } = useAppTheme();
  
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
        <AppCard variant="elevated" style={styles.statsBox}>
          <AppText variant="subheading" style={styles.statsBoxTitle}>Today's Progress</AppText>
          {isLoadingToday ? (
             <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <View style={styles.heroRemaining}>
                <AppText variant="display" color={isExceeded ? colors.error : colors.text} align="center" style={{ fontSize: 64, lineHeight: 72 }}>
                  {Math.abs(remaining || 0)}
                </AppText>
                <AppText variant="caption" color={isExceeded ? colors.error : colors.textSecondary} align="center">
                  {isExceeded ? 'KCAL EXCEEDED' : 'KCAL REMAINING'}
                </AppText>
              </View>

              <View style={styles.row}>
                <View style={styles.statItem}>
                   <AppText variant="heading">{consumed?.calories || 0}</AppText>
                   <AppText variant="caption" color={colors.textSecondary}>Consumed</AppText>
                </View>
                <View style={styles.statItem}>
                   <AppText variant="heading">{targetCalories || 0}</AppText>
                   <AppText variant="caption" color={colors.textSecondary}>Target</AppText>
                </View>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <View style={styles.row}>
                <View style={styles.macroItem}>
                  <AppText variant="body" style={styles.macroValue}>{consumed?.protein || 0}g</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>Protein</AppText>
                </View>
                <View style={styles.macroItem}>
                  <AppText variant="body" style={styles.macroValue}>{consumed?.fat || 0}g</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>Fat</AppText>
                </View>
                <View style={styles.macroItem}>
                  <AppText variant="body" style={styles.macroValue}>{consumed?.carbs || 0}g</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>Carbs</AppText>
                </View>
              </View>
            </>
          )}
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <AppText variant="subheading" style={styles.statsBoxTitle}>
            {endStr === todayStr ? 'Last 7 Days' : `${startStr} - ${endStr}`}
          </AppText>
          <View style={styles.chartContainer}>
            {chartDays.map((d, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.barTrack, { backgroundColor: colors.backgroundElement }]}>
                  <View style={[
                    styles.barFill, 
                    { 
                      height: `${(d.calories / maxChartCalories) * 100}%`,
                      backgroundColor: d.dateStr === todayStr ? colors.primary : colors.secondary
                    }
                  ]} />
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.barLabel}>
                  {d.dateStr === todayStr ? 'Today' : d.date.toLocaleString('default', { weekday: 'short' })}
                </AppText>
                <AppText variant="caption" style={styles.barValue}>{d.calories}</AppText>
              </View>
            ))}
          </View>
        </AppCard>

        <AppCard variant="flat" style={styles.customDishSection}>
          <AppText variant="heading" style={styles.customDishTitle}>Create Custom Dish</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.customDishDesc} align="center">
            Add your own custom dish and let AI calculate its nutritional details.
          </AppText>
          <Button 
            title="Add Custom Dish" 
            onPress={() => setIsCustomDishModalVisible(true)}
            variant="primary"
          />
        </AppCard>

      </View>
    );
  };

  const renderCalendarMode = () => {
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => setMode('dashboard')} style={styles.backButton}>
            <AppIcon name="arrow-back" size={24} color={colors.primary} />
            <AppText variant="body" color={colors.primary} style={styles.backText}>Back</AppText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => setCurrentMonth(p => p.month === 1 ? {year: p.year-1, month: 12} : {...p, month: p.month-1})}>
            <AppText variant="heading" color={colors.primary} style={styles.monthNavText}>{'<'}</AppText>
          </TouchableOpacity>
          <AppText variant="heading" style={styles.monthText}>
             {new Date(currentMonth.year, currentMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </AppText>
          <TouchableOpacity onPress={() => setCurrentMonth(p => p.month === 12 ? {year: p.year+1, month: 1} : {...p, month: p.month+1})}>
            <AppText variant="heading" color={colors.primary} style={styles.monthNavText}>{'>'}</AppText>
          </TouchableOpacity>
        </View>

        {selectedDate ? (
          <AppCard variant="elevated" style={styles.mBox}>
            <View style={styles.mBoxHeader}>
              <AppText variant="subheading" style={styles.mBoxTitle}>{selectedDate}</AppText>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                 <AppIcon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {isLoadingDaily ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : dailyStats ? (
              <>
                <AppText variant="body" style={styles.mBoxStat}>Total Calories : {dailyStats.consumed?.calories || 0}</AppText>
                <AppText variant="body" style={styles.mBoxStat}>Total Protein Intake : {dailyStats.consumed?.protein || 0}g</AppText>
                <AppText variant="body" style={styles.mBoxStat}>Total Dishes Logged : {dailyStats.totalDishes || 0}</AppText>
              </>
            ) : (
              <AppText variant="body" style={styles.mBoxStat}>No data for this day.</AppText>
            )}
          </AppCard>
        ) : (
          <AppCard variant="elevated" style={styles.mBox}>
            <AppText variant="subheading" style={styles.mBoxTitle}>Monthly Summary</AppText>
            <AppText variant="body" style={styles.mBoxStat}>Total Calories : {monthlyTotals.calories}</AppText>
            <AppText variant="body" style={styles.mBoxStat}>Total Protein Intake : {monthlyTotals.protein}g</AppText>
            <AppText variant="body" style={styles.mBoxStat}>Total Dishes Logged : {monthlyTotals.dishes}</AppText>
          </AppCard>
        )}

        <AppCard variant="flat" style={styles.calendarGrid}>
          <View style={styles.weekDaysRow}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
               <AppText key={`wd-${i}`} variant="caption" color={colors.textSecondary} style={styles.weekDayText}>{day}</AppText>
            ))}
          </View>
          <View style={styles.daysRow}>
            {calendarDays.map((item, i) => {
              if (!item) return <View key={`empty-${i}`} style={styles.dayCell} />;
              const isSelected = item.dStr === selectedDate;
              return (
                <TouchableOpacity 
                  key={item.dStr} 
                  style={[
                    styles.dayCell, 
                    isSelected && { backgroundColor: colors.primary, borderRadius: 20 },
                    item.hasData && !isSelected && { backgroundColor: colors.backgroundSelected, borderRadius: 20 }
                  ]}
                  onPress={() => setSelectedDate(item.dStr)}
                >
                  <AppText 
                    variant="body" 
                    color={isSelected ? '#000000' : colors.text} 
                    style={isSelected ? { fontWeight: 'bold' } : undefined}
                  >
                    {item.day}
                  </AppText>
                </TouchableOpacity>
              )
            })}
          </View>
        </AppCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={mode !== 'dashboard'}>
        <AppText variant="heading" style={styles.headerTitle}>Stats</AppText>
        {mode === 'dashboard' ? renderDashboardMode() : renderCalendarMode()}
      </ScrollView>

      <Modal
        visible={isCustomDishModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isSubmittingDish && setIsCustomDishModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <AppText variant="heading" style={styles.modalHeaderTitle}>Add Custom Dish</AppText>
              <TouchableOpacity 
                onPress={() => setIsCustomDishModalVisible(false)}
                disabled={isSubmittingDish}
                style={styles.modalCloseBtn}
              >
                <AppIcon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.inputGroup}>
                <TextInput
                  label="Dish Title"
                  placeholder="e.g. Avocado Toast"
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />
              </View>

              <AppText variant="subheading" style={styles.sectionLabel}>Ingredients</AppText>
              {customIngredients.map((ing, idx) => (
                <View key={`ing-${idx}`} style={styles.ingredientRow}>
                  <View style={{ flex: 2, marginRight: Spacing.two }}>
                    <TextInput
                      label={idx === 0 ? "Ingredient" : ""}
                      placeholder="e.g. Eggs"
                      value={ing.name}
                      onChangeText={(val) => handleUpdateIngredient(idx, 'name', val)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label={idx === 0 ? "Amount" : ""}
                      placeholder="e.g. 2"
                      value={ing.amount}
                      onChangeText={(val) => handleUpdateIngredient(idx, 'amount', val)}
                    />
                  </View>
                </View>
              ))}
              <Button 
                title="Add More +" 
                variant="ghost" 
                onPress={handleAddIngredient}
                style={{ alignSelf: 'flex-start', width: 'auto' }}
              />

              <AppText variant="subheading" style={styles.sectionLabel}>Recipe Steps</AppText>
              <View style={styles.recipeRow}>
                <TextInput
                  label=""
                  style={{ minHeight: 120, textAlignVertical: 'top' }}
                  placeholder="Write the recipe."
                  value={customRecipeText}
                  onChangeText={setCustomRecipeText}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <Button 
                title="Post Dish" 
                onPress={handlePostDish}
                disabled={isSubmittingDish}
                loading={isSubmittingDish}
                variant="primary"
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: Spacing.four, paddingBottom: Spacing.eight },
  headerTitle: { marginBottom: Spacing.four },
  
  // Dashboard
  dashboardContainer: { flex: 1 },
  statsBox: {
    padding: Spacing.four, 
    marginBottom: Spacing.four,
  },
  statsBoxTitle: { marginBottom: Spacing.four },
  heroRemaining: {
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.three },
  statItem: { alignItems: 'center', flex: 1 },
  macroItem: { alignItems: 'center', flex: 1 },
  macroValue: { fontWeight: '600' },
  divider: { height: 1, marginVertical: Spacing.four },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 180, alignItems: 'flex-end', paddingTop: Spacing.four },
  barContainer: { alignItems: 'center', flex: 1 },
  barTrack: { height: 150, width: 24, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 12 },
  barLabel: { marginTop: 4 },
  barValue: { fontWeight: 'bold', marginTop: 2 },
  
  // Calendar
  calendarContainer: { flex: 1 },
  calHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.four },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: Spacing.one },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  monthNavText: { paddingHorizontal: Spacing.four },
  monthText: {},
  mBox: { padding: Spacing.four, marginBottom: Spacing.four },
  mBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  mBoxTitle: { marginBottom: Spacing.two },
  mBoxStat: { marginBottom: Spacing.one },
  calendarGrid: { padding: Spacing.two },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.two },
  weekDayText: { width: 40, textAlign: 'center' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  
  // Custom Dish
  customDishSection: {
    marginTop: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
  },
  customDishTitle: { marginBottom: Spacing.two },
  customDishDesc: { marginBottom: Spacing.four },

  // Modal
  modalSafeArea: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.four, borderBottomWidth: 1 },
  modalHeaderTitle: {},
  modalCloseBtn: { padding: Spacing.one },
  modalScrollContent: { padding: Spacing.four, paddingBottom: Spacing.eight },
  inputGroup: { marginBottom: Spacing.four },
  sectionLabel: { marginTop: Spacing.four, marginBottom: Spacing.three },
  ingredientRow: { flexDirection: 'row', marginBottom: Spacing.three },
  recipeRow: { marginBottom: Spacing.three },
  modalFooter: { padding: Spacing.four, borderTopWidth: 1 },
});
