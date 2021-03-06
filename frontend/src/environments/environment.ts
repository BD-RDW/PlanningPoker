declare var require: any;

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appVersion: require('../../package.json').version + '-dev',
  production: false,
  CHART_COLORS: ['#FF6384', '#36A2EB', '#FFCE56', '#33cccc', '#33cc33', '#ffff00', '#ff9999', '#0000ff', '#006600', '#996600', '#993399', '#666699'],
  CARD_SYMBOLS: ['½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'coffee']
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
