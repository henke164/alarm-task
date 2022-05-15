import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { WebView } from "react-native-webview";

const ALARM_TASK = 'alarm-task';

export default function App() {
  const [alarmTaskRegistered, setAlarmTaskRegistered] = React.useState(false);
  const [isAlarming, setIsAlarming] = React.useState(false);
  const [webviewRef, setWebviewRef] = React.useState(false);

  TaskManager.defineTask(ALARM_TASK, async () => {
    console.log("Alarm check!");
    const res = await axios.get('https://pastebin.com/raw/6hNiNX6M');
    if (!isAlarming && res.data === "alarm") {
      console.log("Alarm started!");
      startAlarm();
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  const startAlarm = () => {
    webviewRef.injectJavaScript('startAlarm()');
    setIsAlarming(true);
  }
  
  const stopAlarm = () => {
    webviewRef.injectJavaScript('stopAlarm()');
    setIsAlarming(false);
  }

  const registerBackgroundFetchAsync = async () => {
    await BackgroundFetch.registerTaskAsync(ALARM_TASK, {
      minimumInterval: 1,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    const isRegistered = await TaskManager.isTaskRegisteredAsync(ALARM_TASK);

    setAlarmTaskRegistered(isRegistered);
  };

  const renderAlarmWebview = () => {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.header}>Larmet är aktivt!</Text>
          <Text>Stäng ner appen</Text>
          {isAlarming && (
            <View style={styles.alarm}>
              <Text style={styles.alarmHeader}>Det larmar!!</Text>
              <Button title='Stoppa alarm' onPress={stopAlarm}></Button>
            </View>
          )}
        </View>
        <WebView
          ref={setWebviewRef}
          style={styles.webView}
          originWhitelist={["*"]}
          mediaPlaybackRequiresUserAction={false}
          useWebKit={true}
          source={{
            html:
            `
            <body>
              <audio id="beep" src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjI1LjEwMQAAAAAAAAAAAAAA/+NAwAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAAA3YAlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaW8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw////////////////////////////////////////////AAAAAExhdmYAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAN2UrY2LgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/jYMQAEvgiwl9DAAAAO1ALSi19XgYG7wIAAAJOD5R0HygIAmD5+sEHLB94gBAEP8vKAgGP/BwMf+D4Pgh/DAPg+D5//y4f///8QBhMQBgEAfB8HwfAgIAgAHAGCFAj1fYUCZyIbThYFExkefOCo8Y7JxiQ0mGVaHKwwGCtGCUkY9OCugoFQwDKqmHQiUCxRAKOh4MjJFAnTkq6QqFGavRpYUCmMxpZnGXJa0xiJcTGZb1gJjwOJDJgoUJG5QQuDAsypiumkp5TUjrOobR2liwoGBf/X1nChmipnKVtSmMNQDGitG1fT/JhR+gYdCvy36lTrxCVV8Paaz1otLndT2fZuOMp3VpatmVR3LePP/8bSQpmhQZECqWsFeJxoepX9dbfHS13/////aysppUblm//8t7p2Ez7xKD/42DE4E5z9pr/nNkRw6bhdiCAZVVSktxunhxhH//4xF+bn4//6//3jEvylMM2K9XmWSn3ah1L2MqVIjmNlJtpQux1n3ajA0ZnFSu5EpX////uGatn///////1r/pYabq0mKT//TRyTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/+MQxNIAAANIAcAAAKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==" type="audio/mp3" />
              <script type="text/javascript">
                let alarmIval;

                function startAlarm() {
                  var beep = document.getElementById('beep');
                  alarmIval = setInterval(() => {
                    beep.play();
                  }, 200);
                }

                function stopAlarm() {
                  clearInterval(alarmIval);
                }
              </script>
            </body>
            `,
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alarmTaskRegistered ?
        renderAlarmWebview() :
        <Button title='Starta larm' onPress={registerBackgroundFetchAsync}/>
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