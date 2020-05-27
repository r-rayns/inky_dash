import React from 'react';
import './card.css';

export default function Card(props: any) {
  return (
    <div className="card-wrapper">
      { props.children }
    </div>
  );
}
