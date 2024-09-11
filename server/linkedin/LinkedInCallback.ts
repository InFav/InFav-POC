import axios from "axios";
import {Router} from "express";

import admin from "firebase-admin";
import qs from 'qs';
import jwt, {JwtPayload} from 'jsonwebtoken';


const router = Router()
router.post('/', async (req, res) => {

    const { code } = req.body;

    const clientId = '78cbh1388n4loi';
    const clientSecret = 'Oqlt2SBgDCe9UXCv';
    const redirectUri = `http://localhost:5173/linkedin/callback`;

    try {
        console.log('Received authorization code:', code);

        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken',
            `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&client_id=${clientId}&client_secret=${clientSecret}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );



        console.log("here is the response of tokens", tokenResponse.data)
        const { access_token: accessToken, id_token: idToken } = tokenResponse.data;

        const decodedToken = jwt.decode(idToken, { complete: true });
        console.log('Decoded id_token:', decodedToken);

        // Verify the token (optional but recommended, based on your needs)
        // const verifiedToken = jwt.verify(idToken, clientSecret);  // Or the public key from LinkedIn's OpenID Connect discovery doc
        // console.log('Verified id_token:', verifiedToken);

        // Extract user information from the token
        if (typeof decodedToken?.payload === 'object' && decodedToken !== null) {
            // Safely extract user information from JwtPayload
            const sub = (decodedToken?.payload as JwtPayload).sub;
            const email = (decodedToken?.payload as JwtPayload).email;  // Only if email exists in the token
            const name = (decodedToken?.payload as JwtPayload).name;

            console.log('User ID:', sub);
            console.log('User Email:', email);
            console.log('User Name:', name);

            // Now you can use this information to authenticate the user in your system
            if (sub != null) {
                const customToken = await admin.auth().createCustomToken(sub, {
                    displayName: name,
                    email: email,
                });

                console.log("sub = ", sub);

                console.log('Generated Firebase custom token');
                res.json({ sub, accessToken, customToken });
            }


        } else {
            console.error('Token verification failed or is not of type JwtPayload');
        }



    } catch (error) {
        // Log error details for debugging
        if (axios.isAxiosError(error)) {
            // The error is an Axios error, so handle it as an Axios error
            console.error('Axios error:', error.response?.data || error);
            console.error('Status:', error.response?.status);
            res.status(500).send('Error exchanging code for access token');
        } else if (error instanceof Error) {
            // The error is a standard JS error (not Axios-specific)
            console.error('Standard error:', error.message);
            res.status(500).send('An error occurred during authentication');
        } else {
            // If the error type is completely unknown
            console.error('Unknown error', error);
            res.status(500).send('Unknown error occurred');
        }
    }
});

router.post('/post', async (req, res) => {
    const {linkedinPersonId, linkedInAccessToken, postContent } = req.body;
    console.log("person: ", linkedinPersonId)

    try {
        // Post to LinkedIn using the access token
        const response = await axios.post('https://api.linkedin.com/rest/posts',
            JSON.stringify({
                author: `urn:li:person:${linkedinPersonId}`,
                commentary: `${postContent}`,
                visibility: "PUBLIC",
                distribution: {
                    feedDistribution: "MAIN_FEED",
                    targetEntities: [],
                    thirdPartyDistributionChannels: []
                },
                lifecycleState: "PUBLISHED",
                isReshareDisabledByAuthor: false
            }),
            {
                headers: {
                    'X-Restli-Protocol-Version': '2.0.0',
                    'LinkedIn-Version': '202306',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer AQXzYcJO2dtibG7CMcvFLSl870Ccvuz6NAgoKw2_utYFGNI1v_qxE3IEkwhhRHE-VC3lQMMJxJh2VWnUI_MNsSHUQ2mvFFgxsKEJtb-HfiAJewEQ-aYV157wM-FwF7Wcrr85okeRn0FHy-ntr7Ng9OcgNxuclVqpfAp4LouoWuOqzUE3MxWJoy5Z4p0kyPvZrHRHhk0bx2DcQSKH-VmIGQLqunSSCX_HvOgFOgm6ZILf7nGgqNcq9mzJhozuHFz9ZhABF_7Qo904_cDV4SLOnBl8xXcm6OovGhzitCQCU_0vaoeVKUjQnpa683q9LHrIwGwX3Nha15LI0h1NY8aPRqPKz-2NXQ',
                }
            }
        );

        // Send success response back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error posting to LinkedIn:', error);
        res.status(500).send('Error posting to LinkedIn');
    }
});

export { router as LinkedinCallbackRouter }
