
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBAgnnXh6jM2EWGDm0dQt-IN25XzKiXfbc",
  authDomain: "mswordaddin.firebaseapp.com",
  databaseURL: "https://mswordaddin.firebaseio.com",
  projectId: "mswordaddin",
  storageBucket: "mswordaddin.appspot.com",
  messagingSenderId: "213046694367",
  appId: "1:213046694367:web:dddee03def33d3c2e5346a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

