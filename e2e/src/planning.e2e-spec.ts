import { AppPage } from './app.po';
import {browser, by, element, logging, until} from 'protractor';

let page: AppPage;

beforeEach(() => {
  page = new AppPage();
});

describe('Planning session', () => {
  it('Default Planning page should been selectable and have the correct elements en texts', async () => {
  await page.navigateTo();
  await element(by.id('p-tabpanel-2-label')).click();
  expect(await element(by.id('planning_username')).isPresent()).toBeTruthy();
  expect(await element(by.id('new_planning_session')).isPresent()).toBeTruthy();
  expect(await element(by.id('planning_session_id')).isPresent()).toBeTruthy();
  expect(await element(by.id('join_planning_session')).isPresent()).toBeTruthy();
  expect(await element(by.id('controlePanel')).isPresent()).toBeFalsy();
  expect(await element(by.css('retrospective-panel')).isPresent()).toBeFalsy();
  expect(await element(by.css('user-panel')).isPresent()).toBeFalsy();
  });

  it('Planning page after login should been selectable and have the correct elements en texts', async () => {
    await page.navigateTo();
    await element(by.id('p-tabpanel-2-label')).click();
    expect(await element(by.id('planning_username'))).toBeTruthy();
    expect(await element(by.id('new_planning_session'))).toBeTruthy();
    expect(await element(by.id('planning_session_id'))).toBeTruthy();
    expect(await element(by.id('join_planning_session'))).toBeTruthy();
    expect(await element(by.id('controlePanel')).isPresent()).toBeFalsy();
    expect(await element(by.css('retrospective-panel')).isPresent()).toBeFalsy();
    expect(await element(by.css('user-panel')).isPresent()).toBeFalsy();
  });


});

afterEach(async () => {
  // Assert that there are no errors emitted from the browser
  const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  expect(logs).not.toContain(jasmine.objectContaining({
    level: logging.Level.SEVERE,
  } as logging.Entry));
});

