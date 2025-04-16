import prisma from '../services/dbservice.js';
import express from 'express';
import axios from 'axios';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import cookieParser from 'cookie-parser';

import jwt from 'jsonwebtoken';
const { verify } = jwt;

const jsonParser = express.json();

const router = express.Router();
router.use(jsonParser);
router.use(cookieParser());

const GITLAB_BASE_URL = 'https://gitlab-ext.utu.fi';
const CLIENT_ID = process.env.GITLAB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/callback';

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
    const appAccessToken = generateAccessToken(user);
    const appRefreshToken = generateRefreshToken(user);

    console.log(user);

    const dbUser = await prisma.users.findUnique({ where: { ssoId: user.nickname } });

    if (!dbUser) {
      dbUser = await prisma.users.create({
        data: { ssoId: user.nickname, ssoName: user.name },
      });
    }

    const tokens = {
      OAuth: access_token,
      appAccessToken: appAccessToken,
      appRefreshToken: appRefreshToken,
    };

    // Step 5: Set user session (or send JWT)
    res.cookie('auth_tokens', tokens, { httpOnly: true, secure: false });
    res.redirect(`https://localhost:5173/`);
  } catch (error) {
    console.error('GitLab OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'GitLab authentication failed' });
  }
});

router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(403);

  verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const newAccessToken = generateAccessToken({ id: user.id, username: user.username, role: user.role });
    res.json({ accessToken: newAccessToken });
  });
});

router.get('/me', async (req, res) => {
  const token = req.cookies.auth_tokens.OAuth;
  console.log(req.cookies);

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

router.post('/logout', async (req, res) => {
  res.clearCookie('auth_tokens', { httpOnly: true, secure: false });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
