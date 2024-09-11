import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Accelerometer, Barometer } from 'expo-sensors';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {

  const [data, setData] = useState({
    timestamps: [],
    x: [],
    y: [],
    z: [],
    pressure: []
  });

  const [accSubscription, setAccSubscription] = useState(null);
  Accelerometer.setUpdateInterval(1000 / 60);
  const [barSubscription, setBarSubscription] = useState(null);

  const beginRecording = () => {
    setData(prevData => ({
      ...prevData,
      timestamps: [],
      x: [],
      y: [],
      z: [],
      pressure: []
    }));

    setAccSubscription(Accelerometer.addListener(accelerometerData => {
      setData(prevData => {
        
        if (prevData.pressure.length != 0) {
          new_pressure = [...prevData.pressure, prevData.pressure[prevData.pressure.length - 1]]
        } else {
          new_pressure = [0]
        }
        
        return {
          ...prevData,
          timestamps: [...prevData.timestamps, Date.now()],
          x: [...prevData.x, accelerometerData.x],
          y: [...prevData.y, accelerometerData.y],
          z: [...prevData.z, accelerometerData.z],
          pressure: new_pressure
        }
      });
    }));

    setBarSubscription(Barometer.addListener(barometerData => {
      setData(prevData => {
        if (prevData.pressure.length == 0) {
          return {
            ...prevData,
            pressure: [0]
          }
        }
        return {
          ...prevData,
          pressure: [...prevData.pressure.slice(0, prevData.pressure.length - 1), barometerData.pressure]
        }
      })
    }));
  };

  const stopRecording = () => {
    accSubscription && accSubscription.remove();
    setAccSubscription(null);
    barSubscription && barSubscription.remove();
    setBarSubscription(null);
  };

  const toggleListener = () => {
    if (accSubscription) {
      stopRecording();
    } else {
      beginRecording();
    }
  };

  const saveData = async () => {
    // Generate CSV content
    let csv = 'timestamps,acc_x,acc_y,acc_z,pressure\n';
    data.timestamps.forEach((timestamp, index) => {
      csv += `${timestamp},${data.x[index] || 0},${data.y[index] || 0},${data.z[index] || 0},${data.pressure[index] || 0}\n`;
    });

    // Save the CSV file
    const fileUri = FileSystem.documentDirectory + 'sensor_data.mtn';
    await FileSystem.writeAsStringAsync(fileUri, csv);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Sharing not available', 'Please save the file manually.');
    }
  };

  const pythagorean = (...args) => {
    const sumOfSquares = args.reduce((sum, num) => sum + num ** 2, 0);
    const res = Math.sqrt(sumOfSquares).toFixed(5);
    if (!isNaN(res)) return res;
    return 0;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sensor Data</Text>
      <Text style={styles.time}>
        {data.timestamps.length !== 0 
          ? `${Math.floor((Date.now() - data.timestamps[0]) / 60000)}:${Math.floor(((Date.now() - data.timestamps[0]) % 60000) / 1000).toString().padStart(2, '0')}`
          : ""}
      </Text>


      <View style={styles.infoContainer}>
        <Text style={styles.label}>Accelerometer:</Text>
        <Text style={styles.value}>{accSubscription ? 'ACTIVE' : 'INACTIVE'}</Text>
        <Text style={styles.label}>Acceleration:</Text>
        <Text style={styles.value}>{pythagorean(
          data.x[data.x.length - 1],
          data.y[data.y.length - 1],
          data.z[data.z.length - 1]
        )} m/s²</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Barometer:</Text>
        <Text style={styles.value}>{barSubscription ? 'ACTIVE' : 'INACTIVE'}</Text>
        <Text style={styles.label}>Pressure:</Text>
        <Text style={styles.value}>{(data.pressure[data.pressure.length - 1] || 0).toFixed(5)} hPa</Text>
      </View>

      <TouchableOpacity onPress={toggleListener} style={styles.button}>
        <Text style={styles.buttonText}>{accSubscription ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveData} style={styles.save_button}>
        <Text style={styles.buttonText} >Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  time: {
    marginBottom: 10,
    fontSize: 15,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#03a9f4",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    elevation: 3, // Adds shadow for Android
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  save_button: {
    backgroundColor: "#4caf50",
    margin: 20,
    padding: 15,
    borderRadius: 5,
    elevation: 3,
  }
});
