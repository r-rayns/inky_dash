import React from 'react';

export const useStateWithLocalStorage = (localStorageKey: string,
                                         defaultValue: any = ''): [ any, any ] => {
  const [ value, setValue ] = React.useState(
    localStorage.getItem(localStorageKey) || defaultValue
  )

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [ localStorageKey, value ])

  return [ value, setValue ];
}
