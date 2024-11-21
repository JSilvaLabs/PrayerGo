import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';

const prayerIcon = require('./assets/prayer-icon.png');
const praiseIcon = require('./assets/praise-icon.png');
const thanksIcon = require('./assets/thanks-icon.png');

const App = () => {
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => Alert.alert('Error', error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    const unsubscribe = firestore()
      .collection('markers')
      .onSnapshot(snapshot => {
        const markersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMarkers(markersData);
      });

    return () => unsubscribe();
  }, []);

  const addMarker = (type) => {
    if (region) {
      const newMarker = {
        latitude: region.latitude,
        longitude: region.longitude,
        type,
      };
      firestore().collection('markers').add(newMarker);
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          onRegionChangeComplete={setRegion}
        >
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              image={
                marker.type === 'prayer' ? prayerIcon :
                marker.type === 'praise' ? praiseIcon :
                thanksIcon
              }
            />
          ))}
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Add Prayer Petition" onPress={() => addMarker('prayer')} />
        <Button title="Add Praise Report" onPress={() => addMarker('praise')} />
        <Button title="Add Thanks Report" onPress={() => addMarker('thanks')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});

export default App;