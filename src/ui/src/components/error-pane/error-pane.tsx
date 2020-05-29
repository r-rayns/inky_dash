import React, { Dispatch } from 'react';
import './error-pane.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers';

export default function ErrorPane(props: any) {
  const [ showError, setShowError ]: [ boolean, Dispatch<any> ]
    = React.useState(false);
  const errorMessage: string | null = useSelector((state: RootState) => {
    return state.errorsSlice.error;
  })

  React.useEffect(() => {
    if (errorMessage) setShowError(true);

    const hide = setTimeout(() => {
      setShowError(false);
    }, 5000)

    return function cleanup() {
      // clear timeout in-case we get another error whilst current error is visible
      clearTimeout(hide);
    }
  }, [ errorMessage ])

  return (
    <div className="error-pane"
         style={ { opacity: showError ? 1 : 0 } }>
      { errorMessage }
    </div>
  );
}
