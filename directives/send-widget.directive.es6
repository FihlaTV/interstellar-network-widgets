let sendWidget = function () {
  return {
    restrict: "E",
    templateUrl: "interstellar-network-widgets/send-widget",
    scope: true
  }
};

module.exports = function(mod) {
  mod.directive("send", sendWidget);
};
