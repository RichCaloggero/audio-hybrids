function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import property from "./property.js";
import render from "./render.js";
import * as cache from "./cache.js";
import { pascalToDash, deferred } from "./utils.js";
/* istanbul ignore next */

try {
  process.env.NODE_ENV;
} catch (e) {
  var process = {
    env: {
      NODE_ENV: 'production'
    }
  };
} // eslint-disable-line


var defaultMethod = function defaultMethod(host, value) {
  return value;
};

var callbacksMap = new WeakMap();
var propsMap = new WeakMap();

function compile(Hybrid, descriptors) {
  Hybrid.hybrids = descriptors;
  var callbacks = [];
  var props = Object.keys(descriptors);
  callbacksMap.set(Hybrid, callbacks);
  propsMap.set(Hybrid, props);
  props.forEach(function (key) {
    var desc = descriptors[key];

    var type = _typeof(desc);

    var config;

    if (type === "function") {
      config = key === "render" ? render(desc) : {
        get: desc
      };
    } else if (type !== "object" || desc === null || Array.isArray(desc)) {
      config = property(desc);
    } else {
      config = {
        get: desc.get || defaultMethod,
        set: desc.set || !desc.get && defaultMethod || undefined,
        connect: desc.connect,
        observe: desc.observe
      };
    }

    Object.defineProperty(Hybrid.prototype, key, {
      get: function get() {
        return cache.get(this, key, config.get);
      },
      set: config.set && function set(newValue) {
        cache.set(this, key, config.set, newValue);
      },
      enumerable: true,
      configurable: process.env.NODE_ENV !== "production"
    });

    if (config.observe) {
      callbacks.unshift(function (host) {
        return cache.observe(host, key, config.get, config.observe);
      });
    }

    if (config.connect) {
      callbacks.push(function (host) {
        return config.connect(host, key, function () {
          cache.invalidate(host, key);
        });
      });
    }
  });
}

var update;
/* istanbul ignore else */

if (process.env.NODE_ENV !== "production") {
  var walkInShadow = function walkInShadow(node, fn) {
    fn(node);
    Array.from(node.children).forEach(function (el) {
      return walkInShadow(el, fn);
    });

    if (node.shadowRoot) {
      Array.from(node.shadowRoot.children).forEach(function (el) {
        return walkInShadow(el, fn);
      });
    }
  };

  var updateQueue = new Map();

  update = function update(Hybrid, lastHybrids) {
    if (!updateQueue.size) {
      deferred.then(function () {
        walkInShadow(document.body, function (node) {
          if (updateQueue.has(node.constructor)) {
            var hybrids = updateQueue.get(node.constructor);
            node.disconnectedCallback();
            Object.keys(node.constructor.hybrids).forEach(function (key) {
              cache.invalidate(node, key, node.constructor.hybrids[key] !== hybrids[key]);
            });
            node.connectedCallback();
          }
        });
        updateQueue.clear();
      });
    }

    updateQueue.set(Hybrid, lastHybrids);
  };
}

var disconnects = new WeakMap();

function defineElement(tagName, hybridsOrConstructor) {
  var type = _typeof(hybridsOrConstructor);

  if (type !== "object" && type !== "function") {
    throw TypeError("Second argument must be an object or a function: ".concat(type));
  }

  var CustomElement = window.customElements.get(tagName);

  if (type === "function") {
    if (CustomElement !== hybridsOrConstructor) {
      return window.customElements.define(tagName, hybridsOrConstructor);
    }

    return CustomElement;
  }

  if (CustomElement) {
    if (CustomElement.hybrids === hybridsOrConstructor) {
      return CustomElement;
    }

    if (process.env.NODE_ENV !== "production" && CustomElement.hybrids) {
      Object.keys(CustomElement.hybrids).forEach(function (key) {
        delete CustomElement.prototype[key];
      });
      var lastHybrids = CustomElement.hybrids;
      compile(CustomElement, hybridsOrConstructor);
      update(CustomElement, lastHybrids);
      return CustomElement;
    }

    throw Error("Element '".concat(tagName, "' already defined"));
  }

  var Hybrid = /*#__PURE__*/function (_HTMLElement) {
    _inherits(Hybrid, _HTMLElement);

    var _super = _createSuper(Hybrid);

    _createClass(Hybrid, null, [{
      key: "name",
      get: function get() {
        return tagName;
      }
    }]);

    function Hybrid() {
      var _this;

      _classCallCheck(this, Hybrid);

      _this = _super.call(this);
      var props = propsMap.get(Hybrid);

      for (var index = 0; index < props.length; index += 1) {
        var key = props[index];

        if (Object.prototype.hasOwnProperty.call(_assertThisInitialized(_this), key)) {
          var value = _this[key];
          delete _this[key];
          _this[key] = value;
        }
      }

      return _this;
    }

    _createClass(Hybrid, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var callbacks = callbacksMap.get(Hybrid);
        var list = [];

        for (var index = 0; index < callbacks.length; index += 1) {
          var cb = callbacks[index](this);
          if (cb) list.push(cb);
        }

        disconnects.set(this, list);
      }
    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        var list = disconnects.get(this);

        for (var index = 0; index < list.length; index += 1) {
          list[index]();
        }
      }
    }]);

    return Hybrid;
  }( /*#__PURE__*/_wrapNativeSuper(HTMLElement));

  compile(Hybrid, hybridsOrConstructor);
  customElements.define(tagName, Hybrid);
  return Hybrid;
}

function defineMap(elements) {
  return Object.keys(elements).reduce(function (acc, key) {
    var tagName = pascalToDash(key);
    acc[key] = defineElement(tagName, elements[key]);
    return acc;
  }, {});
}

export default function define() {
  if (_typeof(arguments.length <= 0 ? undefined : arguments[0]) === "object") {
    return defineMap(arguments.length <= 0 ? undefined : arguments[0]);
  }

  return defineElement.apply(void 0, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZpbmUuanMiXSwibmFtZXMiOlsicHJvcGVydHkiLCJyZW5kZXIiLCJjYWNoZSIsInBhc2NhbFRvRGFzaCIsImRlZmVycmVkIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwiZSIsImRlZmF1bHRNZXRob2QiLCJob3N0IiwidmFsdWUiLCJjYWxsYmFja3NNYXAiLCJXZWFrTWFwIiwicHJvcHNNYXAiLCJjb21waWxlIiwiSHlicmlkIiwiZGVzY3JpcHRvcnMiLCJoeWJyaWRzIiwiY2FsbGJhY2tzIiwicHJvcHMiLCJPYmplY3QiLCJrZXlzIiwic2V0IiwiZm9yRWFjaCIsImtleSIsImRlc2MiLCJ0eXBlIiwiY29uZmlnIiwiZ2V0IiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwiY29ubmVjdCIsIm9ic2VydmUiLCJkZWZpbmVQcm9wZXJ0eSIsInByb3RvdHlwZSIsIm5ld1ZhbHVlIiwiZW51bWVyYWJsZSIsImNvbmZpZ3VyYWJsZSIsInVuc2hpZnQiLCJwdXNoIiwiaW52YWxpZGF0ZSIsInVwZGF0ZSIsIndhbGtJblNoYWRvdyIsIm5vZGUiLCJmbiIsImZyb20iLCJjaGlsZHJlbiIsImVsIiwic2hhZG93Um9vdCIsInVwZGF0ZVF1ZXVlIiwiTWFwIiwibGFzdEh5YnJpZHMiLCJzaXplIiwidGhlbiIsImRvY3VtZW50IiwiYm9keSIsImhhcyIsImNvbnN0cnVjdG9yIiwiZGlzY29ubmVjdGVkQ2FsbGJhY2siLCJjb25uZWN0ZWRDYWxsYmFjayIsImNsZWFyIiwiZGlzY29ubmVjdHMiLCJkZWZpbmVFbGVtZW50IiwidGFnTmFtZSIsImh5YnJpZHNPckNvbnN0cnVjdG9yIiwiVHlwZUVycm9yIiwiQ3VzdG9tRWxlbWVudCIsIndpbmRvdyIsImN1c3RvbUVsZW1lbnRzIiwiZGVmaW5lIiwiRXJyb3IiLCJpbmRleCIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImxpc3QiLCJjYiIsIkhUTUxFbGVtZW50IiwiZGVmaW5l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LENBQUgsR0FBV3VDLGFBQWEsQ0FBQ0MsT0FBRCxFQUFVZ0IsUUFBUSxDQUFDeEQsR0FBRCxDQUFsQixDQUF4QjtBQUVBLFdBQU8wRCxHQUFQO0FBQ0QsR0FMTSxFQUtKLEVBTEksQ0FBUDtBQU1EOztBQUVELGVBQWUsU0FBU1osTUFBVCxHQUF5QjtBQUN0QyxNQUFJLDhEQUFtQixRQUF2QixFQUFpQztBQUMvQixXQUFPUyxTQUFTLGtEQUFoQjtBQUNEOztBQUVELFNBQU9oQixhQUFhLE1BQWIsbUJBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eS5qc1wiO1xuaW1wb3J0IHJlbmRlciBmcm9tIFwiLi9yZW5kZXIuanNcIjtcblxuaW1wb3J0ICogYXMgY2FjaGUgZnJvbSBcIi4vY2FjaGUuanNcIjtcbmltcG9ydCB7IHBhc2NhbFRvRGFzaCwgZGVmZXJyZWQgfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xudHJ5IHsgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfSBjYXRjaChlKSB7IHZhciBwcm9jZXNzID0geyBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJyB9IH07IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG5jb25zdCBkZWZhdWx0TWV0aG9kID0gKGhvc3QsIHZhbHVlKSA9PiB2YWx1ZTtcblxuY29uc3QgY2FsbGJhY2tzTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHByb3BzTWFwID0gbmV3IFdlYWtNYXAoKTtcblxuZnVuY3Rpb24gY29tcGlsZShIeWJyaWQsIGRlc2NyaXB0b3JzKSB7XG4gIEh5YnJpZC5oeWJyaWRzID0gZGVzY3JpcHRvcnM7XG5cbiAgY29uc3QgY2FsbGJhY2tzID0gW107XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXMoZGVzY3JpcHRvcnMpO1xuXG4gIGNhbGxiYWNrc01hcC5zZXQoSHlicmlkLCBjYWxsYmFja3MpO1xuICBwcm9wc01hcC5zZXQoSHlicmlkLCBwcm9wcyk7XG5cbiAgcHJvcHMuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IGRlc2MgPSBkZXNjcmlwdG9yc1trZXldO1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgZGVzYztcblxuICAgIGxldCBjb25maWc7XG5cbiAgICBpZiAodHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjb25maWcgPSBrZXkgPT09IFwicmVuZGVyXCIgPyByZW5kZXIoZGVzYykgOiB7IGdldDogZGVzYyB9O1xuICAgIH0gZWxzZSBpZiAodHlwZSAhPT0gXCJvYmplY3RcIiB8fCBkZXNjID09PSBudWxsIHx8IEFycmF5LmlzQXJyYXkoZGVzYykpIHtcbiAgICAgIGNvbmZpZyA9IHByb3BlcnR5KGRlc2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWcgPSB7XG4gICAgICAgIGdldDogZGVzYy5nZXQgfHwgZGVmYXVsdE1ldGhvZCxcbiAgICAgICAgc2V0OiBkZXNjLnNldCB8fCAoIWRlc2MuZ2V0ICYmIGRlZmF1bHRNZXRob2QpIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgY29ubmVjdDogZGVzYy5jb25uZWN0LFxuICAgICAgICBvYnNlcnZlOiBkZXNjLm9ic2VydmUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIeWJyaWQucHJvdG90eXBlLCBrZXksIHtcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gY2FjaGUuZ2V0KHRoaXMsIGtleSwgY29uZmlnLmdldCk7XG4gICAgICB9LFxuICAgICAgc2V0OlxuICAgICAgICBjb25maWcuc2V0ICYmXG4gICAgICAgIGZ1bmN0aW9uIHNldChuZXdWYWx1ZSkge1xuICAgICAgICAgIGNhY2hlLnNldCh0aGlzLCBrZXksIGNvbmZpZy5zZXQsIG5ld1ZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIixcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcub2JzZXJ2ZSkge1xuICAgICAgY2FsbGJhY2tzLnVuc2hpZnQoaG9zdCA9PlxuICAgICAgICBjYWNoZS5vYnNlcnZlKGhvc3QsIGtleSwgY29uZmlnLmdldCwgY29uZmlnLm9ic2VydmUpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNvbm5lY3QpIHtcbiAgICAgIGNhbGxiYWNrcy5wdXNoKGhvc3QgPT5cbiAgICAgICAgY29uZmlnLmNvbm5lY3QoaG9zdCwga2V5LCAoKSA9PiB7XG4gICAgICAgICAgY2FjaGUuaW52YWxpZGF0ZShob3N0LCBrZXkpO1xuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn1cblxubGV0IHVwZGF0ZTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gIGNvbnN0IHdhbGtJblNoYWRvdyA9IChub2RlLCBmbikgPT4ge1xuICAgIGZuKG5vZGUpO1xuXG4gICAgQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKS5mb3JFYWNoKGVsID0+IHdhbGtJblNoYWRvdyhlbCwgZm4pKTtcblxuICAgIGlmIChub2RlLnNoYWRvd1Jvb3QpIHtcbiAgICAgIEFycmF5LmZyb20obm9kZS5zaGFkb3dSb290LmNoaWxkcmVuKS5mb3JFYWNoKGVsID0+IHdhbGtJblNoYWRvdyhlbCwgZm4pKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgdXBkYXRlUXVldWUgPSBuZXcgTWFwKCk7XG4gIHVwZGF0ZSA9IChIeWJyaWQsIGxhc3RIeWJyaWRzKSA9PiB7XG4gICAgaWYgKCF1cGRhdGVRdWV1ZS5zaXplKSB7XG4gICAgICBkZWZlcnJlZC50aGVuKCgpID0+IHtcbiAgICAgICAgd2Fsa0luU2hhZG93KGRvY3VtZW50LmJvZHksIG5vZGUgPT4ge1xuICAgICAgICAgIGlmICh1cGRhdGVRdWV1ZS5oYXMobm9kZS5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGh5YnJpZHMgPSB1cGRhdGVRdWV1ZS5nZXQobm9kZS5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICBub2RlLmRpc2Nvbm5lY3RlZENhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG5vZGUuY29uc3RydWN0b3IuaHlicmlkcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICBjYWNoZS5pbnZhbGlkYXRlKFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIG5vZGUuY29uc3RydWN0b3IuaHlicmlkc1trZXldICE9PSBoeWJyaWRzW2tleV0sXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbm9kZS5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHVwZGF0ZVF1ZXVlLmNsZWFyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdXBkYXRlUXVldWUuc2V0KEh5YnJpZCwgbGFzdEh5YnJpZHMpO1xuICB9O1xufVxuXG5jb25zdCBkaXNjb25uZWN0cyA9IG5ldyBXZWFrTWFwKCk7XG5cbmZ1bmN0aW9uIGRlZmluZUVsZW1lbnQodGFnTmFtZSwgaHlicmlkc09yQ29uc3RydWN0b3IpIHtcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiBoeWJyaWRzT3JDb25zdHJ1Y3RvcjtcbiAgaWYgKHR5cGUgIT09IFwib2JqZWN0XCIgJiYgdHlwZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKGBTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbjogJHt0eXBlfWApO1xuICB9XG5cbiAgY29uc3QgQ3VzdG9tRWxlbWVudCA9IHdpbmRvdy5jdXN0b21FbGVtZW50cy5nZXQodGFnTmFtZSk7XG5cbiAgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGlmIChDdXN0b21FbGVtZW50ICE9PSBoeWJyaWRzT3JDb25zdHJ1Y3Rvcikge1xuICAgICAgcmV0dXJuIHdpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUodGFnTmFtZSwgaHlicmlkc09yQ29uc3RydWN0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gQ3VzdG9tRWxlbWVudDtcbiAgfVxuXG4gIGlmIChDdXN0b21FbGVtZW50KSB7XG4gICAgaWYgKEN1c3RvbUVsZW1lbnQuaHlicmlkcyA9PT0gaHlicmlkc09yQ29uc3RydWN0b3IpIHtcbiAgICAgIHJldHVybiBDdXN0b21FbGVtZW50O1xuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmIEN1c3RvbUVsZW1lbnQuaHlicmlkcykge1xuICAgICAgT2JqZWN0LmtleXMoQ3VzdG9tRWxlbWVudC5oeWJyaWRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGRlbGV0ZSBDdXN0b21FbGVtZW50LnByb3RvdHlwZVtrZXldO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGxhc3RIeWJyaWRzID0gQ3VzdG9tRWxlbWVudC5oeWJyaWRzO1xuXG4gICAgICBjb21waWxlKEN1c3RvbUVsZW1lbnQsIGh5YnJpZHNPckNvbnN0cnVjdG9yKTtcbiAgICAgIHVwZGF0ZShDdXN0b21FbGVtZW50LCBsYXN0SHlicmlkcyk7XG5cbiAgICAgIHJldHVybiBDdXN0b21FbGVtZW50O1xuICAgIH1cblxuICAgIHRocm93IEVycm9yKGBFbGVtZW50ICcke3RhZ05hbWV9JyBhbHJlYWR5IGRlZmluZWRgKTtcbiAgfVxuXG4gIGNsYXNzIEh5YnJpZCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICBzdGF0aWMgZ2V0IG5hbWUoKSB7XG4gICAgICByZXR1cm4gdGFnTmFtZTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG5cbiAgICAgIGNvbnN0IHByb3BzID0gcHJvcHNNYXAuZ2V0KEh5YnJpZCk7XG5cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwcm9wcy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIGtleSkpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgICBkZWxldGUgdGhpc1trZXldO1xuICAgICAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICBjb25zdCBjYWxsYmFja3MgPSBjYWxsYmFja3NNYXAuZ2V0KEh5YnJpZCk7XG4gICAgICBjb25zdCBsaXN0ID0gW107XG5cbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjYWxsYmFja3MubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGNvbnN0IGNiID0gY2FsbGJhY2tzW2luZGV4XSh0aGlzKTtcbiAgICAgICAgaWYgKGNiKSBsaXN0LnB1c2goY2IpO1xuICAgICAgfVxuXG4gICAgICBkaXNjb25uZWN0cy5zZXQodGhpcywgbGlzdCk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICBjb25zdCBsaXN0ID0gZGlzY29ubmVjdHMuZ2V0KHRoaXMpO1xuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxpc3QubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgIGxpc3RbaW5kZXhdKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcGlsZShIeWJyaWQsIGh5YnJpZHNPckNvbnN0cnVjdG9yKTtcbiAgY3VzdG9tRWxlbWVudHMuZGVmaW5lKHRhZ05hbWUsIEh5YnJpZCk7XG5cbiAgcmV0dXJuIEh5YnJpZDtcbn1cblxuZnVuY3Rpb24gZGVmaW5lTWFwKGVsZW1lbnRzKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhlbGVtZW50cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBwYXNjYWxUb0Rhc2goa2V5KTtcbiAgICBhY2Nba2V5XSA9IGRlZmluZUVsZW1lbnQodGFnTmFtZSwgZWxlbWVudHNba2V5XSk7XG5cbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmluZSguLi5hcmdzKSB7XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJvYmplY3RcIikge1xuICAgIHJldHVybiBkZWZpbmVNYXAoYXJnc1swXSk7XG4gIH1cblxuICByZXR1cm4gZGVmaW5lRWxlbWVudCguLi5hcmdzKTtcbn1cbiJdfQ==