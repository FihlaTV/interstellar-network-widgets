let preSendWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-network-widgets/pre-send-widget"
  }
};

module.exports = function(mod) {
  mod.directive("preSend", preSendWidget);
};
