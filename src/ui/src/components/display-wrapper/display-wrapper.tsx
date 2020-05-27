import React from 'react';
import './display-wrapper.css';

export default function DisplayWrapper(props: any) {
  return (
    <div className="display-wrapper">
      { props.loading && <img src='/loading.gif'
                              className='display-loading'
                              alt='loading...'/> }
      { props.children }
    </div>
  );
}
