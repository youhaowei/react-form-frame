Object.defineProperty(exports,"__esModule",{value:!0});var slice=require("./slice-f520d051.js"),React=require("react");function _interopDefaultLegacy(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}require("react-dom");var React__default=_interopDefaultLegacy(React),getStore=function(){return slice.configureStore({reducer:slice.formSlice.reducer,devTools:{name:"Form"},middleware:slice.getDefaultMiddleware({serializableCheck:{isSerializable:function(e){return"function"==typeof e||slice.isPlain(e)}}})})},FormProvider=function(e){e=e.children;return React__default.default.createElement(slice.Provider,{store:getStore()},e)};FormProvider.propTypes={children:slice.propTypes.element};var withForm=function(i){return function(e){slice._inherits(t,e);var r=slice._createSuper(t);function t(){return slice._classCallCheck(this,t),r.apply(this,arguments)}return slice._createClass(t,[{key:"render",value:function(){return React__default.default.createElement(FormProvider,null,React__default.default.createElement(i,this.props))}}]),t}(React__default.default.PureComponent)};exports.default=FormProvider,exports.withForm=withForm;
//# sourceMappingURL=provider.js.map
