import jsonwebtoken from 'jsonwebtoken';
const { sign, verify } = jsonwebtoken;

const generateAccessToken = (user) => {
  return (
    'Bearer ' +
    sign(user, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    })
  );
};

const generateRefreshToken = (user) => {
  return (
    'Bearer ' +
    sign(user, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    })
  );
};

export { generateAccessToken, generateRefreshToken };
