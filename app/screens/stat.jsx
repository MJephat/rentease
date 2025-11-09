import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../axios/axios';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

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

  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['tenantPayments', selectedTenantId],
    queryFn: () => fetchPaymentsByTenant(selectedTenantId),
    enabled: !!selectedTenantId,
  });

  // Shimmer loader (for tenant cards)
  if (loadingTenants) {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map((i) => (
          <ShimmerPlaceholder
            key={i}
            LinearGradient={LinearGradient}
            style={styles.shimmerCard}
          />
        ))}
      </View>
    );
  }

  return (
    <ScrollView>
      {/* Tenant Cards */}
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

      {/* Payment History */}
      {selectedTenantId && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.paymentTitle}>
              Payment History for {tenants.find((t) => t._id === selectedTenantId)?.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedTenantId(null)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>

          {loadingPayments ? (
            <View style={{ padding: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <ShimmerPlaceholder
                  key={i}
                  LinearGradient={LinearGradient}
                  style={styles.shimmerRow}
                />
              ))}
            </View>
          ) : (
            <ScrollView horizontal>
              <View style={styles.table}>
                <View style={[styles.row, styles.header]}>
                  {['Month', 'Paid', 'Rent', 'Electricity', 'Water', 'Garbage', 'Balance', 'Note'].map((h, i) => (
                    <Text key={i} style={[styles.cell, styles.headerText]}>{h}</Text>
                  ))}
                </View>

                {payments.length > 0 ? (
                  payments.map((item) => {
                    const d = new Date(item.month);
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const formattedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;

                    return (
                      <View key={item._id} style={styles.row}>
                        <Text style={styles.cell}>{formattedDate}</Text>
                        <Text style={styles.cell}>{item.paidAmount}</Text>
                        <Text style={styles.cell}>{item.rentAmount}</Text>
                        <Text style={styles.cell}>{item.electricity}</Text>
                        <Text style={styles.cell}>{item.water}</Text>
                        <Text style={styles.cell}>{item.garbage}</Text>
                        <Text style={styles.cell}>{item.balance}</Text>
                        <Text style={styles.cell}>{item.note || '-'}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={{ padding: 10, color: '#888' }}>No payments found for this tenant.</Text>
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
  shimmerCard: {
    width: 160,
    height: 80,
    borderRadius: 10,
    margin: 5,
  },
  shimmerRow: {
    height: 25,
    marginVertical: 5,
    borderRadius: 6,
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
