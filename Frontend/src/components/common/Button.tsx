import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export default function Button({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}