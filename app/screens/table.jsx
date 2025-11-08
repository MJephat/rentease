import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentForm } from '../form/payment';
import { axiosInstance } from '../axios/axios';

const fetchTenants = async () => {
  const response = await axiosInstance.get('/tenant/getAllTenants');
  // console.log("Fetched tenants:", response.data);
  return response.data.tenants;
};


export const Table = ({ showSlider = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });
  const queryClient = useQueryClient();

  const tenants = Array.isArray(data) ? data : data?.tenants || [];
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editedTenant, setEditedTenant] = useState({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const[selectedTenantId, setSelectedTenantId] = useState(null);

  const handleCloseForm = () => {
  setShowPaymentForm(false);
  setSelectedTenantId(null);
};


  const handleEdit = (item) => {
    setEditingTenantId(item._id);
    setEditedTenant(item);
  };

const handlePay = (item) => {
  setSelectedTenantId(item._id);
  setShowPaymentForm(true);
}

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/tenant/updateTenant/${editingTenantId}`, editedTenant);
      queryClient.setQueryData(['tenants'], (oldData) =>
      oldData.map(t => t._id === editingTenantId ? editedTenant : t)
    );
      Alert.alert('Success', 'Tenant updated');
      setEditingTenantId(null);
      queryClient.invalidateQueries(['tenants']);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleChange = (field, value) => {
    setEditedTenant(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (item) => {
    try {
      await axiosInstance.delete(`/tenant/deleteTenant/${item._id}`);
      queryClient.setQueryData(['tenants'], (oldData) => oldData.filter(t => t._id !== item._id));
      Alert.alert('Deleted', `${item.name} has been removed`);
    } catch (err) {
      console.error("Delete failed:", err?.response?.data || err.message);
      Alert.alert('Error', err.message);
    }
  };

  const renderCell = (item, field) =>
    editingTenantId === item._id ? (
      <TextInput
        style={[styles.cell, styles.input]}
        value={editedTenant[field]?.toString()}
        onChangeText={(val) => handleChange(field, val)}
      />
    ) : (
      <Text style={styles.cell}>{item[field]}</Text>
    );

  return (
    <ScrollView horizontal>
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          {['Tenannt ID', 'Name', 'Room', 'Rent', 'Electricity', 'Garbage', 'Water', 'Actions'].map((h, i) => (
            <Text key={i} style={[styles.cell, styles.headerText]}>{h}</Text>
          ))}
        </View>

        <FlatList
          data={tenants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {['TenantNo','name', 'room', 'rentAmount', 'electricity', 'garbage', 'water'].map((field, i) => (
                <React.Fragment key={i}>{renderCell(item, field)}</React.Fragment>
              ))}
              <View style={[styles.cell, styles.actionCell]}>
                {editingTenantId === item._id ? (
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                    <Text style={styles.btnText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(item)}>
                  <Text style={styles.btnText}>pay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.btnText}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      {showPaymentForm && (
    <View style={styles.overlay}>
    <PaymentForm tenantId={selectedTenantId} onClose={handleCloseForm} />
  </View>
)}
  </ScrollView>

  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 800,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: '#333',
    width: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 4,
  },
  header: {
    backgroundColor: '#f2f2f2',
  },
  headerText: {
    fontWeight: 'bold',
  },
  actionCell: {
    flexDirection: 'row',
    width: 140,
    justifyContent: 'space-between',
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveBtn: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtn: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payBtn:{
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
  },
  overlay: {
  position: 'absolute',
  // height: '95%',
  marginTop: 20,
  borderRadius: 8,
  top: 10,
  left: 0,
  right: 0,
  bottom: 10,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
}

});
