import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import SearchRidesScreen from '../screens/rides/SearchRidesScreen';
import MyRidesScreen from '../screens/rides/MyRidesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateTripScreen from '../screens/driver/CreateTripScreen';
import TripDetailsScreen from '../screens/rides/TripDetailsScreen';
import BookingScreen from '../screens/rides/BookingScreen';
import KYCUploadScreen from '../screens/driver/KYCUploadScreen';
import VehiclesScreen from '../screens/driver/VehiclesScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const RidesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4f46e5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen 
        name="SearchRides" 
        component={SearchRidesScreen} 
        options={{ title: 'Find Rides' }} 
      />
      <Stack.Screen 
        name="TripDetails" 
        component={TripDetailsScreen} 
        options={{ title: 'Trip Details' }} 
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{ title: 'Book Ride' }} 
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4f46e5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileHome" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
      <Stack.Screen 
        name="DriverKYC" 
        component={KYCUploadScreen} 
        options={{ title: 'Driver KYC' }} 
      />
      <Stack.Screen 
        name="Vehicles" 
        component={VehiclesScreen} 
        options={{ title: 'My Vehicles' }} 
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen} 
        options={{ title: 'Subscription' }} 
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={RidesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MyRides" 
        component={MyRidesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📅</Text>
          ),
          title: 'My Rides',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
