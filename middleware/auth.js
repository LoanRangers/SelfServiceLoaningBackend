import jsonwbtoken from 'jsonwebtoken';
const { verify } = jsonwbtoken;

const authenticateJWT = (req, res, next) => {
  console.log(req.cookies)
  next()
  /*
  const authToken = req.cookies.auth_tokens.appAccessToken;

  if (authToken?.startsWith('Bearer ')) {
    const token = authToken.split(' ')[1];

    verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
  */
};

export default authenticateJWT;
