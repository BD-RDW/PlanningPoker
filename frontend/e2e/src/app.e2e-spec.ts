import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('Scrum tooling App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('Home page should have the correct elements en texts', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('Scrum tooling');
    expect(await browser.getTitle()).toEqual('PlanningSession');
    expect(await element(by.tagName('app-retro-session'))).toBeTruthy();
    expect(await element(by.id('p-tabpanel-0-label')).all(by.xpath('span')).first().getText()).toBe('Home');
    expect(await element(by.id('p-tabpanel-1-label'))).toBeTruthy();
    expect(await element(by.id('p-tabpanel-1-label')).all(by.xpath('span')).first().getText()).toBe('Retrospective');
    expect(await element(by.id('p-tabpanel-2-label'))).toBeTruthy();
    expect(await element(by.id('p-tabpanel-2-label')).all(by.xpath('span')).first().getText()).toBe('Poker');
    expect(await element(by.tagName('app-status'))).toBeTruthy();
    expect(await element(by.tagName('app-status')).getText()).toBe('Status...');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
