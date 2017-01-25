import every from 'lodash/every';

export default ({ readyState, ...props }) => {
  return every(readyState, (rs, k) => (
    props[k] !== void 0 && rs.error === void 0
  ));
};
