function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var camelToDashMap = new Map();
export function camelToDash(str) {
  var result = camelToDashMap.get(str);

  if (result === undefined) {
    result = str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    camelToDashMap.set(str, result);
  }

  return result;
}
export function pascalToDash(str) {
  return camelToDash(str.replace(/((?!([A-Z]{2}|^))[A-Z])/g, "-$1"));
}
export function dispatch(host, eventType) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return host.dispatchEvent(new CustomEvent(eventType, _objectSpread({
    bubbles: false
  }, options)));
}
export function shadyCSS(fn, fallback) {
  var shady = window.ShadyCSS;
  /* istanbul ignore next */

  if (shady && !shady.nativeShadow) {
    return fn(shady);
  }

  return fallback;
}
export function stringifyElement(target) {
  return "<".concat(String(target.tagName).toLowerCase(), ">");
}
export var IS_IE = ("ActiveXObject" in window);
export var deferred = Promise.resolve();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJjYW1lbFRvRGFzaE1hcCIsIk1hcCIsImNhbWVsVG9EYXNoIiwic3RyIiwicmVzdWx0IiwiZ2V0IiwidW5kZWZpbmVkIiwicmVwbGFjZSIsInRvTG93ZXJDYXNlIiwic2V0IiwicGFzY2FsVG9EYXNoIiwiZGlzcGF0Y2giLCJob3N0IiwiZXZlbnRUeXBlIiwib3B0aW9ucyIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImJ1YmJsZXMiLCJzaGFkeUNTUyIsImZuIiwiZmFsbGJhY2siLCJzaGFkeSIsIndpbmRvdyIsIlNoYWR5Q1NTIiwibmF0aXZlU2hhZG93Iiwic3RyaW5naWZ5RWxlbWVudCIsInRhcmdldCIsIlN0cmluZyIsInRhZ05hbWUiLCJJU19JRSIsImRlZmVycmVkIiwiUHJvbWlzZSIsInJlc29sdmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU1BLGNBQWMsR0FBRyxJQUFJQyxHQUFKLEVBQXZCO0FBQ0EsT0FBTyxTQUFTQyxXQUFULENBQXFCQyxHQUFyQixFQUEwQjtBQUMvQixNQUFJQyxNQUFNLEdBQUdKLGNBQWMsQ0FBQ0ssR0FBZixDQUFtQkYsR0FBbkIsQ0FBYjs7QUFDQSxNQUFJQyxNQUFNLEtBQUtFLFNBQWYsRUFBMEI7QUFDeEJGLElBQUFBLE1BQU0sR0FBR0QsR0FBRyxDQUFDSSxPQUFKLENBQVksaUJBQVosRUFBK0IsT0FBL0IsRUFBd0NDLFdBQXhDLEVBQVQ7QUFDQVIsSUFBQUEsY0FBYyxDQUFDUyxHQUFmLENBQW1CTixHQUFuQixFQUF3QkMsTUFBeEI7QUFDRDs7QUFDRCxTQUFPQSxNQUFQO0FBQ0Q7QUFFRCxPQUFPLFNBQVNNLFlBQVQsQ0FBc0JQLEdBQXRCLEVBQTJCO0FBQ2hDLFNBQU9ELFdBQVcsQ0FBQ0MsR0FBRyxDQUFDSSxPQUFKLENBQVksMEJBQVosRUFBd0MsS0FBeEMsQ0FBRCxDQUFsQjtBQUNEO0FBRUQsT0FBTyxTQUFTSSxRQUFULENBQWtCQyxJQUFsQixFQUF3QkMsU0FBeEIsRUFBaUQ7QUFBQSxNQUFkQyxPQUFjLHVFQUFKLEVBQUk7QUFDdEQsU0FBT0YsSUFBSSxDQUFDRyxhQUFMLENBQ0wsSUFBSUMsV0FBSixDQUFnQkgsU0FBaEI7QUFBNkJJLElBQUFBLE9BQU8sRUFBRTtBQUF0QyxLQUFnREgsT0FBaEQsRUFESyxDQUFQO0FBR0Q7QUFFRCxPQUFPLFNBQVNJLFFBQVQsQ0FBa0JDLEVBQWxCLEVBQXNCQyxRQUF0QixFQUFnQztBQUNyQyxNQUFNQyxLQUFLLEdBQUdDLE1BQU0sQ0FBQ0MsUUFBckI7QUFFQTs7QUFDQSxNQUFJRixLQUFLLElBQUksQ0FBQ0EsS0FBSyxDQUFDRyxZQUFwQixFQUFrQztBQUNoQyxXQUFPTCxFQUFFLENBQUNFLEtBQUQsQ0FBVDtBQUNEOztBQUVELFNBQU9ELFFBQVA7QUFDRDtBQUVELE9BQU8sU0FBU0ssZ0JBQVQsQ0FBMEJDLE1BQTFCLEVBQWtDO0FBQ3ZDLG9CQUFXQyxNQUFNLENBQUNELE1BQU0sQ0FBQ0UsT0FBUixDQUFOLENBQXVCcEIsV0FBdkIsRUFBWDtBQUNEO0FBRUQsT0FBTyxJQUFNcUIsS0FBSyxJQUFHLG1CQUFtQlAsTUFBdEIsQ0FBWDtBQUNQLE9BQU8sSUFBTVEsUUFBUSxHQUFHQyxPQUFPLENBQUNDLE9BQVIsRUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjYW1lbFRvRGFzaE1hcCA9IG5ldyBNYXAoKTtcbmV4cG9ydCBmdW5jdGlvbiBjYW1lbFRvRGFzaChzdHIpIHtcbiAgbGV0IHJlc3VsdCA9IGNhbWVsVG9EYXNoTWFwLmdldChzdHIpO1xuICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICByZXN1bHQgPSBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgXCIkMS0kMlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNhbWVsVG9EYXNoTWFwLnNldChzdHIsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhc2NhbFRvRGFzaChzdHIpIHtcbiAgcmV0dXJuIGNhbWVsVG9EYXNoKHN0ci5yZXBsYWNlKC8oKD8hKFtBLVpdezJ9fF4pKVtBLVpdKS9nLCBcIi0kMVwiKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaChob3N0LCBldmVudFR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICByZXR1cm4gaG9zdC5kaXNwYXRjaEV2ZW50KFxuICAgIG5ldyBDdXN0b21FdmVudChldmVudFR5cGUsIHsgYnViYmxlczogZmFsc2UsIC4uLm9wdGlvbnMgfSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGFkeUNTUyhmbiwgZmFsbGJhY2spIHtcbiAgY29uc3Qgc2hhZHkgPSB3aW5kb3cuU2hhZHlDU1M7XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHNoYWR5ICYmICFzaGFkeS5uYXRpdmVTaGFkb3cpIHtcbiAgICByZXR1cm4gZm4oc2hhZHkpO1xuICB9XG5cbiAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5RWxlbWVudCh0YXJnZXQpIHtcbiAgcmV0dXJuIGA8JHtTdHJpbmcodGFyZ2V0LnRhZ05hbWUpLnRvTG93ZXJDYXNlKCl9PmA7XG59XG5cbmV4cG9ydCBjb25zdCBJU19JRSA9IFwiQWN0aXZlWE9iamVjdFwiIGluIHdpbmRvdztcbmV4cG9ydCBjb25zdCBkZWZlcnJlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuIl19