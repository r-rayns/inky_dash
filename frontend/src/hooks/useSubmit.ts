import { useState } from 'react';

export const useSubmit = <T, TArgs extends Array<unknown>>(submitFn:  (...args: TArgs) => Promise<T>) => {
  const [ responsePending, setResponsePending ] = useState<boolean>(false);
  const [ error, setError ] = useState<unknown | null>(null);

  const submit = async (...args: TArgs) => {
    setResponsePending(true);
    setError(null);

    try {
      return await submitFn(...args);
    } catch (err) {
      console.error('useSubmit hook error - ', err);
      setError(err ?? 'Something went wrong.');
    } finally {
      setResponsePending(false);
    }
  };

  return { submit, responsePending, setResponsePending, error };
};
