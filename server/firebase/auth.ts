import { Request, Response, NextFunction, Router } from 'express';
import admin from 'firebase-admin';
import serviceAccount from './auth-config.json';
import { RegisterRequest } from '../../types/requestTypes/authTypes'

const router = Router()

// Extend the Request interface locally for this function
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
}); 

export const authenticateUserMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token', error });
  } 
};


router.post("/register", async (req: RegisterRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Create a new user with email and password
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Send success response with user details
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
      },
    });
  } catch (error:any) {
    // Handle Firebase error (e.g., email already exists)
    return res.status(500).json({
      message: 'Failed to create user',
      error: error.message,
    });
  }
});

export { router as authRouter }

// could potentially be used in the future
  // router.post('/login', async (req: RegisterRequestBody, res: Response) => {
  //   const { email, password } = req.body;
  
  //   if (!email || !password) {
  //     return res.status(400).json({ message: 'Email and password are required' });
  //   }
  
  //   try {
  //     // Create a custom token (requires client-side sign-in)
  //     const userRecord = await admin.auth().getUserByEmail(email);
  //     const token = await admin.auth().createCustomToken(userRecord.uid);

  //     // const userCredential = await auth.signInWithCustomToken(email, password);
  //     // const user = userCredential.user;
  //     // const idToken = await user.getIdToken(); // Get the ID token
  
  //     return res.status(200).json({
  //       message: 'Login successful',
  //       token,
  //     });
  //   } catch (error:any) {
  //     return res.status(401).json({
  //       message: 'Login failed',
  //       error: error.message,
  //     });
  //   }

  // });