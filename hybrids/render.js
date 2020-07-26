function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

export default function render(fn) {
  var customOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof fn !== "function") {
    throw TypeError("The first argument must be a function: ".concat(_typeof(fn)));
  }

  var options = _objectSpread({
    shadowRoot: true
  }, customOptions);

  var shadowRootInit = {
    mode: "open"
  };

  if (_typeof(options.shadowRoot) === "object") {
    Object.assign(shadowRootInit, options.shadowRoot);
  }

  return {
    get: function get(host) {
      var update = fn(host);
      var target = host;

      if (options.shadowRoot) {
        if (!host.shadowRoot) host.attachShadow(shadowRootInit);
        target = host.shadowRoot;
      }

      return function flush() {
        update(host, target);
        return target;
      };
    },
    observe: function observe(host, flush) {
      flush();
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZW5kZXIuanMiXSwibmFtZXMiOlsicmVuZGVyIiwiZm4iLCJjdXN0b21PcHRpb25zIiwiVHlwZUVycm9yIiwib3B0aW9ucyIsInNoYWRvd1Jvb3QiLCJzaGFkb3dSb290SW5pdCIsIm1vZGUiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXQiLCJob3N0IiwidXBkYXRlIiwidGFyZ2V0IiwiYXR0YWNoU2hhZG93IiwiZmx1c2giLCJvYnNlcnZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLGVBQWUsU0FBU0EsTUFBVCxDQUFnQkMsRUFBaEIsRUFBd0M7QUFBQSxNQUFwQkMsYUFBb0IsdUVBQUosRUFBSTs7QUFDckQsTUFBSSxPQUFPRCxFQUFQLEtBQWMsVUFBbEIsRUFBOEI7QUFDNUIsVUFBTUUsU0FBUywwREFBa0RGLEVBQWxELEdBQWY7QUFDRDs7QUFFRCxNQUFNRyxPQUFPO0FBQUtDLElBQUFBLFVBQVUsRUFBRTtBQUFqQixLQUEwQkgsYUFBMUIsQ0FBYjs7QUFDQSxNQUFNSSxjQUFjLEdBQUc7QUFBRUMsSUFBQUEsSUFBSSxFQUFFO0FBQVIsR0FBdkI7O0FBRUEsTUFBSSxRQUFPSCxPQUFPLENBQUNDLFVBQWYsTUFBOEIsUUFBbEMsRUFBNEM7QUFDMUNHLElBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjSCxjQUFkLEVBQThCRixPQUFPLENBQUNDLFVBQXRDO0FBQ0Q7O0FBRUQsU0FBTztBQUNMSyxJQUFBQSxHQURLLGVBQ0RDLElBREMsRUFDSztBQUNSLFVBQU1DLE1BQU0sR0FBR1gsRUFBRSxDQUFDVSxJQUFELENBQWpCO0FBQ0EsVUFBSUUsTUFBTSxHQUFHRixJQUFiOztBQUVBLFVBQUlQLE9BQU8sQ0FBQ0MsVUFBWixFQUF3QjtBQUN0QixZQUFJLENBQUNNLElBQUksQ0FBQ04sVUFBVixFQUFzQk0sSUFBSSxDQUFDRyxZQUFMLENBQWtCUixjQUFsQjtBQUN0Qk8sUUFBQUEsTUFBTSxHQUFHRixJQUFJLENBQUNOLFVBQWQ7QUFDRDs7QUFFRCxhQUFPLFNBQVNVLEtBQVQsR0FBaUI7QUFDdEJILFFBQUFBLE1BQU0sQ0FBQ0QsSUFBRCxFQUFPRSxNQUFQLENBQU47QUFDQSxlQUFPQSxNQUFQO0FBQ0QsT0FIRDtBQUlELEtBZEk7QUFlTEcsSUFBQUEsT0FmSyxtQkFlR0wsSUFmSCxFQWVTSSxLQWZULEVBZWdCO0FBQ25CQSxNQUFBQSxLQUFLO0FBQ047QUFqQkksR0FBUDtBQW1CRCIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcihmbiwgY3VzdG9tT3B0aW9ucyA9IHt9KSB7XG4gIGlmICh0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikge1xuICAgIHRocm93IFR5cGVFcnJvcihgVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbjogJHt0eXBlb2YgZm59YCk7XG4gIH1cblxuICBjb25zdCBvcHRpb25zID0geyBzaGFkb3dSb290OiB0cnVlLCAuLi5jdXN0b21PcHRpb25zIH07XG4gIGNvbnN0IHNoYWRvd1Jvb3RJbml0ID0geyBtb2RlOiBcIm9wZW5cIiB9O1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5zaGFkb3dSb290ID09PSBcIm9iamVjdFwiKSB7XG4gICAgT2JqZWN0LmFzc2lnbihzaGFkb3dSb290SW5pdCwgb3B0aW9ucy5zaGFkb3dSb290KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0KGhvc3QpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZSA9IGZuKGhvc3QpO1xuICAgICAgbGV0IHRhcmdldCA9IGhvc3Q7XG5cbiAgICAgIGlmIChvcHRpb25zLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgaWYgKCFob3N0LnNoYWRvd1Jvb3QpIGhvc3QuYXR0YWNoU2hhZG93KHNoYWRvd1Jvb3RJbml0KTtcbiAgICAgICAgdGFyZ2V0ID0gaG9zdC5zaGFkb3dSb290O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIHVwZGF0ZShob3N0LCB0YXJnZXQpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfTtcbiAgICB9LFxuICAgIG9ic2VydmUoaG9zdCwgZmx1c2gpIHtcbiAgICAgIGZsdXNoKCk7XG4gICAgfSxcbiAgfTtcbn1cbiJdfQ==