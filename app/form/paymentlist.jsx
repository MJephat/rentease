import React, { useState } from 'react';
import {View,Text,FlatList,StyleSheet,ScrollView,TouchableOpacity,Alert,TextInput,Modal} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, PermissionsAndroid } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { axiosInstance } from '../axios/axios';


const fetchPayments = async () => {
  const response = await axiosInstance.get('/payment/getAllPayments');
  return response.data?.payments || [];
};

const getStatusMeta = (balance) => {
  const isPaid = balance <= 0;
  return {
    label: isPaid ? 'paid' : 'pending',
    style: {
      color: isPaid ? 'green' : 'orange',
      fontWeight: 'bold',
    },
  };
};

export const PaymentList = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleShowReceipt = (payment) => {
    setSelectedReceipt(payment);
  };

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to download the receipt.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const generateReceiptPDF = async (payment) => {
  const html = `
    <h1>Payment Receipt</h1>
    <p>Tenant: ${payment.tenant?.name}</p>
    <p>Month: ${new Date(payment.month).toLocaleDateString()}</p>
    <p>Paid: Ksh ${payment.paidAmount}</p>
    <p>Rent: Ksh ${payment.rentAmount}</p>
    <p>Electricity: Ksh ${payment.electricity}</p>
    <p>Water: Ksh ${payment.water}</p>
    <p>Garbage: Ksh ${payment.garbage}</p>
    <p>Balance: Ksh ${payment.balance}</p>
  `;

  try {
    const options = {
  html: '<h1>Receipt</h1>',
  fileName: 'receipt',
  base64: true,
  directory: 'Documents', // or leave empty to use app cache
  };

  const file = await RNHTMLtoPDF.convert(options);
  console.log(file.filePath); // path to saved PDF

   Alert.alert('Receipt Saved', `Saved to ${file.filePath}`);

    // Optional: Open it with FileViewer
    await FileViewer.open(file.filePath);
  } catch (err) {
    console.error('PDF Error:', err);
    Alert.alert('Error', 'Failed to generate receipt');
  }
};




  const { data, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });

  const handleDownload = async (payment) => {
    const balanceLabel = payment.balance < 0 ? 'Overpaid' : 'Balance';
    const balanceStyle = payment.balance < 0 ? 'color: green;' : 'color: red;';
    const formattedBalance = Math.abs(payment.balance).toLocaleString();

const html = `
  <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          font-size: 24px;
          color: #4CAF50;
        }
        .info {
          margin-bottom: 20px;
        }
        .info p {
          font-size: 16px;
          margin: 4px 0;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        .table th {
          background-color: #f2f2f2;
        }
        .total {
          font-weight: bold;
          color: #e74c3c;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Receipt</h1>
        <p><em>${new Date().toLocaleString()}</em></p>
      </div>

      <div class="info">
        <p><strong>Tenant:</strong> ${payment.tenant?.name}</p>
        <p><strong>Month:</strong> ${new Date(payment.month).toLocaleDateString()}</p>
      </div>

      <table class="table">
        <tr><th>Item</th><th>Amount (Ksh)</th></tr>
        <tr><td>Paid</td><td>${payment.paidAmount.toLocaleString()}</td></tr>
        <tr><td>Rent</td><td>${payment.rentAmount.toLocaleString()}</td></tr>
        <tr><td>Electricity</td><td>${payment.electricity.toLocaleString()}</td></tr>
        <tr><td>Water</td><td>${payment.water.toLocaleString() }</td></tr>
        <tr><td>Garbage</td><td>${payment.garbage.toLocaleString()}</td></tr>
        <tr><td>Signitory</td><td>${payment.signitory?.name}</td></tr>
         <tr>
          <td class="total">${balanceLabel}</td>
          <td class="total" style="${balanceStyle}">${formattedBalance}</td>
        </tr>
      </table>
    </body>
  </html>
`;


  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri); // Opens sharing/download options
};
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/payment/deletePayment/${id}`);
      Alert.alert('Deleted', 'Payment removed');
      queryClient.invalidateQueries(['payments']);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
        paidAmount: item.paidAmount?.toString() ?? '0',
        rentAmount: item.rentAmount?.toString() ?? '0',
        electricity: item.electricity?.toString() ?? '0',
        water: item.water?.toString() ?? '0',
        garbage: item.garbage?.toString() ?? '0',
        note: item.note || '',
        type: item.type || '',
    });
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`/payment/updateTenantPayment/${editingId}`, {
        paidAmount: Number(editForm.paidAmount),
        rentAmount: Number(editForm.rentAmount),
        electricity: Number(editForm.electricity),
        water: Number(editForm.water),
        garbage: Number(editForm.garbage),
        note: editForm.note,
        type: editForm.type,
      });
      Alert.alert('Updated', 'Payment updated successfully');
      setEditingId(null);
      queryClient.invalidateQueries(['payments']);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Update failed');
    }
  };

  if (isLoading) return <Text>Loading payments...</Text>;
  if (error) return <Text>Failed to load payments</Text>;

  return (
    <ScrollView horizontal>
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          {[
            'Tenant', 'Month', 'Paid', 'Rent', 'Electricity',
            'Water', 'Garbage', 'Type', 'Note', 'Status',
            'Balance', 'Signitory', 'Actions',
          ].map((h, i) => (
            <Text key={i} style={[styles.cell, styles.headerText]}>{h}</Text>
          ))}
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isEditing = editingId === item._id;
            const { label, style: statusStyle } = getStatusMeta(item.balance);

            return (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.tenant?.name}</Text>
                <Text style={styles.cell}>
                  {new Date(item.month).toLocaleDateString('en-KE', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>

                {['paidAmount', 'rentAmount', 'electricity', 'water', 'garbage', 'type', 'note'].map((field, i) => (
                  <View key={i} style={styles.cell}>
                    {isEditing ? (
                      <TextInput
                        style={styles.input}
                        value={editForm[field]}
                        onChangeText={(val) =>
                          setEditForm((prev) => ({ ...prev, [field]: val }))
                        }
                      />
                    ) : (
                      <Text>{item[field]}</Text>
                    )}
                  </View>
                ))}

                <Text style={[styles.cell, statusStyle]}>{label}</Text>
                <Text style={styles.cell}>{item.balance}</Text>
                <Text style={styles.cell}>{item.signitory?.name}</Text>

                <View style={[styles.cell, styles.actionCell]}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity style={styles.editBtn} onPress={handleUpdate}>
                        <Text style={styles.btnText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setEditingId(null)}>
                        <Text style={styles.btnText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.receiptBtn} onPress={() => handleShowReceipt(item)}>
                        <Text style={styles.btnText}>Rec</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                        <Text style={styles.btnText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                        <Text style={styles.btnText}>Del</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
        {selectedReceipt && (
          <Modal
            visible={true}
            animationType="slide"
            onRequestClose={() => setSelectedReceipt(null)}
            transparent
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.receiptTitle}>Receipt</Text>
                <Text>Tenant: {selectedReceipt.tenant?.name}</Text>
                <Text>Month: {new Date(selectedReceipt.month).toLocaleDateString()}</Text>
                <Text>Paid: Ksh {selectedReceipt.paidAmount}</Text>
                <Text>Rent: Ksh {selectedReceipt.rentAmount}</Text>
                <Text>Electricity: Ksh {selectedReceipt.electricity}</Text>
                <Text>Water: Ksh {selectedReceipt.water}</Text>
                <Text>Garbage: Ksh {selectedReceipt.garbage}</Text>
                <Text>Balance: Ksh {selectedReceipt.balance}</Text>

                <TouchableOpacity onPress={() => setSelectedReceipt(null)} style={styles.closeBtn}>
                  <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(selectedReceipt)}>
                    <Text style={styles.btnText}>Download & Share</Text>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>
        )}

      </View>
    </ScrollView>
  );
};

// export default PaymentList;

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 800,
  },
  header: {
    backgroundColor: '#f2f2f2',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    padding: 8,
    width: 100,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    fontSize: 12,
  },
  actionCell: {
    flexDirection: 'row',
    gap: 4,
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    padding: 4,
    borderRadius: 4,
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    padding: 4,
    borderRadius: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
  },
  receiptBtn: {
  backgroundColor: '#2196F3',
  padding: 4,
  borderRadius: 4,
  // marginTop: 4,
},
closeBtn: {
  marginTop: 20,
  backgroundColor: '#f44336',
  padding: 10,
  borderRadius: 6,
  width: '100%',
  alignItems: 'center',
},
downloadBtn: {
  marginTop: 10,
  backgroundColor: '#4CAF50',
  padding: 10,
  borderRadius: 6,
  width: '100%',
  alignItems: 'center',
},
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
modalContent: {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  width: '90%',
},
receiptTitle: {
  alignItems: 'center',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

});
