function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var targets = new WeakMap();
export default function resolveEventListener(eventType) {
  return function (host, target, value, lastValue) {
    if (lastValue) {
      var eventMap = targets.get(target);

      if (eventMap) {
        target.removeEventListener(eventType, eventMap.get(lastValue), lastValue.options !== undefined ? lastValue.options : false);
      }
    }

    if (value) {
      if (typeof value !== "function") {
        throw Error("Event listener must be a function: ".concat(_typeof(value)));
      }

      var _eventMap = targets.get(target);

      if (!_eventMap) {
        _eventMap = new WeakMap();
        targets.set(target, _eventMap);
      }

      var callback = value.bind(null, host);

      _eventMap.set(value, callback);

      target.addEventListener(eventType, callback, value.options !== undefined ? value.options : false);
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZW1wbGF0ZS9yZXNvbHZlcnMvZXZlbnQuanMiXSwibmFtZXMiOlsidGFyZ2V0cyIsIldlYWtNYXAiLCJyZXNvbHZlRXZlbnRMaXN0ZW5lciIsImV2ZW50VHlwZSIsImhvc3QiLCJ0YXJnZXQiLCJ2YWx1ZSIsImxhc3RWYWx1ZSIsImV2ZW50TWFwIiwiZ2V0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJFcnJvciIsInNldCIsImNhbGxiYWNrIiwiYmluZCIsImFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsT0FBTyxHQUFHLElBQUlDLE9BQUosRUFBaEI7QUFFQSxlQUFlLFNBQVNDLG9CQUFULENBQThCQyxTQUE5QixFQUF5QztBQUN0RCxTQUFPLFVBQUNDLElBQUQsRUFBT0MsTUFBUCxFQUFlQyxLQUFmLEVBQXNCQyxTQUF0QixFQUFvQztBQUN6QyxRQUFJQSxTQUFKLEVBQWU7QUFDYixVQUFNQyxRQUFRLEdBQUdSLE9BQU8sQ0FBQ1MsR0FBUixDQUFZSixNQUFaLENBQWpCOztBQUNBLFVBQUlHLFFBQUosRUFBYztBQUNaSCxRQUFBQSxNQUFNLENBQUNLLG1CQUFQLENBQ0VQLFNBREYsRUFFRUssUUFBUSxDQUFDQyxHQUFULENBQWFGLFNBQWIsQ0FGRixFQUdFQSxTQUFTLENBQUNJLE9BQVYsS0FBc0JDLFNBQXRCLEdBQWtDTCxTQUFTLENBQUNJLE9BQTVDLEdBQXNELEtBSHhEO0FBS0Q7QUFDRjs7QUFFRCxRQUFJTCxLQUFKLEVBQVc7QUFDVCxVQUFJLE9BQU9BLEtBQVAsS0FBaUIsVUFBckIsRUFBaUM7QUFDL0IsY0FBTU8sS0FBSyxzREFBOENQLEtBQTlDLEdBQVg7QUFDRDs7QUFFRCxVQUFJRSxTQUFRLEdBQUdSLE9BQU8sQ0FBQ1MsR0FBUixDQUFZSixNQUFaLENBQWY7O0FBQ0EsVUFBSSxDQUFDRyxTQUFMLEVBQWU7QUFDYkEsUUFBQUEsU0FBUSxHQUFHLElBQUlQLE9BQUosRUFBWDtBQUNBRCxRQUFBQSxPQUFPLENBQUNjLEdBQVIsQ0FBWVQsTUFBWixFQUFvQkcsU0FBcEI7QUFDRDs7QUFFRCxVQUFNTyxRQUFRLEdBQUdULEtBQUssQ0FBQ1UsSUFBTixDQUFXLElBQVgsRUFBaUJaLElBQWpCLENBQWpCOztBQUNBSSxNQUFBQSxTQUFRLENBQUNNLEdBQVQsQ0FBYVIsS0FBYixFQUFvQlMsUUFBcEI7O0FBRUFWLE1BQUFBLE1BQU0sQ0FBQ1ksZ0JBQVAsQ0FDRWQsU0FERixFQUVFWSxRQUZGLEVBR0VULEtBQUssQ0FBQ0ssT0FBTixLQUFrQkMsU0FBbEIsR0FBOEJOLEtBQUssQ0FBQ0ssT0FBcEMsR0FBOEMsS0FIaEQ7QUFLRDtBQUNGLEdBaENEO0FBaUNEIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGFyZ2V0cyA9IG5ldyBXZWFrTWFwKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlc29sdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSkge1xuICByZXR1cm4gKGhvc3QsIHRhcmdldCwgdmFsdWUsIGxhc3RWYWx1ZSkgPT4ge1xuICAgIGlmIChsYXN0VmFsdWUpIHtcbiAgICAgIGNvbnN0IGV2ZW50TWFwID0gdGFyZ2V0cy5nZXQodGFyZ2V0KTtcbiAgICAgIGlmIChldmVudE1hcCkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgZXZlbnRNYXAuZ2V0KGxhc3RWYWx1ZSksXG4gICAgICAgICAgbGFzdFZhbHVlLm9wdGlvbnMgIT09IHVuZGVmaW5lZCA/IGxhc3RWYWx1ZS5vcHRpb25zIDogZmFsc2UsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoYEV2ZW50IGxpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbjogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBldmVudE1hcCA9IHRhcmdldHMuZ2V0KHRhcmdldCk7XG4gICAgICBpZiAoIWV2ZW50TWFwKSB7XG4gICAgICAgIGV2ZW50TWFwID0gbmV3IFdlYWtNYXAoKTtcbiAgICAgICAgdGFyZ2V0cy5zZXQodGFyZ2V0LCBldmVudE1hcCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdmFsdWUuYmluZChudWxsLCBob3N0KTtcbiAgICAgIGV2ZW50TWFwLnNldCh2YWx1ZSwgY2FsbGJhY2spO1xuXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgdmFsdWUub3B0aW9ucyAhPT0gdW5kZWZpbmVkID8gdmFsdWUub3B0aW9ucyA6IGZhbHNlLFxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG4iXX0=