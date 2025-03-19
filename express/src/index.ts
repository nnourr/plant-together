import express from 'express';
import { FireauthRepo } from './firebase/fireauth.repo.js';
import { AuthService } from './user/auth.service.js'; 

const app = express();
app.use(express.json());

// Create the Fireauth dependency instance.
const fireauth = FireauthRepo  .instance();

// Inject the dependency into the AuthService.
const authService = new AuthService(fireauth);

app.post('/signup', async (req, res) => {
  try {
    // Use the method on the injected AuthService instance.
    const token = await authService.signUpWithEmailPassword(
      req.body.displayName,
      req.body.email,
      req.body.password
    );
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/login', async (req, res) => {
  try {
    const token = await authService.loginWithEmailPassword(
      req.body.email,
      req.body.password
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
