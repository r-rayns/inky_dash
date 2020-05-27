import React from 'react';
import './form-container.css';

export default function FormContainer(props: any) {
  return (
    <div className="form-wrapper">
      { props.children }
    </div>
  );
}
