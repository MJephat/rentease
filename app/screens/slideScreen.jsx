import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {Swiper} from 'react-native-swiper';
import { PaymentForm } from '../form/payment';

const slides = ['Slide #1', 'Slide #2', PaymentForm , 'Slide #4'];

export const SliderScreen = () => {
  return (
    <View style={styles.container}>
      <Swiper style={styles.wrapper} showsButtons showsPagination loop>
        {slides.map((label, i) => (
          <View key={i} style={styles.slide}>
            <Text style={styles.text}>{label}</Text>
          </View>
        ))}
      </Swiper>

      <View style={styles.iconRow}>
        {[
          { label: 'Documentation', icon: '📄' },
          { label: 'Examples', icon: '🚀' },
          { label: 'Community', icon: '💬' },
          { label: 'Github', icon: '🐱' },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.iconLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: { height: 250 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b5a742',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  iconContainer: { alignItems: 'center' },
  icon: { fontSize: 30 },
  iconLabel: { marginTop: 5, fontSize: 12 },
});
