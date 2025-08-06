import React from 'react';

interface DividerProps {
  tw_width: string;
}

const Divider: React.FC<DividerProps> = ({ tw_width = '' }) => (
  <hr
    className={`border-t-2 border-border-primary ${tw_width}`}
    aria-hidden="true"
  />
);

export default Divider;
