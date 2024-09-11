import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Box, Button, Input, Typography, Alert } from '@mui/joy';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebaseConfig.ts'; // import the shared Firebase config

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSignUp}
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
                Create Account
            </Typography>
            {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
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
            <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                sx={{ mb: 2 }}
            />
            <Button type="submit" fullWidth>
                Sign Up
            </Button>
            <Typography textAlign="center" mt={2}>
                Already have an account? <Link to="/login">Login here</Link>
            </Typography>
        </Box>
    );
};

export default Register;
