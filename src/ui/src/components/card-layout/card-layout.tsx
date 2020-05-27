import React from 'react';
import './card-layout.css';

export default function CardLayout(props: any) {
  return (
    <div className="card-layout">
      { props.children }
    </div>
  );
}
