import prisma from '../services/dbservice.js';
import express from 'express';
import axios from 'axios';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

const GITLAB_BASE_URL = 'https://gitlab-ext.utu.fi';
const CLIENT_ID = process.env.GITLAB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET;
const REDIRECT_URI = process.env.APP_URL + ':' + process.env.APP_PORT + '/auth/callback';

router.get('/gitlab', (req, res) => {
  const gitlabAuthUrl = `${GITLAB_BASE_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(gitlabAuthUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    // Step 3: Exchange code for access token
    const tokenResponse = await axios.post(`${GITLAB_BASE_URL}/oauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const { access_token } = tokenResponse.data;

    // Step 4: Fetch user info from GitLab
    const userInfoResponse = await axios.get(`${GITLAB_BASE_URL}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userInfoResponse.data;
    console.log(user);

    let dbUser = await prisma.users.findUnique({ where: { ssoId: user.nickname } });

    if (!dbUser) {
      dbUser = await prisma.users.create({
        data: { ssoId: user.nickname, ssoName: user.name },
      });
    }

    // Step 5: Set user session (or send JWT)
    res.cookie('auth_token', access_token, { httpOnly: false, secure: true });
    res.redirect(process.env.FRONTEND_URL + ':' + process.env.FRONTEND_PORT + '/');
  } catch (error) {
    console.error('GitLab OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'GitLab authentication failed' });
  }
});

router.get('/me', async (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userResponse = await axios.get(`${GITLAB_BASE_URL}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(userResponse.data);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, secure: false });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
