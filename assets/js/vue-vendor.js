(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/vue-property-decorator/lib/vue-property-decorator.js
  var vue_property_decorator_exports = {};
  __export(vue_property_decorator_exports, {
    Component: () => vue_class_component_esm_default,
    Emit: () => Emit,
    Inject: () => Inject,
    InjectReactive: () => InjectReactive,
    Mixins: () => mixins,
    Model: () => Model,
    Prop: () => Prop,
    PropSync: () => PropSync,
    Provide: () => Provide,
    ProvideReactive: () => ProvideReactive,
    Ref: () => Ref,
    Vue: () => vue_shim_default,
    Watch: () => Watch
  });

  // vue-shim.js
  var V = (typeof window !== "undefined" ? window : self).Vue;
  var vue_shim_default = V;

  // node_modules/vue-class-component/dist/vue-class-component.esm.js
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function(obj2) {
        return typeof obj2;
      };
    } else {
      _typeof = function(obj2) {
        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
      };
    }
    return _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++)
        arr2[i] = arr[i];
      return arr2;
    }
  }
  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]")
      return Array.from(iter);
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }
  function reflectionIsSupported() {
    return typeof Reflect !== "undefined" && Reflect.defineMetadata && Reflect.getOwnMetadataKeys;
  }
  function copyReflectionMetadata(to, from) {
    forwardMetadata(to, from);
    Object.getOwnPropertyNames(from.prototype).forEach(function(key) {
      forwardMetadata(to.prototype, from.prototype, key);
    });
    Object.getOwnPropertyNames(from).forEach(function(key) {
      forwardMetadata(to, from, key);
    });
  }
  function forwardMetadata(to, from, propertyKey) {
    var metaKeys = propertyKey ? Reflect.getOwnMetadataKeys(from, propertyKey) : Reflect.getOwnMetadataKeys(from);
    metaKeys.forEach(function(metaKey) {
      var metadata = propertyKey ? Reflect.getOwnMetadata(metaKey, from, propertyKey) : Reflect.getOwnMetadata(metaKey, from);
      if (propertyKey) {
        Reflect.defineMetadata(metaKey, metadata, to, propertyKey);
      } else {
        Reflect.defineMetadata(metaKey, metadata, to);
      }
    });
  }
  var fakeArray = {
    __proto__: []
  };
  var hasProto = fakeArray instanceof Array;
  function createDecorator(factory) {
    return function(target, key, index) {
      var Ctor = typeof target === "function" ? target : target.constructor;
      if (!Ctor.__decorators__) {
        Ctor.__decorators__ = [];
      }
      if (typeof index !== "number") {
        index = void 0;
      }
      Ctor.__decorators__.push(function(options) {
        return factory(options, key, index);
      });
    };
  }
  function mixins() {
    for (var _len = arguments.length, Ctors = new Array(_len), _key = 0; _key < _len; _key++) {
      Ctors[_key] = arguments[_key];
    }
    return vue_shim_default.extend({
      mixins: Ctors
    });
  }
  function isPrimitive(value) {
    var type = _typeof(value);
    return value == null || type !== "object" && type !== "function";
  }
  function warn(message) {
    if (typeof console !== "undefined") {
      console.warn("[vue-class-component] " + message);
    }
  }
  function collectDataFromConstructor(vm, Component2) {
    var originalInit = Component2.prototype._init;
    Component2.prototype._init = function() {
      var _this = this;
      var keys = Object.getOwnPropertyNames(vm);
      if (vm.$options.props) {
        for (var key in vm.$options.props) {
          if (!vm.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
      }
      keys.forEach(function(key2) {
        Object.defineProperty(_this, key2, {
          get: function get() {
            return vm[key2];
          },
          set: function set(value) {
            vm[key2] = value;
          },
          configurable: true
        });
      });
    };
    var data = new Component2();
    Component2.prototype._init = originalInit;
    var plainData = {};
    Object.keys(data).forEach(function(key) {
      if (data[key] !== void 0) {
        plainData[key] = data[key];
      }
    });
    if (true) {
      if (!(Component2.prototype instanceof vue_shim_default) && Object.keys(plainData).length > 0) {
        warn("Component class must inherit Vue or its descendant class when class property is used.");
      }
    }
    return plainData;
  }
  var $internalHooks = [
    "data",
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeDestroy",
    "destroyed",
    "beforeUpdate",
    "updated",
    "activated",
    "deactivated",
    "render",
    "errorCaptured",
    "serverPrefetch"
    // 2.6
  ];
  function componentFactory(Component2) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    options.name = options.name || Component2._componentTag || Component2.name;
    var proto = Component2.prototype;
    Object.getOwnPropertyNames(proto).forEach(function(key) {
      if (key === "constructor") {
        return;
      }
      if ($internalHooks.indexOf(key) > -1) {
        options[key] = proto[key];
        return;
      }
      var descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor.value !== void 0) {
        if (typeof descriptor.value === "function") {
          (options.methods || (options.methods = {}))[key] = descriptor.value;
        } else {
          (options.mixins || (options.mixins = [])).push({
            data: function data() {
              return _defineProperty({}, key, descriptor.value);
            }
          });
        }
      } else if (descriptor.get || descriptor.set) {
        (options.computed || (options.computed = {}))[key] = {
          get: descriptor.get,
          set: descriptor.set
        };
      }
    });
    (options.mixins || (options.mixins = [])).push({
      data: function data() {
        return collectDataFromConstructor(this, Component2);
      }
    });
    var decorators = Component2.__decorators__;
    if (decorators) {
      decorators.forEach(function(fn) {
        return fn(options);
      });
      delete Component2.__decorators__;
    }
    var superProto = Object.getPrototypeOf(Component2.prototype);
    var Super = superProto instanceof vue_shim_default ? superProto.constructor : vue_shim_default;
    var Extended = Super.extend(options);
    forwardStaticMembers(Extended, Component2, Super);
    if (reflectionIsSupported()) {
      copyReflectionMetadata(Extended, Component2);
    }
    return Extended;
  }
  var reservedPropertyNames = [
    // Unique id
    "cid",
    // Super Vue constructor
    "super",
    // Component options that will be used by the component
    "options",
    "superOptions",
    "extendOptions",
    "sealedOptions",
    // Private assets
    "component",
    "directive",
    "filter"
  ];
  var shouldIgnore = {
    prototype: true,
    arguments: true,
    callee: true,
    caller: true
  };
  function forwardStaticMembers(Extended, Original, Super) {
    Object.getOwnPropertyNames(Original).forEach(function(key) {
      if (shouldIgnore[key]) {
        return;
      }
      var extendedDescriptor = Object.getOwnPropertyDescriptor(Extended, key);
      if (extendedDescriptor && !extendedDescriptor.configurable) {
        return;
      }
      var descriptor = Object.getOwnPropertyDescriptor(Original, key);
      if (!hasProto) {
        if (key === "cid") {
          return;
        }
        var superDescriptor = Object.getOwnPropertyDescriptor(Super, key);
        if (!isPrimitive(descriptor.value) && superDescriptor && superDescriptor.value === descriptor.value) {
          return;
        }
      }
      if (reservedPropertyNames.indexOf(key) >= 0) {
        warn("Static property name '".concat(key, "' declared on class '").concat(Original.name, "' ") + "conflicts with reserved property name of Vue internal. It may cause unexpected behavior of the component. Consider renaming the property.");
      }
      Object.defineProperty(Extended, key, descriptor);
    });
  }
  function Component(options) {
    if (typeof options === "function") {
      return componentFactory(options);
    }
    return function(Component2) {
      return componentFactory(Component2, options);
    };
  }
  Component.registerHooks = function registerHooks(keys) {
    $internalHooks.push.apply($internalHooks, _toConsumableArray(keys));
  };
  var vue_class_component_esm_default = Component;

  // node_modules/vue-property-decorator/lib/vue-property-decorator.js
  var reactiveInjectKey = "__reactiveInject__";
  function Inject(options) {
    return createDecorator(function(componentOptions, key) {
      if (typeof componentOptions.inject === "undefined") {
        componentOptions.inject = {};
      }
      if (!Array.isArray(componentOptions.inject)) {
        componentOptions.inject[key] = options || key;
      }
    });
  }
  function InjectReactive(options) {
    return createDecorator(function(componentOptions, key) {
      if (typeof componentOptions.inject === "undefined") {
        componentOptions.inject = {};
      }
      if (!Array.isArray(componentOptions.inject)) {
        var fromKey_1 = !!options ? options.from || options : key;
        var defaultVal_1 = !!options && options.default || void 0;
        if (!componentOptions.computed)
          componentOptions.computed = {};
        componentOptions.computed[key] = function() {
          var obj = this[reactiveInjectKey];
          return obj ? obj[fromKey_1] : defaultVal_1;
        };
        componentOptions.inject[reactiveInjectKey] = reactiveInjectKey;
      }
    });
  }
  function produceProvide(original) {
    var provide = function() {
      var _this = this;
      var rv = typeof original === "function" ? original.call(this) : original;
      rv = Object.create(rv || null);
      rv[reactiveInjectKey] = this[reactiveInjectKey] || {};
      for (var i in provide.managed) {
        rv[provide.managed[i]] = this[i];
      }
      var _loop_1 = function(i2) {
        rv[provide.managedReactive[i2]] = this_1[i2];
        Object.defineProperty(rv[reactiveInjectKey], provide.managedReactive[i2], {
          enumerable: true,
          get: function() {
            return _this[i2];
          }
        });
      };
      var this_1 = this;
      for (var i in provide.managedReactive) {
        _loop_1(i);
      }
      return rv;
    };
    provide.managed = {};
    provide.managedReactive = {};
    return provide;
  }
  function needToProduceProvide(original) {
    return typeof original !== "function" || !original.managed && !original.managedReactive;
  }
  function Provide(key) {
    return createDecorator(function(componentOptions, k) {
      var provide = componentOptions.provide;
      if (needToProduceProvide(provide)) {
        provide = componentOptions.provide = produceProvide(provide);
      }
      provide.managed[k] = key || k;
    });
  }
  function ProvideReactive(key) {
    return createDecorator(function(componentOptions, k) {
      var provide = componentOptions.provide;
      if (!Array.isArray(componentOptions.inject)) {
        componentOptions.inject = componentOptions.inject || {};
        componentOptions.inject[reactiveInjectKey] = {
          from: reactiveInjectKey,
          default: {}
        };
      }
      if (needToProduceProvide(provide)) {
        provide = componentOptions.provide = produceProvide(provide);
      }
      provide.managedReactive[k] = key || k;
    });
  }
  var reflectMetadataIsSupported = typeof Reflect !== "undefined" && typeof Reflect.getMetadata !== "undefined";
  function applyMetadata(options, target, key) {
    if (reflectMetadataIsSupported) {
      if (!Array.isArray(options) && typeof options !== "function" && typeof options.type === "undefined") {
        options.type = Reflect.getMetadata("design:type", target, key);
      }
    }
  }
  function Model(event, options) {
    if (options === void 0) {
      options = {};
    }
    return function(target, key) {
      applyMetadata(options, target, key);
      createDecorator(function(componentOptions, k) {
        ;
        (componentOptions.props || (componentOptions.props = {}))[k] = options;
        componentOptions.model = { prop: k, event: event || k };
      })(target, key);
    };
  }
  function Prop(options) {
    if (options === void 0) {
      options = {};
    }
    return function(target, key) {
      applyMetadata(options, target, key);
      createDecorator(function(componentOptions, k) {
        ;
        (componentOptions.props || (componentOptions.props = {}))[k] = options;
      })(target, key);
    };
  }
  function PropSync(propName, options) {
    if (options === void 0) {
      options = {};
    }
    return function(target, key) {
      applyMetadata(options, target, key);
      createDecorator(function(componentOptions, k) {
        ;
        (componentOptions.props || (componentOptions.props = {}))[propName] = options;
        (componentOptions.computed || (componentOptions.computed = {}))[k] = {
          get: function() {
            return this[propName];
          },
          set: function(value) {
            this.$emit("update:" + propName, value);
          }
        };
      })(target, key);
    };
  }
  function Watch(path, options) {
    if (options === void 0) {
      options = {};
    }
    var _a = options.deep, deep = _a === void 0 ? false : _a, _b = options.immediate, immediate = _b === void 0 ? false : _b;
    return createDecorator(function(componentOptions, handler) {
      if (typeof componentOptions.watch !== "object") {
        componentOptions.watch = /* @__PURE__ */ Object.create(null);
      }
      var watch = componentOptions.watch;
      if (typeof watch[path] === "object" && !Array.isArray(watch[path])) {
        watch[path] = [watch[path]];
      } else if (typeof watch[path] === "undefined") {
        watch[path] = [];
      }
      watch[path].push({ handler, deep, immediate });
    });
  }
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = function(str) {
    return str.replace(hyphenateRE, "-$1").toLowerCase();
  };
  function Emit(event) {
    return function(_target, key, descriptor) {
      key = hyphenate(key);
      var original = descriptor.value;
      descriptor.value = function emitter() {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var emit = function(returnValue2) {
          if (returnValue2 !== void 0)
            args.unshift(returnValue2);
          _this.$emit.apply(_this, [event || key].concat(args));
        };
        var returnValue = original.apply(this, args);
        if (isPromise(returnValue)) {
          returnValue.then(function(returnValue2) {
            emit(returnValue2);
          });
        } else {
          emit(returnValue);
        }
        return returnValue;
      };
    };
  }
  function Ref(refKey) {
    return createDecorator(function(options, key) {
      options.computed = options.computed || {};
      options.computed[key] = {
        cache: false,
        get: function() {
          return this.$refs[refKey || key];
        }
      };
    });
  }
  function isPromise(obj) {
    return obj instanceof Promise || obj && typeof obj.then === "function";
  }

  // vpd-entry.js
  (typeof window !== "undefined" ? window : self)["vue-property-decorator"] = vue_property_decorator_exports;
})();
/*! Bundled license information:

vue-class-component/dist/vue-class-component.esm.js:
  (**
    * vue-class-component v7.2.6
    * (c) 2015-present Evan You
    * @license MIT
    *)
*/
