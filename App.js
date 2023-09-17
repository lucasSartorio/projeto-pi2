import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Boxdefault from './components/Boxdefault';
import * as Location from 'expo-location';
import { getPreciseDistance } from 'geolib'

const KM = 100;

export default function App() {
  const [ state, setState ] = useState({
    latitude: 0,
    longitude: 0,
    totalDistance: 0,
    kmDistance: 0,
    speed: 0,
    hasExecuted: false,
    totalTime: 0,
    kmTime: 0,
    timeList: [],
  });
  
  const [ errorMsg, setErrorMsg ] = useState(null);
  
  useEffect(() => {
      const evento = setInterval(() => {
        setState(current => ({ ...current, totalTime: current.totalTime + 1, kmTime: current.kmTime + 1}));
      }, 1000);

      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        Location.watchPositionAsync({accuracy: 6 , timeInterval: 10000}, (location) => {
          console.log("Location: ", location);

          setState(current => {
            if(current.hasExecuted === false) {
              return {
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude, 
                totalDistance: 0,
                kmDistance: 0, 
                speed: 0,
                hasExecuted: true,
                totalTime: 0,
                kmTime: 0,
                timeList: [],
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

            let newKmDistance = current.kmDistance + deltaDistance;
            let newtimeList = [...current.timeList];
            let newKmTime = current.kmTime;
            if(newKmDistance > KM) {
              newtimeList.push(newKmTime);
              newKmTime = 0;
              newKmDistance = 0;
            }

            console.log("Velocidade: ", current.speed, ", Deslocamento: ", deltaDistance);

            return({
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude, 
              totalDistance: current.totalDistance + deltaDistance,
              kmDistance: newKmDistance,
              speed: newSpeed,
              hasExecuted: true,
              totalTime: current.totalTime,
              kmTime: newKmTime,
              timeList: [...newtimeList],
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
          input={ state.totalDistance + " m" }
        />
        <Boxdefault
          text="Distância por km percorrida"
          input={ state.kmDistance + " m" }
        />
        <Boxdefault
          text="Velocidade"
          input={ state.speed + " km/h"}
        />  
        {/* <Boxdefault
          text="Média de velocidade por KM"
          input={kmTimeHistory}
        /> */}
        <Boxdefault
          text="Tempo total"
          input={ state.totalTime + ' s' + ' | ' + state.kmTime }
        />

        <Text>{JSON.stringify(state.timeList)}</Text>
        
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