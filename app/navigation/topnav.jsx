import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { AuthContext } from '../auth/authprovider';
import { useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../axios/axios';

export const TopNav = () => {
  const [showForm, setShowForm] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    room: '',
    rentAmount: '',
    garbage: '',
    water: '',
    entryDate: '',
  });

  const queryClient = useQueryClient();
  const { logout, user } = useContext(AuthContext);

  const hour = new Date().getHours();
  let greeting = 'Good Morning';

  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17) {
    greeting = 'Good Evening';
  }

  const handleConfirmDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    setForm({ ...form, entryDate: formattedDate });
    setDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    try {
      // Optional: simple validation
      if (!form.name || !form.email || !form.phone) {
        alert('Name, Email, and Phone are required');
        return;
      }

      const res = await axiosInstance.post('/tenant/addTenant', form);

      console.log('Tenant added:', res.data);
      alert('Tenant added successfully!');
      setShowForm(false);
      setForm({
        name: '',
        email: '',
        address: '',
        phone: '',
        room: '',
        rentAmount: '',
        garbage: '',
        water: '',
        entryDate: '',
      });
      
      await queryClient.invalidateQueries(['tenants']); // Fixed to match your queryKey
    } catch (error) {
      console.error('Error adding tenant:', error.response?.data || error.message);
      alert('Failed to add tenant');
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#ff0080', '#7928ca']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.leftContent}>
          <Text style={styles.title}>
            <Text style={styles.greeting}>{greeting} {user?.name}</Text> 
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addIcon}>
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
          <Ionicons name="exit-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tenant</Text>
            <ScrollView>
              {Object.keys(form).map((key) => {
                // Special handling for entryDate
                if (key === 'entryDate') {
                  return (
                    <View key={key}>
                      <TouchableOpacity
                        onPress={() => setDatePickerVisibility(true)}
                        style={styles.datePickerButton}
                      >
                        <Text style={form.entryDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                          {form.entryDate || 'Select Entry Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                      </TouchableOpacity>

                      <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={() => setDatePickerVisibility(false)}
                        maximumDate={new Date()} // Optional: prevent future dates
                      />
                    </View>
                  );
                }

                // Regular text inputs for other fields
                return (
                  <TextInput
                    key={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    placeholderTextColor={styles.placeholder.color}
                    value={form[key]}
                    onChangeText={(text) => setForm({ ...form, [key]: text })}
                    style={styles.input}
                    keyboardType={
                      key === 'rentAmount' || key === 'water' || key === 'garbage' 
                        ? 'numeric' 
                        : key === 'email'
                        ? 'email-address'
                        : key === 'phone'
                        ? 'phone-pad'
                        : 'default'
                    }
                  />
                );
              })}

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                  <Text style={styles.btnText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setShowForm(false);
                    setDatePickerVisibility(false);
                  }} 
                  style={[styles.submitBtn, styles.cancelBtn]}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 15,
  },
  placeholder: {
   // fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  logoutIcon: {
    padding: 8,
    borderRadius: 20,
  },
  addIcon: {
    padding: 8,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    color: '#333',
    fontSize: 14,
  },
  datePickerPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  cancelBtn: {
    backgroundColor: '#f44336',
    marginRight: 0,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});