import * as bcrypt from 'bcrypt';

const saltRound = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
