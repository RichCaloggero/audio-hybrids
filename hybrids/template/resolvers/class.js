function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function normalizeValue(value) {
  var set = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

  if (Array.isArray(value)) {
    value.forEach(function (className) {
      return set.add(className);
    });
  } else if (value !== null && _typeof(value) === "object") {
    Object.keys(value).forEach(function (key) {
      return value[key] && set.add(key);
    });
  } else {
    set.add(value);
  }

  return set;
}

var classMap = new WeakMap();
export default function resolveClassList(host, target, value) {
  var previousList = classMap.get(target) || new Set();
  var list = normalizeValue(value);
  classMap.set(target, list);
  list.forEach(function (className) {
    target.classList.add(className);
    previousList.delete(className);
  });
  previousList.forEach(function (className) {
    target.classList.remove(className);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZW1wbGF0ZS9yZXNvbHZlcnMvY2xhc3MuanMiXSwibmFtZXMiOlsibm9ybWFsaXplVmFsdWUiLCJ2YWx1ZSIsInNldCIsIlNldCIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJjbGFzc05hbWUiLCJhZGQiLCJPYmplY3QiLCJrZXlzIiwia2V5IiwiY2xhc3NNYXAiLCJXZWFrTWFwIiwicmVzb2x2ZUNsYXNzTGlzdCIsImhvc3QiLCJ0YXJnZXQiLCJwcmV2aW91c0xpc3QiLCJnZXQiLCJsaXN0IiwiY2xhc3NMaXN0IiwiZGVsZXRlIiwicmVtb3ZlIl0sIm1hcHBpbmdzIjoiOztBQUFBLFNBQVNBLGNBQVQsQ0FBd0JDLEtBQXhCLEVBQWdEO0FBQUEsTUFBakJDLEdBQWlCLHVFQUFYLElBQUlDLEdBQUosRUFBVzs7QUFDOUMsTUFBSUMsS0FBSyxDQUFDQyxPQUFOLENBQWNKLEtBQWQsQ0FBSixFQUEwQjtBQUN4QkEsSUFBQUEsS0FBSyxDQUFDSyxPQUFOLENBQWMsVUFBQUMsU0FBUztBQUFBLGFBQUlMLEdBQUcsQ0FBQ00sR0FBSixDQUFRRCxTQUFSLENBQUo7QUFBQSxLQUF2QjtBQUNELEdBRkQsTUFFTyxJQUFJTixLQUFLLEtBQUssSUFBVixJQUFrQixRQUFPQSxLQUFQLE1BQWlCLFFBQXZDLEVBQWlEO0FBQ3REUSxJQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWVQsS0FBWixFQUFtQkssT0FBbkIsQ0FBMkIsVUFBQUssR0FBRztBQUFBLGFBQUlWLEtBQUssQ0FBQ1UsR0FBRCxDQUFMLElBQWNULEdBQUcsQ0FBQ00sR0FBSixDQUFRRyxHQUFSLENBQWxCO0FBQUEsS0FBOUI7QUFDRCxHQUZNLE1BRUE7QUFDTFQsSUFBQUEsR0FBRyxDQUFDTSxHQUFKLENBQVFQLEtBQVI7QUFDRDs7QUFFRCxTQUFPQyxHQUFQO0FBQ0Q7O0FBRUQsSUFBTVUsUUFBUSxHQUFHLElBQUlDLE9BQUosRUFBakI7QUFFQSxlQUFlLFNBQVNDLGdCQUFULENBQTBCQyxJQUExQixFQUFnQ0MsTUFBaEMsRUFBd0NmLEtBQXhDLEVBQStDO0FBQzVELE1BQU1nQixZQUFZLEdBQUdMLFFBQVEsQ0FBQ00sR0FBVCxDQUFhRixNQUFiLEtBQXdCLElBQUliLEdBQUosRUFBN0M7QUFDQSxNQUFNZ0IsSUFBSSxHQUFHbkIsY0FBYyxDQUFDQyxLQUFELENBQTNCO0FBRUFXLEVBQUFBLFFBQVEsQ0FBQ1YsR0FBVCxDQUFhYyxNQUFiLEVBQXFCRyxJQUFyQjtBQUVBQSxFQUFBQSxJQUFJLENBQUNiLE9BQUwsQ0FBYSxVQUFBQyxTQUFTLEVBQUk7QUFDeEJTLElBQUFBLE1BQU0sQ0FBQ0ksU0FBUCxDQUFpQlosR0FBakIsQ0FBcUJELFNBQXJCO0FBQ0FVLElBQUFBLFlBQVksQ0FBQ0ksTUFBYixDQUFvQmQsU0FBcEI7QUFDRCxHQUhEO0FBS0FVLEVBQUFBLFlBQVksQ0FBQ1gsT0FBYixDQUFxQixVQUFBQyxTQUFTLEVBQUk7QUFDaENTLElBQUFBLE1BQU0sQ0FBQ0ksU0FBUCxDQUFpQkUsTUFBakIsQ0FBd0JmLFNBQXhCO0FBQ0QsR0FGRDtBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUsIHNldCA9IG5ldyBTZXQoKSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB2YWx1ZS5mb3JFYWNoKGNsYXNzTmFtZSA9PiBzZXQuYWRkKGNsYXNzTmFtZSkpO1xuICB9IGVsc2UgaWYgKHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGtleSA9PiB2YWx1ZVtrZXldICYmIHNldC5hZGQoa2V5KSk7XG4gIH0gZWxzZSB7XG4gICAgc2V0LmFkZCh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG5jb25zdCBjbGFzc01hcCA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlc29sdmVDbGFzc0xpc3QoaG9zdCwgdGFyZ2V0LCB2YWx1ZSkge1xuICBjb25zdCBwcmV2aW91c0xpc3QgPSBjbGFzc01hcC5nZXQodGFyZ2V0KSB8fCBuZXcgU2V0KCk7XG4gIGNvbnN0IGxpc3QgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG5cbiAgY2xhc3NNYXAuc2V0KHRhcmdldCwgbGlzdCk7XG5cbiAgbGlzdC5mb3JFYWNoKGNsYXNzTmFtZSA9PiB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICBwcmV2aW91c0xpc3QuZGVsZXRlKGNsYXNzTmFtZSk7XG4gIH0pO1xuXG4gIHByZXZpb3VzTGlzdC5mb3JFYWNoKGNsYXNzTmFtZSA9PiB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgfSk7XG59XG4iXX0=