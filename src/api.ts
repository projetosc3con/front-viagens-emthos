import axios from 'axios';
import { auth } from './util/FirebaseConnection';

const api = axios.create({
  baseURL: 'https://api-viagens-emthos.vercel.app/',
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    // Sempre pega um token fresco (ou renovado autom.)
    const freshToken = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${freshToken}`;
  }

  return config;
});

export default api;