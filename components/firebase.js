import RNFirebase from 'react-native-firebase'

const configurationOptions = {
  apiKey: "AIzaSyBy_zwRs7NZ_GZLzO5cU-FOx1axBSsUR_w",
  authDomain: "scanapp-25187.firebaseapp.com",
  databaseURL: "https://scanapp-25187.firebaseio.com",
  projectId: "scanapp-25187",
  storageBucket: "scanapp-25187.appspot.com",
  messagingSenderId: "619341792086"
}

const firebase = RNFirebase.initializeApp(configurationOptions)

export default firebase