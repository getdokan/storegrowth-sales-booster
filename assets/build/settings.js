/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/@ant-design/colors/dist/index.esm.js":
/*!************************************************************!*\
  !*** ../node_modules/@ant-design/colors/dist/index.esm.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blue: function() { return /* binding */ blue; },
/* harmony export */   cyan: function() { return /* binding */ cyan; },
/* harmony export */   geekblue: function() { return /* binding */ geekblue; },
/* harmony export */   generate: function() { return /* binding */ generate; },
/* harmony export */   gold: function() { return /* binding */ gold; },
/* harmony export */   green: function() { return /* binding */ green; },
/* harmony export */   grey: function() { return /* binding */ grey; },
/* harmony export */   lime: function() { return /* binding */ lime; },
/* harmony export */   magenta: function() { return /* binding */ magenta; },
/* harmony export */   orange: function() { return /* binding */ orange; },
/* harmony export */   presetDarkPalettes: function() { return /* binding */ presetDarkPalettes; },
/* harmony export */   presetPalettes: function() { return /* binding */ presetPalettes; },
/* harmony export */   presetPrimaryColors: function() { return /* binding */ presetPrimaryColors; },
/* harmony export */   purple: function() { return /* binding */ purple; },
/* harmony export */   red: function() { return /* binding */ red; },
/* harmony export */   volcano: function() { return /* binding */ volcano; },
/* harmony export */   yellow: function() { return /* binding */ yellow; }
/* harmony export */ });
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ctrl/tinycolor */ "../node_modules/@ctrl/tinycolor/dist/module/conversion.js");
/* harmony import */ var _ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ctrl/tinycolor */ "../node_modules/@ctrl/tinycolor/dist/module/format-input.js");


var hueStep = 2; // 色相阶梯

var saturationStep = 0.16; // 饱和度阶梯，浅色部分

var saturationStep2 = 0.05; // 饱和度阶梯，深色部分

var brightnessStep1 = 0.05; // 亮度阶梯，浅色部分

var brightnessStep2 = 0.15; // 亮度阶梯，深色部分

var lightColorCount = 5; // 浅色数量，主色上

var darkColorCount = 4; // 深色数量，主色下
// 暗色主题颜色映射关系表

var darkColorMap = [{
  index: 7,
  opacity: 0.15
}, {
  index: 6,
  opacity: 0.25
}, {
  index: 5,
  opacity: 0.3
}, {
  index: 5,
  opacity: 0.45
}, {
  index: 5,
  opacity: 0.65
}, {
  index: 5,
  opacity: 0.85
}, {
  index: 4,
  opacity: 0.9
}, {
  index: 3,
  opacity: 0.95
}, {
  index: 2,
  opacity: 0.97
}, {
  index: 1,
  opacity: 0.98
}]; // Wrapper function ported from TinyColor.prototype.toHsv
// Keep it here because of `hsv.h * 360`

function toHsv(_ref) {
  var r = _ref.r,
      g = _ref.g,
      b = _ref.b;
  var hsv = (0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.rgbToHsv)(r, g, b);
  return {
    h: hsv.h * 360,
    s: hsv.s,
    v: hsv.v
  };
} // Wrapper function ported from TinyColor.prototype.toHexString
// Keep it here because of the prefix `#`


function toHex(_ref2) {
  var r = _ref2.r,
      g = _ref2.g,
      b = _ref2.b;
  return "#".concat((0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_0__.rgbToHex)(r, g, b, false));
} // Wrapper function ported from TinyColor.prototype.mix, not treeshakable.
// Amount in range [0, 1]
// Assume color1 & color2 has no alpha, since the following src code did so.


function mix(rgb1, rgb2, amount) {
  var p = amount / 100;
  var rgb = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b
  };
  return rgb;
}

function getHue(hsv, i, light) {
  var hue; // 根据色相不同，色相转向不同

  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i;
  } else {
    hue = light ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i;
  }

  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }

  return hue;
}

function getSaturation(hsv, i, light) {
  // grey color don't change saturation
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }

  var saturation;

  if (light) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  } // 边界值修正


  if (saturation > 1) {
    saturation = 1;
  } // 第一格的 s 限制在 0.06-0.1 之间


  if (light && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }

  if (saturation < 0.06) {
    saturation = 0.06;
  }

  return Number(saturation.toFixed(2));
}

function getValue(hsv, i, light) {
  var value;

  if (light) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }

  if (value > 1) {
    value = 1;
  }

  return Number(value.toFixed(2));
}

function generate(color) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var patterns = [];
  var pColor = (0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__.inputToRGB)(color);

  for (var i = lightColorCount; i > 0; i -= 1) {
    var hsv = toHsv(pColor);
    var colorString = toHex((0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__.inputToRGB)({
      h: getHue(hsv, i, true),
      s: getSaturation(hsv, i, true),
      v: getValue(hsv, i, true)
    }));
    patterns.push(colorString);
  }

  patterns.push(toHex(pColor));

  for (var _i = 1; _i <= darkColorCount; _i += 1) {
    var _hsv = toHsv(pColor);

    var _colorString = toHex((0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__.inputToRGB)({
      h: getHue(_hsv, _i),
      s: getSaturation(_hsv, _i),
      v: getValue(_hsv, _i)
    }));

    patterns.push(_colorString);
  } // dark theme patterns


  if (opts.theme === 'dark') {
    return darkColorMap.map(function (_ref3) {
      var index = _ref3.index,
          opacity = _ref3.opacity;
      var darkColorString = toHex(mix((0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__.inputToRGB)(opts.backgroundColor || '#141414'), (0,_ctrl_tinycolor__WEBPACK_IMPORTED_MODULE_1__.inputToRGB)(patterns[index]), opacity * 100));
      return darkColorString;
    });
  }

  return patterns;
}

var presetPrimaryColors = {
  red: '#F5222D',
  volcano: '#FA541C',
  orange: '#FA8C16',
  gold: '#FAAD14',
  yellow: '#FADB14',
  lime: '#A0D911',
  green: '#52C41A',
  cyan: '#13C2C2',
  blue: '#1890FF',
  geekblue: '#2F54EB',
  purple: '#722ED1',
  magenta: '#EB2F96',
  grey: '#666666'
};
var presetPalettes = {};
var presetDarkPalettes = {};
Object.keys(presetPrimaryColors).forEach(function (key) {
  presetPalettes[key] = generate(presetPrimaryColors[key]);
  presetPalettes[key].primary = presetPalettes[key][5]; // dark presetPalettes

  presetDarkPalettes[key] = generate(presetPrimaryColors[key], {
    theme: 'dark',
    backgroundColor: '#141414'
  });
  presetDarkPalettes[key].primary = presetDarkPalettes[key][5];
});
var red = presetPalettes.red;
var volcano = presetPalettes.volcano;
var gold = presetPalettes.gold;
var orange = presetPalettes.orange;
var yellow = presetPalettes.yellow;
var lime = presetPalettes.lime;
var green = presetPalettes.green;
var cyan = presetPalettes.cyan;
var blue = presetPalettes.blue;
var geekblue = presetPalettes.geekblue;
var purple = presetPalettes.purple;
var magenta = presetPalettes.magenta;
var grey = presetPalettes.grey;




/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js":
/*!********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var BarsOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "0 0 1024 1024", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z" } }] }, "name": "bars", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (BarsOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/CheckCircleFilled.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/CheckCircleFilled.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var CheckCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" } }] }, "name": "check-circle", "theme": "filled" };
/* harmony default export */ __webpack_exports__["default"] = (CheckCircleFilled);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/CheckCircleOutlined.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/CheckCircleOutlined.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var CheckCircleOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z" } }, { "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" } }] }, "name": "check-circle", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (CheckCircleOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/CloseCircleFilled.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/CloseCircleFilled.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var CloseCircleFilled = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z" } }] }, "name": "close-circle", "theme": "filled" };
/* harmony default export */ __webpack_exports__["default"] = (CloseCircleFilled);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/CloseCircleOutlined.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/CloseCircleOutlined.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var CloseCircleOutlined = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm0 76c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm128.01 198.83c.03 0 .05.01.09.06l45.02 45.01a.2.2 0 01.05.09.12.12 0 010 .07c0 .02-.01.04-.05.08L557.25 512l127.87 127.86a.27.27 0 01.05.06v.02a.12.12 0 010 .07c0 .03-.01.05-.05.09l-45.02 45.02a.2.2 0 01-.09.05.12.12 0 01-.07 0c-.02 0-.04-.01-.08-.05L512 557.25 384.14 685.12c-.04.04-.06.05-.08.05a.12.12 0 01-.07 0c-.03 0-.05-.01-.09-.05l-45.02-45.02a.2.2 0 01-.05-.09.12.12 0 010-.07c0-.02.01-.04.06-.08L466.75 512 338.88 384.14a.27.27 0 01-.05-.06l-.01-.02a.12.12 0 010-.07c0-.03.01-.05.05-.09l45.02-45.02a.2.2 0 01.09-.05.12.12 0 01.07 0c.02 0 .04.01.08.06L512 466.75l127.86-127.86c.04-.05.06-.06.08-.06a.12.12 0 01.07 0z" } }] }, "name": "close-circle", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (CloseCircleOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/CloseOutlined.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/CloseOutlined.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var CloseOutlined = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z" } }] }, "name": "close", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (CloseOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleFilled.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleFilled.js ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var ExclamationCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" } }] }, "name": "exclamation-circle", "theme": "filled" };
/* harmony default export */ __webpack_exports__["default"] = (ExclamationCircleFilled);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleOutlined.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleOutlined.js ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var ExclamationCircleOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" } }, { "tag": "path", "attrs": { "d": "M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z" } }] }, "name": "exclamation-circle", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (ExclamationCircleOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/EyeOutlined.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/EyeOutlined.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var EyeOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" } }] }, "name": "eye", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (EyeOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/InfoCircleFilled.js":
/*!************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/InfoCircleFilled.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var InfoCircleFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" } }] }, "name": "info-circle", "theme": "filled" };
/* harmony default export */ __webpack_exports__["default"] = (InfoCircleFilled);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/InfoCircleOutlined.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/InfoCircleOutlined.js ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var InfoCircleOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" } }, { "tag": "path", "attrs": { "d": "M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z" } }] }, "name": "info-circle", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (InfoCircleOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js":
/*!********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var LeftOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" } }] }, "name": "left", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (LeftOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/LoadingOutlined.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/LoadingOutlined.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var LoadingOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "0 0 1024 1024", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" } }] }, "name": "loading", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (LoadingOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var RightOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z" } }] }, "name": "right", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (RightOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/RotateLeftOutlined.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/RotateLeftOutlined.js ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var RotateLeftOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "defs", "attrs": {}, "children": [{ "tag": "style", "attrs": {} }] }, { "tag": "path", "attrs": { "d": "M672 418H144c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H188V494h440v326z" } }, { "tag": "path", "attrs": { "d": "M819.3 328.5c-78.8-100.7-196-153.6-314.6-154.2l-.2-64c0-6.5-7.6-10.1-12.6-6.1l-128 101c-4 3.1-3.9 9.1 0 12.3L492 318.6c5.1 4 12.7.4 12.6-6.1v-63.9c12.9.1 25.9.9 38.8 2.5 42.1 5.2 82.1 18.2 119 38.7 38.1 21.2 71.2 49.7 98.4 84.3 27.1 34.7 46.7 73.7 58.1 115.8a325.95 325.95 0 016.5 140.9h74.9c14.8-103.6-11.3-213-81-302.3z" } }] }, "name": "rotate-left", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (RotateLeftOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/RotateRightOutlined.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/RotateRightOutlined.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var RotateRightOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "defs", "attrs": {}, "children": [{ "tag": "style", "attrs": {} }] }, { "tag": "path", "attrs": { "d": "M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2A399.75 399.75 0 00123.5 631h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z" } }, { "tag": "path", "attrs": { "d": "M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z" } }] }, "name": "rotate-right", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (RotateRightOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/ZoomInOutlined.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/ZoomInOutlined.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var ZoomInOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" } }] }, "name": "zoom-in", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (ZoomInOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons-svg/es/asn/ZoomOutOutlined.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@ant-design/icons-svg/es/asn/ZoomOutOutlined.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// This icon file is generated automatically.
var ZoomOutOutlined = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" } }] }, "name": "zoom-out", "theme": "outlined" };
/* harmony default export */ __webpack_exports__["default"] = (ZoomOutOutlined);


/***/ }),

/***/ "../node_modules/@ant-design/icons/es/components/AntdIcon.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/components/AntdIcon.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _Context__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Context */ "../node_modules/@ant-design/icons/es/components/Context.js");
/* harmony import */ var _IconBase__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./IconBase */ "../node_modules/@ant-design/icons/es/components/IconBase.js");
/* harmony import */ var _twoTonePrimaryColor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./twoTonePrimaryColor */ "../node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils */ "../node_modules/@ant-design/icons/es/utils.js");




var _excluded = ["className", "icon", "spin", "rotate", "tabIndex", "onClick", "twoToneColor"];






// Initial setting
// should move it to antd main repo?
(0,_twoTonePrimaryColor__WEBPACK_IMPORTED_MODULE_6__.setTwoToneColor)('#1890ff');
var Icon = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.forwardRef(function (props, ref) {
  var _classNames;
  var className = props.className,
    icon = props.icon,
    spin = props.spin,
    rotate = props.rotate,
    tabIndex = props.tabIndex,
    onClick = props.onClick,
    twoToneColor = props.twoToneColor,
    restProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__["default"])(props, _excluded);
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_4__.useContext(_Context__WEBPACK_IMPORTED_MODULE_7__["default"]),
    _React$useContext$pre = _React$useContext.prefixCls,
    prefixCls = _React$useContext$pre === void 0 ? 'anticon' : _React$useContext$pre,
    rootClassName = _React$useContext.rootClassName;
  var classString = classnames__WEBPACK_IMPORTED_MODULE_5___default()(rootClassName, prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames, "".concat(prefixCls, "-").concat(icon.name), !!icon.name), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames, "".concat(prefixCls, "-spin"), !!spin || icon.name === 'loading'), _classNames), className);
  var iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }
  var svgStyle = rotate ? {
    msTransform: "rotate(".concat(rotate, "deg)"),
    transform: "rotate(".concat(rotate, "deg)")
  } : undefined;
  var _normalizeTwoToneColo = (0,_utils__WEBPACK_IMPORTED_MODULE_8__.normalizeTwoToneColors)(twoToneColor),
    _normalizeTwoToneColo2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_normalizeTwoToneColo, 2),
    primaryColor = _normalizeTwoToneColo2[0],
    secondaryColor = _normalizeTwoToneColo2[1];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement("span", (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({
    role: "img",
    "aria-label": icon.name
  }, restProps), {}, {
    ref: ref,
    tabIndex: iconTabIndex,
    onClick: onClick,
    className: classString
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(_IconBase__WEBPACK_IMPORTED_MODULE_9__["default"], {
    icon: icon,
    primaryColor: primaryColor,
    secondaryColor: secondaryColor,
    style: svgStyle
  }));
});
Icon.displayName = 'AntdIcon';
Icon.getTwoToneColor = _twoTonePrimaryColor__WEBPACK_IMPORTED_MODULE_6__.getTwoToneColor;
Icon.setTwoToneColor = _twoTonePrimaryColor__WEBPACK_IMPORTED_MODULE_6__.setTwoToneColor;
/* harmony default export */ __webpack_exports__["default"] = (Icon);

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/components/Context.js":
/*!******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/components/Context.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var IconContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({});
/* harmony default export */ __webpack_exports__["default"] = (IconContext);

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/components/IconBase.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/components/IconBase.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "../node_modules/@ant-design/icons/es/utils.js");


var _excluded = ["icon", "className", "onClick", "style", "primaryColor", "secondaryColor"];

var twoToneColorPalette = {
  primaryColor: '#333',
  secondaryColor: '#E6E6E6',
  calculated: false
};
function setTwoToneColors(_ref) {
  var primaryColor = _ref.primaryColor,
    secondaryColor = _ref.secondaryColor;
  twoToneColorPalette.primaryColor = primaryColor;
  twoToneColorPalette.secondaryColor = secondaryColor || (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getSecondaryColor)(primaryColor);
  twoToneColorPalette.calculated = !!secondaryColor;
}
function getTwoToneColors() {
  return (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, twoToneColorPalette);
}
var IconBase = function IconBase(props) {
  var icon = props.icon,
    className = props.className,
    onClick = props.onClick,
    style = props.style,
    primaryColor = props.primaryColor,
    secondaryColor = props.secondaryColor,
    restProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__["default"])(props, _excluded);
  var colors = twoToneColorPalette;
  if (primaryColor) {
    colors = {
      primaryColor: primaryColor,
      secondaryColor: secondaryColor || (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getSecondaryColor)(primaryColor)
    };
  }
  (0,_utils__WEBPACK_IMPORTED_MODULE_2__.useInsertStyles)();
  (0,_utils__WEBPACK_IMPORTED_MODULE_2__.warning)((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isIconDefinition)(icon), "icon should be icon definiton, but got ".concat(icon));
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.isIconDefinition)(icon)) {
    return null;
  }
  var target = icon;
  if (target && typeof target.icon === 'function') {
    target = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, target), {}, {
      icon: target.icon(colors.primaryColor, colors.secondaryColor)
    });
  }
  return (0,_utils__WEBPACK_IMPORTED_MODULE_2__.generate)(target.icon, "svg-".concat(target.name), (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({
    className: className,
    onClick: onClick,
    style: style,
    'data-icon': target.name,
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    'aria-hidden': 'true'
  }, restProps));
};
IconBase.displayName = 'IconReact';
IconBase.getTwoToneColors = getTwoToneColors;
IconBase.setTwoToneColors = setTwoToneColors;
/* harmony default export */ __webpack_exports__["default"] = (IconBase);

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/components/twoTonePrimaryColor.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTwoToneColor: function() { return /* binding */ getTwoToneColor; },
/* harmony export */   setTwoToneColor: function() { return /* binding */ setTwoToneColor; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _IconBase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./IconBase */ "../node_modules/@ant-design/icons/es/components/IconBase.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "../node_modules/@ant-design/icons/es/utils.js");



function setTwoToneColor(twoToneColor) {
  var _normalizeTwoToneColo = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.normalizeTwoToneColors)(twoToneColor),
    _normalizeTwoToneColo2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_normalizeTwoToneColo, 2),
    primaryColor = _normalizeTwoToneColo2[0],
    secondaryColor = _normalizeTwoToneColo2[1];
  return _IconBase__WEBPACK_IMPORTED_MODULE_2__["default"].setTwoToneColors({
    primaryColor: primaryColor,
    secondaryColor: secondaryColor
  });
}
function getTwoToneColor() {
  var colors = _IconBase__WEBPACK_IMPORTED_MODULE_2__["default"].getTwoToneColors();
  if (!colors.calculated) {
    return colors.primaryColor;
  }
  return [colors.primaryColor, colors.secondaryColor];
}

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/BarsOutlined.js":
/*!******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/BarsOutlined.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_BarsOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/BarsOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/BarsOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var BarsOutlined = function BarsOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_BarsOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
BarsOutlined.displayName = 'BarsOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(BarsOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/CheckCircleFilled.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/CheckCircleFilled.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_CheckCircleFilled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/CheckCircleFilled */ "../node_modules/@ant-design/icons-svg/es/asn/CheckCircleFilled.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var CheckCircleFilled = function CheckCircleFilled(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_CheckCircleFilled__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
CheckCircleFilled.displayName = 'CheckCircleFilled';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(CheckCircleFilled));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/CheckCircleOutlined.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/CheckCircleOutlined.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_CheckCircleOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/CheckCircleOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/CheckCircleOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var CheckCircleOutlined = function CheckCircleOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_CheckCircleOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
CheckCircleOutlined.displayName = 'CheckCircleOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(CheckCircleOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/CloseCircleFilled.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/CloseCircleFilled.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_CloseCircleFilled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/CloseCircleFilled */ "../node_modules/@ant-design/icons-svg/es/asn/CloseCircleFilled.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var CloseCircleFilled = function CloseCircleFilled(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_CloseCircleFilled__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
CloseCircleFilled.displayName = 'CloseCircleFilled';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(CloseCircleFilled));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/CloseCircleOutlined.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/CloseCircleOutlined.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_CloseCircleOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/CloseCircleOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/CloseCircleOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var CloseCircleOutlined = function CloseCircleOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_CloseCircleOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
CloseCircleOutlined.displayName = 'CloseCircleOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(CloseCircleOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/CloseOutlined.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/CloseOutlined.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_CloseOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/CloseOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/CloseOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var CloseOutlined = function CloseOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_CloseOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
CloseOutlined.displayName = 'CloseOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(CloseOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/ExclamationCircleFilled.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/ExclamationCircleFilled.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_ExclamationCircleFilled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/ExclamationCircleFilled */ "../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleFilled.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var ExclamationCircleFilled = function ExclamationCircleFilled(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_ExclamationCircleFilled__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
ExclamationCircleFilled.displayName = 'ExclamationCircleFilled';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(ExclamationCircleFilled));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/ExclamationCircleOutlined.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/ExclamationCircleOutlined.js ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_ExclamationCircleOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/ExclamationCircleOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/ExclamationCircleOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var ExclamationCircleOutlined = function ExclamationCircleOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_ExclamationCircleOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
ExclamationCircleOutlined.displayName = 'ExclamationCircleOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(ExclamationCircleOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/EyeOutlined.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/EyeOutlined.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_EyeOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/EyeOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/EyeOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var EyeOutlined = function EyeOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_EyeOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
EyeOutlined.displayName = 'EyeOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(EyeOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/InfoCircleFilled.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/InfoCircleFilled.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_InfoCircleFilled__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/InfoCircleFilled */ "../node_modules/@ant-design/icons-svg/es/asn/InfoCircleFilled.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var InfoCircleFilled = function InfoCircleFilled(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_InfoCircleFilled__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
InfoCircleFilled.displayName = 'InfoCircleFilled';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(InfoCircleFilled));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/InfoCircleOutlined.js":
/*!************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/InfoCircleOutlined.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_InfoCircleOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/InfoCircleOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/InfoCircleOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var InfoCircleOutlined = function InfoCircleOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_InfoCircleOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
InfoCircleOutlined.displayName = 'InfoCircleOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(InfoCircleOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/LeftOutlined.js":
/*!******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/LeftOutlined.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_LeftOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/LeftOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/LeftOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var LeftOutlined = function LeftOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_LeftOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
LeftOutlined.displayName = 'LeftOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(LeftOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/LoadingOutlined.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/LoadingOutlined.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_LoadingOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/LoadingOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/LoadingOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var LoadingOutlined = function LoadingOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_LoadingOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
LoadingOutlined.displayName = 'LoadingOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(LoadingOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/RightOutlined.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/RightOutlined.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_RightOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/RightOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/RightOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var RightOutlined = function RightOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_RightOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
RightOutlined.displayName = 'RightOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(RightOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/RotateLeftOutlined.js":
/*!************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/RotateLeftOutlined.js ***!
  \************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_RotateLeftOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/RotateLeftOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/RotateLeftOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var RotateLeftOutlined = function RotateLeftOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_RotateLeftOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
RotateLeftOutlined.displayName = 'RotateLeftOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(RotateLeftOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/RotateRightOutlined.js":
/*!*************************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/RotateRightOutlined.js ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_RotateRightOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/RotateRightOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/RotateRightOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var RotateRightOutlined = function RotateRightOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_RotateRightOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
RotateRightOutlined.displayName = 'RotateRightOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(RotateRightOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/ZoomInOutlined.js":
/*!********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/ZoomInOutlined.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_ZoomInOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/ZoomInOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/ZoomInOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var ZoomInOutlined = function ZoomInOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_ZoomInOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
ZoomInOutlined.displayName = 'ZoomInOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(ZoomInOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/icons/ZoomOutOutlined.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/icons/ZoomOutOutlined.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ant_design_icons_svg_es_asn_ZoomOutOutlined__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons-svg/es/asn/ZoomOutOutlined */ "../node_modules/@ant-design/icons-svg/es/asn/ZoomOutOutlined.js");
/* harmony import */ var _components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AntdIcon */ "../node_modules/@ant-design/icons/es/components/AntdIcon.js");

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY



var ZoomOutOutlined = function ZoomOutOutlined(props, ref) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_components_AntdIcon__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props), {}, {
    ref: ref,
    icon: _ant_design_icons_svg_es_asn_ZoomOutOutlined__WEBPACK_IMPORTED_MODULE_3__["default"]
  }));
};
ZoomOutOutlined.displayName = 'ZoomOutOutlined';
/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(ZoomOutOutlined));

/***/ }),

/***/ "../node_modules/@ant-design/icons/es/utils.js":
/*!*****************************************************!*\
  !*** ../node_modules/@ant-design/icons/es/utils.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generate: function() { return /* binding */ generate; },
/* harmony export */   getSecondaryColor: function() { return /* binding */ getSecondaryColor; },
/* harmony export */   iconStyles: function() { return /* binding */ iconStyles; },
/* harmony export */   isIconDefinition: function() { return /* binding */ isIconDefinition; },
/* harmony export */   normalizeAttrs: function() { return /* binding */ normalizeAttrs; },
/* harmony export */   normalizeTwoToneColors: function() { return /* binding */ normalizeTwoToneColors; },
/* harmony export */   svgBaseProps: function() { return /* binding */ svgBaseProps; },
/* harmony export */   useInsertStyles: function() { return /* binding */ useInsertStyles; },
/* harmony export */   warning: function() { return /* binding */ warning; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _ant_design_colors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/colors */ "../node_modules/@ant-design/colors/dist/index.esm.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_util_es_warning__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/warning */ "../node_modules/rc-util/es/warning.js");
/* harmony import */ var rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/Dom/dynamicCSS */ "../node_modules/rc-util/es/Dom/dynamicCSS.js");
/* harmony import */ var _components_Context__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/Context */ "../node_modules/@ant-design/icons/es/components/Context.js");
/* harmony import */ var lodash_camelCase__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lodash/camelCase */ "../node_modules/lodash/camelCase.js");
/* harmony import */ var lodash_camelCase__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(lodash_camelCase__WEBPACK_IMPORTED_MODULE_6__);








function warning(valid, message) {
  (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_4__["default"])(valid, "[@ant-design/icons] ".concat(message));
}
function isIconDefinition(target) {
  return (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(target) === 'object' && typeof target.name === 'string' && typeof target.theme === 'string' && ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(target.icon) === 'object' || typeof target.icon === 'function');
}
function normalizeAttrs() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.keys(attrs).reduce(function (acc, key) {
    var val = attrs[key];
    switch (key) {
      case 'class':
        acc.className = val;
        delete acc.class;
        break;
      default:
        delete acc[key];
        acc[lodash_camelCase__WEBPACK_IMPORTED_MODULE_6___default()(key)] = val;
    }
    return acc;
  }, {});
}
function generate(node, key, rootProps) {
  if (!rootProps) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default().createElement(node.tag, (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({
      key: key
    }, normalizeAttrs(node.attrs)), (node.children || []).map(function (child, index) {
      return generate(child, "".concat(key, "-").concat(node.tag, "-").concat(index));
    }));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default().createElement(node.tag, (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({
    key: key
  }, normalizeAttrs(node.attrs)), rootProps), (node.children || []).map(function (child, index) {
    return generate(child, "".concat(key, "-").concat(node.tag, "-").concat(index));
  }));
}
function getSecondaryColor(primaryColor) {
  // choose the second color
  return (0,_ant_design_colors__WEBPACK_IMPORTED_MODULE_2__.generate)(primaryColor)[0];
}
function normalizeTwoToneColors(twoToneColor) {
  if (!twoToneColor) {
    return [];
  }
  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor];
}
// These props make sure that the SVG behaviours like general text.
// Reference: https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
var svgBaseProps = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false'
};
var iconStyles = "\n.anticon {\n  display: inline-block;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.anticon > * {\n  line-height: 1;\n}\n\n.anticon svg {\n  display: inline-block;\n}\n\n.anticon::before {\n  display: none;\n}\n\n.anticon .anticon-icon {\n  display: block;\n}\n\n.anticon[tabindex] {\n  cursor: pointer;\n}\n\n.anticon-spin::before,\n.anticon-spin {\n  display: inline-block;\n  -webkit-animation: loadingCircle 1s infinite linear;\n  animation: loadingCircle 1s infinite linear;\n}\n\n@-webkit-keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n";
var useInsertStyles = function useInsertStyles() {
  var styleStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : iconStyles;
  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_3__.useContext)(_components_Context__WEBPACK_IMPORTED_MODULE_7__["default"]),
    csp = _useContext.csp;
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_5__.updateCSS)(styleStr, '@ant-design-icons', {
      prepend: true,
      csp: csp
    });
  }, []);
};

/***/ }),

/***/ "../node_modules/@ctrl/tinycolor/dist/module/conversion.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@ctrl/tinycolor/dist/module/conversion.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertDecimalToHex: function() { return /* binding */ convertDecimalToHex; },
/* harmony export */   convertHexToDecimal: function() { return /* binding */ convertHexToDecimal; },
/* harmony export */   hslToRgb: function() { return /* binding */ hslToRgb; },
/* harmony export */   hsvToRgb: function() { return /* binding */ hsvToRgb; },
/* harmony export */   numberInputToObject: function() { return /* binding */ numberInputToObject; },
/* harmony export */   parseIntFromHex: function() { return /* binding */ parseIntFromHex; },
/* harmony export */   rgbToHex: function() { return /* binding */ rgbToHex; },
/* harmony export */   rgbToHsl: function() { return /* binding */ rgbToHsl; },
/* harmony export */   rgbToHsv: function() { return /* binding */ rgbToHsv; },
/* harmony export */   rgbToRgb: function() { return /* binding */ rgbToRgb; },
/* harmony export */   rgbaToArgbHex: function() { return /* binding */ rgbaToArgbHex; },
/* harmony export */   rgbaToHex: function() { return /* binding */ rgbaToHex; }
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "../node_modules/@ctrl/tinycolor/dist/module/util.js");

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>
/**
 * Handle bounds / percentage checking to conform to CSS color spec
 * <http://www.w3.org/TR/css3-color/>
 * *Assumes:* r, g, b in [0, 255] or [0, 1]
 * *Returns:* { r, g, b } in [0, 255]
 */
function rgbToRgb(r, g, b) {
    return {
        r: (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(r, 255) * 255,
        g: (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(g, 255) * 255,
        b: (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(b, 255) * 255,
    };
}
/**
 * Converts an RGB color value to HSL.
 * *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
 * *Returns:* { h, s, l } in [0,1]
 */
function rgbToHsl(r, g, b) {
    r = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(r, 255);
    g = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(g, 255);
    b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(b, 255);
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;
    if (max === min) {
        s = 0;
        h = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                break;
        }
        h /= 6;
    }
    return { h: h, s: s, l: l };
}
function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * (6 * t);
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
/**
 * Converts an HSL color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hslToRgb(h, s, l) {
    var r;
    var g;
    var b;
    h = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(h, 360);
    s = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(s, 100);
    l = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(l, 100);
    if (s === 0) {
        // achromatic
        g = l;
        b = l;
        r = l;
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
}
/**
 * Converts an RGB color value to HSV
 *
 * *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
 * *Returns:* { h, s, v } in [0,1]
 */
function rgbToHsv(r, g, b) {
    r = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(r, 255);
    g = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(g, 255);
    b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(b, 255);
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var v = max;
    var d = max - min;
    var s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0; // achromatic
    }
    else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}
/**
 * Converts an HSV color value to RGB.
 *
 * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
 * *Returns:* { r, g, b } in the set [0, 255]
 */
function hsvToRgb(h, s, v) {
    h = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(h, 360) * 6;
    s = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(s, 100);
    v = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.bound01)(v, 100);
    var i = Math.floor(h);
    var f = h - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var mod = i % 6;
    var r = [v, q, p, p, t, v][mod];
    var g = [t, v, v, q, p, p][mod];
    var b = [p, p, t, v, v, q][mod];
    return { r: r * 255, g: g * 255, b: b * 255 };
}
/**
 * Converts an RGB color to hex
 *
 * Assumes r, g, and b are contained in the set [0, 255]
 * Returns a 3 or 6 character hex
 */
function rgbToHex(r, g, b, allow3Char) {
    var hex = [
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(r).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(g).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(b).toString(16)),
    ];
    // Return a 3 character hex if possible
    if (allow3Char &&
        hex[0].startsWith(hex[0].charAt(1)) &&
        hex[1].startsWith(hex[1].charAt(1)) &&
        hex[2].startsWith(hex[2].charAt(1))) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }
    return hex.join('');
}
/**
 * Converts an RGBA color plus alpha transparency to hex
 *
 * Assumes r, g, b are contained in the set [0, 255] and
 * a in [0, 1]. Returns a 4 or 8 character rgba hex
 */
// eslint-disable-next-line max-params
function rgbaToHex(r, g, b, a, allow4Char) {
    var hex = [
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(r).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(g).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(b).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(convertDecimalToHex(a)),
    ];
    // Return a 4 character hex if possible
    if (allow4Char &&
        hex[0].startsWith(hex[0].charAt(1)) &&
        hex[1].startsWith(hex[1].charAt(1)) &&
        hex[2].startsWith(hex[2].charAt(1)) &&
        hex[3].startsWith(hex[3].charAt(1))) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
    }
    return hex.join('');
}
/**
 * Converts an RGBA color to an ARGB Hex8 string
 * Rarely used, but required for "toFilter()"
 */
function rgbaToArgbHex(r, g, b, a) {
    var hex = [
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(convertDecimalToHex(a)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(r).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(g).toString(16)),
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.pad2)(Math.round(b).toString(16)),
    ];
    return hex.join('');
}
/** Converts a decimal to a hex value */
function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
}
/** Converts a hex value to a decimal */
function convertHexToDecimal(h) {
    return parseIntFromHex(h) / 255;
}
/** Parse a base-16 hex value into a base-10 integer */
function parseIntFromHex(val) {
    return parseInt(val, 16);
}
function numberInputToObject(color) {
    return {
        r: color >> 16,
        g: (color & 0xff00) >> 8,
        b: color & 0xff,
    };
}


/***/ }),

/***/ "../node_modules/@ctrl/tinycolor/dist/module/css-color-names.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@ctrl/tinycolor/dist/module/css-color-names.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   names: function() { return /* binding */ names; }
/* harmony export */ });
// https://github.com/bahamas10/css-color-names/blob/master/css-color-names.json
/**
 * @hidden
 */
var names = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    goldenrod: '#daa520',
    gold: '#ffd700',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavenderblush: '#fff0f5',
    lavender: '#e6e6fa',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};


/***/ }),

/***/ "../node_modules/@ctrl/tinycolor/dist/module/format-input.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@ctrl/tinycolor/dist/module/format-input.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inputToRGB: function() { return /* binding */ inputToRGB; },
/* harmony export */   isValidCSSUnit: function() { return /* binding */ isValidCSSUnit; },
/* harmony export */   stringInputToObject: function() { return /* binding */ stringInputToObject; }
/* harmony export */ });
/* harmony import */ var _conversion_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conversion.js */ "../node_modules/@ctrl/tinycolor/dist/module/conversion.js");
/* harmony import */ var _css_color_names_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css-color-names.js */ "../node_modules/@ctrl/tinycolor/dist/module/css-color-names.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util.js */ "../node_modules/@ctrl/tinycolor/dist/module/util.js");
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */



/**
 * Given a string or object, convert that input to RGB
 *
 * Possible string inputs:
 * ```
 * "red"
 * "#f00" or "f00"
 * "#ff0000" or "ff0000"
 * "#ff000000" or "ff000000"
 * "rgb 255 0 0" or "rgb (255, 0, 0)"
 * "rgb 1.0 0 0" or "rgb (1, 0, 0)"
 * "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
 * "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
 * "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
 * "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
 * "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
 * ```
 */
function inputToRGB(color) {
    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var s = null;
    var v = null;
    var l = null;
    var ok = false;
    var format = false;
    if (typeof color === 'string') {
        color = stringInputToObject(color);
    }
    if (typeof color === 'object') {
        if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.rgbToRgb)(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.convertToPercentage)(color.s);
            v = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.convertToPercentage)(color.v);
            rgb = (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.hsvToRgb)(color.h, s, v);
            ok = true;
            format = 'hsv';
        }
        else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.convertToPercentage)(color.s);
            l = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.convertToPercentage)(color.l);
            rgb = (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.hslToRgb)(color.h, s, l);
            ok = true;
            format = 'hsl';
        }
        if (Object.prototype.hasOwnProperty.call(color, 'a')) {
            a = color.a;
        }
    }
    a = (0,_util_js__WEBPACK_IMPORTED_MODULE_1__.boundAlpha)(a);
    return {
        ok: ok,
        format: color.format || format,
        r: Math.min(255, Math.max(rgb.r, 0)),
        g: Math.min(255, Math.max(rgb.g, 0)),
        b: Math.min(255, Math.max(rgb.b, 0)),
        a: a,
    };
}
// <http://www.w3.org/TR/css3-values/#integers>
var CSS_INTEGER = '[-\\+]?\\d+%?';
// <http://www.w3.org/TR/css3-values/#number-value>
var CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';
// Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
var CSS_UNIT = "(?:".concat(CSS_NUMBER, ")|(?:").concat(CSS_INTEGER, ")");
// Actual matching.
// Parentheses and commas are optional, but not required.
// Whitespace can take the place of commas or opening paren
var PERMISSIVE_MATCH3 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
var PERMISSIVE_MATCH4 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
var matchers = {
    CSS_UNIT: new RegExp(CSS_UNIT),
    rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
    rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
    hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
    hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
    hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
    hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
};
/**
 * Permissive string parsing.  Take in a number of formats, and output an object
 * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
 */
function stringInputToObject(color) {
    color = color.trim().toLowerCase();
    if (color.length === 0) {
        return false;
    }
    var named = false;
    if (_css_color_names_js__WEBPACK_IMPORTED_MODULE_2__.names[color]) {
        color = _css_color_names_js__WEBPACK_IMPORTED_MODULE_2__.names[color];
        named = true;
    }
    else if (color === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
    }
    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match = matchers.rgb.exec(color);
    if (match) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    match = matchers.rgba.exec(color);
    if (match) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    match = matchers.hsl.exec(color);
    if (match) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    match = matchers.hsla.exec(color);
    if (match) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    match = matchers.hsv.exec(color);
    if (match) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    match = matchers.hsva.exec(color);
    if (match) {
        return { h: match[1], s: match[2], v: match[3], a: match[4] };
    }
    match = matchers.hex8.exec(color);
    if (match) {
        return {
            r: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[1]),
            g: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[2]),
            b: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[3]),
            a: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.convertHexToDecimal)(match[4]),
            format: named ? 'name' : 'hex8',
        };
    }
    match = matchers.hex6.exec(color);
    if (match) {
        return {
            r: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[1]),
            g: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[2]),
            b: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[3]),
            format: named ? 'name' : 'hex',
        };
    }
    match = matchers.hex4.exec(color);
    if (match) {
        return {
            r: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[1] + match[1]),
            g: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[2] + match[2]),
            b: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[3] + match[3]),
            a: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.convertHexToDecimal)(match[4] + match[4]),
            format: named ? 'name' : 'hex8',
        };
    }
    match = matchers.hex3.exec(color);
    if (match) {
        return {
            r: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[1] + match[1]),
            g: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[2] + match[2]),
            b: (0,_conversion_js__WEBPACK_IMPORTED_MODULE_0__.parseIntFromHex)(match[3] + match[3]),
            format: named ? 'name' : 'hex',
        };
    }
    return false;
}
/**
 * Check to see if it looks like a CSS unit
 * (see `matchers` above for definition).
 */
function isValidCSSUnit(color) {
    return Boolean(matchers.CSS_UNIT.exec(String(color)));
}


/***/ }),

/***/ "../node_modules/@ctrl/tinycolor/dist/module/util.js":
/*!***********************************************************!*\
  !*** ../node_modules/@ctrl/tinycolor/dist/module/util.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bound01: function() { return /* binding */ bound01; },
/* harmony export */   boundAlpha: function() { return /* binding */ boundAlpha; },
/* harmony export */   clamp01: function() { return /* binding */ clamp01; },
/* harmony export */   convertToPercentage: function() { return /* binding */ convertToPercentage; },
/* harmony export */   isOnePointZero: function() { return /* binding */ isOnePointZero; },
/* harmony export */   isPercentage: function() { return /* binding */ isPercentage; },
/* harmony export */   pad2: function() { return /* binding */ pad2; }
/* harmony export */ });
/**
 * Take input from [0, n] and return it as [0, 1]
 * @hidden
 */
function bound01(n, max) {
    if (isOnePointZero(n)) {
        n = '100%';
    }
    var isPercent = isPercentage(n);
    n = max === 360 ? n : Math.min(max, Math.max(0, parseFloat(n)));
    // Automatically convert percentage into number
    if (isPercent) {
        n = parseInt(String(n * max), 10) / 100;
    }
    // Handle floating point rounding errors
    if (Math.abs(n - max) < 0.000001) {
        return 1;
    }
    // Convert into [0, 1] range if it isn't already
    if (max === 360) {
        // If n is a hue given in degrees,
        // wrap around out-of-range values into [0, 360] range
        // then convert into [0, 1].
        n = (n < 0 ? (n % max) + max : n % max) / parseFloat(String(max));
    }
    else {
        // If n not a hue given in degrees
        // Convert into [0, 1] range if it isn't already.
        n = (n % max) / parseFloat(String(max));
    }
    return n;
}
/**
 * Force a number between 0 and 1
 * @hidden
 */
function clamp01(val) {
    return Math.min(1, Math.max(0, val));
}
/**
 * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
 * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
 * @hidden
 */
function isOnePointZero(n) {
    return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
}
/**
 * Check to see if string passed in is a percentage
 * @hidden
 */
function isPercentage(n) {
    return typeof n === 'string' && n.indexOf('%') !== -1;
}
/**
 * Return a valid alpha value [0,1] with all invalid values being set to 1
 * @hidden
 */
function boundAlpha(a) {
    a = parseFloat(a);
    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }
    return a;
}
/**
 * Replace a decimal with it's percentage value
 * @hidden
 */
function convertToPercentage(n) {
    if (n <= 1) {
        return "".concat(Number(n) * 100, "%");
    }
    return n;
}
/**
 * Force a hex value to have 2 characters
 * @hidden
 */
function pad2(c) {
    return c.length === 1 ? '0' + c : String(c);
}


/***/ }),

/***/ "../node_modules/@rc-component/portal/es/Context.js":
/*!**********************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/Context.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var OrderContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
/* harmony default export */ __webpack_exports__["default"] = (OrderContext);

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/Portal.js":
/*!*********************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/Portal.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var rc_util_es_warning__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/warning */ "../node_modules/rc-util/es/warning.js");
/* harmony import */ var rc_util_es_ref__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/ref */ "../node_modules/rc-util/es/ref.js");
/* harmony import */ var _Context__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Context */ "../node_modules/@rc-component/portal/es/Context.js");
/* harmony import */ var _useDom__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./useDom */ "../node_modules/@rc-component/portal/es/useDom.js");
/* harmony import */ var _useScrollLocker__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./useScrollLocker */ "../node_modules/@rc-component/portal/es/useScrollLocker.js");
/* harmony import */ var _mock__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./mock */ "../node_modules/@rc-component/portal/es/mock.js");










var getPortalContainer = function getPortalContainer(getContainer) {
  if (getContainer === false) {
    return false;
  }
  if (!(0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_3__["default"])() || !getContainer) {
    return null;
  }
  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};
var Portal = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(function (props, ref) {
  var open = props.open,
    autoLock = props.autoLock,
    getContainer = props.getContainer,
    debug = props.debug,
    _props$autoDestroy = props.autoDestroy,
    autoDestroy = _props$autoDestroy === void 0 ? true : _props$autoDestroy,
    children = props.children;
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_1__.useState(open),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState, 2),
    shouldRender = _React$useState2[0],
    setShouldRender = _React$useState2[1];
  var mergedRender = shouldRender || open;

  // ========================= Warning =========================
  if (true) {
    (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_4__["default"])((0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_3__["default"])() || !open, "Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.");
  }

  // ====================== Should Render ======================
  react__WEBPACK_IMPORTED_MODULE_1__.useEffect(function () {
    if (autoDestroy || open) {
      setShouldRender(open);
    }
  }, [open, autoDestroy]);

  // ======================== Container ========================
  var _React$useState3 = react__WEBPACK_IMPORTED_MODULE_1__.useState(function () {
      return getPortalContainer(getContainer);
    }),
    _React$useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState3, 2),
    innerContainer = _React$useState4[0],
    setInnerContainer = _React$useState4[1];
  react__WEBPACK_IMPORTED_MODULE_1__.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  });
  var _useDom = (0,_useDom__WEBPACK_IMPORTED_MODULE_7__["default"])(mergedRender && !innerContainer, debug),
    _useDom2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useDom, 2),
    defaultContainer = _useDom2[0],
    queueCreate = _useDom2[1];
  var mergedContainer = innerContainer !== null && innerContainer !== void 0 ? innerContainer : defaultContainer;

  // ========================= Locker ==========================
  (0,_useScrollLocker__WEBPACK_IMPORTED_MODULE_8__["default"])(autoLock && open && (0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_3__["default"])() && (mergedContainer === defaultContainer || mergedContainer === document.body));

  // =========================== Ref ===========================
  var childRef = null;
  if (children && (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_5__.supportRef)(children) && ref) {
    var _ref = children;
    childRef = _ref.ref;
  }
  var mergedRef = (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_5__.useComposeRef)(childRef, ref);

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  if (!mergedRender || !(0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_3__["default"])() || innerContainer === undefined) {
    return null;
  }

  // Render inline
  var renderInline = mergedContainer === false || (0,_mock__WEBPACK_IMPORTED_MODULE_9__.inlineMock)();
  var reffedChildren = children;
  if (ref) {
    reffedChildren = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.cloneElement(children, {
      ref: mergedRef
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_Context__WEBPACK_IMPORTED_MODULE_6__["default"].Provider, {
    value: queueCreate
  }, renderInline ? reffedChildren : /*#__PURE__*/(0,react_dom__WEBPACK_IMPORTED_MODULE_2__.createPortal)(reffedChildren, mergedContainer));
});
if (true) {
  Portal.displayName = 'Portal';
}
/* harmony default export */ __webpack_exports__["default"] = (Portal);

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/index.js":
/*!********************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inlineMock: function() { return /* reexport safe */ _mock__WEBPACK_IMPORTED_MODULE_1__.inlineMock; }
/* harmony export */ });
/* harmony import */ var _Portal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Portal */ "../node_modules/@rc-component/portal/es/Portal.js");
/* harmony import */ var _mock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mock */ "../node_modules/@rc-component/portal/es/mock.js");



/* harmony default export */ __webpack_exports__["default"] = (_Portal__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/mock.js":
/*!*******************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/mock.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inline: function() { return /* binding */ inline; },
/* harmony export */   inlineMock: function() { return /* binding */ inlineMock; }
/* harmony export */ });
var inline = false;
function inlineMock(nextInline) {
  if (typeof nextInline === 'boolean') {
    inline = nextInline;
  }
  return inline;
}

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/useDom.js":
/*!*********************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/useDom.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useDom; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "../node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_hooks_useLayoutEffect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/hooks/useLayoutEffect */ "../node_modules/rc-util/es/hooks/useLayoutEffect.js");
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var _Context__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Context */ "../node_modules/@rc-component/portal/es/Context.js");






var EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
function useDom(render, debug) {
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_2__.useState(function () {
      if (!(0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_4__["default"])()) {
        return null;
      }
      var defaultEle = document.createElement('div');
      if ( true && debug) {
        defaultEle.setAttribute('data-debug', debug);
      }
      return defaultEle;
    }),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_React$useState, 1),
    ele = _React$useState2[0];

  // ========================== Order ==========================
  var appendedRef = react__WEBPACK_IMPORTED_MODULE_2__.useRef(false);
  var queueCreate = react__WEBPACK_IMPORTED_MODULE_2__.useContext(_Context__WEBPACK_IMPORTED_MODULE_5__["default"]);
  var _React$useState3 = react__WEBPACK_IMPORTED_MODULE_2__.useState(EMPTY_LIST),
    _React$useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_React$useState3, 2),
    queue = _React$useState4[0],
    setQueue = _React$useState4[1];
  var mergedQueueCreate = queueCreate || (appendedRef.current ? undefined : function (appendFn) {
    setQueue(function (origin) {
      var newQueue = [appendFn].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(origin));
      return newQueue;
    });
  });

  // =========================== DOM ===========================
  function append() {
    if (!ele.parentElement) {
      document.body.appendChild(ele);
    }
    appendedRef.current = true;
  }
  function cleanup() {
    var _ele$parentElement;
    (_ele$parentElement = ele.parentElement) === null || _ele$parentElement === void 0 ? void 0 : _ele$parentElement.removeChild(ele);
    appendedRef.current = false;
  }
  (0,rc_util_es_hooks_useLayoutEffect__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup();
    }
    return cleanup;
  }, [render]);
  (0,rc_util_es_hooks_useLayoutEffect__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
    if (queue.length) {
      queue.forEach(function (appendFn) {
        return appendFn();
      });
      setQueue(EMPTY_LIST);
    }
  }, [queue]);
  return [ele, mergedQueueCreate];
}

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/useScrollLocker.js":
/*!******************************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/useScrollLocker.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useScrollLocker; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util/es/Dom/dynamicCSS */ "../node_modules/rc-util/es/Dom/dynamicCSS.js");
/* harmony import */ var rc_util_es_hooks_useLayoutEffect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/hooks/useLayoutEffect */ "../node_modules/rc-util/es/hooks/useLayoutEffect.js");
/* harmony import */ var rc_util_es_getScrollBarSize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/getScrollBarSize */ "../node_modules/rc-util/es/getScrollBarSize.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util */ "../node_modules/@rc-component/portal/es/util.js");






var UNIQUE_ID = "rc-util-locker-".concat(Date.now());
var uuid = 0;
function useScrollLocker(lock) {
  var mergedLock = !!lock;
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_1__.useState(function () {
      uuid += 1;
      return "".concat(UNIQUE_ID, "_").concat(uuid);
    }),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState, 1),
    id = _React$useState2[0];
  (0,rc_util_es_hooks_useLayoutEffect__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
    if (mergedLock) {
      var scrollbarSize = (0,rc_util_es_getScrollBarSize__WEBPACK_IMPORTED_MODULE_4__.getTargetScrollBarSize)(document.body).width;
      var isOverflow = (0,_util__WEBPACK_IMPORTED_MODULE_5__.isBodyOverflowing)();
      (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__.updateCSS)("\nhtml body {\n  overflow-y: hidden;\n  ".concat(isOverflow ? "width: calc(100% - ".concat(scrollbarSize, "px);") : '', "\n}"), id);
    } else {
      (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__.removeCSS)(id);
    }
    return function () {
      (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_2__.removeCSS)(id);
    };
  }, [mergedLock, id]);
}

/***/ }),

/***/ "../node_modules/@rc-component/portal/es/util.js":
/*!*******************************************************!*\
  !*** ../node_modules/@rc-component/portal/es/util.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isBodyOverflowing: function() { return /* binding */ isBodyOverflowing; }
/* harmony export */ });
/**
 * Test usage export. Do not use in your production
 */
function isBodyOverflowing() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) && window.innerWidth > document.body.offsetWidth;
}

/***/ }),

/***/ "../node_modules/@remix-run/router/dist/router.js":
/*!********************************************************!*\
  !*** ../node_modules/@remix-run/router/dist/router.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbortedDeferredError: function() { return /* binding */ AbortedDeferredError; },
/* harmony export */   Action: function() { return /* binding */ Action; },
/* harmony export */   ErrorResponse: function() { return /* binding */ ErrorResponse; },
/* harmony export */   IDLE_BLOCKER: function() { return /* binding */ IDLE_BLOCKER; },
/* harmony export */   IDLE_FETCHER: function() { return /* binding */ IDLE_FETCHER; },
/* harmony export */   IDLE_NAVIGATION: function() { return /* binding */ IDLE_NAVIGATION; },
/* harmony export */   UNSAFE_DEFERRED_SYMBOL: function() { return /* binding */ UNSAFE_DEFERRED_SYMBOL; },
/* harmony export */   UNSAFE_DeferredData: function() { return /* binding */ DeferredData; },
/* harmony export */   UNSAFE_convertRoutesToDataRoutes: function() { return /* binding */ convertRoutesToDataRoutes; },
/* harmony export */   UNSAFE_getPathContributingMatches: function() { return /* binding */ getPathContributingMatches; },
/* harmony export */   UNSAFE_invariant: function() { return /* binding */ invariant; },
/* harmony export */   UNSAFE_warning: function() { return /* binding */ warning; },
/* harmony export */   createBrowserHistory: function() { return /* binding */ createBrowserHistory; },
/* harmony export */   createHashHistory: function() { return /* binding */ createHashHistory; },
/* harmony export */   createMemoryHistory: function() { return /* binding */ createMemoryHistory; },
/* harmony export */   createPath: function() { return /* binding */ createPath; },
/* harmony export */   createRouter: function() { return /* binding */ createRouter; },
/* harmony export */   createStaticHandler: function() { return /* binding */ createStaticHandler; },
/* harmony export */   defer: function() { return /* binding */ defer; },
/* harmony export */   generatePath: function() { return /* binding */ generatePath; },
/* harmony export */   getStaticContextFromError: function() { return /* binding */ getStaticContextFromError; },
/* harmony export */   getToPathname: function() { return /* binding */ getToPathname; },
/* harmony export */   isDeferredData: function() { return /* binding */ isDeferredData; },
/* harmony export */   isRouteErrorResponse: function() { return /* binding */ isRouteErrorResponse; },
/* harmony export */   joinPaths: function() { return /* binding */ joinPaths; },
/* harmony export */   json: function() { return /* binding */ json; },
/* harmony export */   matchPath: function() { return /* binding */ matchPath; },
/* harmony export */   matchRoutes: function() { return /* binding */ matchRoutes; },
/* harmony export */   normalizePathname: function() { return /* binding */ normalizePathname; },
/* harmony export */   parsePath: function() { return /* binding */ parsePath; },
/* harmony export */   redirect: function() { return /* binding */ redirect; },
/* harmony export */   redirectDocument: function() { return /* binding */ redirectDocument; },
/* harmony export */   resolvePath: function() { return /* binding */ resolvePath; },
/* harmony export */   resolveTo: function() { return /* binding */ resolveTo; },
/* harmony export */   stripBasename: function() { return /* binding */ stripBasename; }
/* harmony export */ });
/**
 * @remix-run/router v1.8.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

////////////////////////////////////////////////////////////////////////////////
//#region Types and Constants
////////////////////////////////////////////////////////////////////////////////
/**
 * Actions represent the type of change to a location value.
 */
var Action;
(function (Action) {
  /**
   * A POP indicates a change to an arbitrary index in the history stack, such
   * as a back or forward navigation. It does not describe the direction of the
   * navigation, only that the current index changed.
   *
   * Note: This is the default action for newly created history objects.
   */
  Action["Pop"] = "POP";
  /**
   * A PUSH indicates a new entry being added to the history stack, such as when
   * a link is clicked and a new page loads. When this happens, all subsequent
   * entries in the stack are lost.
   */
  Action["Push"] = "PUSH";
  /**
   * A REPLACE indicates the entry at the current index in the history stack
   * being replaced by a new one.
   */
  Action["Replace"] = "REPLACE";
})(Action || (Action = {}));
const PopStateEventType = "popstate";
/**
 * Memory history stores the current location in memory. It is designed for use
 * in stateful non-browser environments like tests and React Native.
 */
function createMemoryHistory(options) {
  if (options === void 0) {
    options = {};
  }
  let {
    initialEntries = ["/"],
    initialIndex,
    v5Compat = false
  } = options;
  let entries; // Declare so we can access from createMemoryLocation
  entries = initialEntries.map((entry, index) => createMemoryLocation(entry, typeof entry === "string" ? null : entry.state, index === 0 ? "default" : undefined));
  let index = clampIndex(initialIndex == null ? entries.length - 1 : initialIndex);
  let action = Action.Pop;
  let listener = null;
  function clampIndex(n) {
    return Math.min(Math.max(n, 0), entries.length - 1);
  }
  function getCurrentLocation() {
    return entries[index];
  }
  function createMemoryLocation(to, state, key) {
    if (state === void 0) {
      state = null;
    }
    let location = createLocation(entries ? getCurrentLocation().pathname : "/", to, state, key);
    warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in memory history: " + JSON.stringify(to));
    return location;
  }
  function createHref(to) {
    return typeof to === "string" ? to : createPath(to);
  }
  let history = {
    get index() {
      return index;
    },
    get action() {
      return action;
    },
    get location() {
      return getCurrentLocation();
    },
    createHref,
    createURL(to) {
      return new URL(createHref(to), "http://localhost");
    },
    encodeLocation(to) {
      let path = typeof to === "string" ? parsePath(to) : to;
      return {
        pathname: path.pathname || "",
        search: path.search || "",
        hash: path.hash || ""
      };
    },
    push(to, state) {
      action = Action.Push;
      let nextLocation = createMemoryLocation(to, state);
      index += 1;
      entries.splice(index, entries.length, nextLocation);
      if (v5Compat && listener) {
        listener({
          action,
          location: nextLocation,
          delta: 1
        });
      }
    },
    replace(to, state) {
      action = Action.Replace;
      let nextLocation = createMemoryLocation(to, state);
      entries[index] = nextLocation;
      if (v5Compat && listener) {
        listener({
          action,
          location: nextLocation,
          delta: 0
        });
      }
    },
    go(delta) {
      action = Action.Pop;
      let nextIndex = clampIndex(index + delta);
      let nextLocation = entries[nextIndex];
      index = nextIndex;
      if (listener) {
        listener({
          action,
          location: nextLocation,
          delta
        });
      }
    },
    listen(fn) {
      listener = fn;
      return () => {
        listener = null;
      };
    }
  };
  return history;
}
/**
 * Browser history stores the location in regular URLs. This is the standard for
 * most web apps, but it requires some configuration on the server to ensure you
 * serve the same app at multiple URLs.
 *
 * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createbrowserhistory
 */
function createBrowserHistory(options) {
  if (options === void 0) {
    options = {};
  }
  function createBrowserLocation(window, globalHistory) {
    let {
      pathname,
      search,
      hash
    } = window.location;
    return createLocation("", {
      pathname,
      search,
      hash
    },
    // state defaults to `null` because `window.history.state` does
    globalHistory.state && globalHistory.state.usr || null, globalHistory.state && globalHistory.state.key || "default");
  }
  function createBrowserHref(window, to) {
    return typeof to === "string" ? to : createPath(to);
  }
  return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}
/**
 * Hash history stores the location in window.location.hash. This makes it ideal
 * for situations where you don't want to send the location to the server for
 * some reason, either because you do cannot configure it or the URL space is
 * reserved for something else.
 *
 * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createhashhistory
 */
function createHashHistory(options) {
  if (options === void 0) {
    options = {};
  }
  function createHashLocation(window, globalHistory) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = parsePath(window.location.hash.substr(1));
    // Hash URL should always have a leading / just like window.location.pathname
    // does, so if an app ends up at a route like /#something then we add a
    // leading slash so all of our path-matching behaves the same as if it would
    // in a browser router.  This is particularly important when there exists a
    // root splat route (<Route path="*">) since that matches internally against
    // "/*" and we'd expect /#something to 404 in a hash router app.
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }
    return createLocation("", {
      pathname,
      search,
      hash
    },
    // state defaults to `null` because `window.history.state` does
    globalHistory.state && globalHistory.state.usr || null, globalHistory.state && globalHistory.state.key || "default");
  }
  function createHashHref(window, to) {
    let base = window.document.querySelector("base");
    let href = "";
    if (base && base.getAttribute("href")) {
      let url = window.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }
    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }
  function validateHashLocation(location, to) {
    warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in hash history.push(" + JSON.stringify(to) + ")");
  }
  return getUrlBasedHistory(createHashLocation, createHashHref, validateHashLocation, options);
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    // eslint-disable-next-line no-console
    if (typeof console !== "undefined") console.warn(message);
    try {
      // Welcome to debugging history!
      //
      // This error is thrown as a convenience so you can more easily
      // find the source for a warning that appears in the console by
      // enabling "pause on exceptions" in your JavaScript debugger.
      throw new Error(message);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
/**
 * For browser-based histories, we combine the state and key into an object
 */
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
/**
 * Creates a Location object with a unique key from the given Path
 */
function createLocation(current, to, state, key) {
  if (state === void 0) {
    state = null;
  }
  let location = _extends({
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: ""
  }, typeof to === "string" ? parsePath(to) : to, {
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  });
  return location;
}
/**
 * Creates a string URL path from the given pathname, search, and hash components.
 */
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 */
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
  if (options === void 0) {
    options = {};
  }
  let {
    window = document.defaultView,
    v5Compat = false
  } = options;
  let globalHistory = window.history;
  let action = Action.Pop;
  let listener = null;
  let index = getIndex();
  // Index should only be null when we initialize. If not, it's because the
  // user called history.pushState or history.replaceState directly, in which
  // case we should log a warning as it will result in bugs.
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function getIndex() {
    let state = globalHistory.state || {
      idx: null
    };
    return state.idx;
  }
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({
        action,
        location: history.location,
        delta
      });
    }
  }
  function push(to, state) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    // try...catch because iOS limits us to 100 pushState calls :/
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      // If the exception is because `state` can't be serialized, let that throw
      // outwards just like a replace call would so the dev knows the cause
      // https://html.spec.whatwg.org/multipage/nav-history-apis.html#shared-history-push/replace-state-steps
      // https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializeinternal
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      // They are going to lose state here, but there is no real
      // way to warn them about it since the page will refresh...
      window.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 1
      });
    }
  }
  function replace(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 0
      });
    }
  }
  function createURL(to) {
    // window.location.origin is "null" (the literal string value) in Firefox
    // under certain conditions, notably when serving from a local HTML file
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=878297
    let base = window.location.origin !== "null" ? window.location.origin : window.location.href;
    let href = typeof to === "string" ? to : createPath(to);
    invariant(base, "No window.location.(origin|href) available to create URL for href: " + href);
    return new URL(href, base);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window, to);
    },
    createURL,
    encodeLocation(to) {
      // Encode a Location the same way window.location would
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
//#endregion

var ResultType;
(function (ResultType) {
  ResultType["data"] = "data";
  ResultType["deferred"] = "deferred";
  ResultType["redirect"] = "redirect";
  ResultType["error"] = "error";
})(ResultType || (ResultType = {}));
const immutableRouteKeys = new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);
function isIndexRoute(route) {
  return route.index === true;
}
// Walk the route tree generating unique IDs where necessary so we are working
// solely with AgnosticDataRouteObject's within the Router
function convertRoutesToDataRoutes(routes, mapRouteProperties, parentPath, manifest) {
  if (parentPath === void 0) {
    parentPath = [];
  }
  if (manifest === void 0) {
    manifest = {};
  }
  return routes.map((route, index) => {
    let treePath = [...parentPath, index];
    let id = typeof route.id === "string" ? route.id : treePath.join("-");
    invariant(route.index !== true || !route.children, "Cannot specify children on an index route");
    invariant(!manifest[id], "Found a route id collision on id \"" + id + "\".  Route " + "id's must be globally unique within Data Router usages");
    if (isIndexRoute(route)) {
      let indexRoute = _extends({}, route, mapRouteProperties(route), {
        id
      });
      manifest[id] = indexRoute;
      return indexRoute;
    } else {
      let pathOrLayoutRoute = _extends({}, route, mapRouteProperties(route), {
        id,
        children: undefined
      });
      manifest[id] = pathOrLayoutRoute;
      if (route.children) {
        pathOrLayoutRoute.children = convertRoutesToDataRoutes(route.children, mapRouteProperties, treePath, manifest);
      }
      return pathOrLayoutRoute;
    }
  });
}
/**
 * Matches the given routes to a location and returns the match data.
 *
 * @see https://reactrouter.com/utils/match-routes
 */
function matchRoutes(routes, locationArg, basename) {
  if (basename === void 0) {
    basename = "/";
  }
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    matches = matchRouteBranch(branches[i],
    // Incoming pathnames are generally encoded from either window.location
    // or from router.navigate, but we want to match against the unencoded
    // paths in the route definitions.  Memory router locations won't be
    // encoded here but there also shouldn't be anything to decode so this
    // should be a safe operation.  This avoids needing matchRoutes to be
    // history-aware.
    safelyDecodeURI(pathname));
  }
  return matches;
}
function flattenRoutes(routes, branches, parentsMeta, parentPath) {
  if (branches === void 0) {
    branches = [];
  }
  if (parentsMeta === void 0) {
    parentsMeta = [];
  }
  if (parentPath === void 0) {
    parentPath = "";
  }
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === undefined ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant(meta.relativePath.startsWith(parentPath), "Absolute route path \"" + meta.relativePath + "\" nested under path " + ("\"" + parentPath + "\" is not valid. An absolute child route path ") + "must start with the combined path of all its parent routes.");
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    // Add the children before adding this route to the array so we traverse the
    // route tree depth-first and child routes appear before their parents in
    // the "flattened" version.
    if (route.children && route.children.length > 0) {
      invariant(
      // Our types know better, but runtime JS may not!
      // @ts-expect-error
      route.index !== true, "Index routes must not have child routes. Please remove " + ("all child routes from route path \"" + path + "\"."));
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    // Routes without a path shouldn't ever match by themselves unless they are
    // index routes, so don't add them to the list of possible branches.
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    var _route$path;
    // coarse-grain check for optional params
    if (route.path === "" || !((_route$path = route.path) != null && _route$path.includes("?"))) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
/**
 * Computes all combinations of optional path segments for a given path,
 * excluding combinations that are ambiguous and of lower priority.
 *
 * For example, `/one/:two?/three/:four?/:five?` explodes to:
 * - `/one/three`
 * - `/one/:two/three`
 * - `/one/three/:four`
 * - `/one/three/:five`
 * - `/one/:two/three/:four`
 * - `/one/:two/three/:five`
 * - `/one/three/:four/:five`
 * - `/one/:two/three/:four/:five`
 */
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  // Optional path segments are denoted by a trailing `?`
  let isOptional = first.endsWith("?");
  // Compute the corresponding required segment: `foo?` -> `foo`
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    // Intepret empty string as omitting an optional segment
    // `["one", "", "three"]` corresponds to omitting `:two` from `/one/:two?/three` -> `/one/three`
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  // All child paths with the prefix.  Do this for all children before the
  // optional version for all children so we get consistent ordering where the
  // parent optional aspect is preferred as required.  Otherwise, we can get
  // child sections interspersed where deeper optional segments are higher than
  // parent optional segments, where for example, /:two would explodes _earlier_
  // then /:one.  By always including the parent as required _for all children_
  // first, we avoid this issue
  result.push(...restExploded.map(subpath => subpath === "" ? required : [required, subpath].join("/")));
  // Then if this is an optional value, add all child versions without
  if (isOptional) {
    result.push(...restExploded);
  }
  // for absolute paths, ensure `/` instead of empty segment
  return result.map(exploded => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => a.score !== b.score ? b.score - a.score // Higher score first
  : compareIndexes(a.routesMeta.map(meta => meta.childrenIndex), b.routesMeta.map(meta => meta.childrenIndex)));
}
const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = s => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter(s => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ?
  // If two routes are siblings, we should try to match the earlier sibling
  // first. This allows people to have fine-grained control over the matching
  // behavior by simply putting routes with identical paths in the order they
  // want them tried.
  a[a.length - 1] - b[b.length - 1] :
  // Otherwise, it doesn't really make sense to rank non-siblings by index,
  // so they sort equally.
  0;
}
function matchRouteBranch(branch, pathname) {
  let {
    routesMeta
  } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath({
      path: meta.relativePath,
      caseSensitive: meta.caseSensitive,
      end
    }, remainingPathname);
    if (!match) return null;
    Object.assign(matchedParams, match.params);
    let route = meta.route;
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
/**
 * Returns a path with params interpolated.
 *
 * @see https://reactrouter.com/utils/generate-path
 */
function generatePath(originalPath, params) {
  if (params === void 0) {
    params = {};
  }
  let path = originalPath;
  if (path.endsWith("*") && path !== "*" && !path.endsWith("/*")) {
    warning(false, "Route path \"" + path + "\" will be treated as if it were " + ("\"" + path.replace(/\*$/, "/*") + "\" because the `*` character must ") + "always follow a `/` in the pattern. To get rid of this warning, " + ("please change the route path to \"" + path.replace(/\*$/, "/*") + "\"."));
    path = path.replace(/\*$/, "/*");
  }
  // ensure `/` is added at the beginning if the path is absolute
  const prefix = path.startsWith("/") ? "/" : "";
  const stringify = p => p == null ? "" : typeof p === "string" ? p : String(p);
  const segments = path.split(/\/+/).map((segment, index, array) => {
    const isLastSegment = index === array.length - 1;
    // only apply the splat if it's the last segment
    if (isLastSegment && segment === "*") {
      const star = "*";
      // Apply the splat
      return stringify(params[star]);
    }
    const keyMatch = segment.match(/^:(\w+)(\??)$/);
    if (keyMatch) {
      const [, key, optional] = keyMatch;
      let param = params[key];
      invariant(optional === "?" || param != null, "Missing \":" + key + "\" param");
      return stringify(param);
    }
    // Remove any optional markers from optional static segments
    return segment.replace(/\?$/g, "");
  })
  // Remove empty segments
  .filter(segment => !!segment);
  return prefix + segments.join("/");
}
/**
 * Performs pattern matching on a URL pathname and returns information about
 * the match.
 *
 * @see https://reactrouter.com/utils/match-path
 */
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, paramNames] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = paramNames.reduce((memo, paramName, index) => {
    // We need to compute the pathnameBase here using the raw splat value
    // instead of using params["*"] later because it will be decoded then
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    memo[paramName] = safelyDecodeURIComponent(captureGroups[index] || "", paramName);
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (end === void 0) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), "Route path \"" + path + "\" will be treated as if it were " + ("\"" + path.replace(/\*$/, "/*") + "\" because the `*` character must ") + "always follow a `/` in the pattern. To get rid of this warning, " + ("please change the route path to \"" + path.replace(/\*$/, "/*") + "\"."));
  let paramNames = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "") // Ignore trailing / and /*, we'll handle it below
  .replace(/^\/*/, "/") // Make sure it has a leading /
  .replace(/[\\.*+^$?{}|()[\]]/g, "\\$&") // Escape special regex chars
  .replace(/\/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    paramNames.push("*");
    regexpSource += path === "*" || path === "/*" ? "(.*)$" // Already matched the initial /, just match the rest
    : "(?:\\/(.+)|\\/*)$"; // Don't include the / in params["*"]
  } else if (end) {
    // When matching to the end, ignore trailing slashes
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    // If our path is non-empty and contains anything beyond an initial slash,
    // then we have _some_ form of path in our regex so we should expect to
    // match only if we find the end of this path segment.  Look for an optional
    // non-captured trailing slash (to match a portion of the URL) or the end
    // of the path (if we've matched to the end).  We used to do this with a
    // word boundary but that gives false positives on routes like
    // /user-preferences since `-` counts as a word boundary.
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? undefined : "i");
  return [matcher, paramNames];
}
function safelyDecodeURI(value) {
  try {
    return decodeURI(value);
  } catch (error) {
    warning(false, "The URL path \"" + value + "\" could not be decoded because it is is a " + "malformed URL segment. This is probably due to a bad percent " + ("encoding (" + error + ")."));
    return value;
  }
}
function safelyDecodeURIComponent(value, paramName) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    warning(false, "The value for the URL param \"" + paramName + "\" will not be decoded because" + (" the string \"" + value + "\" is a malformed URL segment. This is probably") + (" due to a bad percent encoding (" + error + ")."));
    return value;
  }
}
/**
 * @private
 */
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  // We want to leave trailing slash behavior in the user's control, so if they
  // specify a basename with a trailing slash, we should support it
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    // pathname does not start with basename/
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
/**
 * Returns a resolved path object relative to the given pathname.
 *
 * @see https://reactrouter.com/utils/resolve-path
 */
function resolvePath(to, fromPathname) {
  if (fromPathname === void 0) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach(segment => {
    if (segment === "..") {
      // Keep the root "" segment so the pathname starts at /
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + "a string in <Link to=\"...\"> and the router will parse it for you.";
}
/**
 * @private
 *
 * When processing relative navigation we want to ignore ancestor routes that
 * do not contribute to the path, such that index/pathless layout routes don't
 * interfere.
 *
 * For example, when moving a route element into an index route and/or a
 * pathless layout route, relative link behavior contained within should stay
 * the same.  Both of the following examples should link back to the root:
 *
 *   <Route path="/">
 *     <Route path="accounts" element={<Link to=".."}>
 *   </Route>
 *
 *   <Route path="/">
 *     <Route path="accounts">
 *       <Route element={<AccountsLayout />}>       // <-- Does not contribute
 *         <Route index element={<Link to=".."} />  // <-- Does not contribute
 *       </Route
 *     </Route>
 *   </Route>
 */
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
/**
 * @private
 */
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === void 0) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = _extends({}, toArg);
    invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  // Routing is relative to the current pathname if explicitly requested.
  //
  // If a pathname is explicitly provided in `to`, it should be relative to the
  // route context. This is explained in `Note on `<Link to>` values` in our
  // migration guide from v5 as a means of disambiguation between `to` values
  // that begin with `/` and those that do not. However, this is problematic for
  // `to` values that do not provide a pathname. `to` can simply be a search or
  // hash string, in which case we should assume that the navigation is relative
  // to the current location's pathname and *not* the route pathname.
  if (isPathRelative || toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      // Each leading .. segment means "go up one route" instead of "go up one
      // URL segment".  This is a key difference from how <a href> works and a
      // major reason we call this a "to" value instead of a "href".
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    // If there are more ".." segments than parent routes, resolve relative to
    // the root / URL.
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  // Ensure the pathname has a trailing slash if the original "to" had one
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  // Or if this was a link to the current path which has a trailing slash
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
/**
 * @private
 */
function getToPathname(to) {
  // Empty strings should be treated the same as / paths
  return to === "" || to.pathname === "" ? "/" : typeof to === "string" ? parsePath(to).pathname : to.pathname;
}
/**
 * @private
 */
const joinPaths = paths => paths.join("/").replace(/\/\/+/g, "/");
/**
 * @private
 */
const normalizePathname = pathname => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
/**
 * @private
 */
const normalizeSearch = search => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
/**
 * @private
 */
const normalizeHash = hash => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
/**
 * This is a shortcut for creating `application/json` responses. Converts `data`
 * to JSON and sets the `Content-Type` header.
 */
const json = function json(data, init) {
  if (init === void 0) {
    init = {};
  }
  let responseInit = typeof init === "number" ? {
    status: init
  } : init;
  let headers = new Headers(responseInit.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), _extends({}, responseInit, {
    headers
  }));
};
class AbortedDeferredError extends Error {}
class DeferredData {
  constructor(data, responseInit) {
    this.pendingKeysSet = new Set();
    this.subscribers = new Set();
    this.deferredKeys = [];
    invariant(data && typeof data === "object" && !Array.isArray(data), "defer() only accepts plain objects");
    // Set up an AbortController + Promise we can race against to exit early
    // cancellation
    let reject;
    this.abortPromise = new Promise((_, r) => reject = r);
    this.controller = new AbortController();
    let onAbort = () => reject(new AbortedDeferredError("Deferred data aborted"));
    this.unlistenAbortSignal = () => this.controller.signal.removeEventListener("abort", onAbort);
    this.controller.signal.addEventListener("abort", onAbort);
    this.data = Object.entries(data).reduce((acc, _ref) => {
      let [key, value] = _ref;
      return Object.assign(acc, {
        [key]: this.trackPromise(key, value)
      });
    }, {});
    if (this.done) {
      // All incoming values were resolved
      this.unlistenAbortSignal();
    }
    this.init = responseInit;
  }
  trackPromise(key, value) {
    if (!(value instanceof Promise)) {
      return value;
    }
    this.deferredKeys.push(key);
    this.pendingKeysSet.add(key);
    // We store a little wrapper promise that will be extended with
    // _data/_error props upon resolve/reject
    let promise = Promise.race([value, this.abortPromise]).then(data => this.onSettle(promise, key, undefined, data), error => this.onSettle(promise, key, error));
    // Register rejection listeners to avoid uncaught promise rejections on
    // errors or aborted deferred values
    promise.catch(() => {});
    Object.defineProperty(promise, "_tracked", {
      get: () => true
    });
    return promise;
  }
  onSettle(promise, key, error, data) {
    if (this.controller.signal.aborted && error instanceof AbortedDeferredError) {
      this.unlistenAbortSignal();
      Object.defineProperty(promise, "_error", {
        get: () => error
      });
      return Promise.reject(error);
    }
    this.pendingKeysSet.delete(key);
    if (this.done) {
      // Nothing left to abort!
      this.unlistenAbortSignal();
    }
    // If the promise was resolved/rejected with undefined, we'll throw an error as you
    // should always resolve with a value or null
    if (error === undefined && data === undefined) {
      let undefinedError = new Error("Deferred data for key \"" + key + "\" resolved/rejected with `undefined`, " + "you must resolve/reject with a value or `null`.");
      Object.defineProperty(promise, "_error", {
        get: () => undefinedError
      });
      this.emit(false, key);
      return Promise.reject(undefinedError);
    }
    if (data === undefined) {
      Object.defineProperty(promise, "_error", {
        get: () => error
      });
      this.emit(false, key);
      return Promise.reject(error);
    }
    Object.defineProperty(promise, "_data", {
      get: () => data
    });
    this.emit(false, key);
    return data;
  }
  emit(aborted, settledKey) {
    this.subscribers.forEach(subscriber => subscriber(aborted, settledKey));
  }
  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }
  cancel() {
    this.controller.abort();
    this.pendingKeysSet.forEach((v, k) => this.pendingKeysSet.delete(k));
    this.emit(true);
  }
  async resolveData(signal) {
    let aborted = false;
    if (!this.done) {
      let onAbort = () => this.cancel();
      signal.addEventListener("abort", onAbort);
      aborted = await new Promise(resolve => {
        this.subscribe(aborted => {
          signal.removeEventListener("abort", onAbort);
          if (aborted || this.done) {
            resolve(aborted);
          }
        });
      });
    }
    return aborted;
  }
  get done() {
    return this.pendingKeysSet.size === 0;
  }
  get unwrappedData() {
    invariant(this.data !== null && this.done, "Can only unwrap data on initialized and settled deferreds");
    return Object.entries(this.data).reduce((acc, _ref2) => {
      let [key, value] = _ref2;
      return Object.assign(acc, {
        [key]: unwrapTrackedPromise(value)
      });
    }, {});
  }
  get pendingKeys() {
    return Array.from(this.pendingKeysSet);
  }
}
function isTrackedPromise(value) {
  return value instanceof Promise && value._tracked === true;
}
function unwrapTrackedPromise(value) {
  if (!isTrackedPromise(value)) {
    return value;
  }
  if (value._error) {
    throw value._error;
  }
  return value._data;
}
const defer = function defer(data, init) {
  if (init === void 0) {
    init = {};
  }
  let responseInit = typeof init === "number" ? {
    status: init
  } : init;
  return new DeferredData(data, responseInit);
};
/**
 * A redirect response. Sets the status code and the `Location` header.
 * Defaults to "302 Found".
 */
const redirect = function redirect(url, init) {
  if (init === void 0) {
    init = 302;
  }
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = {
      status: responseInit
    };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }
  let headers = new Headers(responseInit.headers);
  headers.set("Location", url);
  return new Response(null, _extends({}, responseInit, {
    headers
  }));
};
/**
 * A redirect response that will force a document reload to the new location.
 * Sets the status code and the `Location` header.
 * Defaults to "302 Found".
 */
const redirectDocument = (url, init) => {
  let response = redirect(url, init);
  response.headers.set("X-Remix-Reload-Document", "true");
  return response;
};
/**
 * @private
 * Utility class we use to hold auto-unwrapped 4xx/5xx Response bodies
 */
class ErrorResponse {
  constructor(status, statusText, data, internal) {
    if (internal === void 0) {
      internal = false;
    }
    this.status = status;
    this.statusText = statusText || "";
    this.internal = internal;
    if (data instanceof Error) {
      this.data = data.toString();
      this.error = data;
    } else {
      this.data = data;
    }
  }
}
/**
 * Check if the given error is an ErrorResponse generated from a 4xx/5xx
 * Response thrown from an action/loader
 */
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}

const validMutationMethodsArr = ["post", "put", "patch", "delete"];
const validMutationMethods = new Set(validMutationMethodsArr);
const validRequestMethodsArr = ["get", ...validMutationMethodsArr];
const validRequestMethods = new Set(validRequestMethodsArr);
const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);
const redirectPreserveMethodStatusCodes = new Set([307, 308]);
const IDLE_NAVIGATION = {
  state: "idle",
  location: undefined,
  formMethod: undefined,
  formAction: undefined,
  formEncType: undefined,
  formData: undefined,
  json: undefined,
  text: undefined
};
const IDLE_FETCHER = {
  state: "idle",
  data: undefined,
  formMethod: undefined,
  formAction: undefined,
  formEncType: undefined,
  formData: undefined,
  json: undefined,
  text: undefined
};
const IDLE_BLOCKER = {
  state: "unblocked",
  proceed: undefined,
  reset: undefined,
  location: undefined
};
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const defaultMapRouteProperties = route => ({
  hasErrorBoundary: Boolean(route.hasErrorBoundary)
});
//#endregion
////////////////////////////////////////////////////////////////////////////////
//#region createRouter
////////////////////////////////////////////////////////////////////////////////
/**
 * Create a router and listen to history POP navigations
 */
function createRouter(init) {
  const routerWindow = init.window ? init.window : typeof window !== "undefined" ? window : undefined;
  const isBrowser = typeof routerWindow !== "undefined" && typeof routerWindow.document !== "undefined" && typeof routerWindow.document.createElement !== "undefined";
  const isServer = !isBrowser;
  invariant(init.routes.length > 0, "You must provide a non-empty routes array to createRouter");
  let mapRouteProperties;
  if (init.mapRouteProperties) {
    mapRouteProperties = init.mapRouteProperties;
  } else if (init.detectErrorBoundary) {
    // If they are still using the deprecated version, wrap it with the new API
    let detectErrorBoundary = init.detectErrorBoundary;
    mapRouteProperties = route => ({
      hasErrorBoundary: detectErrorBoundary(route)
    });
  } else {
    mapRouteProperties = defaultMapRouteProperties;
  }
  // Routes keyed by ID
  let manifest = {};
  // Routes in tree format for matching
  let dataRoutes = convertRoutesToDataRoutes(init.routes, mapRouteProperties, undefined, manifest);
  let inFlightDataRoutes;
  let basename = init.basename || "/";
  // Config driven behavior flags
  let future = _extends({
    v7_normalizeFormMethod: false,
    v7_prependBasename: false
  }, init.future);
  // Cleanup function for history
  let unlistenHistory = null;
  // Externally-provided functions to call on all state changes
  let subscribers = new Set();
  // Externally-provided object to hold scroll restoration locations during routing
  let savedScrollPositions = null;
  // Externally-provided function to get scroll restoration keys
  let getScrollRestorationKey = null;
  // Externally-provided function to get current scroll position
  let getScrollPosition = null;
  // One-time flag to control the initial hydration scroll restoration.  Because
  // we don't get the saved positions from <ScrollRestoration /> until _after_
  // the initial render, we need to manually trigger a separate updateState to
  // send along the restoreScrollPosition
  // Set to true if we have `hydrationData` since we assume we were SSR'd and that
  // SSR did the initial scroll restoration.
  let initialScrollRestored = init.hydrationData != null;
  let initialMatches = matchRoutes(dataRoutes, init.history.location, basename);
  let initialErrors = null;
  if (initialMatches == null) {
    // If we do not match a user-provided-route, fall back to the root
    // to allow the error boundary to take over
    let error = getInternalRouterError(404, {
      pathname: init.history.location.pathname
    });
    let {
      matches,
      route
    } = getShortCircuitMatches(dataRoutes);
    initialMatches = matches;
    initialErrors = {
      [route.id]: error
    };
  }
  let initialized =
  // All initialMatches need to be loaded before we're ready.  If we have lazy
  // functions around still then we'll need to run them in initialize()
  !initialMatches.some(m => m.route.lazy) && (
  // And we have to either have no loaders or have been provided hydrationData
  !initialMatches.some(m => m.route.loader) || init.hydrationData != null);
  let router;
  let state = {
    historyAction: init.history.action,
    location: init.history.location,
    matches: initialMatches,
    initialized,
    navigation: IDLE_NAVIGATION,
    // Don't restore on initial updateState() if we were SSR'd
    restoreScrollPosition: init.hydrationData != null ? false : null,
    preventScrollReset: false,
    revalidation: "idle",
    loaderData: init.hydrationData && init.hydrationData.loaderData || {},
    actionData: init.hydrationData && init.hydrationData.actionData || null,
    errors: init.hydrationData && init.hydrationData.errors || initialErrors,
    fetchers: new Map(),
    blockers: new Map()
  };
  // -- Stateful internal variables to manage navigations --
  // Current navigation in progress (to be committed in completeNavigation)
  let pendingAction = Action.Pop;
  // Should the current navigation prevent the scroll reset if scroll cannot
  // be restored?
  let pendingPreventScrollReset = false;
  // AbortController for the active navigation
  let pendingNavigationController;
  // We use this to avoid touching history in completeNavigation if a
  // revalidation is entirely uninterrupted
  let isUninterruptedRevalidation = false;
  // Use this internal flag to force revalidation of all loaders:
  //  - submissions (completed or interrupted)
  //  - useRevalidator()
  //  - X-Remix-Revalidate (from redirect)
  let isRevalidationRequired = false;
  // Use this internal array to capture routes that require revalidation due
  // to a cancelled deferred on action submission
  let cancelledDeferredRoutes = [];
  // Use this internal array to capture fetcher loads that were cancelled by an
  // action navigation and require revalidation
  let cancelledFetcherLoads = [];
  // AbortControllers for any in-flight fetchers
  let fetchControllers = new Map();
  // Track loads based on the order in which they started
  let incrementingLoadId = 0;
  // Track the outstanding pending navigation data load to be compared against
  // the globally incrementing load when a fetcher load lands after a completed
  // navigation
  let pendingNavigationLoadId = -1;
  // Fetchers that triggered data reloads as a result of their actions
  let fetchReloadIds = new Map();
  // Fetchers that triggered redirect navigations
  let fetchRedirectIds = new Set();
  // Most recent href/match for fetcher.load calls for fetchers
  let fetchLoadMatches = new Map();
  // Store DeferredData instances for active route matches.  When a
  // route loader returns defer() we stick one in here.  Then, when a nested
  // promise resolves we update loaderData.  If a new navigation starts we
  // cancel active deferreds for eliminated routes.
  let activeDeferreds = new Map();
  // Store blocker functions in a separate Map outside of router state since
  // we don't need to update UI state if they change
  let blockerFunctions = new Map();
  // Flag to ignore the next history update, so we can revert the URL change on
  // a POP navigation that was blocked by the user without touching router state
  let ignoreNextHistoryUpdate = false;
  // Initialize the router, all side effects should be kicked off from here.
  // Implemented as a Fluent API for ease of:
  //   let router = createRouter(init).initialize();
  function initialize() {
    // If history informs us of a POP navigation, start the navigation but do not update
    // state.  We'll update our own state once the navigation completes
    unlistenHistory = init.history.listen(_ref => {
      let {
        action: historyAction,
        location,
        delta
      } = _ref;
      // Ignore this event if it was just us resetting the URL from a
      // blocked POP navigation
      if (ignoreNextHistoryUpdate) {
        ignoreNextHistoryUpdate = false;
        return;
      }
      warning(blockerFunctions.size === 0 || delta != null, "You are trying to use a blocker on a POP navigation to a location " + "that was not created by @remix-run/router. This will fail silently in " + "production. This can happen if you are navigating outside the router " + "via `window.history.pushState`/`window.location.hash` instead of using " + "router navigation APIs.  This can also happen if you are using " + "createHashRouter and the user manually changes the URL.");
      let blockerKey = shouldBlockNavigation({
        currentLocation: state.location,
        nextLocation: location,
        historyAction
      });
      if (blockerKey && delta != null) {
        // Restore the URL to match the current UI, but don't update router state
        ignoreNextHistoryUpdate = true;
        init.history.go(delta * -1);
        // Put the blocker into a blocked state
        updateBlocker(blockerKey, {
          state: "blocked",
          location,
          proceed() {
            updateBlocker(blockerKey, {
              state: "proceeding",
              proceed: undefined,
              reset: undefined,
              location
            });
            // Re-do the same POP navigation we just blocked
            init.history.go(delta);
          },
          reset() {
            let blockers = new Map(state.blockers);
            blockers.set(blockerKey, IDLE_BLOCKER);
            updateState({
              blockers
            });
          }
        });
        return;
      }
      return startNavigation(historyAction, location);
    });
    // Kick off initial data load if needed.  Use Pop to avoid modifying history
    // Note we don't do any handling of lazy here.  For SPA's it'll get handled
    // in the normal navigation flow.  For SSR it's expected that lazy modules are
    // resolved prior to router creation since we can't go into a fallbackElement
    // UI for SSR'd apps
    if (!state.initialized) {
      startNavigation(Action.Pop, state.location);
    }
    return router;
  }
  // Clean up a router and it's side effects
  function dispose() {
    if (unlistenHistory) {
      unlistenHistory();
    }
    subscribers.clear();
    pendingNavigationController && pendingNavigationController.abort();
    state.fetchers.forEach((_, key) => deleteFetcher(key));
    state.blockers.forEach((_, key) => deleteBlocker(key));
  }
  // Subscribe to state updates for the router
  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }
  // Update our state and notify the calling context of the change
  function updateState(newState) {
    state = _extends({}, state, newState);
    subscribers.forEach(subscriber => subscriber(state));
  }
  // Complete a navigation returning the state.navigation back to the IDLE_NAVIGATION
  // and setting state.[historyAction/location/matches] to the new route.
  // - Location is a required param
  // - Navigation will always be set to IDLE_NAVIGATION
  // - Can pass any other state in newState
  function completeNavigation(location, newState) {
    var _location$state, _location$state2;
    // Deduce if we're in a loading/actionReload state:
    // - We have committed actionData in the store
    // - The current navigation was a mutation submission
    // - We're past the submitting state and into the loading state
    // - The location being loaded is not the result of a redirect
    let isActionReload = state.actionData != null && state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && state.navigation.state === "loading" && ((_location$state = location.state) == null ? void 0 : _location$state._isRedirect) !== true;
    let actionData;
    if (newState.actionData) {
      if (Object.keys(newState.actionData).length > 0) {
        actionData = newState.actionData;
      } else {
        // Empty actionData -> clear prior actionData due to an action error
        actionData = null;
      }
    } else if (isActionReload) {
      // Keep the current data if we're wrapping up the action reload
      actionData = state.actionData;
    } else {
      // Clear actionData on any other completed navigations
      actionData = null;
    }
    // Always preserve any existing loaderData from re-used routes
    let loaderData = newState.loaderData ? mergeLoaderData(state.loaderData, newState.loaderData, newState.matches || [], newState.errors) : state.loaderData;
    // On a successful navigation we can assume we got through all blockers
    // so we can start fresh
    let blockers = state.blockers;
    if (blockers.size > 0) {
      blockers = new Map(blockers);
      blockers.forEach((_, k) => blockers.set(k, IDLE_BLOCKER));
    }
    // Always respect the user flag.  Otherwise don't reset on mutation
    // submission navigations unless they redirect
    let preventScrollReset = pendingPreventScrollReset === true || state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && ((_location$state2 = location.state) == null ? void 0 : _location$state2._isRedirect) !== true;
    if (inFlightDataRoutes) {
      dataRoutes = inFlightDataRoutes;
      inFlightDataRoutes = undefined;
    }
    if (isUninterruptedRevalidation) ; else if (pendingAction === Action.Pop) ; else if (pendingAction === Action.Push) {
      init.history.push(location, location.state);
    } else if (pendingAction === Action.Replace) {
      init.history.replace(location, location.state);
    }
    updateState(_extends({}, newState, {
      actionData,
      loaderData,
      historyAction: pendingAction,
      location,
      initialized: true,
      navigation: IDLE_NAVIGATION,
      revalidation: "idle",
      restoreScrollPosition: getSavedScrollPosition(location, newState.matches || state.matches),
      preventScrollReset,
      blockers
    }));
    // Reset stateful navigation vars
    pendingAction = Action.Pop;
    pendingPreventScrollReset = false;
    isUninterruptedRevalidation = false;
    isRevalidationRequired = false;
    cancelledDeferredRoutes = [];
    cancelledFetcherLoads = [];
  }
  // Trigger a navigation event, which can either be a numerical POP or a PUSH
  // replace with an optional submission
  async function navigate(to, opts) {
    if (typeof to === "number") {
      init.history.go(to);
      return;
    }
    let normalizedPath = normalizeTo(state.location, state.matches, basename, future.v7_prependBasename, to, opts == null ? void 0 : opts.fromRouteId, opts == null ? void 0 : opts.relative);
    let {
      path,
      submission,
      error
    } = normalizeNavigateOptions(future.v7_normalizeFormMethod, false, normalizedPath, opts);
    let currentLocation = state.location;
    let nextLocation = createLocation(state.location, path, opts && opts.state);
    // When using navigate as a PUSH/REPLACE we aren't reading an already-encoded
    // URL from window.location, so we need to encode it here so the behavior
    // remains the same as POP and non-data-router usages.  new URL() does all
    // the same encoding we'd get from a history.pushState/window.location read
    // without having to touch history
    nextLocation = _extends({}, nextLocation, init.history.encodeLocation(nextLocation));
    let userReplace = opts && opts.replace != null ? opts.replace : undefined;
    let historyAction = Action.Push;
    if (userReplace === true) {
      historyAction = Action.Replace;
    } else if (userReplace === false) ; else if (submission != null && isMutationMethod(submission.formMethod) && submission.formAction === state.location.pathname + state.location.search) {
      // By default on submissions to the current location we REPLACE so that
      // users don't have to double-click the back button to get to the prior
      // location.  If the user redirects to a different location from the
      // action/loader this will be ignored and the redirect will be a PUSH
      historyAction = Action.Replace;
    }
    let preventScrollReset = opts && "preventScrollReset" in opts ? opts.preventScrollReset === true : undefined;
    let blockerKey = shouldBlockNavigation({
      currentLocation,
      nextLocation,
      historyAction
    });
    if (blockerKey) {
      // Put the blocker into a blocked state
      updateBlocker(blockerKey, {
        state: "blocked",
        location: nextLocation,
        proceed() {
          updateBlocker(blockerKey, {
            state: "proceeding",
            proceed: undefined,
            reset: undefined,
            location: nextLocation
          });
          // Send the same navigation through
          navigate(to, opts);
        },
        reset() {
          let blockers = new Map(state.blockers);
          blockers.set(blockerKey, IDLE_BLOCKER);
          updateState({
            blockers
          });
        }
      });
      return;
    }
    return await startNavigation(historyAction, nextLocation, {
      submission,
      // Send through the formData serialization error if we have one so we can
      // render at the right error boundary after we match routes
      pendingError: error,
      preventScrollReset,
      replace: opts && opts.replace
    });
  }
  // Revalidate all current loaders.  If a navigation is in progress or if this
  // is interrupted by a navigation, allow this to "succeed" by calling all
  // loaders during the next loader round
  function revalidate() {
    interruptActiveLoads();
    updateState({
      revalidation: "loading"
    });
    // If we're currently submitting an action, we don't need to start a new
    // navigation, we'll just let the follow up loader execution call all loaders
    if (state.navigation.state === "submitting") {
      return;
    }
    // If we're currently in an idle state, start a new navigation for the current
    // action/location and mark it as uninterrupted, which will skip the history
    // update in completeNavigation
    if (state.navigation.state === "idle") {
      startNavigation(state.historyAction, state.location, {
        startUninterruptedRevalidation: true
      });
      return;
    }
    // Otherwise, if we're currently in a loading state, just start a new
    // navigation to the navigation.location but do not trigger an uninterrupted
    // revalidation so that history correctly updates once the navigation completes
    startNavigation(pendingAction || state.historyAction, state.navigation.location, {
      overrideNavigation: state.navigation
    });
  }
  // Start a navigation to the given action/location.  Can optionally provide a
  // overrideNavigation which will override the normalLoad in the case of a redirect
  // navigation
  async function startNavigation(historyAction, location, opts) {
    // Abort any in-progress navigations and start a new one. Unset any ongoing
    // uninterrupted revalidations unless told otherwise, since we want this
    // new navigation to update history normally
    pendingNavigationController && pendingNavigationController.abort();
    pendingNavigationController = null;
    pendingAction = historyAction;
    isUninterruptedRevalidation = (opts && opts.startUninterruptedRevalidation) === true;
    // Save the current scroll position every time we start a new navigation,
    // and track whether we should reset scroll on completion
    saveScrollPosition(state.location, state.matches);
    pendingPreventScrollReset = (opts && opts.preventScrollReset) === true;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let loadingNavigation = opts && opts.overrideNavigation;
    let matches = matchRoutes(routesToUse, location, basename);
    // Short circuit with a 404 on the root error boundary if we match nothing
    if (!matches) {
      let error = getInternalRouterError(404, {
        pathname: location.pathname
      });
      let {
        matches: notFoundMatches,
        route
      } = getShortCircuitMatches(routesToUse);
      // Cancel all pending deferred on 404s since we don't keep any routes
      cancelActiveDeferreds();
      completeNavigation(location, {
        matches: notFoundMatches,
        loaderData: {},
        errors: {
          [route.id]: error
        }
      });
      return;
    }
    // Short circuit if it's only a hash change and not a revalidation or
    // mutation submission.
    //
    // Ignore on initial page loads because since the initial load will always
    // be "same hash".  For example, on /page#hash and submit a <Form method="post">
    // which will default to a navigation to /page
    if (state.initialized && !isRevalidationRequired && isHashChangeOnly(state.location, location) && !(opts && opts.submission && isMutationMethod(opts.submission.formMethod))) {
      completeNavigation(location, {
        matches
      });
      return;
    }
    // Create a controller/Request for this navigation
    pendingNavigationController = new AbortController();
    let request = createClientSideRequest(init.history, location, pendingNavigationController.signal, opts && opts.submission);
    let pendingActionData;
    let pendingError;
    if (opts && opts.pendingError) {
      // If we have a pendingError, it means the user attempted a GET submission
      // with binary FormData so assign here and skip to handleLoaders.  That
      // way we handle calling loaders above the boundary etc.  It's not really
      // different from an actionError in that sense.
      pendingError = {
        [findNearestBoundary(matches).route.id]: opts.pendingError
      };
    } else if (opts && opts.submission && isMutationMethod(opts.submission.formMethod)) {
      // Call action if we received an action submission
      let actionOutput = await handleAction(request, location, opts.submission, matches, {
        replace: opts.replace
      });
      if (actionOutput.shortCircuited) {
        return;
      }
      pendingActionData = actionOutput.pendingActionData;
      pendingError = actionOutput.pendingActionError;
      loadingNavigation = getLoadingNavigation(location, opts.submission);
      // Create a GET request for the loaders
      request = new Request(request.url, {
        signal: request.signal
      });
    }
    // Call loaders
    let {
      shortCircuited,
      loaderData,
      errors
    } = await handleLoaders(request, location, matches, loadingNavigation, opts && opts.submission, opts && opts.fetcherSubmission, opts && opts.replace, pendingActionData, pendingError);
    if (shortCircuited) {
      return;
    }
    // Clean up now that the action/loaders have completed.  Don't clean up if
    // we short circuited because pendingNavigationController will have already
    // been assigned to a new controller for the next navigation
    pendingNavigationController = null;
    completeNavigation(location, _extends({
      matches
    }, pendingActionData ? {
      actionData: pendingActionData
    } : {}, {
      loaderData,
      errors
    }));
  }
  // Call the action matched by the leaf route for this navigation and handle
  // redirects/errors
  async function handleAction(request, location, submission, matches, opts) {
    if (opts === void 0) {
      opts = {};
    }
    interruptActiveLoads();
    // Put us in a submitting state
    let navigation = getSubmittingNavigation(location, submission);
    updateState({
      navigation
    });
    // Call our action and get the result
    let result;
    let actionMatch = getTargetMatch(matches, location);
    if (!actionMatch.route.action && !actionMatch.route.lazy) {
      result = {
        type: ResultType.error,
        error: getInternalRouterError(405, {
          method: request.method,
          pathname: location.pathname,
          routeId: actionMatch.route.id
        })
      };
    } else {
      result = await callLoaderOrAction("action", request, actionMatch, matches, manifest, mapRouteProperties, basename);
      if (request.signal.aborted) {
        return {
          shortCircuited: true
        };
      }
    }
    if (isRedirectResult(result)) {
      let replace;
      if (opts && opts.replace != null) {
        replace = opts.replace;
      } else {
        // If the user didn't explicity indicate replace behavior, replace if
        // we redirected to the exact same location we're currently at to avoid
        // double back-buttons
        replace = result.location === state.location.pathname + state.location.search;
      }
      await startRedirectNavigation(state, result, {
        submission,
        replace
      });
      return {
        shortCircuited: true
      };
    }
    if (isErrorResult(result)) {
      // Store off the pending error - we use it to determine which loaders
      // to call and will commit it when we complete the navigation
      let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
      // By default, all submissions are REPLACE navigations, but if the
      // action threw an error that'll be rendered in an errorElement, we fall
      // back to PUSH so that the user can use the back button to get back to
      // the pre-submission form location to try again
      if ((opts && opts.replace) !== true) {
        pendingAction = Action.Push;
      }
      return {
        // Send back an empty object we can use to clear out any prior actionData
        pendingActionData: {},
        pendingActionError: {
          [boundaryMatch.route.id]: result.error
        }
      };
    }
    if (isDeferredResult(result)) {
      throw getInternalRouterError(400, {
        type: "defer-action"
      });
    }
    return {
      pendingActionData: {
        [actionMatch.route.id]: result.data
      }
    };
  }
  // Call all applicable loaders for the given matches, handling redirects,
  // errors, etc.
  async function handleLoaders(request, location, matches, overrideNavigation, submission, fetcherSubmission, replace, pendingActionData, pendingError) {
    // Figure out the right navigation we want to use for data loading
    let loadingNavigation = overrideNavigation || getLoadingNavigation(location, submission);
    // If this was a redirect from an action we don't have a "submission" but
    // we have it on the loading navigation so use that if available
    let activeSubmission = submission || fetcherSubmission || getSubmissionFromNavigation(loadingNavigation);
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(init.history, state, matches, activeSubmission, location, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, pendingActionData, pendingError);
    // Cancel pending deferreds for no-longer-matched routes or routes we're
    // about to reload.  Note that if this is an action reload we would have
    // already cancelled all pending deferreds so this would be a no-op
    cancelActiveDeferreds(routeId => !(matches && matches.some(m => m.route.id === routeId)) || matchesToLoad && matchesToLoad.some(m => m.route.id === routeId));
    pendingNavigationLoadId = ++incrementingLoadId;
    // Short circuit if we have no loaders to run
    if (matchesToLoad.length === 0 && revalidatingFetchers.length === 0) {
      let updatedFetchers = markFetchRedirectsDone();
      completeNavigation(location, _extends({
        matches,
        loaderData: {},
        // Commit pending error if we're short circuiting
        errors: pendingError || null
      }, pendingActionData ? {
        actionData: pendingActionData
      } : {}, updatedFetchers ? {
        fetchers: new Map(state.fetchers)
      } : {}));
      return {
        shortCircuited: true
      };
    }
    // If this is an uninterrupted revalidation, we remain in our current idle
    // state.  If not, we need to switch to our loading state and load data,
    // preserving any new action data or existing action data (in the case of
    // a revalidation interrupting an actionReload)
    if (!isUninterruptedRevalidation) {
      revalidatingFetchers.forEach(rf => {
        let fetcher = state.fetchers.get(rf.key);
        let revalidatingFetcher = getLoadingFetcher(undefined, fetcher ? fetcher.data : undefined);
        state.fetchers.set(rf.key, revalidatingFetcher);
      });
      let actionData = pendingActionData || state.actionData;
      updateState(_extends({
        navigation: loadingNavigation
      }, actionData ? Object.keys(actionData).length === 0 ? {
        actionData: null
      } : {
        actionData
      } : {}, revalidatingFetchers.length > 0 ? {
        fetchers: new Map(state.fetchers)
      } : {}));
    }
    revalidatingFetchers.forEach(rf => {
      if (fetchControllers.has(rf.key)) {
        abortFetcher(rf.key);
      }
      if (rf.controller) {
        // Fetchers use an independent AbortController so that aborting a fetcher
        // (via deleteFetcher) does not abort the triggering navigation that
        // triggered the revalidation
        fetchControllers.set(rf.key, rf.controller);
      }
    });
    // Proxy navigation abort through to revalidation fetchers
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach(f => abortFetcher(f.key));
    if (pendingNavigationController) {
      pendingNavigationController.signal.addEventListener("abort", abortPendingFetchRevalidations);
    }
    let {
      results,
      loaderResults,
      fetcherResults
    } = await callLoadersAndMaybeResolveData(state.matches, matches, matchesToLoad, revalidatingFetchers, request);
    if (request.signal.aborted) {
      return {
        shortCircuited: true
      };
    }
    // Clean up _after_ loaders have completed.  Don't clean up if we short
    // circuited because fetchControllers would have been aborted and
    // reassigned to new controllers for the next navigation
    if (pendingNavigationController) {
      pendingNavigationController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
    }
    revalidatingFetchers.forEach(rf => fetchControllers.delete(rf.key));
    // If any loaders returned a redirect Response, start a new REPLACE navigation
    let redirect = findRedirect(results);
    if (redirect) {
      if (redirect.idx >= matchesToLoad.length) {
        // If this redirect came from a fetcher make sure we mark it in
        // fetchRedirectIds so it doesn't get revalidated on the next set of
        // loader executions
        let fetcherKey = revalidatingFetchers[redirect.idx - matchesToLoad.length].key;
        fetchRedirectIds.add(fetcherKey);
      }
      await startRedirectNavigation(state, redirect.result, {
        replace
      });
      return {
        shortCircuited: true
      };
    }
    // Process and commit output from loaders
    let {
      loaderData,
      errors
    } = processLoaderData(state, matches, matchesToLoad, loaderResults, pendingError, revalidatingFetchers, fetcherResults, activeDeferreds);
    // Wire up subscribers to update loaderData as promises settle
    activeDeferreds.forEach((deferredData, routeId) => {
      deferredData.subscribe(aborted => {
        // Note: No need to updateState here since the TrackedPromise on
        // loaderData is stable across resolve/reject
        // Remove this instance if we were aborted or if promises have settled
        if (aborted || deferredData.done) {
          activeDeferreds.delete(routeId);
        }
      });
    });
    let updatedFetchers = markFetchRedirectsDone();
    let didAbortFetchLoads = abortStaleFetchLoads(pendingNavigationLoadId);
    let shouldUpdateFetchers = updatedFetchers || didAbortFetchLoads || revalidatingFetchers.length > 0;
    return _extends({
      loaderData,
      errors
    }, shouldUpdateFetchers ? {
      fetchers: new Map(state.fetchers)
    } : {});
  }
  function getFetcher(key) {
    return state.fetchers.get(key) || IDLE_FETCHER;
  }
  // Trigger a fetcher load/submit for the given fetcher key
  function fetch(key, routeId, href, opts) {
    if (isServer) {
      throw new Error("router.fetch() was called during the server render, but it shouldn't be. " + "You are likely calling a useFetcher() method in the body of your component. " + "Try moving it to a useEffect or a callback.");
    }
    if (fetchControllers.has(key)) abortFetcher(key);
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let normalizedPath = normalizeTo(state.location, state.matches, basename, future.v7_prependBasename, href, routeId, opts == null ? void 0 : opts.relative);
    let matches = matchRoutes(routesToUse, normalizedPath, basename);
    if (!matches) {
      setFetcherError(key, routeId, getInternalRouterError(404, {
        pathname: normalizedPath
      }));
      return;
    }
    let {
      path,
      submission,
      error
    } = normalizeNavigateOptions(future.v7_normalizeFormMethod, true, normalizedPath, opts);
    if (error) {
      setFetcherError(key, routeId, error);
      return;
    }
    let match = getTargetMatch(matches, path);
    pendingPreventScrollReset = (opts && opts.preventScrollReset) === true;
    if (submission && isMutationMethod(submission.formMethod)) {
      handleFetcherAction(key, routeId, path, match, matches, submission);
      return;
    }
    // Store off the match so we can call it's shouldRevalidate on subsequent
    // revalidations
    fetchLoadMatches.set(key, {
      routeId,
      path
    });
    handleFetcherLoader(key, routeId, path, match, matches, submission);
  }
  // Call the action for the matched fetcher.submit(), and then handle redirects,
  // errors, and revalidation
  async function handleFetcherAction(key, routeId, path, match, requestMatches, submission) {
    interruptActiveLoads();
    fetchLoadMatches.delete(key);
    if (!match.route.action && !match.route.lazy) {
      let error = getInternalRouterError(405, {
        method: submission.formMethod,
        pathname: path,
        routeId: routeId
      });
      setFetcherError(key, routeId, error);
      return;
    }
    // Put this fetcher into it's submitting state
    let existingFetcher = state.fetchers.get(key);
    let fetcher = getSubmittingFetcher(submission, existingFetcher);
    state.fetchers.set(key, fetcher);
    updateState({
      fetchers: new Map(state.fetchers)
    });
    // Call the action for the fetcher
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(init.history, path, abortController.signal, submission);
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let actionResult = await callLoaderOrAction("action", fetchRequest, match, requestMatches, manifest, mapRouteProperties, basename);
    if (fetchRequest.signal.aborted) {
      // We can delete this so long as we weren't aborted by ou our own fetcher
      // re-submit which would have put _new_ controller is in fetchControllers
      if (fetchControllers.get(key) === abortController) {
        fetchControllers.delete(key);
      }
      return;
    }
    if (isRedirectResult(actionResult)) {
      fetchControllers.delete(key);
      if (pendingNavigationLoadId > originatingLoadId) {
        // A new navigation was kicked off after our action started, so that
        // should take precedence over this redirect navigation.  We already
        // set isRevalidationRequired so all loaders for the new route should
        // fire unless opted out via shouldRevalidate
        let doneFetcher = getDoneFetcher(undefined);
        state.fetchers.set(key, doneFetcher);
        updateState({
          fetchers: new Map(state.fetchers)
        });
        return;
      } else {
        fetchRedirectIds.add(key);
        let loadingFetcher = getLoadingFetcher(submission);
        state.fetchers.set(key, loadingFetcher);
        updateState({
          fetchers: new Map(state.fetchers)
        });
        return startRedirectNavigation(state, actionResult, {
          submission,
          isFetchActionRedirect: true
        });
      }
    }
    // Process any non-redirect errors thrown
    if (isErrorResult(actionResult)) {
      setFetcherError(key, routeId, actionResult.error);
      return;
    }
    if (isDeferredResult(actionResult)) {
      throw getInternalRouterError(400, {
        type: "defer-action"
      });
    }
    // Start the data load for current matches, or the next location if we're
    // in the middle of a navigation
    let nextLocation = state.navigation.location || state.location;
    let revalidationRequest = createClientSideRequest(init.history, nextLocation, abortController.signal);
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let matches = state.navigation.state !== "idle" ? matchRoutes(routesToUse, state.navigation.location, basename) : state.matches;
    invariant(matches, "Didn't find any matches after fetcher action");
    let loadId = ++incrementingLoadId;
    fetchReloadIds.set(key, loadId);
    let loadFetcher = getLoadingFetcher(submission, actionResult.data);
    state.fetchers.set(key, loadFetcher);
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(init.history, state, matches, submission, nextLocation, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, {
      [match.route.id]: actionResult.data
    }, undefined // No need to send through errors since we short circuit above
    );
    // Put all revalidating fetchers into the loading state, except for the
    // current fetcher which we want to keep in it's current loading state which
    // contains it's action submission info + action data
    revalidatingFetchers.filter(rf => rf.key !== key).forEach(rf => {
      let staleKey = rf.key;
      let existingFetcher = state.fetchers.get(staleKey);
      let revalidatingFetcher = getLoadingFetcher(undefined, existingFetcher ? existingFetcher.data : undefined);
      state.fetchers.set(staleKey, revalidatingFetcher);
      if (fetchControllers.has(staleKey)) {
        abortFetcher(staleKey);
      }
      if (rf.controller) {
        fetchControllers.set(staleKey, rf.controller);
      }
    });
    updateState({
      fetchers: new Map(state.fetchers)
    });
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach(rf => abortFetcher(rf.key));
    abortController.signal.addEventListener("abort", abortPendingFetchRevalidations);
    let {
      results,
      loaderResults,
      fetcherResults
    } = await callLoadersAndMaybeResolveData(state.matches, matches, matchesToLoad, revalidatingFetchers, revalidationRequest);
    if (abortController.signal.aborted) {
      return;
    }
    abortController.signal.removeEventListener("abort", abortPendingFetchRevalidations);
    fetchReloadIds.delete(key);
    fetchControllers.delete(key);
    revalidatingFetchers.forEach(r => fetchControllers.delete(r.key));
    let redirect = findRedirect(results);
    if (redirect) {
      if (redirect.idx >= matchesToLoad.length) {
        // If this redirect came from a fetcher make sure we mark it in
        // fetchRedirectIds so it doesn't get revalidated on the next set of
        // loader executions
        let fetcherKey = revalidatingFetchers[redirect.idx - matchesToLoad.length].key;
        fetchRedirectIds.add(fetcherKey);
      }
      return startRedirectNavigation(state, redirect.result);
    }
    // Process and commit output from loaders
    let {
      loaderData,
      errors
    } = processLoaderData(state, state.matches, matchesToLoad, loaderResults, undefined, revalidatingFetchers, fetcherResults, activeDeferreds);
    // Since we let revalidations complete even if the submitting fetcher was
    // deleted, only put it back to idle if it hasn't been deleted
    if (state.fetchers.has(key)) {
      let doneFetcher = getDoneFetcher(actionResult.data);
      state.fetchers.set(key, doneFetcher);
    }
    let didAbortFetchLoads = abortStaleFetchLoads(loadId);
    // If we are currently in a navigation loading state and this fetcher is
    // more recent than the navigation, we want the newer data so abort the
    // navigation and complete it with the fetcher data
    if (state.navigation.state === "loading" && loadId > pendingNavigationLoadId) {
      invariant(pendingAction, "Expected pending action");
      pendingNavigationController && pendingNavigationController.abort();
      completeNavigation(state.navigation.location, {
        matches,
        loaderData,
        errors,
        fetchers: new Map(state.fetchers)
      });
    } else {
      // otherwise just update with the fetcher data, preserving any existing
      // loaderData for loaders that did not need to reload.  We have to
      // manually merge here since we aren't going through completeNavigation
      updateState(_extends({
        errors,
        loaderData: mergeLoaderData(state.loaderData, loaderData, matches, errors)
      }, didAbortFetchLoads || revalidatingFetchers.length > 0 ? {
        fetchers: new Map(state.fetchers)
      } : {}));
      isRevalidationRequired = false;
    }
  }
  // Call the matched loader for fetcher.load(), handling redirects, errors, etc.
  async function handleFetcherLoader(key, routeId, path, match, matches, submission) {
    let existingFetcher = state.fetchers.get(key);
    // Put this fetcher into it's loading state
    let loadingFetcher = getLoadingFetcher(submission, existingFetcher ? existingFetcher.data : undefined);
    state.fetchers.set(key, loadingFetcher);
    updateState({
      fetchers: new Map(state.fetchers)
    });
    // Call the loader for this fetcher route match
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(init.history, path, abortController.signal);
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let result = await callLoaderOrAction("loader", fetchRequest, match, matches, manifest, mapRouteProperties, basename);
    // Deferred isn't supported for fetcher loads, await everything and treat it
    // as a normal load.  resolveDeferredData will return undefined if this
    // fetcher gets aborted, so we just leave result untouched and short circuit
    // below if that happens
    if (isDeferredResult(result)) {
      result = (await resolveDeferredData(result, fetchRequest.signal, true)) || result;
    }
    // We can delete this so long as we weren't aborted by our our own fetcher
    // re-load which would have put _new_ controller is in fetchControllers
    if (fetchControllers.get(key) === abortController) {
      fetchControllers.delete(key);
    }
    if (fetchRequest.signal.aborted) {
      return;
    }
    // If the loader threw a redirect Response, start a new REPLACE navigation
    if (isRedirectResult(result)) {
      if (pendingNavigationLoadId > originatingLoadId) {
        // A new navigation was kicked off after our loader started, so that
        // should take precedence over this redirect navigation
        let doneFetcher = getDoneFetcher(undefined);
        state.fetchers.set(key, doneFetcher);
        updateState({
          fetchers: new Map(state.fetchers)
        });
        return;
      } else {
        fetchRedirectIds.add(key);
        await startRedirectNavigation(state, result);
        return;
      }
    }
    // Process any non-redirect errors thrown
    if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(state.matches, routeId);
      state.fetchers.delete(key);
      // TODO: In remix, this would reset to IDLE_NAVIGATION if it was a catch -
      // do we need to behave any differently with our non-redirect errors?
      // What if it was a non-redirect Response?
      updateState({
        fetchers: new Map(state.fetchers),
        errors: {
          [boundaryMatch.route.id]: result.error
        }
      });
      return;
    }
    invariant(!isDeferredResult(result), "Unhandled fetcher deferred data");
    // Put the fetcher back into an idle state
    let doneFetcher = getDoneFetcher(result.data);
    state.fetchers.set(key, doneFetcher);
    updateState({
      fetchers: new Map(state.fetchers)
    });
  }
  /**
   * Utility function to handle redirects returned from an action or loader.
   * Normally, a redirect "replaces" the navigation that triggered it.  So, for
   * example:
   *
   *  - user is on /a
   *  - user clicks a link to /b
   *  - loader for /b redirects to /c
   *
   * In a non-JS app the browser would track the in-flight navigation to /b and
   * then replace it with /c when it encountered the redirect response.  In
   * the end it would only ever update the URL bar with /c.
   *
   * In client-side routing using pushState/replaceState, we aim to emulate
   * this behavior and we also do not update history until the end of the
   * navigation (including processed redirects).  This means that we never
   * actually touch history until we've processed redirects, so we just use
   * the history action from the original navigation (PUSH or REPLACE).
   */
  async function startRedirectNavigation(state, redirect, _temp) {
    let {
      submission,
      replace,
      isFetchActionRedirect
    } = _temp === void 0 ? {} : _temp;
    if (redirect.revalidate) {
      isRevalidationRequired = true;
    }
    let redirectLocation = createLocation(state.location, redirect.location, // TODO: This can be removed once we get rid of useTransition in Remix v2
    _extends({
      _isRedirect: true
    }, isFetchActionRedirect ? {
      _isFetchActionRedirect: true
    } : {}));
    invariant(redirectLocation, "Expected a location on the redirect navigation");
    if (isBrowser) {
      let isDocumentReload = false;
      if (redirect.reloadDocument) {
        // Hard reload if the response contained X-Remix-Reload-Document
        isDocumentReload = true;
      } else if (ABSOLUTE_URL_REGEX.test(redirect.location)) {
        const url = init.history.createURL(redirect.location);
        isDocumentReload =
        // Hard reload if it's an absolute URL to a new origin
        url.origin !== routerWindow.location.origin ||
        // Hard reload if it's an absolute URL that does not match our basename
        stripBasename(url.pathname, basename) == null;
      }
      if (isDocumentReload) {
        if (replace) {
          routerWindow.location.replace(redirect.location);
        } else {
          routerWindow.location.assign(redirect.location);
        }
        return;
      }
    }
    // There's no need to abort on redirects, since we don't detect the
    // redirect until the action/loaders have settled
    pendingNavigationController = null;
    let redirectHistoryAction = replace === true ? Action.Replace : Action.Push;
    // Use the incoming submission if provided, fallback on the active one in
    // state.navigation
    let activeSubmission = submission || getSubmissionFromNavigation(state.navigation);
    // If this was a 307/308 submission we want to preserve the HTTP method and
    // re-submit the GET/POST/PUT/PATCH/DELETE as a submission navigation to the
    // redirected location
    if (redirectPreserveMethodStatusCodes.has(redirect.status) && activeSubmission && isMutationMethod(activeSubmission.formMethod)) {
      await startNavigation(redirectHistoryAction, redirectLocation, {
        submission: _extends({}, activeSubmission, {
          formAction: redirect.location
        }),
        // Preserve this flag across redirects
        preventScrollReset: pendingPreventScrollReset
      });
    } else if (isFetchActionRedirect) {
      // For a fetch action redirect, we kick off a new loading navigation
      // without the fetcher submission, but we send it along for shouldRevalidate
      await startNavigation(redirectHistoryAction, redirectLocation, {
        overrideNavigation: getLoadingNavigation(redirectLocation),
        fetcherSubmission: activeSubmission,
        // Preserve this flag across redirects
        preventScrollReset: pendingPreventScrollReset
      });
    } else {
      // If we have a submission, we will preserve it through the redirect navigation
      let overrideNavigation = getLoadingNavigation(redirectLocation, activeSubmission);
      await startNavigation(redirectHistoryAction, redirectLocation, {
        overrideNavigation,
        // Preserve this flag across redirects
        preventScrollReset: pendingPreventScrollReset
      });
    }
  }
  async function callLoadersAndMaybeResolveData(currentMatches, matches, matchesToLoad, fetchersToLoad, request) {
    // Call all navigation loaders and revalidating fetcher loaders in parallel,
    // then slice off the results into separate arrays so we can handle them
    // accordingly
    let results = await Promise.all([...matchesToLoad.map(match => callLoaderOrAction("loader", request, match, matches, manifest, mapRouteProperties, basename)), ...fetchersToLoad.map(f => {
      if (f.matches && f.match && f.controller) {
        return callLoaderOrAction("loader", createClientSideRequest(init.history, f.path, f.controller.signal), f.match, f.matches, manifest, mapRouteProperties, basename);
      } else {
        let error = {
          type: ResultType.error,
          error: getInternalRouterError(404, {
            pathname: f.path
          })
        };
        return error;
      }
    })]);
    let loaderResults = results.slice(0, matchesToLoad.length);
    let fetcherResults = results.slice(matchesToLoad.length);
    await Promise.all([resolveDeferredResults(currentMatches, matchesToLoad, loaderResults, loaderResults.map(() => request.signal), false, state.loaderData), resolveDeferredResults(currentMatches, fetchersToLoad.map(f => f.match), fetcherResults, fetchersToLoad.map(f => f.controller ? f.controller.signal : null), true)]);
    return {
      results,
      loaderResults,
      fetcherResults
    };
  }
  function interruptActiveLoads() {
    // Every interruption triggers a revalidation
    isRevalidationRequired = true;
    // Cancel pending route-level deferreds and mark cancelled routes for
    // revalidation
    cancelledDeferredRoutes.push(...cancelActiveDeferreds());
    // Abort in-flight fetcher loads
    fetchLoadMatches.forEach((_, key) => {
      if (fetchControllers.has(key)) {
        cancelledFetcherLoads.push(key);
        abortFetcher(key);
      }
    });
  }
  function setFetcherError(key, routeId, error) {
    let boundaryMatch = findNearestBoundary(state.matches, routeId);
    deleteFetcher(key);
    updateState({
      errors: {
        [boundaryMatch.route.id]: error
      },
      fetchers: new Map(state.fetchers)
    });
  }
  function deleteFetcher(key) {
    let fetcher = state.fetchers.get(key);
    // Don't abort the controller if this is a deletion of a fetcher.submit()
    // in it's loading phase since - we don't want to abort the corresponding
    // revalidation and want them to complete and land
    if (fetchControllers.has(key) && !(fetcher && fetcher.state === "loading" && fetchReloadIds.has(key))) {
      abortFetcher(key);
    }
    fetchLoadMatches.delete(key);
    fetchReloadIds.delete(key);
    fetchRedirectIds.delete(key);
    state.fetchers.delete(key);
  }
  function abortFetcher(key) {
    let controller = fetchControllers.get(key);
    invariant(controller, "Expected fetch controller: " + key);
    controller.abort();
    fetchControllers.delete(key);
  }
  function markFetchersDone(keys) {
    for (let key of keys) {
      let fetcher = getFetcher(key);
      let doneFetcher = getDoneFetcher(fetcher.data);
      state.fetchers.set(key, doneFetcher);
    }
  }
  function markFetchRedirectsDone() {
    let doneKeys = [];
    let updatedFetchers = false;
    for (let key of fetchRedirectIds) {
      let fetcher = state.fetchers.get(key);
      invariant(fetcher, "Expected fetcher: " + key);
      if (fetcher.state === "loading") {
        fetchRedirectIds.delete(key);
        doneKeys.push(key);
        updatedFetchers = true;
      }
    }
    markFetchersDone(doneKeys);
    return updatedFetchers;
  }
  function abortStaleFetchLoads(landedId) {
    let yeetedKeys = [];
    for (let [key, id] of fetchReloadIds) {
      if (id < landedId) {
        let fetcher = state.fetchers.get(key);
        invariant(fetcher, "Expected fetcher: " + key);
        if (fetcher.state === "loading") {
          abortFetcher(key);
          fetchReloadIds.delete(key);
          yeetedKeys.push(key);
        }
      }
    }
    markFetchersDone(yeetedKeys);
    return yeetedKeys.length > 0;
  }
  function getBlocker(key, fn) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    if (blockerFunctions.get(key) !== fn) {
      blockerFunctions.set(key, fn);
    }
    return blocker;
  }
  function deleteBlocker(key) {
    state.blockers.delete(key);
    blockerFunctions.delete(key);
  }
  // Utility function to update blockers, ensuring valid state transitions
  function updateBlocker(key, newBlocker) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    // Poor mans state machine :)
    // https://mermaid.live/edit#pako:eNqVkc9OwzAMxl8l8nnjAYrEtDIOHEBIgwvKJTReGy3_lDpIqO27k6awMG0XcrLlnz87nwdonESogKXXBuE79rq75XZO3-yHds0RJVuv70YrPlUrCEe2HfrORS3rubqZfuhtpg5C9wk5tZ4VKcRUq88q9Z8RS0-48cE1iHJkL0ugbHuFLus9L6spZy8nX9MP2CNdomVaposqu3fGayT8T8-jJQwhepo_UtpgBQaDEUom04dZhAN1aJBDlUKJBxE1ceB2Smj0Mln-IBW5AFU2dwUiktt_2Qaq2dBfaKdEup85UV7Yd-dKjlnkabl2Pvr0DTkTreM
    invariant(blocker.state === "unblocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "proceeding" || blocker.state === "blocked" && newBlocker.state === "unblocked" || blocker.state === "proceeding" && newBlocker.state === "unblocked", "Invalid blocker state transition: " + blocker.state + " -> " + newBlocker.state);
    let blockers = new Map(state.blockers);
    blockers.set(key, newBlocker);
    updateState({
      blockers
    });
  }
  function shouldBlockNavigation(_ref2) {
    let {
      currentLocation,
      nextLocation,
      historyAction
    } = _ref2;
    if (blockerFunctions.size === 0) {
      return;
    }
    // We ony support a single active blocker at the moment since we don't have
    // any compelling use cases for multi-blocker yet
    if (blockerFunctions.size > 1) {
      warning(false, "A router only supports one blocker at a time");
    }
    let entries = Array.from(blockerFunctions.entries());
    let [blockerKey, blockerFunction] = entries[entries.length - 1];
    let blocker = state.blockers.get(blockerKey);
    if (blocker && blocker.state === "proceeding") {
      // If the blocker is currently proceeding, we don't need to re-check
      // it and can let this navigation continue
      return;
    }
    // At this point, we know we're unblocked/blocked so we need to check the
    // user-provided blocker function
    if (blockerFunction({
      currentLocation,
      nextLocation,
      historyAction
    })) {
      return blockerKey;
    }
  }
  function cancelActiveDeferreds(predicate) {
    let cancelledRouteIds = [];
    activeDeferreds.forEach((dfd, routeId) => {
      if (!predicate || predicate(routeId)) {
        // Cancel the deferred - but do not remove from activeDeferreds here -
        // we rely on the subscribers to do that so our tests can assert proper
        // cleanup via _internalActiveDeferreds
        dfd.cancel();
        cancelledRouteIds.push(routeId);
        activeDeferreds.delete(routeId);
      }
    });
    return cancelledRouteIds;
  }
  // Opt in to capturing and reporting scroll positions during navigations,
  // used by the <ScrollRestoration> component
  function enableScrollRestoration(positions, getPosition, getKey) {
    savedScrollPositions = positions;
    getScrollPosition = getPosition;
    getScrollRestorationKey = getKey || null;
    // Perform initial hydration scroll restoration, since we miss the boat on
    // the initial updateState() because we've not yet rendered <ScrollRestoration/>
    // and therefore have no savedScrollPositions available
    if (!initialScrollRestored && state.navigation === IDLE_NAVIGATION) {
      initialScrollRestored = true;
      let y = getSavedScrollPosition(state.location, state.matches);
      if (y != null) {
        updateState({
          restoreScrollPosition: y
        });
      }
    }
    return () => {
      savedScrollPositions = null;
      getScrollPosition = null;
      getScrollRestorationKey = null;
    };
  }
  function getScrollKey(location, matches) {
    if (getScrollRestorationKey) {
      let key = getScrollRestorationKey(location, matches.map(m => createUseMatchesMatch(m, state.loaderData)));
      return key || location.key;
    }
    return location.key;
  }
  function saveScrollPosition(location, matches) {
    if (savedScrollPositions && getScrollPosition) {
      let key = getScrollKey(location, matches);
      savedScrollPositions[key] = getScrollPosition();
    }
  }
  function getSavedScrollPosition(location, matches) {
    if (savedScrollPositions) {
      let key = getScrollKey(location, matches);
      let y = savedScrollPositions[key];
      if (typeof y === "number") {
        return y;
      }
    }
    return null;
  }
  function _internalSetRoutes(newRoutes) {
    manifest = {};
    inFlightDataRoutes = convertRoutesToDataRoutes(newRoutes, mapRouteProperties, undefined, manifest);
  }
  router = {
    get basename() {
      return basename;
    },
    get state() {
      return state;
    },
    get routes() {
      return dataRoutes;
    },
    initialize,
    subscribe,
    enableScrollRestoration,
    navigate,
    fetch,
    revalidate,
    // Passthrough to history-aware createHref used by useHref so we get proper
    // hash-aware URLs in DOM paths
    createHref: to => init.history.createHref(to),
    encodeLocation: to => init.history.encodeLocation(to),
    getFetcher,
    deleteFetcher,
    dispose,
    getBlocker,
    deleteBlocker,
    _internalFetchControllers: fetchControllers,
    _internalActiveDeferreds: activeDeferreds,
    // TODO: Remove setRoutes, it's temporary to avoid dealing with
    // updating the tree while validating the update algorithm.
    _internalSetRoutes
  };
  return router;
}
//#endregion
////////////////////////////////////////////////////////////////////////////////
//#region createStaticHandler
////////////////////////////////////////////////////////////////////////////////
const UNSAFE_DEFERRED_SYMBOL = Symbol("deferred");
function createStaticHandler(routes, opts) {
  invariant(routes.length > 0, "You must provide a non-empty routes array to createStaticHandler");
  let manifest = {};
  let basename = (opts ? opts.basename : null) || "/";
  let mapRouteProperties;
  if (opts != null && opts.mapRouteProperties) {
    mapRouteProperties = opts.mapRouteProperties;
  } else if (opts != null && opts.detectErrorBoundary) {
    // If they are still using the deprecated version, wrap it with the new API
    let detectErrorBoundary = opts.detectErrorBoundary;
    mapRouteProperties = route => ({
      hasErrorBoundary: detectErrorBoundary(route)
    });
  } else {
    mapRouteProperties = defaultMapRouteProperties;
  }
  let dataRoutes = convertRoutesToDataRoutes(routes, mapRouteProperties, undefined, manifest);
  /**
   * The query() method is intended for document requests, in which we want to
   * call an optional action and potentially multiple loaders for all nested
   * routes.  It returns a StaticHandlerContext object, which is very similar
   * to the router state (location, loaderData, actionData, errors, etc.) and
   * also adds SSR-specific information such as the statusCode and headers
   * from action/loaders Responses.
   *
   * It _should_ never throw and should report all errors through the
   * returned context.errors object, properly associating errors to their error
   * boundary.  Additionally, it tracks _deepestRenderedBoundaryId which can be
   * used to emulate React error boundaries during SSr by performing a second
   * pass only down to the boundaryId.
   *
   * The one exception where we do not return a StaticHandlerContext is when a
   * redirect response is returned or thrown from any action/loader.  We
   * propagate that out and return the raw Response so the HTTP server can
   * return it directly.
   */
  async function query(request, _temp2) {
    let {
      requestContext
    } = _temp2 === void 0 ? {} : _temp2;
    let url = new URL(request.url);
    let method = request.method;
    let location = createLocation("", createPath(url), null, "default");
    let matches = matchRoutes(dataRoutes, location, basename);
    // SSR supports HEAD requests while SPA doesn't
    if (!isValidMethod(method) && method !== "HEAD") {
      let error = getInternalRouterError(405, {
        method
      });
      let {
        matches: methodNotAllowedMatches,
        route
      } = getShortCircuitMatches(dataRoutes);
      return {
        basename,
        location,
        matches: methodNotAllowedMatches,
        loaderData: {},
        actionData: null,
        errors: {
          [route.id]: error
        },
        statusCode: error.status,
        loaderHeaders: {},
        actionHeaders: {},
        activeDeferreds: null
      };
    } else if (!matches) {
      let error = getInternalRouterError(404, {
        pathname: location.pathname
      });
      let {
        matches: notFoundMatches,
        route
      } = getShortCircuitMatches(dataRoutes);
      return {
        basename,
        location,
        matches: notFoundMatches,
        loaderData: {},
        actionData: null,
        errors: {
          [route.id]: error
        },
        statusCode: error.status,
        loaderHeaders: {},
        actionHeaders: {},
        activeDeferreds: null
      };
    }
    let result = await queryImpl(request, location, matches, requestContext);
    if (isResponse(result)) {
      return result;
    }
    // When returning StaticHandlerContext, we patch back in the location here
    // since we need it for React Context.  But this helps keep our submit and
    // loadRouteData operating on a Request instead of a Location
    return _extends({
      location,
      basename
    }, result);
  }
  /**
   * The queryRoute() method is intended for targeted route requests, either
   * for fetch ?_data requests or resource route requests.  In this case, we
   * are only ever calling a single action or loader, and we are returning the
   * returned value directly.  In most cases, this will be a Response returned
   * from the action/loader, but it may be a primitive or other value as well -
   * and in such cases the calling context should handle that accordingly.
   *
   * We do respect the throw/return differentiation, so if an action/loader
   * throws, then this method will throw the value.  This is important so we
   * can do proper boundary identification in Remix where a thrown Response
   * must go to the Catch Boundary but a returned Response is happy-path.
   *
   * One thing to note is that any Router-initiated Errors that make sense
   * to associate with a status code will be thrown as an ErrorResponse
   * instance which include the raw Error, such that the calling context can
   * serialize the error as they see fit while including the proper response
   * code.  Examples here are 404 and 405 errors that occur prior to reaching
   * any user-defined loaders.
   */
  async function queryRoute(request, _temp3) {
    let {
      routeId,
      requestContext
    } = _temp3 === void 0 ? {} : _temp3;
    let url = new URL(request.url);
    let method = request.method;
    let location = createLocation("", createPath(url), null, "default");
    let matches = matchRoutes(dataRoutes, location, basename);
    // SSR supports HEAD requests while SPA doesn't
    if (!isValidMethod(method) && method !== "HEAD" && method !== "OPTIONS") {
      throw getInternalRouterError(405, {
        method
      });
    } else if (!matches) {
      throw getInternalRouterError(404, {
        pathname: location.pathname
      });
    }
    let match = routeId ? matches.find(m => m.route.id === routeId) : getTargetMatch(matches, location);
    if (routeId && !match) {
      throw getInternalRouterError(403, {
        pathname: location.pathname,
        routeId
      });
    } else if (!match) {
      // This should never hit I don't think?
      throw getInternalRouterError(404, {
        pathname: location.pathname
      });
    }
    let result = await queryImpl(request, location, matches, requestContext, match);
    if (isResponse(result)) {
      return result;
    }
    let error = result.errors ? Object.values(result.errors)[0] : undefined;
    if (error !== undefined) {
      // If we got back result.errors, that means the loader/action threw
      // _something_ that wasn't a Response, but it's not guaranteed/required
      // to be an `instanceof Error` either, so we have to use throw here to
      // preserve the "error" state outside of queryImpl.
      throw error;
    }
    // Pick off the right state value to return
    if (result.actionData) {
      return Object.values(result.actionData)[0];
    }
    if (result.loaderData) {
      var _result$activeDeferre;
      let data = Object.values(result.loaderData)[0];
      if ((_result$activeDeferre = result.activeDeferreds) != null && _result$activeDeferre[match.route.id]) {
        data[UNSAFE_DEFERRED_SYMBOL] = result.activeDeferreds[match.route.id];
      }
      return data;
    }
    return undefined;
  }
  async function queryImpl(request, location, matches, requestContext, routeMatch) {
    invariant(request.signal, "query()/queryRoute() requests must contain an AbortController signal");
    try {
      if (isMutationMethod(request.method.toLowerCase())) {
        let result = await submit(request, matches, routeMatch || getTargetMatch(matches, location), requestContext, routeMatch != null);
        return result;
      }
      let result = await loadRouteData(request, matches, requestContext, routeMatch);
      return isResponse(result) ? result : _extends({}, result, {
        actionData: null,
        actionHeaders: {}
      });
    } catch (e) {
      // If the user threw/returned a Response in callLoaderOrAction, we throw
      // it to bail out and then return or throw here based on whether the user
      // returned or threw
      if (isQueryRouteResponse(e)) {
        if (e.type === ResultType.error) {
          throw e.response;
        }
        return e.response;
      }
      // Redirects are always returned since they don't propagate to catch
      // boundaries
      if (isRedirectResponse(e)) {
        return e;
      }
      throw e;
    }
  }
  async function submit(request, matches, actionMatch, requestContext, isRouteRequest) {
    let result;
    if (!actionMatch.route.action && !actionMatch.route.lazy) {
      let error = getInternalRouterError(405, {
        method: request.method,
        pathname: new URL(request.url).pathname,
        routeId: actionMatch.route.id
      });
      if (isRouteRequest) {
        throw error;
      }
      result = {
        type: ResultType.error,
        error
      };
    } else {
      result = await callLoaderOrAction("action", request, actionMatch, matches, manifest, mapRouteProperties, basename, {
        isStaticRequest: true,
        isRouteRequest,
        requestContext
      });
      if (request.signal.aborted) {
        let method = isRouteRequest ? "queryRoute" : "query";
        throw new Error(method + "() call aborted");
      }
    }
    if (isRedirectResult(result)) {
      // Uhhhh - this should never happen, we should always throw these from
      // callLoaderOrAction, but the type narrowing here keeps TS happy and we
      // can get back on the "throw all redirect responses" train here should
      // this ever happen :/
      throw new Response(null, {
        status: result.status,
        headers: {
          Location: result.location
        }
      });
    }
    if (isDeferredResult(result)) {
      let error = getInternalRouterError(400, {
        type: "defer-action"
      });
      if (isRouteRequest) {
        throw error;
      }
      result = {
        type: ResultType.error,
        error
      };
    }
    if (isRouteRequest) {
      // Note: This should only be non-Response values if we get here, since
      // isRouteRequest should throw any Response received in callLoaderOrAction
      if (isErrorResult(result)) {
        throw result.error;
      }
      return {
        matches: [actionMatch],
        loaderData: {},
        actionData: {
          [actionMatch.route.id]: result.data
        },
        errors: null,
        // Note: statusCode + headers are unused here since queryRoute will
        // return the raw Response or value
        statusCode: 200,
        loaderHeaders: {},
        actionHeaders: {},
        activeDeferreds: null
      };
    }
    if (isErrorResult(result)) {
      // Store off the pending error - we use it to determine which loaders
      // to call and will commit it when we complete the navigation
      let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
      let context = await loadRouteData(request, matches, requestContext, undefined, {
        [boundaryMatch.route.id]: result.error
      });
      // action status codes take precedence over loader status codes
      return _extends({}, context, {
        statusCode: isRouteErrorResponse(result.error) ? result.error.status : 500,
        actionData: null,
        actionHeaders: _extends({}, result.headers ? {
          [actionMatch.route.id]: result.headers
        } : {})
      });
    }
    // Create a GET request for the loaders
    let loaderRequest = new Request(request.url, {
      headers: request.headers,
      redirect: request.redirect,
      signal: request.signal
    });
    let context = await loadRouteData(loaderRequest, matches, requestContext);
    return _extends({}, context, result.statusCode ? {
      statusCode: result.statusCode
    } : {}, {
      actionData: {
        [actionMatch.route.id]: result.data
      },
      actionHeaders: _extends({}, result.headers ? {
        [actionMatch.route.id]: result.headers
      } : {})
    });
  }
  async function loadRouteData(request, matches, requestContext, routeMatch, pendingActionError) {
    let isRouteRequest = routeMatch != null;
    // Short circuit if we have no loaders to run (queryRoute())
    if (isRouteRequest && !(routeMatch != null && routeMatch.route.loader) && !(routeMatch != null && routeMatch.route.lazy)) {
      throw getInternalRouterError(400, {
        method: request.method,
        pathname: new URL(request.url).pathname,
        routeId: routeMatch == null ? void 0 : routeMatch.route.id
      });
    }
    let requestMatches = routeMatch ? [routeMatch] : getLoaderMatchesUntilBoundary(matches, Object.keys(pendingActionError || {})[0]);
    let matchesToLoad = requestMatches.filter(m => m.route.loader || m.route.lazy);
    // Short circuit if we have no loaders to run (query())
    if (matchesToLoad.length === 0) {
      return {
        matches,
        // Add a null for all matched routes for proper revalidation on the client
        loaderData: matches.reduce((acc, m) => Object.assign(acc, {
          [m.route.id]: null
        }), {}),
        errors: pendingActionError || null,
        statusCode: 200,
        loaderHeaders: {},
        activeDeferreds: null
      };
    }
    let results = await Promise.all([...matchesToLoad.map(match => callLoaderOrAction("loader", request, match, matches, manifest, mapRouteProperties, basename, {
      isStaticRequest: true,
      isRouteRequest,
      requestContext
    }))]);
    if (request.signal.aborted) {
      let method = isRouteRequest ? "queryRoute" : "query";
      throw new Error(method + "() call aborted");
    }
    // Process and commit output from loaders
    let activeDeferreds = new Map();
    let context = processRouteLoaderData(matches, matchesToLoad, results, pendingActionError, activeDeferreds);
    // Add a null for any non-loader matches for proper revalidation on the client
    let executedLoaders = new Set(matchesToLoad.map(match => match.route.id));
    matches.forEach(match => {
      if (!executedLoaders.has(match.route.id)) {
        context.loaderData[match.route.id] = null;
      }
    });
    return _extends({}, context, {
      matches,
      activeDeferreds: activeDeferreds.size > 0 ? Object.fromEntries(activeDeferreds.entries()) : null
    });
  }
  return {
    dataRoutes,
    query,
    queryRoute
  };
}
//#endregion
////////////////////////////////////////////////////////////////////////////////
//#region Helpers
////////////////////////////////////////////////////////////////////////////////
/**
 * Given an existing StaticHandlerContext and an error thrown at render time,
 * provide an updated StaticHandlerContext suitable for a second SSR render
 */
function getStaticContextFromError(routes, context, error) {
  let newContext = _extends({}, context, {
    statusCode: 500,
    errors: {
      [context._deepestRenderedBoundaryId || routes[0].id]: error
    }
  });
  return newContext;
}
function isSubmissionNavigation(opts) {
  return opts != null && ("formData" in opts && opts.formData != null || "body" in opts && opts.body !== undefined);
}
function normalizeTo(location, matches, basename, prependBasename, to, fromRouteId, relative) {
  let contextualMatches;
  let activeRouteMatch;
  if (fromRouteId != null && relative !== "path") {
    // Grab matches up to the calling route so our route-relative logic is
    // relative to the correct source route.  When using relative:path,
    // fromRouteId is ignored since that is always relative to the current
    // location path
    contextualMatches = [];
    for (let match of matches) {
      contextualMatches.push(match);
      if (match.route.id === fromRouteId) {
        activeRouteMatch = match;
        break;
      }
    }
  } else {
    contextualMatches = matches;
    activeRouteMatch = matches[matches.length - 1];
  }
  // Resolve the relative path
  let path = resolveTo(to ? to : ".", getPathContributingMatches(contextualMatches).map(m => m.pathnameBase), stripBasename(location.pathname, basename) || location.pathname, relative === "path");
  // When `to` is not specified we inherit search/hash from the current
  // location, unlike when to="." and we just inherit the path.
  // See https://github.com/remix-run/remix/issues/927
  if (to == null) {
    path.search = location.search;
    path.hash = location.hash;
  }
  // Add an ?index param for matched index routes if we don't already have one
  if ((to == null || to === "" || to === ".") && activeRouteMatch && activeRouteMatch.route.index && !hasNakedIndexQuery(path.search)) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  // If we're operating within a basename, prepend it to the pathname.  If
  // this is a root navigation, then just use the raw basename which allows
  // the basename to have full control over the presence of a trailing slash
  // on root actions
  if (prependBasename && basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
// Normalize navigation options by converting formMethod=GET formData objects to
// URLSearchParams so they behave identically to links with query params
function normalizeNavigateOptions(normalizeFormMethod, isFetcher, path, opts) {
  // Return location verbatim on non-submission navigations
  if (!opts || !isSubmissionNavigation(opts)) {
    return {
      path
    };
  }
  if (opts.formMethod && !isValidMethod(opts.formMethod)) {
    return {
      path,
      error: getInternalRouterError(405, {
        method: opts.formMethod
      })
    };
  }
  let getInvalidBodyError = () => ({
    path,
    error: getInternalRouterError(400, {
      type: "invalid-body"
    })
  });
  // Create a Submission on non-GET navigations
  let rawFormMethod = opts.formMethod || "get";
  let formMethod = normalizeFormMethod ? rawFormMethod.toUpperCase() : rawFormMethod.toLowerCase();
  let formAction = stripHashFromPath(path);
  if (opts.body !== undefined) {
    if (opts.formEncType === "text/plain") {
      // text only support POST/PUT/PATCH/DELETE submissions
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      let text = typeof opts.body === "string" ? opts.body : opts.body instanceof FormData || opts.body instanceof URLSearchParams ?
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#plain-text-form-data
      Array.from(opts.body.entries()).reduce((acc, _ref3) => {
        let [name, value] = _ref3;
        return "" + acc + name + "=" + value + "\n";
      }, "") : String(opts.body);
      return {
        path,
        submission: {
          formMethod,
          formAction,
          formEncType: opts.formEncType,
          formData: undefined,
          json: undefined,
          text
        }
      };
    } else if (opts.formEncType === "application/json") {
      // json only supports POST/PUT/PATCH/DELETE submissions
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      try {
        let json = typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body;
        return {
          path,
          submission: {
            formMethod,
            formAction,
            formEncType: opts.formEncType,
            formData: undefined,
            json,
            text: undefined
          }
        };
      } catch (e) {
        return getInvalidBodyError();
      }
    }
  }
  invariant(typeof FormData === "function", "FormData is not available in this environment");
  let searchParams;
  let formData;
  if (opts.formData) {
    searchParams = convertFormDataToSearchParams(opts.formData);
    formData = opts.formData;
  } else if (opts.body instanceof FormData) {
    searchParams = convertFormDataToSearchParams(opts.body);
    formData = opts.body;
  } else if (opts.body instanceof URLSearchParams) {
    searchParams = opts.body;
    formData = convertSearchParamsToFormData(searchParams);
  } else if (opts.body == null) {
    searchParams = new URLSearchParams();
    formData = new FormData();
  } else {
    try {
      searchParams = new URLSearchParams(opts.body);
      formData = convertSearchParamsToFormData(searchParams);
    } catch (e) {
      return getInvalidBodyError();
    }
  }
  let submission = {
    formMethod,
    formAction,
    formEncType: opts && opts.formEncType || "application/x-www-form-urlencoded",
    formData,
    json: undefined,
    text: undefined
  };
  if (isMutationMethod(submission.formMethod)) {
    return {
      path,
      submission
    };
  }
  // Flatten submission onto URLSearchParams for GET submissions
  let parsedPath = parsePath(path);
  // On GET navigation submissions we can drop the ?index param from the
  // resulting location since all loaders will run.  But fetcher GET submissions
  // only run a single loader so we need to preserve any incoming ?index params
  if (isFetcher && parsedPath.search && hasNakedIndexQuery(parsedPath.search)) {
    searchParams.append("index", "");
  }
  parsedPath.search = "?" + searchParams;
  return {
    path: createPath(parsedPath),
    submission
  };
}
// Filter out all routes below any caught error as they aren't going to
// render so we don't need to load them
function getLoaderMatchesUntilBoundary(matches, boundaryId) {
  let boundaryMatches = matches;
  if (boundaryId) {
    let index = matches.findIndex(m => m.route.id === boundaryId);
    if (index >= 0) {
      boundaryMatches = matches.slice(0, index);
    }
  }
  return boundaryMatches;
}
function getMatchesToLoad(history, state, matches, submission, location, isRevalidationRequired, cancelledDeferredRoutes, cancelledFetcherLoads, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, pendingActionData, pendingError) {
  let actionResult = pendingError ? Object.values(pendingError)[0] : pendingActionData ? Object.values(pendingActionData)[0] : undefined;
  let currentUrl = history.createURL(state.location);
  let nextUrl = history.createURL(location);
  // Pick navigation matches that are net-new or qualify for revalidation
  let boundaryId = pendingError ? Object.keys(pendingError)[0] : undefined;
  let boundaryMatches = getLoaderMatchesUntilBoundary(matches, boundaryId);
  let navigationMatches = boundaryMatches.filter((match, index) => {
    if (match.route.lazy) {
      // We haven't loaded this route yet so we don't know if it's got a loader!
      return true;
    }
    if (match.route.loader == null) {
      return false;
    }
    // Always call the loader on new route instances and pending defer cancellations
    if (isNewLoader(state.loaderData, state.matches[index], match) || cancelledDeferredRoutes.some(id => id === match.route.id)) {
      return true;
    }
    // This is the default implementation for when we revalidate.  If the route
    // provides it's own implementation, then we give them full control but
    // provide this value so they can leverage it if needed after they check
    // their own specific use cases
    let currentRouteMatch = state.matches[index];
    let nextRouteMatch = match;
    return shouldRevalidateLoader(match, _extends({
      currentUrl,
      currentParams: currentRouteMatch.params,
      nextUrl,
      nextParams: nextRouteMatch.params
    }, submission, {
      actionResult,
      defaultShouldRevalidate:
      // Forced revalidation due to submission, useRevalidator, or X-Remix-Revalidate
      isRevalidationRequired ||
      // Clicked the same link, resubmitted a GET form
      currentUrl.pathname + currentUrl.search === nextUrl.pathname + nextUrl.search ||
      // Search params affect all loaders
      currentUrl.search !== nextUrl.search || isNewRouteInstance(currentRouteMatch, nextRouteMatch)
    }));
  });
  // Pick fetcher.loads that need to be revalidated
  let revalidatingFetchers = [];
  fetchLoadMatches.forEach((f, key) => {
    // Don't revalidate if fetcher won't be present in the subsequent render
    if (!matches.some(m => m.route.id === f.routeId)) {
      return;
    }
    let fetcherMatches = matchRoutes(routesToUse, f.path, basename);
    // If the fetcher path no longer matches, push it in with null matches so
    // we can trigger a 404 in callLoadersAndMaybeResolveData.  Note this is
    // currently only a use-case for Remix HMR where the route tree can change
    // at runtime and remove a route previously loaded via a fetcher
    if (!fetcherMatches) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: null,
        match: null,
        controller: null
      });
      return;
    }
    // Revalidating fetchers are decoupled from the route matches since they
    // load from a static href.  They revalidate based on explicit revalidation
    // (submission, useRevalidator, or X-Remix-Revalidate)
    let fetcher = state.fetchers.get(key);
    let fetcherMatch = getTargetMatch(fetcherMatches, f.path);
    let shouldRevalidate = false;
    if (fetchRedirectIds.has(key)) {
      // Never trigger a revalidation of an actively redirecting fetcher
      shouldRevalidate = false;
    } else if (cancelledFetcherLoads.includes(key)) {
      // Always revalidate if the fetcher was cancelled
      shouldRevalidate = true;
    } else if (fetcher && fetcher.state !== "idle" && fetcher.data === undefined) {
      // If the fetcher hasn't ever completed loading yet, then this isn't a
      // revalidation, it would just be a brand new load if an explicit
      // revalidation is required
      shouldRevalidate = isRevalidationRequired;
    } else {
      // Otherwise fall back on any user-defined shouldRevalidate, defaulting
      // to explicit revalidations only
      shouldRevalidate = shouldRevalidateLoader(fetcherMatch, _extends({
        currentUrl,
        currentParams: state.matches[state.matches.length - 1].params,
        nextUrl,
        nextParams: matches[matches.length - 1].params
      }, submission, {
        actionResult,
        defaultShouldRevalidate: isRevalidationRequired
      }));
    }
    if (shouldRevalidate) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: fetcherMatches,
        match: fetcherMatch,
        controller: new AbortController()
      });
    }
  });
  return [navigationMatches, revalidatingFetchers];
}
function isNewLoader(currentLoaderData, currentMatch, match) {
  let isNew =
  // [a] -> [a, b]
  !currentMatch ||
  // [a, b] -> [a, c]
  match.route.id !== currentMatch.route.id;
  // Handle the case that we don't have data for a re-used route, potentially
  // from a prior error or from a cancelled pending deferred
  let isMissingData = currentLoaderData[match.route.id] === undefined;
  // Always load if this is a net-new route or we don't yet have data
  return isNew || isMissingData;
}
function isNewRouteInstance(currentMatch, match) {
  let currentPath = currentMatch.route.path;
  return (
    // param change for this match, /users/123 -> /users/456
    currentMatch.pathname !== match.pathname ||
    // splat param changed, which is not present in match.path
    // e.g. /files/images/avatar.jpg -> files/finances.xls
    currentPath != null && currentPath.endsWith("*") && currentMatch.params["*"] !== match.params["*"]
  );
}
function shouldRevalidateLoader(loaderMatch, arg) {
  if (loaderMatch.route.shouldRevalidate) {
    let routeChoice = loaderMatch.route.shouldRevalidate(arg);
    if (typeof routeChoice === "boolean") {
      return routeChoice;
    }
  }
  return arg.defaultShouldRevalidate;
}
/**
 * Execute route.lazy() methods to lazily load route modules (loader, action,
 * shouldRevalidate) and update the routeManifest in place which shares objects
 * with dataRoutes so those get updated as well.
 */
async function loadLazyRouteModule(route, mapRouteProperties, manifest) {
  if (!route.lazy) {
    return;
  }
  let lazyRoute = await route.lazy();
  // If the lazy route function was executed and removed by another parallel
  // call then we can return - first lazy() to finish wins because the return
  // value of lazy is expected to be static
  if (!route.lazy) {
    return;
  }
  let routeToUpdate = manifest[route.id];
  invariant(routeToUpdate, "No route found in manifest");
  // Update the route in place.  This should be safe because there's no way
  // we could yet be sitting on this route as we can't get there without
  // resolving lazy() first.
  //
  // This is different than the HMR "update" use-case where we may actively be
  // on the route being updated.  The main concern boils down to "does this
  // mutation affect any ongoing navigations or any current state.matches
  // values?".  If not, it should be safe to update in place.
  let routeUpdates = {};
  for (let lazyRouteProperty in lazyRoute) {
    let staticRouteValue = routeToUpdate[lazyRouteProperty];
    let isPropertyStaticallyDefined = staticRouteValue !== undefined &&
    // This property isn't static since it should always be updated based
    // on the route updates
    lazyRouteProperty !== "hasErrorBoundary";
    warning(!isPropertyStaticallyDefined, "Route \"" + routeToUpdate.id + "\" has a static property \"" + lazyRouteProperty + "\" " + "defined but its lazy function is also returning a value for this property. " + ("The lazy route property \"" + lazyRouteProperty + "\" will be ignored."));
    if (!isPropertyStaticallyDefined && !immutableRouteKeys.has(lazyRouteProperty)) {
      routeUpdates[lazyRouteProperty] = lazyRoute[lazyRouteProperty];
    }
  }
  // Mutate the route with the provided updates.  Do this first so we pass
  // the updated version to mapRouteProperties
  Object.assign(routeToUpdate, routeUpdates);
  // Mutate the `hasErrorBoundary` property on the route based on the route
  // updates and remove the `lazy` function so we don't resolve the lazy
  // route again.
  Object.assign(routeToUpdate, _extends({}, mapRouteProperties(routeToUpdate), {
    lazy: undefined
  }));
}
async function callLoaderOrAction(type, request, match, matches, manifest, mapRouteProperties, basename, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let resultType;
  let result;
  let onReject;
  let runHandler = handler => {
    // Setup a promise we can race against so that abort signals short circuit
    let reject;
    let abortPromise = new Promise((_, r) => reject = r);
    onReject = () => reject();
    request.signal.addEventListener("abort", onReject);
    return Promise.race([handler({
      request,
      params: match.params,
      context: opts.requestContext
    }), abortPromise]);
  };
  try {
    let handler = match.route[type];
    if (match.route.lazy) {
      if (handler) {
        // Run statically defined handler in parallel with lazy()
        let values = await Promise.all([runHandler(handler), loadLazyRouteModule(match.route, mapRouteProperties, manifest)]);
        result = values[0];
      } else {
        // Load lazy route module, then run any returned handler
        await loadLazyRouteModule(match.route, mapRouteProperties, manifest);
        handler = match.route[type];
        if (handler) {
          // Handler still run even if we got interrupted to maintain consistency
          // with un-abortable behavior of handler execution on non-lazy or
          // previously-lazy-loaded routes
          result = await runHandler(handler);
        } else if (type === "action") {
          let url = new URL(request.url);
          let pathname = url.pathname + url.search;
          throw getInternalRouterError(405, {
            method: request.method,
            pathname,
            routeId: match.route.id
          });
        } else {
          // lazy() route has no loader to run.  Short circuit here so we don't
          // hit the invariant below that errors on returning undefined.
          return {
            type: ResultType.data,
            data: undefined
          };
        }
      }
    } else if (!handler) {
      let url = new URL(request.url);
      let pathname = url.pathname + url.search;
      throw getInternalRouterError(404, {
        pathname
      });
    } else {
      result = await runHandler(handler);
    }
    invariant(result !== undefined, "You defined " + (type === "action" ? "an action" : "a loader") + " for route " + ("\"" + match.route.id + "\" but didn't return anything from your `" + type + "` ") + "function. Please return a value or `null`.");
  } catch (e) {
    resultType = ResultType.error;
    result = e;
  } finally {
    if (onReject) {
      request.signal.removeEventListener("abort", onReject);
    }
  }
  if (isResponse(result)) {
    let status = result.status;
    // Process redirects
    if (redirectStatusCodes.has(status)) {
      let location = result.headers.get("Location");
      invariant(location, "Redirects returned/thrown from loaders/actions must have a Location header");
      // Support relative routing in internal redirects
      if (!ABSOLUTE_URL_REGEX.test(location)) {
        location = normalizeTo(new URL(request.url), matches.slice(0, matches.indexOf(match) + 1), basename, true, location);
      } else if (!opts.isStaticRequest) {
        // Strip off the protocol+origin for same-origin + same-basename absolute
        // redirects. If this is a static request, we can let it go back to the
        // browser as-is
        let currentUrl = new URL(request.url);
        let url = location.startsWith("//") ? new URL(currentUrl.protocol + location) : new URL(location);
        let isSameBasename = stripBasename(url.pathname, basename) != null;
        if (url.origin === currentUrl.origin && isSameBasename) {
          location = url.pathname + url.search + url.hash;
        }
      }
      // Don't process redirects in the router during static requests requests.
      // Instead, throw the Response and let the server handle it with an HTTP
      // redirect.  We also update the Location header in place in this flow so
      // basename and relative routing is taken into account
      if (opts.isStaticRequest) {
        result.headers.set("Location", location);
        throw result;
      }
      return {
        type: ResultType.redirect,
        status,
        location,
        revalidate: result.headers.get("X-Remix-Revalidate") !== null,
        reloadDocument: result.headers.get("X-Remix-Reload-Document") !== null
      };
    }
    // For SSR single-route requests, we want to hand Responses back directly
    // without unwrapping.  We do this with the QueryRouteResponse wrapper
    // interface so we can know whether it was returned or thrown
    if (opts.isRouteRequest) {
      let queryRouteResponse = {
        type: resultType === ResultType.error ? ResultType.error : ResultType.data,
        response: result
      };
      throw queryRouteResponse;
    }
    let data;
    let contentType = result.headers.get("Content-Type");
    // Check between word boundaries instead of startsWith() due to the last
    // paragraph of https://httpwg.org/specs/rfc9110.html#field.content-type
    if (contentType && /\bapplication\/json\b/.test(contentType)) {
      data = await result.json();
    } else {
      data = await result.text();
    }
    if (resultType === ResultType.error) {
      return {
        type: resultType,
        error: new ErrorResponse(status, result.statusText, data),
        headers: result.headers
      };
    }
    return {
      type: ResultType.data,
      data,
      statusCode: result.status,
      headers: result.headers
    };
  }
  if (resultType === ResultType.error) {
    return {
      type: resultType,
      error: result
    };
  }
  if (isDeferredData(result)) {
    var _result$init, _result$init2;
    return {
      type: ResultType.deferred,
      deferredData: result,
      statusCode: (_result$init = result.init) == null ? void 0 : _result$init.status,
      headers: ((_result$init2 = result.init) == null ? void 0 : _result$init2.headers) && new Headers(result.init.headers)
    };
  }
  return {
    type: ResultType.data,
    data: result
  };
}
// Utility method for creating the Request instances for loaders/actions during
// client-side navigations and fetches.  During SSR we will always have a
// Request instance from the static handler (query/queryRoute)
function createClientSideRequest(history, location, signal, submission) {
  let url = history.createURL(stripHashFromPath(location)).toString();
  let init = {
    signal
  };
  if (submission && isMutationMethod(submission.formMethod)) {
    let {
      formMethod,
      formEncType
    } = submission;
    // Didn't think we needed this but it turns out unlike other methods, patch
    // won't be properly normalized to uppercase and results in a 405 error.
    // See: https://fetch.spec.whatwg.org/#concept-method
    init.method = formMethod.toUpperCase();
    if (formEncType === "application/json") {
      init.headers = new Headers({
        "Content-Type": formEncType
      });
      init.body = JSON.stringify(submission.json);
    } else if (formEncType === "text/plain") {
      // Content-Type is inferred (https://fetch.spec.whatwg.org/#dom-request)
      init.body = submission.text;
    } else if (formEncType === "application/x-www-form-urlencoded" && submission.formData) {
      // Content-Type is inferred (https://fetch.spec.whatwg.org/#dom-request)
      init.body = convertFormDataToSearchParams(submission.formData);
    } else {
      // Content-Type is inferred (https://fetch.spec.whatwg.org/#dom-request)
      init.body = submission.formData;
    }
  }
  return new Request(url, init);
}
function convertFormDataToSearchParams(formData) {
  let searchParams = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#converting-an-entry-list-to-a-list-of-name-value-pairs
    searchParams.append(key, typeof value === "string" ? value : value.name);
  }
  return searchParams;
}
function convertSearchParamsToFormData(searchParams) {
  let formData = new FormData();
  for (let [key, value] of searchParams.entries()) {
    formData.append(key, value);
  }
  return formData;
}
function processRouteLoaderData(matches, matchesToLoad, results, pendingError, activeDeferreds) {
  // Fill in loaderData/errors from our loaders
  let loaderData = {};
  let errors = null;
  let statusCode;
  let foundError = false;
  let loaderHeaders = {};
  // Process loader results into state.loaderData/state.errors
  results.forEach((result, index) => {
    let id = matchesToLoad[index].route.id;
    invariant(!isRedirectResult(result), "Cannot handle redirect results in processLoaderData");
    if (isErrorResult(result)) {
      // Look upwards from the matched route for the closest ancestor
      // error boundary, defaulting to the root match
      let boundaryMatch = findNearestBoundary(matches, id);
      let error = result.error;
      // If we have a pending action error, we report it at the highest-route
      // that throws a loader error, and then clear it out to indicate that
      // it was consumed
      if (pendingError) {
        error = Object.values(pendingError)[0];
        pendingError = undefined;
      }
      errors = errors || {};
      // Prefer higher error values if lower errors bubble to the same boundary
      if (errors[boundaryMatch.route.id] == null) {
        errors[boundaryMatch.route.id] = error;
      }
      // Clear our any prior loaderData for the throwing route
      loaderData[id] = undefined;
      // Once we find our first (highest) error, we set the status code and
      // prevent deeper status codes from overriding
      if (!foundError) {
        foundError = true;
        statusCode = isRouteErrorResponse(result.error) ? result.error.status : 500;
      }
      if (result.headers) {
        loaderHeaders[id] = result.headers;
      }
    } else {
      if (isDeferredResult(result)) {
        activeDeferreds.set(id, result.deferredData);
        loaderData[id] = result.deferredData.data;
      } else {
        loaderData[id] = result.data;
      }
      // Error status codes always override success status codes, but if all
      // loaders are successful we take the deepest status code.
      if (result.statusCode != null && result.statusCode !== 200 && !foundError) {
        statusCode = result.statusCode;
      }
      if (result.headers) {
        loaderHeaders[id] = result.headers;
      }
    }
  });
  // If we didn't consume the pending action error (i.e., all loaders
  // resolved), then consume it here.  Also clear out any loaderData for the
  // throwing route
  if (pendingError) {
    errors = pendingError;
    loaderData[Object.keys(pendingError)[0]] = undefined;
  }
  return {
    loaderData,
    errors,
    statusCode: statusCode || 200,
    loaderHeaders
  };
}
function processLoaderData(state, matches, matchesToLoad, results, pendingError, revalidatingFetchers, fetcherResults, activeDeferreds) {
  let {
    loaderData,
    errors
  } = processRouteLoaderData(matches, matchesToLoad, results, pendingError, activeDeferreds);
  // Process results from our revalidating fetchers
  for (let index = 0; index < revalidatingFetchers.length; index++) {
    let {
      key,
      match,
      controller
    } = revalidatingFetchers[index];
    invariant(fetcherResults !== undefined && fetcherResults[index] !== undefined, "Did not find corresponding fetcher result");
    let result = fetcherResults[index];
    // Process fetcher non-redirect errors
    if (controller && controller.signal.aborted) {
      // Nothing to do for aborted fetchers
      continue;
    } else if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(state.matches, match == null ? void 0 : match.route.id);
      if (!(errors && errors[boundaryMatch.route.id])) {
        errors = _extends({}, errors, {
          [boundaryMatch.route.id]: result.error
        });
      }
      state.fetchers.delete(key);
    } else if (isRedirectResult(result)) {
      // Should never get here, redirects should get processed above, but we
      // keep this to type narrow to a success result in the else
      invariant(false, "Unhandled fetcher revalidation redirect");
    } else if (isDeferredResult(result)) {
      // Should never get here, deferred data should be awaited for fetchers
      // in resolveDeferredResults
      invariant(false, "Unhandled fetcher deferred data");
    } else {
      let doneFetcher = getDoneFetcher(result.data);
      state.fetchers.set(key, doneFetcher);
    }
  }
  return {
    loaderData,
    errors
  };
}
function mergeLoaderData(loaderData, newLoaderData, matches, errors) {
  let mergedLoaderData = _extends({}, newLoaderData);
  for (let match of matches) {
    let id = match.route.id;
    if (newLoaderData.hasOwnProperty(id)) {
      if (newLoaderData[id] !== undefined) {
        mergedLoaderData[id] = newLoaderData[id];
      }
    } else if (loaderData[id] !== undefined && match.route.loader) {
      // Preserve existing keys not included in newLoaderData and where a loader
      // wasn't removed by HMR
      mergedLoaderData[id] = loaderData[id];
    }
    if (errors && errors.hasOwnProperty(id)) {
      // Don't keep any loader data below the boundary
      break;
    }
  }
  return mergedLoaderData;
}
// Find the nearest error boundary, looking upwards from the leaf route (or the
// route specified by routeId) for the closest ancestor error boundary,
// defaulting to the root match
function findNearestBoundary(matches, routeId) {
  let eligibleMatches = routeId ? matches.slice(0, matches.findIndex(m => m.route.id === routeId) + 1) : [...matches];
  return eligibleMatches.reverse().find(m => m.route.hasErrorBoundary === true) || matches[0];
}
function getShortCircuitMatches(routes) {
  // Prefer a root layout route if present, otherwise shim in a route object
  let route = routes.find(r => r.index || !r.path || r.path === "/") || {
    id: "__shim-error-route__"
  };
  return {
    matches: [{
      params: {},
      pathname: "",
      pathnameBase: "",
      route
    }],
    route
  };
}
function getInternalRouterError(status, _temp4) {
  let {
    pathname,
    routeId,
    method,
    type
  } = _temp4 === void 0 ? {} : _temp4;
  let statusText = "Unknown Server Error";
  let errorMessage = "Unknown @remix-run/router error";
  if (status === 400) {
    statusText = "Bad Request";
    if (method && pathname && routeId) {
      errorMessage = "You made a " + method + " request to \"" + pathname + "\" but " + ("did not provide a `loader` for route \"" + routeId + "\", ") + "so there is no way to handle the request.";
    } else if (type === "defer-action") {
      errorMessage = "defer() is not supported in actions";
    } else if (type === "invalid-body") {
      errorMessage = "Unable to encode submission body";
    }
  } else if (status === 403) {
    statusText = "Forbidden";
    errorMessage = "Route \"" + routeId + "\" does not match URL \"" + pathname + "\"";
  } else if (status === 404) {
    statusText = "Not Found";
    errorMessage = "No route matches URL \"" + pathname + "\"";
  } else if (status === 405) {
    statusText = "Method Not Allowed";
    if (method && pathname && routeId) {
      errorMessage = "You made a " + method.toUpperCase() + " request to \"" + pathname + "\" but " + ("did not provide an `action` for route \"" + routeId + "\", ") + "so there is no way to handle the request.";
    } else if (method) {
      errorMessage = "Invalid request method \"" + method.toUpperCase() + "\"";
    }
  }
  return new ErrorResponse(status || 500, statusText, new Error(errorMessage), true);
}
// Find any returned redirect errors, starting from the lowest match
function findRedirect(results) {
  for (let i = results.length - 1; i >= 0; i--) {
    let result = results[i];
    if (isRedirectResult(result)) {
      return {
        result,
        idx: i
      };
    }
  }
}
function stripHashFromPath(path) {
  let parsedPath = typeof path === "string" ? parsePath(path) : path;
  return createPath(_extends({}, parsedPath, {
    hash: ""
  }));
}
function isHashChangeOnly(a, b) {
  if (a.pathname !== b.pathname || a.search !== b.search) {
    return false;
  }
  if (a.hash === "") {
    // /page -> /page#hash
    return b.hash !== "";
  } else if (a.hash === b.hash) {
    // /page#hash -> /page#hash
    return true;
  } else if (b.hash !== "") {
    // /page#hash -> /page#other
    return true;
  }
  // If the hash is removed the browser will re-perform a request to the server
  // /page#hash -> /page
  return false;
}
function isDeferredResult(result) {
  return result.type === ResultType.deferred;
}
function isErrorResult(result) {
  return result.type === ResultType.error;
}
function isRedirectResult(result) {
  return (result && result.type) === ResultType.redirect;
}
function isDeferredData(value) {
  let deferred = value;
  return deferred && typeof deferred === "object" && typeof deferred.data === "object" && typeof deferred.subscribe === "function" && typeof deferred.cancel === "function" && typeof deferred.resolveData === "function";
}
function isResponse(value) {
  return value != null && typeof value.status === "number" && typeof value.statusText === "string" && typeof value.headers === "object" && typeof value.body !== "undefined";
}
function isRedirectResponse(result) {
  if (!isResponse(result)) {
    return false;
  }
  let status = result.status;
  let location = result.headers.get("Location");
  return status >= 300 && status <= 399 && location != null;
}
function isQueryRouteResponse(obj) {
  return obj && isResponse(obj.response) && (obj.type === ResultType.data || obj.type === ResultType.error);
}
function isValidMethod(method) {
  return validRequestMethods.has(method.toLowerCase());
}
function isMutationMethod(method) {
  return validMutationMethods.has(method.toLowerCase());
}
async function resolveDeferredResults(currentMatches, matchesToLoad, results, signals, isFetcher, currentLoaderData) {
  for (let index = 0; index < results.length; index++) {
    let result = results[index];
    let match = matchesToLoad[index];
    // If we don't have a match, then we can have a deferred result to do
    // anything with.  This is for revalidating fetchers where the route was
    // removed during HMR
    if (!match) {
      continue;
    }
    let currentMatch = currentMatches.find(m => m.route.id === match.route.id);
    let isRevalidatingLoader = currentMatch != null && !isNewRouteInstance(currentMatch, match) && (currentLoaderData && currentLoaderData[match.route.id]) !== undefined;
    if (isDeferredResult(result) && (isFetcher || isRevalidatingLoader)) {
      // Note: we do not have to touch activeDeferreds here since we race them
      // against the signal in resolveDeferredData and they'll get aborted
      // there if needed
      let signal = signals[index];
      invariant(signal, "Expected an AbortSignal for revalidating fetcher deferred result");
      await resolveDeferredData(result, signal, isFetcher).then(result => {
        if (result) {
          results[index] = result || results[index];
        }
      });
    }
  }
}
async function resolveDeferredData(result, signal, unwrap) {
  if (unwrap === void 0) {
    unwrap = false;
  }
  let aborted = await result.deferredData.resolveData(signal);
  if (aborted) {
    return;
  }
  if (unwrap) {
    try {
      return {
        type: ResultType.data,
        data: result.deferredData.unwrappedData
      };
    } catch (e) {
      // Handle any TrackedPromise._error values encountered while unwrapping
      return {
        type: ResultType.error,
        error: e
      };
    }
  }
  return {
    type: ResultType.data,
    data: result.deferredData.data
  };
}
function hasNakedIndexQuery(search) {
  return new URLSearchParams(search).getAll("index").some(v => v === "");
}
// Note: This should match the format exported by useMatches, so if you change
// this please also change that :)  Eventually we'll DRY this up
function createUseMatchesMatch(match, loaderData) {
  let {
    route,
    pathname,
    params
  } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    handle: route.handle
  };
}
function getTargetMatch(matches, location) {
  let search = typeof location === "string" ? parsePath(location).search : location.search;
  if (matches[matches.length - 1].route.index && hasNakedIndexQuery(search || "")) {
    // Return the leaf index route when index is present
    return matches[matches.length - 1];
  }
  // Otherwise grab the deepest "path contributing" match (ignoring index and
  // pathless layout routes)
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches[pathMatches.length - 1];
}
function getSubmissionFromNavigation(navigation) {
  let {
    formMethod,
    formAction,
    formEncType,
    text,
    formData,
    json
  } = navigation;
  if (!formMethod || !formAction || !formEncType) {
    return;
  }
  if (text != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: undefined,
      json: undefined,
      text
    };
  } else if (formData != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData,
      json: undefined,
      text: undefined
    };
  } else if (json !== undefined) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: undefined,
      json,
      text: undefined
    };
  }
}
function getLoadingNavigation(location, submission) {
  if (submission) {
    let navigation = {
      state: "loading",
      location,
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text
    };
    return navigation;
  } else {
    let navigation = {
      state: "loading",
      location,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined
    };
    return navigation;
  }
}
function getSubmittingNavigation(location, submission) {
  let navigation = {
    state: "submitting",
    location,
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text
  };
  return navigation;
}
function getLoadingFetcher(submission, data) {
  if (submission) {
    let fetcher = {
      state: "loading",
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text,
      data,
      " _hasFetcherDoneAnything ": true
    };
    return fetcher;
  } else {
    let fetcher = {
      state: "loading",
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined,
      data,
      " _hasFetcherDoneAnything ": true
    };
    return fetcher;
  }
}
function getSubmittingFetcher(submission, existingFetcher) {
  let fetcher = {
    state: "submitting",
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text,
    data: existingFetcher ? existingFetcher.data : undefined,
    " _hasFetcherDoneAnything ": true
  };
  return fetcher;
}
function getDoneFetcher(data) {
  let fetcher = {
    state: "idle",
    formMethod: undefined,
    formAction: undefined,
    formEncType: undefined,
    formData: undefined,
    json: undefined,
    text: undefined,
    data,
    " _hasFetcherDoneAnything ": true
  };
  return fetcher;
}
//#endregion


//# sourceMappingURL=router.js.map


/***/ }),

/***/ "./images/cap-icon.svg":
/*!*****************************!*\
  !*** ./images/cap-icon.svg ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgCapIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgCapIcon = function SvgCapIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 19,
    height: 19,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M18.252 7.129a.533.533 0 0 1-.014.158l-1.172 4.688a.533.533 0 0 1-.514.404l-7.031.035H2.486a.533.533 0 0 1-.517-.404L.797 7.304a.532.532 0 0 1-.014-.162 1.12 1.12 0 1 1 1.454-1.067c0 .347-.159.658-.408.863l1.467 1.479c.371.373.886.588 1.412.588a2 2 0 0 0 1.59-.791l2.411-3.195a1.12 1.12 0 1 1 1.91-.79c0 .298-.12.57-.311.77 0 .002.001.002.002.003l2.394 3.204c.373.5.97.799 1.593.799.532 0 1.031-.207 1.407-.583l1.476-1.476a1.117 1.117 0 0 1 .701-1.99A1.12 1.12 0 0 1 19 6.075c0 .486-.313.9-.748 1.054Zm-1.3 6.954a.533.533 0 0 0-.533-.533H2.64a.533.533 0 0 0-.532.533v1.279c0 .294.239.532.533.532h13.78a.533.533 0 0 0 .532-.532v-1.279Z",
    fill: "#fff"
  })));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAxOSAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjI1MjQgNy4xMjg4NUMxOC4yNTUzIDcuMTgxMTMgMTguMjUxNSA3LjIzNDMzIDE4LjIzODQgNy4yODcxN0wxNy4wNjY0IDExLjk3NUMxNy4wMDczIDEyLjIxMTIgMTYuNzk1NiAxMi4zNzczIDE2LjU1MjMgMTIuMzc4NUw5LjUyMDUzIDEyLjQxNEM5LjUxOTYgMTIuNDE0IDkuNTE4NzUgMTIuNDE0IDkuNTE3ODMgMTIuNDE0SDIuNDg1OThDMi4yNDEzNiAxMi40MTQgMi4wMjgyMSAxMi4yNDc0IDEuOTY5MTEgMTIuMDFMMC43OTcxNDggNy4zMDQ0M0MwLjc4MzY1MiA3LjI1MDE3IDAuNzc5NzQ2IDcuMTk1NDggMC43ODMxNTUgNy4xNDE4NUMwLjMyOTc4MyA2Ljk5OTAxIDAgNi41NzQ3NiAwIDYuMDc0OEMwIDUuNDU3OTIgMC41MDE4MTMgNC45NTYxIDEuMTE4NjkgNC45NTYxQzEuNzM1NTcgNC45NTYxIDIuMjM3MzggNS40NTc5MiAyLjIzNzM4IDYuMDc0OEMyLjIzNzM4IDYuNDIyMTkgMi4wNzgyMSA2LjczMzAxIDEuODI4OTcgNi45MzgzNUwzLjI5NjI3IDguNDE2NzNDMy42NjcxMSA4Ljc5MDQxIDQuMTgxNyA5LjAwNDYzIDQuNzA4MTYgOS4wMDQ2M0M1LjMzMDY1IDkuMDA0NjMgNS45MjQxNiA4LjcwOTAxIDYuMjk3OTEgOC4yMTM3M0w4LjcwOTMyIDUuMDE4NjFDOC41MDY3NCA0LjgxNjE4IDguMzgxMzEgNC41MzY0NyA4LjM4MTMxIDQuMjI4MDdDOC4zODEzMSAzLjYxMTE5IDguODgzMTIgMy4xMDkzOCA5LjUgMy4xMDkzOEMxMC4xMTY5IDMuMTA5MzggMTAuNjE4NyAzLjYxMTE5IDEwLjYxODcgNC4yMjgwN0MxMC42MTg3IDQuNTI3MjQgMTAuNDk5OSA0Ljc5ODc4IDEwLjMwNzkgNC45OTk3MkMxMC4zMDg2IDUuMDAwNTcgMTAuMzA5NCA1LjAwMTI4IDEwLjMxIDUuMDAyMkwxMi43MDM5IDguMjA2MTNDMTMuMDc3NSA4LjcwNjE3IDEzLjY3MzIgOS4wMDQ3IDE0LjI5NzQgOS4wMDQ3QzE0LjgyODcgOS4wMDQ3IDE1LjMyODMgOC43OTc4IDE1LjcwNCA4LjQyMjA2TDE3LjE4MDUgNi45NDU1M0MxNi45MjYxIDYuNzQwMjYgMTYuNzYyNiA2LjQyNjQ2IDE2Ljc2MjYgNi4wNzQ4QzE2Ljc2MjYgNS40NTc5MiAxNy4yNjQ0IDQuOTU2MSAxNy44ODEzIDQuOTU2MUMxOC40OTgyIDQuOTU2MSAxOSA1LjQ1NzkyIDE5IDYuMDc0OEMxOSA2LjU2MTQxIDE4LjY4NzEgNi45NzUyOSAxOC4yNTI0IDcuMTI4ODVaTTE2Ljk1MiAxNC4wODMyQzE2Ljk1MiAxMy43ODkgMTYuNzEzNSAxMy41NTA1IDE2LjQxOTMgMTMuNTUwNUgyLjYzOTlDMi4zNDU3IDEzLjU1MDUgMi4xMDcxOSAxMy43ODkgMi4xMDcxOSAxNC4wODMyVjE1LjM2MTdDMi4xMDcxOSAxNS42NTU5IDIuMzQ1NyAxNS44OTQ0IDIuNjM5OSAxNS44OTQ0SDE2LjQxOTNDMTYuNzEzNSAxNS44OTQ0IDE2Ljk1MiAxNS42NTU5IDE2Ljk1MiAxNS4zNjE3VjE0LjA4MzJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K");

/***/ }),

/***/ "./images/dashboard-icon.svg":
/*!***********************************!*\
  !*** ./images/dashboard-icon.svg ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgDashboardIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _rect, _rect2, _rect3, _rect4;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgDashboardIcon = function SvgDashboardIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 19,
    height: 19,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _rect || (_rect = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    width: 8,
    height: 8,
    rx: 2,
    fill: "#073B4C"
  })), _rect2 || (_rect2 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    x: 11,
    width: 8,
    height: 8,
    rx: 4,
    fill: "#073B4C"
  })), _rect3 || (_rect3 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    y: 11,
    width: 8,
    height: 8,
    rx: 2,
    fill: "#073B4C"
  })), _rect4 || (_rect4 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
    x: 11,
    y: 11,
    width: 8,
    height: 8,
    rx: 2,
    fill: "#073B4C"
  })));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAxOSAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjIiIGZpbGw9IiMwNzNCNEMiLz4KPHJlY3QgeD0iMTEiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjMDczQjRDIi8+CjxyZWN0IHk9IjExIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0iIzA3M0I0QyIvPgo8cmVjdCB4PSIxMSIgeT0iMTEiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIyIiBmaWxsPSIjMDczQjRDIi8+Cjwvc3ZnPgo=");

/***/ }),

/***/ "./images/help-icon.svg":
/*!******************************!*\
  !*** ./images/help-icon.svg ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgHelpIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _g, _defs;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgHelpIcon = function SvgHelpIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 22,
    height: 18,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _g || (_g = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    clipPath: "url(#help-icon_svg__a)"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M22 10.2c-.127-2.723-1.34-5.294-3.387-7.178-2.047-1.885-4.77-2.936-7.602-2.936-2.832 0-5.555 1.051-7.602 2.936C1.362 4.906.149 7.477.022 10.2v6.21c0 .421.174.825.483 1.123.31.298.73.465 1.167.465h1.402a3.615 3.615 0 0 0 2.496-1.007 3.348 3.348 0 0 0 1.03-2.408v-.971c0-.448-.092-.892-.27-1.306a3.406 3.406 0 0 0-.77-1.108 3.558 3.558 0 0 0-1.15-.74 3.664 3.664 0 0 0-1.358-.258H2.2c.113-2.17 1.088-4.216 2.724-5.714a8.986 8.986 0 0 1 6.065-2.333c2.258 0 4.43.835 6.065 2.333 1.636 1.498 2.611 3.543 2.724 5.714h-.83c-.466 0-.928.087-1.358.259-.43.171-.821.422-1.15.74-.33.316-.592.692-.77 1.107a3.3 3.3 0 0 0-.27 1.306v.971c0 .449.091.893.27 1.308.177.414.439.79.768 1.108.33.317.72.568 1.152.74.43.171.892.26 1.358.259h1.402c.438 0 .857-.167 1.167-.465.31-.298.483-.702.483-1.123V10.2ZM4.4 13.614v.971c0 .344-.143.674-.396.917-.252.243-.594.38-.952.38H2.2v-3.563h.852c.357 0 .7.137.952.38.253.242.395.571.396.915Zm15.4 2.268h-.852c-.358 0-.7-.137-.953-.38a1.276 1.276 0 0 1-.395-.917v-.971c0-.344.143-.673.396-.916.252-.242.595-.379.952-.379h.852v3.563Z",
    fill: "#fff"
  }))), _defs || (_defs = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("clipPath", {
    id: "help-icon_svg__a"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    fill: "#fff",
    d: "M0 0h22v18H0z"
  })))));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyMiAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzg3NF8zNzk2KSI+CjxwYXRoIGQ9Ik0yMiAxMC4yMDA4QzIxLjg3MzMgNy40NzcyOCAyMC42NjAyIDQuOTA1NzYgMTguNjEzMyAzLjAyMTYyQzE2LjU2NjMgMS4xMzc0OCAxMy44NDMyIDAuMDg1OTM3NSAxMS4wMTEgMC4wODU5Mzc1QzguMTc4NzQgMC4wODU5Mzc1IDUuNDU1NjQgMS4xMzc0OCAzLjQwODY3IDMuMDIxNjJDMS4zNjE2OSA0LjkwNTc2IDAuMTQ4NjAyIDcuNDc3MjggMC4wMjE5NzI3IDEwLjIwMDhWMTYuNDEwOEMwLjAyMTk3MjcgMTYuODMyIDAuMTk1ODExIDE3LjIzNiAwLjUwNTI0NiAxNy41MzM4QzAuODE0NjgxIDE3LjgzMTcgMS4yMzQzNyAxNy45OTkgMS42NzE5NyAxNy45OTlIMy4wNzQ0N0M0LjAxMTc0IDE3Ljk5NDEgNC45MDg4MyAxNy42MzIxIDUuNTY5NTIgMTYuOTkyMkM2LjIzMDIxIDE2LjM1MjIgNi42MDA3MSAxNS40ODY1IDYuNTk5OTcgMTQuNTg0M1YxMy42MTI4QzYuNTk5OTcgMTMuMTY0NSA2LjUwODE5IDEyLjcyMDYgNi4zMjk4OCAxMi4zMDY1QzYuMTUxNTcgMTEuODkyMyA1Ljg5MDIyIDExLjUxNjEgNS41NjA3NyAxMS4xOTkyQzUuMjMxMzIgMTAuODgyMyA0Ljg0MDIyIDEwLjYzMTEgNC40MDk4MyAxMC40NTk3QzMuOTc5NDUgMTAuMjg4NCAzLjUxODIxIDEwLjIwMDQgMy4wNTI0NyAxMC4yMDA4SDIuMTk5OTdDMi4zMTI4MiA4LjAzMDI1IDMuMjg4MDUgNS45ODQ1MSA0LjkyMzk0IDQuNDg2NjlDNi41NTk4MyAyLjk4ODg3IDguNzMxMjIgMi4xNTM1OCAxMC45ODkgMi4xNTM1OEMxMy4yNDY3IDIuMTUzNTggMTUuNDE4MSAyLjk4ODg3IDE3LjA1NCA0LjQ4NjY5QzE4LjY4OTkgNS45ODQ1MSAxOS42NjUxIDguMDMwMjUgMTkuNzc4IDEwLjIwMDhIMTguOTQ3NUMxOC40ODE3IDEwLjIwMDQgMTguMDIwNSAxMC4yODg0IDE3LjU5MDEgMTAuNDU5N0MxNy4xNTk3IDEwLjYzMTEgMTYuNzY4NiAxMC44ODIzIDE2LjQzOTIgMTEuMTk5MkMxNi4xMDk3IDExLjUxNjEgMTUuODQ4NCAxMS44OTIzIDE1LjY3MDEgMTIuMzA2NUMxNS40OTE3IDEyLjcyMDYgMTUuNCAxMy4xNjQ1IDE1LjQgMTMuNjEyOFYxNC41ODQzQzE1LjM5OTYgMTUuMDMyOCAxNS40OTExIDE1LjQ3NyAxNS42NjkzIDE1Ljg5MTVDMTUuODQ3NCAxNi4zMDU5IDE2LjEwODcgMTYuNjgyNSAxNi40MzgyIDE2Ljk5OTZDMTYuNzY3NyAxNy4zMTY4IDE3LjE1ODkgMTcuNTY4MyAxNy41ODk1IDE3LjczOThDMTguMDIgMTcuOTExMyAxOC40ODE1IDE3Ljk5OTQgMTguOTQ3NSAxNy45OTlIMjAuMzVDMjAuNzg3NiAxNy45OTkgMjEuMjA3MyAxNy44MzE3IDIxLjUxNjcgMTcuNTMzOEMyMS44MjYxIDE3LjIzNiAyMiAxNi44MzIgMjIgMTYuNDEwOFYxMC4yMDA4Wk00LjM5OTk3IDEzLjYxMjhWMTQuNTg0M0M0LjM5OTI1IDE0LjkyODEgNC4yNTcwNCAxNS4yNTc2IDQuMDA0NSAxNS41MDA3QzMuNzUxOTUgMTUuNzQzOCAzLjQwOTYzIDE1Ljg4MDcgMy4wNTI0NyAxNS44ODE0SDIuMTk5OTdWMTIuMzE4NEgzLjA1MjQ3QzMuNDA5MzggMTIuMzE4NCAzLjc1MTcgMTIuNDU0NyA0LjAwNDMzIDEyLjY5NzRDNC4yNTY5NSAxMi45NDAxIDQuMzk5MjQgMTMuMjY5MyA0LjM5OTk3IDEzLjYxMjhaTTE5LjggMTUuODgxNEgxOC45NDc1QzE4LjU5MDMgMTUuODgwNyAxOC4yNDggMTUuNzQzOCAxNy45OTU0IDE1LjUwMDdDMTcuNzQyOSAxNS4yNTc2IDE3LjYwMDcgMTQuOTI4MSAxNy42IDE0LjU4NDNWMTMuNjEyOEMxNy42MDA3IDEzLjI2OTMgMTcuNzQzIDEyLjk0MDEgMTcuOTk1NiAxMi42OTc0QzE4LjI0ODIgMTIuNDU0NyAxOC41OTA2IDEyLjMxODQgMTguOTQ3NSAxMi4zMTg0SDE5LjhWMTUuODgxNFoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfODc0XzM3OTYiPgo8cmVjdCB3aWR0aD0iMjIiIGhlaWdodD0iMTgiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==");

/***/ }),

/***/ "./images/logo.svg":
/*!*************************!*\
  !*** ./images/logo.svg ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgLogo; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _path, _path2, _path3, _g;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgLogo = function SvgLogo(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1505.35 234.36",
    style: {
      enableBackground: "new 0 0 1505.35 234.36"
    },
    xmlSpace: "preserve"
  }, props), _path || (_path = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    fill: "#1D9BFF",
    d: "M59.63 117.33H0c0 43.77 24.04 81.9 59.63 101.98 16.44 9.27 35.33 14.68 55.47 15.01V117.33H59.63z"
  })), _path2 || (_path2 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    fill: "#0875FF",
    d: "M115.09 56.62H59.63v60.71h55.47v116.98c.65.01 1.29.05 1.94.05 20.92 0 40.55-5.52 57.55-15.14V56.62h-59.5z"
  })), _path3 || (_path3 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    fill: "#1B49F6",
    d: "M119.26 0v56.62h55.32v162.6c35.5-20.1 59.48-58.18 59.48-101.89V0h-114.8z"
  })), _g || (_g = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    fill: "#102F50"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M384.04 123.85a58.957 58.957 0 0 0-14.34-8.54c-6.21-2.61-12.66-4.61-19.26-6-4.48-.86-8.88-2.08-13.17-3.62-3.15-1.09-6.1-2.67-8.75-4.68-2.05-1.63-3.7-3.72-4.81-6.09-1.07-2.39-1.6-4.97-1.57-7.58a15.93 15.93 0 0 1 3.24-9.92c2.34-2.95 5.43-5.21 8.94-6.57 4.26-1.65 8.8-2.46 13.36-2.36 4.3-.03 8.56.74 12.58 2.25 3.98 1.54 7.64 3.8 10.8 6.68 3.47 3.2 6.44 6.89 8.85 10.94l14.92-14.73a45.624 45.624 0 0 0-11.4-13.26 47.908 47.908 0 0 0-15.7-8.15c-6.3-1.9-12.87-2.82-19.45-2.74-6.33-.05-12.63.9-18.66 2.84a46.947 46.947 0 0 0-15.04 8.06 38.404 38.404 0 0 0-10.01 12.28 33.08 33.08 0 0 0-3.64 15.32c-.07 5.19.79 10.36 2.56 15.24 1.71 4.54 4.37 8.66 7.81 12.09 3.85 3.74 8.35 6.74 13.28 8.85a86.894 86.894 0 0 0 18.46 5.69c3.99.68 7.93 1.63 11.79 2.86 3.11.98 6.1 2.25 8.94 3.82 2.3 1.26 4.39 2.84 6.24 4.68 1.59 1.64 2.81 3.57 3.62 5.7.8 2.14 1.2 4.4 1.18 6.69.01 3.45-1.25 6.79-3.54 9.37a23.238 23.238 0 0 1-9.62 6.48 36.94 36.94 0 0 1-13.56 2.36c-7.35.2-14.63-1.63-21.02-5.29-5.88-3.54-12.04-9.9-18.46-19.06l-14.54 16.69a64.932 64.932 0 0 0 13.86 14.84c5.17 4 11.03 7.02 17.28 8.93a69.291 69.291 0 0 0 20.73 2.95 62.98 62.98 0 0 0 26.7-5.21c7.09-3.14 13.11-8.3 17.29-14.82a41.69 41.69 0 0 0 6.09-22.8c.01-4.57-1.06-9.08-3.12-13.16a34.01 34.01 0 0 0-8.86-11.03zM453.98 59.4h-20.24v26.34h-21.42v19.65h21.42v83.49h20.24v-83.49h23.97V85.74h-23.97V59.4zM568.61 90.55a55.33 55.33 0 0 0-26.91-6.98c-9.42 0-18.68 2.4-26.92 6.98a50.89 50.89 0 0 0-18.75 19.06 58.909 58.909 0 0 0 0 55.22 50.862 50.862 0 0 0 18.75 19.05c8.24 4.58 17.5 6.99 26.92 6.99 9.42 0 18.68-2.41 26.91-6.99a50.79 50.79 0 0 0 18.75-19.05c4.52-8.51 6.89-17.98 6.89-27.61s-2.37-19.11-6.89-27.61a50.817 50.817 0 0 0-18.75-19.06zm1.08 64.63c-2.6 5.14-6.52 9.49-11.38 12.59a30.046 30.046 0 0 1-16.51 4.68c-5.87.06-11.63-1.57-16.6-4.68a31.842 31.842 0 0 1-11.5-12.59 43.207 43.207 0 0 1-3.92-17.97c0-6.19 1.34-12.32 3.92-17.96 2.62-5.16 6.6-9.51 11.5-12.59 5-3 10.71-4.59 16.55-4.61 5.83-.01 11.55 1.55 16.57 4.52 4.87 3.04 8.81 7.36 11.38 12.49a37.41 37.41 0 0 1 3.94 18.18c.21 6.23-1.14 12.39-3.95 17.94zM668.18 83.52c-4.9.02-9.73 1.24-14.05 3.55-4.59 2.4-8.66 5.66-12 9.62a36.938 36.938 0 0 0-5.41 8.34V85.69h-20.47v103.08h20.43v-56.83c-.04-3.61.7-7.21 2.17-10.51 1.4-3.15 3.37-6.01 5.8-8.44 2.42-2.43 5.29-4.37 8.44-5.7 3.2-1.38 6.65-2.08 10.13-2.07 1.88.01 3.76.24 5.59.69 1.78.43 3.52.99 5.2 1.67l5.31-22.01c-1.55-.62-3.16-1.09-4.81-1.37-2.08-.43-4.2-.65-6.33-.68zM771.17 97.72a46.867 46.867 0 0 0-15.02-10.51 45.8 45.8 0 0 0-18.75-3.82c-7.24-.07-14.43 1.3-21.14 4.03-6.3 2.57-12 6.45-16.69 11.38a53.53 53.53 0 0 0-10.94 17.4 60.26 60.26 0 0 0-3.92 22.2c-.2 9.5 2.21 18.88 6.96 27.12a50.116 50.116 0 0 0 19.27 18.57 57.32 57.32 0 0 0 28.1 6.77c5.02-.02 10.01-.72 14.84-2.06 4.96-1.36 9.77-3.24 14.34-5.61 4.22-2.15 8.1-4.93 11.49-8.25l-10.21-14.35c-4.19 3.87-9 7-14.25 9.24-4.54 1.73-9.38 2.6-14.24 2.54a40.31 40.31 0 0 1-19.07-4.32c-5.37-2.75-9.8-7.02-12.76-12.28a35.164 35.164 0 0 1-4.25-13.65h78.9l.19-8.64a52.75 52.75 0 0 0-3.23-19.94 45.893 45.893 0 0 0-9.62-15.82zm-51.53 8.36a36.286 36.286 0 0 1 17.88-4.03c4.25-.04 8.44.93 12.25 2.84 3.8 1.9 7.09 4.67 9.62 8.1 2.47 3.39 3.97 7.39 4.32 11.58v1.39h-57.7a33.97 33.97 0 0 1 2.69-8.16c2.31-4.95 6.13-9.06 10.91-11.72h.03zM936.01 119.13c-.2-2.1-.35-3.85-.5-5.3h-63.65v24.55h35.28c-.08 3.34-.9 6.63-2.4 9.63-1.67 3.3-4.02 6.22-6.89 8.56a32.25 32.25 0 0 1-10.22 5.59c-4.03 1.34-8.25 2-12.49 1.96-5.93.05-11.81-1.12-17.27-3.43a44.22 44.22 0 0 1-19.67-16.41 44.267 44.267 0 0 1-7.26-24.56 46.553 46.553 0 0 1 3.25-17.49 41.29 41.29 0 0 1 9.14-13.95c3.92-3.92 8.56-7.05 13.65-9.23 5.38-2.26 11.17-3.4 16.99-3.34 4.3 0 8.57.63 12.67 1.88 4.11 1.24 8.05 3.02 11.69 5.3a64.31 64.31 0 0 1 10.6 8.35l18.28-19.26a55.652 55.652 0 0 0-13.76-11.78 74.814 74.814 0 0 0-39.28-11.01 78.65 78.65 0 0 0-29.29 5.31 71.044 71.044 0 0 0-23.26 14.82 66.195 66.195 0 0 0-15.33 22.4 71.7 71.7 0 0 0-5.4 28 74.77 74.77 0 0 0 5.2 28.12 66.49 66.49 0 0 0 14.83 22.58 68.564 68.564 0 0 0 22.88 15.05 76.695 76.695 0 0 0 29.18 5.4c8.58.07 17.1-1.42 25.14-4.42a60.536 60.536 0 0 0 20.15-12.49 57.49 57.49 0 0 0 13.35-19.26c3.27-7.77 4.9-16.12 4.82-24.55 0-1.18 0-2.78-.09-4.83-.09-2.05-.15-4.09-.34-6.19zM1017.06 82.79c-5.24 0-10.41 1.28-15.05 3.73a39.405 39.405 0 0 0-12.49 10.32c-1.26 1.56-2.4 3.21-3.42 4.93l-.5-16.82h-26.91v103.92h28.12v-53.82a23.8 23.8 0 0 1 1.67-9.03c1.07-2.68 2.67-5.12 4.68-7.19 1.97-2.03 4.34-3.61 6.96-4.68 2.78-1.12 5.75-1.69 8.76-1.66 2.35 0 4.69.29 6.98.88 1.93.46 3.81 1.15 5.59 2.06l7.47-30.64c-1.72-.6-3.5-1.06-5.3-1.38-2.16-.4-4.35-.61-6.56-.62zM1116.96 89.77c-8.72-4.59-18.44-6.98-28.29-6.98s-19.57 2.39-28.29 6.98a51.41 51.41 0 0 0-19.65 19.15 57.914 57.914 0 0 0-7.18 27.9c0 9.75 2.47 19.36 7.18 27.91a51.67 51.67 0 0 0 19.65 19.14c8.72 4.59 18.44 6.98 28.29 6.98s19.57-2.39 28.29-6.98a51.08 51.08 0 0 0 19.56-19.14c4.63-8.58 7.05-18.17 7.05-27.91s-2.42-19.33-7.05-27.9a50.964 50.964 0 0 0-19.56-19.15zm-4.93 62.28a26.143 26.143 0 0 1-9.52 10.61 25.369 25.369 0 0 1-13.75 3.83c-4.91.08-9.75-1.25-13.94-3.83a26.99 26.99 0 0 1-9.64-10.61 36.816 36.816 0 0 1-3.33-15.28c0-5.28 1.14-10.48 3.33-15.28 2.23-4.31 5.56-7.97 9.64-10.6a26.46 26.46 0 0 1 13.82-3.95c4.89-.01 9.69 1.32 13.87 3.85a26.18 26.18 0 0 1 9.52 10.6 31.86 31.86 0 0 1 3.25 15.41c.21 5.29-.91 10.52-3.25 15.25zM1257.36 149.08l-21.63-49.19h-16.51l-20.94 49.47-19.32-64.6-29.09.21 34.78 103.92h20.05l22.49-55.13 22.88 55.13h20.24l35.36-103.92h-29.07l-19.24 64.11zM1370.31 58.62h-27.91v26.34h-19.44v24.94h19.44v78.99h27.91V109.9h21.42V84.96h-21.42V58.62zM1501.23 101.75a29.002 29.002 0 0 0-11.98-14.24 38.17 38.17 0 0 0-19.74-4.68 39.917 39.917 0 0 0-16.5 3.53 42.821 42.821 0 0 0-13.45 9.37c-.81.84-1.56 1.7-2.26 2.58V43.49h-27.5v145.4h27.89v-62.47c-.01-2.65.56-5.27 1.67-7.68a21.14 21.14 0 0 1 4.52-6.24c1.97-1.88 4.32-3.32 6.89-4.24 2.8-1 5.75-1.5 8.73-1.46 3.43-.25 6.85.44 9.93 1.96 2.74 1.52 4.86 3.96 5.98 6.88 1.42 3.76 2.09 7.76 1.97 11.78v61.51h27.97v-63.7c.2-8.03-1.2-16.01-4.12-23.48z"
  }))));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNi4wLjMsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAxNTA1LjM1IDIzNC4zNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTUwNS4zNSAyMzQuMzY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjMUQ5QkZGIiBkPSJNNTkuNjMsMTE3LjMzSDBjMCw0My43NywyNC4wNCw4MS45LDU5LjYzLDEwMS45OGMxNi40NCw5LjI3LDM1LjMzLDE0LjY4LDU1LjQ3LDE1LjAxVjExNy4zM0g1OS42M3oiLz4NCgkJPHBhdGggZmlsbD0iIzA4NzVGRiIgZD0iTTExNS4wOSw1Ni42Mkg1OS42M3Y2MC43MWg1NS40N3YxMTYuOThjMC42NSwwLjAxLDEuMjksMC4wNSwxLjk0LDAuMDVjMjAuOTIsMCw0MC41NS01LjUyLDU3LjU1LTE1LjE0DQoJCQlWMTE3LjMzVjU2LjYySDExNS4wOXoiLz4NCgkJPHBhdGggZmlsbD0iIzFCNDlGNiIgZD0iTTExOS4yNiwwdjU2LjYyaDU1LjMydjYwLjcxdjEwMS44OWMzNS41LTIwLjEsNTkuNDgtNTguMTgsNTkuNDgtMTAxLjg5VjBIMTE5LjI2eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBmaWxsPSIjMTAyRjUwIiBkPSJNMzg0LjA0LDEyMy44NWMtNC4zNS0zLjUxLTkuMTgtNi4zOS0xNC4zNC04LjU0Yy02LjIxLTIuNjEtMTIuNjYtNC42MS0xOS4yNi02DQoJCQkJYy00LjQ4LTAuODYtOC44OC0yLjA4LTEzLjE3LTMuNjJjLTMuMTUtMS4wOS02LjEtMi42Ny04Ljc1LTQuNjhjLTIuMDUtMS42My0zLjctMy43Mi00LjgxLTYuMDljLTEuMDctMi4zOS0xLjYtNC45Ny0xLjU3LTcuNTgNCgkJCQljLTAuMDYtMy41NywxLjA3LTcuMDcsMy4yNC05LjkyYzIuMzQtMi45NSw1LjQzLTUuMjEsOC45NC02LjU3YzQuMjYtMS42NSw4LjgtMi40NiwxMy4zNi0yLjM2YzQuMy0wLjAzLDguNTYsMC43NCwxMi41OCwyLjI1DQoJCQkJYzMuOTgsMS41NCw3LjY0LDMuOCwxMC44LDYuNjhjMy40NywzLjIsNi40NCw2Ljg5LDguODUsMTAuOTRsMTQuOTItMTQuNzNjLTIuOTEtNS4xMS02Ljc4LTkuNjItMTEuNC0xMy4yNg0KCQkJCWMtNC42OC0zLjY3LTEwLjAxLTYuNDMtMTUuNy04LjE1Yy02LjMtMS45LTEyLjg3LTIuODItMTkuNDUtMi43NGMtNi4zMy0wLjA1LTEyLjYzLDAuOS0xOC42NiwyLjg0DQoJCQkJYy01LjQ2LDEuNzQtMTAuNTYsNC40OC0xNS4wNCw4LjA2Yy00LjE1LDMuMzUtNy41Niw3LjUzLTEwLjAxLDEyLjI4Yy0yLjQzLDQuNzUtMy42OCwxMC0zLjY0LDE1LjMyDQoJCQkJYy0wLjA3LDUuMTksMC43OSwxMC4zNiwyLjU2LDE1LjI0YzEuNzEsNC41NCw0LjM3LDguNjYsNy44MSwxMi4wOWMzLjg1LDMuNzQsOC4zNSw2Ljc0LDEzLjI4LDguODUNCgkJCQljNS45MiwyLjU4LDEyLjExLDQuNDgsMTguNDYsNS42OWMzLjk5LDAuNjgsNy45MywxLjYzLDExLjc5LDIuODZjMy4xMSwwLjk4LDYuMSwyLjI1LDguOTQsMy44MmMyLjMsMS4yNiw0LjM5LDIuODQsNi4yNCw0LjY4DQoJCQkJYzEuNTksMS42NCwyLjgxLDMuNTcsMy42Miw1LjdjMC44LDIuMTQsMS4yLDQuNCwxLjE4LDYuNjljMC4wMSwzLjQ1LTEuMjUsNi43OS0zLjU0LDkuMzdjLTIuNjEsMi45NC01LjkyLDUuMTctOS42Miw2LjQ4DQoJCQkJYy00LjM0LDEuNjMtOC45MywyLjQzLTEzLjU2LDIuMzZjLTcuMzUsMC4yLTE0LjYzLTEuNjMtMjEuMDItNS4yOWMtNS44OC0zLjU0LTEyLjA0LTkuOS0xOC40Ni0xOS4wNmwtMTQuNTQsMTYuNjkNCgkJCQljMy44MSw1LjY0LDguNDksMTAuNjUsMTMuODYsMTQuODRjNS4xNyw0LDExLjAzLDcuMDIsMTcuMjgsOC45M2M2LjcyLDIuMDMsMTMuNzEsMy4wMiwyMC43MywyLjk1DQoJCQkJYzkuMTcsMC4yMywxOC4yOS0xLjU1LDI2LjctNS4yMWM3LjA5LTMuMTQsMTMuMTEtOC4zLDE3LjI5LTE0LjgyYzQuMTktNi44NSw2LjI5LTE0Ljc3LDYuMDktMjIuOA0KCQkJCWMwLjAxLTQuNTctMS4wNi05LjA4LTMuMTItMTMuMTZDMzkwLjc1LDEzMC42MiwzODcuNzMsMTI2Ljg2LDM4NC4wNCwxMjMuODV6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjMTAyRjUwIiBkPSJNNDUzLjk4LDU5LjRoLTIwLjI0djI2LjM0aC0yMS40MnYxOS42NWgyMS40MnY4My40OWgyMC4yNHYtODMuNDloMjMuOTdWODUuNzRoLTIzLjk3VjU5LjR6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjMTAyRjUwIiBkPSJNNTY4LjYxLDkwLjU1Yy04LjIzLTQuNTgtMTcuNDktNi45OC0yNi45MS02Ljk4Yy05LjQyLDAtMTguNjgsMi40LTI2LjkyLDYuOTgNCgkJCQljLTcuODMsNC41Ny0xNC4zMSwxMS4xNC0xOC43NSwxOS4wNmMtNC41MSw4LjUtNi44NywxNy45OC02Ljg3LDI3LjYxYzAsOS42MiwyLjM2LDE5LjEsNi44NywyNy42MQ0KCQkJCWM0LjQzLDcuOSwxMC45MiwxNC40OSwxOC43NSwxOS4wNWM4LjI0LDQuNTgsMTcuNSw2Ljk5LDI2LjkyLDYuOTljOS40MiwwLDE4LjY4LTIuNDEsMjYuOTEtNi45OQ0KCQkJCWM3Ljg0LTQuNTYsMTQuMzEtMTEuMTQsMTguNzUtMTkuMDVjNC41Mi04LjUxLDYuODktMTcuOTgsNi44OS0yNy42MXMtMi4zNy0xOS4xMS02Ljg5LTI3LjYxDQoJCQkJQzU4Mi45MiwxMDEuNjksNTc2LjQ1LDk1LjEyLDU2OC42MSw5MC41NXogTTU2OS42OSwxNTUuMThjLTIuNiw1LjE0LTYuNTIsOS40OS0xMS4zOCwxMi41OWMtNC45MywzLjEzLTEwLjY3LDQuNzYtMTYuNTEsNC42OA0KCQkJCWMtNS44NywwLjA2LTExLjYzLTEuNTctMTYuNi00LjY4Yy00LjkxLTMuMDctOC44OC03LjQzLTExLjUtMTIuNTljLTIuNTgtNS42NC0zLjkyLTExLjc3LTMuOTItMTcuOTcNCgkJCQljMC02LjE5LDEuMzQtMTIuMzIsMy45Mi0xNy45NmMyLjYyLTUuMTYsNi42LTkuNTEsMTEuNS0xMi41OWM1LTMsMTAuNzEtNC41OSwxNi41NS00LjYxYzUuODMtMC4wMSwxMS41NSwxLjU1LDE2LjU3LDQuNTINCgkJCQljNC44NywzLjA0LDguODEsNy4zNiwxMS4zOCwxMi40OWMyLjgyLDUuNjMsNC4xOCwxMS44OCwzLjk0LDE4LjE4QzU3My44NSwxNDMuNDcsNTcyLjUsMTQ5LjYzLDU2OS42OSwxNTUuMTh6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjMTAyRjUwIiBkPSJNNjY4LjE4LDgzLjUyYy00LjksMC4wMi05LjczLDEuMjQtMTQuMDUsMy41NWMtNC41OSwyLjQtOC42Niw1LjY2LTEyLDkuNjJjLTIuMTcsMi41Mi0zLjk5LDUuMzMtNS40MSw4LjM0DQoJCQkJVjg1LjY5aC0yMC40N3YxMDMuMDhoMjAuNDN2LTU2LjgzYy0wLjA0LTMuNjEsMC43LTcuMjEsMi4xNy0xMC41MWMxLjQtMy4xNSwzLjM3LTYuMDEsNS44LTguNDRjMi40Mi0yLjQzLDUuMjktNC4zNyw4LjQ0LTUuNw0KCQkJCWMzLjItMS4zOCw2LjY1LTIuMDgsMTAuMTMtMi4wN2MxLjg4LDAuMDEsMy43NiwwLjI0LDUuNTksMC42OWMxLjc4LDAuNDMsMy41MiwwLjk5LDUuMiwxLjY3bDUuMzEtMjIuMDENCgkJCQljLTEuNTUtMC42Mi0zLjE2LTEuMDktNC44MS0xLjM3QzY3Mi40Myw4My43Nyw2NzAuMzEsODMuNTUsNjY4LjE4LDgzLjUyeiIvPg0KCQkJPHBhdGggZmlsbD0iIzEwMkY1MCIgZD0iTTc3MS4xNyw5Ny43MmMtNC4yNy00LjQ2LTkuMzctOC4wMy0xNS4wMi0xMC41MWMtNS45MS0yLjU4LTEyLjMtMy44OC0xOC43NS0zLjgyDQoJCQkJYy03LjI0LTAuMDctMTQuNDMsMS4zLTIxLjE0LDQuMDNjLTYuMywyLjU3LTEyLDYuNDUtMTYuNjksMTEuMzhjLTQuNzQsNS4wNC04LjQ1LDEwLjk1LTEwLjk0LDE3LjQNCgkJCQljLTIuNjksNy4wOC00LjAyLDE0LjYxLTMuOTIsMjIuMmMtMC4yLDkuNSwyLjIxLDE4Ljg4LDYuOTYsMjcuMTJjNC42Miw3LjgyLDExLjI4LDE0LjI0LDE5LjI3LDE4LjU3DQoJCQkJYzguNjMsNC42MiwxOC4zMSw2Ljk1LDI4LjEsNi43N2M1LjAyLTAuMDIsMTAuMDEtMC43MiwxNC44NC0yLjA2YzQuOTYtMS4zNiw5Ljc3LTMuMjQsMTQuMzQtNS42MWM0LjIyLTIuMTUsOC4xLTQuOTMsMTEuNDktOC4yNQ0KCQkJCWwtMTAuMjEtMTQuMzVjLTQuMTksMy44Ny05LDctMTQuMjUsOS4yNGMtNC41NCwxLjczLTkuMzgsMi42LTE0LjI0LDIuNTRjLTYuNjIsMC4xNS0xMy4xNi0xLjM0LTE5LjA3LTQuMzINCgkJCQljLTUuMzctMi43NS05LjgtNy4wMi0xMi43Ni0xMi4yOGMtMi4zNC00LjIxLTMuNzgtOC44Ni00LjI1LTEzLjY1aDc4LjlsMC4xOS04LjY0YzAuMjItNi43OS0wLjg4LTEzLjU2LTMuMjMtMTkuOTQNCgkJCQlDNzc4LjcsMTA3LjY4LDc3NS40MiwxMDIuMjksNzcxLjE3LDk3LjcyeiBNNzE5LjY0LDEwNi4wOGM1LjUyLTIuODUsMTEuNjctNC4yNCwxNy44OC00LjAzYzQuMjUtMC4wNCw4LjQ0LDAuOTMsMTIuMjUsMi44NA0KCQkJCWMzLjgsMS45LDcuMDksNC42Nyw5LjYyLDguMWMyLjQ3LDMuMzksMy45Nyw3LjM5LDQuMzIsMTEuNTh2MS4zOWgtNTcuN2MwLjU1LTIuODIsMS40NS01LjU3LDIuNjktOC4xNg0KCQkJCWMyLjMxLTQuOTUsNi4xMy05LjA2LDEwLjkxLTExLjcySDcxOS42NHoiLz4NCgkJCTxwYXRoIGZpbGw9IiMxMDJGNTAiIGQ9Ik05MzYuMDEsMTE5LjEzYy0wLjItMi4xLTAuMzUtMy44NS0wLjUtNS4zaC02My42NXYyNC41NWgzNS4yOGMtMC4wOCwzLjM0LTAuOSw2LjYzLTIuNCw5LjYzDQoJCQkJYy0xLjY3LDMuMy00LjAyLDYuMjItNi44OSw4LjU2Yy0zLjA0LDIuNDctNi41LDQuMzYtMTAuMjIsNS41OWMtNC4wMywxLjM0LTguMjUsMi0xMi40OSwxLjk2Yy01LjkzLDAuMDUtMTEuODEtMS4xMi0xNy4yNy0zLjQzDQoJCQkJYy04LjA0LTMuNDEtMTQuODctOS4xMi0xOS42Ny0xNi40MWMtNC43OS03LjI5LTcuMzEtMTUuODQtNy4yNi0yNC41NmMtMC4wNS01Ljk4LDEuMDUtMTEuOTIsMy4yNS0xNy40OQ0KCQkJCWMyLjA3LTUuMjIsNS4xNy05Ljk3LDkuMTQtMTMuOTVjMy45Mi0zLjkyLDguNTYtNy4wNSwxMy42NS05LjIzYzUuMzgtMi4yNiwxMS4xNy0zLjQsMTYuOTktMy4zNGM0LjMsMCw4LjU3LDAuNjMsMTIuNjcsMS44OA0KCQkJCWM0LjExLDEuMjQsOC4wNSwzLjAyLDExLjY5LDUuM2MzLjgyLDIuNDEsNy4zNyw1LjIsMTAuNiw4LjM1bDE4LjI4LTE5LjI2Yy0zLjkxLTQuNjUtOC41Ni04LjYzLTEzLjc2LTExLjc4DQoJCQkJYy0xMS44Mi03LjI0LTI1LjQzLTExLjA1LTM5LjI4LTExLjAxYy0xMC4wMS0wLjExLTE5Ljk1LDEuNjktMjkuMjksNS4zMWMtOC42NSwzLjM4LTE2LjU2LDguNDEtMjMuMjYsMTQuODINCgkJCQljLTYuNjEsNi4zMy0xMS44MiwxMy45Ni0xNS4zMywyMi40Yy0zLjY2LDguODgtNS40OSwxOC40LTUuNCwyOGMtMC4wOSw5LjYyLDEuNjcsMTkuMTYsNS4yLDI4LjEyDQoJCQkJYzMuMzQsOC40Niw4LjQsMTYuMTUsMTQuODMsMjIuNThjNi41NCw2LjUxLDE0LjMyLDExLjYyLDIyLjg4LDE1LjA1YzkuMjksMy42OCwxOS4xOSw1LjUyLDI5LjE4LDUuNA0KCQkJCWM4LjU4LDAuMDcsMTcuMS0xLjQyLDI1LjE0LTQuNDJjNy40Ny0yLjc5LDE0LjMyLTcuMDQsMjAuMTUtMTIuNDljNS43Mi01LjQzLDEwLjI3LTExLjk5LDEzLjM1LTE5LjI2DQoJCQkJYzMuMjctNy43Nyw0LjktMTYuMTIsNC44Mi0yNC41NWMwLTEuMTgsMC0yLjc4LTAuMDktNC44M0M5MzYuMjYsMTIzLjI3LDkzNi4yLDEyMS4yMyw5MzYuMDEsMTE5LjEzeiIvPg0KCQkJPHBhdGggZmlsbD0iIzEwMkY1MCIgZD0iTTEwMTcuMDYsODIuNzljLTUuMjQsMC0xMC40MSwxLjI4LTE1LjA1LDMuNzNjLTQuODMsMi41My05LjA5LDYuMDYtMTIuNDksMTAuMzINCgkJCQljLTEuMjYsMS41Ni0yLjQsMy4yMS0zLjQyLDQuOTNsLTAuNS0xNi44MmgtMjYuOTF2MTAzLjkyaDI4LjEydi01My44MmMtMC4wMy0zLjEsMC41My02LjE2LDEuNjctOS4wMw0KCQkJCWMxLjA3LTIuNjgsMi42Ny01LjEyLDQuNjgtNy4xOWMxLjk3LTIuMDMsNC4zNC0zLjYxLDYuOTYtNC42OGMyLjc4LTEuMTIsNS43NS0xLjY5LDguNzYtMS42NmMyLjM1LDAsNC42OSwwLjI5LDYuOTgsMC44OA0KCQkJCWMxLjkzLDAuNDYsMy44MSwxLjE1LDUuNTksMi4wNmw3LjQ3LTMwLjY0Yy0xLjcyLTAuNi0zLjUtMS4wNi01LjMtMS4zOEMxMDIxLjQ2LDgzLjAxLDEwMTkuMjcsODIuOCwxMDE3LjA2LDgyLjc5eiIvPg0KCQkJPHBhdGggZmlsbD0iIzEwMkY1MCIgZD0iTTExMTYuOTYsODkuNzdjLTguNzItNC41OS0xOC40NC02Ljk4LTI4LjI5LTYuOThzLTE5LjU3LDIuMzktMjguMjksNi45OGMtOC4xNiw0LjQ5LTE0Ljk2LDExLjEtMTkuNjUsMTkuMTUNCgkJCQljLTQuNyw4LjU1LTcuMTgsMTguMTQtNy4xOCwyNy45YzAsOS43NSwyLjQ3LDE5LjM2LDcuMTgsMjcuOTFjNC43LDguMDMsMTEuNDksMTQuNjQsMTkuNjUsMTkuMTQNCgkJCQljOC43Miw0LjU5LDE4LjQ0LDYuOTgsMjguMjksNi45OHMxOS41Ny0yLjM5LDI4LjI5LTYuOThjOC4xNC00LjQ4LDE0LjktMTEuMSwxOS41Ni0xOS4xNGM0LjYzLTguNTgsNy4wNS0xOC4xNyw3LjA1LTI3LjkxDQoJCQkJcy0yLjQyLTE5LjMzLTcuMDUtMjcuOUMxMTMxLjg2LDEwMC44NiwxMTI1LjEsOTQuMjUsMTExNi45Niw4OS43N3ogTTExMTIuMDMsMTUyLjA1Yy0yLjEzLDQuMzUtNS40Myw4LjAzLTkuNTIsMTAuNjENCgkJCQljLTQuMTIsMi41Ny04Ljg5LDMuODktMTMuNzUsMy44M2MtNC45MSwwLjA4LTkuNzUtMS4yNS0xMy45NC0zLjgzYy00LjExLTIuNjEtNy40NS02LjI3LTkuNjQtMTAuNjENCgkJCQljLTIuMTktNC44LTMuMzMtMTAuMDEtMy4zMy0xNS4yOGMwLTUuMjgsMS4xNC0xMC40OCwzLjMzLTE1LjI4YzIuMjMtNC4zMSw1LjU2LTcuOTcsOS42NC0xMC42YzQuMTUtMi41Nyw4Ljk0LTMuOTMsMTMuODItMy45NQ0KCQkJCWM0Ljg5LTAuMDEsOS42OSwxLjMyLDEzLjg3LDMuODVjNC4wOSwyLjU5LDcuMzksNi4yNSw5LjUyLDEwLjZjMi4zNiw0Ljc5LDMuNDcsMTAuMDgsMy4yNSwxNS40MQ0KCQkJCUMxMTE1LjQ5LDE0Mi4wOSwxMTE0LjM3LDE0Ny4zMiwxMTEyLjAzLDE1Mi4wNXoiLz4NCgkJCTxwYXRoIGZpbGw9IiMxMDJGNTAiIGQ9Ik0xMjU3LjM2LDE0OS4wOGwtMjEuNjMtNDkuMTloLTE2LjUxbC0yMC45NCw0OS40N2wtMTkuMzItNjQuNmwtMjkuMDksMC4yMWwzNC43OCwxMDMuOTJoMjAuMDVsMjIuNDktNTUuMTMNCgkJCQlsMjIuODgsNTUuMTNoMjAuMjRsMzUuMzYtMTAzLjkyaC0yOS4wN0wxMjU3LjM2LDE0OS4wOHoiLz4NCgkJCTxwYXRoIGZpbGw9IiMxMDJGNTAiIGQ9Ik0xMzcwLjMxLDU4LjYyaC0yNy45MXYyNi4zNGgtMTkuNDR2MjQuOTRoMTkuNDR2NzguOTloMjcuOTFWMTA5LjloMjEuNDJWODQuOTZoLTIxLjQyVjU4LjYyeiIvPg0KCQkJPHBhdGggZmlsbD0iIzEwMkY1MCIgZD0iTTE1MDEuMjMsMTAxLjc1Yy0yLjMyLTUuOTMtNi41My0xMC45NC0xMS45OC0xNC4yNGMtNi4wMy0zLjMxLTEyLjg2LTQuOTMtMTkuNzQtNC42OA0KCQkJCWMtNS42OS0wLjAxLTExLjMyLDEuMTktMTYuNSwzLjUzYy01LjA1LDIuMjMtOS42MSw1LjQxLTEzLjQ1LDkuMzdjLTAuODEsMC44NC0xLjU2LDEuNy0yLjI2LDIuNThWNDMuNDloLTI3LjV2MTQ1LjRoMjcuODkNCgkJCQl2LTYyLjQ3Yy0wLjAxLTIuNjUsMC41Ni01LjI3LDEuNjctNy42OGMxLjExLTIuMzQsMi42NS00LjQ2LDQuNTItNi4yNGMxLjk3LTEuODgsNC4zMi0zLjMyLDYuODktNC4yNGMyLjgtMSw1Ljc1LTEuNSw4LjczLTEuNDYNCgkJCQljMy40My0wLjI1LDYuODUsMC40NCw5LjkzLDEuOTZjMi43NCwxLjUyLDQuODYsMy45Niw1Ljk4LDYuODhjMS40MiwzLjc2LDIuMDksNy43NiwxLjk3LDExLjc4djYxLjUxaDI3Ljk3di02My43DQoJCQkJQzE1MDUuNTUsMTE3LjIsMTUwNC4xNSwxMDkuMjIsMTUwMS4yMywxMDEuNzV6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==");

/***/ }),

/***/ "./images/menu/down-arrow-icon.svg":
/*!*****************************************!*\
  !*** ./images/menu/down-arrow-icon.svg ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgDownArrowIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgDownArrowIcon = function SvgDownArrowIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 14,
    height: 8,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M13 7 9.278 2.657a3 3 0 0 0-4.556 0L1 7",
    stroke: "#073B4C",
    strokeWidth: 2,
    strokeLinecap: "round"
  })));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDE0IDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMyA3TDkuMjc3NzcgMi42NTc0QzguMDgwNDggMS4yNjA1NiA1LjkxOTUyIDEuMjYwNTYgNC43MjIyMyAyLjY1NzRMMSA3IiBzdHJva2U9IiMwNzNCNEMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=");

/***/ }),

/***/ "./images/menu/up-arrow-icon.svg":
/*!***************************************!*\
  !*** ./images/menu/up-arrow-icon.svg ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgUpArrowIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgUpArrowIcon = function SvgUpArrowIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 14,
    height: 8,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _path || (_path = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "m1 1 3.722 4.343a3 3 0 0 0 4.556 0L13 1",
    stroke: "#073B4C",
    strokeWidth: 2,
    strokeLinecap: "round"
  })));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDE0IDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNC43MjIyMyA1LjM0MjZDNS45MTk1MiA2LjczOTQ0IDguMDgwNDggNi43Mzk0NCA5LjI3Nzc3IDUuMzQyNkwxMyAxIiBzdHJva2U9IiMwNzNCNEMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=");

/***/ }),

/***/ "./images/widget-icon.svg":
/*!********************************!*\
  !*** ./images/widget-icon.svg ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactComponent: function() { return /* binding */ SvgWidgetIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _g, _defs;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgWidgetIcon = function SvgWidgetIcon(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    width: 18,
    height: 20,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, props), _g || (_g = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
    clipPath: "url(#widget-icon_svg__a)"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M17.009 4.28 9.99.263a1.996 1.996 0 0 0-1.982 0L.99 4.28C.69 4.452.44 4.7.266 5A1.954 1.954 0 0 0 0 5.983v8.035c0 .345.092.683.266.982.174.298.424.546.725.719l7.018 4.016a2.016 2.016 0 0 0 1.982 0l7.018-4.016c.3-.173.55-.42.725-.72.174-.298.266-.636.266-.981V5.983a1.974 1.974 0 0 0-.991-1.703ZM9 1.967l6.026 3.44L9 8.865 2.974 5.423 9 1.967Zm-7.017 12.05V7.12l6.026 3.448v6.9l-6.026-3.45Zm8.008 3.45v-6.9l6.026-3.441v6.892l-6.026 3.448Z",
    fill: "#073B4C"
  }))), _defs || (_defs = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("clipPath", {
    id: "widget-icon_svg__a"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    fill: "#fff",
    d: "M0 0h18v20H0z"
  })))));
};

/* harmony default export */ __webpack_exports__["default"] = ("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAxOCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNjE4MikiPgo8cGF0aCBkPSJNMTcuMDA4NSA0LjI3OTY2TDkuOTkxNDYgMC4yNjM0MzhDOS42OTAwMiAwLjA5MDg1NjUgOS4zNDgwOCAwIDkgMEM4LjY1MTkyIDAgOC4zMDk5OCAwLjA5MDg1NjUgOC4wMDg1NCAwLjI2MzQzOEwwLjk5MTQ2MyA0LjI3OTY2QzAuNjg5OTU1IDQuNDUyMjggMC40Mzk1OTIgNC43MDA1NyAwLjI2NTU1IDQuOTk5NThDMC4wOTE1MDg1IDUuMjk4NTggLTcuODEzODRlLTA1IDUuNjM3NzUgNS4wMDIwN2UtMDggNS45ODI5OVYxNC4wMTc5QzAuMDAwMzU2NzIxIDE0LjM2MjcgMC4wOTIxNDk2IDE0LjcwMTQgMC4yNjYxNyAxNC45OTk5QzAuNDQwMTkgMTUuMjk4NCAwLjY5MDMxOCAxNS41NDY0IDAuOTkxNDYzIDE1LjcxODhMOC4wMDg1NCAxOS43MzVDOC4zMTA2MyAxOS45MDU3IDguNjUyMzIgMTkuOTk1NCA5IDE5Ljk5NTRDOS4zNDc2OCAxOS45OTU0IDkuNjg5MzcgMTkuOTA1NyA5Ljk5MTQ2IDE5LjczNUwxNy4wMDg1IDE1LjcxODhDMTcuMzA5NyAxNS41NDY0IDE3LjU1OTggMTUuMjk4NCAxNy43MzM4IDE0Ljk5OTlDMTcuOTA3OCAxNC43MDE0IDE3Ljk5OTYgMTQuMzYyNyAxOCAxNC4wMTc5VjUuOTgyOTlDMTguMDAwMSA1LjYzNzc1IDE3LjkwODUgNS4yOTg1OCAxNy43MzQ0IDQuOTk5NThDMTcuNTYwNCA0LjcwMDU3IDE3LjMxIDQuNDUyMjggMTcuMDA4NSA0LjI3OTY2Wk05IDEuOTY2NzdMMTUuMDI1NiA1LjQwNzg0TDkgOC44NjM2NkwyLjk3NDM5IDUuNDIyNTlMOSAxLjk2Njc3Wk0xLjk4MjkyIDE0LjAxNzlWNy4xMTg1NEw4LjAwODU0IDEwLjU2N1YxNy40NjYzTDEuOTgyOTIgMTQuMDE3OVpNOS45OTE0NiAxNy40NjYzVjEwLjU2N0wxNi4wMTcxIDcuMTI1OTJWMTQuMDE3OUw5Ljk5MTQ2IDE3LjQ2NjNaIiBmaWxsPSIjMDczQjRDIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMV82MTgyIj4KPHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");

/***/ }),

/***/ "../node_modules/antd/es/_util/getDataOrAriaProps.js":
/*!***********************************************************!*\
  !*** ../node_modules/antd/es/_util/getDataOrAriaProps.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ getDataOrAriaProps; }
/* harmony export */ });
function getDataOrAriaProps(props) {
  return Object.keys(props).reduce(function (prev, key) {
    if ((key.startsWith('data-') || key.startsWith('aria-') || key === 'role') && !key.startsWith('data-__')) {
      prev[key] = props[key];
    }
    return prev;
  }, {});
}

/***/ }),

/***/ "../node_modules/antd/es/_util/hooks/useFlexGapSupport.js":
/*!****************************************************************!*\
  !*** ../node_modules/antd/es/_util/hooks/useFlexGapSupport.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _styleChecker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styleChecker */ "../node_modules/antd/es/_util/styleChecker.js");



/* harmony default export */ __webpack_exports__["default"] = (function () {
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_1__.useState(false),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState, 2),
    flexible = _React$useState2[0],
    setFlexible = _React$useState2[1];
  react__WEBPACK_IMPORTED_MODULE_1__.useEffect(function () {
    setFlexible((0,_styleChecker__WEBPACK_IMPORTED_MODULE_2__.detectFlexGapSupported)());
  }, []);
  return flexible;
});

/***/ }),

/***/ "../node_modules/antd/es/_util/isNumeric.js":
/*!**************************************************!*\
  !*** ../node_modules/antd/es/_util/isNumeric.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var isNumeric = function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
};
/* harmony default export */ __webpack_exports__["default"] = (isNumeric);

/***/ }),

/***/ "../node_modules/antd/es/_util/motion.js":
/*!***********************************************!*\
  !*** ../node_modules/antd/es/_util/motion.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTransitionDirection: function() { return /* binding */ getTransitionDirection; },
/* harmony export */   getTransitionName: function() { return /* binding */ getTransitionName; }
/* harmony export */ });
/* harmony import */ var _type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./type */ "../node_modules/antd/es/_util/type.js");

// ================== Collapse Motion ==================
var getCollapsedHeight = function getCollapsedHeight() {
  return {
    height: 0,
    opacity: 0
  };
};
var getRealHeight = function getRealHeight(node) {
  var scrollHeight = node.scrollHeight;
  return {
    height: scrollHeight,
    opacity: 1
  };
};
var getCurrentHeight = function getCurrentHeight(node) {
  return {
    height: node ? node.offsetHeight : 0
  };
};
var skipOpacityTransition = function skipOpacityTransition(_, event) {
  return (event === null || event === void 0 ? void 0 : event.deadline) === true || event.propertyName === 'height';
};
var collapseMotion = {
  motionName: 'ant-motion-collapse',
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onAppearEnd: skipOpacityTransition,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500
};
var SelectPlacements = (0,_type__WEBPACK_IMPORTED_MODULE_0__.tuple)('bottomLeft', 'bottomRight', 'topLeft', 'topRight');
var getTransitionDirection = function getTransitionDirection(placement) {
  if (placement !== undefined && (placement === 'topLeft' || placement === 'topRight')) {
    return "slide-down";
  }
  return "slide-up";
};
var getTransitionName = function getTransitionName(rootPrefixCls, motion, transitionName) {
  if (transitionName !== undefined) {
    return transitionName;
  }
  return "".concat(rootPrefixCls, "-").concat(motion);
};

/* harmony default export */ __webpack_exports__["default"] = (collapseMotion);

/***/ }),

/***/ "../node_modules/antd/es/_util/raf.js":
/*!********************************************!*\
  !*** ../node_modules/antd/es/_util/raf.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ wrapperRaf; }
/* harmony export */ });
/* harmony import */ var rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/raf */ "../node_modules/rc-util/es/raf.js");

var id = 0;
var ids = {};
// Support call raf with delay specified frame
function wrapperRaf(callback) {
  var delayFrames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var myId = id++;
  var restFrames = delayFrames;
  function internalCallback() {
    restFrames -= 1;
    if (restFrames <= 0) {
      callback();
      delete ids[myId];
    } else {
      ids[myId] = (0,rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__["default"])(internalCallback);
    }
  }
  ids[myId] = (0,rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__["default"])(internalCallback);
  return myId;
}
wrapperRaf.cancel = function cancel(pid) {
  if (pid === undefined) return;
  rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__["default"].cancel(ids[pid]);
  delete ids[pid];
};
wrapperRaf.ids = ids; // export this for test usage

/***/ }),

/***/ "../node_modules/antd/es/_util/reactNode.js":
/*!**************************************************!*\
  !*** ../node_modules/antd/es/_util/reactNode.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cloneElement: function() { return /* binding */ cloneElement; },
/* harmony export */   isFragment: function() { return /* binding */ isFragment; },
/* harmony export */   isValidElement: function() { return /* binding */ isValidElement; },
/* harmony export */   replaceElement: function() { return /* binding */ replaceElement; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var isValidElement = react__WEBPACK_IMPORTED_MODULE_0__.isValidElement;

function isFragment(child) {
  return child && isValidElement(child) && child.type === react__WEBPACK_IMPORTED_MODULE_0__.Fragment;
}
function replaceElement(element, replacement, props) {
  if (!isValidElement(element)) {
    return replacement;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(element, typeof props === 'function' ? props(element.props || {}) : props);
}
function cloneElement(element, props) {
  return replaceElement(element, element, props);
}

/***/ }),

/***/ "../node_modules/antd/es/_util/responsiveObserve.js":
/*!**********************************************************!*\
  !*** ../node_modules/antd/es/_util/responsiveObserve.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   responsiveArray: function() { return /* binding */ responsiveArray; },
/* harmony export */   responsiveMap: function() { return /* binding */ responsiveMap; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");


var responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
var responsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)'
};
var subscribers = new Map();
var subUid = -1;
var screens = {};
var responsiveObserve = {
  matchHandlers: {},
  dispatch: function dispatch(pointMap) {
    screens = pointMap;
    subscribers.forEach(function (func) {
      return func(screens);
    });
    return subscribers.size >= 1;
  },
  subscribe: function subscribe(func) {
    if (!subscribers.size) this.register();
    subUid += 1;
    subscribers.set(subUid, func);
    func(screens);
    return subUid;
  },
  unsubscribe: function unsubscribe(token) {
    subscribers["delete"](token);
    if (!subscribers.size) this.unregister();
  },
  unregister: function unregister() {
    var _this = this;
    Object.keys(responsiveMap).forEach(function (screen) {
      var matchMediaQuery = responsiveMap[screen];
      var handler = _this.matchHandlers[matchMediaQuery];
      handler === null || handler === void 0 ? void 0 : handler.mql.removeListener(handler === null || handler === void 0 ? void 0 : handler.listener);
    });
    subscribers.clear();
  },
  register: function register() {
    var _this2 = this;
    Object.keys(responsiveMap).forEach(function (screen) {
      var matchMediaQuery = responsiveMap[screen];
      var listener = function listener(_ref) {
        var matches = _ref.matches;
        _this2.dispatch((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({}, screens), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])({}, screen, matches)));
      };
      var mql = window.matchMedia(matchMediaQuery);
      mql.addListener(listener);
      _this2.matchHandlers[matchMediaQuery] = {
        mql: mql,
        listener: listener
      };
      listener(mql);
    });
  }
};
/* harmony default export */ __webpack_exports__["default"] = (responsiveObserve);

/***/ }),

/***/ "../node_modules/antd/es/_util/styleChecker.js":
/*!*****************************************************!*\
  !*** ../node_modules/antd/es/_util/styleChecker.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canUseDocElement: function() { return /* binding */ canUseDocElement; },
/* harmony export */   detectFlexGapSupported: function() { return /* binding */ detectFlexGapSupported; },
/* harmony export */   isStyleSupport: function() { return /* reexport safe */ rc_util_es_Dom_styleChecker__WEBPACK_IMPORTED_MODULE_1__.isStyleSupport; }
/* harmony export */ });
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var rc_util_es_Dom_styleChecker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/Dom/styleChecker */ "../node_modules/rc-util/es/Dom/styleChecker.js");


var canUseDocElement = function canUseDocElement() {
  return (0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_0__["default"])() && window.document.documentElement;
};

var flexGapSupported;
var detectFlexGapSupported = function detectFlexGapSupported() {
  if (!canUseDocElement()) {
    return false;
  }
  if (flexGapSupported !== undefined) {
    return flexGapSupported;
  }
  // create flex container with row-gap set
  var flex = document.createElement('div');
  flex.style.display = 'flex';
  flex.style.flexDirection = 'column';
  flex.style.rowGap = '1px';
  // create two, elements inside it
  flex.appendChild(document.createElement('div'));
  flex.appendChild(document.createElement('div'));
  // append to the DOM (needed to obtain scrollHeight)
  document.body.appendChild(flex);
  flexGapSupported = flex.scrollHeight === 1; // flex container should be 1px high from the row-gap
  document.body.removeChild(flex);
  return flexGapSupported;
};

/***/ }),

/***/ "../node_modules/antd/es/_util/type.js":
/*!*********************************************!*\
  !*** ../node_modules/antd/es/_util/type.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tuple: function() { return /* binding */ tuple; },
/* harmony export */   tupleNum: function() { return /* binding */ tupleNum; }
/* harmony export */ });
// https://stackoverflow.com/questions/46176165/ways-to-get-string-literal-type-of-array-values-without-enum-overhead
var tuple = function tuple() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return args;
};
var tupleNum = function tupleNum() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  return args;
};

/***/ }),

/***/ "../node_modules/antd/es/_util/warning.js":
/*!************************************************!*\
  !*** ../node_modules/antd/es/_util/warning.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   noop: function() { return /* binding */ noop; },
/* harmony export */   resetWarned: function() { return /* reexport safe */ rc_util_es_warning__WEBPACK_IMPORTED_MODULE_0__.resetWarned; }
/* harmony export */ });
/* harmony import */ var rc_util_es_warning__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/warning */ "../node_modules/rc-util/es/warning.js");


function noop() {}
// eslint-disable-next-line import/no-mutable-exports
var warning = noop;
if (true) {
  warning = function warning(valid, component, message) {
    (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_0__["default"])(valid, "[antd: ".concat(component, "] ").concat(message));
    // StrictMode will inject console which will not throw warning in React 17.
    if (false) {}
  };
}
/* harmony default export */ __webpack_exports__["default"] = (warning);

/***/ }),

/***/ "../node_modules/antd/es/_util/wave.js":
/*!*********************************************!*\
  !*** ../node_modules/antd/es/_util/wave.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "../node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/assertThisInitialized */ "../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "../node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createSuper */ "../node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/Dom/dynamicCSS */ "../node_modules/rc-util/es/Dom/dynamicCSS.js");
/* harmony import */ var rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rc-util/es/ref */ "../node_modules/rc-util/es/ref.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _raf__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./raf */ "../node_modules/antd/es/_util/raf.js");
/* harmony import */ var _reactNode__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./reactNode */ "../node_modules/antd/es/_util/reactNode.js");











var styleForPseudo;
// Where el is the DOM element you'd like to test for visibility
function isHidden(element) {
  if (false) {}
  return !element || element.offsetParent === null || element.hidden;
}
function getValidateContainer(nodeRoot) {
  if (nodeRoot instanceof Document) {
    return nodeRoot.body;
  }
  return Array.from(nodeRoot.childNodes).find(function (ele) {
    return (ele === null || ele === void 0 ? void 0 : ele.nodeType) === Node.ELEMENT_NODE;
  });
}
function isNotGrey(color) {
  // eslint-disable-next-line no-useless-escape
  var match = (color || '').match(/rgba?\((\d*), (\d*), (\d*)(, [\d.]*)?\)/);
  if (match && match[1] && match[2] && match[3]) {
    return !(match[1] === match[2] && match[2] === match[3]);
  }
  return true;
}
var Wave = /*#__PURE__*/function (_React$Component) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__["default"])(Wave, _React$Component);
  var _super = (0,_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__["default"])(Wave);
  function Wave() {
    var _this;
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Wave);
    _this = _super.apply(this, arguments);
    _this.containerRef = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createRef();
    _this.animationStart = false;
    _this.destroyed = false;
    _this.onClick = function (node, waveColor) {
      var _a, _b;
      var _this$props = _this.props,
        insertExtraNode = _this$props.insertExtraNode,
        disabled = _this$props.disabled;
      if (disabled || !node || isHidden(node) || node.className.includes('-leave')) {
        return;
      }
      _this.extraNode = document.createElement('div');
      var _assertThisInitialize = (0,_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this),
        extraNode = _assertThisInitialize.extraNode;
      var getPrefixCls = _this.context.getPrefixCls;
      extraNode.className = "".concat(getPrefixCls(''), "-click-animating-node");
      var attributeName = _this.getAttributeName();
      node.setAttribute(attributeName, 'true');
      // Not white or transparent or grey
      if (waveColor && waveColor !== '#fff' && waveColor !== '#ffffff' && waveColor !== 'rgb(255, 255, 255)' && waveColor !== 'rgba(255, 255, 255, 1)' && isNotGrey(waveColor) && !/rgba\((?:\d*, ){3}0\)/.test(waveColor) &&
      // any transparent rgba color
      waveColor !== 'transparent') {
        extraNode.style.borderColor = waveColor;
        var nodeRoot = ((_a = node.getRootNode) === null || _a === void 0 ? void 0 : _a.call(node)) || node.ownerDocument;
        var nodeBody = (_b = getValidateContainer(nodeRoot)) !== null && _b !== void 0 ? _b : nodeRoot;
        styleForPseudo = (0,rc_util_es_Dom_dynamicCSS__WEBPACK_IMPORTED_MODULE_5__.updateCSS)("\n      [".concat(getPrefixCls(''), "-click-animating-without-extra-node='true']::after, .").concat(getPrefixCls(''), "-click-animating-node {\n        --antd-wave-shadow-color: ").concat(waveColor, ";\n      }"), 'antd-wave', {
          csp: _this.csp,
          attachTo: nodeBody
        });
      }
      if (insertExtraNode) {
        node.appendChild(extraNode);
      }
      ['transition', 'animation'].forEach(function (name) {
        node.addEventListener("".concat(name, "start"), _this.onTransitionStart);
        node.addEventListener("".concat(name, "end"), _this.onTransitionEnd);
      });
    };
    _this.onTransitionStart = function (e) {
      if (_this.destroyed) {
        return;
      }
      var node = _this.containerRef.current;
      if (!e || e.target !== node || _this.animationStart) {
        return;
      }
      _this.resetEffect(node);
    };
    _this.onTransitionEnd = function (e) {
      if (!e || e.animationName !== 'fadeEffect') {
        return;
      }
      _this.resetEffect(e.target);
    };
    _this.bindAnimationEvent = function (node) {
      if (!node || !node.getAttribute || node.getAttribute('disabled') || node.className.includes('disabled')) {
        return;
      }
      var onClick = function onClick(e) {
        // Fix radio button click twice
        if (e.target.tagName === 'INPUT' || isHidden(e.target)) {
          return;
        }
        _this.resetEffect(node);
        // Get wave color from target
        var waveColor = getComputedStyle(node).getPropertyValue('border-top-color') ||
        // Firefox Compatible
        getComputedStyle(node).getPropertyValue('border-color') || getComputedStyle(node).getPropertyValue('background-color');
        _this.clickWaveTimeoutId = window.setTimeout(function () {
          return _this.onClick(node, waveColor);
        }, 0);
        _raf__WEBPACK_IMPORTED_MODULE_8__["default"].cancel(_this.animationStartId);
        _this.animationStart = true;
        // Render to trigger transition event cost 3 frames. Let's delay 10 frames to reset this.
        _this.animationStartId = (0,_raf__WEBPACK_IMPORTED_MODULE_8__["default"])(function () {
          _this.animationStart = false;
        }, 10);
      };
      node.addEventListener('click', onClick, true);
      return {
        cancel: function cancel() {
          node.removeEventListener('click', onClick, true);
        }
      };
    };
    _this.renderWave = function (_ref) {
      var csp = _ref.csp;
      var children = _this.props.children;
      _this.csp = csp;
      if (! /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.isValidElement(children)) return children;
      var ref = _this.containerRef;
      if ((0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.supportRef)(children)) {
        ref = (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.composeRef)(children.ref, _this.containerRef);
      }
      return (0,_reactNode__WEBPACK_IMPORTED_MODULE_9__.cloneElement)(children, {
        ref: ref
      });
    };
    return _this;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Wave, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.destroyed = false;
      var node = this.containerRef.current;
      if (!node || node.nodeType !== 1) {
        return;
      }
      this.instance = this.bindAnimationEvent(node);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.instance) {
        this.instance.cancel();
      }
      if (this.clickWaveTimeoutId) {
        clearTimeout(this.clickWaveTimeoutId);
      }
      this.destroyed = true;
    }
  }, {
    key: "getAttributeName",
    value: function getAttributeName() {
      var getPrefixCls = this.context.getPrefixCls;
      var insertExtraNode = this.props.insertExtraNode;
      return insertExtraNode ? "".concat(getPrefixCls(''), "-click-animating") : "".concat(getPrefixCls(''), "-click-animating-without-extra-node");
    }
  }, {
    key: "resetEffect",
    value: function resetEffect(node) {
      var _this2 = this;
      if (!node || node === this.extraNode || !(node instanceof Element)) {
        return;
      }
      var insertExtraNode = this.props.insertExtraNode;
      var attributeName = this.getAttributeName();
      node.setAttribute(attributeName, 'false'); // edge has bug on `removeAttribute` #14466
      if (styleForPseudo) {
        styleForPseudo.innerHTML = '';
      }
      if (insertExtraNode && this.extraNode && node.contains(this.extraNode)) {
        node.removeChild(this.extraNode);
      }
      ['transition', 'animation'].forEach(function (name) {
        node.removeEventListener("".concat(name, "start"), _this2.onTransitionStart);
        node.removeEventListener("".concat(name, "end"), _this2.onTransitionEnd);
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createElement(_config_provider__WEBPACK_IMPORTED_MODULE_10__.ConfigConsumer, null, this.renderWave);
    }
  }]);
  return Wave;
}(react__WEBPACK_IMPORTED_MODULE_7__.Component);
Wave.contextType = _config_provider__WEBPACK_IMPORTED_MODULE_10__.ConfigContext;
/* harmony default export */ __webpack_exports__["default"] = (Wave);

/***/ }),

/***/ "../node_modules/antd/es/alert/ErrorBoundary.js":
/*!******************************************************!*\
  !*** ../node_modules/antd/es/alert/ErrorBoundary.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "../node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "../node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createSuper */ "../node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! . */ "../node_modules/antd/es/alert/index.js");






var ErrorBoundary = /*#__PURE__*/function (_React$Component) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(ErrorBoundary, _React$Component);
  var _super = (0,_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__["default"])(ErrorBoundary);
  function ErrorBoundary() {
    var _this;
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ErrorBoundary);
    _this = _super.apply(this, arguments);
    _this.state = {
      error: undefined,
      info: {
        componentStack: ''
      }
    };
    return _this;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, info) {
      this.setState({
        error: error,
        info: info
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
        message = _this$props.message,
        description = _this$props.description,
        children = _this$props.children;
      var _this$state = this.state,
        error = _this$state.error,
        info = _this$state.info;
      var componentStack = info && info.componentStack ? info.componentStack : null;
      var errorMessage = typeof message === 'undefined' ? (error || '').toString() : message;
      var errorDescription = typeof description === 'undefined' ? componentStack : description;
      if (error) {
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(___WEBPACK_IMPORTED_MODULE_5__["default"], {
          type: "error",
          message: errorMessage,
          description: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement("pre", null, errorDescription)
        });
      }
      return children;
    }
  }]);
  return ErrorBoundary;
}(react__WEBPACK_IMPORTED_MODULE_4__.Component);
/* harmony default export */ __webpack_exports__["default"] = (ErrorBoundary);

/***/ }),

/***/ "../node_modules/antd/es/alert/index.js":
/*!**********************************************!*\
  !*** ../node_modules/antd/es/alert/index.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _ant_design_icons_es_icons_CheckCircleFilled__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ant-design/icons/es/icons/CheckCircleFilled */ "../node_modules/@ant-design/icons/es/icons/CheckCircleFilled.js");
/* harmony import */ var _ant_design_icons_es_icons_CheckCircleOutlined__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ant-design/icons/es/icons/CheckCircleOutlined */ "../node_modules/@ant-design/icons/es/icons/CheckCircleOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_CloseCircleFilled__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ant-design/icons/es/icons/CloseCircleFilled */ "../node_modules/@ant-design/icons/es/icons/CloseCircleFilled.js");
/* harmony import */ var _ant_design_icons_es_icons_CloseCircleOutlined__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ant-design/icons/es/icons/CloseCircleOutlined */ "../node_modules/@ant-design/icons/es/icons/CloseCircleOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_CloseOutlined__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @ant-design/icons/es/icons/CloseOutlined */ "../node_modules/@ant-design/icons/es/icons/CloseOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_ExclamationCircleFilled__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ant-design/icons/es/icons/ExclamationCircleFilled */ "../node_modules/@ant-design/icons/es/icons/ExclamationCircleFilled.js");
/* harmony import */ var _ant_design_icons_es_icons_ExclamationCircleOutlined__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @ant-design/icons/es/icons/ExclamationCircleOutlined */ "../node_modules/@ant-design/icons/es/icons/ExclamationCircleOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_InfoCircleFilled__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ant-design/icons/es/icons/InfoCircleFilled */ "../node_modules/@ant-design/icons/es/icons/InfoCircleFilled.js");
/* harmony import */ var _ant_design_icons_es_icons_InfoCircleOutlined__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ant-design/icons/es/icons/InfoCircleOutlined */ "../node_modules/@ant-design/icons/es/icons/InfoCircleOutlined.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-motion */ "../node_modules/rc-motion/es/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _util_getDataOrAriaProps__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../_util/getDataOrAriaProps */ "../node_modules/antd/es/_util/getDataOrAriaProps.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../_util/reactNode */ "../node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _ErrorBoundary__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./ErrorBoundary */ "../node_modules/antd/es/alert/ErrorBoundary.js");



var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
















var iconMapFilled = {
  success: _ant_design_icons_es_icons_CheckCircleFilled__WEBPACK_IMPORTED_MODULE_6__["default"],
  info: _ant_design_icons_es_icons_InfoCircleFilled__WEBPACK_IMPORTED_MODULE_7__["default"],
  error: _ant_design_icons_es_icons_CloseCircleFilled__WEBPACK_IMPORTED_MODULE_8__["default"],
  warning: _ant_design_icons_es_icons_ExclamationCircleFilled__WEBPACK_IMPORTED_MODULE_9__["default"]
};
var iconMapOutlined = {
  success: _ant_design_icons_es_icons_CheckCircleOutlined__WEBPACK_IMPORTED_MODULE_10__["default"],
  info: _ant_design_icons_es_icons_InfoCircleOutlined__WEBPACK_IMPORTED_MODULE_11__["default"],
  error: _ant_design_icons_es_icons_CloseCircleOutlined__WEBPACK_IMPORTED_MODULE_12__["default"],
  warning: _ant_design_icons_es_icons_ExclamationCircleOutlined__WEBPACK_IMPORTED_MODULE_13__["default"]
};
var IconNode = function IconNode(props) {
  var description = props.description,
    icon = props.icon,
    prefixCls = props.prefixCls,
    type = props.type;
  var iconType = (description ? iconMapOutlined : iconMapFilled)[type] || null;
  if (icon) {
    return (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_14__.replaceElement)(icon, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", {
      className: "".concat(prefixCls, "-icon")
    }, icon), function () {
      return {
        className: classnames__WEBPACK_IMPORTED_MODULE_3___default()("".concat(prefixCls, "-icon"), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])({}, icon.props.className, icon.props.className))
      };
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(iconType, {
    className: "".concat(prefixCls, "-icon")
  });
};
var CloseIcon = function CloseIcon(props) {
  var isClosable = props.isClosable,
    closeText = props.closeText,
    prefixCls = props.prefixCls,
    closeIcon = props.closeIcon,
    handleClose = props.handleClose;
  return isClosable ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("button", {
    type: "button",
    onClick: handleClose,
    className: "".concat(prefixCls, "-close-icon"),
    tabIndex: 0
  }, closeText ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", {
    className: "".concat(prefixCls, "-close-text")
  }, closeText) : closeIcon) : null;
};
var Alert = function Alert(_a) {
  var _classNames2;
  var description = _a.description,
    customizePrefixCls = _a.prefixCls,
    message = _a.message,
    banner = _a.banner,
    _a$className = _a.className,
    className = _a$className === void 0 ? '' : _a$className,
    style = _a.style,
    onMouseEnter = _a.onMouseEnter,
    onMouseLeave = _a.onMouseLeave,
    onClick = _a.onClick,
    afterClose = _a.afterClose,
    showIcon = _a.showIcon,
    closable = _a.closable,
    closeText = _a.closeText,
    _a$closeIcon = _a.closeIcon,
    closeIcon = _a$closeIcon === void 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_CloseOutlined__WEBPACK_IMPORTED_MODULE_15__["default"], null) : _a$closeIcon,
    action = _a.action,
    props = __rest(_a, ["description", "prefixCls", "message", "banner", "className", "style", "onMouseEnter", "onMouseLeave", "onClick", "afterClose", "showIcon", "closable", "closeText", "closeIcon", "action"]);
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_5__.useState(false),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_React$useState, 2),
    closed = _React$useState2[0],
    setClosed = _React$useState2[1];
  var ref = react__WEBPACK_IMPORTED_MODULE_5__.useRef();
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_5__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_16__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    direction = _React$useContext.direction;
  var prefixCls = getPrefixCls('alert', customizePrefixCls);
  var handleClose = function handleClose(e) {
    var _a;
    setClosed(true);
    (_a = props.onClose) === null || _a === void 0 ? void 0 : _a.call(props, e);
  };
  var getType = function getType() {
    var type = props.type;
    if (type !== undefined) {
      return type;
    }
    // banner 模式默认为警告
    return banner ? 'warning' : 'info';
  };
  // closeable when closeText is assigned
  var isClosable = closeText ? true : closable;
  var type = getType();
  // banner 模式默认有 Icon
  var isShowIcon = banner && showIcon === undefined ? true : showIcon;
  var alertCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()(prefixCls, "".concat(prefixCls, "-").concat(type), (_classNames2 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames2, "".concat(prefixCls, "-with-description"), !!description), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames2, "".concat(prefixCls, "-no-icon"), !isShowIcon), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames2, "".concat(prefixCls, "-banner"), !!banner), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(_classNames2, "".concat(prefixCls, "-rtl"), direction === 'rtl'), _classNames2), className);
  var dataOrAriaProps = (0,_util_getDataOrAriaProps__WEBPACK_IMPORTED_MODULE_17__["default"])(props);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(rc_motion__WEBPACK_IMPORTED_MODULE_4__["default"], {
    visible: !closed,
    motionName: "".concat(prefixCls, "-motion"),
    motionAppear: false,
    motionEnter: false,
    onLeaveStart: function onLeaveStart(node) {
      return {
        maxHeight: node.offsetHeight
      };
    },
    onLeaveEnd: afterClose
  }, function (_ref) {
    var motionClassName = _ref.className,
      motionStyle = _ref.style;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
      ref: ref,
      "data-show": !closed,
      className: classnames__WEBPACK_IMPORTED_MODULE_3___default()(alertCls, motionClassName),
      style: (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, style), motionStyle),
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onClick: onClick,
      role: "alert"
    }, dataOrAriaProps), isShowIcon ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(IconNode, {
      description: description,
      icon: props.icon,
      prefixCls: prefixCls,
      type: type
    }) : null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-content")
    }, message ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-message")
    }, message) : null, description ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-description")
    }, description) : null), action ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-action")
    }, action) : null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(CloseIcon, {
      isClosable: !!isClosable,
      closeText: closeText,
      prefixCls: prefixCls,
      closeIcon: closeIcon,
      handleClose: handleClose
    }));
  });
};
Alert.ErrorBoundary = _ErrorBoundary__WEBPACK_IMPORTED_MODULE_18__["default"];
/* harmony default export */ __webpack_exports__["default"] = (Alert);

/***/ }),

/***/ "../node_modules/antd/es/button/LoadingIcon.js":
/*!*****************************************************!*\
  !*** ../node_modules/antd/es/button/LoadingIcon.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ant_design_icons_es_icons_LoadingOutlined__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons/es/icons/LoadingOutlined */ "../node_modules/@ant-design/icons/es/icons/LoadingOutlined.js");
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-motion */ "../node_modules/rc-motion/es/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);



var getCollapsedWidth = function getCollapsedWidth() {
  return {
    width: 0,
    opacity: 0,
    transform: 'scale(0)'
  };
};
var getRealWidth = function getRealWidth(node) {
  return {
    width: node.scrollWidth,
    opacity: 1,
    transform: 'scale(1)'
  };
};
var LoadingIcon = function LoadingIcon(_ref) {
  var prefixCls = _ref.prefixCls,
    loading = _ref.loading,
    existIcon = _ref.existIcon;
  var visible = !!loading;
  if (existIcon) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", {
      className: "".concat(prefixCls, "-loading-icon")
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_ant_design_icons_es_icons_LoadingOutlined__WEBPACK_IMPORTED_MODULE_2__["default"], null));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(rc_motion__WEBPACK_IMPORTED_MODULE_0__["default"], {
    visible: visible,
    // We do not really use this motionName
    motionName: "".concat(prefixCls, "-loading-icon-motion"),
    removeOnLeave: true,
    onAppearStart: getCollapsedWidth,
    onAppearActive: getRealWidth,
    onEnterStart: getCollapsedWidth,
    onEnterActive: getRealWidth,
    onLeaveStart: getRealWidth,
    onLeaveActive: getCollapsedWidth
  }, function (_ref2, ref) {
    var className = _ref2.className,
      style = _ref2.style;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", {
      className: "".concat(prefixCls, "-loading-icon"),
      style: style,
      ref: ref
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_ant_design_icons_es_icons_LoadingOutlined__WEBPACK_IMPORTED_MODULE_2__["default"], {
      className: className
    }));
  });
};
/* harmony default export */ __webpack_exports__["default"] = (LoadingIcon);

/***/ }),

/***/ "../node_modules/antd/es/button/button-group.js":
/*!******************************************************!*\
  !*** ../node_modules/antd/es/button/button-group.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupSizeContext: function() { return /* binding */ GroupSizeContext; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../_util/warning */ "../node_modules/antd/es/_util/warning.js");


var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};




var GroupSizeContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createContext(undefined);
var ButtonGroup = function ButtonGroup(props) {
  var _classNames;
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_3__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_4__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    direction = _React$useContext.direction;
  var customizePrefixCls = props.prefixCls,
    size = props.size,
    className = props.className,
    others = __rest(props, ["prefixCls", "size", "className"]);
  var prefixCls = getPrefixCls('btn-group', customizePrefixCls);
  // large => lg
  // small => sm
  var sizeCls = '';
  switch (size) {
    case 'large':
      sizeCls = 'lg';
      break;
    case 'small':
      sizeCls = 'sm';
      break;
    case 'middle':
    case undefined:
      break;
    default:
       true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_5__["default"])(!size, 'Button.Group', 'Invalid prop `size`.') : 0;
  }
  var classes = classnames__WEBPACK_IMPORTED_MODULE_2___default()(prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(sizeCls), sizeCls), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-rtl"), direction === 'rtl'), _classNames), className);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(GroupSizeContext.Provider, {
    value: size
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, others, {
    className: classes
  })));
};
/* harmony default export */ __webpack_exports__["default"] = (ButtonGroup);

/***/ }),

/***/ "../node_modules/antd/es/button/button.js":
/*!************************************************!*\
  !*** ../node_modules/antd/es/button/button.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertLegacyProps: function() { return /* binding */ convertLegacyProps; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/omit */ "../node_modules/rc-util/es/omit.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _config_provider_DisabledContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../config-provider/DisabledContext */ "../node_modules/antd/es/config-provider/DisabledContext.js");
/* harmony import */ var _config_provider_SizeContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../config-provider/SizeContext */ "../node_modules/antd/es/config-provider/SizeContext.js");
/* harmony import */ var _space_Compact__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../space/Compact */ "../node_modules/antd/es/space/Compact.js");
/* harmony import */ var _util_reactNode__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../_util/reactNode */ "../node_modules/antd/es/_util/reactNode.js");
/* harmony import */ var _util_type__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_util/type */ "../node_modules/antd/es/_util/type.js");
/* harmony import */ var _util_warning__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../_util/warning */ "../node_modules/antd/es/_util/warning.js");
/* harmony import */ var _util_wave__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../_util/wave */ "../node_modules/antd/es/_util/wave.js");
/* harmony import */ var _button_group__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./button-group */ "../node_modules/antd/es/button/button-group.js");
/* harmony import */ var _LoadingIcon__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./LoadingIcon */ "../node_modules/antd/es/button/LoadingIcon.js");




var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
/* eslint-disable react/button-has-type */













var rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
var isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function isString(str) {
  return typeof str === 'string';
}
function isUnBorderedButtonType(type) {
  return type === 'text' || type === 'link';
}
// Insert one space between two chinese characters automatically.
function insertSpace(child, needInserted) {
  // Check the child if is undefined or null.
  if (child === null || child === undefined) {
    return;
  }
  var SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  if (typeof child !== 'string' && typeof child !== 'number' && isString(child.type) && isTwoCNChar(child.props.children)) {
    return (0,_util_reactNode__WEBPACK_IMPORTED_MODULE_7__.cloneElement)(child, {
      children: child.props.children.split('').join(SPACE)
    });
  }
  if (typeof child === 'string') {
    return isTwoCNChar(child) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("span", null, child.split('').join(SPACE)) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("span", null, child);
  }
  if ((0,_util_reactNode__WEBPACK_IMPORTED_MODULE_7__.isFragment)(child)) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("span", null, child);
  }
  return child;
}
function spaceChildren(children, needInserted) {
  var isPrevChildPure = false;
  var childList = [];
  react__WEBPACK_IMPORTED_MODULE_6__.Children.forEach(children, function (child) {
    var type = (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_3__["default"])(child);
    var isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      var lastIndex = childList.length - 1;
      var lastChild = childList[lastIndex];
      childList[lastIndex] = "".concat(lastChild).concat(child);
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });
  // Pass to React.Children.map to auto fill key
  return react__WEBPACK_IMPORTED_MODULE_6__.Children.map(childList, function (child) {
    return insertSpace(child, needInserted);
  });
}
var ButtonTypes = (0,_util_type__WEBPACK_IMPORTED_MODULE_8__.tuple)('default', 'primary', 'ghost', 'dashed', 'link', 'text');
var ButtonShapes = (0,_util_type__WEBPACK_IMPORTED_MODULE_8__.tuple)('default', 'circle', 'round');
var ButtonHTMLTypes = (0,_util_type__WEBPACK_IMPORTED_MODULE_8__.tuple)('submit', 'button', 'reset');
function convertLegacyProps(type) {
  if (type === 'danger') {
    return {
      danger: true
    };
  }
  return {
    type: type
  };
}
var InternalButton = function InternalButton(props, ref) {
  var _classNames;
  var _props$loading = props.loading,
    loading = _props$loading === void 0 ? false : _props$loading,
    customizePrefixCls = props.prefixCls,
    _props$type = props.type,
    type = _props$type === void 0 ? 'default' : _props$type,
    danger = props.danger,
    _props$shape = props.shape,
    shape = _props$shape === void 0 ? 'default' : _props$shape,
    customizeSize = props.size,
    customDisabled = props.disabled,
    className = props.className,
    children = props.children,
    icon = props.icon,
    _props$ghost = props.ghost,
    ghost = _props$ghost === void 0 ? false : _props$ghost,
    _props$block = props.block,
    block = _props$block === void 0 ? false : _props$block,
    _props$htmlType = props.htmlType,
    htmlType = _props$htmlType === void 0 ? 'button' : _props$htmlType,
    rest = __rest(props, ["loading", "prefixCls", "type", "danger", "shape", "size", "disabled", "className", "children", "icon", "ghost", "block", "htmlType"]);
  var size = react__WEBPACK_IMPORTED_MODULE_6__.useContext(_config_provider_SizeContext__WEBPACK_IMPORTED_MODULE_9__["default"]);
  // ===================== Disabled =====================
  var disabled = react__WEBPACK_IMPORTED_MODULE_6__.useContext(_config_provider_DisabledContext__WEBPACK_IMPORTED_MODULE_10__["default"]);
  var mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  var groupSize = react__WEBPACK_IMPORTED_MODULE_6__.useContext(_button_group__WEBPACK_IMPORTED_MODULE_11__.GroupSizeContext);
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_6__.useState(!!loading),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_React$useState, 2),
    innerLoading = _React$useState2[0],
    setLoading = _React$useState2[1];
  var _React$useState3 = react__WEBPACK_IMPORTED_MODULE_6__.useState(false),
    _React$useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_React$useState3, 2),
    hasTwoCNChar = _React$useState4[0],
    setHasTwoCNChar = _React$useState4[1];
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_6__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_12__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    autoInsertSpaceInButton = _React$useContext.autoInsertSpaceInButton,
    direction = _React$useContext.direction;
  var buttonRef = ref || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createRef();
  var isNeedInserted = function isNeedInserted() {
    return react__WEBPACK_IMPORTED_MODULE_6__.Children.count(children) === 1 && !icon && !isUnBorderedButtonType(type);
  };
  var fixTwoCNChar = function fixTwoCNChar() {
    // Fix for HOC usage like <FormatMessage />
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    var buttonText = buttonRef.current.textContent;
    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  };
  // =============== Update Loading ===============
  var loadingOrDelay = typeof loading === 'boolean' ? loading : (loading === null || loading === void 0 ? void 0 : loading.delay) || true;
  react__WEBPACK_IMPORTED_MODULE_6__.useEffect(function () {
    var delayTimer = null;
    if (typeof loadingOrDelay === 'number') {
      delayTimer = window.setTimeout(function () {
        delayTimer = null;
        setLoading(loadingOrDelay);
      }, loadingOrDelay);
    } else {
      setLoading(loadingOrDelay);
    }
    return function () {
      if (delayTimer) {
        // in order to not perform a React state update on an unmounted component
        // and clear timer after 'loadingOrDelay' updated.
        window.clearTimeout(delayTimer);
        delayTimer = null;
      }
    };
  }, [loadingOrDelay]);
  react__WEBPACK_IMPORTED_MODULE_6__.useEffect(fixTwoCNChar, [buttonRef]);
  var handleClick = function handleClick(e) {
    var onClick = props.onClick;
    // https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    onClick === null || onClick === void 0 ? void 0 : onClick(e);
  };
   true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_13__["default"])(!(typeof icon === 'string' && icon.length > 2), 'Button', "`icon` is using ReactNode instead of string naming in v4. Please check `".concat(icon, "` at https://ant.design/components/icon")) : 0;
   true ? (0,_util_warning__WEBPACK_IMPORTED_MODULE_13__["default"])(!(ghost && isUnBorderedButtonType(type)), 'Button', "`link` or `text` button can't be a `ghost` button.") : 0;
  var prefixCls = getPrefixCls('btn', customizePrefixCls);
  var autoInsertSpace = autoInsertSpaceInButton !== false;
  var _useCompactItemContex = (0,_space_Compact__WEBPACK_IMPORTED_MODULE_14__.useCompactItemContext)(prefixCls, direction),
    compactSize = _useCompactItemContex.compactSize,
    compactItemClassnames = _useCompactItemContex.compactItemClassnames;
  var sizeClassNameMap = {
    large: 'lg',
    small: 'sm',
    middle: undefined
  };
  var sizeFullname = compactSize || groupSize || customizeSize || size;
  var sizeCls = sizeFullname ? sizeClassNameMap[sizeFullname] || '' : '';
  var iconType = innerLoading ? 'loading' : icon;
  var linkButtonRestProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_5__["default"])(rest, ['navigate']);
  var classes = classnames__WEBPACK_IMPORTED_MODULE_4___default()(prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(shape), shape !== 'default' && shape), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(type), type), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(sizeCls), sizeCls), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-icon-only"), !children && children !== 0 && !!iconType), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-background-ghost"), ghost && !isUnBorderedButtonType(type)), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-loading"), innerLoading), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-two-chinese-chars"), hasTwoCNChar && autoInsertSpace && !innerLoading), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-block"), block), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-dangerous"), !!danger), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-rtl"), direction === 'rtl'), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-disabled"), linkButtonRestProps.href !== undefined && mergedDisabled), _classNames), compactItemClassnames, className);
  var iconNode = icon && !innerLoading ? icon : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement(_LoadingIcon__WEBPACK_IMPORTED_MODULE_15__["default"], {
    existIcon: !!icon,
    prefixCls: prefixCls,
    loading: !!innerLoading
  });
  var kids = children || children === 0 ? spaceChildren(children, isNeedInserted() && autoInsertSpace) : null;
  if (linkButtonRestProps.href !== undefined) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("a", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, linkButtonRestProps, {
      className: classes,
      onClick: handleClick,
      ref: buttonRef
    }), iconNode, kids);
  }
  var buttonNode = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("button", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, rest, {
    type: htmlType,
    className: classes,
    onClick: handleClick,
    disabled: mergedDisabled,
    ref: buttonRef
  }), iconNode, kids);
  if (isUnBorderedButtonType(type)) {
    return buttonNode;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement(_util_wave__WEBPACK_IMPORTED_MODULE_16__["default"], {
    disabled: !!innerLoading
  }, buttonNode);
};
var Button = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.forwardRef(InternalButton);
if (true) {
  Button.displayName = 'Button';
}
Button.Group = _button_group__WEBPACK_IMPORTED_MODULE_11__["default"];
Button.__ANT_BUTTON = true;
/* harmony default export */ __webpack_exports__["default"] = (Button);

/***/ }),

/***/ "../node_modules/antd/es/button/index.js":
/*!***********************************************!*\
  !*** ../node_modules/antd/es/button/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _button__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./button */ "../node_modules/antd/es/button/button.js");

/* harmony default export */ __webpack_exports__["default"] = (_button__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/antd/es/calendar/locale/en_US.js":
/*!********************************************************!*\
  !*** ../node_modules/antd/es/calendar/locale/en_US.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../date-picker/locale/en_US */ "../node_modules/antd/es/date-picker/locale/en_US.js");

/* harmony default export */ __webpack_exports__["default"] = (_date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/antd/es/col/index.js":
/*!********************************************!*\
  !*** ../node_modules/antd/es/col/index.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../grid */ "../node_modules/antd/es/grid/col.js");

/* harmony default export */ __webpack_exports__["default"] = (_grid__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/antd/es/config-provider/DisabledContext.js":
/*!******************************************************************!*\
  !*** ../node_modules/antd/es/config-provider/DisabledContext.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DisabledContextProvider: function() { return /* binding */ DisabledContextProvider; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var DisabledContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(false);
var DisabledContextProvider = function DisabledContextProvider(_ref) {
  var children = _ref.children,
    disabled = _ref.disabled;
  var originDisabled = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DisabledContext);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DisabledContext.Provider, {
    value: disabled !== null && disabled !== void 0 ? disabled : originDisabled
  }, children);
};
/* harmony default export */ __webpack_exports__["default"] = (DisabledContext);

/***/ }),

/***/ "../node_modules/antd/es/config-provider/SizeContext.js":
/*!**************************************************************!*\
  !*** ../node_modules/antd/es/config-provider/SizeContext.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SizeContextProvider: function() { return /* binding */ SizeContextProvider; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var SizeContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(undefined);
var SizeContextProvider = function SizeContextProvider(_ref) {
  var children = _ref.children,
    size = _ref.size;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SizeContext.Consumer, null, function (originSize) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SizeContext.Provider, {
      value: size || originSize
    }, children);
  });
};
/* harmony default export */ __webpack_exports__["default"] = (SizeContext);

/***/ }),

/***/ "../node_modules/antd/es/config-provider/context.js":
/*!**********************************************************!*\
  !*** ../node_modules/antd/es/config-provider/context.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigConsumer: function() { return /* binding */ ConfigConsumer; },
/* harmony export */   ConfigContext: function() { return /* binding */ ConfigContext; },
/* harmony export */   withConfigConsumer: function() { return /* binding */ withConfigConsumer; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


var defaultGetPrefixCls = function defaultGetPrefixCls(suffixCls, customizePrefixCls) {
  if (customizePrefixCls) return customizePrefixCls;
  return suffixCls ? "ant-".concat(suffixCls) : 'ant';
};
// zombieJ: 🚨 Do not pass `defaultRenderEmpty` here since it will case circular dependency.
var ConfigContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createContext({
  // We provide a default function for Context without provider
  getPrefixCls: defaultGetPrefixCls
});
var ConfigConsumer = ConfigContext.Consumer;
/** @deprecated Use hooks instead. This is a legacy function */
function withConfigConsumer(config) {
  return function withConfigConsumerFunc(Component) {
    // Wrap with ConfigConsumer. Since we need compatible with react 15, be care when using ref methods
    var SFC = function SFC(props) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(ConfigConsumer, null, function (configProps) {
        var basicPrefixCls = config.prefixCls;
        var getPrefixCls = configProps.getPrefixCls;
        var customizePrefixCls = props.prefixCls;
        var prefixCls = getPrefixCls(basicPrefixCls, customizePrefixCls);
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(Component, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, configProps, props, {
          prefixCls: prefixCls
        }));
      });
    };
    var cons = Component.constructor;
    var name = cons && cons.displayName || Component.name || 'Component';
    if (true) {
      SFC.displayName = "withConfigConsumer(".concat(name, ")");
    }
    return SFC;
  };
}

/***/ }),

/***/ "../node_modules/antd/es/date-picker/locale/en_US.js":
/*!***********************************************************!*\
  !*** ../node_modules/antd/es/date-picker/locale/en_US.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var rc_picker_es_locale_en_US__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-picker/es/locale/en_US */ "../node_modules/rc-picker/es/locale/en_US.js");
/* harmony import */ var _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../time-picker/locale/en_US */ "../node_modules/antd/es/time-picker/locale/en_US.js");



// Merge into a locale object
var locale = {
  lang: (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    placeholder: 'Select date',
    yearPlaceholder: 'Select year',
    quarterPlaceholder: 'Select quarter',
    monthPlaceholder: 'Select month',
    weekPlaceholder: 'Select week',
    rangePlaceholder: ['Start date', 'End date'],
    rangeYearPlaceholder: ['Start year', 'End year'],
    rangeQuarterPlaceholder: ['Start quarter', 'End quarter'],
    rangeMonthPlaceholder: ['Start month', 'End month'],
    rangeWeekPlaceholder: ['Start week', 'End week']
  }, rc_picker_es_locale_en_US__WEBPACK_IMPORTED_MODULE_1__["default"]),
  timePickerLocale: (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__["default"])
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
/* harmony default export */ __webpack_exports__["default"] = (locale);

/***/ }),

/***/ "../node_modules/antd/es/grid/RowContext.js":
/*!**************************************************!*\
  !*** ../node_modules/antd/es/grid/RowContext.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

var RowContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({});
/* harmony default export */ __webpack_exports__["default"] = (RowContext);

/***/ }),

/***/ "../node_modules/antd/es/grid/col.js":
/*!*******************************************!*\
  !*** ../node_modules/antd/es/grid/col.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _RowContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./RowContext */ "../node_modules/antd/es/grid/RowContext.js");



var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};




function parseFlex(flex) {
  if (typeof flex === 'number') {
    return "".concat(flex, " ").concat(flex, " auto");
  }
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return "0 0 ".concat(flex);
  }
  return flex;
}
var sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
var Col = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.forwardRef(function (props, ref) {
  var _classNames;
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_4__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_5__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    direction = _React$useContext.direction;
  var _React$useContext2 = react__WEBPACK_IMPORTED_MODULE_4__.useContext(_RowContext__WEBPACK_IMPORTED_MODULE_6__["default"]),
    gutter = _React$useContext2.gutter,
    wrap = _React$useContext2.wrap,
    supportFlexGap = _React$useContext2.supportFlexGap;
  var customizePrefixCls = props.prefixCls,
    span = props.span,
    order = props.order,
    offset = props.offset,
    push = props.push,
    pull = props.pull,
    className = props.className,
    children = props.children,
    flex = props.flex,
    style = props.style,
    others = __rest(props, ["prefixCls", "span", "order", "offset", "push", "pull", "className", "children", "flex", "style"]);
  var prefixCls = getPrefixCls('col', customizePrefixCls);
  var sizeClassObj = {};
  sizes.forEach(function (size) {
    var _extends2;
    var sizeProps = {};
    var propSize = props[size];
    if (typeof propSize === 'number') {
      sizeProps.span = propSize;
    } else if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(propSize) === 'object') {
      sizeProps = propSize || {};
    }
    delete others[size];
    sizeClassObj = (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({}, sizeClassObj), (_extends2 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-").concat(size, "-").concat(sizeProps.span), sizeProps.span !== undefined), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-").concat(size, "-order-").concat(sizeProps.order), sizeProps.order || sizeProps.order === 0), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-").concat(size, "-offset-").concat(sizeProps.offset), sizeProps.offset || sizeProps.offset === 0), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-").concat(size, "-push-").concat(sizeProps.push), sizeProps.push || sizeProps.push === 0), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-").concat(size, "-pull-").concat(sizeProps.pull), sizeProps.pull || sizeProps.pull === 0), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_extends2, "".concat(prefixCls, "-rtl"), direction === 'rtl'), _extends2));
  });
  var classes = classnames__WEBPACK_IMPORTED_MODULE_3___default()(prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-").concat(span), span !== undefined), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-order-").concat(order), order), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-offset-").concat(offset), offset), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-push-").concat(push), push), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-pull-").concat(pull), pull), _classNames), className, sizeClassObj);
  var mergedStyle = {};
  // Horizontal gutter use padding
  if (gutter && gutter[0] > 0) {
    var horizontalGutter = gutter[0] / 2;
    mergedStyle.paddingLeft = horizontalGutter;
    mergedStyle.paddingRight = horizontalGutter;
  }
  // Vertical gutter use padding when gap not support
  if (gutter && gutter[1] > 0 && !supportFlexGap) {
    var verticalGutter = gutter[1] / 2;
    mergedStyle.paddingTop = verticalGutter;
    mergedStyle.paddingBottom = verticalGutter;
  }
  if (flex) {
    mergedStyle.flex = parseFlex(flex);
    // Hack for Firefox to avoid size issue
    // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
    if (wrap === false && !mergedStyle.minWidth) {
      mergedStyle.minWidth = 0;
    }
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({}, others, {
    style: (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({}, mergedStyle), style),
    className: classes,
    ref: ref
  }), children);
});
if (true) {
  Col.displayName = 'Col';
}
/* harmony default export */ __webpack_exports__["default"] = (Col);

/***/ }),

/***/ "../node_modules/antd/es/grid/row.js":
/*!*******************************************!*\
  !*** ../node_modules/antd/es/grid/row.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _util_hooks_useFlexGapSupport__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../_util/hooks/useFlexGapSupport */ "../node_modules/antd/es/_util/hooks/useFlexGapSupport.js");
/* harmony import */ var _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../_util/responsiveObserve */ "../node_modules/antd/es/_util/responsiveObserve.js");
/* harmony import */ var _util_type__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../_util/type */ "../node_modules/antd/es/_util/type.js");
/* harmony import */ var _RowContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./RowContext */ "../node_modules/antd/es/grid/RowContext.js");




var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};







var RowAligns = (0,_util_type__WEBPACK_IMPORTED_MODULE_6__.tuple)('top', 'middle', 'bottom', 'stretch');
var RowJustify = (0,_util_type__WEBPACK_IMPORTED_MODULE_6__.tuple)('start', 'end', 'center', 'space-around', 'space-between', 'space-evenly');
function useMergePropByScreen(oriProp, screen) {
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_5__.useState(typeof oriProp === 'string' ? oriProp : ''),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_React$useState, 2),
    prop = _React$useState2[0],
    setProp = _React$useState2[1];
  var clacMergeAlignOrJustify = function clacMergeAlignOrJustify() {
    if (typeof oriProp === 'string') {
      setProp(oriProp);
    }
    if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(oriProp) !== 'object') {
      return;
    }
    for (var i = 0; i < _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__.responsiveArray.length; i++) {
      var breakpoint = _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__.responsiveArray[i];
      // if do not match, do nothing
      if (!screen[breakpoint]) continue;
      var curVal = oriProp[breakpoint];
      if (curVal !== undefined) {
        setProp(curVal);
        return;
      }
    }
  };
  react__WEBPACK_IMPORTED_MODULE_5__.useEffect(function () {
    clacMergeAlignOrJustify();
  }, [JSON.stringify(oriProp), screen]);
  return prop;
}
var Row = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.forwardRef(function (props, ref) {
  var _classNames;
  var customizePrefixCls = props.prefixCls,
    justify = props.justify,
    align = props.align,
    className = props.className,
    style = props.style,
    children = props.children,
    _props$gutter = props.gutter,
    gutter = _props$gutter === void 0 ? 0 : _props$gutter,
    wrap = props.wrap,
    others = __rest(props, ["prefixCls", "justify", "align", "className", "style", "children", "gutter", "wrap"]);
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_5__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_8__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    direction = _React$useContext.direction;
  var _React$useState3 = react__WEBPACK_IMPORTED_MODULE_5__.useState({
      xs: true,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      xxl: true
    }),
    _React$useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_React$useState3, 2),
    screens = _React$useState4[0],
    setScreens = _React$useState4[1];
  // to save screens info when responsiveObserve callback had been call
  var _React$useState5 = react__WEBPACK_IMPORTED_MODULE_5__.useState({
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      xxl: false
    }),
    _React$useState6 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_React$useState5, 2),
    curScreens = _React$useState6[0],
    setCurScreens = _React$useState6[1];
  // ================================== calc reponsive data ==================================
  var mergeAlign = useMergePropByScreen(align, curScreens);
  var mergeJustify = useMergePropByScreen(justify, curScreens);
  var supportFlexGap = (0,_util_hooks_useFlexGapSupport__WEBPACK_IMPORTED_MODULE_9__["default"])();
  var gutterRef = react__WEBPACK_IMPORTED_MODULE_5__.useRef(gutter);
  // ================================== Effect ==================================
  react__WEBPACK_IMPORTED_MODULE_5__.useEffect(function () {
    var token = _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__["default"].subscribe(function (screen) {
      setCurScreens(screen);
      var currentGutter = gutterRef.current || 0;
      if (!Array.isArray(currentGutter) && (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(currentGutter) === 'object' || Array.isArray(currentGutter) && ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(currentGutter[0]) === 'object' || (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(currentGutter[1]) === 'object')) {
        setScreens(screen);
      }
    });
    return function () {
      return _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__["default"].unsubscribe(token);
    };
  }, []);
  // ================================== Render ==================================
  var getGutter = function getGutter() {
    var results = [undefined, undefined];
    var normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, undefined];
    normalizedGutter.forEach(function (g, index) {
      if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(g) === 'object') {
        for (var i = 0; i < _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__.responsiveArray.length; i++) {
          var breakpoint = _util_responsiveObserve__WEBPACK_IMPORTED_MODULE_7__.responsiveArray[i];
          if (screens[breakpoint] && g[breakpoint] !== undefined) {
            results[index] = g[breakpoint];
            break;
          }
        }
      } else {
        results[index] = g;
      }
    });
    return results;
  };
  var prefixCls = getPrefixCls('row', customizePrefixCls);
  var gutters = getGutter();
  var classes = classnames__WEBPACK_IMPORTED_MODULE_4___default()(prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-no-wrap"), wrap === false), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(mergeJustify), mergeJustify), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-").concat(mergeAlign), mergeAlign), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-rtl"), direction === 'rtl'), _classNames), className);
  // Add gutter related style
  var rowStyle = {};
  var horizontalGutter = gutters[0] != null && gutters[0] > 0 ? gutters[0] / -2 : undefined;
  var verticalGutter = gutters[1] != null && gutters[1] > 0 ? gutters[1] / -2 : undefined;
  if (horizontalGutter) {
    rowStyle.marginLeft = horizontalGutter;
    rowStyle.marginRight = horizontalGutter;
  }
  if (supportFlexGap) {
    // Set gap direct if flex gap support
    var _gutters = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(gutters, 2);
    rowStyle.rowGap = _gutters[1];
  } else if (verticalGutter) {
    rowStyle.marginTop = verticalGutter;
    rowStyle.marginBottom = verticalGutter;
  }
  // "gutters" is a new array in each rendering phase, it'll make 'React.useMemo' effectless.
  // So we deconstruct "gutters" variable here.
  var _gutters2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(gutters, 2),
    gutterH = _gutters2[0],
    gutterV = _gutters2[1];
  var rowContext = react__WEBPACK_IMPORTED_MODULE_5__.useMemo(function () {
    return {
      gutter: [gutterH, gutterV],
      wrap: wrap,
      supportFlexGap: supportFlexGap
    };
  }, [gutterH, gutterV, wrap, supportFlexGap]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_RowContext__WEBPACK_IMPORTED_MODULE_10__["default"].Provider, {
    value: rowContext
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, others, {
    className: classes,
    style: (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, rowStyle), style),
    ref: ref
  }), children));
});
if (true) {
  Row.displayName = 'Row';
}
/* harmony default export */ __webpack_exports__["default"] = (Row);

/***/ }),

/***/ "../node_modules/antd/es/image/PreviewGroup.js":
/*!*****************************************************!*\
  !*** ../node_modules/antd/es/image/PreviewGroup.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   icons: function() { return /* binding */ icons; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _ant_design_icons_es_icons_CloseOutlined__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ant-design/icons/es/icons/CloseOutlined */ "../node_modules/@ant-design/icons/es/icons/CloseOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "../node_modules/@ant-design/icons/es/icons/LeftOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "../node_modules/@ant-design/icons/es/icons/RightOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_RotateLeftOutlined__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons/es/icons/RotateLeftOutlined */ "../node_modules/@ant-design/icons/es/icons/RotateLeftOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_RotateRightOutlined__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ant-design/icons/es/icons/RotateRightOutlined */ "../node_modules/@ant-design/icons/es/icons/RotateRightOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_ZoomInOutlined__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ant-design/icons/es/icons/ZoomInOutlined */ "../node_modules/@ant-design/icons/es/icons/ZoomInOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_ZoomOutOutlined__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @ant-design/icons/es/icons/ZoomOutOutlined */ "../node_modules/@ant-design/icons/es/icons/ZoomOutOutlined.js");
/* harmony import */ var rc_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-image */ "../node_modules/rc-image/es/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../_util/motion */ "../node_modules/antd/es/_util/motion.js");


var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};











var icons = {
  rotateLeft: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_RotateLeftOutlined__WEBPACK_IMPORTED_MODULE_4__["default"], null),
  rotateRight: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_RotateRightOutlined__WEBPACK_IMPORTED_MODULE_5__["default"], null),
  zoomIn: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_ZoomInOutlined__WEBPACK_IMPORTED_MODULE_6__["default"], null),
  zoomOut: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_ZoomOutOutlined__WEBPACK_IMPORTED_MODULE_7__["default"], null),
  close: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_CloseOutlined__WEBPACK_IMPORTED_MODULE_8__["default"], null),
  left: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_9__["default"], null),
  right: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_10__["default"], null)
};
var InternalPreviewGroup = function InternalPreviewGroup(_a) {
  var customizePrefixCls = _a.previewPrefixCls,
    preview = _a.preview,
    props = __rest(_a, ["previewPrefixCls", "preview"]);
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_3__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_11__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls;
  var prefixCls = getPrefixCls('image-preview', customizePrefixCls);
  var rootPrefixCls = getPrefixCls();
  var mergedPreview = react__WEBPACK_IMPORTED_MODULE_3__.useMemo(function () {
    if (preview === false) {
      return preview;
    }
    var _preview = (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(preview) === 'object' ? preview : {};
    return (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, _preview), {
      transitionName: (0,_util_motion__WEBPACK_IMPORTED_MODULE_12__.getTransitionName)(rootPrefixCls, 'zoom', _preview.transitionName),
      maskTransitionName: (0,_util_motion__WEBPACK_IMPORTED_MODULE_12__.getTransitionName)(rootPrefixCls, 'fade', _preview.maskTransitionName)
    });
  }, [preview]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(rc_image__WEBPACK_IMPORTED_MODULE_2__["default"].PreviewGroup, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    preview: mergedPreview,
    previewPrefixCls: prefixCls,
    icons: icons
  }, props));
};
/* harmony default export */ __webpack_exports__["default"] = (InternalPreviewGroup);

/***/ }),

/***/ "../node_modules/antd/es/image/index.js":
/*!**********************************************!*\
  !*** ../node_modules/antd/es/image/index.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _ant_design_icons_es_icons_EyeOutlined__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ant-design/icons/es/icons/EyeOutlined */ "../node_modules/@ant-design/icons/es/icons/EyeOutlined.js");
/* harmony import */ var rc_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-image */ "../node_modules/rc-image/es/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _locale_en_US__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../locale/en_US */ "../node_modules/antd/es/locale/en_US.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_util/motion */ "../node_modules/antd/es/_util/motion.js");
/* harmony import */ var _PreviewGroup__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./PreviewGroup */ "../node_modules/antd/es/image/PreviewGroup.js");


var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};








var Image = function Image(_a) {
  var customizePrefixCls = _a.prefixCls,
    preview = _a.preview,
    otherProps = __rest(_a, ["prefixCls", "preview"]);
  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_3__.useContext)(_config_provider__WEBPACK_IMPORTED_MODULE_4__.ConfigContext),
    getPrefixCls = _useContext.getPrefixCls,
    _useContext$locale = _useContext.locale,
    contextLocale = _useContext$locale === void 0 ? _locale_en_US__WEBPACK_IMPORTED_MODULE_5__["default"] : _useContext$locale,
    getContextPopupContainer = _useContext.getPopupContainer;
  var prefixCls = getPrefixCls('image', customizePrefixCls);
  var rootPrefixCls = getPrefixCls();
  var imageLocale = contextLocale.Image || _locale_en_US__WEBPACK_IMPORTED_MODULE_5__["default"].Image;
  var mergedPreview = react__WEBPACK_IMPORTED_MODULE_3__.useMemo(function () {
    if (preview === false) {
      return preview;
    }
    var _preview = (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(preview) === 'object' ? preview : {};
    var getContainer = _preview.getContainer,
      restPreviewProps = __rest(_preview, ["getContainer"]);
    return (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
      mask: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", {
        className: "".concat(prefixCls, "-mask-info")
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_ant_design_icons_es_icons_EyeOutlined__WEBPACK_IMPORTED_MODULE_6__["default"], null), imageLocale === null || imageLocale === void 0 ? void 0 : imageLocale.preview),
      icons: _PreviewGroup__WEBPACK_IMPORTED_MODULE_7__.icons
    }, restPreviewProps), {
      getContainer: getContainer || getContextPopupContainer,
      transitionName: (0,_util_motion__WEBPACK_IMPORTED_MODULE_8__.getTransitionName)(rootPrefixCls, 'zoom', _preview.transitionName),
      maskTransitionName: (0,_util_motion__WEBPACK_IMPORTED_MODULE_8__.getTransitionName)(rootPrefixCls, 'fade', _preview.maskTransitionName)
    });
  }, [preview, imageLocale]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(rc_image__WEBPACK_IMPORTED_MODULE_2__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    prefixCls: prefixCls,
    preview: mergedPreview
  }, otherProps));
};
Image.PreviewGroup = _PreviewGroup__WEBPACK_IMPORTED_MODULE_7__["default"];
/* harmony default export */ __webpack_exports__["default"] = (Image);

/***/ }),

/***/ "../node_modules/antd/es/layout/Sider.js":
/*!***********************************************!*\
  !*** ../node_modules/antd/es/layout/Sider.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SiderContext: function() { return /* binding */ SiderContext; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ant-design/icons/es/icons/BarsOutlined */ "../node_modules/@ant-design/icons/es/icons/BarsOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ant-design/icons/es/icons/LeftOutlined */ "../node_modules/@ant-design/icons/es/icons/LeftOutlined.js");
/* harmony import */ var _ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ant-design/icons/es/icons/RightOutlined */ "../node_modules/@ant-design/icons/es/icons/RightOutlined.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_util_es_omit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/omit */ "../node_modules/rc-util/es/omit.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");
/* harmony import */ var _util_isNumeric__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_util/isNumeric */ "../node_modules/antd/es/_util/isNumeric.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./layout */ "../node_modules/antd/es/layout/layout.js");



var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};










var dimensionMaxMap = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px'
};
var SiderContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createContext({});
var generateId = function () {
  var i = 0;
  return function () {
    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    i += 1;
    return "".concat(prefix).concat(i);
  };
}();
var Sider = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.forwardRef(function (_a, ref) {
  var customizePrefixCls = _a.prefixCls,
    className = _a.className,
    trigger = _a.trigger,
    children = _a.children,
    _a$defaultCollapsed = _a.defaultCollapsed,
    defaultCollapsed = _a$defaultCollapsed === void 0 ? false : _a$defaultCollapsed,
    _a$theme = _a.theme,
    theme = _a$theme === void 0 ? 'dark' : _a$theme,
    _a$style = _a.style,
    style = _a$style === void 0 ? {} : _a$style,
    _a$collapsible = _a.collapsible,
    collapsible = _a$collapsible === void 0 ? false : _a$collapsible,
    _a$reverseArrow = _a.reverseArrow,
    reverseArrow = _a$reverseArrow === void 0 ? false : _a$reverseArrow,
    _a$width = _a.width,
    width = _a$width === void 0 ? 200 : _a$width,
    _a$collapsedWidth = _a.collapsedWidth,
    collapsedWidth = _a$collapsedWidth === void 0 ? 80 : _a$collapsedWidth,
    zeroWidthTriggerStyle = _a.zeroWidthTriggerStyle,
    breakpoint = _a.breakpoint,
    onCollapse = _a.onCollapse,
    onBreakpoint = _a.onBreakpoint,
    props = __rest(_a, ["prefixCls", "className", "trigger", "children", "defaultCollapsed", "theme", "style", "collapsible", "reverseArrow", "width", "collapsedWidth", "zeroWidthTriggerStyle", "breakpoint", "onCollapse", "onBreakpoint"]);
  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_5__.useContext)(_layout__WEBPACK_IMPORTED_MODULE_6__.LayoutContext),
    siderHook = _useContext.siderHook;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_5__.useState)('collapsed' in props ? props.collapsed : defaultCollapsed),
    _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    collapsed = _useState2[0],
    setCollapsed = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_5__.useState)(false),
    _useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    below = _useState4[0],
    setBelow = _useState4[1];
  (0,react__WEBPACK_IMPORTED_MODULE_5__.useEffect)(function () {
    if ('collapsed' in props) {
      setCollapsed(props.collapsed);
    }
  }, [props.collapsed]);
  var handleSetCollapsed = function handleSetCollapsed(value, type) {
    if (!('collapsed' in props)) {
      setCollapsed(value);
    }
    onCollapse === null || onCollapse === void 0 ? void 0 : onCollapse(value, type);
  };
  // ========================= Responsive =========================
  var responsiveHandlerRef = (0,react__WEBPACK_IMPORTED_MODULE_5__.useRef)();
  responsiveHandlerRef.current = function (mql) {
    setBelow(mql.matches);
    onBreakpoint === null || onBreakpoint === void 0 ? void 0 : onBreakpoint(mql.matches);
    if (collapsed !== mql.matches) {
      handleSetCollapsed(mql.matches, 'responsive');
    }
  };
  (0,react__WEBPACK_IMPORTED_MODULE_5__.useEffect)(function () {
    function responsiveHandler(mql) {
      return responsiveHandlerRef.current(mql);
    }
    var mql;
    if (typeof window !== 'undefined') {
      var _window = window,
        matchMedia = _window.matchMedia;
      if (matchMedia && breakpoint && breakpoint in dimensionMaxMap) {
        mql = matchMedia("(max-width: ".concat(dimensionMaxMap[breakpoint], ")"));
        try {
          mql.addEventListener('change', responsiveHandler);
        } catch (error) {
          mql.addListener(responsiveHandler);
        }
        responsiveHandler(mql);
      }
    }
    return function () {
      try {
        mql === null || mql === void 0 ? void 0 : mql.removeEventListener('change', responsiveHandler);
      } catch (error) {
        mql === null || mql === void 0 ? void 0 : mql.removeListener(responsiveHandler);
      }
    };
  }, [breakpoint]); // in order to accept dynamic 'breakpoint' property, we need to add 'breakpoint' into dependency array.
  (0,react__WEBPACK_IMPORTED_MODULE_5__.useEffect)(function () {
    var uniqueId = generateId('ant-sider-');
    siderHook.addSider(uniqueId);
    return function () {
      return siderHook.removeSider(uniqueId);
    };
  }, []);
  var toggle = function toggle() {
    handleSetCollapsed(!collapsed, 'clickTrigger');
  };
  var _useContext2 = (0,react__WEBPACK_IMPORTED_MODULE_5__.useContext)(_config_provider__WEBPACK_IMPORTED_MODULE_7__.ConfigContext),
    getPrefixCls = _useContext2.getPrefixCls;
  var renderSider = function renderSider() {
    var _classNames;
    var prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
    var divProps = (0,rc_util_es_omit__WEBPACK_IMPORTED_MODULE_4__["default"])(props, ['collapsed']);
    var rawWidth = collapsed ? collapsedWidth : width;
    // use "px" as fallback unit for width
    var siderWidth = (0,_util_isNumeric__WEBPACK_IMPORTED_MODULE_8__["default"])(rawWidth) ? "".concat(rawWidth, "px") : String(rawWidth);
    // special trigger when collapsedWidth == 0
    var zeroWidthTrigger = parseFloat(String(collapsedWidth || 0)) === 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("span", {
      onClick: toggle,
      className: classnames__WEBPACK_IMPORTED_MODULE_3___default()("".concat(prefixCls, "-zero-width-trigger"), "".concat(prefixCls, "-zero-width-trigger-").concat(reverseArrow ? 'right' : 'left')),
      style: zeroWidthTriggerStyle
    }, trigger || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_BarsOutlined__WEBPACK_IMPORTED_MODULE_9__["default"], null)) : null;
    var iconObj = {
      expanded: reverseArrow ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_10__["default"], null) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_11__["default"], null),
      collapsed: reverseArrow ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_LeftOutlined__WEBPACK_IMPORTED_MODULE_11__["default"], null) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(_ant_design_icons_es_icons_RightOutlined__WEBPACK_IMPORTED_MODULE_10__["default"], null)
    };
    var status = collapsed ? 'collapsed' : 'expanded';
    var defaultTrigger = iconObj[status];
    var triggerDom = trigger !== null ? zeroWidthTrigger || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-trigger"),
      onClick: toggle,
      style: {
        width: siderWidth
      }
    }, trigger || defaultTrigger) : null;
    var divStyle = (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({}, style), {
      flex: "0 0 ".concat(siderWidth),
      maxWidth: siderWidth,
      minWidth: siderWidth,
      width: siderWidth
    });
    var siderCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()(prefixCls, "".concat(prefixCls, "-").concat(theme), (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-collapsed"), !!collapsed), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-has-trigger"), collapsible && trigger !== null && !zeroWidthTrigger), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-below"), !!below), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, "".concat(prefixCls, "-zero-width"), parseFloat(siderWidth) === 0), _classNames), className);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("aside", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({
      className: siderCls
    }, divProps, {
      style: divStyle,
      ref: ref
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement("div", {
      className: "".concat(prefixCls, "-children")
    }, children), collapsible || below && zeroWidthTrigger ? triggerDom : null);
  };
  var contextValue = react__WEBPACK_IMPORTED_MODULE_5__.useMemo(function () {
    return {
      siderCollapsed: collapsed
    };
  }, [collapsed]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(SiderContext.Provider, {
    value: contextValue
  }, renderSider());
});
if (true) {
  Sider.displayName = 'Sider';
}
/* harmony default export */ __webpack_exports__["default"] = (Sider);

/***/ }),

/***/ "../node_modules/antd/es/layout/index.js":
/*!***********************************************!*\
  !*** ../node_modules/antd/es/layout/index.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "../node_modules/antd/es/layout/layout.js");
/* harmony import */ var _Sider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Sider */ "../node_modules/antd/es/layout/Sider.js");


var Layout = _layout__WEBPACK_IMPORTED_MODULE_0__["default"];
Layout.Header = _layout__WEBPACK_IMPORTED_MODULE_0__.Header;
Layout.Footer = _layout__WEBPACK_IMPORTED_MODULE_0__.Footer;
Layout.Content = _layout__WEBPACK_IMPORTED_MODULE_0__.Content;
Layout.Sider = _Sider__WEBPACK_IMPORTED_MODULE_1__["default"];
/* harmony default export */ __webpack_exports__["default"] = (Layout);

/***/ }),

/***/ "../node_modules/antd/es/layout/layout.js":
/*!************************************************!*\
  !*** ../node_modules/antd/es/layout/layout.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Content: function() { return /* binding */ Content; },
/* harmony export */   Footer: function() { return /* binding */ Footer; },
/* harmony export */   Header: function() { return /* binding */ Header; },
/* harmony export */   LayoutContext: function() { return /* binding */ LayoutContext; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "../node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");




var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};



var LayoutContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createContext({
  siderHook: {
    addSider: function addSider() {
      return null;
    },
    removeSider: function removeSider() {
      return null;
    }
  }
});
function generator(_ref) {
  var suffixCls = _ref.suffixCls,
    tagName = _ref.tagName,
    displayName = _ref.displayName;
  return function (BasicComponent) {
    var Adapter = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.forwardRef(function (props, ref) {
      var _React$useContext = react__WEBPACK_IMPORTED_MODULE_5__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_6__.ConfigContext),
        getPrefixCls = _React$useContext.getPrefixCls;
      var customizePrefixCls = props.prefixCls;
      var prefixCls = getPrefixCls(suffixCls, customizePrefixCls);
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(BasicComponent, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_3__["default"])({
        ref: ref,
        prefixCls: prefixCls,
        tagName: tagName
      }, props));
    });
    if (true) {
      Adapter.displayName = displayName;
    }
    return Adapter;
  };
}
var Basic = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.forwardRef(function (props, ref) {
  var prefixCls = props.prefixCls,
    className = props.className,
    children = props.children,
    tagName = props.tagName,
    others = __rest(props, ["prefixCls", "className", "children", "tagName"]);
  var classString = classnames__WEBPACK_IMPORTED_MODULE_4___default()(prefixCls, className);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(tagName, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_3__["default"])((0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_3__["default"])({
    className: classString
  }, others), {
    ref: ref
  }), children);
});
var BasicLayout = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.forwardRef(function (props, ref) {
  var _classNames;
  var _React$useContext2 = react__WEBPACK_IMPORTED_MODULE_5__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_6__.ConfigContext),
    direction = _React$useContext2.direction;
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_5__.useState([]),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_React$useState, 2),
    siders = _React$useState2[0],
    setSiders = _React$useState2[1];
  var prefixCls = props.prefixCls,
    className = props.className,
    children = props.children,
    hasSider = props.hasSider,
    Tag = props.tagName,
    others = __rest(props, ["prefixCls", "className", "children", "hasSider", "tagName"]);
  var classString = classnames__WEBPACK_IMPORTED_MODULE_4___default()(prefixCls, (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-has-sider"), typeof hasSider === 'boolean' ? hasSider : siders.length > 0), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-rtl"), direction === 'rtl'), _classNames), className);
  var contextValue = react__WEBPACK_IMPORTED_MODULE_5__.useMemo(function () {
    return {
      siderHook: {
        addSider: function addSider(id) {
          setSiders(function (prev) {
            return [].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(prev), [id]);
          });
        },
        removeSider: function removeSider(id) {
          setSiders(function (prev) {
            return prev.filter(function (currentId) {
              return currentId !== id;
            });
          });
        }
      }
    };
  }, []);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(LayoutContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5__.createElement(Tag, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_3__["default"])({
    ref: ref,
    className: classString
  }, others), children));
});
var Layout = generator({
  suffixCls: 'layout',
  tagName: 'section',
  displayName: 'Layout'
})(BasicLayout);
var Header = generator({
  suffixCls: 'layout-header',
  tagName: 'header',
  displayName: 'Header'
})(Basic);
var Footer = generator({
  suffixCls: 'layout-footer',
  tagName: 'footer',
  displayName: 'Footer'
})(Basic);
var Content = generator({
  suffixCls: 'layout-content',
  tagName: 'main',
  displayName: 'Content'
})(Basic);

/* harmony default export */ __webpack_exports__["default"] = (Layout);

/***/ }),

/***/ "../node_modules/antd/es/locale/default.js":
/*!*************************************************!*\
  !*** ../node_modules/antd/es/locale/default.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rc_pagination_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-pagination/es/locale/en_US */ "../node_modules/rc-pagination/es/locale/en_US.js");
/* harmony import */ var _calendar_locale_en_US__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../calendar/locale/en_US */ "../node_modules/antd/es/calendar/locale/en_US.js");
/* harmony import */ var _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../date-picker/locale/en_US */ "../node_modules/antd/es/date-picker/locale/en_US.js");
/* harmony import */ var _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../time-picker/locale/en_US */ "../node_modules/antd/es/time-picker/locale/en_US.js");
/* eslint-disable no-template-curly-in-string */




var typeTemplate = '${label} is not a valid ${type}';
var localeValues = {
  locale: 'en',
  Pagination: rc_pagination_es_locale_en_US__WEBPACK_IMPORTED_MODULE_0__["default"],
  DatePicker: _date_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_1__["default"],
  TimePicker: _time_picker_locale_en_US__WEBPACK_IMPORTED_MODULE_2__["default"],
  Calendar: _calendar_locale_en_US__WEBPACK_IMPORTED_MODULE_3__["default"],
  global: {
    placeholder: 'Please select'
  },
  Table: {
    filterTitle: 'Filter menu',
    filterConfirm: 'OK',
    filterReset: 'Reset',
    filterEmptyText: 'No filters',
    filterCheckall: 'Select all items',
    filterSearchPlaceholder: 'Search in filters',
    emptyText: 'No data',
    selectAll: 'Select current page',
    selectInvert: 'Invert current page',
    selectNone: 'Clear all data',
    selectionAll: 'Select all data',
    sortTitle: 'Sort',
    expand: 'Expand row',
    collapse: 'Collapse row',
    triggerDesc: 'Click to sort descending',
    triggerAsc: 'Click to sort ascending',
    cancelSort: 'Click to cancel sorting'
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK'
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Cancel'
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Search here',
    itemUnit: 'item',
    itemsUnit: 'items',
    remove: 'Remove',
    selectCurrent: 'Select current page',
    removeCurrent: 'Remove current page',
    selectAll: 'Select all data',
    removeAll: 'Remove all data',
    selectInvert: 'Invert current page'
  },
  Upload: {
    uploading: 'Uploading...',
    removeFile: 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
    downloadFile: 'Download file'
  },
  Empty: {
    description: 'No data'
  },
  Icon: {
    icon: 'icon'
  },
  Text: {
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied',
    expand: 'Expand'
  },
  PageHeader: {
    back: 'Back'
  },
  Form: {
    optional: '(optional)',
    defaultValidateMessages: {
      "default": 'Field validation error for ${label}',
      required: 'Please enter ${label}',
      "enum": '${label} must be one of [${enum}]',
      whitespace: '${label} cannot be a blank character',
      date: {
        format: '${label} date format is invalid',
        parse: '${label} cannot be converted to a date',
        invalid: '${label} is an invalid date'
      },
      types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: typeTemplate,
        date: typeTemplate,
        "boolean": typeTemplate,
        integer: typeTemplate,
        "float": typeTemplate,
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate
      },
      string: {
        len: '${label} must be ${len} characters',
        min: '${label} must be at least ${min} characters',
        max: '${label} must be up to ${max} characters',
        range: '${label} must be between ${min}-${max} characters'
      },
      number: {
        len: '${label} must be equal to ${len}',
        min: '${label} must be minimum ${min}',
        max: '${label} must be maximum ${max}',
        range: '${label} must be between ${min}-${max}'
      },
      array: {
        len: 'Must be ${len} ${label}',
        min: 'At least ${min} ${label}',
        max: 'At most ${max} ${label}',
        range: 'The amount of ${label} must be between ${min}-${max}'
      },
      pattern: {
        mismatch: '${label} does not match the pattern ${pattern}'
      }
    }
  },
  Image: {
    preview: 'Preview'
  }
};
/* harmony default export */ __webpack_exports__["default"] = (localeValues);

/***/ }),

/***/ "../node_modules/antd/es/locale/en_US.js":
/*!***********************************************!*\
  !*** ../node_modules/antd/es/locale/en_US.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _default__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./default */ "../node_modules/antd/es/locale/default.js");

/* harmony default export */ __webpack_exports__["default"] = (_default__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/antd/es/row/index.js":
/*!********************************************!*\
  !*** ../node_modules/antd/es/row/index.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../grid */ "../node_modules/antd/es/grid/row.js");

/* harmony default export */ __webpack_exports__["default"] = (_grid__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/antd/es/space/Compact.js":
/*!************************************************!*\
  !*** ../node_modules/antd/es/space/Compact.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NoCompactStyle: function() { return /* binding */ NoCompactStyle; },
/* harmony export */   SpaceCompactItemContext: function() { return /* binding */ SpaceCompactItemContext; },
/* harmony export */   useCompactItemContext: function() { return /* binding */ useCompactItemContext; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/Children/toArray */ "../node_modules/rc-util/es/Children/toArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _config_provider__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../config-provider */ "../node_modules/antd/es/config-provider/context.js");


var __rest = undefined && undefined.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};




var SpaceCompactItemContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createContext(null);
var useCompactItemContext = function useCompactItemContext(prefixCls, direction) {
  var compactItemContext = react__WEBPACK_IMPORTED_MODULE_4__.useContext(SpaceCompactItemContext);
  var compactItemClassnames = react__WEBPACK_IMPORTED_MODULE_4__.useMemo(function () {
    var _classNames;
    if (!compactItemContext) return '';
    var compactDirection = compactItemContext.compactDirection,
      isFirstItem = compactItemContext.isFirstItem,
      isLastItem = compactItemContext.isLastItem;
    var separator = compactDirection === 'vertical' ? '-vertical-' : '-';
    return classnames__WEBPACK_IMPORTED_MODULE_2___default()((_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-compact").concat(separator, "item"), true), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-compact").concat(separator, "first-item"), isFirstItem), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-compact").concat(separator, "last-item"), isLastItem), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames, "".concat(prefixCls, "-compact").concat(separator, "item-rtl"), direction === 'rtl'), _classNames));
  }, [prefixCls, direction, compactItemContext]);
  return {
    compactSize: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactSize,
    compactDirection: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactDirection,
    compactItemClassnames: compactItemClassnames
  };
};
var NoCompactStyle = function NoCompactStyle(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(SpaceCompactItemContext.Provider, {
    value: null
  }, children);
};
var CompactItem = function CompactItem(_a) {
  var children = _a.children,
    otherProps = __rest(_a, ["children"]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(SpaceCompactItemContext.Provider, {
    value: otherProps
  }, children);
};
var Compact = function Compact(props) {
  var _classNames2;
  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_4__.useContext(_config_provider__WEBPACK_IMPORTED_MODULE_5__.ConfigContext),
    getPrefixCls = _React$useContext.getPrefixCls,
    directionConfig = _React$useContext.direction;
  var _props$size = props.size,
    size = _props$size === void 0 ? 'middle' : _props$size,
    direction = props.direction,
    block = props.block,
    customizePrefixCls = props.prefixCls,
    className = props.className,
    children = props.children,
    restProps = __rest(props, ["size", "direction", "block", "prefixCls", "className", "children"]);
  var prefixCls = getPrefixCls('space-compact', customizePrefixCls);
  var clx = classnames__WEBPACK_IMPORTED_MODULE_2___default()(prefixCls, (_classNames2 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames2, "".concat(prefixCls, "-rtl"), directionConfig === 'rtl'), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames2, "".concat(prefixCls, "-block"), block), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_classNames2, "".concat(prefixCls, "-vertical"), direction === 'vertical'), _classNames2), className);
  var compactItemContext = react__WEBPACK_IMPORTED_MODULE_4__.useContext(SpaceCompactItemContext);
  var childNodes = (0,rc_util_es_Children_toArray__WEBPACK_IMPORTED_MODULE_3__["default"])(children);
  var nodes = react__WEBPACK_IMPORTED_MODULE_4__.useMemo(function () {
    return childNodes.map(function (child, i) {
      var key = child && child.key || "".concat(prefixCls, "-item-").concat(i);
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(CompactItem, {
        key: key,
        compactSize: size,
        compactDirection: direction,
        isFirstItem: i === 0 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isFirstItem)),
        isLastItem: i === childNodes.length - 1 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isLastItem))
      }, child);
    });
  }, [size, childNodes, compactItemContext]);
  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    className: clx
  }, restProps), nodes);
};
/* harmony default export */ __webpack_exports__["default"] = (Compact);

/***/ }),

/***/ "../node_modules/antd/es/time-picker/locale/en_US.js":
/*!***********************************************************!*\
  !*** ../node_modules/antd/es/time-picker/locale/en_US.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var locale = {
  placeholder: 'Select time',
  rangePlaceholder: ['Start time', 'End time']
};
/* harmony default export */ __webpack_exports__["default"] = (locale);

/***/ }),

/***/ "./src/components/PageLoader.js":
/*!**************************************!*\
  !*** ./src/components/PageLoader.js ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);


function PageLoader() {
  const {
    loading
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => ({
    loading: select('sgsb').getPageLoading()
  }));
  return loading && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "sgsb-page-loader"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "sgsb-page-loader-ring"
  }));
}
/* harmony default export */ __webpack_exports__["default"] = (PageLoader);

/***/ }),

/***/ "./src/components/settings/HeadBar.js":
/*!********************************************!*\
  !*** ./src/components/settings/HeadBar.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/layout/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/image/index.js");
/* harmony import */ var _images_help_icon_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../images/help-icon.svg */ "./images/help-icon.svg");
/* harmony import */ var _images_cap_icon_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../images/cap-icon.svg */ "./images/cap-icon.svg");





function HeadBar() {
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_3__["default"].Header, {
    className: "sgsb-admin-dashboard-module-top-bar"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
    align: "middle",
    justify: "espace-betweennd"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
    span: 24
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
    justify: "end"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "premium-btn"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
    width: "210px",
    href: "https://invizo.io/support/",
    target: "_blank",
    type: "primary"
  }, "Get Premium", (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
    preview: false,
    width: 22,
    src: _images_cap_icon_svg__WEBPACK_IMPORTED_MODULE_2__["default"]
  }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "help-btn"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
    width: "210px",
    href: "https://invizo.io/support/",
    target: "_blank",
    type: "primary"
  }, "Need Help?", (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
    preview: false,
    width: 22,
    src: _images_help_icon_svg__WEBPACK_IMPORTED_MODULE_1__["default"]
  }))))))));
}
/* harmony default export */ __webpack_exports__["default"] = (HeadBar);

/***/ }),

/***/ "./src/components/settings/Layout.js":
/*!*******************************************!*\
  !*** ./src/components/settings/Layout.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/layout/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/alert/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-router-dom */ "../node_modules/react-router/dist/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-router-dom */ "../node_modules/react-router-dom/dist/index.js");
/* harmony import */ var _HeadBar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./HeadBar */ "./src/components/settings/HeadBar.js");
/* harmony import */ var _PageLoader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../PageLoader */ "./src/components/PageLoader.js");
/* harmony import */ var _Sidebar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Sidebar */ "./src/components/settings/Sidebar.js");







function ModuleSettings(_ref) {
  let {
    routes
  } = _ref;
  let element = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_5__.useRoutes)(routes);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
    className: "sgsb-layout-relative"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Sidebar__WEBPACK_IMPORTED_MODULE_4__["default"], {
    routes: routes
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_HeadBar__WEBPACK_IMPORTED_MODULE_2__["default"], null), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"].Content, {
    className: "sgsb-module-setting-layout"
  }, element)), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_PageLoader__WEBPACK_IMPORTED_MODULE_3__["default"], null));
}

// If not module is active.
function NoModuleActive() {
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
    message: "You don't have any module active, Please active any module to update settings.",
    type: "info"
  });
}
function AppLayout() {
  let navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_5__.useNavigate)();
  let routes = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.applyFilters)("sgsb_routes", [], react_router_dom__WEBPACK_IMPORTED_MODULE_5__.Outlet, navigate, react_router_dom__WEBPACK_IMPORTED_MODULE_5__.useParams, react_router_dom__WEBPACK_IMPORTED_MODULE_8__.useSearchParams);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], null, !routes.length ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(NoModuleActive, null) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(ModuleSettings, {
    routes: routes
  }));
}
/* harmony default export */ __webpack_exports__["default"] = (AppLayout);

/***/ }),

/***/ "./src/components/settings/Sidebar.js":
/*!********************************************!*\
  !*** ./src/components/settings/Sidebar.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/layout/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! antd */ "../node_modules/antd/es/image/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-router-dom */ "../node_modules/react-router/dist/index.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-router-dom */ "../node_modules/@remix-run/router/dist/router.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-router-dom */ "../node_modules/react-router-dom/dist/index.js");
/* harmony import */ var _images_dashboard_icon_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../images/dashboard-icon.svg */ "./images/dashboard-icon.svg");
/* harmony import */ var _images_logo_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../images/logo.svg */ "./images/logo.svg");
/* harmony import */ var _images_menu_down_arrow_icon_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../images/menu/down-arrow-icon.svg */ "./images/menu/down-arrow-icon.svg");
/* harmony import */ var _images_menu_up_arrow_icon_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../images/menu/up-arrow-icon.svg */ "./images/menu/up-arrow-icon.svg");
/* harmony import */ var _images_widget_icon_svg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../images/widget-icon.svg */ "./images/widget-icon.svg");










function Sidebar(_ref) {
  let {
    routes
  } = _ref;
  // let sidebarItems = applyFilters("sidebar_menu_items", [], Link);
  let firstItem = routes[0] || false;
  const location = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_7__.useLocation)();
  const [activeClass, setActiveClass] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const matchResult = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_8__.matchRoutes)(routes, location);
  const currentRoute = matchResult ? matchResult[0].route : null;
  const [selectedMenu, setSelectedMenu] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(currentRoute?.name);
  const toggleMenuClass = () => {
    setActiveClass(prevIsActive => !prevIsActive);
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setSelectedMenu(currentRoute?.name);
  }, [currentRoute?.name]);
  const handleLiClick = routeName => {
    setSelectedMenu(routeName);
    const linkElement = document.querySelector(`a[data-route-name="${routeName}"]`);
    if (linkElement) {
      linkElement.click();
    }
  };

  // Redirect to the first menu if it is the index page.
  if (location.pathname === "/" && firstItem) {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_router_dom__WEBPACK_IMPORTED_MODULE_7__.Navigate, {
      to: `${firstItem.path}`,
      replace: true
    });
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_9__["default"].Sider, {
    className: "site-layout-background sgsb__settings-sidebar",
    style: {
      minHeight: "100vh"
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "sgsb-admin-setting-dashboard-sideabr"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "sgsb-logo"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_10__["default"], {
    preview: false,
    width: 164,
    src: _images_logo_svg__WEBPACK_IMPORTED_MODULE_3__["default"]
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_10__["default"], {
    preview: false,
    width: 19,
    src: _images_dashboard_icon_svg__WEBPACK_IMPORTED_MODULE_2__["default"]
  }), "Dashboard"), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "all-widgets-menu"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("h4", null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(antd__WEBPACK_IMPORTED_MODULE_10__["default"], {
    preview: false,
    width: 18,
    src: _images_widget_icon_svg__WEBPACK_IMPORTED_MODULE_6__["default"]
  }), "All Modules", (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    onClick: toggleMenuClass,
    className: "ant-menu-title-content"
  }, activeClass ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: _images_menu_up_arrow_icon_svg__WEBPACK_IMPORTED_MODULE_5__["default"],
    width: "12"
  }) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: _images_menu_down_arrow_icon_svg__WEBPACK_IMPORTED_MODULE_4__["default"],
    width: "12"
  }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: activeClass ? "widgets-menu ant-menu-hidden" : "widgets-menu"
  }, routes.map(route => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: route.name,
    onClick: () => handleLiClick(route.name) // Handle the click event on <li>
    ,
    className: selectedMenu === route.name ? `sgsb-selected-module ${route.name}` : `${route.name}`
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_router_dom__WEBPACK_IMPORTED_MODULE_11__.Link, {
    className: selectedMenu === route.name ? "sgsb-selected-link" : "",
    "data-route-name": route.name,
    to: route.path
  }, route.label)))))));
}
/* harmony default export */ __webpack_exports__["default"] = (Sidebar);

/***/ }),

/***/ "./src/settings-store.js":
/*!*******************************!*\
  !*** ./src/settings-store.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Default state.
 */
const DEFAULT_STATE = {
  pageLoading: false
};

/**
 * Reducer to update the state.
 */
const reducer = function () {
  let state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_STATE;
  let action = arguments.length > 1 ? arguments[1] : undefined;
  switch (action.type) {
    case 'SET_PAGE_LOADING':
      return {
        ...state,
        pageLoading: action.loading
      };
    default:
      return state;
  }
};

/**
 * Actions to call the reducer.
 */
const actions = {
  setPageLoading(loading) {
    return {
      type: 'SET_PAGE_LOADING',
      loading
    };
  }
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getPageLoading(state) {
    return state.pageLoading;
  }
};
const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createReduxStore)('sgsb', {
  reducer,
  actions,
  selectors
});
/* harmony default export */ __webpack_exports__["default"] = (store);

/***/ }),

/***/ "../node_modules/classnames/index.js":
/*!*******************************************!*\
  !*** ../node_modules/classnames/index.js ***!
  \*******************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;
	var nativeCodeString = '[native code]';

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
					classes.push(arg.toString());
					continue;
				}

				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "../node_modules/lodash/_Symbol.js":
/*!*****************************************!*\
  !*** ../node_modules/lodash/_Symbol.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "../node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "../node_modules/lodash/_arrayMap.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_arrayMap.js ***!
  \*******************************************/
/***/ (function(module) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "../node_modules/lodash/_arrayReduce.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/_arrayReduce.js ***!
  \**********************************************/
/***/ (function(module) {

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

module.exports = arrayReduce;


/***/ }),

/***/ "../node_modules/lodash/_asciiToArray.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_asciiToArray.js ***!
  \***********************************************/
/***/ (function(module) {

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

module.exports = asciiToArray;


/***/ }),

/***/ "../node_modules/lodash/_asciiWords.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_asciiWords.js ***!
  \*********************************************/
/***/ (function(module) {

/** Used to match words composed of alphanumeric characters. */
var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

/**
 * Splits an ASCII `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function asciiWords(string) {
  return string.match(reAsciiWord) || [];
}

module.exports = asciiWords;


/***/ }),

/***/ "../node_modules/lodash/_baseGetTag.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_baseGetTag.js ***!
  \*********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "../node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "../node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "../node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "../node_modules/lodash/_basePropertyOf.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_basePropertyOf.js ***!
  \*************************************************/
/***/ (function(module) {

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

module.exports = basePropertyOf;


/***/ }),

/***/ "../node_modules/lodash/_baseSlice.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_baseSlice.js ***!
  \********************************************/
/***/ (function(module) {

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;


/***/ }),

/***/ "../node_modules/lodash/_baseToString.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_baseToString.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "../node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "../node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "../node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "../node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "../node_modules/lodash/_castSlice.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_castSlice.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var baseSlice = __webpack_require__(/*! ./_baseSlice */ "../node_modules/lodash/_baseSlice.js");

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

module.exports = castSlice;


/***/ }),

/***/ "../node_modules/lodash/_createCaseFirst.js":
/*!**************************************************!*\
  !*** ../node_modules/lodash/_createCaseFirst.js ***!
  \**************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var castSlice = __webpack_require__(/*! ./_castSlice */ "../node_modules/lodash/_castSlice.js"),
    hasUnicode = __webpack_require__(/*! ./_hasUnicode */ "../node_modules/lodash/_hasUnicode.js"),
    stringToArray = __webpack_require__(/*! ./_stringToArray */ "../node_modules/lodash/_stringToArray.js"),
    toString = __webpack_require__(/*! ./toString */ "../node_modules/lodash/toString.js");

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = toString(string);

    var strSymbols = hasUnicode(string)
      ? stringToArray(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? castSlice(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

module.exports = createCaseFirst;


/***/ }),

/***/ "../node_modules/lodash/_createCompounder.js":
/*!***************************************************!*\
  !*** ../node_modules/lodash/_createCompounder.js ***!
  \***************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var arrayReduce = __webpack_require__(/*! ./_arrayReduce */ "../node_modules/lodash/_arrayReduce.js"),
    deburr = __webpack_require__(/*! ./deburr */ "../node_modules/lodash/deburr.js"),
    words = __webpack_require__(/*! ./words */ "../node_modules/lodash/words.js");

/** Used to compose unicode capture groups. */
var rsApos = "['\u2019]";

/** Used to match apostrophes. */
var reApos = RegExp(rsApos, 'g');

/**
 * Creates a function like `_.camelCase`.
 *
 * @private
 * @param {Function} callback The function to combine each word.
 * @returns {Function} Returns the new compounder function.
 */
function createCompounder(callback) {
  return function(string) {
    return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
  };
}

module.exports = createCompounder;


/***/ }),

/***/ "../node_modules/lodash/_deburrLetter.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_deburrLetter.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var basePropertyOf = __webpack_require__(/*! ./_basePropertyOf */ "../node_modules/lodash/_basePropertyOf.js");

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J',  '\u0135': 'j',
  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W',  '\u0175': 'w',
  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 's'
};

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

module.exports = deburrLetter;


/***/ }),

/***/ "../node_modules/lodash/_freeGlobal.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_freeGlobal.js ***!
  \*********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

module.exports = freeGlobal;


/***/ }),

/***/ "../node_modules/lodash/_getRawTag.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_getRawTag.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "../node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "../node_modules/lodash/_hasUnicode.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_hasUnicode.js ***!
  \*********************************************/
/***/ (function(module) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

module.exports = hasUnicode;


/***/ }),

/***/ "../node_modules/lodash/_hasUnicodeWord.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_hasUnicodeWord.js ***!
  \*************************************************/
/***/ (function(module) {

/** Used to detect strings that need a more robust regexp to match words. */
var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

/**
 * Checks if `string` contains a word composed of Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a word is found, else `false`.
 */
function hasUnicodeWord(string) {
  return reHasUnicodeWord.test(string);
}

module.exports = hasUnicodeWord;


/***/ }),

/***/ "../node_modules/lodash/_objectToString.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_objectToString.js ***!
  \*************************************************/
/***/ (function(module) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "../node_modules/lodash/_root.js":
/*!***************************************!*\
  !*** ../node_modules/lodash/_root.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "../node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "../node_modules/lodash/_stringToArray.js":
/*!************************************************!*\
  !*** ../node_modules/lodash/_stringToArray.js ***!
  \************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var asciiToArray = __webpack_require__(/*! ./_asciiToArray */ "../node_modules/lodash/_asciiToArray.js"),
    hasUnicode = __webpack_require__(/*! ./_hasUnicode */ "../node_modules/lodash/_hasUnicode.js"),
    unicodeToArray = __webpack_require__(/*! ./_unicodeToArray */ "../node_modules/lodash/_unicodeToArray.js");

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

module.exports = stringToArray;


/***/ }),

/***/ "../node_modules/lodash/_unicodeToArray.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_unicodeToArray.js ***!
  \*************************************************/
/***/ (function(module) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

module.exports = unicodeToArray;


/***/ }),

/***/ "../node_modules/lodash/_unicodeWords.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_unicodeWords.js ***!
  \***********************************************/
/***/ (function(module) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsDingbatRange = '\\u2700-\\u27bf',
    rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
    rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
    rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
    rsPunctuationRange = '\\u2000-\\u206f',
    rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
    rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
    rsVarRange = '\\ufe0e\\ufe0f',
    rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

/** Used to compose unicode capture groups. */
var rsApos = "['\u2019]",
    rsBreak = '[' + rsBreakRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsDigits = '\\d+',
    rsDingbat = '[' + rsDingbatRange + ']',
    rsLower = '[' + rsLowerRange + ']',
    rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsUpper = '[' + rsUpperRange + ']',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
    rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
    rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
    rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
    reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
    rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

/** Used to match complex or compound words. */
var reUnicodeWord = RegExp([
  rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
  rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
  rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
  rsUpper + '+' + rsOptContrUpper,
  rsOrdUpper,
  rsOrdLower,
  rsDigits,
  rsEmoji
].join('|'), 'g');

/**
 * Splits a Unicode `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function unicodeWords(string) {
  return string.match(reUnicodeWord) || [];
}

module.exports = unicodeWords;


/***/ }),

/***/ "../node_modules/lodash/camelCase.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/camelCase.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var capitalize = __webpack_require__(/*! ./capitalize */ "../node_modules/lodash/capitalize.js"),
    createCompounder = __webpack_require__(/*! ./_createCompounder */ "../node_modules/lodash/_createCompounder.js");

/**
 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the camel cased string.
 * @example
 *
 * _.camelCase('Foo Bar');
 * // => 'fooBar'
 *
 * _.camelCase('--foo-bar--');
 * // => 'fooBar'
 *
 * _.camelCase('__FOO_BAR__');
 * // => 'fooBar'
 */
var camelCase = createCompounder(function(result, word, index) {
  word = word.toLowerCase();
  return result + (index ? capitalize(word) : word);
});

module.exports = camelCase;


/***/ }),

/***/ "../node_modules/lodash/capitalize.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/capitalize.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toString = __webpack_require__(/*! ./toString */ "../node_modules/lodash/toString.js"),
    upperFirst = __webpack_require__(/*! ./upperFirst */ "../node_modules/lodash/upperFirst.js");

/**
 * Converts the first character of `string` to upper case and the remaining
 * to lower case.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to capitalize.
 * @returns {string} Returns the capitalized string.
 * @example
 *
 * _.capitalize('FRED');
 * // => 'Fred'
 */
function capitalize(string) {
  return upperFirst(toString(string).toLowerCase());
}

module.exports = capitalize;


/***/ }),

/***/ "../node_modules/lodash/deburr.js":
/*!****************************************!*\
  !*** ../node_modules/lodash/deburr.js ***!
  \****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var deburrLetter = __webpack_require__(/*! ./_deburrLetter */ "../node_modules/lodash/_deburrLetter.js"),
    toString = __webpack_require__(/*! ./toString */ "../node_modules/lodash/toString.js");

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;

/** Used to compose unicode capture groups. */
var rsCombo = '[' + rsComboRange + ']';

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

module.exports = deburr;


/***/ }),

/***/ "../node_modules/lodash/isArray.js":
/*!*****************************************!*\
  !*** ../node_modules/lodash/isArray.js ***!
  \*****************************************/
/***/ (function(module) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "../node_modules/lodash/isObjectLike.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/isObjectLike.js ***!
  \**********************************************/
/***/ (function(module) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "../node_modules/lodash/isSymbol.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/isSymbol.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "../node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "../node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),

/***/ "../node_modules/lodash/toString.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/toString.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var baseToString = __webpack_require__(/*! ./_baseToString */ "../node_modules/lodash/_baseToString.js");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),

/***/ "../node_modules/lodash/upperFirst.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/upperFirst.js ***!
  \********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var createCaseFirst = __webpack_require__(/*! ./_createCaseFirst */ "../node_modules/lodash/_createCaseFirst.js");

/**
 * Converts the first character of `string` to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = createCaseFirst('toUpperCase');

module.exports = upperFirst;


/***/ }),

/***/ "../node_modules/lodash/words.js":
/*!***************************************!*\
  !*** ../node_modules/lodash/words.js ***!
  \***************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var asciiWords = __webpack_require__(/*! ./_asciiWords */ "../node_modules/lodash/_asciiWords.js"),
    hasUnicodeWord = __webpack_require__(/*! ./_hasUnicodeWord */ "../node_modules/lodash/_hasUnicodeWord.js"),
    toString = __webpack_require__(/*! ./toString */ "../node_modules/lodash/toString.js"),
    unicodeWords = __webpack_require__(/*! ./_unicodeWords */ "../node_modules/lodash/_unicodeWords.js");

/**
 * Splits `string` into an array of its words.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * _.words('fred, barney, & pebbles');
 * // => ['fred', 'barney', 'pebbles']
 *
 * _.words('fred, barney, & pebbles', /[^, ]+/g);
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern, guard) {
  string = toString(string);
  pattern = guard ? undefined : pattern;

  if (pattern === undefined) {
    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
  }
  return string.match(pattern) || [];
}

module.exports = words;


/***/ }),

/***/ "./src/admin.css":
/*!***********************!*\
  !*** ./src/admin.css ***!
  \***********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "../node_modules/antd/dist/antd.css":
/*!******************************************!*\
  !*** ../node_modules/antd/dist/antd.css ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "../node_modules/rc-dialog/es/Dialog/Content/MemoChildren.js":
/*!*******************************************************************!*\
  !*** ../node_modules/rc-dialog/es/Dialog/Content/MemoChildren.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ __webpack_exports__["default"] = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(function (_ref) {
  var children = _ref.children;
  return children;
}, function (_, _ref2) {
  var shouldUpdate = _ref2.shouldUpdate;
  return !shouldUpdate;
}));

/***/ }),

/***/ "../node_modules/rc-dialog/es/Dialog/Content/Panel.js":
/*!************************************************************!*\
  !*** ../node_modules/rc-dialog/es/Dialog/Content/Panel.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _MemoChildren__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MemoChildren */ "../node_modules/rc-dialog/es/Dialog/Content/MemoChildren.js");





var sentinelStyle = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  outline: 'none'
};
var Panel = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().forwardRef(function (props, ref) {
  var prefixCls = props.prefixCls,
    className = props.className,
    style = props.style,
    title = props.title,
    ariaId = props.ariaId,
    footer = props.footer,
    closable = props.closable,
    closeIcon = props.closeIcon,
    onClose = props.onClose,
    children = props.children,
    bodyStyle = props.bodyStyle,
    bodyProps = props.bodyProps,
    modalRender = props.modalRender,
    onMouseDown = props.onMouseDown,
    onMouseUp = props.onMouseUp,
    holderRef = props.holderRef,
    visible = props.visible,
    forceRender = props.forceRender,
    width = props.width,
    height = props.height;
  // ================================= Refs =================================
  var sentinelStartRef = (0,react__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  var sentinelEndRef = (0,react__WEBPACK_IMPORTED_MODULE_2__.useRef)();
  react__WEBPACK_IMPORTED_MODULE_2___default().useImperativeHandle(ref, function () {
    return {
      focus: function focus() {
        var _sentinelStartRef$cur;
        (_sentinelStartRef$cur = sentinelStartRef.current) === null || _sentinelStartRef$cur === void 0 ? void 0 : _sentinelStartRef$cur.focus();
      },
      changeActive: function changeActive(next) {
        var _document = document,
          activeElement = _document.activeElement;
        if (next && activeElement === sentinelEndRef.current) {
          sentinelStartRef.current.focus();
        } else if (!next && activeElement === sentinelStartRef.current) {
          sentinelEndRef.current.focus();
        }
      }
    };
  });
  // ================================ Style =================================
  var contentStyle = {};
  if (width !== undefined) {
    contentStyle.width = width;
  }
  if (height !== undefined) {
    contentStyle.height = height;
  }
  // ================================ Render ================================
  var footerNode;
  if (footer) {
    footerNode = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
      className: "".concat(prefixCls, "-footer")
    }, footer);
  }
  var headerNode;
  if (title) {
    headerNode = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
      className: "".concat(prefixCls, "-header")
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
      className: "".concat(prefixCls, "-title"),
      id: ariaId
    }, title));
  }
  var closer;
  if (closable) {
    closer = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("button", {
      type: "button",
      onClick: onClose,
      "aria-label": "Close",
      className: "".concat(prefixCls, "-close")
    }, closeIcon || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("span", {
      className: "".concat(prefixCls, "-close-x")
    }));
  }
  var content = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
    className: "".concat(prefixCls, "-content")
  }, closer, headerNode, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_1__["default"])({
    className: "".concat(prefixCls, "-body"),
    style: bodyStyle
  }, bodyProps), children), footerNode);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
    key: "dialog-element",
    role: "dialog",
    "aria-labelledby": title ? ariaId : null,
    "aria-modal": "true",
    ref: holderRef,
    style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, style), contentStyle),
    className: classnames__WEBPACK_IMPORTED_MODULE_3___default()(prefixCls, className),
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
    tabIndex: 0,
    ref: sentinelStartRef,
    style: sentinelStyle,
    "aria-hidden": "true"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_MemoChildren__WEBPACK_IMPORTED_MODULE_4__["default"], {
    shouldUpdate: visible || forceRender
  }, modalRender ? modalRender(content) : content), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2___default().createElement("div", {
    tabIndex: 0,
    ref: sentinelEndRef,
    style: sentinelStyle,
    "aria-hidden": "true"
  }));
});
if (true) {
  Panel.displayName = 'Panel';
}
/* harmony default export */ __webpack_exports__["default"] = (Panel);

/***/ }),

/***/ "../node_modules/rc-dialog/es/Dialog/Content/index.js":
/*!************************************************************!*\
  !*** ../node_modules/rc-dialog/es/Dialog/Content/index.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-motion */ "../node_modules/rc-motion/es/index.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../util */ "../node_modules/rc-dialog/es/util.js");
/* harmony import */ var _Panel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Panel */ "../node_modules/rc-dialog/es/Dialog/Content/Panel.js");









var Content = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.forwardRef(function (props, ref) {
  var prefixCls = props.prefixCls,
    title = props.title,
    style = props.style,
    className = props.className,
    visible = props.visible,
    forceRender = props.forceRender,
    destroyOnClose = props.destroyOnClose,
    motionName = props.motionName,
    ariaId = props.ariaId,
    onVisibleChanged = props.onVisibleChanged,
    mousePosition = props.mousePosition;
  var dialogRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  // ============================= Style ==============================
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_3__.useState(),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_React$useState, 2),
    transformOrigin = _React$useState2[0],
    setTransformOrigin = _React$useState2[1];
  var contentStyle = {};
  if (transformOrigin) {
    contentStyle.transformOrigin = transformOrigin;
  }
  function onPrepare() {
    var elementOffset = (0,_util__WEBPACK_IMPORTED_MODULE_6__.offset)(dialogRef.current);
    setTransformOrigin(mousePosition ? "".concat(mousePosition.x - elementOffset.left, "px ").concat(mousePosition.y - elementOffset.top, "px") : '');
  }
  // ============================= Render =============================
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(rc_motion__WEBPACK_IMPORTED_MODULE_5__["default"], {
    visible: visible,
    onVisibleChanged: onVisibleChanged,
    onAppearPrepare: onPrepare,
    onEnterPrepare: onPrepare,
    forceRender: forceRender,
    motionName: motionName,
    removeOnLeave: destroyOnClose,
    ref: dialogRef
  }, function (_ref, motionRef) {
    var motionClassName = _ref.className,
      motionStyle = _ref.style;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_Panel__WEBPACK_IMPORTED_MODULE_7__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
      ref: ref,
      title: title,
      ariaId: ariaId,
      prefixCls: prefixCls,
      holderRef: motionRef,
      style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, motionStyle), style), contentStyle),
      className: classnames__WEBPACK_IMPORTED_MODULE_4___default()(className, motionClassName)
    }));
  });
});
Content.displayName = 'Content';
/* harmony default export */ __webpack_exports__["default"] = (Content);

/***/ }),

/***/ "../node_modules/rc-dialog/es/Dialog/Mask.js":
/*!***************************************************!*\
  !*** ../node_modules/rc-dialog/es/Dialog/Mask.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Mask; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-motion */ "../node_modules/rc-motion/es/index.js");





function Mask(props) {
  var prefixCls = props.prefixCls,
    style = props.style,
    visible = props.visible,
    maskProps = props.maskProps,
    motionName = props.motionName;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2__.createElement(rc_motion__WEBPACK_IMPORTED_MODULE_4__["default"], {
    key: "mask",
    visible: visible,
    motionName: motionName,
    leavedClassName: "".concat(prefixCls, "-mask-hidden")
  }, function (_ref, ref) {
    var motionClassName = _ref.className,
      motionStyle = _ref.style;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
      ref: ref,
      style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, motionStyle), style),
      className: classnames__WEBPACK_IMPORTED_MODULE_3___default()("".concat(prefixCls, "-mask"), motionClassName)
    }, maskProps));
  });
}

/***/ }),

/***/ "../node_modules/rc-dialog/es/Dialog/index.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-dialog/es/Dialog/index.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Dialog; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/KeyCode */ "../node_modules/rc-util/es/KeyCode.js");
/* harmony import */ var rc_util_es_hooks_useId__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rc-util/es/hooks/useId */ "../node_modules/rc-util/es/hooks/useId.js");
/* harmony import */ var rc_util_es_Dom_contains__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rc-util/es/Dom/contains */ "../node_modules/rc-util/es/Dom/contains.js");
/* harmony import */ var rc_util_es_pickAttrs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rc-util/es/pickAttrs */ "../node_modules/rc-util/es/pickAttrs.js");
/* harmony import */ var _Mask__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Mask */ "../node_modules/rc-dialog/es/Dialog/Mask.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../util */ "../node_modules/rc-dialog/es/util.js");
/* harmony import */ var _Content__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Content */ "../node_modules/rc-dialog/es/Dialog/Content/index.js");













function Dialog(props) {
  var _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'rc-dialog' : _props$prefixCls,
    zIndex = props.zIndex,
    _props$visible = props.visible,
    visible = _props$visible === void 0 ? false : _props$visible,
    _props$keyboard = props.keyboard,
    keyboard = _props$keyboard === void 0 ? true : _props$keyboard,
    _props$focusTriggerAf = props.focusTriggerAfterClose,
    focusTriggerAfterClose = _props$focusTriggerAf === void 0 ? true : _props$focusTriggerAf,
    wrapStyle = props.wrapStyle,
    wrapClassName = props.wrapClassName,
    wrapProps = props.wrapProps,
    onClose = props.onClose,
    afterClose = props.afterClose,
    transitionName = props.transitionName,
    animation = props.animation,
    _props$closable = props.closable,
    closable = _props$closable === void 0 ? true : _props$closable,
    _props$mask = props.mask,
    mask = _props$mask === void 0 ? true : _props$mask,
    maskTransitionName = props.maskTransitionName,
    maskAnimation = props.maskAnimation,
    _props$maskClosable = props.maskClosable,
    maskClosable = _props$maskClosable === void 0 ? true : _props$maskClosable,
    maskStyle = props.maskStyle,
    maskProps = props.maskProps,
    rootClassName = props.rootClassName;
  var lastOutSideActiveElementRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  var wrapperRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  var contentRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_3__.useState(visible),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_React$useState, 2),
    animatedVisible = _React$useState2[0],
    setAnimatedVisible = _React$useState2[1];
  // ========================== Init ==========================
  var ariaId = (0,rc_util_es_hooks_useId__WEBPACK_IMPORTED_MODULE_6__["default"])();
  function saveLastOutSideActiveElementRef() {
    if (!(0,rc_util_es_Dom_contains__WEBPACK_IMPORTED_MODULE_7__["default"])(wrapperRef.current, document.activeElement)) {
      lastOutSideActiveElementRef.current = document.activeElement;
    }
  }
  function focusDialogContent() {
    if (!(0,rc_util_es_Dom_contains__WEBPACK_IMPORTED_MODULE_7__["default"])(wrapperRef.current, document.activeElement)) {
      var _contentRef$current;
      (_contentRef$current = contentRef.current) === null || _contentRef$current === void 0 ? void 0 : _contentRef$current.focus();
    }
  }
  // ========================= Events =========================
  function onDialogVisibleChanged(newVisible) {
    // Try to focus
    if (newVisible) {
      focusDialogContent();
    } else {
      // Clean up scroll bar & focus back
      setAnimatedVisible(false);
      if (mask && lastOutSideActiveElementRef.current && focusTriggerAfterClose) {
        try {
          lastOutSideActiveElementRef.current.focus({
            preventScroll: true
          });
        } catch (e) {
          // Do nothing
        }
        lastOutSideActiveElementRef.current = null;
      }
      // Trigger afterClose only when change visible from true to false
      if (animatedVisible) {
        afterClose === null || afterClose === void 0 ? void 0 : afterClose();
      }
    }
  }
  function onInternalClose(e) {
    onClose === null || onClose === void 0 ? void 0 : onClose(e);
  }
  // >>> Content
  var contentClickRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)(false);
  var contentTimeoutRef = (0,react__WEBPACK_IMPORTED_MODULE_3__.useRef)();
  // We need record content click incase content popup out of dialog
  var onContentMouseDown = function onContentMouseDown() {
    clearTimeout(contentTimeoutRef.current);
    contentClickRef.current = true;
  };
  var onContentMouseUp = function onContentMouseUp() {
    contentTimeoutRef.current = setTimeout(function () {
      contentClickRef.current = false;
    });
  };
  // >>> Wrapper
  // Close only when element not on dialog
  var onWrapperClick = null;
  if (maskClosable) {
    onWrapperClick = function onWrapperClick(e) {
      if (contentClickRef.current) {
        contentClickRef.current = false;
      } else if (wrapperRef.current === e.target) {
        onInternalClose(e);
      }
    };
  }
  function onWrapperKeyDown(e) {
    if (keyboard && e.keyCode === rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_5__["default"].ESC) {
      e.stopPropagation();
      onInternalClose(e);
      return;
    }
    // keep focus inside dialog
    if (visible) {
      if (e.keyCode === rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_5__["default"].TAB) {
        contentRef.current.changeActive(!e.shiftKey);
      }
    }
  }
  // ========================= Effect =========================
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    if (visible) {
      setAnimatedVisible(true);
      saveLastOutSideActiveElementRef();
    }
  }, [visible]);
  // Remove direct should also check the scroll bar update
  (0,react__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    return function () {
      clearTimeout(contentTimeoutRef.current);
    };
  }, []);
  // ========================= Render =========================
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    className: classnames__WEBPACK_IMPORTED_MODULE_4___default()("".concat(prefixCls, "-root"), rootClassName)
  }, (0,rc_util_es_pickAttrs__WEBPACK_IMPORTED_MODULE_8__["default"])(props, {
    data: true
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_Mask__WEBPACK_IMPORTED_MODULE_9__["default"], {
    prefixCls: prefixCls,
    visible: mask && visible,
    motionName: (0,_util__WEBPACK_IMPORTED_MODULE_10__.getMotionName)(prefixCls, maskTransitionName, maskAnimation),
    style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({
      zIndex: zIndex
    }, maskStyle),
    maskProps: maskProps
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    tabIndex: -1,
    onKeyDown: onWrapperKeyDown,
    className: classnames__WEBPACK_IMPORTED_MODULE_4___default()("".concat(prefixCls, "-wrap"), wrapClassName),
    ref: wrapperRef,
    onClick: onWrapperClick,
    style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({
      zIndex: zIndex
    }, wrapStyle), {}, {
      display: !animatedVisible ? 'none' : null
    })
  }, wrapProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.createElement(_Content__WEBPACK_IMPORTED_MODULE_11__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
    onMouseDown: onContentMouseDown,
    onMouseUp: onContentMouseUp,
    ref: contentRef,
    closable: closable,
    ariaId: ariaId,
    prefixCls: prefixCls,
    visible: visible && animatedVisible,
    onClose: onInternalClose,
    onVisibleChanged: onDialogVisibleChanged,
    motionName: (0,_util__WEBPACK_IMPORTED_MODULE_10__.getMotionName)(prefixCls, transitionName, animation)
  }))));
}

/***/ }),

/***/ "../node_modules/rc-dialog/es/DialogWrap.js":
/*!**************************************************!*\
  !*** ../node_modules/rc-dialog/es/DialogWrap.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _rc_component_portal__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @rc-component/portal */ "../node_modules/@rc-component/portal/es/index.js");
/* harmony import */ var _Dialog__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Dialog */ "../node_modules/rc-dialog/es/Dialog/index.js");





// fix issue #10656
/*
 * getContainer remarks
 * Custom container should not be return, because in the Portal component, it will remove the
 * return container element here, if the custom container is the only child of it's component,
 * like issue #10656, It will has a conflict with removeChild method in react-dom.
 * So here should add a child (div element) to custom container.
 * */
var DialogWrap = function DialogWrap(props) {
  var visible = props.visible,
    getContainer = props.getContainer,
    forceRender = props.forceRender,
    _props$destroyOnClose = props.destroyOnClose,
    destroyOnClose = _props$destroyOnClose === void 0 ? false : _props$destroyOnClose,
    _afterClose = props.afterClose;
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_2__.useState(visible),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_React$useState, 2),
    animatedVisible = _React$useState2[0],
    setAnimatedVisible = _React$useState2[1];
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(function () {
    if (visible) {
      setAnimatedVisible(true);
    }
  }, [visible]);
  // // 渲染在当前 dom 里；
  // if (getContainer === false) {
  //   return (
  //     <Dialog
  //       {...props}
  //       getOpenCount={() => 2} // 不对 body 做任何操作。。
  //     />
  //   );
  // }
  // Destroy on close will remove wrapped div
  if (!forceRender && destroyOnClose && !animatedVisible) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2__.createElement(_rc_component_portal__WEBPACK_IMPORTED_MODULE_3__["default"], {
    open: visible || forceRender || animatedVisible,
    autoDestroy: false,
    getContainer: getContainer,
    autoLock: visible || animatedVisible
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_2__.createElement(_Dialog__WEBPACK_IMPORTED_MODULE_4__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, props, {
    destroyOnClose: destroyOnClose,
    afterClose: function afterClose() {
      _afterClose === null || _afterClose === void 0 ? void 0 : _afterClose();
      setAnimatedVisible(false);
    }
  })));
};
DialogWrap.displayName = 'Dialog';
/* harmony default export */ __webpack_exports__["default"] = (DialogWrap);

/***/ }),

/***/ "../node_modules/rc-dialog/es/index.js":
/*!*********************************************!*\
  !*** ../node_modules/rc-dialog/es/index.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Panel: function() { return /* reexport safe */ _Dialog_Content_Panel__WEBPACK_IMPORTED_MODULE_1__["default"]; }
/* harmony export */ });
/* harmony import */ var _DialogWrap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DialogWrap */ "../node_modules/rc-dialog/es/DialogWrap.js");
/* harmony import */ var _Dialog_Content_Panel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Dialog/Content/Panel */ "../node_modules/rc-dialog/es/Dialog/Content/Panel.js");



/* harmony default export */ __webpack_exports__["default"] = (_DialogWrap__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/rc-dialog/es/util.js":
/*!********************************************!*\
  !*** ../node_modules/rc-dialog/es/util.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getMotionName: function() { return /* binding */ getMotionName; },
/* harmony export */   offset: function() { return /* binding */ offset; }
/* harmony export */ });
// =============================== Motion ===============================
function getMotionName(prefixCls, transitionName, animationName) {
  var motionName = transitionName;
  if (!motionName && animationName) {
    motionName = "".concat(prefixCls, "-").concat(animationName);
  }
  return motionName;
}
// =============================== Offset ===============================
function getScroll(w, top) {
  var ret = w["page".concat(top ? 'Y' : 'X', "Offset")];
  var method = "scroll".concat(top ? 'Top' : 'Left');
  if (typeof ret !== 'number') {
    var d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      ret = d.body[method];
    }
  }
  return ret;
}
function offset(el) {
  var rect = el.getBoundingClientRect();
  var pos = {
    left: rect.left,
    top: rect.top
  };
  var doc = el.ownerDocument;
  var w = doc.defaultView || doc.parentWindow;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}

/***/ }),

/***/ "../node_modules/rc-image/es/Image.js":
/*!********************************************!*\
  !*** ../node_modules/rc-image/es/Image.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rc-util/es/Dom/css */ "../node_modules/rc-util/es/Dom/css.js");
/* harmony import */ var rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rc-util/es/hooks/useMergedState */ "../node_modules/rc-util/es/hooks/useMergedState.js");
/* harmony import */ var _Preview__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Preview */ "../node_modules/rc-image/es/Preview.js");
/* harmony import */ var _PreviewGroup__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./PreviewGroup */ "../node_modules/rc-image/es/PreviewGroup.js");






var _excluded = ["src", "alt", "onPreviewClose", "prefixCls", "previewPrefixCls", "placeholder", "fallback", "width", "height", "style", "preview", "className", "onClick", "onError", "wrapperClassName", "wrapperStyle", "rootClassName", "crossOrigin", "decoding", "loading", "referrerPolicy", "sizes", "srcSet", "useMap", "draggable"],
    _excluded2 = ["src", "visible", "onVisibleChange", "getContainer", "mask", "maskClassName", "icons", "scaleStep"];







var uuid = 0;

var ImageInternal = function ImageInternal(_ref) {
  var _imgCommonProps$style;

  var imgSrc = _ref.src,
      alt = _ref.alt,
      onInitialPreviewClose = _ref.onPreviewClose,
      _ref$prefixCls = _ref.prefixCls,
      prefixCls = _ref$prefixCls === void 0 ? 'rc-image' : _ref$prefixCls,
      _ref$previewPrefixCls = _ref.previewPrefixCls,
      previewPrefixCls = _ref$previewPrefixCls === void 0 ? "".concat(prefixCls, "-preview") : _ref$previewPrefixCls,
      placeholder = _ref.placeholder,
      fallback = _ref.fallback,
      width = _ref.width,
      height = _ref.height,
      style = _ref.style,
      _ref$preview = _ref.preview,
      preview = _ref$preview === void 0 ? true : _ref$preview,
      className = _ref.className,
      onClick = _ref.onClick,
      onImageError = _ref.onError,
      wrapperClassName = _ref.wrapperClassName,
      wrapperStyle = _ref.wrapperStyle,
      rootClassName = _ref.rootClassName,
      crossOrigin = _ref.crossOrigin,
      decoding = _ref.decoding,
      loading = _ref.loading,
      referrerPolicy = _ref.referrerPolicy,
      sizes = _ref.sizes,
      srcSet = _ref.srcSet,
      useMap = _ref.useMap,
      draggable = _ref.draggable,
      otherProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_5__["default"])(_ref, _excluded);

  var isCustomPlaceholder = placeholder && placeholder !== true;

  var _ref2 = (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_4__["default"])(preview) === 'object' ? preview : {},
      previewSrc = _ref2.src,
      _ref2$visible = _ref2.visible,
      previewVisible = _ref2$visible === void 0 ? undefined : _ref2$visible,
      _ref2$onVisibleChange = _ref2.onVisibleChange,
      onPreviewVisibleChange = _ref2$onVisibleChange === void 0 ? onInitialPreviewClose : _ref2$onVisibleChange,
      _ref2$getContainer = _ref2.getContainer,
      getPreviewContainer = _ref2$getContainer === void 0 ? undefined : _ref2$getContainer,
      previewMask = _ref2.mask,
      maskClassName = _ref2.maskClassName,
      icons = _ref2.icons,
      scaleStep = _ref2.scaleStep,
      dialogProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_5__["default"])(_ref2, _excluded2);

  var src = previewSrc !== null && previewSrc !== void 0 ? previewSrc : imgSrc;
  var isControlled = previewVisible !== undefined;

  var _useMergedState = (0,rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_9__["default"])(!!previewVisible, {
    value: previewVisible,
    onChange: onPreviewVisibleChange
  }),
      _useMergedState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_useMergedState, 2),
      isShowPreview = _useMergedState2[0],
      setShowPreview = _useMergedState2[1];

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_6__.useState)(isCustomPlaceholder ? 'loading' : 'normal'),
      _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState, 2),
      status = _useState2[0],
      setStatus = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_6__.useState)(null),
      _useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState3, 2),
      mousePosition = _useState4[0],
      setMousePosition = _useState4[1];

  var isError = status === 'error';

  var _React$useContext = react__WEBPACK_IMPORTED_MODULE_6__.useContext(_PreviewGroup__WEBPACK_IMPORTED_MODULE_11__.context),
      isPreviewGroup = _React$useContext.isPreviewGroup,
      setCurrent = _React$useContext.setCurrent,
      setGroupShowPreview = _React$useContext.setShowPreview,
      setGroupMousePosition = _React$useContext.setMousePosition,
      registerImage = _React$useContext.registerImage;

  var _React$useState = react__WEBPACK_IMPORTED_MODULE_6__.useState(function () {
    uuid += 1;
    return uuid;
  }),
      _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_React$useState, 1),
      currentId = _React$useState2[0];

  var canPreview = !!preview;
  var isLoaded = react__WEBPACK_IMPORTED_MODULE_6__.useRef(false);

  var onLoad = function onLoad() {
    setStatus('normal');
  };

  var onError = function onError(e) {
    if (onImageError) {
      onImageError(e);
    }

    setStatus('error');
  };

  var onPreview = function onPreview(e) {
    if (!isControlled) {
      var _getOffset = (0,rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_8__.getOffset)(e.target),
          left = _getOffset.left,
          top = _getOffset.top;

      if (isPreviewGroup) {
        setCurrent(currentId);
        setGroupMousePosition({
          x: left,
          y: top
        });
      } else {
        setMousePosition({
          x: left,
          y: top
        });
      }
    }

    if (isPreviewGroup) {
      setGroupShowPreview(true);
    } else {
      setShowPreview(true);
    }

    if (onClick) onClick(e);
  };

  var onPreviewClose = function onPreviewClose(e) {
    e.stopPropagation();
    setShowPreview(false);

    if (!isControlled) {
      setMousePosition(null);
    }
  };

  var getImgRef = function getImgRef(img) {
    isLoaded.current = false;
    if (status !== 'loading') return;

    if (img !== null && img !== void 0 && img.complete && (img.naturalWidth || img.naturalHeight)) {
      isLoaded.current = true;
      onLoad();
    }
  }; // Keep order start
  // Resolve https://github.com/ant-design/ant-design/issues/28881
  // Only need unRegister when component unMount


  react__WEBPACK_IMPORTED_MODULE_6__.useEffect(function () {
    var unRegister = registerImage(currentId, src);
    return unRegister;
  }, []);
  react__WEBPACK_IMPORTED_MODULE_6__.useEffect(function () {
    registerImage(currentId, src, canPreview);
  }, [src, canPreview]); // Keep order end

  react__WEBPACK_IMPORTED_MODULE_6__.useEffect(function () {
    if (isError) {
      setStatus('normal');
    }

    if (isCustomPlaceholder && !isLoaded.current) {
      setStatus('loading');
    }
  }, [imgSrc]);
  var wrapperClass = classnames__WEBPACK_IMPORTED_MODULE_7___default()(prefixCls, wrapperClassName, rootClassName, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])({}, "".concat(prefixCls, "-error"), isError));
  var mergedSrc = isError && fallback ? fallback : src;
  var imgCommonProps = {
    crossOrigin: crossOrigin,
    decoding: decoding,
    draggable: draggable,
    loading: loading,
    referrerPolicy: referrerPolicy,
    sizes: sizes,
    srcSet: srcSet,
    useMap: useMap,
    alt: alt,
    className: classnames__WEBPACK_IMPORTED_MODULE_7___default()("".concat(prefixCls, "-img"), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])({}, "".concat(prefixCls, "-img-placeholder"), placeholder === true), className),
    style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({
      height: height
    }, style)
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement(react__WEBPACK_IMPORTED_MODULE_6__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("div", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, otherProps, {
    className: wrapperClass,
    onClick: canPreview ? onPreview : onClick,
    style: (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({
      width: width,
      height: height
    }, wrapperStyle)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("img", (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, imgCommonProps, {
    ref: getImgRef
  }, isError && fallback ? {
    src: fallback
  } : {
    onLoad: onLoad,
    onError: onError,
    src: imgSrc
  }, {
    width: width,
    height: height
  })), status === 'loading' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("div", {
    "aria-hidden": "true",
    className: "".concat(prefixCls, "-placeholder")
  }, placeholder), previewMask && canPreview && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement("div", {
    className: classnames__WEBPACK_IMPORTED_MODULE_7___default()("".concat(prefixCls, "-mask"), maskClassName),
    style: {
      display: ((_imgCommonProps$style = imgCommonProps.style) === null || _imgCommonProps$style === void 0 ? void 0 : _imgCommonProps$style.display) === 'none' ? 'none' : undefined
    }
  }, previewMask)), !isPreviewGroup && canPreview && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_6__.createElement(_Preview__WEBPACK_IMPORTED_MODULE_10__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    "aria-hidden": !isShowPreview,
    visible: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    src: mergedSrc,
    alt: alt,
    getContainer: getPreviewContainer,
    icons: icons,
    scaleStep: scaleStep,
    rootClassName: rootClassName
  }, dialogProps)));
};

ImageInternal.PreviewGroup = _PreviewGroup__WEBPACK_IMPORTED_MODULE_11__["default"];
ImageInternal.displayName = 'Image';
/* harmony default export */ __webpack_exports__["default"] = (ImageInternal);

/***/ }),

/***/ "../node_modules/rc-image/es/Operations.js":
/*!*************************************************!*\
  !*** ../node_modules/rc-image/es/Operations.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_motion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-motion */ "../node_modules/rc-motion/es/index.js");
/* harmony import */ var _rc_component_portal__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @rc-component/portal */ "../node_modules/@rc-component/portal/es/index.js");
/* harmony import */ var _previewConfig__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./previewConfig */ "../node_modules/rc-image/es/previewConfig.js");







var Operations = function Operations(props) {
  var _countRender;

  var visible = props.visible,
      maskTransitionName = props.maskTransitionName,
      getContainer = props.getContainer,
      prefixCls = props.prefixCls,
      rootClassName = props.rootClassName,
      icons = props.icons,
      countRender = props.countRender,
      showSwitch = props.showSwitch,
      showProgress = props.showProgress,
      current = props.current,
      count = props.count,
      scale = props.scale,
      onSwitchLeft = props.onSwitchLeft,
      onSwitchRight = props.onSwitchRight,
      onClose = props.onClose,
      onZoomIn = props.onZoomIn,
      onZoomOut = props.onZoomOut,
      onRotateRight = props.onRotateRight,
      onRotateLeft = props.onRotateLeft;
  var rotateLeft = icons.rotateLeft,
      rotateRight = icons.rotateRight,
      zoomIn = icons.zoomIn,
      zoomOut = icons.zoomOut,
      close = icons.close,
      left = icons.left,
      right = icons.right;
  var toolClassName = "".concat(prefixCls, "-operations-operation");
  var iconClassName = "".concat(prefixCls, "-operations-icon");
  var tools = [{
    icon: close,
    onClick: onClose,
    type: 'close'
  }, {
    icon: zoomIn,
    onClick: onZoomIn,
    type: 'zoomIn',
    disabled: scale === _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MAX_SCALE
  }, {
    icon: zoomOut,
    onClick: onZoomOut,
    type: 'zoomOut',
    disabled: scale === _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MIN_SCALE
  }, {
    icon: rotateRight,
    onClick: onRotateRight,
    type: 'rotateRight'
  }, {
    icon: rotateLeft,
    onClick: onRotateLeft,
    type: 'rotateLeft'
  }];
  var operations = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(react__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, showSwitch && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(react__WEBPACK_IMPORTED_MODULE_1__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("div", {
    className: classnames__WEBPACK_IMPORTED_MODULE_2___default()("".concat(prefixCls, "-switch-left"), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])({}, "".concat(prefixCls, "-switch-left-disabled"), current === 0)),
    onClick: onSwitchLeft
  }, left), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("div", {
    className: classnames__WEBPACK_IMPORTED_MODULE_2___default()("".concat(prefixCls, "-switch-right"), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])({}, "".concat(prefixCls, "-switch-right-disabled"), current === count - 1)),
    onClick: onSwitchRight
  }, right)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("ul", {
    className: "".concat(prefixCls, "-operations")
  }, showProgress && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("li", {
    className: "".concat(prefixCls, "-operations-progress")
  }, (_countRender = countRender === null || countRender === void 0 ? void 0 : countRender(current + 1, count)) !== null && _countRender !== void 0 ? _countRender : "".concat(current + 1, " / ").concat(count)), tools.map(function (_ref) {
    var _classnames3;

    var icon = _ref.icon,
        onClick = _ref.onClick,
        type = _ref.type,
        disabled = _ref.disabled;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("li", {
      className: classnames__WEBPACK_IMPORTED_MODULE_2___default()(toolClassName, (_classnames3 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classnames3, "".concat(prefixCls, "-operations-operation-").concat(type), true), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classnames3, "".concat(prefixCls, "-operations-operation-disabled"), !!disabled), _classnames3)),
      onClick: onClick,
      key: type
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.isValidElement(icon) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.cloneElement(icon, {
      className: iconClassName
    }) : icon);
  })));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(rc_motion__WEBPACK_IMPORTED_MODULE_3__["default"], {
    visible: visible,
    motionName: maskTransitionName
  }, function (_ref2) {
    var className = _ref2.className,
        style = _ref2.style;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(_rc_component_portal__WEBPACK_IMPORTED_MODULE_4__["default"], {
      open: true,
      getContainer: getContainer !== null && getContainer !== void 0 ? getContainer : document.body
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement("div", {
      className: classnames__WEBPACK_IMPORTED_MODULE_2___default()("".concat(prefixCls, "-operations-wrapper"), className, rootClassName),
      style: style
    }, operations));
  });
};

/* harmony default export */ __webpack_exports__["default"] = (Operations);

/***/ }),

/***/ "../node_modules/rc-image/es/Preview.js":
/*!**********************************************!*\
  !*** ../node_modules/rc-image/es/Preview.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var rc_dialog__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rc-dialog */ "../node_modules/rc-dialog/es/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rc-util/es/Dom/addEventListener */ "../node_modules/rc-util/es/Dom/addEventListener.js");
/* harmony import */ var rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rc-util/es/KeyCode */ "../node_modules/rc-util/es/KeyCode.js");
/* harmony import */ var rc_util_es_warning__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rc-util/es/warning */ "../node_modules/rc-util/es/warning.js");
/* harmony import */ var _PreviewGroup__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./PreviewGroup */ "../node_modules/rc-image/es/PreviewGroup.js");
/* harmony import */ var _Operations__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./Operations */ "../node_modules/rc-image/es/Operations.js");
/* harmony import */ var _hooks_useImageTransform__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./hooks/useImageTransform */ "../node_modules/rc-image/es/hooks/useImageTransform.js");
/* harmony import */ var _getFixScaleEleTransPosition__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./getFixScaleEleTransPosition */ "../node_modules/rc-image/es/getFixScaleEleTransPosition.js");
/* harmony import */ var _previewConfig__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./previewConfig */ "../node_modules/rc-image/es/previewConfig.js");





var _excluded = ["prefixCls", "src", "alt", "onClose", "afterClose", "visible", "icons", "rootClassName", "getContainer", "countRender", "scaleStep", "transitionName", "maskTransitionName"];












var Preview = function Preview(props) {
  var prefixCls = props.prefixCls,
      src = props.src,
      alt = props.alt,
      onClose = props.onClose,
      afterClose = props.afterClose,
      visible = props.visible,
      _props$icons = props.icons,
      icons = _props$icons === void 0 ? {} : _props$icons,
      rootClassName = props.rootClassName,
      getContainer = props.getContainer,
      countRender = props.countRender,
      _props$scaleStep = props.scaleStep,
      scaleStep = _props$scaleStep === void 0 ? 0.5 : _props$scaleStep,
      _props$transitionName = props.transitionName,
      transitionName = _props$transitionName === void 0 ? 'zoom' : _props$transitionName,
      _props$maskTransition = props.maskTransitionName,
      maskTransitionName = _props$maskTransition === void 0 ? 'fade' : _props$maskTransition,
      restProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_4__["default"])(props, _excluded);

  var imgRef = (0,react__WEBPACK_IMPORTED_MODULE_5__.useRef)();
  var downPositionRef = (0,react__WEBPACK_IMPORTED_MODULE_5__.useRef)({
    deltaX: 0,
    deltaY: 0,
    transformX: 0,
    transformY: 0
  });

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_5__.useState)(false),
      _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_useState, 2),
      isMoving = _useState2[0],
      setMoving = _useState2[1];

  var _useContext = (0,react__WEBPACK_IMPORTED_MODULE_5__.useContext)(_PreviewGroup__WEBPACK_IMPORTED_MODULE_11__.context),
      previewUrls = _useContext.previewUrls,
      current = _useContext.current,
      isPreviewGroup = _useContext.isPreviewGroup,
      setCurrent = _useContext.setCurrent;

  var previewGroupCount = previewUrls.size;
  var previewUrlsKeys = Array.from(previewUrls.keys());
  var currentPreviewIndex = previewUrlsKeys.indexOf(current);
  var combinationSrc = isPreviewGroup ? previewUrls.get(current) : src;
  var showLeftOrRightSwitches = isPreviewGroup && previewGroupCount > 1;
  var showOperationsProgress = isPreviewGroup && previewGroupCount >= 1;

  var _useImageTransform = (0,_hooks_useImageTransform__WEBPACK_IMPORTED_MODULE_13__["default"])(imgRef),
      transform = _useImageTransform.transform,
      resetTransform = _useImageTransform.resetTransform,
      updateTransform = _useImageTransform.updateTransform,
      dispatchZoonChange = _useImageTransform.dispatchZoonChange;

  var rotate = transform.rotate,
      scale = transform.scale;
  var wrapClassName = classnames__WEBPACK_IMPORTED_MODULE_7___default()((0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])({}, "".concat(prefixCls, "-moving"), isMoving));

  var onAfterClose = function onAfterClose() {
    resetTransform();
  };

  var onZoomIn = function onZoomIn() {
    dispatchZoonChange(_previewConfig__WEBPACK_IMPORTED_MODULE_15__.BASE_SCALE_RATIO + scaleStep);
  };

  var onZoomOut = function onZoomOut() {
    dispatchZoonChange(_previewConfig__WEBPACK_IMPORTED_MODULE_15__.BASE_SCALE_RATIO - scaleStep);
  };

  var onRotateRight = function onRotateRight() {
    updateTransform({
      rotate: rotate + 90
    });
  };

  var onRotateLeft = function onRotateLeft() {
    updateTransform({
      rotate: rotate - 90
    });
  };

  var onSwitchLeft = function onSwitchLeft(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentPreviewIndex > 0) {
      setCurrent(previewUrlsKeys[currentPreviewIndex - 1]);
    }
  };

  var onSwitchRight = function onSwitchRight(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentPreviewIndex < previewGroupCount - 1) {
      setCurrent(previewUrlsKeys[currentPreviewIndex + 1]);
    }
  };

  var onMouseUp = function onMouseUp() {
    if (visible && isMoving) {
      setMoving(false);
      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */

      var _downPositionRef$curr = downPositionRef.current,
          transformX = _downPositionRef$curr.transformX,
          transformY = _downPositionRef$curr.transformY;
      var hasChangedPosition = transform.x !== transformX && transform.y !== transformY;

      if (!hasChangedPosition) {
        return;
      }

      var width = imgRef.current.offsetWidth * scale;
      var height = imgRef.current.offsetHeight * scale; // eslint-disable-next-line @typescript-eslint/no-shadow

      var _imgRef$current$getBo = imgRef.current.getBoundingClientRect(),
          left = _imgRef$current$getBo.left,
          top = _imgRef$current$getBo.top;

      var isRotate = rotate % 180 !== 0;
      var fixState = (0,_getFixScaleEleTransPosition__WEBPACK_IMPORTED_MODULE_14__["default"])(isRotate ? height : width, isRotate ? width : height, left, top);

      if (fixState) {
        updateTransform((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, fixState));
      }
    }
  };

  var onMouseDown = function onMouseDown(event) {
    // Only allow main button
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    downPositionRef.current = {
      deltaX: event.pageX - transform.x,
      deltaY: event.pageY - transform.y,
      transformX: transform.x,
      transformY: transform.y
    };
    setMoving(true);
  };

  var onMouseMove = function onMouseMove(event) {
    if (visible && isMoving) {
      updateTransform({
        x: event.pageX - downPositionRef.current.deltaX,
        y: event.pageY - downPositionRef.current.deltaY
      });
    }
  };

  var onWheel = function onWheel(event) {
    if (!visible || event.deltaY == 0) return; // Scale ratio depends on the deltaY size

    var scaleRatio = Math.abs(event.deltaY / 100); // Limit the maximum scale ratio

    var mergedScaleRatio = Math.min(scaleRatio, _previewConfig__WEBPACK_IMPORTED_MODULE_15__.WHEEL_MAX_SCALE_RATIO); // Scale the ratio each time

    var ratio = _previewConfig__WEBPACK_IMPORTED_MODULE_15__.BASE_SCALE_RATIO + mergedScaleRatio * scaleStep;

    if (event.deltaY > 0) {
      ratio = _previewConfig__WEBPACK_IMPORTED_MODULE_15__.BASE_SCALE_RATIO / ratio;
    }

    dispatchZoonChange(ratio, event.clientX, event.clientY);
  };

  var onKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_5__.useCallback)(function (event) {
    if (!visible || !showLeftOrRightSwitches) return;

    if (event.keyCode === rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_9__["default"].LEFT) {
      if (currentPreviewIndex > 0) {
        setCurrent(previewUrlsKeys[currentPreviewIndex - 1]);
      }
    } else if (event.keyCode === rc_util_es_KeyCode__WEBPACK_IMPORTED_MODULE_9__["default"].RIGHT) {
      if (currentPreviewIndex < previewGroupCount - 1) {
        setCurrent(previewUrlsKeys[currentPreviewIndex + 1]);
      }
    }
  }, [currentPreviewIndex, previewGroupCount, previewUrlsKeys, setCurrent, showLeftOrRightSwitches, visible]);

  var onDoubleClick = function onDoubleClick(event) {
    if (visible) {
      if (scale !== 1) {
        updateTransform({
          x: 0,
          y: 0,
          scale: 1
        });
      } else {
        dispatchZoonChange(_previewConfig__WEBPACK_IMPORTED_MODULE_15__.BASE_SCALE_RATIO + scaleStep, event.clientX, event.clientY);
      }
    }
  };

  (0,react__WEBPACK_IMPORTED_MODULE_5__.useEffect)(function () {
    var onTopMouseUpListener;
    var onTopMouseMoveListener;
    var onMouseUpListener = (0,rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__["default"])(window, 'mouseup', onMouseUp, false);
    var onMouseMoveListener = (0,rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__["default"])(window, 'mousemove', onMouseMove, false);
    var onKeyDownListener = (0,rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__["default"])(window, 'keydown', onKeyDown, false);

    try {
      // Resolve if in iframe lost event

      /* istanbul ignore next */
      if (window.top !== window.self) {
        onTopMouseUpListener = (0,rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__["default"])(window.top, 'mouseup', onMouseUp, false);
        onTopMouseMoveListener = (0,rc_util_es_Dom_addEventListener__WEBPACK_IMPORTED_MODULE_8__["default"])(window.top, 'mousemove', onMouseMove, false);
      }
    } catch (error) {
      /* istanbul ignore next */
      (0,rc_util_es_warning__WEBPACK_IMPORTED_MODULE_10__.warning)(false, "[rc-image] ".concat(error));
    }

    return function () {
      var _onTopMouseUpListener, _onTopMouseMoveListen;

      onMouseUpListener.remove();
      onMouseMoveListener.remove();
      onKeyDownListener.remove();
      /* istanbul ignore next */

      (_onTopMouseUpListener = onTopMouseUpListener) === null || _onTopMouseUpListener === void 0 ? void 0 : _onTopMouseUpListener.remove();
      /* istanbul ignore next */

      (_onTopMouseMoveListen = onTopMouseMoveListener) === null || _onTopMouseMoveListen === void 0 ? void 0 : _onTopMouseMoveListen.remove();
    };
  }, [visible, isMoving, onKeyDown]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5___default().createElement((react__WEBPACK_IMPORTED_MODULE_5___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5___default().createElement(rc_dialog__WEBPACK_IMPORTED_MODULE_6__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    transitionName: transitionName,
    maskTransitionName: maskTransitionName,
    closable: false,
    keyboard: true,
    prefixCls: prefixCls,
    onClose: onClose,
    afterClose: onAfterClose,
    visible: visible,
    wrapClassName: wrapClassName,
    rootClassName: rootClassName,
    getContainer: getContainer
  }, restProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5___default().createElement("div", {
    className: "".concat(prefixCls, "-img-wrapper")
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5___default().createElement("img", {
    width: props.width,
    height: props.height,
    onWheel: onWheel,
    onMouseDown: onMouseDown,
    onDoubleClick: onDoubleClick,
    ref: imgRef,
    className: "".concat(prefixCls, "-img"),
    src: combinationSrc,
    alt: alt,
    style: {
      transform: "translate3d(".concat(transform.x, "px, ").concat(transform.y, "px, 0) scale3d(").concat(scale, ", ").concat(scale, ", 1) rotate(").concat(rotate, "deg)")
    }
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_5___default().createElement(_Operations__WEBPACK_IMPORTED_MODULE_12__["default"], {
    visible: visible,
    maskTransitionName: maskTransitionName,
    getContainer: getContainer,
    prefixCls: prefixCls,
    rootClassName: rootClassName,
    icons: icons,
    countRender: countRender,
    showSwitch: showLeftOrRightSwitches,
    showProgress: showOperationsProgress,
    current: currentPreviewIndex,
    count: previewGroupCount,
    scale: scale,
    onSwitchLeft: onSwitchLeft,
    onSwitchRight: onSwitchRight,
    onZoomIn: onZoomIn,
    onZoomOut: onZoomOut,
    onRotateRight: onRotateRight,
    onRotateLeft: onRotateLeft,
    onClose: onClose
  }));
};

/* harmony default export */ __webpack_exports__["default"] = (Preview);

/***/ }),

/***/ "../node_modules/rc-image/es/PreviewGroup.js":
/*!***************************************************!*\
  !*** ../node_modules/rc-image/es/PreviewGroup.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   context: function() { return /* binding */ context; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/hooks/useMergedState */ "../node_modules/rc-util/es/hooks/useMergedState.js");
/* harmony import */ var _Preview__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Preview */ "../node_modules/rc-image/es/Preview.js");




var _excluded = ["visible", "onVisibleChange", "getContainer", "current", "countRender"];





/* istanbul ignore next */
var context = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createContext({
  previewUrls: new Map(),
  setPreviewUrls: function setPreviewUrls() {
    return null;
  },
  current: null,
  setCurrent: function setCurrent() {
    return null;
  },
  setShowPreview: function setShowPreview() {
    return null;
  },
  setMousePosition: function setMousePosition() {
    return null;
  },
  registerImage: function registerImage() {
    return function () {
      return null;
    };
  },
  rootClassName: ''
});
var Provider = context.Provider;

var Group = function Group(_ref) {
  var _ref$previewPrefixCls = _ref.previewPrefixCls,
      previewPrefixCls = _ref$previewPrefixCls === void 0 ? 'rc-image-preview' : _ref$previewPrefixCls,
      children = _ref.children,
      _ref$icons = _ref.icons,
      icons = _ref$icons === void 0 ? {} : _ref$icons,
      preview = _ref.preview;

  var _ref2 = (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(preview) === 'object' ? preview : {},
      _ref2$visible = _ref2.visible,
      previewVisible = _ref2$visible === void 0 ? undefined : _ref2$visible,
      _ref2$onVisibleChange = _ref2.onVisibleChange,
      onPreviewVisibleChange = _ref2$onVisibleChange === void 0 ? undefined : _ref2$onVisibleChange,
      _ref2$getContainer = _ref2.getContainer,
      getContainer = _ref2$getContainer === void 0 ? undefined : _ref2$getContainer,
      _ref2$current = _ref2.current,
      currentIndex = _ref2$current === void 0 ? 0 : _ref2$current,
      _ref2$countRender = _ref2.countRender,
      countRender = _ref2$countRender === void 0 ? undefined : _ref2$countRender,
      dialogProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_3__["default"])(_ref2, _excluded);

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(new Map()),
      _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_useState, 2),
      previewUrls = _useState2[0],
      setPreviewUrls = _useState2[1];

  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(),
      _useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_useState3, 2),
      current = _useState4[0],
      setCurrent = _useState4[1];

  var _useMergedState = (0,rc_util_es_hooks_useMergedState__WEBPACK_IMPORTED_MODULE_5__["default"])(!!previewVisible, {
    value: previewVisible,
    onChange: onPreviewVisibleChange
  }),
      _useMergedState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_useMergedState, 2),
      isShowPreview = _useMergedState2[0],
      setShowPreview = _useMergedState2[1];

  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(null),
      _useState6 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_useState5, 2),
      mousePosition = _useState6[0],
      setMousePosition = _useState6[1];

  var isControlled = previewVisible !== undefined;
  var previewUrlsKeys = Array.from(previewUrls.keys());
  var currentControlledKey = previewUrlsKeys[currentIndex];
  var canPreviewUrls = new Map(Array.from(previewUrls).filter(function (_ref3) {
    var _ref4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
        canPreview = _ref4[1].canPreview;

    return !!canPreview;
  }).map(function (_ref5) {
    var _ref6 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref5, 2),
        id = _ref6[0],
        url = _ref6[1].url;

    return [id, url];
  }));

  var registerImage = function registerImage(id, url) {
    var canPreview = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var unRegister = function unRegister() {
      setPreviewUrls(function (oldPreviewUrls) {
        var clonePreviewUrls = new Map(oldPreviewUrls);
        var deleteResult = clonePreviewUrls.delete(id);
        return deleteResult ? clonePreviewUrls : oldPreviewUrls;
      });
    };

    setPreviewUrls(function (oldPreviewUrls) {
      return new Map(oldPreviewUrls).set(id, {
        url: url,
        canPreview: canPreview
      });
    });
    return unRegister;
  };

  var onPreviewClose = function onPreviewClose(e) {
    e.stopPropagation();
    setShowPreview(false);
    setMousePosition(null);
  };

  react__WEBPACK_IMPORTED_MODULE_4__.useEffect(function () {
    setCurrent(currentControlledKey);
  }, [currentControlledKey]);
  react__WEBPACK_IMPORTED_MODULE_4__.useEffect(function () {
    if (!isShowPreview && isControlled) {
      setCurrent(currentControlledKey);
    }
  }, [currentControlledKey, isControlled, isShowPreview]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(Provider, {
    value: {
      isPreviewGroup: true,
      previewUrls: canPreviewUrls,
      setPreviewUrls: setPreviewUrls,
      current: current,
      setCurrent: setCurrent,
      setShowPreview: setShowPreview,
      setMousePosition: setMousePosition,
      registerImage: registerImage
    }
  }, children, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_4__.createElement(_Preview__WEBPACK_IMPORTED_MODULE_6__["default"], (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
    "aria-hidden": !isShowPreview,
    visible: isShowPreview,
    prefixCls: previewPrefixCls,
    onClose: onPreviewClose,
    mousePosition: mousePosition,
    src: canPreviewUrls.get(current),
    icons: icons,
    getContainer: getContainer,
    countRender: countRender
  }, dialogProps)));
};

/* harmony default export */ __webpack_exports__["default"] = (Group);

/***/ }),

/***/ "../node_modules/rc-image/es/getFixScaleEleTransPosition.js":
/*!******************************************************************!*\
  !*** ../node_modules/rc-image/es/getFixScaleEleTransPosition.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ getFixScaleEleTransPosition; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-util/es/Dom/css */ "../node_modules/rc-util/es/Dom/css.js");




function fixPoint(key, start, width, clientWidth) {
  var startAddWidth = start + width;
  var offsetStart = (width - clientWidth) / 2;

  if (width > clientWidth) {
    if (start > 0) {
      return (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])({}, key, offsetStart);
    }

    if (start < 0 && startAddWidth < clientWidth) {
      return (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])({}, key, -offsetStart);
    }
  } else if (start < 0 || startAddWidth > clientWidth) {
    return (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])({}, key, start < 0 ? offsetStart : -offsetStart);
  }

  return {};
}
/**
 * Fix positon x,y point when
 *
 * Ele width && height < client
 * - Back origin
 *
 * - Ele width | height > clientWidth | clientHeight
 * - left | top > 0 -> Back 0
 * - left | top + width | height < clientWidth | clientHeight -> Back left | top + width | height === clientWidth | clientHeight
 *
 * Regardless of other
 */


function getFixScaleEleTransPosition(width, height, left, top) {
  var _getClientSize = (0,rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_2__.getClientSize)(),
      clientWidth = _getClientSize.width,
      clientHeight = _getClientSize.height;

  var fixPos = null;

  if (width <= clientWidth && height <= clientHeight) {
    fixPos = {
      x: 0,
      y: 0
    };
  } else if (width > clientWidth || height > clientHeight) {
    fixPos = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, fixPoint('x', left, width, clientWidth)), fixPoint('y', top, height, clientHeight));
  }

  return fixPos;
}

/***/ }),

/***/ "../node_modules/rc-image/es/hooks/useImageTransform.js":
/*!**************************************************************!*\
  !*** ../node_modules/rc-image/es/hooks/useImageTransform.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useImageTransform; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rc_util_es_raf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/raf */ "../node_modules/rc-util/es/raf.js");
/* harmony import */ var rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rc-util/es/Dom/css */ "../node_modules/rc-util/es/Dom/css.js");
/* harmony import */ var _previewConfig__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../previewConfig */ "../node_modules/rc-image/es/previewConfig.js");






var initialTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1
};
function useImageTransform(imgRef) {
  var frame = (0,react__WEBPACK_IMPORTED_MODULE_2__.useRef)(null);
  var queue = (0,react__WEBPACK_IMPORTED_MODULE_2__.useRef)([]);

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(initialTransform),
      _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_useState, 2),
      transform = _useState2[0],
      setTransform = _useState2[1];

  var resetTransform = function resetTransform() {
    setTransform(initialTransform);
  };
  /** Direct update transform */


  var updateTransform = function updateTransform(newTransform) {
    if (frame.current === null) {
      queue.current = [];
      frame.current = (0,rc_util_es_raf__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
        setTransform(function (preState) {
          var memoState = preState;
          queue.current.forEach(function (queueState) {
            memoState = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, memoState), queueState);
          });
          frame.current = null;
          return memoState;
        });
      });
    }

    queue.current.push((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, transform), newTransform));
  };
  /** Scale according to the position of clientX and clientY */


  var dispatchZoonChange = function dispatchZoonChange(ratio, clientX, clientY) {
    var _imgRef$current = imgRef.current,
        width = _imgRef$current.width,
        height = _imgRef$current.height,
        offsetWidth = _imgRef$current.offsetWidth,
        offsetHeight = _imgRef$current.offsetHeight,
        offsetLeft = _imgRef$current.offsetLeft,
        offsetTop = _imgRef$current.offsetTop;
    var newRatio = ratio;
    var newScale = transform.scale * ratio;

    if (newScale > _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MAX_SCALE) {
      newRatio = _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MAX_SCALE / transform.scale;
      newScale = _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MAX_SCALE;
    } else if (newScale < _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MIN_SCALE) {
      newRatio = _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MIN_SCALE / transform.scale;
      newScale = _previewConfig__WEBPACK_IMPORTED_MODULE_5__.MIN_SCALE;
    }
    /** Default center point scaling */


    var mergedClientX = clientX !== null && clientX !== void 0 ? clientX : innerWidth / 2;
    var mergedClientY = clientY !== null && clientY !== void 0 ? clientY : innerHeight / 2;
    var diffRatio = newRatio - 1;
    /** Deviation calculated from image size */

    var diffImgX = diffRatio * width * 0.5;
    var diffImgY = diffRatio * height * 0.5;
    /** The difference between the click position and the edge of the document */

    var diffOffsetLeft = diffRatio * (mergedClientX - transform.x - offsetLeft);
    var diffOffsetTop = diffRatio * (mergedClientY - transform.y - offsetTop);
    /** Final positioning */

    var newX = transform.x - (diffOffsetLeft - diffImgX);
    var newY = transform.y - (diffOffsetTop - diffImgY);
    /**
     * When zooming the image
     * When the image size is smaller than the width and height of the window, the position is initialized
     */

    if (ratio < 1 && newScale === 1) {
      var mergedWidth = offsetWidth * newScale;
      var mergedHeight = offsetHeight * newScale;

      var _getClientSize = (0,rc_util_es_Dom_css__WEBPACK_IMPORTED_MODULE_4__.getClientSize)(),
          clientWidth = _getClientSize.width,
          clientHeight = _getClientSize.height;

      if (mergedWidth <= clientWidth && mergedHeight <= clientHeight) {
        newX = 0;
        newY = 0;
      }
    }

    updateTransform({
      x: newX,
      y: newY,
      scale: newScale
    });
  };

  return {
    transform: transform,
    resetTransform: resetTransform,
    updateTransform: updateTransform,
    dispatchZoonChange: dispatchZoonChange
  };
}
;

/***/ }),

/***/ "../node_modules/rc-image/es/index.js":
/*!********************************************!*\
  !*** ../node_modules/rc-image/es/index.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Image__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Image */ "../node_modules/rc-image/es/Image.js");


/* harmony default export */ __webpack_exports__["default"] = (_Image__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/rc-image/es/previewConfig.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-image/es/previewConfig.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BASE_SCALE_RATIO: function() { return /* binding */ BASE_SCALE_RATIO; },
/* harmony export */   MAX_SCALE: function() { return /* binding */ MAX_SCALE; },
/* harmony export */   MIN_SCALE: function() { return /* binding */ MIN_SCALE; },
/* harmony export */   WHEEL_MAX_SCALE_RATIO: function() { return /* binding */ WHEEL_MAX_SCALE_RATIO; }
/* harmony export */ });
/** Minimum scale */
var MIN_SCALE = 1;
/** Maximum Scale */

var MAX_SCALE = 50;
/** Scale the ratio base */

var BASE_SCALE_RATIO = 1;
/** The maximum zoom ratio when the mouse zooms in, adjustable */

var WHEEL_MAX_SCALE_RATIO = 0.2;

/***/ }),

/***/ "../node_modules/rc-motion/es/CSSMotion.js":
/*!*************************************************!*\
  !*** ../node_modules/rc-motion/es/CSSMotion.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   genCSSMotion: function() { return /* binding */ genCSSMotion; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var rc_util_es_Dom_findDOMNode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rc-util/es/Dom/findDOMNode */ "../node_modules/rc-util/es/Dom/findDOMNode.js");
/* harmony import */ var rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rc-util/es/ref */ "../node_modules/rc-util/es/ref.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./context */ "../node_modules/rc-motion/es/context.js");
/* harmony import */ var _DomWrapper__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./DomWrapper */ "../node_modules/rc-motion/es/DomWrapper.js");
/* harmony import */ var _hooks_useStatus__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./hooks/useStatus */ "../node_modules/rc-motion/es/hooks/useStatus.js");
/* harmony import */ var _hooks_useStepQueue__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./hooks/useStepQueue */ "../node_modules/rc-motion/es/hooks/useStepQueue.js");
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./interface */ "../node_modules/rc-motion/es/interface.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./util/motion */ "../node_modules/rc-motion/es/util/motion.js");




/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */











/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
function genCSSMotion(config) {
  var transitionSupport = config;
  if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_3__["default"])(config) === 'object') {
    transitionSupport = config.transitionSupport;
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  var CSSMotion = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.forwardRef(function (props, ref) {
    var _props$visible = props.visible,
      visible = _props$visible === void 0 ? true : _props$visible,
      _props$removeOnLeave = props.removeOnLeave,
      removeOnLeave = _props$removeOnLeave === void 0 ? true : _props$removeOnLeave,
      forceRender = props.forceRender,
      children = props.children,
      motionName = props.motionName,
      leavedClassName = props.leavedClassName,
      eventProps = props.eventProps;
    var _React$useContext = react__WEBPACK_IMPORTED_MODULE_7__.useContext(_context__WEBPACK_IMPORTED_MODULE_8__.Context),
      contextMotion = _React$useContext.motion;
    var supportMotion = isSupportTransition(props, contextMotion);

    // Ref to the react node, it may be a HTMLElement
    var nodeRef = (0,react__WEBPACK_IMPORTED_MODULE_7__.useRef)();
    // Ref to the dom wrapper in case ref can not pass to HTMLElement
    var wrapperNodeRef = (0,react__WEBPACK_IMPORTED_MODULE_7__.useRef)();
    function getDomElement() {
      try {
        // Here we're avoiding call for findDOMNode since it's deprecated
        // in strict mode. We're calling it only when node ref is not
        // an instance of DOM HTMLElement. Otherwise use
        // findDOMNode as a final resort
        return nodeRef.current instanceof HTMLElement ? nodeRef.current : (0,rc_util_es_Dom_findDOMNode__WEBPACK_IMPORTED_MODULE_5__["default"])(wrapperNodeRef.current);
      } catch (e) {
        // Only happen when `motionDeadline` trigger but element removed.
        return null;
      }
    }
    var _useStatus = (0,_hooks_useStatus__WEBPACK_IMPORTED_MODULE_10__["default"])(supportMotion, visible, getDomElement, props),
      _useStatus2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useStatus, 4),
      status = _useStatus2[0],
      statusStep = _useStatus2[1],
      statusStyle = _useStatus2[2],
      mergedVisible = _useStatus2[3];

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    var renderedRef = react__WEBPACK_IMPORTED_MODULE_7__.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }

    // ====================== Refs ======================
    var setNodeRef = react__WEBPACK_IMPORTED_MODULE_7__.useCallback(function (node) {
      nodeRef.current = node;
      (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.fillRef)(ref, node);
    }, [ref]);

    // ===================== Render =====================
    var motionChildren;
    var mergedProps = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, eventProps), {}, {
      visible: visible
    });
    if (!children) {
      // No children
      motionChildren = null;
    } else if (status === _interface__WEBPACK_IMPORTED_MODULE_12__.STATUS_NONE) {
      // Stable children
      if (mergedVisible) {
        motionChildren = children((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, mergedProps), setNodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, mergedProps), {}, {
          className: leavedClassName
        }), setNodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, mergedProps), {}, {
          style: {
            display: 'none'
          }
        }), setNodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      var _classNames;
      // In motion
      var statusSuffix;
      if (statusStep === _interface__WEBPACK_IMPORTED_MODULE_12__.STEP_PREPARE) {
        statusSuffix = 'prepare';
      } else if ((0,_hooks_useStepQueue__WEBPACK_IMPORTED_MODULE_11__.isActive)(statusStep)) {
        statusSuffix = 'active';
      } else if (statusStep === _interface__WEBPACK_IMPORTED_MODULE_12__.STEP_START) {
        statusSuffix = 'start';
      }
      var motionCls = (0,_util_motion__WEBPACK_IMPORTED_MODULE_13__.getTransitionName)(motionName, "".concat(status, "-").concat(statusSuffix));
      motionChildren = children((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, mergedProps), {}, {
        className: classnames__WEBPACK_IMPORTED_MODULE_4___default()((0,_util_motion__WEBPACK_IMPORTED_MODULE_13__.getTransitionName)(motionName, status), (_classNames = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, motionCls, motionCls && statusSuffix), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(_classNames, motionName, typeof motionName === 'string'), _classNames)),
        style: statusStyle
      }), setNodeRef);
    }

    // Auto inject ref if child node not have `ref` props
    if ( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.isValidElement(motionChildren) && (0,rc_util_es_ref__WEBPACK_IMPORTED_MODULE_6__.supportRef)(motionChildren)) {
      var _ref = motionChildren,
        originNodeRef = _ref.ref;
      if (!originNodeRef) {
        motionChildren = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.cloneElement(motionChildren, {
          ref: setNodeRef
        });
      }
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7__.createElement(_DomWrapper__WEBPACK_IMPORTED_MODULE_9__["default"], {
      ref: wrapperNodeRef
    }, motionChildren);
  });
  CSSMotion.displayName = 'CSSMotion';
  return CSSMotion;
}
/* harmony default export */ __webpack_exports__["default"] = (genCSSMotion(_util_motion__WEBPACK_IMPORTED_MODULE_13__.supportTransition));

/***/ }),

/***/ "../node_modules/rc-motion/es/CSSMotionList.js":
/*!*****************************************************!*\
  !*** ../node_modules/rc-motion/es/CSSMotionList.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   genCSSMotionList: function() { return /* binding */ genCSSMotionList; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/extends */ "../node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "../node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/assertThisInitialized */ "../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "../node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createSuper */ "../node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _CSSMotion__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./CSSMotion */ "../node_modules/rc-motion/es/CSSMotion.js");
/* harmony import */ var _util_diff__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./util/diff */ "../node_modules/rc-motion/es/util/diff.js");
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./util/motion */ "../node_modules/rc-motion/es/util/motion.js");









var _excluded = ["component", "children", "onVisibleChanged", "onAllRemoved"],
  _excluded2 = ["status"];
/* eslint react/prop-types: 0 */




var MOTION_PROP_NAMES = ['eventProps', 'visible', 'children', 'motionName', 'motionAppear', 'motionEnter', 'motionLeave', 'motionLeaveImmediately', 'motionDeadline', 'removeOnLeave', 'leavedClassName', 'onAppearPrepare', 'onAppearStart', 'onAppearActive', 'onAppearEnd', 'onEnterStart', 'onEnterActive', 'onEnterEnd', 'onLeaveStart', 'onLeaveActive', 'onLeaveEnd'];
/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
function genCSSMotionList(transitionSupport) {
  var CSSMotion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _CSSMotion__WEBPACK_IMPORTED_MODULE_10__["default"];
  var CSSMotionList = /*#__PURE__*/function (_React$Component) {
    (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_6__["default"])(CSSMotionList, _React$Component);
    var _super = (0,_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_7__["default"])(CSSMotionList);
    function CSSMotionList() {
      var _this;
      (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_3__["default"])(this, CSSMotionList);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_5__["default"])(_this), "state", {
        keyEntities: []
      });
      // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
      (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_5__["default"])(_this), "removeKey", function (removeKey) {
        var keyEntities = _this.state.keyEntities;
        var nextKeyEntities = keyEntities.map(function (entity) {
          if (entity.key !== removeKey) return entity;
          return (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_2__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_2__["default"])({}, entity), {}, {
            status: _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_REMOVED
          });
        });
        _this.setState({
          keyEntities: nextKeyEntities
        });
        return nextKeyEntities.filter(function (_ref) {
          var status = _ref.status;
          return status !== _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_REMOVED;
        }).length;
      });
      return _this;
    }
    (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_4__["default"])(CSSMotionList, [{
      key: "render",
      value: function render() {
        var _this2 = this;
        var keyEntities = this.state.keyEntities;
        var _this$props = this.props,
          component = _this$props.component,
          children = _this$props.children,
          _onVisibleChanged = _this$props.onVisibleChanged,
          onAllRemoved = _this$props.onAllRemoved,
          restProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__["default"])(_this$props, _excluded);
        var Component = component || react__WEBPACK_IMPORTED_MODULE_9__.Fragment;
        var motionProps = {};
        MOTION_PROP_NAMES.forEach(function (prop) {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_9__.createElement(Component, restProps, keyEntities.map(function (_ref2, index) {
          var status = _ref2.status,
            eventProps = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref2, _excluded2);
          var visible = status === _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_ADD || status === _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_KEEP;
          return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_9__.createElement(CSSMotion, (0,_babel_runtime_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({}, motionProps, {
            key: eventProps.key,
            visible: visible,
            eventProps: eventProps,
            onVisibleChanged: function onVisibleChanged(changedVisible) {
              _onVisibleChanged === null || _onVisibleChanged === void 0 ? void 0 : _onVisibleChanged(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                var restKeysCount = _this2.removeKey(eventProps.key);
                if (restKeysCount === 0 && onAllRemoved) {
                  onAllRemoved();
                }
              }
            }
          }), function (props, ref) {
            return children((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_2__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_2__["default"])({}, props), {}, {
              index: index
            }), ref);
          });
        }));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref3, _ref4) {
        var keys = _ref3.keys;
        var keyEntities = _ref4.keyEntities;
        var parsedKeyObjects = (0,_util_diff__WEBPACK_IMPORTED_MODULE_11__.parseKeys)(keys);
        var mixedKeyEntities = (0,_util_diff__WEBPACK_IMPORTED_MODULE_11__.diffKeys)(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter(function (entity) {
            var prevEntity = keyEntities.find(function (_ref5) {
              var key = _ref5.key;
              return entity.key === key;
            });

            // Remove if already mark as removed
            if (prevEntity && prevEntity.status === _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_REMOVED && entity.status === _util_diff__WEBPACK_IMPORTED_MODULE_11__.STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
    }]);
    return CSSMotionList;
  }(react__WEBPACK_IMPORTED_MODULE_9__.Component);
  (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(CSSMotionList, "defaultProps", {
    component: 'div'
  });
  return CSSMotionList;
}
/* harmony default export */ __webpack_exports__["default"] = (genCSSMotionList(_util_motion__WEBPACK_IMPORTED_MODULE_12__.supportTransition));

/***/ }),

/***/ "../node_modules/rc-motion/es/DomWrapper.js":
/*!**************************************************!*\
  !*** ../node_modules/rc-motion/es/DomWrapper.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "../node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "../node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createSuper */ "../node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);





var DomWrapper = /*#__PURE__*/function (_React$Component) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(DomWrapper, _React$Component);
  var _super = (0,_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__["default"])(DomWrapper);
  function DomWrapper() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, DomWrapper);
    return _super.apply(this, arguments);
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(DomWrapper, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper;
}(react__WEBPACK_IMPORTED_MODULE_4__.Component);
/* harmony default export */ __webpack_exports__["default"] = (DomWrapper);

/***/ }),

/***/ "../node_modules/rc-motion/es/context.js":
/*!***********************************************!*\
  !*** ../node_modules/rc-motion/es/context.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Context: function() { return /* binding */ Context; },
/* harmony export */   "default": function() { return /* binding */ MotionProvider; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectWithoutProperties */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);

var _excluded = ["children"];

var Context = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createContext({});
function MotionProvider(_ref) {
  var children = _ref.children,
    props = (0,_babel_runtime_helpers_esm_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, _excluded);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1__.createElement(Context.Provider, {
    value: props
  }, children);
}

/***/ }),

/***/ "../node_modules/rc-motion/es/hooks/useDomMotionEvents.js":
/*!****************************************************************!*\
  !*** ../node_modules/rc-motion/es/hooks/useDomMotionEvents.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util_motion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/motion */ "../node_modules/rc-motion/es/util/motion.js");



/* harmony default export */ __webpack_exports__["default"] = (function (callback) {
  var cacheElementRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();

  // Cache callback
  var callbackRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(callback);
  callbackRef.current = callback;

  // Internal motion event handler
  var onInternalMotionEnd = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function (event) {
    callbackRef.current(event);
  }, []);

  // Remove events
  function removeMotionEvents(element) {
    if (element) {
      element.removeEventListener(_util_motion__WEBPACK_IMPORTED_MODULE_1__.transitionEndName, onInternalMotionEnd);
      element.removeEventListener(_util_motion__WEBPACK_IMPORTED_MODULE_1__.animationEndName, onInternalMotionEnd);
    }
  }

  // Patch events
  function patchMotionEvents(element) {
    if (cacheElementRef.current && cacheElementRef.current !== element) {
      removeMotionEvents(cacheElementRef.current);
    }
    if (element && element !== cacheElementRef.current) {
      element.addEventListener(_util_motion__WEBPACK_IMPORTED_MODULE_1__.transitionEndName, onInternalMotionEnd);
      element.addEventListener(_util_motion__WEBPACK_IMPORTED_MODULE_1__.animationEndName, onInternalMotionEnd);

      // Save as cache in case dom removed trigger by `motionDeadline`
      cacheElementRef.current = element;
    }
  }

  // Clean up when removed
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(function () {
    return function () {
      removeMotionEvents(cacheElementRef.current);
    };
  }, []);
  return [patchMotionEvents, removeMotionEvents];
});

/***/ }),

/***/ "../node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js":
/*!***********************************************************************!*\
  !*** ../node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);



// It's safe to use `useLayoutEffect` but the warning is annoying
var useIsomorphicLayoutEffect = (0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_0__["default"])() ? react__WEBPACK_IMPORTED_MODULE_1__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_1__.useEffect;
/* harmony default export */ __webpack_exports__["default"] = (useIsomorphicLayoutEffect);

/***/ }),

/***/ "../node_modules/rc-motion/es/hooks/useNextFrame.js":
/*!**********************************************************!*\
  !*** ../node_modules/rc-motion/es/hooks/useNextFrame.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rc-util/es/raf */ "../node_modules/rc-util/es/raf.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


/* harmony default export */ __webpack_exports__["default"] = (function () {
  var nextFrameRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef(null);
  function cancelNextFrame() {
    rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__["default"].cancel(nextFrameRef.current);
  }
  function nextFrame(callback) {
    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    cancelNextFrame();
    var nextFrameId = (0,rc_util_es_raf__WEBPACK_IMPORTED_MODULE_0__["default"])(function () {
      if (delay <= 1) {
        callback({
          isCanceled: function isCanceled() {
            return nextFrameId !== nextFrameRef.current;
          }
        });
      } else {
        nextFrame(callback, delay - 1);
      }
    });
    nextFrameRef.current = nextFrameId;
  }
  react__WEBPACK_IMPORTED_MODULE_1__.useEffect(function () {
    return function () {
      cancelNextFrame();
    };
  }, []);
  return [nextFrame, cancelNextFrame];
});

/***/ }),

/***/ "../node_modules/rc-motion/es/hooks/useStatus.js":
/*!*******************************************************!*\
  !*** ../node_modules/rc-motion/es/hooks/useStatus.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useStatus; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rc-util/es/hooks/useState */ "../node_modules/rc-util/es/hooks/useState.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../interface */ "../node_modules/rc-motion/es/interface.js");
/* harmony import */ var _useDomMotionEvents__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./useDomMotionEvents */ "../node_modules/rc-motion/es/hooks/useDomMotionEvents.js");
/* harmony import */ var _useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./useIsomorphicLayoutEffect */ "../node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js");
/* harmony import */ var _useStepQueue__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./useStepQueue */ "../node_modules/rc-motion/es/hooks/useStepQueue.js");










function useStatus(supportMotion, visible, getElement, _ref) {
  var _ref$motionEnter = _ref.motionEnter,
    motionEnter = _ref$motionEnter === void 0 ? true : _ref$motionEnter,
    _ref$motionAppear = _ref.motionAppear,
    motionAppear = _ref$motionAppear === void 0 ? true : _ref$motionAppear,
    _ref$motionLeave = _ref.motionLeave,
    motionLeave = _ref$motionLeave === void 0 ? true : _ref$motionLeave,
    motionDeadline = _ref.motionDeadline,
    motionLeaveImmediately = _ref.motionLeaveImmediately,
    onAppearPrepare = _ref.onAppearPrepare,
    onEnterPrepare = _ref.onEnterPrepare,
    onLeavePrepare = _ref.onLeavePrepare,
    onAppearStart = _ref.onAppearStart,
    onEnterStart = _ref.onEnterStart,
    onLeaveStart = _ref.onLeaveStart,
    onAppearActive = _ref.onAppearActive,
    onEnterActive = _ref.onEnterActive,
    onLeaveActive = _ref.onLeaveActive,
    onAppearEnd = _ref.onAppearEnd,
    onEnterEnd = _ref.onEnterEnd,
    onLeaveEnd = _ref.onLeaveEnd,
    onVisibleChanged = _ref.onVisibleChanged;
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  var _useState = (0,rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_3__["default"])(),
    _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState, 2),
    asyncVisible = _useState2[0],
    setAsyncVisible = _useState2[1];
  var _useState3 = (0,rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_3__["default"])(_interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE),
    _useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState3, 2),
    status = _useState4[0],
    setStatus = _useState4[1];
  var _useState5 = (0,rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_3__["default"])(null),
    _useState6 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useState5, 2),
    style = _useState6[0],
    setStyle = _useState6[1];
  var mountedRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(false);
  var deadlineRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(null);

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement();
  }

  // ========================== Motion End ==========================
  var activeRef = (0,react__WEBPACK_IMPORTED_MODULE_4__.useRef)(false);

  /**
   * Clean up status & style
   */
  function updateMotionEndStatus() {
    setStatus(_interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE, true);
    setStyle(null, true);
  }
  function onInternalMotionEnd(event) {
    var element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return;
    }
    var currentActive = activeRef.current;
    var canEnd;
    if (status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd === null || onAppearEnd === void 0 ? void 0 : onAppearEnd(element, event);
    } else if (status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd === null || onEnterEnd === void 0 ? void 0 : onEnterEnd(element, event);
    } else if (status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd === null || onLeaveEnd === void 0 ? void 0 : onLeaveEnd(element, event);
    }

    // Only update status when `canEnd` and not destroyed
    if (status !== _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE && currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  }
  var _useDomMotionEvents = (0,_useDomMotionEvents__WEBPACK_IMPORTED_MODULE_6__["default"])(onInternalMotionEnd),
    _useDomMotionEvents2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useDomMotionEvents, 1),
    patchMotionEvents = _useDomMotionEvents2[0];

  // ============================= Step =============================
  var getEventHandlers = function getEventHandlers(targetStatus) {
    var _ref2, _ref3, _ref4;
    switch (targetStatus) {
      case _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_APPEAR:
        return _ref2 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref2, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE, onAppearPrepare), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref2, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_START, onAppearStart), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref2, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_ACTIVE, onAppearActive), _ref2;
      case _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_ENTER:
        return _ref3 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE, onEnterPrepare), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_START, onEnterStart), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_ACTIVE, onEnterActive), _ref3;
      case _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_LEAVE:
        return _ref4 = {}, (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref4, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE, onLeavePrepare), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref4, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_START, onLeaveStart), (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref4, _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_ACTIVE, onLeaveActive), _ref4;
      default:
        return {};
    }
  };
  var eventHandlers = react__WEBPACK_IMPORTED_MODULE_4__.useMemo(function () {
    return getEventHandlers(status);
  }, [status]);
  var _useStepQueue = (0,_useStepQueue__WEBPACK_IMPORTED_MODULE_8__["default"])(status, !supportMotion, function (newStep) {
      // Only prepare step can be skip
      if (newStep === _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE) {
        var onPrepare = eventHandlers[_interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE];
        if (!onPrepare) {
          return _useStepQueue__WEBPACK_IMPORTED_MODULE_8__.SkipStep;
        }
        return onPrepare(getDomElement());
      }

      // Rest step is sync update
      if (step in eventHandlers) {
        var _eventHandlers$step;
        setStyle(((_eventHandlers$step = eventHandlers[step]) === null || _eventHandlers$step === void 0 ? void 0 : _eventHandlers$step.call(eventHandlers, getDomElement(), null)) || null);
      }
      if (step === _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_ACTIVE) {
        // Patch events when motion needed
        patchMotionEvents(getDomElement());
        if (motionDeadline > 0) {
          clearTimeout(deadlineRef.current);
          deadlineRef.current = setTimeout(function () {
            onInternalMotionEnd({
              deadline: true
            });
          }, motionDeadline);
        }
      }
      if (step === _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARED) {
        updateMotionEndStatus();
      }
      return _useStepQueue__WEBPACK_IMPORTED_MODULE_8__.DoStep;
    }),
    _useStepQueue2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(_useStepQueue, 2),
    startStep = _useStepQueue2[0],
    step = _useStepQueue2[1];
  var active = (0,_useStepQueue__WEBPACK_IMPORTED_MODULE_8__.isActive)(step);
  activeRef.current = active;

  // ============================ Status ============================
  // Update with new status
  (0,_useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_7__["default"])(function () {
    setAsyncVisible(visible);
    var isMounted = mountedRef.current;
    mountedRef.current = true;

    // if (!supportMotion) {
    //   return;
    // }

    var nextStatus;

    // Appear
    if (!isMounted && visible && motionAppear) {
      nextStatus = _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_APPEAR;
    }

    // Enter
    if (isMounted && visible && motionEnter) {
      nextStatus = _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_ENTER;
    }

    // Leave
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_LEAVE;
    }
    var nextEventHandlers = getEventHandlers(nextStatus);

    // Update to next status
    if (nextStatus && (supportMotion || nextEventHandlers[_interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE])) {
      setStatus(nextStatus);
      startStep();
    } else {
      // Set back in case no motion but prev status has prepare step
      setStatus(_interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE);
    }
  }, [visible]);

  // ============================ Effect ============================
  // Reset when motion changed
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    if (
    // Cancel appear
    status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_APPEAR && !motionAppear ||
    // Cancel enter
    status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_ENTER && !motionEnter ||
    // Cancel leave
    status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_LEAVE && !motionLeave) {
      setStatus(_interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    return function () {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    };
  }, []);

  // Trigger `onVisibleChanged`
  var firstMountChangeRef = react__WEBPACK_IMPORTED_MODULE_4__.useRef(false);
  (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(function () {
    // [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== undefined && status === _interface__WEBPACK_IMPORTED_MODULE_5__.STATUS_NONE) {
      // Skip first render is invisible since it's nothing changed
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged === null || onVisibleChanged === void 0 ? void 0 : onVisibleChanged(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, status]);

  // ============================ Styles ============================
  var mergedStyle = style;
  if (eventHandlers[_interface__WEBPACK_IMPORTED_MODULE_5__.STEP_PREPARE] && step === _interface__WEBPACK_IMPORTED_MODULE_5__.STEP_START) {
    mergedStyle = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({
      transition: 'none'
    }, mergedStyle);
  }
  return [status, step, mergedStyle, asyncVisible !== null && asyncVisible !== void 0 ? asyncVisible : visible];
}

/***/ }),

/***/ "../node_modules/rc-motion/es/hooks/useStepQueue.js":
/*!**********************************************************!*\
  !*** ../node_modules/rc-motion/es/hooks/useStepQueue.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DoStep: function() { return /* binding */ DoStep; },
/* harmony export */   SkipStep: function() { return /* binding */ SkipStep; },
/* harmony export */   isActive: function() { return /* binding */ isActive; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/hooks/useState */ "../node_modules/rc-util/es/hooks/useState.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _interface__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../interface */ "../node_modules/rc-motion/es/interface.js");
/* harmony import */ var _useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./useIsomorphicLayoutEffect */ "../node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js");
/* harmony import */ var _useNextFrame__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./useNextFrame */ "../node_modules/rc-motion/es/hooks/useNextFrame.js");






var FULL_STEP_QUEUE = [_interface__WEBPACK_IMPORTED_MODULE_3__.STEP_PREPARE, _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_START, _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_ACTIVE, _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_ACTIVATED];
var SIMPLE_STEP_QUEUE = [_interface__WEBPACK_IMPORTED_MODULE_3__.STEP_PREPARE, _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_PREPARED];

/** Skip current step */
var SkipStep = false;
/** Current step should be update in */
var DoStep = true;
function isActive(step) {
  return step === _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_ACTIVE || step === _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_ACTIVATED;
}
/* harmony default export */ __webpack_exports__["default"] = (function (status, prepareOnly, callback) {
  var _useState = (0,rc_util_es_hooks_useState__WEBPACK_IMPORTED_MODULE_1__["default"])(_interface__WEBPACK_IMPORTED_MODULE_3__.STEP_NONE),
    _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useState, 2),
    step = _useState2[0],
    setStep = _useState2[1];
  var _useNextFrame = (0,_useNextFrame__WEBPACK_IMPORTED_MODULE_5__["default"])(),
    _useNextFrame2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useNextFrame, 2),
    nextFrame = _useNextFrame2[0],
    cancelNextFrame = _useNextFrame2[1];
  function startQueue() {
    setStep(_interface__WEBPACK_IMPORTED_MODULE_3__.STEP_PREPARE, true);
  }
  var STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
  (0,_useIsomorphicLayoutEffect__WEBPACK_IMPORTED_MODULE_4__["default"])(function () {
    if (step !== _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_NONE && step !== _interface__WEBPACK_IMPORTED_MODULE_3__.STEP_ACTIVATED) {
      var index = STEP_QUEUE.indexOf(step);
      var nextStep = STEP_QUEUE[index + 1];
      var result = callback(step);
      if (result === SkipStep) {
        // Skip when no needed
        setStep(nextStep, true);
      } else if (nextStep) {
        // Do as frame for step update
        nextFrame(function (info) {
          function doNext() {
            // Skip since current queue is ood
            if (info.isCanceled()) return;
            setStep(nextStep, true);
          }
          if (result === true) {
            doNext();
          } else {
            // Only promise should be async
            Promise.resolve(result).then(doNext);
          }
        });
      }
    }
  }, [status, step]);
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(function () {
    return function () {
      cancelNextFrame();
    };
  }, []);
  return [startQueue, step];
});

/***/ }),

/***/ "../node_modules/rc-motion/es/index.js":
/*!*********************************************!*\
  !*** ../node_modules/rc-motion/es/index.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSSMotionList: function() { return /* reexport safe */ _CSSMotionList__WEBPACK_IMPORTED_MODULE_1__["default"]; },
/* harmony export */   Provider: function() { return /* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_2__["default"]; }
/* harmony export */ });
/* harmony import */ var _CSSMotion__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CSSMotion */ "../node_modules/rc-motion/es/CSSMotion.js");
/* harmony import */ var _CSSMotionList__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CSSMotionList */ "../node_modules/rc-motion/es/CSSMotionList.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./context */ "../node_modules/rc-motion/es/context.js");




/* harmony default export */ __webpack_exports__["default"] = (_CSSMotion__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "../node_modules/rc-motion/es/interface.js":
/*!*************************************************!*\
  !*** ../node_modules/rc-motion/es/interface.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STATUS_APPEAR: function() { return /* binding */ STATUS_APPEAR; },
/* harmony export */   STATUS_ENTER: function() { return /* binding */ STATUS_ENTER; },
/* harmony export */   STATUS_LEAVE: function() { return /* binding */ STATUS_LEAVE; },
/* harmony export */   STATUS_NONE: function() { return /* binding */ STATUS_NONE; },
/* harmony export */   STEP_ACTIVATED: function() { return /* binding */ STEP_ACTIVATED; },
/* harmony export */   STEP_ACTIVE: function() { return /* binding */ STEP_ACTIVE; },
/* harmony export */   STEP_NONE: function() { return /* binding */ STEP_NONE; },
/* harmony export */   STEP_PREPARE: function() { return /* binding */ STEP_PREPARE; },
/* harmony export */   STEP_PREPARED: function() { return /* binding */ STEP_PREPARED; },
/* harmony export */   STEP_START: function() { return /* binding */ STEP_START; }
/* harmony export */ });
var STATUS_NONE = 'none';
var STATUS_APPEAR = 'appear';
var STATUS_ENTER = 'enter';
var STATUS_LEAVE = 'leave';
var STEP_NONE = 'none';
var STEP_PREPARE = 'prepare';
var STEP_START = 'start';
var STEP_ACTIVE = 'active';
var STEP_ACTIVATED = 'end';
/**
 * Used for disabled motion case.
 * Prepare stage will still work but start & active will be skipped.
 */
var STEP_PREPARED = 'prepared';

/***/ }),

/***/ "../node_modules/rc-motion/es/util/diff.js":
/*!*************************************************!*\
  !*** ../node_modules/rc-motion/es/util/diff.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   STATUS_ADD: function() { return /* binding */ STATUS_ADD; },
/* harmony export */   STATUS_KEEP: function() { return /* binding */ STATUS_KEEP; },
/* harmony export */   STATUS_REMOVE: function() { return /* binding */ STATUS_REMOVE; },
/* harmony export */   STATUS_REMOVED: function() { return /* binding */ STATUS_REMOVED; },
/* harmony export */   diffKeys: function() { return /* binding */ diffKeys; },
/* harmony export */   parseKeys: function() { return /* binding */ parseKeys; },
/* harmony export */   wrapKeyToObject: function() { return /* binding */ wrapKeyToObject; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");


var STATUS_ADD = 'add';
var STATUS_KEEP = 'keep';
var STATUS_REMOVE = 'remove';
var STATUS_REMOVED = 'removed';
function wrapKeyToObject(key) {
  var keyObj;
  if (key && (0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(key) === 'object' && 'key' in key) {
    keyObj = key;
  } else {
    keyObj = {
      key: key
    };
  }
  return (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, keyObj), {}, {
    key: String(keyObj.key)
  });
}
function parseKeys() {
  var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return keys.map(wrapKeyToObject);
}
function diffKeys() {
  var prevKeys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var currentKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var list = [];
  var currentIndex = 0;
  var currentLen = currentKeys.length;
  var prevKeyObjects = parseKeys(prevKeys);
  var currentKeyObjects = parseKeys(currentKeys);

  // Check prev keys to insert or keep
  prevKeyObjects.forEach(function (keyObj) {
    var hit = false;
    for (var i = currentIndex; i < currentLen; i += 1) {
      var currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        // New added keys should add before current key
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(function (obj) {
            return (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, obj), {}, {
              status: STATUS_ADD
            });
          }));
          currentIndex = i;
        }
        list.push((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, currentKeyObj), {}, {
          status: STATUS_KEEP
        }));
        currentIndex += 1;
        hit = true;
        break;
      }
    }

    // If not hit, it means key is removed
    if (!hit) {
      list.push((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, keyObj), {}, {
        status: STATUS_REMOVE
      }));
    }
  });

  // Add rest to the list
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(function (obj) {
      return (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, obj), {}, {
        status: STATUS_ADD
      });
    }));
  }

  /**
   * Merge same key when it remove and add again:
   *    [1 - add, 2 - keep, 1 - remove] -> [1 - keep, 2 - keep]
   */
  var keys = {};
  list.forEach(function (_ref) {
    var key = _ref.key;
    keys[key] = (keys[key] || 0) + 1;
  });
  var duplicatedKeys = Object.keys(keys).filter(function (key) {
    return keys[key] > 1;
  });
  duplicatedKeys.forEach(function (matchKey) {
    // Remove `STATUS_REMOVE` node.
    list = list.filter(function (_ref2) {
      var key = _ref2.key,
        status = _ref2.status;
      return key !== matchKey || status !== STATUS_REMOVE;
    });

    // Update `STATUS_ADD` to `STATUS_KEEP`
    list.forEach(function (node) {
      if (node.key === matchKey) {
        // eslint-disable-next-line no-param-reassign
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}

/***/ }),

/***/ "../node_modules/rc-motion/es/util/motion.js":
/*!***************************************************!*\
  !*** ../node_modules/rc-motion/es/util/motion.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   animationEndName: function() { return /* binding */ animationEndName; },
/* harmony export */   getTransitionName: function() { return /* binding */ getTransitionName; },
/* harmony export */   getVendorPrefixedEventName: function() { return /* binding */ getVendorPrefixedEventName; },
/* harmony export */   getVendorPrefixes: function() { return /* binding */ getVendorPrefixes; },
/* harmony export */   supportTransition: function() { return /* binding */ supportTransition; },
/* harmony export */   transitionEndName: function() { return /* binding */ transitionEndName; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rc-util/es/Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");


// ================= Transition =================
// Event wrapper. Copy from react source code
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit".concat(styleProp)] = "webkit".concat(eventName);
  prefixes["Moz".concat(styleProp)] = "moz".concat(eventName);
  prefixes["ms".concat(styleProp)] = "MS".concat(eventName);
  prefixes["O".concat(styleProp)] = "o".concat(eventName.toLowerCase());
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  var prefixes = {
    animationend: makePrefixMap('Animation', 'AnimationEnd'),
    transitionend: makePrefixMap('Transition', 'TransitionEnd')
  };
  if (domSupport) {
    if (!('AnimationEvent' in win)) {
      delete prefixes.animationend.animation;
    }
    if (!('TransitionEvent' in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
var vendorPrefixes = getVendorPrefixes((0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__["default"])(), typeof window !== 'undefined' ? window : {});
var style = {};
if ((0,rc_util_es_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
  var _document$createEleme = document.createElement('div');
  style = _document$createEleme.style;
}
var prefixedEventNames = {};
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  var prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    var stylePropList = Object.keys(prefixMap);
    var len = stylePropList.length;
    for (var i = 0; i < len; i += 1) {
      var styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return '';
}
var internalAnimationEndName = getVendorPrefixedEventName('animationend');
var internalTransitionEndName = getVendorPrefixedEventName('transitionend');
var supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
var animationEndName = internalAnimationEndName || 'animationend';
var transitionEndName = internalTransitionEndName || 'transitionend';
function getTransitionName(transitionName, transitionType) {
  if (!transitionName) return null;
  if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(transitionName) === 'object') {
    var type = transitionType.replace(/-\w/g, function (match) {
      return match[1].toUpperCase();
    });
    return transitionName[type];
  }
  return "".concat(transitionName, "-").concat(transitionType);
}

/***/ }),

/***/ "../node_modules/rc-pagination/es/locale/en_US.js":
/*!********************************************************!*\
  !*** ../node_modules/rc-pagination/es/locale/en_US.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  // Options.jsx
  items_per_page: '/ page',
  jump_to: 'Go to',
  jump_to_confirm: 'confirm',
  page: 'Page',
  // Pagination.jsx
  prev_page: 'Previous Page',
  next_page: 'Next Page',
  prev_5: 'Previous 5 Pages',
  next_5: 'Next 5 Pages',
  prev_3: 'Previous 3 Pages',
  next_3: 'Next 3 Pages',
  page_size: 'Page Size'
});

/***/ }),

/***/ "../node_modules/rc-picker/es/locale/en_US.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-picker/es/locale/en_US.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var locale = {
  locale: 'en_US',
  today: 'Today',
  now: 'Now',
  backToToday: 'Back to today',
  ok: 'OK',
  clear: 'Clear',
  month: 'Month',
  year: 'Year',
  timeSelect: 'select time',
  dateSelect: 'select date',
  weekSelect: 'Choose a week',
  monthSelect: 'Choose a month',
  yearSelect: 'Choose a year',
  decadeSelect: 'Choose a decade',
  yearFormat: 'YYYY',
  dateFormat: 'M/D/YYYY',
  dayFormat: 'D',
  dateTimeFormat: 'M/D/YYYY HH:mm:ss',
  monthBeforeYear: true,
  previousMonth: 'Previous month (PageUp)',
  nextMonth: 'Next month (PageDown)',
  previousYear: 'Last year (Control + left)',
  nextYear: 'Next year (Control + right)',
  previousDecade: 'Last decade',
  nextDecade: 'Next decade',
  previousCentury: 'Last century',
  nextCentury: 'Next century'
};
/* harmony default export */ __webpack_exports__["default"] = (locale);

/***/ }),

/***/ "../node_modules/rc-util/es/Children/toArray.js":
/*!******************************************************!*\
  !*** ../node_modules/rc-util/es/Children/toArray.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ toArray; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-is */ "../node_modules/rc-util/node_modules/react-is/index.js");


function toArray(children) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var ret = [];
  react__WEBPACK_IMPORTED_MODULE_0___default().Children.forEach(children, function (child) {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if ((0,react_is__WEBPACK_IMPORTED_MODULE_1__.isFragment)(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/addEventListener.js":
/*!**********************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/addEventListener.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ addEventListenerWrap; }
/* harmony export */ });
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_0__);

function addEventListenerWrap(target, eventType, cb, option) {
  /* eslint camelcase: 2 */
  var callback = (react_dom__WEBPACK_IMPORTED_MODULE_0___default().unstable_batchedUpdates) ? function run(e) {
    react_dom__WEBPACK_IMPORTED_MODULE_0___default().unstable_batchedUpdates(cb, e);
  } : cb;
  if (target !== null && target !== void 0 && target.addEventListener) {
    target.addEventListener(eventType, callback, option);
  }
  return {
    remove: function remove() {
      if (target !== null && target !== void 0 && target.removeEventListener) {
        target.removeEventListener(eventType, callback, option);
      }
    }
  };
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/canUseDom.js":
/*!***************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/canUseDom.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ canUseDom; }
/* harmony export */ });
function canUseDom() {
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/contains.js":
/*!**************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/contains.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ contains; }
/* harmony export */ });
function contains(root, n) {
  if (!root) {
    return false;
  }

  // Use native if support
  if (root.contains) {
    return root.contains(n);
  }

  // `document.contains` not support with IE11
  var node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/css.js":
/*!*********************************************!*\
  !*** ../node_modules/rc-util/es/Dom/css.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get: function() { return /* binding */ get; },
/* harmony export */   getClientSize: function() { return /* binding */ getClientSize; },
/* harmony export */   getDocSize: function() { return /* binding */ getDocSize; },
/* harmony export */   getOffset: function() { return /* binding */ getOffset; },
/* harmony export */   getOuterHeight: function() { return /* binding */ getOuterHeight; },
/* harmony export */   getOuterWidth: function() { return /* binding */ getOuterWidth; },
/* harmony export */   getScroll: function() { return /* binding */ getScroll; },
/* harmony export */   set: function() { return /* binding */ set; }
/* harmony export */ });
/* eslint-disable no-nested-ternary */
var PIXEL_PATTERN = /margin|padding|width|height|max|min|offset/;
var removePixel = {
  left: true,
  top: true
};
var floatMap = {
  cssFloat: 1,
  styleFloat: 1,
  float: 1
};
function getComputedStyle(node) {
  return node.nodeType === 1 ? node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
}
function getStyleValue(node, type, value) {
  type = type.toLowerCase();
  if (value === 'auto') {
    if (type === 'height') {
      return node.offsetHeight;
    }
    if (type === 'width') {
      return node.offsetWidth;
    }
  }
  if (!(type in removePixel)) {
    removePixel[type] = PIXEL_PATTERN.test(type);
  }
  return removePixel[type] ? parseFloat(value) || 0 : value;
}
function get(node, name) {
  var length = arguments.length;
  var style = getComputedStyle(node);
  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;
  return length === 1 ? style : getStyleValue(node, name, style[name] || node.style[name]);
}
function set(node, name, value) {
  var length = arguments.length;
  name = floatMap[name] ? 'cssFloat' in node.style ? 'cssFloat' : 'styleFloat' : name;
  if (length === 3) {
    if (typeof value === 'number' && PIXEL_PATTERN.test(name)) {
      value = "".concat(value, "px");
    }
    node.style[name] = value; // Number
    return value;
  }
  for (var x in name) {
    if (name.hasOwnProperty(x)) {
      set(node, x, name[x]);
    }
  }
  return getComputedStyle(node);
}
function getOuterWidth(el) {
  if (el === document.body) {
    return document.documentElement.clientWidth;
  }
  return el.offsetWidth;
}
function getOuterHeight(el) {
  if (el === document.body) {
    return window.innerHeight || document.documentElement.clientHeight;
  }
  return el.offsetHeight;
}
function getDocSize() {
  var width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  var height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  return {
    width: width,
    height: height
  };
}
function getClientSize() {
  var width = document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;
  return {
    width: width,
    height: height
  };
}
function getScroll() {
  return {
    scrollLeft: Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
    scrollTop: Math.max(document.documentElement.scrollTop, document.body.scrollTop)
  };
}
function getOffset(node) {
  var box = node.getBoundingClientRect();
  var docElem = document.documentElement;

  // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
  return {
    left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
    top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0)
  };
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/dynamicCSS.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/dynamicCSS.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearContainerCache: function() { return /* binding */ clearContainerCache; },
/* harmony export */   injectCSS: function() { return /* binding */ injectCSS; },
/* harmony export */   removeCSS: function() { return /* binding */ removeCSS; },
/* harmony export */   updateCSS: function() { return /* binding */ updateCSS; }
/* harmony export */ });
/* harmony import */ var _canUseDom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");
/* harmony import */ var _contains__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contains */ "../node_modules/rc-util/es/Dom/contains.js");


var APPEND_ORDER = 'data-rc-order';
var APPEND_PRIORITY = 'data-rc-priority';
var MARK_KEY = "rc-util-key";
var containerCache = new Map();
function getMark() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    mark = _ref.mark;
  if (mark) {
    return mark.startsWith('data-') ? mark : "data-".concat(mark);
  }
  return MARK_KEY;
}
function getContainer(option) {
  if (option.attachTo) {
    return option.attachTo;
  }
  var head = document.querySelector('head');
  return head || document.body;
}
function getOrder(prepend) {
  if (prepend === 'queue') {
    return 'prependQueue';
  }
  return prepend ? 'prepend' : 'append';
}

/**
 * Find style which inject by rc-util
 */
function findStyles(container) {
  return Array.from((containerCache.get(container) || container).children).filter(function (node) {
    return node.tagName === 'STYLE';
  });
}
function injectCSS(css) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!(0,_canUseDom__WEBPACK_IMPORTED_MODULE_0__["default"])()) {
    return null;
  }
  var csp = option.csp,
    prepend = option.prepend,
    _option$priority = option.priority,
    priority = _option$priority === void 0 ? 0 : _option$priority;
  var mergedOrder = getOrder(prepend);
  var isPrependQueue = mergedOrder === 'prependQueue';
  var styleNode = document.createElement('style');
  styleNode.setAttribute(APPEND_ORDER, mergedOrder);
  if (isPrependQueue && priority) {
    styleNode.setAttribute(APPEND_PRIORITY, "".concat(priority));
  }
  if (csp !== null && csp !== void 0 && csp.nonce) {
    styleNode.nonce = csp === null || csp === void 0 ? void 0 : csp.nonce;
  }
  styleNode.innerHTML = css;
  var container = getContainer(option);
  var firstChild = container.firstChild;
  if (prepend) {
    // If is queue `prepend`, it will prepend first style and then append rest style
    if (isPrependQueue) {
      var existStyle = findStyles(container).filter(function (node) {
        // Ignore style which not injected by rc-util with prepend
        if (!['prepend', 'prependQueue'].includes(node.getAttribute(APPEND_ORDER))) {
          return false;
        }

        // Ignore style which priority less then new style
        var nodePriority = Number(node.getAttribute(APPEND_PRIORITY) || 0);
        return priority >= nodePriority;
      });
      if (existStyle.length) {
        container.insertBefore(styleNode, existStyle[existStyle.length - 1].nextSibling);
        return styleNode;
      }
    }

    // Use `insertBefore` as `prepend`
    container.insertBefore(styleNode, firstChild);
  } else {
    container.appendChild(styleNode);
  }
  return styleNode;
}
function findExistNode(key) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var container = getContainer(option);
  return findStyles(container).find(function (node) {
    return node.getAttribute(getMark(option)) === key;
  });
}
function removeCSS(key) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var existNode = findExistNode(key, option);
  if (existNode) {
    var container = getContainer(option);
    container.removeChild(existNode);
  }
}

/**
 * qiankun will inject `appendChild` to insert into other
 */
function syncRealContainer(container, option) {
  var cachedRealContainer = containerCache.get(container);

  // Find real container when not cached or cached container removed
  if (!cachedRealContainer || !(0,_contains__WEBPACK_IMPORTED_MODULE_1__["default"])(document, cachedRealContainer)) {
    var placeholderStyle = injectCSS('', option);
    var parentNode = placeholderStyle.parentNode;
    containerCache.set(container, parentNode);
    container.removeChild(placeholderStyle);
  }
}

/**
 * manually clear container cache to avoid global cache in unit testes
 */
function clearContainerCache() {
  containerCache.clear();
}
function updateCSS(css, key) {
  var option = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var container = getContainer(option);

  // Sync real parent
  syncRealContainer(container, option);
  var existNode = findExistNode(key, option);
  if (existNode) {
    var _option$csp, _option$csp2;
    if ((_option$csp = option.csp) !== null && _option$csp !== void 0 && _option$csp.nonce && existNode.nonce !== ((_option$csp2 = option.csp) === null || _option$csp2 === void 0 ? void 0 : _option$csp2.nonce)) {
      var _option$csp3;
      existNode.nonce = (_option$csp3 = option.csp) === null || _option$csp3 === void 0 ? void 0 : _option$csp3.nonce;
    }
    if (existNode.innerHTML !== css) {
      existNode.innerHTML = css;
    }
    return existNode;
  }
  var newNode = injectCSS(css, option);
  newNode.setAttribute(getMark(option), key);
  return newNode;
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/findDOMNode.js":
/*!*****************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/findDOMNode.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ findDOMNode; },
/* harmony export */   isDOM: function() { return /* binding */ isDOM; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);


function isDOM(node) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement;
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
function findDOMNode(node) {
  if (isDOM(node)) {
    return node;
  }
  if (node instanceof (react__WEBPACK_IMPORTED_MODULE_0___default().Component)) {
    return react_dom__WEBPACK_IMPORTED_MODULE_1___default().findDOMNode(node);
  }
  return null;
}

/***/ }),

/***/ "../node_modules/rc-util/es/Dom/styleChecker.js":
/*!******************************************************!*\
  !*** ../node_modules/rc-util/es/Dom/styleChecker.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isStyleSupport: function() { return /* binding */ isStyleSupport; }
/* harmony export */ });
/* harmony import */ var _canUseDom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");

var isStyleNameSupport = function isStyleNameSupport(styleName) {
  if ((0,_canUseDom__WEBPACK_IMPORTED_MODULE_0__["default"])() && window.document.documentElement) {
    var styleNameList = Array.isArray(styleName) ? styleName : [styleName];
    var documentElement = window.document.documentElement;
    return styleNameList.some(function (name) {
      return name in documentElement.style;
    });
  }
  return false;
};
var isStyleValueSupport = function isStyleValueSupport(styleName, value) {
  if (!isStyleNameSupport(styleName)) {
    return false;
  }
  var ele = document.createElement('div');
  var origin = ele.style[styleName];
  ele.style[styleName] = value;
  return ele.style[styleName] !== origin;
};
function isStyleSupport(styleName, styleValue) {
  if (!Array.isArray(styleName) && styleValue !== undefined) {
    return isStyleValueSupport(styleName, styleValue);
  }
  return isStyleNameSupport(styleName);
}

/***/ }),

/***/ "../node_modules/rc-util/es/KeyCode.js":
/*!*********************************************!*\
  !*** ../node_modules/rc-util/es/KeyCode.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @ignore
 * some key-codes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */

var KeyCode = {
  /**
   * MAC_ENTER
   */
  MAC_ENTER: 3,
  /**
   * BACKSPACE
   */
  BACKSPACE: 8,
  /**
   * TAB
   */
  TAB: 9,
  /**
   * NUMLOCK on FF/Safari Mac
   */
  NUM_CENTER: 12,
  // NUMLOCK on FF/Safari Mac
  /**
   * ENTER
   */
  ENTER: 13,
  /**
   * SHIFT
   */
  SHIFT: 16,
  /**
   * CTRL
   */
  CTRL: 17,
  /**
   * ALT
   */
  ALT: 18,
  /**
   * PAUSE
   */
  PAUSE: 19,
  /**
   * CAPS_LOCK
   */
  CAPS_LOCK: 20,
  /**
   * ESC
   */
  ESC: 27,
  /**
   * SPACE
   */
  SPACE: 32,
  /**
   * PAGE_UP
   */
  PAGE_UP: 33,
  // also NUM_NORTH_EAST
  /**
   * PAGE_DOWN
   */
  PAGE_DOWN: 34,
  // also NUM_SOUTH_EAST
  /**
   * END
   */
  END: 35,
  // also NUM_SOUTH_WEST
  /**
   * HOME
   */
  HOME: 36,
  // also NUM_NORTH_WEST
  /**
   * LEFT
   */
  LEFT: 37,
  // also NUM_WEST
  /**
   * UP
   */
  UP: 38,
  // also NUM_NORTH
  /**
   * RIGHT
   */
  RIGHT: 39,
  // also NUM_EAST
  /**
   * DOWN
   */
  DOWN: 40,
  // also NUM_SOUTH
  /**
   * PRINT_SCREEN
   */
  PRINT_SCREEN: 44,
  /**
   * INSERT
   */
  INSERT: 45,
  // also NUM_INSERT
  /**
   * DELETE
   */
  DELETE: 46,
  // also NUM_DELETE
  /**
   * ZERO
   */
  ZERO: 48,
  /**
   * ONE
   */
  ONE: 49,
  /**
   * TWO
   */
  TWO: 50,
  /**
   * THREE
   */
  THREE: 51,
  /**
   * FOUR
   */
  FOUR: 52,
  /**
   * FIVE
   */
  FIVE: 53,
  /**
   * SIX
   */
  SIX: 54,
  /**
   * SEVEN
   */
  SEVEN: 55,
  /**
   * EIGHT
   */
  EIGHT: 56,
  /**
   * NINE
   */
  NINE: 57,
  /**
   * QUESTION_MARK
   */
  QUESTION_MARK: 63,
  // needs localization
  /**
   * A
   */
  A: 65,
  /**
   * B
   */
  B: 66,
  /**
   * C
   */
  C: 67,
  /**
   * D
   */
  D: 68,
  /**
   * E
   */
  E: 69,
  /**
   * F
   */
  F: 70,
  /**
   * G
   */
  G: 71,
  /**
   * H
   */
  H: 72,
  /**
   * I
   */
  I: 73,
  /**
   * J
   */
  J: 74,
  /**
   * K
   */
  K: 75,
  /**
   * L
   */
  L: 76,
  /**
   * M
   */
  M: 77,
  /**
   * N
   */
  N: 78,
  /**
   * O
   */
  O: 79,
  /**
   * P
   */
  P: 80,
  /**
   * Q
   */
  Q: 81,
  /**
   * R
   */
  R: 82,
  /**
   * S
   */
  S: 83,
  /**
   * T
   */
  T: 84,
  /**
   * U
   */
  U: 85,
  /**
   * V
   */
  V: 86,
  /**
   * W
   */
  W: 87,
  /**
   * X
   */
  X: 88,
  /**
   * Y
   */
  Y: 89,
  /**
   * Z
   */
  Z: 90,
  /**
   * META
   */
  META: 91,
  // WIN_KEY_LEFT
  /**
   * WIN_KEY_RIGHT
   */
  WIN_KEY_RIGHT: 92,
  /**
   * CONTEXT_MENU
   */
  CONTEXT_MENU: 93,
  /**
   * NUM_ZERO
   */
  NUM_ZERO: 96,
  /**
   * NUM_ONE
   */
  NUM_ONE: 97,
  /**
   * NUM_TWO
   */
  NUM_TWO: 98,
  /**
   * NUM_THREE
   */
  NUM_THREE: 99,
  /**
   * NUM_FOUR
   */
  NUM_FOUR: 100,
  /**
   * NUM_FIVE
   */
  NUM_FIVE: 101,
  /**
   * NUM_SIX
   */
  NUM_SIX: 102,
  /**
   * NUM_SEVEN
   */
  NUM_SEVEN: 103,
  /**
   * NUM_EIGHT
   */
  NUM_EIGHT: 104,
  /**
   * NUM_NINE
   */
  NUM_NINE: 105,
  /**
   * NUM_MULTIPLY
   */
  NUM_MULTIPLY: 106,
  /**
   * NUM_PLUS
   */
  NUM_PLUS: 107,
  /**
   * NUM_MINUS
   */
  NUM_MINUS: 109,
  /**
   * NUM_PERIOD
   */
  NUM_PERIOD: 110,
  /**
   * NUM_DIVISION
   */
  NUM_DIVISION: 111,
  /**
   * F1
   */
  F1: 112,
  /**
   * F2
   */
  F2: 113,
  /**
   * F3
   */
  F3: 114,
  /**
   * F4
   */
  F4: 115,
  /**
   * F5
   */
  F5: 116,
  /**
   * F6
   */
  F6: 117,
  /**
   * F7
   */
  F7: 118,
  /**
   * F8
   */
  F8: 119,
  /**
   * F9
   */
  F9: 120,
  /**
   * F10
   */
  F10: 121,
  /**
   * F11
   */
  F11: 122,
  /**
   * F12
   */
  F12: 123,
  /**
   * NUMLOCK
   */
  NUMLOCK: 144,
  /**
   * SEMICOLON
   */
  SEMICOLON: 186,
  // needs localization
  /**
   * DASH
   */
  DASH: 189,
  // needs localization
  /**
   * EQUALS
   */
  EQUALS: 187,
  // needs localization
  /**
   * COMMA
   */
  COMMA: 188,
  // needs localization
  /**
   * PERIOD
   */
  PERIOD: 190,
  // needs localization
  /**
   * SLASH
   */
  SLASH: 191,
  // needs localization
  /**
   * APOSTROPHE
   */
  APOSTROPHE: 192,
  // needs localization
  /**
   * SINGLE_QUOTE
   */
  SINGLE_QUOTE: 222,
  // needs localization
  /**
   * OPEN_SQUARE_BRACKET
   */
  OPEN_SQUARE_BRACKET: 219,
  // needs localization
  /**
   * BACKSLASH
   */
  BACKSLASH: 220,
  // needs localization
  /**
   * CLOSE_SQUARE_BRACKET
   */
  CLOSE_SQUARE_BRACKET: 221,
  // needs localization
  /**
   * WIN_KEY
   */
  WIN_KEY: 224,
  /**
   * MAC_FF_META
   */
  MAC_FF_META: 224,
  // Firefox (Gecko) fires this for the meta key instead of 91
  /**
   * WIN_IME
   */
  WIN_IME: 229,
  // ======================== Function ========================
  /**
   * whether text and modified key is entered at the same time.
   */
  isTextModifyingKeyEvent: function isTextModifyingKeyEvent(e) {
    var keyCode = e.keyCode;
    if (e.altKey && !e.ctrlKey || e.metaKey ||
    // Function keys don't generate text
    keyCode >= KeyCode.F1 && keyCode <= KeyCode.F12) {
      return false;
    }

    // The following keys are quite harmless, even in combination with
    // CTRL, ALT or SHIFT.
    switch (keyCode) {
      case KeyCode.ALT:
      case KeyCode.CAPS_LOCK:
      case KeyCode.CONTEXT_MENU:
      case KeyCode.CTRL:
      case KeyCode.DOWN:
      case KeyCode.END:
      case KeyCode.ESC:
      case KeyCode.HOME:
      case KeyCode.INSERT:
      case KeyCode.LEFT:
      case KeyCode.MAC_FF_META:
      case KeyCode.META:
      case KeyCode.NUMLOCK:
      case KeyCode.NUM_CENTER:
      case KeyCode.PAGE_DOWN:
      case KeyCode.PAGE_UP:
      case KeyCode.PAUSE:
      case KeyCode.PRINT_SCREEN:
      case KeyCode.RIGHT:
      case KeyCode.SHIFT:
      case KeyCode.UP:
      case KeyCode.WIN_KEY:
      case KeyCode.WIN_KEY_RIGHT:
        return false;
      default:
        return true;
    }
  },
  /**
   * whether character is entered.
   */
  isCharacterKey: function isCharacterKey(keyCode) {
    if (keyCode >= KeyCode.ZERO && keyCode <= KeyCode.NINE) {
      return true;
    }
    if (keyCode >= KeyCode.NUM_ZERO && keyCode <= KeyCode.NUM_MULTIPLY) {
      return true;
    }
    if (keyCode >= KeyCode.A && keyCode <= KeyCode.Z) {
      return true;
    }

    // Safari sends zero key code for non-latin characters.
    if (window.navigator.userAgent.indexOf('WebKit') !== -1 && keyCode === 0) {
      return true;
    }
    switch (keyCode) {
      case KeyCode.SPACE:
      case KeyCode.QUESTION_MARK:
      case KeyCode.NUM_PLUS:
      case KeyCode.NUM_MINUS:
      case KeyCode.NUM_PERIOD:
      case KeyCode.NUM_DIVISION:
      case KeyCode.SEMICOLON:
      case KeyCode.DASH:
      case KeyCode.EQUALS:
      case KeyCode.COMMA:
      case KeyCode.PERIOD:
      case KeyCode.SLASH:
      case KeyCode.APOSTROPHE:
      case KeyCode.SINGLE_QUOTE:
      case KeyCode.OPEN_SQUARE_BRACKET:
      case KeyCode.BACKSLASH:
      case KeyCode.CLOSE_SQUARE_BRACKET:
        return true;
      default:
        return false;
    }
  }
};
/* harmony default export */ __webpack_exports__["default"] = (KeyCode);

/***/ }),

/***/ "../node_modules/rc-util/es/getScrollBarSize.js":
/*!******************************************************!*\
  !*** ../node_modules/rc-util/es/getScrollBarSize.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ getScrollBarSize; },
/* harmony export */   getTargetScrollBarSize: function() { return /* binding */ getTargetScrollBarSize; }
/* harmony export */ });
/* eslint-disable no-param-reassign */

var cached;
function getScrollBarSize(fresh) {
  if (typeof document === 'undefined') {
    return 0;
  }
  if (fresh || cached === undefined) {
    var inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '200px';
    var outer = document.createElement('div');
    var outerStyle = outer.style;
    outerStyle.position = 'absolute';
    outerStyle.top = '0';
    outerStyle.left = '0';
    outerStyle.pointerEvents = 'none';
    outerStyle.visibility = 'hidden';
    outerStyle.width = '200px';
    outerStyle.height = '150px';
    outerStyle.overflow = 'hidden';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var widthContained = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var widthScroll = inner.offsetWidth;
    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth;
    }
    document.body.removeChild(outer);
    cached = widthContained - widthScroll;
  }
  return cached;
}
function ensureSize(str) {
  var match = str.match(/^(.*)px$/);
  var value = Number(match === null || match === void 0 ? void 0 : match[1]);
  return Number.isNaN(value) ? getScrollBarSize() : value;
}
function getTargetScrollBarSize(target) {
  if (typeof document === 'undefined' || !target || !(target instanceof Element)) {
    return {
      width: 0,
      height: 0
    };
  }
  var _getComputedStyle = getComputedStyle(target, '::-webkit-scrollbar'),
    width = _getComputedStyle.width,
    height = _getComputedStyle.height;
  return {
    width: ensureSize(width),
    height: ensureSize(height)
  };
}

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useEvent.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useEvent.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useEvent; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function useEvent(callback) {
  var fnRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef();
  fnRef.current = callback;
  var memoFn = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function () {
    var _fnRef$current;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return (_fnRef$current = fnRef.current) === null || _fnRef$current === void 0 ? void 0 : _fnRef$current.call.apply(_fnRef$current, [fnRef].concat(args));
  }, []);
  return memoFn;
}

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useId.js":
/*!*************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useId.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useId; },
/* harmony export */   resetUuid: function() { return /* binding */ resetUuid; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



function getUseId() {
  // We need fully clone React function here to avoid webpack warning React 17 do not export `useId`
  var fullClone = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_1__["default"])({}, react__WEBPACK_IMPORTED_MODULE_2__);
  return fullClone.useId;
}
var uuid = 0;

/** @private Note only worked in develop env. Not work in production. */
function resetUuid() {
  if (true) {
    uuid = 0;
  }
}
function useId(id) {
  // Inner id for accessibility usage. Only work in client side
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_2__.useState('ssr-id'),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState, 2),
    innerId = _React$useState2[0],
    setInnerId = _React$useState2[1];
  var useOriginId = getUseId();
  var reactNativeId = useOriginId === null || useOriginId === void 0 ? void 0 : useOriginId();
  react__WEBPACK_IMPORTED_MODULE_2__.useEffect(function () {
    if (!useOriginId) {
      var nextId = uuid;
      uuid += 1;
      setInnerId("rc_unique_".concat(nextId));
    }
  }, []);

  // Developer passed id is single source of truth
  if (id) {
    return id;
  }

  // Test env always return mock id
  if (false) {}

  // Return react native id or inner id
  return reactNativeId || innerId;
}

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useLayoutEffect.js":
/*!***********************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useLayoutEffect.js ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useLayoutUpdateEffect: function() { return /* binding */ useLayoutUpdateEffect; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Dom/canUseDom */ "../node_modules/rc-util/es/Dom/canUseDom.js");



/**
 * Wrap `React.useLayoutEffect` which will not throw warning message in test env
 */
var useInternalLayoutEffect =  true && (0,_Dom_canUseDom__WEBPACK_IMPORTED_MODULE_1__["default"])() ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_0__.useEffect;
var useLayoutEffect = function useLayoutEffect(callback, deps) {
  var firstMountRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(true);
  useInternalLayoutEffect(function () {
    return callback(firstMountRef.current);
  }, deps);

  // We tell react that first mount has passed
  useInternalLayoutEffect(function () {
    firstMountRef.current = false;
    return function () {
      firstMountRef.current = true;
    };
  }, []);
};
var useLayoutUpdateEffect = function useLayoutUpdateEffect(callback, deps) {
  useLayoutEffect(function (firstMount) {
    if (!firstMount) {
      return callback();
    }
  }, deps);
};
/* harmony default export */ __webpack_exports__["default"] = (useLayoutEffect);

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useMemo.js":
/*!***************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useMemo.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useMemo; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function useMemo(getValue, condition, shouldUpdate) {
  var cacheRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef({});
  if (!('value' in cacheRef.current) || shouldUpdate(cacheRef.current.condition, condition)) {
    cacheRef.current.value = getValue();
    cacheRef.current.condition = condition;
  }
  return cacheRef.current.value;
}

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useMergedState.js":
/*!**********************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useMergedState.js ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useMergedState; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _useEvent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useEvent */ "../node_modules/rc-util/es/hooks/useEvent.js");
/* harmony import */ var _useLayoutEffect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./useLayoutEffect */ "../node_modules/rc-util/es/hooks/useLayoutEffect.js");
/* harmony import */ var _useState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./useState */ "../node_modules/rc-util/es/hooks/useState.js");




/** We only think `undefined` is empty */
function hasValue(value) {
  return value !== undefined;
}

/**
 * Similar to `useState` but will use props value if provided.
 * Note that internal use rc-util `useState` hook.
 */
function useMergedState(defaultStateValue, option) {
  var _ref = option || {},
    defaultValue = _ref.defaultValue,
    value = _ref.value,
    onChange = _ref.onChange,
    postState = _ref.postState;

  // ======================= Init =======================
  var _useState = (0,_useState__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
      if (hasValue(value)) {
        return value;
      } else if (hasValue(defaultValue)) {
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      } else {
        return typeof defaultStateValue === 'function' ? defaultStateValue() : defaultStateValue;
      }
    }),
    _useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useState, 2),
    innerValue = _useState2[0],
    setInnerValue = _useState2[1];
  var mergedValue = value !== undefined ? value : innerValue;
  var postMergedValue = postState ? postState(mergedValue) : mergedValue;

  // ====================== Change ======================
  var onChangeFn = (0,_useEvent__WEBPACK_IMPORTED_MODULE_1__["default"])(onChange);
  var _useState3 = (0,_useState__WEBPACK_IMPORTED_MODULE_3__["default"])([mergedValue]),
    _useState4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useState3, 2),
    prevValue = _useState4[0],
    setPrevValue = _useState4[1];
  (0,_useLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useLayoutUpdateEffect)(function () {
    var prev = prevValue[0];
    if (innerValue !== prev) {
      onChangeFn(innerValue, prev);
    }
  }, [prevValue]);

  // Sync value back to `undefined` when it from control to un-control
  (0,_useLayoutEffect__WEBPACK_IMPORTED_MODULE_2__.useLayoutUpdateEffect)(function () {
    if (!hasValue(value)) {
      setInnerValue(value);
    }
  }, [value]);

  // ====================== Update ======================
  var triggerChange = (0,_useEvent__WEBPACK_IMPORTED_MODULE_1__["default"])(function (updater, ignoreDestroy) {
    setInnerValue(updater, ignoreDestroy);
    setPrevValue([mergedValue], ignoreDestroy);
  });
  return [postMergedValue, triggerChange];
}

/***/ }),

/***/ "../node_modules/rc-util/es/hooks/useState.js":
/*!****************************************************!*\
  !*** ../node_modules/rc-util/es/hooks/useState.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ useSafeState; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Same as React.useState but `setState` accept `ignoreDestroy` param to not to setState after destroyed.
 * We do not make this auto is to avoid real memory leak.
 * Developer should confirm it's safe to ignore themselves.
 */
function useSafeState(defaultValue) {
  var destroyRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef(false);
  var _React$useState = react__WEBPACK_IMPORTED_MODULE_1__.useState(defaultValue),
    _React$useState2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_React$useState, 2),
    value = _React$useState2[0],
    setValue = _React$useState2[1];
  react__WEBPACK_IMPORTED_MODULE_1__.useEffect(function () {
    destroyRef.current = false;
    return function () {
      destroyRef.current = true;
    };
  }, []);
  function safeSetState(updater, ignoreDestroy) {
    if (ignoreDestroy && destroyRef.current) {
      return;
    }
    setValue(updater);
  }
  return [value, safeSetState];
}

/***/ }),

/***/ "../node_modules/rc-util/es/omit.js":
/*!******************************************!*\
  !*** ../node_modules/rc-util/es/omit.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ omit; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");

function omit(obj, fields) {
  var clone = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, obj);
  if (Array.isArray(fields)) {
    fields.forEach(function (key) {
      delete clone[key];
    });
  }
  return clone;
}

/***/ }),

/***/ "../node_modules/rc-util/es/pickAttrs.js":
/*!***********************************************!*\
  !*** ../node_modules/rc-util/es/pickAttrs.js ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ pickAttrs; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/objectSpread2 */ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js");

var attributes = "accept acceptCharset accessKey action allowFullScreen allowTransparency\n    alt async autoComplete autoFocus autoPlay capture cellPadding cellSpacing challenge\n    charSet checked classID className colSpan cols content contentEditable contextMenu\n    controls coords crossOrigin data dateTime default defer dir disabled download draggable\n    encType form formAction formEncType formMethod formNoValidate formTarget frameBorder\n    headers height hidden high href hrefLang htmlFor httpEquiv icon id inputMode integrity\n    is keyParams keyType kind label lang list loop low manifest marginHeight marginWidth max maxLength media\n    mediaGroup method min minLength multiple muted name noValidate nonce open\n    optimum pattern placeholder poster preload radioGroup readOnly rel required\n    reversed role rowSpan rows sandbox scope scoped scrolling seamless selected\n    shape size sizes span spellCheck src srcDoc srcLang srcSet start step style\n    summary tabIndex target title type useMap value width wmode wrap";
var eventsName = "onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown\n    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick\n    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown\n    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel\n    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough\n    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata\n    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad onError";
var propList = "".concat(attributes, " ").concat(eventsName).split(/[\s\n]+/);

/* eslint-enable max-len */
var ariaPrefix = 'aria-';
var dataPrefix = 'data-';
function match(key, prefix) {
  return key.indexOf(prefix) === 0;
}
/**
 * Picker props from exist props with filter
 * @param props Passed props
 * @param ariaOnly boolean | { aria?: boolean; data?: boolean; attr?: boolean; } filter config
 */
function pickAttrs(props) {
  var ariaOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var mergedConfig;
  if (ariaOnly === false) {
    mergedConfig = {
      aria: true,
      data: true,
      attr: true
    };
  } else if (ariaOnly === true) {
    mergedConfig = {
      aria: true
    };
  } else {
    mergedConfig = (0,_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__["default"])({}, ariaOnly);
  }
  var attrs = {};
  Object.keys(props).forEach(function (key) {
    if (
    // Aria
    mergedConfig.aria && (key === 'role' || match(key, ariaPrefix)) ||
    // Data
    mergedConfig.data && match(key, dataPrefix) ||
    // Attr
    mergedConfig.attr && propList.includes(key)) {
      attrs[key] = props[key];
    }
  });
  return attrs;
}

/***/ }),

/***/ "../node_modules/rc-util/es/raf.js":
/*!*****************************************!*\
  !*** ../node_modules/rc-util/es/raf.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var raf = function raf(callback) {
  return +setTimeout(callback, 16);
};
var caf = function caf(num) {
  return clearTimeout(num);
};
if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
  raf = function raf(callback) {
    return window.requestAnimationFrame(callback);
  };
  caf = function caf(handle) {
    return window.cancelAnimationFrame(handle);
  };
}
var rafUUID = 0;
var rafIds = new Map();
function cleanup(id) {
  rafIds.delete(id);
}
var wrapperRaf = function wrapperRaf(callback) {
  var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  rafUUID += 1;
  var id = rafUUID;
  function callRef(leftTimes) {
    if (leftTimes === 0) {
      // Clean up
      cleanup(id);

      // Trigger
      callback();
    } else {
      // Next raf
      var realId = raf(function () {
        callRef(leftTimes - 1);
      });

      // Bind real raf id
      rafIds.set(id, realId);
    }
  }
  callRef(times);
  return id;
};
wrapperRaf.cancel = function (id) {
  var realId = rafIds.get(id);
  cleanup(realId);
  return caf(realId);
};
/* harmony default export */ __webpack_exports__["default"] = (wrapperRaf);

/***/ }),

/***/ "../node_modules/rc-util/es/ref.js":
/*!*****************************************!*\
  !*** ../node_modules/rc-util/es/ref.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeRef: function() { return /* binding */ composeRef; },
/* harmony export */   fillRef: function() { return /* binding */ fillRef; },
/* harmony export */   supportNodeRef: function() { return /* binding */ supportNodeRef; },
/* harmony export */   supportRef: function() { return /* binding */ supportRef; },
/* harmony export */   useComposeRef: function() { return /* binding */ useComposeRef; }
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/typeof */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_is__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-is */ "../node_modules/rc-util/node_modules/react-is/index.js");
/* harmony import */ var _hooks_useMemo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./hooks/useMemo */ "../node_modules/rc-util/es/hooks/useMemo.js");

/* eslint-disable no-param-reassign */




function fillRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node);
  } else if ((0,_babel_runtime_helpers_esm_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(ref) === 'object' && ref && 'current' in ref) {
    ref.current = node;
  }
}

/**
 * Merge refs into one ref function to support ref passing.
 */
function composeRef() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }
  var refList = refs.filter(function (ref) {
    return ref;
  });
  if (refList.length <= 1) {
    return refList[0];
  }
  return function (node) {
    refs.forEach(function (ref) {
      fillRef(ref, node);
    });
  };
}
function useComposeRef() {
  for (var _len2 = arguments.length, refs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    refs[_key2] = arguments[_key2];
  }
  return (0,_hooks_useMemo__WEBPACK_IMPORTED_MODULE_3__["default"])(function () {
    return composeRef.apply(void 0, refs);
  }, refs, function (prev, next) {
    return prev.length !== next.length || prev.every(function (ref, i) {
      return ref !== next[i];
    });
  });
}
function supportRef(nodeOrComponent) {
  var _type$prototype, _nodeOrComponent$prot;
  var type = (0,react_is__WEBPACK_IMPORTED_MODULE_2__.isMemo)(nodeOrComponent) ? nodeOrComponent.type.type : nodeOrComponent.type;

  // Function component node
  if (typeof type === 'function' && !((_type$prototype = type.prototype) !== null && _type$prototype !== void 0 && _type$prototype.render)) {
    return false;
  }

  // Class component
  if (typeof nodeOrComponent === 'function' && !((_nodeOrComponent$prot = nodeOrComponent.prototype) !== null && _nodeOrComponent$prot !== void 0 && _nodeOrComponent$prot.render)) {
    return false;
  }
  return true;
}
function supportNodeRef(node) {
  if (! /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_1__.isValidElement)(node)) {
    return false;
  }
  if ((0,react_is__WEBPACK_IMPORTED_MODULE_2__.isFragment)(node)) {
    return false;
  }
  return supportRef(node);
}
/* eslint-enable */

/***/ }),

/***/ "../node_modules/rc-util/es/warning.js":
/*!*********************************************!*\
  !*** ../node_modules/rc-util/es/warning.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   call: function() { return /* binding */ call; },
/* harmony export */   note: function() { return /* binding */ note; },
/* harmony export */   noteOnce: function() { return /* binding */ noteOnce; },
/* harmony export */   preMessage: function() { return /* binding */ preMessage; },
/* harmony export */   resetWarned: function() { return /* binding */ resetWarned; },
/* harmony export */   warning: function() { return /* binding */ warning; },
/* harmony export */   warningOnce: function() { return /* binding */ warningOnce; }
/* harmony export */ });
/* eslint-disable no-console */
var warned = {};
var preWarningFns = [];

/**
 * Pre warning enable you to parse content before console.error.
 * Modify to null will prevent warning.
 */
var preMessage = function preMessage(fn) {
  preWarningFns.push(fn);
};
function warning(valid, message) {
  // Support uglify
  if ( true && !valid && console !== undefined) {
    var finalMessage = preWarningFns.reduce(function (msg, preMessageFn) {
      return preMessageFn(msg !== null && msg !== void 0 ? msg : '', 'warning');
    }, message);
    if (finalMessage) {
      console.error("Warning: ".concat(finalMessage));
    }
  }
}
function note(valid, message) {
  // Support uglify
  if ( true && !valid && console !== undefined) {
    var finalMessage = preWarningFns.reduce(function (msg, preMessageFn) {
      return preMessageFn(msg !== null && msg !== void 0 ? msg : '', 'note');
    }, message);
    if (finalMessage) {
      console.warn("Note: ".concat(finalMessage));
    }
  }
}
function resetWarned() {
  warned = {};
}
function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}
function warningOnce(valid, message) {
  call(warning, valid, message);
}
function noteOnce(valid, message) {
  call(note, valid, message);
}
warningOnce.preMessage = preMessage;
warningOnce.resetWarned = resetWarned;
warningOnce.noteOnce = noteOnce;
/* harmony default export */ __webpack_exports__["default"] = (warningOnce);
/* eslint-enable */

/***/ }),

/***/ "../node_modules/rc-util/node_modules/react-is/cjs/react-is.development.js":
/*!*********************************************************************************!*\
  !*** ../node_modules/rc-util/node_modules/react-is/cjs/react-is.development.js ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
// (unstable) APIs that have been removed. Can we remove the symbols?

var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
} // AsyncMode is deprecated along with isAsyncMode

var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }

  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
exports.isValidElementType = isValidElementType;
exports.typeOf = typeOf;
  })();
}


/***/ }),

/***/ "../node_modules/rc-util/node_modules/react-is/index.js":
/*!**************************************************************!*\
  !*** ../node_modules/rc-util/node_modules/react-is/index.js ***!
  \**************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "../node_modules/rc-util/node_modules/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "../node_modules/react-router-dom/dist/index.js":
/*!******************************************************!*\
  !*** ../node_modules/react-router-dom/dist/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbortedDeferredError: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.AbortedDeferredError; },
/* harmony export */   Await: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Await; },
/* harmony export */   BrowserRouter: function() { return /* binding */ BrowserRouter; },
/* harmony export */   Form: function() { return /* binding */ Form; },
/* harmony export */   HashRouter: function() { return /* binding */ HashRouter; },
/* harmony export */   Link: function() { return /* binding */ Link; },
/* harmony export */   MemoryRouter: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.MemoryRouter; },
/* harmony export */   NavLink: function() { return /* binding */ NavLink; },
/* harmony export */   Navigate: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Navigate; },
/* harmony export */   NavigationType: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.Action; },
/* harmony export */   Outlet: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Outlet; },
/* harmony export */   Route: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Route; },
/* harmony export */   Router: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Router; },
/* harmony export */   RouterProvider: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.RouterProvider; },
/* harmony export */   Routes: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.Routes; },
/* harmony export */   ScrollRestoration: function() { return /* binding */ ScrollRestoration; },
/* harmony export */   UNSAFE_DataRouterContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_DataRouterContext; },
/* harmony export */   UNSAFE_DataRouterStateContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_DataRouterStateContext; },
/* harmony export */   UNSAFE_LocationContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_LocationContext; },
/* harmony export */   UNSAFE_NavigationContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext; },
/* harmony export */   UNSAFE_RouteContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_RouteContext; },
/* harmony export */   UNSAFE_useRouteId: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_useRouteId; },
/* harmony export */   UNSAFE_useScrollRestoration: function() { return /* binding */ useScrollRestoration; },
/* harmony export */   createBrowserRouter: function() { return /* binding */ createBrowserRouter; },
/* harmony export */   createHashRouter: function() { return /* binding */ createHashRouter; },
/* harmony export */   createMemoryRouter: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.createMemoryRouter; },
/* harmony export */   createPath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.createPath; },
/* harmony export */   createRoutesFromChildren: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.createRoutesFromChildren; },
/* harmony export */   createRoutesFromElements: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.createRoutesFromElements; },
/* harmony export */   createSearchParams: function() { return /* binding */ createSearchParams; },
/* harmony export */   defer: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.defer; },
/* harmony export */   generatePath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.generatePath; },
/* harmony export */   isRouteErrorResponse: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.isRouteErrorResponse; },
/* harmony export */   json: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.json; },
/* harmony export */   matchPath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.matchPath; },
/* harmony export */   matchRoutes: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.matchRoutes; },
/* harmony export */   parsePath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.parsePath; },
/* harmony export */   redirect: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.redirect; },
/* harmony export */   redirectDocument: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.redirectDocument; },
/* harmony export */   renderMatches: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.renderMatches; },
/* harmony export */   resolvePath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_1__.resolvePath; },
/* harmony export */   unstable_HistoryRouter: function() { return /* binding */ HistoryRouter; },
/* harmony export */   unstable_useBlocker: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.unstable_useBlocker; },
/* harmony export */   unstable_usePrompt: function() { return /* binding */ usePrompt; },
/* harmony export */   useActionData: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useActionData; },
/* harmony export */   useAsyncError: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useAsyncError; },
/* harmony export */   useAsyncValue: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useAsyncValue; },
/* harmony export */   useBeforeUnload: function() { return /* binding */ useBeforeUnload; },
/* harmony export */   useFetcher: function() { return /* binding */ useFetcher; },
/* harmony export */   useFetchers: function() { return /* binding */ useFetchers; },
/* harmony export */   useFormAction: function() { return /* binding */ useFormAction; },
/* harmony export */   useHref: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useHref; },
/* harmony export */   useInRouterContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useInRouterContext; },
/* harmony export */   useLinkClickHandler: function() { return /* binding */ useLinkClickHandler; },
/* harmony export */   useLoaderData: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useLoaderData; },
/* harmony export */   useLocation: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation; },
/* harmony export */   useMatch: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useMatch; },
/* harmony export */   useMatches: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useMatches; },
/* harmony export */   useNavigate: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigate; },
/* harmony export */   useNavigation: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigation; },
/* harmony export */   useNavigationType: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigationType; },
/* harmony export */   useOutlet: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useOutlet; },
/* harmony export */   useOutletContext: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useOutletContext; },
/* harmony export */   useParams: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useParams; },
/* harmony export */   useResolvedPath: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useResolvedPath; },
/* harmony export */   useRevalidator: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useRevalidator; },
/* harmony export */   useRouteError: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useRouteError; },
/* harmony export */   useRouteLoaderData: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useRouteLoaderData; },
/* harmony export */   useRoutes: function() { return /* reexport safe */ react_router__WEBPACK_IMPORTED_MODULE_2__.useRoutes; },
/* harmony export */   useSearchParams: function() { return /* binding */ useSearchParams; },
/* harmony export */   useSubmit: function() { return /* binding */ useSubmit; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router */ "../node_modules/react-router/dist/index.js");
/* harmony import */ var react_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @remix-run/router */ "../node_modules/@remix-run/router/dist/router.js");
/**
 * React Router DOM v6.15.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */





function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

const defaultMethod = "get";
const defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && (
  // Ignore everything but left clicks
  !target || target === "_self") &&
  // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event) // Ignore clicks with modifier keys
  ;
}
/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 *   let searchParams = new URLSearchParams([
 *     ['sort', 'name'],
 *     ['sort', 'price']
 *   ]);
 *
 * you can do:
 *
 *   let searchParams = createSearchParams({
 *     sort: ['name', 'price']
 *   });
 */
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    // Use `defaultSearchParams.forEach(...)` here instead of iterating of
    // `defaultSearchParams.keys()` to work-around a bug in Firefox related to
    // web extensions. Relevant Bugzilla tickets:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1414602
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1023984
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach(value => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
// One-time check for submitter support
let _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(document.createElement("form"),
      // @ts-expect-error if FormData supports the submitter parameter, this will throw
      0);
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
const supportedFormEncTypes = new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
     true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(false, "\"" + encType + "\" is not a valid `encType` for `<Form>`/`<fetcher.Form>` " + ("and will default to \"" + defaultEncType + "\"")) : 0;
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    // When grabbing the action from the element, it will have had the basename
    // prefixed to ensure non-JS scenarios work, so strip it since we'll
    // re-prefix in the router
    let attr = target.getAttribute("action");
    action = attr ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error("Cannot submit a <button> or <input type=\"submit\"> without a <form>");
    }
    // <button>/<input type="submit"> may override attributes of <form>
    // When grabbing the action from the element, it will have had the basename
    // prefixed to ensure non-JS scenarios work, so strip it since we'll
    // re-prefix in the router
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    // Build a FormData object populated from a form and submitter
    formData = new FormData(form, target);
    // If this browser doesn't support the `FormData(el, submitter)` format,
    // then tack on the submitter value at the end.  This is a lightweight
    // solution that is not 100% spec compliant.  For complete support in older
    // browsers, consider using the `formdata-submitter-polyfill` package
    if (!isFormDataSubmitterSupported()) {
      let {
        name,
        type,
        value
      } = target;
      if (type === "image") {
        let prefix = name ? name + "." : "";
        formData.append(prefix + "x", "0");
        formData.append(prefix + "y", "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error("Cannot submit element that is not <form>, <button>, or " + "<input type=\"submit|image\">");
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  // Send body for <Form encType="text/plain" so we encode it into text
  if (formData && encType === "text/plain") {
    body = formData;
    formData = undefined;
  }
  return {
    action,
    method: method.toLowerCase(),
    encType,
    formData,
    body
  };
}

const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset"],
  _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "children"],
  _excluded3 = ["reloadDocument", "replace", "state", "method", "action", "onSubmit", "submit", "relative", "preventScrollReset"];
function createBrowserRouter(routes, opts) {
  return (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createRouter)({
    basename: opts == null ? void 0 : opts.basename,
    future: _extends({}, opts == null ? void 0 : opts.future, {
      v7_prependBasename: true
    }),
    history: (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createBrowserHistory)({
      window: opts == null ? void 0 : opts.window
    }),
    hydrationData: (opts == null ? void 0 : opts.hydrationData) || parseHydrationData(),
    routes,
    mapRouteProperties: react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_mapRouteProperties
  }).initialize();
}
function createHashRouter(routes, opts) {
  return (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createRouter)({
    basename: opts == null ? void 0 : opts.basename,
    future: _extends({}, opts == null ? void 0 : opts.future, {
      v7_prependBasename: true
    }),
    history: (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createHashHistory)({
      window: opts == null ? void 0 : opts.window
    }),
    hydrationData: (opts == null ? void 0 : opts.hydrationData) || parseHydrationData(),
    routes,
    mapRouteProperties: react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_mapRouteProperties
  }).initialize();
}
function parseHydrationData() {
  var _window;
  let state = (_window = window) == null ? void 0 : _window.__staticRouterHydrationData;
  if (state && state.errors) {
    state = _extends({}, state, {
      errors: deserializeErrors(state.errors)
    });
  }
  return state;
}
function deserializeErrors(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    // Hey you!  If you change this, please change the corresponding logic in
    // serializeErrors in react-router-dom/server.tsx :)
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new react_router__WEBPACK_IMPORTED_MODULE_1__.ErrorResponse(val.status, val.statusText, val.data, val.internal === true);
    } else if (val && val.__type === "Error") {
      // Attempt to reconstruct the right type of Error (i.e., ReferenceError)
      if (val.__subType) {
        let ErrorConstructor = window[val.__subType];
        if (typeof ErrorConstructor === "function") {
          try {
            // @ts-expect-error
            let error = new ErrorConstructor(val.message);
            // Wipe away the client-side stack trace.  Nothing to fill it in with
            // because we don't serialize SSR stack traces for security reasons
            error.stack = "";
            serialized[key] = error;
          } catch (e) {
            // no-op - fall through and create a normal Error
          }
        }
      }
      if (serialized[key] == null) {
        let error = new Error(val.message);
        // Wipe away the client-side stack trace.  Nothing to fill it in with
        // because we don't serialize SSR stack traces for security reasons
        error.stack = "";
        serialized[key] = error;
      }
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}
//#endregion
////////////////////////////////////////////////////////////////////////////////
//#region Components
////////////////////////////////////////////////////////////////////////////////
/**
  Webpack + React 17 fails to compile on any of the following because webpack
  complains that `startTransition` doesn't exist in `React`:
  * import { startTransition } from "react"
  * import * as React from from "react";
    "startTransition" in React ? React.startTransition(() => setState()) : setState()
  * import * as React from from "react";
    "startTransition" in React ? React["startTransition"](() => setState()) : setState()

  Moving it to a constant such as the following solves the Webpack/React 17 issue:
  * import * as React from from "react";
    const START_TRANSITION = "startTransition";
    START_TRANSITION in React ? React[START_TRANSITION](() => setState()) : setState()

  However, that introduces webpack/terser minification issues in production builds
  in React 18 where minification/obfuscation ends up removing the call of
  React.startTransition entirely from the first half of the ternary.  Grabbing
  this exported reference once up front resolves that issue.

  See https://github.com/remix-run/react-router/issues/10579
*/
const START_TRANSITION = "startTransition";
const startTransitionImpl = react__WEBPACK_IMPORTED_MODULE_0__[START_TRANSITION];
/**
 * A `<Router>` for use in web browsers. Provides the cleanest URLs.
 */
function BrowserRouter(_ref) {
  let {
    basename,
    children,
    future,
    window
  } = _ref;
  let historyRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef();
  if (historyRef.current == null) {
    historyRef.current = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createBrowserHistory)({
      window,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newState => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_2__.Router, {
    basename: basename,
    children: children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
/**
 * A `<Router>` for use in web browsers. Stores the location in the hash
 * portion of the URL so it is not sent to the server.
 */
function HashRouter(_ref2) {
  let {
    basename,
    children,
    future,
    window
  } = _ref2;
  let historyRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef();
  if (historyRef.current == null) {
    historyRef.current = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createHashHistory)({
      window,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newState => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_2__.Router, {
    basename: basename,
    children: children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
/**
 * A `<Router>` that accepts a pre-instantiated history object. It's important
 * to note that using your own history object is highly discouraged and may add
 * two versions of the history library to your bundles unless you use the same
 * version of the history library that React Router uses internally.
 */
function HistoryRouter(_ref3) {
  let {
    basename,
    children,
    future,
    history
  } = _ref3;
  let [state, setStateImpl] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newState => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router__WEBPACK_IMPORTED_MODULE_2__.Router, {
    basename: basename,
    children: children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
if (true) {
  HistoryRouter.displayName = "unstable_HistoryRouter";
}
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
/**
 * The public API for rendering a history-aware <a>.
 */
const Link = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function LinkWithRef(_ref4, ref) {
  let {
      onClick,
      relative,
      reloadDocument,
      replace,
      state,
      target,
      to,
      preventScrollReset
    } = _ref4,
    rest = _objectWithoutPropertiesLoose(_ref4, _excluded);
  let {
    basename
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  // Rendered into <a href> for absolute URLs
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    // Render the absolute href server- and client-side
    absoluteHref = to;
    // Only check for external origins client-side
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = (0,react_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          // Strip the protocol/origin/basename for same-origin absolute URLs
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
        // We can't do external URL detection without a valid URL
         true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(false, "<Link to=\"" + to + "\"> contains an invalid URL which will probably break " + "when clicked - please update to a valid URL path.") : 0;
      }
    }
  }
  // Rendered into <a href> for relative URLs
  let href = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useHref)(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace,
    state,
    target,
    preventScrollReset,
    relative
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref: ref,
      target: target
    }))
  );
});
if (true) {
  Link.displayName = "Link";
}
/**
 * A <Link> wrapper that knows if it's "active" or not.
 */
const NavLink = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(function NavLinkWithRef(_ref5, ref) {
  let {
      "aria-current": ariaCurrentProp = "page",
      caseSensitive = false,
      className: classNameProp = "",
      end = false,
      style: styleProp,
      to,
      children
    } = _ref5,
    rest = _objectWithoutPropertiesLoose(_ref5, _excluded2);
  let path = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useResolvedPath)(to, {
    relative: rest.relative
  });
  let location = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation)();
  let routerState = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_DataRouterStateContext);
  let {
    navigator
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let ariaCurrent = isActive ? ariaCurrentProp : undefined;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp({
      isActive,
      isPending
    });
  } else {
    // If the className prop is not a function, we use a default `active`
    // class for <NavLink />s that are active. In v5 `active` was the default
    // value for `activeClassName`, but we are removing that API and can still
    // use the old default behavior for a cleaner upgrade path and keep the
    // simple styling rules working as they currently do.
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp({
    isActive,
    isPending
  }) : styleProp;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className: className,
    ref: ref,
    style: style,
    to: to
  }), typeof children === "function" ? children({
    isActive,
    isPending
  }) : children);
});
if (true) {
  NavLink.displayName = "NavLink";
}
/**
 * A `@remix-run/router`-aware `<form>`. It behaves like a normal form except
 * that the interaction with the server is with `fetch` instead of new document
 * requests, allowing components to add nicer UX to the page as the form is
 * submitted and returns with data.
 */
const Form = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, ref) => {
  let submit = useSubmit();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FormImpl, _extends({}, props, {
    submit: submit,
    ref: ref
  }));
});
if (true) {
  Form.displayName = "Form";
}
const FormImpl = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((_ref6, forwardedRef) => {
  let {
      reloadDocument,
      replace,
      state,
      method = defaultMethod,
      action,
      onSubmit,
      submit,
      relative,
      preventScrollReset
    } = _ref6,
    props = _objectWithoutPropertiesLoose(_ref6, _excluded3);
  let formMethod = method.toLowerCase() === "get" ? "get" : "post";
  let formAction = useFormAction(action, {
    relative
  });
  let submitHandler = event => {
    onSubmit && onSubmit(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    let submitter = event.nativeEvent.submitter;
    let submitMethod = (submitter == null ? void 0 : submitter.getAttribute("formmethod")) || method;
    submit(submitter || event.currentTarget, {
      method: submitMethod,
      replace,
      state,
      relative,
      preventScrollReset
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("form", _extends({
    ref: forwardedRef,
    method: formMethod,
    action: formAction,
    onSubmit: reloadDocument ? onSubmit : submitHandler
  }, props));
});
if (true) {
  FormImpl.displayName = "FormImpl";
}
/**
 * This component will emulate the browser's scroll restoration on location
 * changes.
 */
function ScrollRestoration(_ref7) {
  let {
    getKey,
    storageKey
  } = _ref7;
  useScrollRestoration({
    getKey,
    storageKey
  });
  return null;
}
if (true) {
  ScrollRestoration.displayName = "ScrollRestoration";
}
//#endregion
////////////////////////////////////////////////////////////////////////////////
//#region Hooks
////////////////////////////////////////////////////////////////////////////////
var DataRouterHook;
(function (DataRouterHook) {
  DataRouterHook["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook["UseSubmit"] = "useSubmit";
  DataRouterHook["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook["UseFetcher"] = "useFetcher";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function (DataRouterStateHook) {
  DataRouterStateHook["UseFetchers"] = "useFetchers";
  DataRouterStateHook["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_DataRouterContext);
  !ctx ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, getDataRouterConsoleError(hookName)) : 0 : void 0;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_DataRouterStateContext);
  !state ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, getDataRouterConsoleError(hookName)) : 0 : void 0;
  return state;
}
/**
 * Handles the click behavior for router `<Link>` components. This is useful if
 * you need to create custom `<Link>` components with the same click behavior we
 * use in our exported `<Link>`.
 */
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative
  } = _temp === void 0 ? {} : _temp;
  let navigate = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigate)();
  let location = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation)();
  let path = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useResolvedPath)(to, {
    relative
  });
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(event => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      // If the URL hasn't changed, a regular <a> will do a replace instead of
      // a push, so do the same here unless the replace prop is explicitly set
      let replace = replaceProp !== undefined ? replaceProp : (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createPath)(location) === (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createPath)(path);
      navigate(to, {
        replace,
        state,
        preventScrollReset,
        relative
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative]);
}
/**
 * A convenient wrapper for reading and writing search parameters via the
 * URLSearchParams interface.
 */
function useSearchParams(defaultInit) {
   true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(typeof URLSearchParams !== "undefined", "You cannot use the `useSearchParams` hook in a browser that does not " + "support the URLSearchParams API. If you need to support Internet " + "Explorer 11, we recommend you load a polyfill such as " + "https://github.com/ungap/url-search-params\n\n" + "If you're unsure how to load polyfills, we recommend you check out " + "https://polyfill.io/v3/ which provides some recommendations about how " + "to load polyfills only for users that need them, instead of for every " + "user.") : 0;
  let defaultSearchParamsRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  let location = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation)();
  let searchParams = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() =>
  // Only merge in the defaults if we haven't yet called setSearchParams.
  // Once we call that we want those to take precedence, otherwise you can't
  // remove a param with setSearchParams({}) if it has an initial value
  getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current), [location.search]);
  let navigate = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigate)();
  let setSearchParams = react__WEBPACK_IMPORTED_MODULE_0__.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function validateClientSideSubmission() {
  if (typeof document === "undefined") {
    throw new Error("You are calling submit during the server render. " + "Try calling submit within a `useEffect` or callback instead.");
  }
}
/**
 * Returns a function that may be used to programmatically submit a form (or
 * some arbitrary data) to the server.
 */
function useSubmit() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseSubmit);
  let {
    basename
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  let currentRouteId = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_useRouteId)();
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function (target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    router.navigate(options.action || action, {
      preventScrollReset: options.preventScrollReset,
      formData,
      body,
      formMethod: options.method || method,
      formEncType: options.encType || encType,
      replace: options.replace,
      state: options.state,
      fromRouteId: currentRouteId
    });
  }, [router, basename, currentRouteId]);
}
/**
 * Returns the implementation for fetcher.submit
 */
function useSubmitFetcher(fetcherKey, fetcherRouteId) {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseSubmitFetcher);
  let {
    basename
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function (target, options) {
    if (options === void 0) {
      options = {};
    }
    validateClientSideSubmission();
    let {
      action,
      method,
      encType,
      formData,
      body
    } = getFormSubmissionInfo(target, basename);
    !(fetcherRouteId != null) ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "No routeId available for useFetcher()") : 0 : void 0;
    router.fetch(fetcherKey, fetcherRouteId, options.action || action, {
      preventScrollReset: options.preventScrollReset,
      formData,
      body,
      formMethod: options.method || method,
      formEncType: options.encType || encType
    });
  }, [router, basename, fetcherKey, fetcherRouteId]);
}
// v7: Eventually we should deprecate this entirely in favor of using the
// router method directly?
function useFormAction(action, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    basename
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  let routeContext = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_RouteContext);
  !routeContext ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "useFormAction must be used inside a RouteContext") : 0 : void 0;
  let [match] = routeContext.matches.slice(-1);
  // Shallow clone path so we can modify it below, otherwise we modify the
  // object referenced by useMemo inside useResolvedPath
  let path = _extends({}, (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useResolvedPath)(action ? action : ".", {
    relative
  }));
  // Previously we set the default action to ".". The problem with this is that
  // `useResolvedPath(".")` excludes search params of the resolved URL. This is
  // the intended behavior of when "." is specifically provided as
  // the form action, but inconsistent w/ browsers when the action is omitted.
  // https://github.com/remix-run/remix/issues/927
  let location = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation)();
  if (action == null) {
    // Safe to write to this directly here since if action was undefined, we
    // would have called useResolvedPath(".") which will never include a search
    path.search = location.search;
    // When grabbing search params from the URL, remove the automatically
    // inserted ?index param so we match the useResolvedPath search behavior
    // which would not include ?index
    if (match.route.index) {
      let params = new URLSearchParams(path.search);
      params.delete("index");
      path.search = params.toString() ? "?" + params.toString() : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  // If we're operating within a basename, prepend it to the pathname prior
  // to creating the form action.  If this is a root navigation, then just use
  // the raw basename which allows the basename to have full control over the
  // presence of a trailing slash on root actions
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : (0,react_router__WEBPACK_IMPORTED_MODULE_1__.joinPaths)([basename, path.pathname]);
  }
  return (0,react_router__WEBPACK_IMPORTED_MODULE_1__.createPath)(path);
}
function createFetcherForm(fetcherKey, routeId) {
  let FetcherForm = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, ref) => {
    let submit = useSubmitFetcher(fetcherKey, routeId);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(FormImpl, _extends({}, props, {
      ref: ref,
      submit: submit
    }));
  });
  if (true) {
    FetcherForm.displayName = "fetcher.Form";
  }
  return FetcherForm;
}
let fetcherId = 0;
/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 */
function useFetcher() {
  var _route$matches;
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseFetcher);
  let route = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_RouteContext);
  !route ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "useFetcher must be used inside a RouteContext") : 0 : void 0;
  let routeId = (_route$matches = route.matches[route.matches.length - 1]) == null ? void 0 : _route$matches.route.id;
  !(routeId != null) ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "useFetcher can only be used on routes that contain a unique \"id\"") : 0 : void 0;
  let [fetcherKey] = react__WEBPACK_IMPORTED_MODULE_0__.useState(() => String(++fetcherId));
  let [Form] = react__WEBPACK_IMPORTED_MODULE_0__.useState(() => {
    !routeId ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "No routeId available for fetcher.Form()") : 0 : void 0;
    return createFetcherForm(fetcherKey, routeId);
  });
  let [load] = react__WEBPACK_IMPORTED_MODULE_0__.useState(() => href => {
    !router ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "No router available for fetcher.load()") : 0 : void 0;
    !routeId ?  true ? (0,react_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "No routeId available for fetcher.load()") : 0 : void 0;
    router.fetch(fetcherKey, routeId, href);
  });
  let submit = useSubmitFetcher(fetcherKey, routeId);
  let fetcher = router.getFetcher(fetcherKey);
  let fetcherWithComponents = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => _extends({
    Form,
    submit,
    load
  }, fetcher), [fetcher, Form, submit, load]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    // Is this busted when the React team gets real weird and calls effects
    // twice on mount?  We really just need to garbage collect here when this
    // fetcher is no longer around.
    return () => {
      if (!router) {
        console.warn("No router available to clean up from useFetcher()");
        return;
      }
      router.deleteFetcher(fetcherKey);
    };
  }, [router, fetcherKey]);
  return fetcherWithComponents;
}
/**
 * Provides all fetchers currently on the page. Useful for layouts and parent
 * routes that need to provide pending/optimistic UI regarding the fetch.
 */
function useFetchers() {
  let state = useDataRouterState(DataRouterStateHook.UseFetchers);
  return [...state.fetchers.values()];
}
const SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
let savedScrollPositions = {};
/**
 * When rendered inside a RouterProvider, will restore scroll positions on navigations
 */
function useScrollRestoration(_temp3) {
  let {
    getKey,
    storageKey
  } = _temp3 === void 0 ? {} : _temp3;
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseScrollRestoration);
  let {
    restoreScrollPosition,
    preventScrollReset
  } = useDataRouterState(DataRouterStateHook.UseScrollRestoration);
  let {
    basename
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(react_router__WEBPACK_IMPORTED_MODULE_2__.UNSAFE_NavigationContext);
  let location = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useLocation)();
  let matches = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useMatches)();
  let navigation = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.useNavigation)();
  // Trigger manual scroll restoration while we're active
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  // Save positions on pagehide
  usePageHide(react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => {
    if (navigation.state === "idle") {
      let key = (getKey ? getKey(location, matches) : null) || location.key;
      savedScrollPositions[key] = window.scrollY;
    }
    sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
    window.history.scrollRestoration = "auto";
  }, [storageKey, getKey, navigation.state, location, matches]));
  // Read in any saved scroll locations
  if (typeof document !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
        // no-op, use default empty object
      }
    }, [storageKey]);
    // Enable scroll restoration in the router
    // eslint-disable-next-line react-hooks/rules-of-hooks
    react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => {
      let getKeyWithoutBasename = getKey && basename !== "/" ? (location, matches) => getKey( // Strip the basename to match useLocation()
      _extends({}, location, {
        pathname: (0,react_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(location.pathname, basename) || location.pathname
      }), matches) : getKey;
      let disableScrollRestoration = router == null ? void 0 : router.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKeyWithoutBasename);
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    // Restore scrolling when state.restoreScrollPosition changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => {
      // Explicit false means don't do anything (used for submissions)
      if (restoreScrollPosition === false) {
        return;
      }
      // been here before, scroll to it
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      // try to scroll to the hash
      if (location.hash) {
        let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) {
          el.scrollIntoView();
          return;
        }
      }
      // Don't reset if this navigation opted out
      if (preventScrollReset === true) {
        return;
      }
      // otherwise go to the top on new locations
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
/**
 * Setup a callback to be fired on the window's `beforeunload` event. This is
 * useful for saving some data to `window.localStorage` just before the page
 * refreshes.
 *
 * Note: The `callback` argument should be a function created with
 * `React.useCallback()`.
 */
function useBeforeUnload(callback, options) {
  let {
    capture
  } = options || {};
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : undefined;
    window.addEventListener("beforeunload", callback, opts);
    return () => {
      window.removeEventListener("beforeunload", callback, opts);
    };
  }, [callback, capture]);
}
/**
 * Setup a callback to be fired on the window's `pagehide` event. This is
 * useful for saving some data to `window.localStorage` just before the page
 * refreshes.  This event is better supported than beforeunload across browsers.
 *
 * Note: The `callback` argument should be a function created with
 * `React.useCallback()`.
 */
function usePageHide(callback, options) {
  let {
    capture
  } = options || {};
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    let opts = capture != null ? {
      capture
    } : undefined;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
/**
 * Wrapper around useBlocker to show a window.confirm prompt to users instead
 * of building a custom UI with useBlocker.
 *
 * Warning: This has *a lot of rough edges* and behaves very differently (and
 * very incorrectly in some cases) across browsers if user click addition
 * back/forward navigations while the confirm is open.  Use at your own risk.
 */
function usePrompt(_ref8) {
  let {
    when,
    message
  } = _ref8;
  let blocker = (0,react_router__WEBPACK_IMPORTED_MODULE_2__.unstable_useBlocker)(when);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (blocker.state === "blocked") {
      let proceed = window.confirm(message);
      if (proceed) {
        // This timeout is needed to avoid a weird "race" on POP navigations
        // between the `window.history` revert navigation and the result of
        // `window.confirm`
        setTimeout(blocker.proceed, 0);
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (blocker.state === "blocked" && !when) {
      blocker.reset();
    }
  }, [blocker, when]);
}
//#endregion


//# sourceMappingURL=index.js.map


/***/ }),

/***/ "../node_modules/react-router/dist/index.js":
/*!**************************************************!*\
  !*** ../node_modules/react-router/dist/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbortedDeferredError: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.AbortedDeferredError; },
/* harmony export */   Await: function() { return /* binding */ Await; },
/* harmony export */   MemoryRouter: function() { return /* binding */ MemoryRouter; },
/* harmony export */   Navigate: function() { return /* binding */ Navigate; },
/* harmony export */   NavigationType: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.Action; },
/* harmony export */   Outlet: function() { return /* binding */ Outlet; },
/* harmony export */   Route: function() { return /* binding */ Route; },
/* harmony export */   Router: function() { return /* binding */ Router; },
/* harmony export */   RouterProvider: function() { return /* binding */ RouterProvider; },
/* harmony export */   Routes: function() { return /* binding */ Routes; },
/* harmony export */   UNSAFE_DataRouterContext: function() { return /* binding */ DataRouterContext; },
/* harmony export */   UNSAFE_DataRouterStateContext: function() { return /* binding */ DataRouterStateContext; },
/* harmony export */   UNSAFE_LocationContext: function() { return /* binding */ LocationContext; },
/* harmony export */   UNSAFE_NavigationContext: function() { return /* binding */ NavigationContext; },
/* harmony export */   UNSAFE_RouteContext: function() { return /* binding */ RouteContext; },
/* harmony export */   UNSAFE_mapRouteProperties: function() { return /* binding */ mapRouteProperties; },
/* harmony export */   UNSAFE_useRouteId: function() { return /* binding */ useRouteId; },
/* harmony export */   UNSAFE_useRoutesImpl: function() { return /* binding */ useRoutesImpl; },
/* harmony export */   createMemoryRouter: function() { return /* binding */ createMemoryRouter; },
/* harmony export */   createPath: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.createPath; },
/* harmony export */   createRoutesFromChildren: function() { return /* binding */ createRoutesFromChildren; },
/* harmony export */   createRoutesFromElements: function() { return /* binding */ createRoutesFromChildren; },
/* harmony export */   defer: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.defer; },
/* harmony export */   generatePath: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.generatePath; },
/* harmony export */   isRouteErrorResponse: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.isRouteErrorResponse; },
/* harmony export */   json: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.json; },
/* harmony export */   matchPath: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.matchPath; },
/* harmony export */   matchRoutes: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.matchRoutes; },
/* harmony export */   parsePath: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.parsePath; },
/* harmony export */   redirect: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.redirect; },
/* harmony export */   redirectDocument: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.redirectDocument; },
/* harmony export */   renderMatches: function() { return /* binding */ renderMatches; },
/* harmony export */   resolvePath: function() { return /* reexport safe */ _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.resolvePath; },
/* harmony export */   unstable_useBlocker: function() { return /* binding */ useBlocker; },
/* harmony export */   useActionData: function() { return /* binding */ useActionData; },
/* harmony export */   useAsyncError: function() { return /* binding */ useAsyncError; },
/* harmony export */   useAsyncValue: function() { return /* binding */ useAsyncValue; },
/* harmony export */   useHref: function() { return /* binding */ useHref; },
/* harmony export */   useInRouterContext: function() { return /* binding */ useInRouterContext; },
/* harmony export */   useLoaderData: function() { return /* binding */ useLoaderData; },
/* harmony export */   useLocation: function() { return /* binding */ useLocation; },
/* harmony export */   useMatch: function() { return /* binding */ useMatch; },
/* harmony export */   useMatches: function() { return /* binding */ useMatches; },
/* harmony export */   useNavigate: function() { return /* binding */ useNavigate; },
/* harmony export */   useNavigation: function() { return /* binding */ useNavigation; },
/* harmony export */   useNavigationType: function() { return /* binding */ useNavigationType; },
/* harmony export */   useOutlet: function() { return /* binding */ useOutlet; },
/* harmony export */   useOutletContext: function() { return /* binding */ useOutletContext; },
/* harmony export */   useParams: function() { return /* binding */ useParams; },
/* harmony export */   useResolvedPath: function() { return /* binding */ useResolvedPath; },
/* harmony export */   useRevalidator: function() { return /* binding */ useRevalidator; },
/* harmony export */   useRouteError: function() { return /* binding */ useRouteError; },
/* harmony export */   useRouteLoaderData: function() { return /* binding */ useRouteLoaderData; },
/* harmony export */   useRoutes: function() { return /* binding */ useRoutes; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _remix_run_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @remix-run/router */ "../node_modules/@remix-run/router/dist/router.js");
/**
 * React Router v6.15.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */




function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

// Create react-specific types from the agnostic types in @remix-run/router to
// export from react-router
const DataRouterContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  DataRouterContext.displayName = "DataRouter";
}
const DataRouterStateContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  DataRouterStateContext.displayName = "DataRouterState";
}
const AwaitContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  AwaitContext.displayName = "Await";
}

/**
 * A Navigator is a "location changer"; it's how you get to different locations.
 *
 * Every history instance conforms to the Navigator interface, but the
 * distinction is useful primarily when it comes to the low-level <Router> API
 * where both the location and a navigator must be provided separately in order
 * to avoid "tearing" that may occur in a suspense-enabled app if the action
 * and/or location were to be read directly from the history instance.
 */

const NavigationContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  NavigationContext.displayName = "Navigation";
}
const LocationContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  LocationContext.displayName = "Location";
}
const RouteContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
if (true) {
  RouteContext.displayName = "Route";
}
const RouteErrorContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);
if (true) {
  RouteErrorContext.displayName = "RouteError";
}

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 *
 * @see https://reactrouter.com/hooks/use-href
 */
function useHref(to, _temp) {
  let {
    relative
  } = _temp === void 0 ? {} : _temp;
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  "useHref() may be used only in the context of a <Router> component.") : 0 : void 0;
  let {
    basename,
    navigator
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to, {
    relative
  });
  let joinedPathname = pathname;

  // If we're operating within a basename, prepend it to the pathname prior
  // to creating the href.  If this is a root navigation, then just use the raw
  // basename which allows the basename to have full control over the presence
  // of a trailing slash on root links
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.joinPaths)([basename, pathname]);
  }
  return navigator.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}

/**
 * Returns true if this component is a descendant of a <Router>.
 *
 * @see https://reactrouter.com/hooks/use-in-router-context
 */
function useInRouterContext() {
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(LocationContext) != null;
}

/**
 * Returns the current location object, which represents the current URL in web
 * browsers.
 *
 * Note: If you're using this it may mean you're doing some of your own
 * "routing" in your app, and we'd like to know what your use case is. We may
 * be able to provide something higher-level to better suit your needs.
 *
 * @see https://reactrouter.com/hooks/use-location
 */
function useLocation() {
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  "useLocation() may be used only in the context of a <Router> component.") : 0 : void 0;
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(LocationContext).location;
}

/**
 * Returns the current navigation action which describes how the router came to
 * the current location, either by a pop, push, or replace on the history stack.
 *
 * @see https://reactrouter.com/hooks/use-navigation-type
 */
function useNavigationType() {
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(LocationContext).navigationType;
}

/**
 * Returns a PathMatch object if the given pattern matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 *
 * @see https://reactrouter.com/hooks/use-match
 */
function useMatch(pattern) {
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  "useMatch() may be used only in the context of a <Router> component.") : 0 : void 0;
  let {
    pathname
  } = useLocation();
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.matchPath)(pattern, pathname), [pathname, pattern]);
}

/**
 * The interface for the navigate() function returned from useNavigate().
 */

const navigateEffectWarning = "You should call navigate() in a React.useEffect(), not when " + "your component is first rendered.";

// Mute warnings for calls to useNavigate in SSR environments
function useIsomorphicLayoutEffect(cb) {
  let isStatic = react__WEBPACK_IMPORTED_MODULE_0__.useContext(NavigationContext).static;
  if (!isStatic) {
    // We should be able to get rid of this once react 18.3 is released
    // See: https://github.com/facebook/react/pull/26395
    // eslint-disable-next-line react-hooks/rules-of-hooks
    react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(cb);
  }
}

/**
 * Returns an imperative method for changing the location. Used by <Link>s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/hooks/use-navigate
 */
function useNavigate() {
  let {
    isDataRoute
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  "useNavigate() may be used only in the context of a <Router> component.") : 0 : void 0;
  let dataRouterContext = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DataRouterContext);
  let {
    basename,
    navigator
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(NavigationContext);
  let {
    matches
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify((0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_getPathContributingMatches)(matches).map(match => match.pathnameBase));
  let activeRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function (to, options) {
    if (options === void 0) {
      options = {};
    }
     true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(activeRef.current, navigateEffectWarning) : 0;

    // Short circuit here since if this happens on first render the navigate
    // is useless because we haven't wired up our history listener yet
    if (!activeRef.current) return;
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }
    let path = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.resolveTo)(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");

    // If we're operating within a basename, prepend it to the pathname prior
    // to handing off to history (but only if we're not in a data router,
    // otherwise it'll prepend the basename inside of the router).
    // If this is a root navigation, then we navigate to the raw basename
    // which allows the basename to have full control over the presence of a
    // trailing slash on root links
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.joinPaths)([basename, path.pathname]);
    }
    (!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
  }, [basename, navigator, routePathnamesJson, locationPathname, dataRouterContext]);
  return navigate;
}
const OutletContext = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createContext(null);

/**
 * Returns the context (if provided) for the child route at this level of the route
 * hierarchy.
 * @see https://reactrouter.com/hooks/use-outlet-context
 */
function useOutletContext() {
  return react__WEBPACK_IMPORTED_MODULE_0__.useContext(OutletContext);
}

/**
 * Returns the element for the child route at this level of the route
 * hierarchy. Used internally by <Outlet> to render child routes.
 *
 * @see https://reactrouter.com/hooks/use-outlet
 */
function useOutlet(context) {
  let outlet = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext).outlet;
  if (outlet) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(OutletContext.Provider, {
      value: context
    }, outlet);
  }
  return outlet;
}

/**
 * Returns an object of key/value pairs of the dynamic params from the current
 * URL that were matched by the route path.
 *
 * @see https://reactrouter.com/hooks/use-params
 */
function useParams() {
  let {
    matches
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  let routeMatch = matches[matches.length - 1];
  return routeMatch ? routeMatch.params : {};
}

/**
 * Resolves the pathname of the given `to` value against the current location.
 *
 * @see https://reactrouter.com/hooks/use-resolved-path
 */
function useResolvedPath(to, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    matches
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify((0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_getPathContributingMatches)(matches).map(match => match.pathnameBase));
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.resolveTo)(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [to, routePathnamesJson, locationPathname, relative]);
}

/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 *
 * @see https://reactrouter.com/hooks/use-routes
 */
function useRoutes(routes, locationArg) {
  return useRoutesImpl(routes, locationArg);
}

// Internal implementation with accept optional param for RouterProvider usage
function useRoutesImpl(routes, locationArg, dataRouterState) {
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of the
  // router loaded. We can help them understand how to avoid that.
  "useRoutes() may be used only in the context of a <Router> component.") : 0 : void 0;
  let {
    navigator
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(NavigationContext);
  let {
    matches: parentMatches
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  if (true) {
    // You won't get a warning about 2 different <Routes> under a <Route>
    // without a trailing *, but this is a best-effort warning anyway since we
    // cannot even give the warning unless they land at the parent route.
    //
    // Example:
    //
    // <Routes>
    //   {/* This route path MUST end with /* because otherwise
    //       it will never match /blog/post/123 */}
    //   <Route path="blog" element={<Blog />} />
    //   <Route path="blog/feed" element={<BlogFeed />} />
    // </Routes>
    //
    // function Blog() {
    //   return (
    //     <Routes>
    //       <Route path="post/:id" element={<Post />} />
    //     </Routes>
    //   );
    // }
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(parentPathname, !parentRoute || parentPath.endsWith("*"), "You rendered descendant <Routes> (or called `useRoutes()`) at " + ("\"" + parentPathname + "\" (under <Route path=\"" + parentPath + "\">) but the ") + "parent route path has no trailing \"*\". This means if you navigate " + "deeper, the parent won't match anymore and therefore the child " + "routes will never render.\n\n" + ("Please change the parent <Route path=\"" + parentPath + "\"> to <Route ") + ("path=\"" + (parentPath === "/" ? "*" : parentPath + "/*") + "\">."));
  }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    var _parsedLocationArg$pa;
    let parsedLocationArg = typeof locationArg === "string" ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.parsePath)(locationArg) : locationArg;
    !(parentPathnameBase === "/" || ((_parsedLocationArg$pa = parsedLocationArg.pathname) == null ? void 0 : _parsedLocationArg$pa.startsWith(parentPathnameBase))) ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "When overriding the location using `<Routes location>` or `useRoutes(routes, location)`, " + "the location pathname must begin with the portion of the URL pathname that was " + ("matched by all parent routes. The current pathname base is \"" + parentPathnameBase + "\" ") + ("but pathname \"" + parsedLocationArg.pathname + "\" was given in the `location` prop.")) : 0 : void 0;
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = parentPathnameBase === "/" ? pathname : pathname.slice(parentPathnameBase.length) || "/";
  let matches = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.matchRoutes)(routes, {
    pathname: remainingPathname
  });
  if (true) {
     true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(parentRoute || matches != null, "No routes matched location \"" + location.pathname + location.search + location.hash + "\" ") : 0;
     true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(matches == null || matches[matches.length - 1].route.element !== undefined || matches[matches.length - 1].route.Component !== undefined, "Matched leaf route at location \"" + location.pathname + location.search + location.hash + "\" " + "does not have an element or Component. This means it will render an <Outlet /> with a " + "null value by default resulting in an \"empty\" page.") : 0;
  }
  let renderedMatches = _renderMatches(matches && matches.map(match => Object.assign({}, match, {
    params: Object.assign({}, parentParams, match.params),
    pathname: (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.joinPaths)([parentPathnameBase,
    // Re-encode pathnames that were decoded inside matchRoutes
    navigator.encodeLocation ? navigator.encodeLocation(match.pathname).pathname : match.pathname]),
    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.joinPaths)([parentPathnameBase,
    // Re-encode pathnames that were decoded inside matchRoutes
    navigator.encodeLocation ? navigator.encodeLocation(match.pathnameBase).pathname : match.pathnameBase])
  })), parentMatches, dataRouterState);

  // When a user passes in a `locationArg`, the associated routes need to
  // be wrapped in a new `LocationContext.Provider` in order for `useLocation`
  // to use the scoped location instead of the global location.
  if (locationArg && renderedMatches) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(LocationContext.Provider, {
      value: {
        location: _extends({
          pathname: "/",
          search: "",
          hash: "",
          state: null,
          key: "default"
        }, location),
        navigationType: _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.Action.Pop
      }
    }, renderedMatches);
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.isRouteErrorResponse)(error) ? error.status + " " + error.statusText : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let codeStyles = {
    padding: "2px 4px",
    backgroundColor: lightgrey
  };
  let devInfo = null;
  if (true) {
    console.error("Error handled by React Router default ErrorBoundary:", error);
    devInfo = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\uD83D\uDCBF Hey developer \uD83D\uDC4B"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", {
      style: codeStyles
    }, "ErrorBoundary"), " or", " ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", {
      style: codeStyles
    }, "errorElement"), " prop on your route."));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", null, "Unexpected Application Error!"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", {
    style: {
      fontStyle: "italic"
    }
  }, message), stack ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", {
    style: preStyles
  }, stack) : null, devInfo);
}
const defaultErrorElement = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DefaultErrorComponent, null);
class RenderErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error: error
    };
  }
  static getDerivedStateFromProps(props, state) {
    // When we get into an error state, the user will likely click "back" to the
    // previous page that didn't have an error. Because this wraps the entire
    // application, that will have no effect--the error page continues to display.
    // This gives us a mechanism to recover from the error when the location changes.
    //
    // Whether we're in an error state or not, we update the location in state
    // so that when we are in an error state, it gets reset when a new location
    // comes in and the user recovers from the error.
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }

    // If we're not changing locations, preserve the location but still surface
    // any new errors that may come through. We retain the existing error, we do
    // this because the error provided from the app state may be cleared without
    // the location changing.
    return {
      error: props.error || state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Router caught the following error during render", error, errorInfo);
  }
  render() {
    return this.state.error ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RouteContext.Provider, {
      value: this.props.routeContext
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RouteErrorContext.Provider, {
      value: this.state.error,
      children: this.props.component
    })) : this.props.children;
  }
}
function RenderedRoute(_ref) {
  let {
    routeContext,
    match,
    children
  } = _ref;
  let dataRouterContext = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DataRouterContext);

  // Track how deep we got in our render pass to emulate SSR componentDidCatch
  // in a DataStaticRouter
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RouteContext.Provider, {
    value: routeContext
  }, children);
}
function _renderMatches(matches, parentMatches, dataRouterState) {
  var _dataRouterState2;
  if (parentMatches === void 0) {
    parentMatches = [];
  }
  if (dataRouterState === void 0) {
    dataRouterState = null;
  }
  if (matches == null) {
    var _dataRouterState;
    if ((_dataRouterState = dataRouterState) != null && _dataRouterState.errors) {
      // Don't bail if we have data router errors so we can render them in the
      // boundary.  Use the pre-matched (or shimmed) matches
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;

  // If we have data errors, trim matches to the highest error boundary
  let errors = (_dataRouterState2 = dataRouterState) == null ? void 0 : _dataRouterState2.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(m => m.route.id && (errors == null ? void 0 : errors[m.route.id]));
    !(errorIndex >= 0) ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "Could not find a matching route for errors on route IDs: " + Object.keys(errors).join(",")) : 0 : void 0;
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error = match.route.id ? errors == null ? void 0 : errors[match.route.id] : null;
    // Only data routers handle errors
    let errorElement = null;
    if (dataRouterState) {
      errorElement = match.route.errorElement || defaultErrorElement;
    }
    let matches = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (match.route.Component) {
        // Note: This is a de-optimized path since React won't re-use the
        // ReactElement since it's identity changes with each new
        // React.createElement call.  We keep this so folks can use
        // `<Route Component={...}>` in `<Routes>` but generally `Component`
        // usage is only advised in `RouterProvider` when we can convert it to
        // `element` ahead of time.
        children = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(match.route.Component, null);
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderedRoute, {
        match: match,
        routeContext: {
          outlet,
          matches,
          isDataRoute: dataRouterState != null
        },
        children: children
      });
    };
    // Only wrap in an error boundary within data router usages when we have an
    // ErrorBoundary/errorElement on this route.  Otherwise let it bubble up to
    // an ancestor ErrorBoundary/errorElement
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderErrorBoundary, {
      location: dataRouterState.location,
      revalidation: dataRouterState.revalidation,
      component: errorElement,
      error: error,
      children: getChildren(),
      routeContext: {
        outlet: null,
        matches,
        isDataRoute: true
      }
    }) : getChildren();
  }, null);
}
var DataRouterHook = /*#__PURE__*/function (DataRouterHook) {
  DataRouterHook["UseBlocker"] = "useBlocker";
  DataRouterHook["UseRevalidator"] = "useRevalidator";
  DataRouterHook["UseNavigateStable"] = "useNavigate";
  return DataRouterHook;
}(DataRouterHook || {});
var DataRouterStateHook = /*#__PURE__*/function (DataRouterStateHook) {
  DataRouterStateHook["UseBlocker"] = "useBlocker";
  DataRouterStateHook["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook["UseActionData"] = "useActionData";
  DataRouterStateHook["UseRouteError"] = "useRouteError";
  DataRouterStateHook["UseNavigation"] = "useNavigation";
  DataRouterStateHook["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook["UseMatches"] = "useMatches";
  DataRouterStateHook["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook["UseRouteId"] = "useRouteId";
  return DataRouterStateHook;
}(DataRouterStateHook || {});
function getDataRouterConsoleError(hookName) {
  return hookName + " must be used within a data router.  See https://reactrouter.com/routers/picking-a-router.";
}
function useDataRouterContext(hookName) {
  let ctx = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DataRouterContext);
  !ctx ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, getDataRouterConsoleError(hookName)) : 0 : void 0;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DataRouterStateContext);
  !state ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, getDataRouterConsoleError(hookName)) : 0 : void 0;
  return state;
}
function useRouteContext(hookName) {
  let route = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  !route ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, getDataRouterConsoleError(hookName)) : 0 : void 0;
  return route;
}

// Internal version with hookName-aware debugging
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, hookName + " can only be used on routes that contain a unique \"id\"") : 0 : void 0;
  return thisRoute.route.id;
}

/**
 * Returns the ID for the nearest contextual route
 */
function useRouteId() {
  return useCurrentRouteId(DataRouterStateHook.UseRouteId);
}

/**
 * Returns the current navigation, defaulting to an "idle" navigation when
 * no navigation is in progress
 */
function useNavigation() {
  let state = useDataRouterState(DataRouterStateHook.UseNavigation);
  return state.navigation;
}

/**
 * Returns a revalidate function for manually triggering revalidation, as well
 * as the current state of any manual revalidations
 */
function useRevalidator() {
  let dataRouterContext = useDataRouterContext(DataRouterHook.UseRevalidator);
  let state = useDataRouterState(DataRouterStateHook.UseRevalidator);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    revalidate: dataRouterContext.router.revalidate,
    state: state.revalidation
  }), [dataRouterContext.router.revalidate, state.revalidation]);
}

/**
 * Returns the active route matches, useful for accessing loaderData for
 * parent/child routes or the route "handle" property
 */
function useMatches() {
  let {
    matches,
    loaderData
  } = useDataRouterState(DataRouterStateHook.UseMatches);
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => matches.map(match => {
    let {
      pathname,
      params
    } = match;
    // Note: This structure matches that created by createUseMatchesMatch
    // in the @remix-run/router , so if you change this please also change
    // that :)  Eventually we'll DRY this up
    return {
      id: match.route.id,
      pathname,
      params,
      data: loaderData[match.route.id],
      handle: match.route.handle
    };
  }), [matches, loaderData]);
}

/**
 * Returns the loader data for the nearest ancestor Route loader
 */
function useLoaderData() {
  let state = useDataRouterState(DataRouterStateHook.UseLoaderData);
  let routeId = useCurrentRouteId(DataRouterStateHook.UseLoaderData);
  if (state.errors && state.errors[routeId] != null) {
    console.error("You cannot `useLoaderData` in an errorElement (routeId: " + routeId + ")");
    return undefined;
  }
  return state.loaderData[routeId];
}

/**
 * Returns the loaderData for the given routeId
 */
function useRouteLoaderData(routeId) {
  let state = useDataRouterState(DataRouterStateHook.UseRouteLoaderData);
  return state.loaderData[routeId];
}

/**
 * Returns the action data for the nearest ancestor Route action
 */
function useActionData() {
  let state = useDataRouterState(DataRouterStateHook.UseActionData);
  let route = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  !route ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "useActionData must be used inside a RouteContext") : 0 : void 0;
  return Object.values((state == null ? void 0 : state.actionData) || {})[0];
}

/**
 * Returns the nearest ancestor Route error, which could be a loader/action
 * error or a render error.  This is intended to be called from your
 * ErrorBoundary/errorElement to display a proper error message.
 */
function useRouteError() {
  var _state$errors;
  let error = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteErrorContext);
  let state = useDataRouterState(DataRouterStateHook.UseRouteError);
  let routeId = useCurrentRouteId(DataRouterStateHook.UseRouteError);

  // If this was a render error, we put it in a RouteError context inside
  // of RenderErrorBoundary
  if (error) {
    return error;
  }

  // Otherwise look for errors from our data router state
  return (_state$errors = state.errors) == null ? void 0 : _state$errors[routeId];
}

/**
 * Returns the happy-path data from the nearest ancestor <Await /> value
 */
function useAsyncValue() {
  let value = react__WEBPACK_IMPORTED_MODULE_0__.useContext(AwaitContext);
  return value == null ? void 0 : value._data;
}

/**
 * Returns the error from the nearest ancestor <Await /> value
 */
function useAsyncError() {
  let value = react__WEBPACK_IMPORTED_MODULE_0__.useContext(AwaitContext);
  return value == null ? void 0 : value._error;
}
let blockerId = 0;

/**
 * Allow the application to block navigations within the SPA and present the
 * user a confirmation dialog to confirm the navigation.  Mostly used to avoid
 * using half-filled form data.  This does not handle hard-reloads or
 * cross-origin navigations.
 */
function useBlocker(shouldBlock) {
  let {
    router,
    basename
  } = useDataRouterContext(DataRouterHook.UseBlocker);
  let state = useDataRouterState(DataRouterStateHook.UseBlocker);
  let [blockerKey, setBlockerKey] = react__WEBPACK_IMPORTED_MODULE_0__.useState("");
  let blockerFunction = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(arg => {
    if (typeof shouldBlock !== "function") {
      return !!shouldBlock;
    }
    if (basename === "/") {
      return shouldBlock(arg);
    }

    // If they provided us a function and we've got an active basename, strip
    // it from the locations we expose to the user to match the behavior of
    // useLocation
    let {
      currentLocation,
      nextLocation,
      historyAction
    } = arg;
    return shouldBlock({
      currentLocation: _extends({}, currentLocation, {
        pathname: (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(currentLocation.pathname, basename) || currentLocation.pathname
      }),
      nextLocation: _extends({}, nextLocation, {
        pathname: (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(nextLocation.pathname, basename) || nextLocation.pathname
      }),
      historyAction
    });
  }, [basename, shouldBlock]);

  // This effect is in charge of blocker key assignment and deletion (which is
  // tightly coupled to the key)
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    let key = String(++blockerId);
    setBlockerKey(key);
    return () => router.deleteBlocker(key);
  }, [router]);

  // This effect handles assigning the blockerFunction.  This is to handle
  // unstable blocker function identities, and happens only after the prior
  // effect so we don't get an orphaned blockerFunction in the router with a
  // key of "".  Until then we just have the IDLE_BLOCKER.
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (blockerKey !== "") {
      router.getBlocker(blockerKey, blockerFunction);
    }
  }, [router, blockerKey, blockerFunction]);

  // Prefer the blocker from `state` not `router.state` since DataRouterContext
  // is memoized so this ensures we update on blocker state updates
  return blockerKey && state.blockers.has(blockerKey) ? state.blockers.get(blockerKey) : _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.IDLE_BLOCKER;
}

/**
 * Stable version of useNavigate that is used when we are in the context of
 * a RouterProvider.
 */
function useNavigateStable() {
  let {
    router
  } = useDataRouterContext(DataRouterHook.UseNavigateStable);
  let id = useCurrentRouteId(DataRouterStateHook.UseNavigateStable);
  let activeRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(function (to, options) {
    if (options === void 0) {
      options = {};
    }
     true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(activeRef.current, navigateEffectWarning) : 0;

    // Short circuit here since if this happens on first render the navigate
    // is useless because we haven't wired up our router subscriber yet
    if (!activeRef.current) return;
    if (typeof to === "number") {
      router.navigate(to);
    } else {
      router.navigate(to, _extends({
        fromRouteId: id
      }, options));
    }
  }, [router, id]);
  return navigate;
}
const alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
     true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(false, message) : 0;
  }
}

/**
  Webpack + React 17 fails to compile on any of the following because webpack
  complains that `startTransition` doesn't exist in `React`:
  * import { startTransition } from "react"
  * import * as React from from "react";
    "startTransition" in React ? React.startTransition(() => setState()) : setState()
  * import * as React from from "react";
    "startTransition" in React ? React["startTransition"](() => setState()) : setState()

  Moving it to a constant such as the following solves the Webpack/React 17 issue:
  * import * as React from from "react";
    const START_TRANSITION = "startTransition";
    START_TRANSITION in React ? React[START_TRANSITION](() => setState()) : setState()

  However, that introduces webpack/terser minification issues in production builds
  in React 18 where minification/obfuscation ends up removing the call of
  React.startTransition entirely from the first half of the ternary.  Grabbing
  this exported reference once up front resolves that issue.

  See https://github.com/remix-run/react-router/issues/10579
*/
const START_TRANSITION = "startTransition";
const startTransitionImpl = react__WEBPACK_IMPORTED_MODULE_0__[START_TRANSITION];

/**
 * Given a Remix Router instance, render the appropriate UI
 */
function RouterProvider(_ref) {
  let {
    fallbackElement,
    router,
    future
  } = _ref;
  // Need to use a layout effect here so we are subscribed early enough to
  // pick up on any render-driven redirects/navigations (useEffect/<Navigate>)
  let [state, setStateImpl] = react__WEBPACK_IMPORTED_MODULE_0__.useState(router.state);
  let {
    v7_startTransition
  } = future || {};
  let setState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newState => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => router.subscribe(setState), [router, setState]);
  let navigator = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    return {
      createHref: router.createHref,
      encodeLocation: router.encodeLocation,
      go: n => router.navigate(n),
      push: (to, state, opts) => router.navigate(to, {
        state,
        preventScrollReset: opts == null ? void 0 : opts.preventScrollReset
      }),
      replace: (to, state, opts) => router.navigate(to, {
        replace: true,
        state,
        preventScrollReset: opts == null ? void 0 : opts.preventScrollReset
      })
    };
  }, [router]);
  let basename = router.basename || "/";
  let dataRouterContext = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    router,
    navigator,
    static: false,
    basename
  }), [router, navigator, basename]);

  // The fragment and {null} here are important!  We need them to keep React 18's
  // useId happy when we are server-rendering since we may have a <script> here
  // containing the hydrated server-side staticContext (from StaticRouterProvider).
  // useId relies on the component tree structure to generate deterministic id's
  // so we need to ensure it remains the same on the client even though
  // we don't need the <script> tag
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DataRouterContext.Provider, {
    value: dataRouterContext
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DataRouterStateContext.Provider, {
    value: state
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Router, {
    basename: basename,
    location: state.location,
    navigationType: state.historyAction,
    navigator: navigator
  }, state.initialized ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(DataRoutes, {
    routes: router.routes,
    state: state
  }) : fallbackElement))), null);
}
function DataRoutes(_ref2) {
  let {
    routes,
    state
  } = _ref2;
  return useRoutesImpl(routes, undefined, state);
}
/**
 * A <Router> that stores all entries in memory.
 *
 * @see https://reactrouter.com/router-components/memory-router
 */
function MemoryRouter(_ref3) {
  let {
    basename,
    children,
    initialEntries,
    initialIndex,
    future
  } = _ref3;
  let historyRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef();
  if (historyRef.current == null) {
    historyRef.current = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.createMemoryHistory)({
      initialEntries,
      initialIndex,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(newState => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Router, {
    basename: basename,
    children: children,
    location: state.location,
    navigationType: state.action,
    navigator: history
  });
}
/**
 * Changes the current location.
 *
 * Note: This API is mostly useful in React.Component subclasses that are not
 * able to use hooks. In functional components, we recommend you use the
 * `useNavigate` hook instead.
 *
 * @see https://reactrouter.com/components/navigate
 */
function Navigate(_ref4) {
  let {
    to,
    replace,
    state,
    relative
  } = _ref4;
  !useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, // TODO: This error is probably because they somehow have 2 versions of
  // the router loaded. We can help them understand how to avoid that.
  "<Navigate> may be used only in the context of a <Router> component.") : 0 : void 0;
   true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(!react__WEBPACK_IMPORTED_MODULE_0__.useContext(NavigationContext).static, "<Navigate> must not be used on the initial render in a <StaticRouter>. " + "This is a no-op, but you should modify your code so the <Navigate> is " + "only ever rendered in response to some user interaction or state change.") : 0;
  let {
    matches
  } = react__WEBPACK_IMPORTED_MODULE_0__.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let navigate = useNavigate();

  // Resolve the path outside of the effect so that when effects run twice in
  // StrictMode they navigate to the same place
  let path = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.resolveTo)(to, (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_getPathContributingMatches)(matches).map(match => match.pathnameBase), locationPathname, relative === "path");
  let jsonPath = JSON.stringify(path);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => navigate(JSON.parse(jsonPath), {
    replace,
    state,
    relative
  }), [navigate, jsonPath, relative, replace, state]);
  return null;
}
/**
 * Renders the child route's element, if there is one.
 *
 * @see https://reactrouter.com/components/outlet
 */
function Outlet(props) {
  return useOutlet(props.context);
}
/**
 * Declares an element that should be rendered at a certain URL path.
 *
 * @see https://reactrouter.com/components/route
 */
function Route(_props) {
   true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "A <Route> is only ever to be used as the child of <Routes> element, " + "never rendered directly. Please wrap your <Route> in a <Routes>.") : 0 ;
}
/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 *
 * @see https://reactrouter.com/router-components/router
 */
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.Action.Pop,
    navigator,
    static: staticProp = false
  } = _ref5;
  !!useInRouterContext() ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "You cannot render a <Router> inside another <Router>." + " You should never have more than one in your app.") : 0 : void 0;

  // Preserve trailing slashes on basename, so we can let the user control
  // the enforcement of trailing slashes throughout the app
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({
    basename,
    navigator,
    static: staticProp
  }), [basename, navigator, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.parsePath)(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    let trailingPathname = (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.stripBasename)(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
   true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(locationContext != null, "<Router basename=\"" + basename + "\"> is not able to match the URL " + ("\"" + pathname + search + hash + "\" because it does not start with the ") + "basename, so the <Router> won't render anything.") : 0;
  if (locationContext == null) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(NavigationContext.Provider, {
    value: navigationContext
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(LocationContext.Provider, {
    children: children,
    value: locationContext
  }));
}
/**
 * A container for a nested tree of <Route> elements that renders the branch
 * that best matches the current location.
 *
 * @see https://reactrouter.com/components/routes
 */
function Routes(_ref6) {
  let {
    children,
    location
  } = _ref6;
  return useRoutes(createRoutesFromChildren(children), location);
}
/**
 * Component to use for rendering lazily loaded data from returning defer()
 * in a loader function
 */
function Await(_ref7) {
  let {
    children,
    errorElement,
    resolve
  } = _ref7;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AwaitErrorBoundary, {
    resolve: resolve,
    errorElement: errorElement
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ResolveAwait, null, children));
}
var AwaitRenderStatus = /*#__PURE__*/function (AwaitRenderStatus) {
  AwaitRenderStatus[AwaitRenderStatus["pending"] = 0] = "pending";
  AwaitRenderStatus[AwaitRenderStatus["success"] = 1] = "success";
  AwaitRenderStatus[AwaitRenderStatus["error"] = 2] = "error";
  return AwaitRenderStatus;
}(AwaitRenderStatus || {});
const neverSettledPromise = new Promise(() => {});
class AwaitErrorBoundary extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("<Await> caught the following error during render", error, errorInfo);
  }
  render() {
    let {
      children,
      errorElement,
      resolve
    } = this.props;
    let promise = null;
    let status = AwaitRenderStatus.pending;
    if (!(resolve instanceof Promise)) {
      // Didn't get a promise - provide as a resolved promise
      status = AwaitRenderStatus.success;
      promise = Promise.resolve();
      Object.defineProperty(promise, "_tracked", {
        get: () => true
      });
      Object.defineProperty(promise, "_data", {
        get: () => resolve
      });
    } else if (this.state.error) {
      // Caught a render error, provide it as a rejected promise
      status = AwaitRenderStatus.error;
      let renderError = this.state.error;
      promise = Promise.reject().catch(() => {}); // Avoid unhandled rejection warnings
      Object.defineProperty(promise, "_tracked", {
        get: () => true
      });
      Object.defineProperty(promise, "_error", {
        get: () => renderError
      });
    } else if (resolve._tracked) {
      // Already tracked promise - check contents
      promise = resolve;
      status = promise._error !== undefined ? AwaitRenderStatus.error : promise._data !== undefined ? AwaitRenderStatus.success : AwaitRenderStatus.pending;
    } else {
      // Raw (untracked) promise - track it
      status = AwaitRenderStatus.pending;
      Object.defineProperty(resolve, "_tracked", {
        get: () => true
      });
      promise = resolve.then(data => Object.defineProperty(resolve, "_data", {
        get: () => data
      }), error => Object.defineProperty(resolve, "_error", {
        get: () => error
      }));
    }
    if (status === AwaitRenderStatus.error && promise._error instanceof _remix_run_router__WEBPACK_IMPORTED_MODULE_1__.AbortedDeferredError) {
      // Freeze the UI by throwing a never resolved promise
      throw neverSettledPromise;
    }
    if (status === AwaitRenderStatus.error && !errorElement) {
      // No errorElement, throw to the nearest route-level error boundary
      throw promise._error;
    }
    if (status === AwaitRenderStatus.error) {
      // Render via our errorElement
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AwaitContext.Provider, {
        value: promise,
        children: errorElement
      });
    }
    if (status === AwaitRenderStatus.success) {
      // Render children with resolved value
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(AwaitContext.Provider, {
        value: promise,
        children: children
      });
    }

    // Throw to the suspense boundary
    throw promise;
  }
}

/**
 * @private
 * Indirection to leverage useAsyncValue for a render-prop API on <Await>
 */
function ResolveAwait(_ref8) {
  let {
    children
  } = _ref8;
  let data = useAsyncValue();
  let toRender = typeof children === "function" ? children(data) : children;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, toRender);
}

///////////////////////////////////////////////////////////////////////////////
// UTILS
///////////////////////////////////////////////////////////////////////////////

/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 *
 * @see https://reactrouter.com/utils/create-routes-from-children
 */
function createRoutesFromChildren(children, parentPath) {
  if (parentPath === void 0) {
    parentPath = [];
  }
  let routes = [];
  react__WEBPACK_IMPORTED_MODULE_0__.Children.forEach(children, (element, index) => {
    if (! /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }
    let treePath = [...parentPath, index];
    if (element.type === react__WEBPACK_IMPORTED_MODULE_0__.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(routes, createRoutesFromChildren(element.props.children, treePath));
      return;
    }
    !(element.type === Route) ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "[" + (typeof element.type === "string" ? element.type : element.type.name) + "] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>") : 0 : void 0;
    !(!element.props.index || !element.props.children) ?  true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_invariant)(false, "An index route cannot have child routes.") : 0 : void 0;
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      Component: element.props.Component,
      index: element.props.index,
      path: element.props.path,
      loader: element.props.loader,
      action: element.props.action,
      errorElement: element.props.errorElement,
      ErrorBoundary: element.props.ErrorBoundary,
      hasErrorBoundary: element.props.ErrorBoundary != null || element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
      lazy: element.props.lazy
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children, treePath);
    }
    routes.push(route);
  });
  return routes;
}

/**
 * Renders the result of `matchRoutes()` into a React element.
 */
function renderMatches(matches) {
  return _renderMatches(matches);
}

function mapRouteProperties(route) {
  let updates = {
    // Note: this check also occurs in createRoutesFromChildren so update
    // there if you change this -- please and thank you!
    hasErrorBoundary: route.ErrorBoundary != null || route.errorElement != null
  };
  if (route.Component) {
    if (true) {
      if (route.element) {
         true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(false, "You should not include both `Component` and `element` on your route - " + "`Component` will be used.") : 0;
      }
    }
    Object.assign(updates, {
      element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(route.Component),
      Component: undefined
    });
  }
  if (route.ErrorBoundary) {
    if (true) {
      if (route.errorElement) {
         true ? (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.UNSAFE_warning)(false, "You should not include both `ErrorBoundary` and `errorElement` on your route - " + "`ErrorBoundary` will be used.") : 0;
      }
    }
    Object.assign(updates, {
      errorElement: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(route.ErrorBoundary),
      ErrorBoundary: undefined
    });
  }
  return updates;
}
function createMemoryRouter(routes, opts) {
  return (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.createRouter)({
    basename: opts == null ? void 0 : opts.basename,
    future: _extends({}, opts == null ? void 0 : opts.future, {
      v7_prependBasename: true
    }),
    history: (0,_remix_run_router__WEBPACK_IMPORTED_MODULE_1__.createMemoryHistory)({
      initialEntries: opts == null ? void 0 : opts.initialEntries,
      initialIndex: opts == null ? void 0 : opts.initialIndex
    }),
    hydrationData: opts == null ? void 0 : opts.hydrationData,
    routes,
    mapRouteProperties
  }).initialize();
}


//# sourceMappingURL=index.js.map


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ (function(module) {

"use strict";
module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ (function(module) {

"use strict";
module.exports = window["ReactDOM"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ (function(module) {

"use strict";
module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ (function(module) {

"use strict";
module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ (function(module) {

"use strict";
module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!**********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \**********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _arrayLikeToArray; }
/* harmony export */ });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _arrayWithHoles; }
/* harmony export */ });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _arrayWithoutHoles; }
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "../node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!***************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \***************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _assertThisInitialized; }
/* harmony export */ });
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _classCallCheck; }
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _createClass; }
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/createSuper.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/createSuper.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _createSuper; }
/* harmony export */ });
/* harmony import */ var _getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNativeReflectConstruct.js */ "../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js");
/* harmony import */ var _possibleConstructorReturn_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./possibleConstructorReturn.js */ "../node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");



function _createSuper(Derived) {
  var hasNativeReflectConstruct = (0,_isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__["default"])();
  return function _createSuperInternal() {
    var Super = (0,_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = (0,_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return (0,_possibleConstructorReturn_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this, result);
  };
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _defineProperty; }
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "../node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperty(obj, key, value) {
  key = (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/extends.js":
/*!*************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _extends; }
/* harmony export */ });
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _getPrototypeOf; }
/* harmony export */ });
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!**************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _inherits; }
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(subClass, superClass);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js":
/*!******************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js ***!
  \******************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _isNativeReflectConstruct; }
/* harmony export */ });
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _iterableToArray; }
/* harmony export */ });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!**************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \**************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _iterableToArrayLimit; }
/* harmony export */ });
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!*********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _nonIterableRest; }
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _nonIterableSpread; }
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/objectSpread2.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/objectSpread2.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _objectSpread2; }
/* harmony export */ });
/* harmony import */ var _defineProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defineProperty.js */ "../node_modules/@babel/runtime/helpers/esm/defineProperty.js");

function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      (0,_defineProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"])(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js":
/*!*****************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _objectWithoutProperties; }
/* harmony export */ });
/* harmony import */ var _objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectWithoutPropertiesLoose.js */ "../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js");

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = (0,_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_0__["default"])(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js":
/*!**********************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _objectWithoutPropertiesLoose; }
/* harmony export */ });
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!*******************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _possibleConstructorReturn; }
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(self, call) {
  if (call && ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return (0,_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(self);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _setPrototypeOf; }
/* harmony export */ });
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _slicedToArray; }
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "../node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "../node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "../node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "../node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!***********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _toConsumableArray; }
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "../node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "../node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "../node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "../node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/toPrimitive.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/toPrimitive.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _toPrimitive; }
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");

function _toPrimitive(input, hint) {
  if ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/toPropertyKey.js":
/*!*******************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/toPropertyKey.js ***!
  \*******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _toPropertyKey; }
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "../node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toPrimitive.js */ "../node_modules/@babel/runtime/helpers/esm/toPrimitive.js");


function _toPropertyKey(arg) {
  var key = (0,_toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arg, "string");
  return (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(key) === "symbol" ? key : String(key);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _typeof; }
/* harmony export */ });
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!********************************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \********************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ _unsupportedIterableToArray; }
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "../node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!*************************!*\
  !*** ./src/settings.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-router-dom */ "../node_modules/react-router-dom/dist/index.js");
/* harmony import */ var _settings_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./settings-store */ "./src/settings-store.js");
/* harmony import */ var _components_settings_Layout__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/settings/Layout */ "./src/components/settings/Layout.js");
/* harmony import */ var antd_dist_antd_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd/dist/antd.css */ "../node_modules/antd/dist/antd.css");
/* harmony import */ var _admin_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./admin.css */ "./src/admin.css");





// import moduleStore from './modules-store';



(0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.register)(_settings_store__WEBPACK_IMPORTED_MODULE_2__["default"]);
// register( moduleStore );

(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)((0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.StrictMode, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_router_dom__WEBPACK_IMPORTED_MODULE_6__.HashRouter, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_settings_Layout__WEBPACK_IMPORTED_MODULE_3__["default"], null))), document.getElementById("sbooster-settings-page"));
}();
/******/ })()
;
//# sourceMappingURL=settings.js.map