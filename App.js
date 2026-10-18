import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INITIAL_STATE = {
  appTitle: 'মাদরাসাতুল মাদিনাহ ইআরপি',
  subtitle: 'সমন্বিত দ্বীনি ও আধুনিক শিক্ষাব্যবস্থাপনা',
  students: [
    { id: 'MM-101', name: 'আব্দুল্লাহ বিন উমর', class: 'হিফজুল কুরআন', roll: '০১', guardianUser: 'guardian1', bloodGroup: 'A+', feeDue: '০/-', todayAttendance: 'উপস্থিত', sabaq: 'পারা ২৯ (সূরা আল-মুলক)', manzil: 'পারা ১-৫' },
    { id: 'MM-102', name: 'মুহাম্মদ তালহা', class: 'মাদানি নিসাব (১ম বর্ষ)', roll: '০৫', guardianUser: 'guardian2', bloodGroup: 'B+', feeDue: '৫০০/-', todayAttendance: 'উপস্থিত', sabaq: 'মিযানুছ ছরফ (পৃষ্ঠা ১২)', manzil: 'নাহবে মীর' }
  ],
  notices: [
    { id: 1, title: 'রমাদানুল মুবারকের ছুটি ও সাময়িক রুটিন', date: '২০২৬-০৩-১০' },
    { id: 2, title: 'মাসিক সবক শোনানি ও তারবিয়াত পর্যালোচনা', date: '২০২৬-০৩-০৫' }
  ]
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [appData, setAppData] = useState(INITIAL_STATE);
  const [editingField, setEditingField] = useState(null);
  const [tempEditText, setTempEditText] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('@madrasah_erp_data');
      if (savedData) setAppData(JSON.parse(savedData));
    } catch (e) {
      console.error(e);
    }
  };

  const persistData = async (newData) => {
    try {
      setAppData(newData);
      await AsyncStorage.setItem('@madrasah_erp_data', JSON.stringify(newData));
    } catch (e) {
      Alert.alert('ত্রুটি', 'ডেটা সেভ করা যায়নি।');
    }
  };

  const handleLogin = () => {
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (user === 'admin' && pass === '1234') {
      setCurrentUser({ username: 'admin', role: 'ADMIN', name: 'মুহতামিম / প্রধান অ্যাডমিন' });
    } else if (user === 'ustadh' && pass === '1234') {
      setCurrentUser({ username: 'ustadh', role: 'TEACHER', name: 'মাওলানা মাহমুদ হাসান (উস্তাদ)' });
    } else if (user === 'guardian' && pass === '1234') {
      setCurrentUser({ username: 'guardian1', role: 'GUARDIAN', name: 'জনাব আব্দুর রহমান (অভিভাবক)' });
    } else {
      Alert.alert('প্রবেশাধিকার ব্যর্থ', 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়। মাদরাসা কর্তৃপক্ষ থেকে সংগৃহীত তথ্য দিন।');
      return;
    }
    setUsernameInput('');
    setPasswordInput('');
  };

  const openEditor = (fieldKey, currentValue) => {
    setEditingField(fieldKey);
    setTempEditText(currentValue);
    setIsEditModalVisible(true);
  };

  const saveEditedText = () => {
    if (editingField) {
      const updated = { ...appData, [editingField]: tempEditText };
      persistData(updated);
      setIsEditModalVisible(false);
      setEditingField(null);
    }
  };

  const toggleAttendance = (studentId) => {
    const updatedStudents = appData.students.map(std => {
      if (std.id === studentId) {
        return {
          ...std,
          todayAttendance: std.todayAttendance === 'উপস্থিত' ? 'অনুপস্থিত' : 'উপস্থিত'
        };
      }
      return std;
    });
    persistData({ ...appData, students: updatedStudents });
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1B4D3E" />
        <View style={styles.loginWrapper}>
          <View style={styles.crescentLogo}>
            <Text style={styles.crescentText}>☪</Text>
          </View>
          <Text style={styles.headerTitle}>{appData.appTitle}</Text>
          <Text style={styles.headerSubtitle}>{appData.subtitle}</Text>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>লগইন পোর্টাল</Text>
            
            <Text style={styles.fieldLabel}>ইউজারনেম / আইডি</Text>
            <TextInput
              style={styles.input}
              placeholder="আইডি নম্বর দিন"
              placeholderTextColor="#888"
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>পাসওয়ার্ড</Text>
            <TextInput
              style={styles.input}
              placeholder="পাসওয়ার্ড দিন"
              placeholderTextColor="#888"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>প্রবেশ করুন</Text>
            </TouchableOpacity>

            <View style={styles.securityNotice}>
              <Text style={styles.securityText}>
                🔐 স্বয়ংক্রিয় একাউন্ট তৈরি সম্পূর্ণ নিষিদ্ধ। আইডি ও পাসওয়ার্ডের জন্য মাদরাসার কেন্দ্রীয় দফতরে যোগাযোগ করুন।
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4D3E" />
      
      <View style={styles.topBar}>
        <View style={styles.flexRow}>
          <Text style={styles.topBarTitle}>{appData.appTitle}</Text>
          {currentUser.role === 'ADMIN' && (
            <TouchableOpacity onPress={() => openEditor('appTitle', appData.appTitle)}>
              <Text style={styles.editIcon}> ✎</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setCurrentUser(null)}>
          <Text style={styles.logoutBtnText}>লগআউট</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <View style={styles.userBadge}>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userRole}>
            ভূমিকা: {currentUser.role === 'ADMIN' ? 'সার্বিক নিয়ন্ত্রক (Admin)' : currentUser.role === 'TEACHER' ? 'শিক্ষক (Ustadh)' : 'অভিভাবক (Guardian)'}
          </Text>
        </View>

        {currentUser.role === 'ADMIN' && (
          <View>
            <Text style={styles.sectionHeader}>🏛️ কোর অ্যাডমিনিস্ট্রেশন (মডিউল ০১-০৩)</Text>
            <View style={styles.gridRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>মোট শিক্ষার্থী</Text>
                <Text style={styles.metricValue}>১২০ জন</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>দৈনিক ফি আদায়</Text>
                <Text style={styles.metricValue}>১৪,৫০০/-</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>📑 আর্থিক ও প্রাতিষ্ঠানিক খতিয়ান (মডিউল ২১-২৩)</Text>
            <View style={styles.card}>
              <Text style={styles.infoRowText}>• সাধারণ ক্যাশব্যালেন্স: ১,৮২,৪০০/-</Text>
              <Text style={styles.infoRowText}>• লিল্লাহ বোর্ডিং ও যাকাত ফান্ড: ৯৫,০০০/-</Text>
              <Text style={styles.infoRowText}>• মোট বকেয়া ফি: ৩৮,৫০০/-</Text>
            </View>
          </View>
        )}

        {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
          <View>
            <Text style={styles.sectionHeader}>⏱️ দরস হাজিরা ও দৈনিক সবক (মডিউল ০৬, ০৮, ০৯)</Text>
            {appData.students.map(std => (
              <View key={std.id} style={styles.card}>
                <View style={styles.studentCardHeader}>
                  <Text style={styles.studentName}>{std.name} (রোল: {std.roll})</Text>
                  <TouchableOpacity
                    style={[styles.attendanceBadge, std.todayAttendance === 'উপস্থিত' ? styles.bgGreen : styles.bgRed]}
                    onPress={() => toggleAttendance(std.id)}
                  >
                    <Text style={styles.attendanceText}>{std.todayAttendance}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.smallDetail}>বিভাগ: {std.class} | আইডি: {std.id}</Text>
                <Text style={styles.sabaqText}>📖 সবক: {std.sabaq}</Text>
                <Text style={styles.sabaqText}>🔄 মানজিল/দোর: {std.manzil}</Text>
              </View>
            ))}
          </View>
        )}

        {currentUser.role === 'GUARDIAN' && (
          <View>
            <Text style={styles.sectionHeader}>🏠 সন্তানের তথ্য ও অগ্রগতি (মডিউল ০৪, ০৫, ১৩, ২১)</Text>
            {appData.students
              .filter(std => std.guardianUser === currentUser.username)
              .map(std => (
                <View key={std.id} style={styles.card}>
                  <Text style={styles.studentName}>{std.name}</Text>
                  <Text style={styles.smallDetail}>শ্রেণি: {std.class} | আইডি: {std.id}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.infoRowText}>⏱️ আজকের উপস্থিতি: {std.todayAttendance}</Text>
                  <Text style={styles.infoRowText}>📖 বর্তমান সবক: {std.sabaq}</Text>
                  <Text style={styles.infoRowText}>🔄 রিভিশন/মানজিল: {std.manzil}</Text>
                  <Text style={styles.infoRowText}>💳 বকেয়া পাওনা: {std.feeDue}</Text>
                  <Text style={styles.infoRowText}>🩺 রক্তের গ্রুপ: {std.bloodGroup} (সুরক্ষিত ডেটা)</Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.sectionHeader}>📢 কেন্দ্রীয় নোটিশ বোর্ড (মডিউল ২৫)</Text>
        {appData.notices.map(notice => (
          <View key={notice.id} style={styles.noticeCard}>
            <Text style={styles.noticeDate}>📅 {notice.date}</Text>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>তথ্য পরিবর্তন করুন (Admin Live Sync)</Text>
            <TextInput
              style={styles.modalInput}
              value={tempEditText}
              onChangeText={setTempEditText}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.modalBtnText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEditedText}>
                <Text style={styles.modalBtnText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F5' },
  loginWrapper: { flex: 1, justifyContent: 'center', padding: 20 },
  crescentLogo: {
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  crescentText: { fontSize: 32, color: '#C5A059' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1B4D3E', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 25 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  cardHeader: { fontSize: 16, fontWeight: 'bold', color: '#1B4D3E', marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: '#333', marginBottom: 5, fontWeight: '600' },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    marginBottom: 12
  },
  primaryButton: {
    backgroundColor: '#1B4D3E',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6
  },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  securityNotice: { marginTop: 15, padding: 8, backgroundColor: '#FEF3C7', borderRadius: 4 },
  securityText: { fontSize: 11, color: '#92400E', textAlign: 'center', lineHeight: 16 },
  topBar: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topBarTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  editIcon: { color: '#C5A059', fontSize: 16 },
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { backgroundColor: '#B91C1C', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  logoutBtnText: { color: '#FFF', fontSize: 12 },
  scrollArea: { padding: 14 },
  userBadge: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#1B4D3E'
  },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#1B4D3E' },
  userRole: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#1B4D3E', marginVertical: 8 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricCard: {
    backgroundColor: '#FFF',
    width: '48%',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  metricLabel: { fontSize: 12, color: '#666' },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#1B4D3E', marginTop: 4 },
  studentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  smallDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  attendanceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  attendanceText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  bgGreen: { backgroundColor: '#10B981' },
  bgRed: { backgroundColor: '#EF4444' },
  sabaqText: { fontSize: 13, color: '#374151', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  infoRowText: { fontSize: 13, color: '#374151', marginBottom: 4 },
  noticeCard: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#C5A059',
    marginBottom: 8
  },
  noticeDate: { fontSize: 10, color: '#888' },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 8, padding: 18 },
  modalTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#1B4D3E' },
  modalInput: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 14 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelBtn: { padding: 10, marginRight: 10 },
  modalSaveBtn: { backgroundColor: '#1B4D3E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  modalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});
    
