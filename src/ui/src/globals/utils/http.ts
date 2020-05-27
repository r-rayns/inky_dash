import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { api } from '../environment';
import { Dispatch } from 'redux';
import { dispatchHttpError } from '../../services/errors/errors.actions';

function httpRequest(request: Function): Promise<any> {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const res: AxiosResponse = await request();
      resolve(res.data)
    } catch (err) {
      reject(handleHttpError(err));
    }
  })
}

function handleHttpError(error: AxiosError): string {
  const defaultMessage: string = 'Failed http request';
  if (error?.response?.data) {
    return error.response.data.errors ?? defaultMessage
  }

  return defaultMessage;
}

export function GET(path: string, dispatch: Dispatch,
                    options?: AxiosRequestConfig): Promise<any> {
  const url: string = `${ api }/${ path }`;
  return httpRequest(() => axios.get(url, options))
    .catch(err => dispatchHttpError(dispatch, err));
}

export function POST(path: string, data: {}, dispatch: Dispatch,
                     options?: AxiosRequestConfig): Promise<any> {
  const url: string = `${ api }/${ path }`;
  return httpRequest(() => axios.post(url, data, options))
    .catch(err => dispatchHttpError(dispatch, err));
}
