import axios from 'axios';

export default () => {
  const baseURL = process.env.REACT_APP_HOST_NAME

  const newInstance = axios.create({ baseURL });
  return newInstance;
}