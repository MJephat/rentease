import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { axiosInstance } from '../axios/axios';

export const PaymentForm = ({ tenantId, onClose}) => {
  const [month, setMonth] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [electricity, setElectricity] = useState('');
  const [water, setWater] = useState('');
  const [garbage, setGarbage] = useState('');
  const [type, setType] = useState('cash');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    try {
      const payload = {month, paidAmount, electricity, water, garbage, type, note,};

      const response = await axiosInstance.post(`/payment/fillPayment/${tenantId}`, payload);
      Alert.alert('Success', 'Payment submitted successfully!');
    } catch (err) {
      console.error('Error', err?.response?.data?.error || err.message);
      Alert.alert('Error', 'Sommething went wrong');
    }
    onClose();
  };

  return (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>Payment Form </Text>
      <Text style={styles.label}>Month <Text style={{color: 'red'}}>*</Text></Text>
      <TextInput style={styles.input} value={month} onChangeText={setMonth}  placeholder="e.g. Jan 2025"  placeholderTextColor={styles.placeholder.color} />

      <Text style={styles.label}>Paid Amount <Text style={{color: 'red'}}>*</Text></Text>
      <TextInput style={styles.input} value={paidAmount} onChangeText={setPaidAmount} keyboardType="numeric" placeholder='ksh.' placeholderTextColor={styles.placeholder.color} />

      <Text style={styles.label}>Electricity</Text>
      <TextInput style={styles.input} value={electricity} onChangeText={setElectricity} keyboardType="numeric" placeholder='ksh.' placeholderTextColor={styles.placeholder.color} />

      <Text style={styles.label}>Water</Text>
      <TextInput style={styles.input} value={water} onChangeText={setWater} keyboardType="numeric" placeholder='ksh.' placeholderTextColor={styles.placeholder.color} />

      <Text style={styles.label}>Garbage</Text>
      <TextInput style={styles.input} value={garbage} onChangeText={setGarbage} keyboardType="numeric" placeholder='ksh.' placeholderTextColor={styles.placeholder.color} />

      <Text style={styles.label}>Payment Type <Text style={{color: 'red'}}>*</Text></Text>
      <Picker selectedValue={type} onValueChange={setType} style={styles.picker} >
        <Picker.Item label="Cash" value="cash" />
        <Picker.Item label="Cheque" value="cheque" />
        <Picker.Item label="M-Pesa" value="Mpesa" />
      </Picker>

      <Text style={styles.label}>Note</Text>
      <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="e.g. Month of April" placeholderTextColor={styles.placeholder.color} />
    <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

    const styles = StyleSheet.create({
    container: {width: '40%', padding: 10, backgroundColor: '#fff', flex: 1, elevation: 4, height: '90%', borderRadius: 10},
    label: { marginTop: 5, fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginTop: 4 },
    picker: { marginTop: 4, borderWidth: 1, borderColor: '#ccc', color: '#666' },
    buttonRow: {flexDirection: 'row', justifyContent: 'space-between' , marginTop: 20},
    submitBtn: { backgroundColor: '#4CAF50', padding: 10,borderRadius: 6,flex: 1, marginRight: 15,},
    cancelBtn: { backgroundColor: '#F44336', padding: 10,borderRadius: 6,flex: 1},
    btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    placeholder: { color: '#666' },

});
