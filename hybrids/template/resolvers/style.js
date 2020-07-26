function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import { camelToDash, stringifyElement } from "../../utils.js";
var styleMap = new WeakMap();
export default function resolveStyle(host, target, value) {
  if (value === null || _typeof(value) !== "object") {
    throw TypeError("Style value must be an object in ".concat(stringifyElement(target), ":"), value);
  }

  var previousMap = styleMap.get(target) || new Map();
  var nextMap = Object.keys(value).reduce(function (map, key) {
    var dashKey = camelToDash(key);
    var styleValue = value[key];

    if (!styleValue && styleValue !== 0) {
      target.style.removeProperty(dashKey);
    } else {
      target.style.setProperty(dashKey, styleValue);
    }

    map.set(dashKey, styleValue);
    previousMap.delete(dashKey);
    return map;
  }, new Map());
  previousMap.forEach(function (styleValue, key) {
    target.style[key] = "";
  });
  styleMap.set(target, nextMap);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZW1wbGF0ZS9yZXNvbHZlcnMvc3R5bGUuanMiXSwibmFtZXMiOlsiY2FtZWxUb0Rhc2giLCJzdHJpbmdpZnlFbGVtZW50Iiwic3R5bGVNYXAiLCJXZWFrTWFwIiwicmVzb2x2ZVN0eWxlIiwiaG9zdCIsInRhcmdldCIsInZhbHVlIiwiVHlwZUVycm9yIiwicHJldmlvdXNNYXAiLCJnZXQiLCJNYXAiLCJuZXh0TWFwIiwiT2JqZWN0Iiwia2V5cyIsInJlZHVjZSIsIm1hcCIsImtleSIsImRhc2hLZXkiLCJzdHlsZVZhbHVlIiwic3R5bGUiLCJyZW1vdmVQcm9wZXJ0eSIsInNldFByb3BlcnR5Iiwic2V0IiwiZGVsZXRlIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTQSxXQUFULEVBQXNCQyxnQkFBdEIsUUFBOEMsZ0JBQTlDO0FBRUEsSUFBTUMsUUFBUSxHQUFHLElBQUlDLE9BQUosRUFBakI7QUFFQSxlQUFlLFNBQVNDLFlBQVQsQ0FBc0JDLElBQXRCLEVBQTRCQyxNQUE1QixFQUFvQ0MsS0FBcEMsRUFBMkM7QUFDeEQsTUFBSUEsS0FBSyxLQUFLLElBQVYsSUFBa0IsUUFBT0EsS0FBUCxNQUFpQixRQUF2QyxFQUFpRDtBQUMvQyxVQUFNQyxTQUFTLDRDQUN1QlAsZ0JBQWdCLENBQUNLLE1BQUQsQ0FEdkMsUUFFYkMsS0FGYSxDQUFmO0FBSUQ7O0FBRUQsTUFBTUUsV0FBVyxHQUFHUCxRQUFRLENBQUNRLEdBQVQsQ0FBYUosTUFBYixLQUF3QixJQUFJSyxHQUFKLEVBQTVDO0FBRUEsTUFBTUMsT0FBTyxHQUFHQyxNQUFNLENBQUNDLElBQVAsQ0FBWVAsS0FBWixFQUFtQlEsTUFBbkIsQ0FBMEIsVUFBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDdEQsUUFBTUMsT0FBTyxHQUFHbEIsV0FBVyxDQUFDaUIsR0FBRCxDQUEzQjtBQUNBLFFBQU1FLFVBQVUsR0FBR1osS0FBSyxDQUFDVSxHQUFELENBQXhCOztBQUVBLFFBQUksQ0FBQ0UsVUFBRCxJQUFlQSxVQUFVLEtBQUssQ0FBbEMsRUFBcUM7QUFDbkNiLE1BQUFBLE1BQU0sQ0FBQ2MsS0FBUCxDQUFhQyxjQUFiLENBQTRCSCxPQUE1QjtBQUNELEtBRkQsTUFFTztBQUNMWixNQUFBQSxNQUFNLENBQUNjLEtBQVAsQ0FBYUUsV0FBYixDQUF5QkosT0FBekIsRUFBa0NDLFVBQWxDO0FBQ0Q7O0FBRURILElBQUFBLEdBQUcsQ0FBQ08sR0FBSixDQUFRTCxPQUFSLEVBQWlCQyxVQUFqQjtBQUNBVixJQUFBQSxXQUFXLENBQUNlLE1BQVosQ0FBbUJOLE9BQW5CO0FBRUEsV0FBT0YsR0FBUDtBQUNELEdBZGUsRUFjYixJQUFJTCxHQUFKLEVBZGEsQ0FBaEI7QUFnQkFGLEVBQUFBLFdBQVcsQ0FBQ2dCLE9BQVosQ0FBb0IsVUFBQ04sVUFBRCxFQUFhRixHQUFiLEVBQXFCO0FBQ3ZDWCxJQUFBQSxNQUFNLENBQUNjLEtBQVAsQ0FBYUgsR0FBYixJQUFvQixFQUFwQjtBQUNELEdBRkQ7QUFJQWYsRUFBQUEsUUFBUSxDQUFDcUIsR0FBVCxDQUFhakIsTUFBYixFQUFxQk0sT0FBckI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNhbWVsVG9EYXNoLCBzdHJpbmdpZnlFbGVtZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzLmpzXCI7XG5cbmNvbnN0IHN0eWxlTWFwID0gbmV3IFdlYWtNYXAoKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzb2x2ZVN0eWxlKGhvc3QsIHRhcmdldCwgdmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikge1xuICAgIHRocm93IFR5cGVFcnJvcihcbiAgICAgIGBTdHlsZSB2YWx1ZSBtdXN0IGJlIGFuIG9iamVjdCBpbiAke3N0cmluZ2lmeUVsZW1lbnQodGFyZ2V0KX06YCxcbiAgICAgIHZhbHVlLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBwcmV2aW91c01hcCA9IHN0eWxlTWFwLmdldCh0YXJnZXQpIHx8IG5ldyBNYXAoKTtcblxuICBjb25zdCBuZXh0TWFwID0gT2JqZWN0LmtleXModmFsdWUpLnJlZHVjZSgobWFwLCBrZXkpID0+IHtcbiAgICBjb25zdCBkYXNoS2V5ID0gY2FtZWxUb0Rhc2goa2V5KTtcbiAgICBjb25zdCBzdHlsZVZhbHVlID0gdmFsdWVba2V5XTtcblxuICAgIGlmICghc3R5bGVWYWx1ZSAmJiBzdHlsZVZhbHVlICE9PSAwKSB7XG4gICAgICB0YXJnZXQuc3R5bGUucmVtb3ZlUHJvcGVydHkoZGFzaEtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5zdHlsZS5zZXRQcm9wZXJ0eShkYXNoS2V5LCBzdHlsZVZhbHVlKTtcbiAgICB9XG5cbiAgICBtYXAuc2V0KGRhc2hLZXksIHN0eWxlVmFsdWUpO1xuICAgIHByZXZpb3VzTWFwLmRlbGV0ZShkYXNoS2V5KTtcblxuICAgIHJldHVybiBtYXA7XG4gIH0sIG5ldyBNYXAoKSk7XG5cbiAgcHJldmlvdXNNYXAuZm9yRWFjaCgoc3R5bGVWYWx1ZSwga2V5KSA9PiB7XG4gICAgdGFyZ2V0LnN0eWxlW2tleV0gPSBcIlwiO1xuICB9KTtcblxuICBzdHlsZU1hcC5zZXQodGFyZ2V0LCBuZXh0TWFwKTtcbn1cbiJdfQ==