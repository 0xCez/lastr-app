import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface OptionButtonProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  multiSelect?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  emoji,
  selected,
  onSelect,
  disabled = false,
  multiSelect = false,
}) => {
  const handlePress = async () => {
    if (!disabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      {multiSelect && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <View style={styles.checkboxInner} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  disabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  selectedLabel: {
    color: Colors.text,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.text,
  },
});
