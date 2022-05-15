import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { WebView } from "react-native-webview";
const io = require('socket.io-client');
const socketEndpoint = "http://2568-81-227-125-231.ngrok.io";

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [alarmingDevice, setAlarmingDevice] = useState(false);
  const [webViewRef, setWebViewRef] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    if (!isRunning) {
      if (socketRef.current) {
        setAlarmingDevice(null);
        socketRef.current.disconnect();
      }
      return;
    }

    socketRef.current = io(socketEndpoint, {
      transports: ['websocket']
    });

    socketRef.current.on("alarm", ({ id }) => {
      if (!alarmingDevice) {
        setAlarmingDevice(id);
      } else {
        console.log("ALARM failed?");
        console.log('alarmingDevice', alarmingDevice);
        console.log('isRunning', isRunning);
      }
    });

    return () => {
      setAlarmingDevice(null);
      socketRef.current.disconnect();
    };
  }, [isRunning]);

  React.useEffect(() => {
    if (!webViewRef) {
      console.log('webViewRef not initialized');
      return;
    }

    console.log("Alarm device", alarmingDevice);
    if (alarmingDevice) {
      webViewRef.injectJavaScript('playAlarmSound()');
    } else {
      console.log("STOPPING ALARM");
      webViewRef.injectJavaScript('stopAlarmSound()');
    }
  }, [alarmingDevice]);

  function renderStartView() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Larm: Ej aktiv</Text>
        <Pressable style={styles.button} onPress={() => setIsRunning(true)}>
          <Text style={styles.buttonText}>Aktivera larm</Text>
        </Pressable>
      </View>
    );
  }
  function renderAlarmActiveView () {
    return (
      <View style={styles.container}>
        {!alarmingDevice ? (
          <Text style={{...styles.header, ...styles.green}}>Larm: Aktiv</Text>
        ) : (
          <View style={styles.alarm}>
            <Text style={styles.alarmHeader}>Utlöst larm:</Text>
            <Text style={styles.alarmDevice}>{alarmingDevice}</Text>
            <Pressable style={styles.button} onPress={() => setAlarmingDevice(null)}>
              <Text style={styles.buttonText}>Kvittera</Text>
            </Pressable>
          </View>
        )}        
        <Pressable style={{...styles.button, ...styles.redBg}} onPress={() => setIsRunning(false)}>
          <Text style={styles.buttonText}>Inaktivera larm</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.app}>
      {isRunning ?
        renderAlarmActiveView() :
        renderStartView()
      }
      <WebView
        ref={setWebViewRef}
        style={styles.webView}
        originWhitelist={["*"]}
        mediaPlaybackRequiresUserAction={false}
        useWebKit={true}
        source={{
          html:
          `
          <html>
          <body>
            <audio id="beep" src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjI1LjEwMQAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAAA3YAlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaW8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw////////////////////////////////////////////AAAAAExhdmYAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAN2UrY2LgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/jYMQAEvgiwl9DAAAAO1ALSi19XgYG7wIAAAJOD5R0HygIAmD5+sEHLB94gBAEP8vKAgGP/BwMf+D4Pgh/DAPg+D5//y4f///8QBhMQBgEAfB8HwfAgIAgAHAGCFAj1fYUCZyIbThYFExkefOCo8Y7JxiQ0mGVaHKwwGCtGCUkY9OCugoFQwDKqmHQiUCxRAKOh4MjJFAnTkq6QqFGavRpYUCmMxpZnGXJa0xiJcTGZb1gJjwOJDJgoUJG5QQuDAsypiumkp5TUjrOobR2liwoGBf/X1nChmipnKVtSmMNQDGitG1fT/JhR+gYdCvy36lTrxCVV8Paaz1otLndT2fZuOMp3VpatmVR3LePP/8bSQpmhQZECqWsFeJxoepX9dbfHS13/////aysppUblm//8t7p2Ez7xKD/42DE4E5z9pr/nNkRw6bhdiCAZVVSktxunhxhH//4xF+bn4//6//3jEvylMM2K9XmWSn3ah1L2MqVIjmNlJtpQux1n3ajA0ZnFSu5EpX////uGatn///////1r/pYabq0mKT//TRyTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MQxNIAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==" type="audio/mp3" />
            <h1>Alarm!</h1>
            <script type="text/javascript">
              var beep = document.getElementById('beep');
              var playSound = false;

              setInterval(() => {
                if (playSound) {
                  beep.play();
                }
              }, 500);

              function playAlarmSound() {
                playSound = true;
              }

              function stopAlarmSound() {
                playSound = false;
                beep.stop();
              }
            </script>
          </body>
          </html>
          `,
        }}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alarmHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
  },
  alarm: {
    alignItems: 'center',
  },
  alarmDevice: {
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    width: 200,
    padding: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    color: "white",
    backgroundColor: 'blue',
    marginTop: 50,
  },
  redBg: {
    backgroundColor: '#E23516',
  },
  buttonText: {
    color: "white",
    textAlign: 'center',
  },
  green: {
    color: '#44C128',
  },
  red: {
    color: 'red',
  },
  webView: {
    flex: 0,
    height: "10%",
  }
});