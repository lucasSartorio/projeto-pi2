import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Boxdefault from './components/Boxdefault';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib';

export default function App() {

  const [coordinates, setCoordinates] = useState({
    latitude: 0, 
    longitude: 0, 
    totalDistance: 0, 
    speed: 0,
    hasExecuted: false,
  });

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
       if (status !== 'granted') {
         setErrorMsg('Permission to access location was denied');
         return;
      }

      Location.watchPositionAsync({accuracy: 6 , distanceInterval: 15, timeInterval: 1000}, (location) => {
        console.log(location);
        setCoordinates( current => {
          if(current.hasExecuted === false) {
            return {
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude, 
              totalDistance: 0, 
              speed: Math.floor(location.coords.speed*3.6),
              hasExecuted: true,
            }
          }

          let deltaDistance = getPreciseDistance(
            {
              latitude: current.latitude, 
              longitude: current.longitude
            }, 
            {
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude
            }
          )

          let newSpeed = Math.floor(location.coords.speed*3.6); 

          console.log(deltaDistance, current.speed)

        if(deltaDistance < 10){
          deltaDistance = 0;
          newSpeed = 0;
        }

          return(
            {
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude, 
              totalDistance: current.totalDistance + deltaDistance, 
              speed: newSpeed,
              hasExecuted: true
            }
          )
        })
      })
    })();
  }, []);


  return (
    <View style={styles.container}>
      <Boxdefault
        text="Distância percorrida"
        input={ coordinates.totalDistance + " m" }
      />
      <Boxdefault
        text="Velocidade"
        input={ coordinates.speed + " km/h"}
      />  
      <Boxdefault
        text="Média de velocidade do percurso"
        input={coordinates.speed + " km/h"}
      />
      <Boxdefault
        text="Média de velocidade por KM"
        input={""}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    top: 70,
  },
});
