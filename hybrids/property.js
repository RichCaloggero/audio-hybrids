function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import { camelToDash } from "./utils.js";

var defaultTransform = function defaultTransform(v) {
  return v;
};

var objectTransform = function objectTransform(value) {
  if (_typeof(value) !== "object") {
    throw TypeError("Assigned value must be an object: ".concat(_typeof(value)));
  }

  return value && Object.freeze(value);
};

export default function property(value, connect) {
  var type = _typeof(value);

  var transform = defaultTransform;

  switch (type) {
    case "string":
      transform = String;
      break;

    case "number":
      transform = Number;
      break;

    case "boolean":
      transform = Boolean;
      break;

    case "function":
      transform = value;
      value = transform();
      break;

    case "object":
      if (value) Object.freeze(value);
      transform = objectTransform;
      break;

    default:
      break;
  }

  return {
    get: function get(host) {
      var val = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : value;
      return val;
    },
    set: function set(host, val, oldValue) {
      return transform(val, oldValue);
    },
    connect: type !== "object" && type !== "undefined" ? function (host, key, invalidate) {
      if (host[key] === value) {
        var attrName = camelToDash(key);

        if (host.hasAttribute(attrName)) {
          var attrValue = host.getAttribute(attrName);
          host[key] = attrValue === "" && transform === Boolean ? true : attrValue;
        }
      }

      return connect && connect(host, key, invalidate);
    } : connect
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9wZXJ0eS5qcyJdLCJuYW1lcyI6WyJjYW1lbFRvRGFzaCIsImRlZmF1bHRUcmFuc2Zvcm0iLCJ2Iiwib2JqZWN0VHJhbnNmb3JtIiwidmFsdWUiLCJUeXBlRXJyb3IiLCJPYmplY3QiLCJmcmVlemUiLCJwcm9wZXJ0eSIsImNvbm5lY3QiLCJ0eXBlIiwidHJhbnNmb3JtIiwiU3RyaW5nIiwiTnVtYmVyIiwiQm9vbGVhbiIsImdldCIsImhvc3QiLCJ2YWwiLCJzZXQiLCJvbGRWYWx1ZSIsImtleSIsImludmFsaWRhdGUiLCJhdHRyTmFtZSIsImhhc0F0dHJpYnV0ZSIsImF0dHJWYWx1ZSIsImdldEF0dHJpYnV0ZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTQSxXQUFULFFBQTRCLFlBQTVCOztBQUVBLElBQU1DLGdCQUFnQixHQUFHLFNBQW5CQSxnQkFBbUIsQ0FBQUMsQ0FBQztBQUFBLFNBQUlBLENBQUo7QUFBQSxDQUExQjs7QUFFQSxJQUFNQyxlQUFlLEdBQUcsU0FBbEJBLGVBQWtCLENBQUFDLEtBQUssRUFBSTtBQUMvQixNQUFJLFFBQU9BLEtBQVAsTUFBaUIsUUFBckIsRUFBK0I7QUFDN0IsVUFBTUMsU0FBUyxxREFBNkNELEtBQTdDLEdBQWY7QUFDRDs7QUFDRCxTQUFPQSxLQUFLLElBQUlFLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjSCxLQUFkLENBQWhCO0FBQ0QsQ0FMRDs7QUFPQSxlQUFlLFNBQVNJLFFBQVQsQ0FBa0JKLEtBQWxCLEVBQXlCSyxPQUF6QixFQUFrQztBQUMvQyxNQUFNQyxJQUFJLFdBQVVOLEtBQVYsQ0FBVjs7QUFDQSxNQUFJTyxTQUFTLEdBQUdWLGdCQUFoQjs7QUFFQSxVQUFRUyxJQUFSO0FBQ0UsU0FBSyxRQUFMO0FBQ0VDLE1BQUFBLFNBQVMsR0FBR0MsTUFBWjtBQUNBOztBQUNGLFNBQUssUUFBTDtBQUNFRCxNQUFBQSxTQUFTLEdBQUdFLE1BQVo7QUFDQTs7QUFDRixTQUFLLFNBQUw7QUFDRUYsTUFBQUEsU0FBUyxHQUFHRyxPQUFaO0FBQ0E7O0FBQ0YsU0FBSyxVQUFMO0FBQ0VILE1BQUFBLFNBQVMsR0FBR1AsS0FBWjtBQUNBQSxNQUFBQSxLQUFLLEdBQUdPLFNBQVMsRUFBakI7QUFDQTs7QUFDRixTQUFLLFFBQUw7QUFDRSxVQUFJUCxLQUFKLEVBQVdFLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjSCxLQUFkO0FBQ1hPLE1BQUFBLFNBQVMsR0FBR1IsZUFBWjtBQUNBOztBQUNGO0FBQ0U7QUFuQko7O0FBc0JBLFNBQU87QUFDTFksSUFBQUEsR0FBRyxFQUFFLGFBQUNDLElBQUQ7QUFBQSxVQUFPQyxHQUFQLHVFQUFhYixLQUFiO0FBQUEsYUFBdUJhLEdBQXZCO0FBQUEsS0FEQTtBQUVMQyxJQUFBQSxHQUFHLEVBQUUsYUFBQ0YsSUFBRCxFQUFPQyxHQUFQLEVBQVlFLFFBQVo7QUFBQSxhQUF5QlIsU0FBUyxDQUFDTSxHQUFELEVBQU1FLFFBQU4sQ0FBbEM7QUFBQSxLQUZBO0FBR0xWLElBQUFBLE9BQU8sRUFDTEMsSUFBSSxLQUFLLFFBQVQsSUFBcUJBLElBQUksS0FBSyxXQUE5QixHQUNJLFVBQUNNLElBQUQsRUFBT0ksR0FBUCxFQUFZQyxVQUFaLEVBQTJCO0FBQ3pCLFVBQUlMLElBQUksQ0FBQ0ksR0FBRCxDQUFKLEtBQWNoQixLQUFsQixFQUF5QjtBQUN2QixZQUFNa0IsUUFBUSxHQUFHdEIsV0FBVyxDQUFDb0IsR0FBRCxDQUE1Qjs7QUFFQSxZQUFJSixJQUFJLENBQUNPLFlBQUwsQ0FBa0JELFFBQWxCLENBQUosRUFBaUM7QUFDL0IsY0FBTUUsU0FBUyxHQUFHUixJQUFJLENBQUNTLFlBQUwsQ0FBa0JILFFBQWxCLENBQWxCO0FBQ0FOLFVBQUFBLElBQUksQ0FBQ0ksR0FBRCxDQUFKLEdBQ0VJLFNBQVMsS0FBSyxFQUFkLElBQW9CYixTQUFTLEtBQUtHLE9BQWxDLEdBQTRDLElBQTVDLEdBQW1EVSxTQURyRDtBQUVEO0FBQ0Y7O0FBRUQsYUFBT2YsT0FBTyxJQUFJQSxPQUFPLENBQUNPLElBQUQsRUFBT0ksR0FBUCxFQUFZQyxVQUFaLENBQXpCO0FBQ0QsS0FiTCxHQWNJWjtBQWxCRCxHQUFQO0FBb0JEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2FtZWxUb0Rhc2ggfSBmcm9tIFwiLi91dGlscy5qc1wiO1xuXG5jb25zdCBkZWZhdWx0VHJhbnNmb3JtID0gdiA9PiB2O1xuXG5jb25zdCBvYmplY3RUcmFuc2Zvcm0gPSB2YWx1ZSA9PiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoYEFzc2lnbmVkIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0OiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgfVxuICByZXR1cm4gdmFsdWUgJiYgT2JqZWN0LmZyZWV6ZSh2YWx1ZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm9wZXJ0eSh2YWx1ZSwgY29ubmVjdCkge1xuICBjb25zdCB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBsZXQgdHJhbnNmb3JtID0gZGVmYXVsdFRyYW5zZm9ybTtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICB0cmFuc2Zvcm0gPSBTdHJpbmc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICB0cmFuc2Zvcm0gPSBOdW1iZXI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgdHJhbnNmb3JtID0gQm9vbGVhbjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICB2YWx1ZSA9IHRyYW5zZm9ybSgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgaWYgKHZhbHVlKSBPYmplY3QuZnJlZXplKHZhbHVlKTtcbiAgICAgIHRyYW5zZm9ybSA9IG9iamVjdFRyYW5zZm9ybTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0OiAoaG9zdCwgdmFsID0gdmFsdWUpID0+IHZhbCxcbiAgICBzZXQ6IChob3N0LCB2YWwsIG9sZFZhbHVlKSA9PiB0cmFuc2Zvcm0odmFsLCBvbGRWYWx1ZSksXG4gICAgY29ubmVjdDpcbiAgICAgIHR5cGUgIT09IFwib2JqZWN0XCIgJiYgdHlwZSAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICA/IChob3N0LCBrZXksIGludmFsaWRhdGUpID0+IHtcbiAgICAgICAgICAgIGlmIChob3N0W2tleV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGF0dHJOYW1lID0gY2FtZWxUb0Rhc2goa2V5KTtcblxuICAgICAgICAgICAgICBpZiAoaG9zdC5oYXNBdHRyaWJ1dGUoYXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0clZhbHVlID0gaG9zdC5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIGhvc3Rba2V5XSA9XG4gICAgICAgICAgICAgICAgICBhdHRyVmFsdWUgPT09IFwiXCIgJiYgdHJhbnNmb3JtID09PSBCb29sZWFuID8gdHJ1ZSA6IGF0dHJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29ubmVjdCAmJiBjb25uZWN0KGhvc3QsIGtleSwgaW52YWxpZGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICA6IGNvbm5lY3QsXG4gIH07XG59XG4iXX0=