import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { userApi } from '@/api/user';

// ─── Human-readable label helpers ────────────────────────────────────────────

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const LIFESTYLE_OPTIONS = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Lightly Active', value: 'lightly_active' },
  { label: 'Moderately Active', value: 'moderately_active' },
  { label: 'Highly Active', value: 'highly_active' },
  { label: 'Extra Active', value: 'extra_active' },
];

const GOAL_OPTIONS = [
  { label: 'Weight Loss', value: 'weight_loss' },
  { label: 'Weight Gain', value: 'weight_gain' },
];

function labelFor(options: { label: string; value: string }[], value: string | undefined) {
  if (!value) return null;
  return options.find(o => o.value === value)?.label ?? value;
}

// ─── Inline Dropdown (native-friendly) ───────────────────────────────────────

interface DropdownOption { label: string; value: string; }
interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  colors: ReturnType<typeof useAppTheme>['colors'];
  isDark: boolean;
}

function Dropdown({ options, value, onChange, placeholder, colors, isDark }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[
          dropdownStyles.trigger,
          { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: isDark ? '#3A3A3C' : '#D1D1D6' },
        ]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.7}
      >
        <Text style={[dropdownStyles.triggerText, { color: selected ? colors.text : colors.textSecondary }]}>
          {selected ? selected.label : (placeholder ?? 'Select…')}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {open && (
        <View style={[dropdownStyles.menu, { backgroundColor: isDark ? '#1C1C1E' : '#fff', borderColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                dropdownStyles.menuItem,
                opt.value === value && { backgroundColor: '#208AEF20' },
              ]}
              onPress={() => { onChange(opt.value); setOpen(false); }}
            >
              <Text style={[dropdownStyles.menuItemText, { color: colors.text }, opt.value === value && { color: '#208AEF', fontWeight: '600' }]}>
                {opt.label}
              </Text>
              {opt.value === value && <Ionicons name="checkmark" size={16} color="#208AEF" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 2,
  },
  triggerText: { fontSize: 15 },
  menu: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: { fontSize: 15 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

type UserDetails = {
  weight?: number;
  height?: number;
  age?: number;
  sex?: string;
  lifestyle?: string;
  goal?: string;
} | null;

type EditForm = {
  weight: string;
  height: string;
  age: string;
  sex: string;
  lifestyle: string;
  goal: string;
};

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useAppTheme();

  const [details, setDetails] = useState<UserDetails>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState<EditForm>({ weight: '', height: '', age: '', sex: '', lifestyle: '', goal: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetch user details on mount ──────────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    try {
      setIsLoadingDetails(true);
      const res = await userApi.getDetails();
      setDetails(res?.data ?? null);
    } catch {
      setDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ── Open edit modal pre-populated ────────────────────────────────────────
  const openEdit = () => {
    setForm({
      weight: details?.weight != null ? String(details.weight) : '',
      height: details?.height != null ? String(details.height) : '',
      age:    details?.age    != null ? String(details.age)    : '',
      sex:       details?.sex       ?? '',
      lifestyle: details?.lifestyle ?? '',
      goal:      details?.goal      ?? '',
    });
    setEditError(null);
    setEditVisible(true);
  };

  // ── Submit edited data ───────────────────────────────────────────────────
  const handleSubmitEdit = async () => {
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    const age    = parseInt(form.age);

    if (isNaN(weight) || weight <= 0) {
      setEditError('Please enter a valid weight.');
      return;
    }
    if (isNaN(height) || height <= 0) {
      setEditError('Please enter a valid height.');
      return;
    }
    if (isNaN(age) || age <= 0 || age > 120) {
      setEditError('Please enter a valid age.');
      return;
    }
    if (!form.sex) {
      setEditError('Please select a gender.');
      return;
    }
    if (!form.lifestyle) {
      setEditError('Please select a lifestyle.');
      return;
    }
    if (!form.goal) {
      setEditError('Please select a goal.');
      return;
    }

    try {
      setIsSubmitting(true);
      setEditError(null);
      const res = await userApi.postDetails({
        weight, height, age,
        sex: form.sex,
        lifestyle: form.lifestyle,
        goal: form.goal,
      });
      // Update local state from the returned row
      const updated = res?.data ?? { weight, height, age, sex: form.sex, lifestyle: form.lifestyle, goal: form.goal };
      setDetails(updated);
      setEditVisible(false);
    } catch (err: any) {
      setEditError(err?.message ?? 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  // ── Derived display values ────────────────────────────────────────────────
  const avatarLetter = user?.username ? user.username[0].toUpperCase() : '?';

  const s = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <Text style={s.pageTitle}>Settings</Text>

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.username ?? '—'}</Text>
            <Text style={s.profileEmail}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* ── Physical Information Card ────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Physical Information</Text>
        </View>

        <View style={s.card}>
          {isLoadingDetails ? (
            <ActivityIndicator size="small" color="#208AEF" style={{ paddingVertical: Spacing.four }} />
          ) : (
            <>
              <View style={s.physicalGrid}>
                <PhysicalRow label="Weight" value={details?.weight != null ? `${details.weight} kg` : null} colors={colors} />
                <PhysicalRow label="Height" value={details?.height != null ? `${details.height} cm` : null} colors={colors} />
                <PhysicalRow label="Age"    value={details?.age    != null ? String(details.age)   : null} colors={colors} />
                <PhysicalRow label="Gender" value={labelFor(GENDER_OPTIONS, details?.sex)} colors={colors} />
                <PhysicalRow label="Lifestyle" value={labelFor(LIFESTYLE_OPTIONS, details?.lifestyle)} colors={colors} />
                <PhysicalRow label="Goal"   value={labelFor(GOAL_OPTIONS, details?.goal)} colors={colors} />
              </View>

              <TouchableOpacity style={s.editButton} onPress={openEdit} activeOpacity={0.75}>
                <Ionicons name="pencil-outline" size={15} color="#208AEF" />
                <Text style={s.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        

        {/* ── Data ─────────────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Data</Text>
        </View>

        <View style={s.card}>
          {/* Dish History row */}
          <TouchableOpacity
            style={[s.settingsRow, s.rowWithChevron]}
            onPress={() => Alert.alert('Coming Soon', 'Dish History will be available in a future update.')}
            activeOpacity={0.7}
          >
            <View style={s.settingsRowLeft}>
              <View style={[s.rowIconWrap, { backgroundColor: '#FF950020' }]}>
                <Ionicons name="time-outline" size={18} color="#FF9500" />
              </View>
              <View>
                <Text style={s.settingsRowLabel}>Dish History</Text>
                <Text style={s.settingsRowDesc}>View all previously logged dishes</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={s.rowDivider} />

          {/* Custom Dishes row */}
          <TouchableOpacity
            style={[s.settingsRow, s.rowWithChevron]}
            onPress={() => Alert.alert('Coming Soon', 'Custom Dishes listing will be available in a future update.')}
            activeOpacity={0.7}
          >
            <View style={s.settingsRowLeft}>
              <View style={[s.rowIconWrap, { backgroundColor: '#34C75920' }]}>
                <Ionicons name="restaurant-outline" size={18} color="#34C759" />
              </View>
              <View>
                <Text style={s.settingsRowLabel}>Custom Dishes</Text>
                <Text style={s.settingsRowDesc}>Dishes you've introduced</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Preferences ─────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Preferences</Text>
        </View>

        <View style={s.card}>
          <View style={s.settingsRow}>
            <View style={s.settingsRowLeft}>
              <View style={[s.rowIconWrap, { backgroundColor: '#5E5CE620' }]}>
                <Ionicons name="moon-outline" size={18} color="#5E5CE6" />
              </View>
              <Text style={s.settingsRowLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D1D6', true: '#208AEF' }}
              thumbColor={Platform.OS === 'android' ? (isDark ? '#208AEF' : '#F4F3F4') : '#fff'}
              ios_backgroundColor="#D1D1D6"
            />
          </View>
        </View>

        {/* ── Account ──────────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Account</Text>
        </View>

        <View style={s.card}>
          <TouchableOpacity style={[s.settingsRow, s.rowWithChevron]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={s.settingsRowLeft}>
              <View style={[s.rowIconWrap, { backgroundColor: '#FF3B3020' }]}>
                <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
              </View>
              <Text style={[s.settingsRowLabel, { color: '#FF3B30' }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.six }} />
      </ScrollView>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => !isSubmitting && setEditVisible(false)}
      >
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={s.modalSheet}>
              {/* Modal Header */}
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Edit Physical Info</Text>
                <TouchableOpacity
                  onPress={() => !isSubmitting && setEditVisible(false)}
                  style={s.modalCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={s.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {editError ? (
                  <View style={s.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color="#FF3B30" />
                    <Text style={s.errorText}>{editError}</Text>
                  </View>
                ) : null}

                {/* Numeric fields */}
                <Text style={s.fieldLabel}>Weight (kg)</Text>
                <TextInput
                  style={[s.textInput, { color: colors.text, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}
                  value={form.weight}
                  onChangeText={v => setForm(f => ({ ...f, weight: v }))}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 70"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={s.fieldLabel}>Height (cm)</Text>
                <TextInput
                  style={[s.textInput, { color: colors.text, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}
                  value={form.height}
                  onChangeText={v => setForm(f => ({ ...f, height: v }))}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 175"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={s.fieldLabel}>Age</Text>
                <TextInput
                  style={[s.textInput, { color: colors.text, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: isDark ? '#3A3A3C' : '#D1D1D6' }]}
                  value={form.age}
                  onChangeText={v => setForm(f => ({ ...f, age: v }))}
                  keyboardType="number-pad"
                  placeholder="e.g. 25"
                  placeholderTextColor={colors.textSecondary}
                />

                {/* Dropdowns */}
                <Text style={s.fieldLabel}>Gender</Text>
                <Dropdown
                  options={GENDER_OPTIONS}
                  value={form.sex}
                  onChange={v => setForm(f => ({ ...f, sex: v }))}
                  placeholder="Select gender"
                  colors={colors}
                  isDark={isDark}
                />

                <Text style={[s.fieldLabel, { marginTop: Spacing.three }]}>Lifestyle</Text>
                <Dropdown
                  options={LIFESTYLE_OPTIONS}
                  value={form.lifestyle}
                  onChange={v => setForm(f => ({ ...f, lifestyle: v }))}
                  placeholder="Select lifestyle"
                  colors={colors}
                  isDark={isDark}
                />

                <Text style={[s.fieldLabel, { marginTop: Spacing.three }]}>Goal</Text>
                <Dropdown
                  options={GOAL_OPTIONS}
                  value={form.goal}
                  onChange={v => setForm(f => ({ ...f, goal: v }))}
                  placeholder="Select goal"
                  colors={colors}
                  isDark={isDark}
                />

                <View style={{ height: Spacing.four }} />

                {/* Save button */}
                <TouchableOpacity
                  style={[s.saveButton, isSubmitting && s.saveButtonDisabled]}
                  onPress={handleSubmitEdit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Physical Row sub-component ───────────────────────────────────────────────

function PhysicalRow({ label, value, colors }: { label: string; value: string | null | undefined; colors: any }) {
  return (
    <View style={physRowStyles.row}>
      <Text style={[physRowStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[physRowStyles.value, { color: value ? colors.text : colors.textSecondary }]}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const physRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: { fontSize: 15 },
  value: { fontSize: 15, fontWeight: '500' },
});

// ─── Dynamic styles factory ───────────────────────────────────────────────────

function makeStyles(colors: any, isDark: boolean) {
  const cardBg = isDark ? '#1C1C1E' : '#fff';
  const cardBorder = isDark ? '#2C2C2E' : 'transparent';
  const shadow = isDark
    ? {}
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      };

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#F2F2F7',
    },
    scrollContent: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.six,
    },
    pageTitle: {
      fontSize: 30,
      fontWeight: '700',
      color: colors.text,
      marginBottom: Spacing.four,
      letterSpacing: -0.5,
    },

    // Profile card
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: Spacing.four,
      marginBottom: Spacing.four,
      borderWidth: isDark ? 1 : 0,
      borderColor: cardBorder,
      ...shadow,
    },
    avatarCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#208AEF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.three,
    },
    avatarLetter: {
      fontSize: 24,
      fontWeight: '700',
      color: '#fff',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    // Section header
    sectionHeader: {
      marginBottom: Spacing.two,
      marginTop: Spacing.two,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Generic card
    card: {
      backgroundColor: cardBg,
      borderRadius: 16,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      marginBottom: Spacing.three,
      borderWidth: isDark ? 1 : 0,
      borderColor: cardBorder,
      ...shadow,
    },

    // Edit button inside physical card
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginTop: 4,
      marginBottom: 4,
      backgroundColor: '#208AEF18',
      borderRadius: 20,
    },
    editButtonText: {
      color: '#208AEF',
      fontWeight: '600',
      fontSize: 14,
      marginLeft: 5,
    },

    physicalGrid: {
      marginTop: 4,
    },

    // Settings rows
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 52,
      paddingVertical: 4,
    },
    rowWithChevron: {
      // slightly more vertical padding for tap-friendly rows
      paddingVertical: 6,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rowIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingsRowLabel: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    settingsRowDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    rowDivider: {
      height: 1,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      marginLeft: 46,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? '#1C1C1E' : '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalBody: {
      padding: Spacing.four,
      paddingBottom: Spacing.six,
    },

    // Error banner
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF3B3015',
      borderRadius: 8,
      padding: Spacing.three,
      marginBottom: Spacing.three,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginLeft: 6,
      flex: 1,
    },

    // Form fields
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: Spacing.three,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },

    // Save button
    saveButton: {
      backgroundColor: '#208AEF',
      borderRadius: 14,
      paddingVertical: Spacing.three,
      alignItems: 'center',
      marginTop: Spacing.three,
    },
    saveButtonDisabled: {
      backgroundColor: '#90C4F7',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
}
