import  firebase from 'firebase';
require("@firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyBlTRMaRz151vQ-QbSMbHnu8r_Z7xbdp1w",
    authDomain: "wily-bc9c7.firebaseapp.com",
    projectId: "wily-bc9c7",
    storageBucket: "wily-bc9c7.appspot.com",
    messagingSenderId: "821552487078",
    appId: "1:821552487078:web:abaf2cc857d87317f87267"
  };
  // Initialize Firebase
if(!firebase.apps.length)
{
firebase.initializeApp(firebaseConfig);
}
export default firebase.firestore();