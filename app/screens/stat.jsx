import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
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

export const Stats = () => {
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const { data: tenantResponse = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const tenants = Array.isArray(tenantResponse) ? tenantResponse : tenantResponse?.tenants || [];

  const {data: payments = [],
    isLoading: loadingPayments,
  } = useQuery({
    queryKey: ['tenantPayments', selectedTenantId],
    queryFn: () => fetchPaymentsByTenant(selectedTenantId),
    enabled: !!selectedTenantId, // Only fetch when tenant is selected
  });

  // Loading state
   if (loadingTenants) return <Text>Loading tenants...</Text>;

  return (
    <ScrollView>
      {/* ✅ Tenant Cards */}
      {!selectedTenantId && (
        <View style={styles.container}>
          {tenants.map((tenant) => (
            <TouchableOpacity
              key={tenant._id}
              style={styles.card}
              onPress={() => setSelectedTenantId(tenant._id)}
            >
              <Text style={styles.cardText}>{tenant.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ✅ Payment Table */}
      {selectedTenantId && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.paymentTitle}>Payment History for {tenants.find((t) => t._id === selectedTenantId)?.name}</Text>
            <TouchableOpacity onPress={() => setSelectedTenantId(null)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

       {loadingPayments ? (
            <Text>Loading payments...</Text>
          ) : (
            <ScrollView horizontal>
              <View style={styles.table}>
                <View style={[styles.row, styles.header]}>
                  {['Month', 'Paid', 'Rent', 'Electricity', 'Water', 'Garbage', 'Balance', 'Note'].map((h, i) => (
                    <Text key={i} style={[styles.cell, styles.headerText]}>{h}</Text>
                  ))}
                </View>

                {/* Data Rows */}
           <FlatList
                  data={payments}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      <Text style={styles.cell}>
                        {new Date(item.month).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                      </Text>
                      <Text style={styles.cell}>{item.paidAmount}</Text>
                      <Text style={styles.cell}>{item.rentAmount}</Text>
                      <Text style={styles.cell}>{item.electricity}</Text>
                      <Text style={styles.cell}>{item.water}</Text>
                      <Text style={styles.cell}>{item.garbage}</Text>
                      <Text style={styles.cell}>{item.balance}</Text>
                      <Text style={styles.cell}>{item.note}</Text>
                    </View>
                  )}
                />
               </View>
            </ScrollView>
          )}
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    margin: 5,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    minWidth: 150,
    maxWidth: '48%',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e2c2cff',
    textAlign: 'center',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  paymentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 5,
  },
 closeButton: {
    color: 'red',
    fontWeight: 'bold',
    padding: 6,
    backgroundColor: '#e9e3e3ff',
    borderRadius: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 800,
    margin: 10,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#e8e8e8',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});