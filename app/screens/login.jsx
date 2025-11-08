import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { AuthContext } from '../auth/authprovider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../axios/axios';

export const Login = () => {
  const [agree, setAgree] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Validation Error', 'Email and Password are required');
    return;
  }

  try {
    const response = await axiosInstance.post('/user/login', { email, password });
    const data = response.data;

    if (response.status === 200) {
      // Save token to storage
      await AsyncStorage.setItem('token', data.token);

      // Update AuthContext
      login(data.user); // ✅ This triggers RootNavigator to switch to AppStack

      // Clear form fields
      setEmail('');
      setPassword('');

      Alert.alert('Success', 'Login successful');
      // ❌ REMOVE this block:
      // navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      //
      // ✅ RootNavigator will now automatically render <AppStack /> and show the Home tab.
    }
  } catch (error) {
    console.error('Login Error:', error);
    Alert.alert('Login Failed', error?.response?.data?.message || 'Something went wrong');
  }

  };
  return (
<View style={styles.container}>
      <LinearGradient colors={['#ff0080', '#7928ca']} style={styles.gradientBox}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
        </View>
      </LinearGradient>

      <BlurView intensity={40} tint="dark" style={styles.innerContainer}>
        <Text style={styles.subtitle}>Login with</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconBtn}><FontAwesome name="facebook" size={15} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><FontAwesome name="apple" size={15} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><FontAwesome name="google" size={15} color="#fff" /></TouchableOpacity>
        </View>

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {/* <View style={styles.checkboxContainer}>
            <Checkbox value={agree} onValueChange={setAgree} color={agree ? '#7928ca' : undefined} />
            <Text style={styles.checkboxText}>I agree to the <Text style={styles.signupText}>Terms and Conditions</Text></Text>
          </View> */}

          <TouchableOpacity disabled={!agree} onPress={handleLogin} style={styles.signupBtn}>
            <LinearGradient colors={['#ff0080', '#7928ca']} style={styles.signupGradient}>
              <Text style={styles.buttonText}>SIGN IN</Text>
            </LinearGradient>
          </TouchableOpacity>

            {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BlurView>
    </View>
  );
};


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
