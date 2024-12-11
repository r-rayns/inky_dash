import { useState } from 'react';

export const useSubmit = <T, A extends unknown[]>(submitFn:  (...args: A) => Promise<T>) => {
  const [ responsePending, setResponsePending ] = useState<boolean>(false);
  const [ error, setError ] = useState<unknown | null>(null);

  const submit = async (...args: A) => {
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

  return { submit, responsePending, error };
};
