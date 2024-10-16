import sha1 from 'sha1';

/* eslint-disable import/prefer-default-export */
export const getUserFromAuth = async (req) => {
  const auth = req.header('Authorization') || null;
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Basic') return null;
  const cred = Buffer.from(parts[1], 'base64').toString('utf-8');
  if (!cred) return null;
  const [email, password] = cred.split(':');
  if (!email || !password) return null;
  return { email, password: sha1(password) };
};
