import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axios/axios';

const fetchTenants = async () => {
  const res = await axiosInstance.get('/tenant/getAllTenants');
  return res?.data?.tenants || [];
};

const fetchPaymentsByTenant = async (tenantId) => {
  const res = await axiosInstance.get(`/payment/getpaymentByTenantId/${tenantId}`);
  return res?.data?.payments || [];
};

export const TenantCards = () => {
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const { data: tenants = [], isLoading: loadingTenants, error: tenantError } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const {
    data: payments = [],
    isLoading: loadingPayments,
    error: paymentError,
  } = useQuery({
    queryKey: ['tenantPayments', selectedTenantId],
    queryFn: () => fetchPaymentsByTenant(selectedTenantId),
    enabled: !!selectedTenantId,
  });

  // Handle tenant loading or errors
  if (loadingTenants) return <Text>Loading tenants...</Text>;
  if (tenantError) {
    console.error('Tenant fetch error:', tenantError);
    Alert.alert('Error', 'Failed to load tenants.');
    return null;
  }

  const getSafeDate = (dateValue) => {
    try {
      if (!dateValue) return '-';
      const d = new Date(dateValue);
      if (isNaN(d)) return '-';
      return d.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
    } catch (err) {
      console.error('Date parse error:', err);
      return '-';
    }
  };

  return (
    <ScrollView>
      {/* Tenant List */}
      {!selectedTenantId && (
        <View style={styles.container}>
          {tenants.length === 0 ? (
            <Text style={{ padding: 10, color: '#888' }}>No tenants found.</Text>
          ) : (
            tenants.map((tenant) => (
              <TouchableOpacity
                key={tenant._id}
                style={styles.card}
                onPress={() => setSelectedTenantId(tenant._id)}
              >
                <Text style={styles.cardText}>{tenant.name || 'Unnamed Tenant'}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Payment Details */}
      {selectedTenantId && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.paymentTitle}>
              Payment History for{' '}
              {tenants.find((t) => t._id === selectedTenantId)?.name || 'Tenant'}
            </Text>
            <TouchableOpacity onPress={() => setSelectedTenantId(null)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {loadingPayments ? (
            <Text>Loading payments...</Text>
          ) : paymentError ? (
            <Text style={{ color: 'red' }}>Failed to load payments.</Text>
          ) : (
            <ScrollView horizontal>
              <View style={styles.table}>
                {/* Header */}
                <View style={[styles.row, styles.header]}>
                  {['Month', 'Paid', 'Rent', 'Electricity', 'Water', 'Garbage', 'Balance', 'Note'].map(
                    (h, i) => (
                      <Text key={i} style={[styles.cell, styles.headerText]}>
                        {h}
                      </Text>
                    )
                  )}
                </View>

                {/* Rows */}
                {payments.length > 0 ? (
                  payments.map((item) => (
                    <View key={item._id || Math.random().toString()} style={styles.row}>
                      <Text style={styles.cell}>{getSafeDate(item.month)}</Text>
                      <Text style={styles.cell}>{item.paidAmount ?? '-'}</Text>
                      <Text style={styles.cell}>{item.rentAmount ?? '-'}</Text>
                      <Text style={styles.cell}>{item.electricity ?? '-'}</Text>
                      <Text style={styles.cell}>{item.water ?? '-'}</Text>
                      <Text style={styles.cell}>{item.garbage ?? '-'}</Text>
                      <Text style={styles.cell}>{item.balance ?? '-'}</Text>
                      <Text style={styles.cell}>{item.note ?? '-'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ padding: 10, color: '#888' }}>No payments available.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    margin: 5,
    borderRadius: 10,
    elevation: 3,
    minWidth: 160,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: 'red',
    fontWeight: 'bold',
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 800,
    marginHorizontal: 10,
  },
  header: {
    backgroundColor: '#f2f2f2',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#333',
    width: 100,
  },
  headerText: {
    fontWeight: 'bold',
  },
});
