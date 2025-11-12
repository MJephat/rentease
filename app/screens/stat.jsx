import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axios/axios';
import log from "../logger";

const fetchTenants = async () => {
  try {
    log.info('📋 Fetching tenants...');
    const res = await axiosInstance.get('/tenant/getAllTenants');
    log.info('✅ Tenants fetched:', res?.data?.tenants?.length || 0);
    return res?.data?.tenants || [];
  } catch (error) {
    log.info('❌ Error fetching tenants:', error);
    throw error;
  }
};

const fetchPaymentsByTenant = async (tenantId) => {
  if (!tenantId) return [];
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

export const TenantCards = () => {
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const { data: tenants, isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const {
    data: payments,
    isLoading: loadingPayments,
  } = useQuery({
    queryKey: ['tenantPayments', selectedTenantId],
    queryFn: () => fetchPaymentsByTenant(selectedTenantId),
    enabled: !!selectedTenantId, // Only fetch when tenant is selected
  });

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
              <Text style={styles.closeBtn}>Close</Text>
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
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#cfccccff',
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
    backgroundColor: '#e9e3e3ff',
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
