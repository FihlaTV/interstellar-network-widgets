let historyWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-network-widgets/history-widget"
  }
};

module.exports = function(mod) {
  mod.directive("history", historyWidget);
};
