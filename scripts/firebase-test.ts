const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyAqKpb57VK773BBe6wWSIoJgdLzm0wDJVo",
    authDomain: "infav-hackday-4.firebaseapp.com",
    projectId: "infav-hackday-4",
    storageBucket: "infav-hackday-4.appspot.com",
    messagingSenderId: "906977611020",
    appId: "1:906977611020:web:2ecb8bcbafb7cdad938d29",
    measurementId: "G-W24XCCP3DR"
};

const app = initializeApp(firebaseConfig);

async function signInEmailAndPassword() {
    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, "abcd@gmail.com", "InFavHarmonies2352;");
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        console.log('ID Token:', idToken);
    } catch (error) {
        console.error('Error signing in with custom token:', error);
    }
}

signInEmailAndPassword();

module.exports = {
    signInEmailAndPassword
};
