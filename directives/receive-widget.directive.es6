let receiveWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-network-widgets/receive-widget"
  }
};

module.exports = function(mod) {
  mod.directive("receive", receiveWidget);
};
