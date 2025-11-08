import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { LineChart,BarChart, ProgressChart } from 'react-native-chart-kit';
import { axiosInstance } from '../axios/axios';

const screenWidth = Dimensions.get('window').width;


const fetchPaymentData = async () => {
  try {
    const response = await axiosInstance.get('/payment/getAllPayments');
    return response.data;
  } catch (err) {
    console.error("Fetch payment failed:", err?.response?.data || err.message);
    throw err; // Let React Query handle it
  }
  }
  

const fetchTenant = async () => {
  try {
    const response = await axiosInstance.get('/tenant/getAllTenants');
    return response.data;
  } catch (err) {
    console.error( err.message);
    throw err; // Let React Query handle it
  }
};

const fetchSummary = async () => {
  try {
    const response = await axiosInstance.get('/payment/summary');
    // console.log("Summary response:", response);
    return response.data?.data || [];
  } catch (err) {
    console.log("Fetch summary failed:", err?.response?.data || err.message);
    throw err; // Let React Query handle it
  }
}


export const Home = () => {
  const queryClient = useQueryClient();
  const { data: paymentData, isLoading:isPaymentLoading, error: paymentError } = useQuery({
    queryKey: ['paymentData'],
    queryFn: fetchPaymentData,
  });

  const { data: tenantData, isLoading: isTenantLoading, error: tenantError } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenant,
  });

  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useQuery({
    queryKey: ['summaryData'],
    queryFn: fetchSummary,
  });
      
    // const tenants = Array.isArray(tenantData?.tenants) ? tenantData.tenants : [];
    // const payments = Array.isArray(paymentData?.payments) ? paymentData.payments : [];
    // const summary = Array.isArray(summaryData) ? summaryData : [];

  const tenants = Array.isArray(tenantData) ? tenantData: tenantData?.tenants || [];
  const payments = Array.isArray(paymentData) ? paymentData: paymentData?.payments || [];
  const summary = Array.isArray(summaryData) ? summaryData : [];


  if (isPaymentLoading || isTenantLoading || isSummaryLoading) return <Text>Loading...</Text>;
  if (paymentError || tenantError || summaryError) {
    const error = paymentError?.message || tenantError?.message || summaryError?.message || 'An Unknown Error Occurred';
    return <Text>Error: {error.message}</Text>;
  }

  // const payments = data?.payments || [];
  const safeNumber = (val) => typeof val === 'number' && isFinite(val) ? val : 0;

  const totalPaid = safeNumber(payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0));
  const electricity = safeNumber(payments.reduce((sum, p) => sum + (p.electricity || 0), 0));
  const water = safeNumber(payments.reduce((sum, p) => sum + (p.water || 0), 0));
  const garbage = safeNumber(payments.reduce((sum, p) => sum + (p.garbage || 0), 0));
  const Balance = safeNumber(payments.reduce((sum, p) => sum + (p.balance || 0), 0));

  const lineData = {
    labels: summary.map(item => item.month),
    datasets: [
      {
        data: summary.map(item => safeNumber(item.totalPaidAmount)),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: summary.map(item => safeNumber(item.totalElectricity)),
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: summary.map(item => safeNumber(item.totalBalance)),
        color: (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
        strokeWidth: 2,
      },
      {
      data: summary.map(item => safeNumber(item.totalWater)),
      color: (opacity = 1) => `rgba(75, 192, 12, ${opacity})`,
      strokeWidth: 2,
      },
      {
      data: summary.map(item => safeNumber(item.totalGarbage)),
      color: (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
      strokeWidth: 2,
      }
    ],
    legend: ['Total', 'Stima', 'Bal', 'H2O', 'Taka'],
  }


const total = totalPaid + electricity + water + garbage + Balance;

const progressData = {
  labels: ['Rent', 'Bills' , 'Water', 'Garbage'],
  data: total > 0
    ? [
        safeNumber(totalPaid / total),
        safeNumber(electricity / total),
        safeNumber(water / total),
        safeNumber(garbage / total),
      ]
    : [0, 0], // fallback if total is 0
};



  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tenants</Text>
          <Text style={styles.cardValue}>{tenants?.length || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Paid</Text>
          <Text style={styles.cardValue}>Ksh. {(Number(totalPaid || 0)).toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Electricity Bill</Text>
          <Text style={styles.cardValue}>Ksh. {electricity?.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={styles.cardValue}>Ksh. {Balance.toFixed(2)}</Text>
        </View>
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Water</Text>
          <Text style={styles.cardValue}>Ksh. {water?.toFixed(2)}</Text>
        </View>
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Garbage</Text>
          <Text style={styles.cardValue}>Ksh. {garbage?.toFixed(2)}</Text>
        </View>    
      </View>

      <Text style={styles.chartTitle}>Monthly Report {new Date().getFullYear()}</Text>
        {summary.length === 0 ? (
          <Text style={{ color: 'white', marginBottom: 20 }}>No monthly data available yet.</Text>
        ) : (
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        )}

        <Text style={styles.chartTitle}>Expense Distribution</Text>
        {total === 0 ? (
          <Text style={{ color: 'white', marginBottom: 20 }}>No expenses available.</Text>
        ) : (
          <ProgressChart
            data={progressData}
            width={screenWidth - 32}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chart}
          />
        )}

    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  
  labelColor: () => '#000',
  style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: 'silver', padding: 16 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: '48%', backgroundColor: '#f2f2f2', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontSize: 14, color: '#666' },
  cardHead: { fontSize: 1, color: 'white', marginBottom: 4 },
  cardValue: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  chartTitle: { fontSize: 16, marginVertical: 8, fontWeight: '600', color: '#fff' },
  chart: { borderRadius: 12, marginBottom: 24 },
});