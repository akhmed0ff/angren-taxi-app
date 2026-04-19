import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  rightIcon,
  isPassword = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error ? styles.inputError : undefined]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.gray[500]}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.icon}>
            <Text style={styles.iconText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.icon}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[900],
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  icon: {
    padding: SPACING.xs,
  },
  iconText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});

export default Input;
