import { useEffect } from 'react';
import { auth } from '../firebaseConfig.ts';
import { useNavigate } from 'react-router-dom';
import {signInWithCustomToken} from "firebase/auth";
import axios from "axios";

const LinkedInCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        console.log(params.get('code'))
        const code = params.get('code');
        const returnedState = params.get('state');

        const originalState = localStorage.getItem('oauth_state');

        if (returnedState !== originalState) {
            console.error('State mismatch! Potential CSRF attack.');
            return;
        }



        if (code) {
            axios.post('https://infav-906977611020.us-central1.run.app/linkedin', {code})
                .then(response => {
                    console.log(response.data)
                    const { sub, accessToken, customToken } = response.data;
                    localStorage.setItem('linkedInAccessToken', accessToken);
                    localStorage.setItem('linkedinPersonId', sub);
                    signInWithCustomToken(auth, customToken)
                        .then(async (userCredential) => {
                            // Retrieve the Firebase ID token
                            const user = userCredential.user;
                            const idToken = await user.getIdToken();

                            // Store the ID token in local storage for future API requests
                            localStorage.setItem('idToken', idToken);

                            console.log('User signed in, ID Token:', idToken);

                            // Navigate to the /form route after successful authentication
                            navigate('/form');
                        })
                        .catch((error) => {
                            console.error('Error signing in with custom token:', error);
                        });
                })
                .catch(error => {
                    console.error('Error exchanging code for custom token:', error);
                });
        } else {
            console.error('No authorization code found');
        }
    }, [navigate])

    return (
        <div>
            Authenticating with LinkedIn...
        </div>
    );
}

export default LinkedInCallback;
