/*
 *
 * HomePage
 *
 */

import React, { memo } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { pluginName } from '../../pluginDetails';


const HomePage = () => {
  return (
    <div>
      <h1>{pluginName}</h1>
      <p>Happy coding</p>
    </div>
  );
};

export default memo(HomePage);
