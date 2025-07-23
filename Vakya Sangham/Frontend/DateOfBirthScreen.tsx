import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from './types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'DateOfBirth'>;
};

const DateOfBirthScreen: React.FC<Props> = ({ navigation }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Generate calendar data for the current month and year
  const generateCalendar = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    let week = Array(7).fill(null);
    let day = 1;

    for (let i = 0; day <= daysInMonth || i % 7 !== 0; i++) {
      if (i < firstDay || day > daysInMonth) {
        week[i % 7] = null;
      } else {
        week[i % 7] = day++;
      }
      if (i % 7 === 6) {
        calendar.push([...week]);
        week = Array(7).fill(null);
      }
    }
    if (week.some(d => d !== null)) calendar.push(week);
    return calendar;
  };

  // Regenerate calendar when month/year changes
  const calendarData = generateCalendar(currentMonth, currentYear);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const years = Array.from({ length: 125 }, (_, i) => today.getFullYear() - i);

  const handleDateSelect = (day: number) => {
    if (day) {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth + (direction === 'next' ? 1 : -1);
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Update calendar when year changes
  useEffect(() => {
    const isDateInView = 
      selectedDate.getMonth() === currentMonth && 
      selectedDate.getFullYear() === currentYear;
    
    if (!isDateInView) {
      setSelectedDate(new Date(currentYear, currentMonth, 1));
    }
  }, [currentMonth, currentYear]);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text 
          style={styles.title} 
          accessibilityLabel="Enter your date of birth"
        >
          What's your date of birth?
        </Text>
      </View>
      
      <View style={styles.dateDisplay}>
        <Text style={styles.selectedDate}>{formatDate(selectedDate)}</Text>
        <Text style={styles.formatText}>MM/DD/YYYY</Text>
      </View>
      
      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            onPress={() => changeMonth('prev')}
            style={styles.navButton}
            accessibilityLabel="Previous month"
          >
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthHeaderText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          
          <TouchableOpacity 
            onPress={() => changeMonth('next')}
            style={styles.navButton}
            accessibilityLabel="Next month"
          >
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.yearSelector}>
          <Text style={styles.yearLabel}>Year:</Text>
          <Picker
            selectedValue={currentYear}
            dropdownIconColor="#0066cc"
            mode="dropdown"
            style={styles.yearPicker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue) => setCurrentYear(Number(itemValue))}
            accessibilityLabel="Select year"
          >
            {years.map((year) => (
              <Picker.Item 
                key={year} 
                label={`${year}`} 
                value={year} 
              />
            ))}
          </Picker>
        </View>
        
        <View style={styles.dayHeaderContainer}>
          {dayNames.map((day, index) => (
            <Text key={index} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {calendarData.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                const isSelected = 
                  day === selectedDate.getDate() &&
                  currentMonth === selectedDate.getMonth() &&
                  currentYear === selectedDate.getFullYear();
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      day && isSelected && styles.selectedDayCell,
                      !day && styles.emptyDayCell,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={!day}
                    accessibilityLabel={day ? `Day ${day}` : 'Empty day'}
                  >
                    <Text style={[
                      styles.dayText,
                      day && isSelected && styles.selectedDayText,
                      !day && styles.emptyDayText
                    ]}>
                      {day || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cancel selection"
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.okButton}
          onPress={() => navigation.navigate('AboutYou')}
          accessibilityLabel="Submit date of birth"
        >
          <Text style={styles.okButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5E8C7', // Light beige background
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    marginTop: 40,
    textAlign: 'center',
  },
  dateDisplay: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  formatText: {
    color: '#999',
    fontSize: 14,
  },
  calendarSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  navText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
    lineHeight: 28,
    marginTop: Platform.OS === 'ios' ? -2 : 0,
  },
  monthHeaderText: {
    fontWeight: '600',
    fontSize: 18,
    color: '#333',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    height: 35,
  },
  yearLabel: {
    fontWeight: '500',
    marginRight: 10,
    color: '#333',
  },
  yearPicker: {
    flex: 1,
    height: 30,
    color: '#333',
    marginTop: -2,
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  dayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
    color: '#666',
  },
  calendarGrid: {
    marginBottom: 5,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 2,
  },
  emptyDayCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedDayCell: {
    backgroundColor: '#000000', // Black for selected day
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyDayText: {
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  okButton: {
    backgroundColor: '#F4A261', // Orange for "Next" button
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DateOfBirthScreen;