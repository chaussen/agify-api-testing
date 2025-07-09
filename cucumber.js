module.exports = {
  default: {
    require: ['src/steps/**/*.ts'],
    format: ['progress', 'json:reports/cucumber-report.json', 'html:reports/cucumber-report.html'],
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    publishQuiet: true
  }
};