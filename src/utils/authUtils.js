import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};