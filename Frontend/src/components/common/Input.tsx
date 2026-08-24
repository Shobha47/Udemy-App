import React from 'react';
import { TextInput } from 'react-native';

export default function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={{
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    />
  );
}