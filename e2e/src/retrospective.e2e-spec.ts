import { AppPage } from './app.po';
import {browser, by, element, logging, until} from 'protractor';

let page: AppPage;

beforeEach(() => {
  page = new AppPage();
});

describe('Retropspective session', () => {
  it('Default Retrospective page should been selectable and have the correct elements en texts', async () => {
    await page.navigateTo();
    await element(by.id('p-tabpanel-1-label')).click();
    expect(await element(by.id('retro_username'))).toBeTruthy();
    expect(await element(by.id('new_retro_session'))).toBeTruthy();
    expect(await element(by.id('retro_session_id'))).toBeTruthy();
    expect(await element(by.id('join_retro_session'))).toBeTruthy();
    expect(await element(by.id('controlePanel')).isPresent()).toBeFalsy();
    expect(await element(by.css('retrospective-panel')).isPresent()).toBeFalsy();
    expect(await element(by.css('user-panel')).isPresent()).toBeFalsy();
  });

  it('Retrospective page after login should been selectable and have the correct elements en texts', async () => {
    await page.navigateTo();
    await element(by.id('p-tabpanel-1-label')).click();
    await element(by.id('retro_username')).sendKeys('Jan');
    await element(by.id('new_retro_session')).click();

    expect(await element(by.id('controlePanel')).isPresent()).toBeTruthy();
    expect(await element(by.id('retroMainpanel')).isPresent()).toBeTruthy();
    expect(await element(by.id('userPanel')).isPresent()).toBeTruthy();

    expect(await element(by.id('retro_username')).isPresent()).toBeFalsy();
    expect(await element(by.id('new_retro_session')).isPresent()).toBeFalsy();
    expect(await element(by.id('retro_session_id')).isPresent()).toBeFalsy();
    expect(await element(by.id('join_retro_session')).isPresent()).toBeFalsy();

    // Check left user panel
    expect(await element(by.id('userPanel')).all(by.tagName('ul/li')).length).toBe(1);
    expect(await element(by.id('userPanel')).all(by.tagName('ul/li')).get(0).getText()).toBe('Jan');

    // check right session status panel
    expect(await element(by.id('controlePanel')).all(by.tagName('div/label')).length).toBe(2);
    expect(await (await element(by.id('controlePanel')).all(by.tagName('div/label')).get(0).getText()).substring(0, 9)).toBe('Session: ');
    expect(await (await element(by.id('controlePanel')).all(by.tagName('div/label')).get(0).getText()).substring(9).length).toBe(11);
    expect(await (await element(by.id('controlePanel')).all(by.tagName('div/label')).get(1).getText()).substring(0, 9)).toBe('User: Jan');
  });


});

afterEach(async () => {
  // Assert that there are no errors emitted from the browser
  const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  expect(logs).not.toContain(jasmine.objectContaining({
    level: logging.Level.SEVERE,
  } as logging.Entry));
});

