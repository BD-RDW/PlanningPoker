declare var require: any;

export const environment = {
  appVersion: require('../../package.json').version,
  production: true,
  CHART_COLORS: ['#FF6384', '#36A2EB', '#FFCE56', '#33cccc', '#33cc33', '#ffff00', '#ff9999', '#0000ff', '#006600', '#996600', '#993399', '#666699'],
  CARD_SYMBOLS: ['½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'coffee']
};
