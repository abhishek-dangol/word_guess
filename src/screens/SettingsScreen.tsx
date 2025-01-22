import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { useSettings } from '../context/SettingsContext';
import { useState } from 'react';

const skipOptions = [
  { label: '1 skip', value: 1 },
  { label: '2 skips', value: 2 },
  { label: '3 skips', value: 3 },
  { label: '4 skips', value: 4 },
  { label: '5 skips', value: 5 },
];

export function SettingsScreen() {
  const navigation = useNavigation();
  const { maxSkips, setMaxSkips } = useSettings();
  const [selectedSkips, setSelectedSkips] = useState(maxSkips);
  const hasChanges = selectedSkips !== maxSkips;

  const handleSave = () => {
    setMaxSkips(selectedSkips);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.setting}>
          <Text style={styles.label}>Select number of Skips:</Text>
          <Dropdown
            style={styles.dropdown}
            data={skipOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={selectedSkips}
            onChange={(item) => setSelectedSkips(item.value)}
            placeholder="Select skips"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, !hasChanges && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges}
          >
            <Text style={[styles.buttonText, !hasChanges && styles.buttonTextDisabled]}>
              Save Changes
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9EF',
    backgroundColor: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 32,
  },
  setting: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 32,
  },
  button: {
    backgroundColor: '#2ECC71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  buttonTextDisabled: {
    color: '#7F8C8D',
  },
});
