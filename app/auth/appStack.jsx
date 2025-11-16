import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from '../screens/home';
import {  TopNav } from '../navigation/topnav';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../screens/profile';
import { Table } from '../screens/table';
import  { Stats }  from '../screens/stat';
import { PaymentList } from '../form/paymentlist';


const Stack = createBottomTabNavigator();


export const AppStack = () => {
  return (
    <>
      <TopNav /> {/* ✅ Always shown at top of protected screens */}

      <Stack.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#ff0080',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
 
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Table'){
              iconName = focused ? 'grid' : 'grid-outline';
            }else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }else if (route.name === 'Payment') {
              iconName = focused ? 'cash' : 'cash-outline';
            }else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Table" component={Table} />
        <Stack.Screen name="Payment" component={PaymentList} />
        <Stack.Screen name="Stats" component={Stats} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </>
  );
};
