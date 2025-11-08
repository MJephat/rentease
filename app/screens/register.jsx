import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet,Platform, ScrollView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { axiosInstance } from '../axios/axios';

export const Register = () => {
    const [isChecked, setIsChecked] = useState(false);

    const [role, setRole] = useState('landlord');
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [confirmPassword, setConfirmPassword] = useState('');
    const [properties, setProperties] = useState([]);
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

const handleRegister = async (e) => {
  e.preventDefault();

  if (
    !name || !email || !password || !role ||
    (role === 'landlord' && (!location || !address || !phone || !properties))
  ) {
    alert('All fields are required');
    return;
  }

  try {
    const response = await axiosInstance.post('/user/signup', {
      name,
      email,
      password,
      role,
      properties,
      location,
      address,
      phone,
    });

    if (response.status === 201 || response.status === 200) {
      alert('Registration complete');
      navigation.navigate('Login');
    } else {
      alert(response.data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert(error.response?.data?.message || 'Something went wrong');
  }
};
  return (
   <View style={styles.container}>
      <LinearGradient colors={['#ff0080', '#7928ca']} style={styles.gradientBox}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
        </View>
      </LinearGradient>

      
        <BlurView  intensity={40} tint="dark" style={styles.innerContainer}>
            <Text style={styles.subtitle}>Register with</Text>

            <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconBtn}>
                <FontAwesome name="facebook" size={15} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
                <FontAwesome name="apple" size={15} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
                <FontAwesome name="google" size={15} color="#fff" />
            </TouchableOpacity>
            </View>


        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <TextInput placeholder="Name" style={styles.input} placeholderTextColor="#ccc" autoCapitalize="none" onChangeText={setName} value={name} />
            <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#ccc" keyboardType="email-address" onChangeText={setEmail} value={email} />
            <TextInput placeholder="Password" style={styles.input} placeholderTextColor="#ccc" secureTextEntry onChangeText={setPassword} value={password} />
            <Text style={styles.label}>Select Role:</Text>
            <Picker onValueChange={(itemValue) => setRole(itemValue)} selectedValue={role} style={styles.input}>
                <Picker.Item label="Landlord" value="landlord" />
                <Picker.Item label="Admin" value="admin" />
            </Picker>

          {role === 'landlord' && (
            <>
              <TextInput placeholder="Property Name" style={styles.input} placeholderTextColor="#ccc" onChangeText={setProperties} value={properties} />
              <TextInput placeholder="Location" style={styles.input} placeholderTextColor="#ccc" onChangeText={setLocation} value={location} />
              <TextInput placeholder="Address" style={styles.input} placeholderTextColor="#ccc" onChangeText={setAddress} value={address} />
              <TextInput placeholder="Phone" style={styles.input} placeholderTextColor="#ccc" onChangeText={setPhone} value={phone} />
            </>
          )}

        <View style={styles.checkboxContainer}>
            <Checkbox value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#7928ca' : undefined} />
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.termsText}>Terms and Conditions</Text>
            </Text>
          </View>

          <TouchableOpacity disabled={!isChecked} onPress={handleRegister} style={styles.signupBtn}>
            <LinearGradient colors={['#ff0080', '#7928ca']} style={styles.signupGradient}>
              <Text style={styles.signupText}>SIGN UP</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>Login</Text>
                </TouchableOpacity>
              </View>
        </ScrollView>
        </BlurView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292c3e',
  },
  header: {
    padding: 70,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBox: {
    borderRadius: 30,
    padding: 2,
  },
  innerContainer: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 20,
    marginHorizontal: 10,
    flex: 1,
},
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent:'center',
    marginBottom: 10,
    gap: 10,
  },
  iconBtn: {
    backgroundColor: '#292c3e',
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 10,
  },
separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    },
  orText: {
    color: '#aaa',
    marginVertical: 15,
  },
  line:{
    flex: 1,
    height: 1,
    backgroundColor: '#444',
  },
  input: {
    backgroundColor: '#292c3e',
    color: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkboxText: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 10,
  },
  termsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupBtn: {
    width: '100%',
    marginBottom:20,
  },
  signupGradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#ccc',
  },
   registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#ccc',
    fontSize: 14,
  },
  registerLink: {
    color: '#ff0080',
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#ccc',
  },
  form:{
    flex: 1,
  }
});
