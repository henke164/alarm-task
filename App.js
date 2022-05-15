import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
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
      return;
    }

    socketRef.current = io(socketEndpoint, {
      transports: ['websocket']
    });

    socketRef.current.on("alarm", ({ id }) => {
      if (!alarmingDevice) {
        setAlarmingDevice(id);
      } else {
        console.log('alarmingDevice', alarmingDevice);
        console.log('isRunning', isRunning);
      }
    });

    return () => {
      console.log("Disconnecting...");
      setIsRunning(false);
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

  function renderAlarmWebview () {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.header}>Larmet är aktivt!</Text>
          {alarmingDevice && (
            <View style={styles.alarm}>
              <Text style={styles.alarmHeader}>Det larmar på deckare {alarmingDevice}!</Text>
              <Button title='Kvittera' onPress={() => setAlarmingDevice(null)}></Button>
            </View>
          )}
        </View>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRunning ?
        renderAlarmWebview() :
        <Button title='Starta larm' onPress={setIsRunning(true)}/>
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
  },
  alarmHeader: {
    fontSize: 24,
    color: 'red',
  },
  alarm: {
    alignItems: 'center',
  },
  webView: {
    display: 'none',
  }
});