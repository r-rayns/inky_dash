import { useState } from 'react';

type FormState = {
  [key: string]: unknown;
};

function useFormState<T extends FormState>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const setFormState = (name: keyof T, value: unknown) => {
    setState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return [state, setFormState];
}
