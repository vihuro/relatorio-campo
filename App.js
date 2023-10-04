import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, AppState } from 'react-native';
import notification, { AndroidImportance } from "@notifee/react-native"
import { useEffect, useState } from 'react';
import BackgroundTimer from 'react-native-background-timer';

export default function App() {
  const [timer, setTimer] = useState("00:00");
  const [runing, setRuning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [notificationId, setNotificationId] = useState(null);

  let intervalId; // Adiciona uma variável para armazenar o ID do intervalo

  useEffect(() => {
    if (runing) {
      intervalId = BackgroundTimer.setInterval(() => {
        setTotalSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      return () => {
        BackgroundTimer.clearInterval(intervalId);
      };
    } else {
      BackgroundTimer.clearInterval(intervalId);
    }
  }, [runing]);

  useEffect(() => {
    // Converte os segundos totais para minutos e segundos formatados
    const formattedMinutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const formattedSeconds = (totalSeconds % 60).toString().padStart(2, "0");

    const newTimer = `${formattedMinutes}:${formattedSeconds}`;
    if (newTimer !== "00:00") {
      setTimer(newTimer);
      updateDisplayNotification(newTimer);
    }
    // Atualiza o corpo da notificação se ela já foi exibida
  }, [totalSeconds]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove()
      //AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log("erro no handleAppStateChange")
    if (nextAppState === 'active') {
      // App está em primeiro plano
    } else {
      // App está em segundo plano ou fechado
      if (runing) {
        setRuning(false);
      }
    }
  };

  async function displayNotification() {

      await notification.requestPermission().catch(err => console.log("erro no displayNotificion requesPermission"));

      const channelId = await notification.createChannel({
        id: "RELATORIO",
        name: "campos",
        vibration: true,
        importance: AndroidImportance.HIGH
      }).catch(err => console.log("erro no channelId disPlayNotification"));

      await notification.displayNotification({
        id: "5",
        title: "RELATÓRIO DE CAMPO",
        body: "Veja sua atividade de campo",
        android: {
          channelId
        },
      }).catch(err => console.log("erri na criação de notification displayNotification"))


  }

  async function updateDisplayNotification(tempo) {


      notification.requestPermission().catch(err => console.log("erro na perrmião UpdateNotification"));

      const channelId = await notification.createChannel({
        id: "RELATORIO",
        name: "campos",
        vibration: true,
        importance: AndroidImportance.HIGH
      }).catch(err => console.log("erro no channelId"));

      await notification.displayNotification({
        id: "5",
        // title: "RELATÓRIO DE CAMPO",
        body: tempo,
        android: {
          channelId
        },
      }).catch(err => {

          console.log("erro na criação de notificação update")
        })

  }

  notification.onForegroundEvent(({ type, detail }) => {

  })
  notification.onBackgroundEvent(({ type, detail }) => {

  })

  return (
    <View style={styles.container}>
      <Text>{timer}</Text>
      <TouchableOpacity
        onPress={() => {
          displayNotification();
          displayNotification(timer);
          setRuning((prev) => !prev);
        }}
        title='Enviar mensagem'
      >
        <Text>INICIAR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setRuning(false);
          // setNotificationId(null)
          updateDisplayNotification()
        }}
      >
        <Text>PAUSAR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setRuning(false);
          // setNotificationId(null)
          setTimer("00:00")
          setTotalSeconds(0)
          //updateDisplayNotification()
        }}
      >
        <Text>ZERAR</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});