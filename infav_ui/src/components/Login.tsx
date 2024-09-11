import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {Box, Button, Input, Typography, Alert, Divider, Stack} from '@mui/joy';
import {Link, useNavigate} from "react-router-dom";
import { auth } from "../firebaseConfig"; // Assuming you're using Firestore
import LinkedInIcon from '@mui/icons-material/LinkedIn';
const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in:', userCredential.user);
            const user = userCredential.user;
            const userId = user.uid;
            const idToken = await user.getIdToken();
            localStorage.setItem('idToken', idToken);
            // Now check if the user has posts or persona_id
            // Step 1: Make an API request to your backend to get persona_id and posts
            const response = await fetch(`https://infav-906977611020.us-central1.run.app/get-persona-and-posts/${user.uid}`);
            const data = await response.json();

            console.log(data)

            if (data.personaId && data.generatedPosts.length > 0) {
                // Step 2: Navigate to /submittedForm with personaId and generatedPosts
                navigate('/submitted', {
                    state: { personaId: data.personaId, generatedPosts: data.generatedPosts }
                });
            } else {
                // Navigate to form if no persona or posts found
                navigate('/form', {
                    state : { userId: userId }
                });
            }


            //  navigate('/form');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleLinkedInLogin = () => {
        const clientId = '78cbh1388n4loi';
        console.log(window.location.origin);
        const redirectUri = `http://localhost:5173/linkedin/callback`;
        const state = Math.random().toString(36).substring(7); ; // Protect against CSRF attacks
        localStorage.setItem('oauth_state', state);

        const linkedinouathurl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=w_member_social%20profile%20email%20openid`;

        console.log(linkedinouathurl)
        window.location.href = linkedinouathurl;
    };

    return (
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 4,
                p: 2,
                borderRadius: 2,
                boxShadow: 'md',
                backgroundColor: 'background.surface',
            }}
        >
            <Typography level="h4" component="h1" textAlign="center" mb={2}>
                Sign In
            </Typography>
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                sx={{ mb: 2 }}
            />
            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                sx={{ mb: 2 }}
            />
            <Button type="submit" fullWidth>
                Sign In
            </Button>
            {error && (
                <Alert color="danger" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
            <Typography textAlign="center" mt={2}>
                Don't have an account? <Link to="/register">Create one here</Link>
            </Typography>
            {/* Divider with 'or' in between */}
            <Divider sx={{ my: 2 }}>or</Divider>

            {/* LinkedIn Login Button */}
            <Stack spacing={2} alignItems="center">
                <Button
                    onClick={handleLinkedInLogin}
                    fullWidth
                    variant="solid" // Match the "Login" button variant
                    startDecorator={<LinkedInIcon />} // Add LinkedIn Icon to the left
                    sx={{
                        backgroundColor: '#0077B5', // LinkedIn color
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#005582',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center content
                        mt: 2,
                    }}
                >Sign In with LinkedIn
                </Button>
            </Stack>
        </Box>
    );
};

export default Login;
