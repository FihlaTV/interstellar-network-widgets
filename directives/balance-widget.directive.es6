let balanceWidget = function () {
  return {
    restrict: "E",
    transclude: true,
    templateUrl: "interstellar-network-widgets/balance-widget"
  }
};

module.exports = function(mod) {
  mod.directive("balance", balanceWidget);
};
