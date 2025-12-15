import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <Feather name="map" size={48} color={COLORS.textMuted} />
          <Text style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.text,
            textAlign: 'center'
          }}>
            Map Loading Failed
          </Text>
          <Text style={{
            marginTop: 8,
            fontSize: 14,
            color: COLORS.textMuted,
            textAlign: 'center',
            lineHeight: 20
          }}>
            We're having trouble loading the map. You can still browse listings below.
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary; 