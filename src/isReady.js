import every from 'lodash/every';
import map from 'lodash/map';

export default ({ readyState, ...props }) => {
  return every(map(readyState, (rs, k) => (
    props[k] !== void 0 && typeof rs.error === 'undefined'
  )));
};
