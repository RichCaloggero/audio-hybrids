var setCache = new Map();
export function set(propertyName, value) {
  if (!propertyName) throw Error("Target property name missing: ".concat(propertyName));

  if (arguments.length === 2) {
    return function (host) {
      host[propertyName] = value;
    };
  }

  var fn = setCache.get(propertyName);

  if (!fn) {
    fn = function fn(host, _ref) {
      var target = _ref.target;
      host[propertyName] = target.value;
    };

    setCache.set(propertyName, fn);
  }

  return fn;
}
var promiseMap = new WeakMap();
export function resolve(promise, placeholder) {
  var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;
  return function (host, target) {
    var timeout;

    if (placeholder) {
      timeout = setTimeout(function () {
        timeout = undefined;
        requestAnimationFrame(function () {
          placeholder(host, target);
        });
      }, delay);
    }

    promiseMap.set(target, promise);
    promise.then(function (template) {
      if (timeout) clearTimeout(timeout);

      if (promiseMap.get(target) === promise) {
        template(host, target);
        promiseMap.set(target, null);
      }
    });
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZW1wbGF0ZS9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbInNldENhY2hlIiwiTWFwIiwic2V0IiwicHJvcGVydHlOYW1lIiwidmFsdWUiLCJFcnJvciIsImFyZ3VtZW50cyIsImxlbmd0aCIsImhvc3QiLCJmbiIsImdldCIsInRhcmdldCIsInByb21pc2VNYXAiLCJXZWFrTWFwIiwicmVzb2x2ZSIsInByb21pc2UiLCJwbGFjZWhvbGRlciIsImRlbGF5IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJ1bmRlZmluZWQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ0aGVuIiwidGVtcGxhdGUiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiJBQUFBLElBQU1BLFFBQVEsR0FBRyxJQUFJQyxHQUFKLEVBQWpCO0FBQ0EsT0FBTyxTQUFTQyxHQUFULENBQWFDLFlBQWIsRUFBMkJDLEtBQTNCLEVBQWtDO0FBQ3ZDLE1BQUksQ0FBQ0QsWUFBTCxFQUNFLE1BQU1FLEtBQUsseUNBQWtDRixZQUFsQyxFQUFYOztBQUVGLE1BQUlHLFNBQVMsQ0FBQ0MsTUFBVixLQUFxQixDQUF6QixFQUE0QjtBQUMxQixXQUFPLFVBQUFDLElBQUksRUFBSTtBQUNiQSxNQUFBQSxJQUFJLENBQUNMLFlBQUQsQ0FBSixHQUFxQkMsS0FBckI7QUFDRCxLQUZEO0FBR0Q7O0FBRUQsTUFBSUssRUFBRSxHQUFHVCxRQUFRLENBQUNVLEdBQVQsQ0FBYVAsWUFBYixDQUFUOztBQUVBLE1BQUksQ0FBQ00sRUFBTCxFQUFTO0FBQ1BBLElBQUFBLEVBQUUsR0FBRyxZQUFDRCxJQUFELFFBQXNCO0FBQUEsVUFBYkcsTUFBYSxRQUFiQSxNQUFhO0FBQ3pCSCxNQUFBQSxJQUFJLENBQUNMLFlBQUQsQ0FBSixHQUFxQlEsTUFBTSxDQUFDUCxLQUE1QjtBQUNELEtBRkQ7O0FBR0FKLElBQUFBLFFBQVEsQ0FBQ0UsR0FBVCxDQUFhQyxZQUFiLEVBQTJCTSxFQUEzQjtBQUNEOztBQUVELFNBQU9BLEVBQVA7QUFDRDtBQUVELElBQU1HLFVBQVUsR0FBRyxJQUFJQyxPQUFKLEVBQW5CO0FBQ0EsT0FBTyxTQUFTQyxPQUFULENBQWlCQyxPQUFqQixFQUEwQkMsV0FBMUIsRUFBb0Q7QUFBQSxNQUFiQyxLQUFhLHVFQUFMLEdBQUs7QUFDekQsU0FBTyxVQUFDVCxJQUFELEVBQU9HLE1BQVAsRUFBa0I7QUFDdkIsUUFBSU8sT0FBSjs7QUFFQSxRQUFJRixXQUFKLEVBQWlCO0FBQ2ZFLE1BQUFBLE9BQU8sR0FBR0MsVUFBVSxDQUFDLFlBQU07QUFDekJELFFBQUFBLE9BQU8sR0FBR0UsU0FBVjtBQUVBQyxRQUFBQSxxQkFBcUIsQ0FBQyxZQUFNO0FBQzFCTCxVQUFBQSxXQUFXLENBQUNSLElBQUQsRUFBT0csTUFBUCxDQUFYO0FBQ0QsU0FGb0IsQ0FBckI7QUFHRCxPQU5tQixFQU1qQk0sS0FOaUIsQ0FBcEI7QUFPRDs7QUFFREwsSUFBQUEsVUFBVSxDQUFDVixHQUFYLENBQWVTLE1BQWYsRUFBdUJJLE9BQXZCO0FBRUFBLElBQUFBLE9BQU8sQ0FBQ08sSUFBUixDQUFhLFVBQUFDLFFBQVEsRUFBSTtBQUN2QixVQUFJTCxPQUFKLEVBQWFNLFlBQVksQ0FBQ04sT0FBRCxDQUFaOztBQUViLFVBQUlOLFVBQVUsQ0FBQ0YsR0FBWCxDQUFlQyxNQUFmLE1BQTJCSSxPQUEvQixFQUF3QztBQUN0Q1EsUUFBQUEsUUFBUSxDQUFDZixJQUFELEVBQU9HLE1BQVAsQ0FBUjtBQUNBQyxRQUFBQSxVQUFVLENBQUNWLEdBQVgsQ0FBZVMsTUFBZixFQUF1QixJQUF2QjtBQUNEO0FBQ0YsS0FQRDtBQVFELEdBdkJEO0FBd0JEIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgc2V0Q2FjaGUgPSBuZXcgTWFwKCk7XG5leHBvcnQgZnVuY3Rpb24gc2V0KHByb3BlcnR5TmFtZSwgdmFsdWUpIHtcbiAgaWYgKCFwcm9wZXJ0eU5hbWUpXG4gICAgdGhyb3cgRXJyb3IoYFRhcmdldCBwcm9wZXJ0eSBuYW1lIG1pc3Npbmc6ICR7cHJvcGVydHlOYW1lfWApO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIGhvc3QgPT4ge1xuICAgICAgaG9zdFtwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIGxldCBmbiA9IHNldENhY2hlLmdldChwcm9wZXJ0eU5hbWUpO1xuXG4gIGlmICghZm4pIHtcbiAgICBmbiA9IChob3N0LCB7IHRhcmdldCB9KSA9PiB7XG4gICAgICBob3N0W3Byb3BlcnR5TmFtZV0gPSB0YXJnZXQudmFsdWU7XG4gICAgfTtcbiAgICBzZXRDYWNoZS5zZXQocHJvcGVydHlOYW1lLCBmbik7XG4gIH1cblxuICByZXR1cm4gZm47XG59XG5cbmNvbnN0IHByb21pc2VNYXAgPSBuZXcgV2Vha01hcCgpO1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUocHJvbWlzZSwgcGxhY2Vob2xkZXIsIGRlbGF5ID0gMjAwKSB7XG4gIHJldHVybiAoaG9zdCwgdGFyZ2V0KSA9PiB7XG4gICAgbGV0IHRpbWVvdXQ7XG5cbiAgICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIHBsYWNlaG9sZGVyKGhvc3QsIHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZGVsYXkpO1xuICAgIH1cblxuICAgIHByb21pc2VNYXAuc2V0KHRhcmdldCwgcHJvbWlzZSk7XG5cbiAgICBwcm9taXNlLnRoZW4odGVtcGxhdGUgPT4ge1xuICAgICAgaWYgKHRpbWVvdXQpIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgaWYgKHByb21pc2VNYXAuZ2V0KHRhcmdldCkgPT09IHByb21pc2UpIHtcbiAgICAgICAgdGVtcGxhdGUoaG9zdCwgdGFyZ2V0KTtcbiAgICAgICAgcHJvbWlzZU1hcC5zZXQodGFyZ2V0LCBudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn1cbiJdfQ==