import _ from 'underscore';
import template from './dimStores.directive.html';
import './dimStores.scss';

export const StoresComponent = {
  controller: StoresCtrl,
  controllerAs: 'vm',
  bindings: {
    stores: '<',
    buckets: '<'
  },
  template
};

function StoresCtrl(dimSettingsService, $scope, dimPlatformService, loadingTracker, dimBucketService, dimInfoService, $i18next) {
  'ngInject';

  const vm = this;
  const didYouKnowTemplate = `<p>${$i18next.t('DidYouKnow.Collapse')}</p>
                              <p>${$i18next.t('DidYouKnow.Expand')}</p>`;
  // Only show this once per session
  const didYouKnow = _.once(() => {
    dimInfoService.show('collapsed', {
      title: $i18next.t('DidYouKnow.DidYouKnow'),
      body: didYouKnowTemplate,
      hide: $i18next.t('DidYouKnow.DontShowAgain')
    });
  });

  vm.buckets = null;
  vm.settings = dimSettingsService;
  vm.toggleSection = function(id) {
    // Only tip when collapsing
    if (!vm.settings.collapsedSections[id]) {
      didYouKnow();
    }
    vm.settings.collapsedSections[id] = !vm.settings.collapsedSections[id];
    vm.settings.save();
  };

  // TODO: angular media-query-switch directive
  const phoneWidthQuery = window.matchMedia('(max-width: 414px)');
  function phoneWidthHandler(e) {
    $scope.$apply(() => {
      vm.isPhonePortrait = e.matches;
    });
  }
  phoneWidthQuery.addListener(phoneWidthHandler);
  vm.isPhonePortrait = phoneWidthQuery.matches;

  vm.$onChanges = function() {
    vm.vault = _.find(vm.stores, 'isVault');

    if (!vm.buckets) {
      // TODO: deferring this to prevent manifest load... wise?
      dimBucketService.getBuckets().then((buckets) => {
        vm.buckets = buckets;
      });
    }

    if (vm.stores && vm.stores.length) {
      vm.currentStore = vm.stores[0];
    } else {
      vm.currentStore = null;
    }
  };
}
