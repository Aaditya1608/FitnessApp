import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressBar({currentStep, totalSteps}: ProgressBarProps){

  return (
    <View style={styles.container}>
      {/* Bars Container */}
      <View style={styles.barsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          // Check if segment should be active/green
          const isActive = index < currentStep;

          return (
            <View
              key={index}
              style={[
                styles.segment,
                isActive ? styles.activeSegment : styles.inactiveSegment,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft:4
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Supported in modern React Native versions (or use marginRight on segments)
  },
  segment: {
    height: 8,
    width: 54,
    borderRadius: 4, // Makes the ends rounded pills
  },
  activeSegment: {
    backgroundColor: '#153131', // Green active color
  },
  inactiveSegment: {
    backgroundColor: '#E2E1E6', // Light gray inactive color
  }
})