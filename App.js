import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Boxdefault from './components/Boxdefault';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib'

const KM = 100;

export default function App() {
  const [coordinates, setCoordinates] = useState({
    latitude: 0,
    longitude: 0,
    totalDistance: 0,
    kmDistance: 0,
    speed: 0,
    hasExecuted: false,
    n: 0,
  });

  const [ displayTime, setDisplayTime ] = useState(0);

  let totalTime = 0;
  let kmTime = 0;
  let timeList = [];

  const [ tL, setTL ] = useState([])
  
  const [ errorMsg, setErrorMsg ] = useState(null);
  
  useEffect(() => {
      const evento = setInterval(() => {
        setDisplayTime(current => current + 1);
        totalTime++;
        kmTime++;
      }, 1000);

      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        Location.watchPositionAsync({accuracy: 6 , timeInterval: 10000}, (location) => {
          console.log("Location: ", location);

          setCoordinates(current => {
            if(current.hasExecuted === false) {
              return {
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude, 
                totalDistance: 0,
                kmDistance: 0, 
                speed: 0,
                hasExecuted: true,
                n: 0,
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
            );

            let newSpeed = (location.coords.speed*3.6).toFixed(1);

            if(deltaDistance < 10){
              deltaDistance = 0;
              newSpeed = 0;
            }

            let newKmDistance = current.kmDistance + deltaDistance
            if(newKmDistance > KM) {
              timeList.push({kmTime});
              kmTime = 0;
              newKmDistance = 0
            }

            console.log("Velocidade: ", current.speed, ", Deslocamento: ", deltaDistance);

            return({
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude, 
              totalDistance: current.totalDistance + deltaDistance,
              kmDistance: newKmDistance,
              speed: newSpeed,
              hasExecuted: true,
            });
          });
        });
      })();

      return () => {
        clearInterval(evento);
      }
  }, []);

  return (
    <View style={styles.container}>
        <Boxdefault
          text="Distância percorrida"
          input={ coordinates.totalDistance + " m" }
        />
        <Boxdefault
          text="Distância por km percorrida"
          input={ coordinates.kmDistance + " m" }
        />
        <Boxdefault
          text="Velocidade"
          input={ coordinates.speed + " km/h"}
        />  
        {/* <Boxdefault
          text="Média de velocidade por KM"
          input={kmTimeHistory}
        /> */}
        <Boxdefault
          text="Tempo total"
          input={displayTime + ' s'}
        />

        <Text>{JSON.stringify(timeList)}</Text>
        
        {/* {kmTimeHistory.length > 0 ? kmTimeHistory.map((t, index) => <Text key={index}>{t}</Text>) : <Text>Sem dados</Text>}     */}
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