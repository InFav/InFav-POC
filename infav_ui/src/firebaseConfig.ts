// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAqKpb57VK773BBe6wWSIoJgdLzm0wDJVo",
    authDomain: "infav-hackday-4.firebaseapp.com",
    projectId: "infav-hackday-4",
    storageBucket: "infav-hackday-4.appspot.com",
    messagingSenderId: "906977611020",
    appId: "1:906977611020:web:2ecb8bcbafb7cdad938d29",
    measurementId: "G-W24XCCP3DR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
