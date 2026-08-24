import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      // FIX: Replace 'Home' with 'AppTabs' to match the root stack declaration
      navigation.replace('AppTabs');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 32,
          fontWeight: '700',
        }}
      >
        Smart Skills India
      </Text>
    </View>
  );
}