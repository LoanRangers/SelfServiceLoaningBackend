import jsonwbetoken from 'jsonwebtoken';
const { verify } = jsonwbetoken;

const authenticateJWT = (req, res, next) => {
  const authToken = req.cookies.auth_tokens.appAccessToken;

  if (authToken?.startsWith('Bearer ')) {
    const token = authToken.split(' ')[1];

    verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user.nickname;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJWT;
