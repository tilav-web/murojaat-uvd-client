import axios, {
  type AxiosInstance,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { serverUrl } from "../utils/shared";

const responseInstance = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (res) => {
      return res;
    },
    (error) => {
      console.error(error);
      return Promise.reject(error);
    }
  );
};

const requestInstance = ({
  instance,
  headers,
}: {
  instance: AxiosInstance;
  headers: AxiosRequestHeaders;
}) => {
  instance.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      return {
        ...config,
        headers,
      };
    }
  );
};

const privateInstance: AxiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

const privateInstanceFile: AxiosInstance = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

responseInstance(privateInstance);
requestInstance({
  instance: privateInstance,
  headers: {
    "Content-Type": "application/json",
  } as AxiosRequestHeaders,
});

responseInstance(privateInstanceFile);
requestInstance({
  instance: privateInstanceFile,
  headers: {
    "Content-Type": "multipart/form-data",
  } as AxiosRequestHeaders,
});

export { privateInstance, privateInstanceFile };
