var GraphData = Class.extend({
  defaults: {
    data: [ ],
    onReset: null,
    onError: function() { },
    reverseOrder: false,
    apiHost: null,
    endpointAlias: null,
    apiConfig: null,
    isWheel: false,
    throttle: 0,
    minDifference: 1500
  },
  init: function(options) {
    // _.bindAll(this, '__setSteps');
    this.config = _.extend({ }, this.defaults, options);
    this.data = this.config.data;
    this.steps = null;
    this.endpointAlias = this.config.endpointAlias;
    if(this.config.apiConfig && this.endpointAlias !== null) {
      this.reset();
    }
  },
  filterByRange: function(opts) {
    this.endpointAlias = opts.alias;
    this.steps = opts.steps;
    this.rangeUnit = opts.rangeUnit;
    this.rangeValue = opts.rangeValue;
    this.reset();
  },
  reset: function() {
    var _this = this;
    this.loading = true;
    var _url = '';

    if(this.config.apiConfig.host) _url += this.config.apiConfig.host;
    if(this.config.apiConfig.uriPrefix) _url += '/' + this.config.apiConfig.uriPrefix;
    _url += '/' + this.endpointAlias + '.json';

    $.ajax({
      url: _url,
      dataType: 'json',
      cache: false,
      success: function(data, status, xhr) {
        _this.loading = false;

        var _data = [ ];
        var i = 0;
        var _obj = { };
        var momentA, momentB, diff;

        for(i in data) {
          i = parseInt(i, null);

          if(i && _this.config.isWheel) {
            momentA = moment(data[i].timestamp);
            momentB = moment(data[i - 1].timestamp);
            diff = momentA.diff(momentB, 'minutes');
            while(diff > 5) {
              _obj = {};
              for(prop in data[i-1]) {
                _obj[prop] = null;
              }
              momentB = momentB.add('minutes', 5);
              diff = momentA.diff(momentB, 'minutes');
              _obj.timestamp = momentB.valueOf();
              _data.push(_obj);
            }

          }


          if(!_this.config.throttle || (i % _this.config.throttle === 0) || i === 0 || i === null || (i+1 === data.length)) {
            _data.push(data[i]);
          }
        }

        if(_data.length && !_.isEqual(_data, _this.data)) {
          if(_this.config.reverseOrder && _data[0].timestamp < _data[_data.length-1].timestamp) {
            _data.reverse();
          }
          _this.data = _data;
          if(typeof _this.config.onReset === 'function') {
            _this.config.onReset.call(_this);
          }
        }
        else {
          if(typeof _this.config.onError === 'function') {
            _this.config.onError.call(_this);
          }
        }
      },
      error: function() {
        if(typeof _this.config.onError === 'function') {
          _this.config.onError.call(_this);
        }
      }
    });
  },
  formatAsMetric: function(metricAlias, prefix) {
    var _this = this;
    var data = [ ];
    prefix = prefix || '';
    _.each(this.data, function(v, k) {
      var obj = { };
      var _value = (typeof v[prefix + metricAlias] !== 'undefined') ? v[prefix + metricAlias] : false;
      obj = {
        value: _value,
        date: v.timestamp
      };
      if(prefix) {
        obj.key = prefix;
      }
      data.push(obj);
    });

    this._setDelayBoundariesForMetric(data, metricAlias);
    return data;
  },
  _setDelayBoundariesForMetric: function(metricPoints, metricAlias) {
    var _this = this;
    var _delaySwitch = false, _timestampDifference, _previousMetric, _startValue, _startKey;
    _.each(metricPoints, function(v, k) {

      var _isDelayEnd = v.value !== null && _delaySwitch === true;
      var _isDelayStart = v.value === null && _delaySwitch === false;

      var _now = moment();
      var _mininumDifference = _this.config.minDifference * 1000;

      // We'll shiv the previous value into the ones which don't have a value. (Pt. 1)
      if(_isDelayStart) {
         _startKey = k;
        if(metricPoints[k-1]) {
          _startValue = metricPoints[k-1].value;

        }
        else {
          _startValue = 0;
        }
      }

      // Get the previous metric if the delay has just ended.
      if(_isDelayEnd) {
        for(var i = (k-1); i >= _startKey; i--) {
          // We'll shiv the previous value into the ones which don't have a value. (Pt. 2)
          metricPoints[i].value = _startValue;

          if(metricPoints[i].startDelay) {
            _previousMetric = metricPoints[i];
            _timestampDifference = Math.abs(v.date - _previousMetric.date);
            break;
          }
        }

        if(_timestampDifference < _mininumDifference) {
          // Reset the start delay if the delay isn't significant enough.
          _previousMetric.startDelay = false;
          _isDelayEnd = false;
          _delaySwitch = false;
        }
      }

      v.startDelay = _isDelayStart;
      v.endDelay = _isDelayEnd;
      if(_isDelayStart) {
        _delaySwitch = true;
      }
      else if(_isDelayEnd) {
        _delaySwitch = false;
      }

    });


  }
});

module.exports = GraphData;
