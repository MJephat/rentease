import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axios/axios';

const fetchTenants = async () => {
  try {
    console.log('📋 Fetching tenants...');
    const res = await axiosInstance.get('/tenant/getAllTenants');
    console.log('✅ Tenants fetched:', res?.data?.tenants?.length);
    return res?.data?.tenants || [];
  } catch (error) {
    console.error('❌ Error fetching tenants:', error);
    throw error;
  }
};

const fetchPaymentsByTenant = async (tenantId) => {
  try {
    console.log('💰 Fetching payments for tenant:', tenantId);
    const res = await axiosInstance.get(`/payment/getpaymentByTenantId/${tenantId}`);
    console.log('✅ Payments fetched:', res?.data?.payments?.length);
    return res?.data?.payments || [];
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    throw error;
  }
};

export const Stats = () => {
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const { 
    data: tenants = [], 
    isLoading: loadingTenants,
    error: tenantsError 
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const {
    data: payments = [],
    isLoading: loadingPayments,
    error: paymentsError,
  } = useQuery({
    queryKey: ['tenantPayments', selectedTenantId],
    queryFn: () => fetchPaymentsByTenant(selectedTenantId),
    enabled: !!selectedTenantId,
  });

  // Loading state
  if (loadingTenants) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tenants...</Text>
      </View>
    );
  }

  // Error state
  if (tenantsError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Error loading tenants</Text>
        <Text style={styles.errorDetail}>{tenantsError.message}</Text>
      </View>
    );
  }

  // Empty state
  if (!tenants || tenants.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tenants found</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* ✅ Tenant Cards - Using FlatList instead of ScrollView + map */}
      {!selectedTenantId && (
        <FlatList
          data={tenants}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.container}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                console.log('📌 Selected tenant:', item._id);
                setSelectedTenantId(item._id);
              }}
            >
              <Text style={styles.cardText}>{item.name || 'Unknown'}</Text>
              <Text style={styles.cardSubtext}>Tap to view payments</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ✅ Payment Table */}
      {selectedTenantId && (
        <View style={styles.paymentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.paymentTitle}>
              Payment History for {tenants.find((t) => t._id === selectedTenantId)?.name || 'Tenant'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('🔙 Closing payment view');
                setSelectedTenantId(null);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {loadingPayments ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading payments...</Text>
            </View>
          ) : paymentsError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>❌ Error loading payments</Text>
            </View>
          ) : payments.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No payment history</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.table}>
                {/* Header Row */}
                <View style={[styles.row, styles.header]}>
                  {['Month', 'Paid', 'Rent', 'Electricity', 'Water', 'Garbage', 'Balance', 'Note'].map((h, i) => (
                    <Text key={i} style={[styles.cell, styles.headerText]}>{h}</Text>
                  ))}
                </View>

                {/* Data Rows */}
                {payments.map((item, index) => (
                  <View key={item._id || index} style={styles.row}>
                    <Text style={styles.cell}>
                      {item.month 
                        ? new Date(item.month).toLocaleDateString('en-KE', { 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </Text>
                    <Text style={styles.cell}>{item.paidAmount ?? 0}</Text>
                    <Text style={styles.cell}>{item.rentAmount ?? 0}</Text>
                    <Text style={styles.cell}>{item.electricity ?? 0}</Text>
                    <Text style={styles.cell}>{item.water ?? 0}</Text>
                    <Text style={styles.cell}>{item.garbage ?? 0}</Text>
                    <Text style={styles.cell}>{item.balance ?? 0}</Text>
                    <Text style={styles.cell}>{item.note || '-'}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </View>
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
    color: '#333',
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
  closeBtn: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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