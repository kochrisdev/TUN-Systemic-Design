import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';

function tokens(): {operator:string;reviewer:string} {
  return JSON.parse(readFileSync(new URL('../../../.host-test-access.json', import.meta.url), 'utf8'));
}
async function connect(page: Page, role: 'operator' | 'reviewer' = 'operator') {
  await page.goto('/');
  await page.getByLabel('Local access token').fill(tokens()[role]);
  await page.getByRole('button', {name: 'Connect',exact:true}).click();
  await expect(page.getByRole('button', {name:'Refresh server records'})).toBeVisible();
}
async function prepare(page: Page) {
  await page.getByRole('textbox', {name:'Project update text'}).fill('A sandbox project update: ' + test.info().title);
  await page.getByRole('button', {name:'Prepare server proposal',exact:true}).click();
  await expect(page.getByRole('button', {name:'Authorize local publication',exact:true})).toBeEnabled();
}
async function approve(page: Page) {
  await prepare(page);
  await page.getByRole('button', {name:'Authorize local publication',exact:true}).click();
  await expect(page.getByRole('button', {name:'Execute authorized action',exact:true})).toBeEnabled();
}
async function selectedOperation(page: Page): Promise<{id:string;state:string;receipt:unknown}> {
  const snapshot = await page.request.get('/api/snapshot', { headers: { Authorization: `Bearer ${tokens().operator}` } });
  const body = await snapshot.json();
  const key = await page.getByLabel('Stored proposals and revisions').inputValue();
  return body.operations.find((op: {proposalId:string;proposalVersion:string}) => `${op.proposalId}:${op.proposalVersion}` === key);
}

test('real provider write cannot display success before server readback', async ({ page }, info) => {
  await connect(page); await approve(page);
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  expect((await selectedOperation(page)).state).toBe('authorized');
  await page.getByRole('button', {name:'Execute authorized action',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Provider returned — not verified');
  expect((await selectedOperation(page)).receipt).toBeNull();
  const oid = (await selectedOperation(page)).id;
  const board = await page.request.get('/api/board', { headers: { Authorization: `Bearer ${tokens().operator}` } });
  expect((await board.json()).posts.some((p: {id:string}) => p.id === oid)).toBe(true);
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await page.getByRole('button', {name:'Refresh server records',exact:true}).click();
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('before-verification.png'),fullPage:true});
  await page.getByRole('button', {name:'Verify with server',exact:true}).click();
  await expect(page.locator('.tun-receipt .tun-badge')).toHaveText('Completed');
  await expect(page.locator('.tun-receipt')).toContainText('Server readback matched');
  expect((await selectedOperation(page)).state).toBe('verified');
  await page.screenshot({path:info.outputPath('after-verification.png'),fullPage:true});
});

test('real lost HTTP acknowledgement reconciles the same durable operation', async ({ page }) => {
  await connect(page); await approve(page);
  const oid = (await selectedOperation(page)).id;
  await page.getByLabel('Local failure scenario').selectOption('drop-ack');
  await page.getByRole('button', {name:'Execute authorized action',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Outcome unknown — inspect this operation');
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Execute authorized action',exact:true})).toBeDisabled();
  await page.reload(); await page.getByLabel('Local access token').fill(tokens().operator);
  await page.getByRole('button', {name:'Connect',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Outcome unknown — inspect this operation');
  await page.getByRole('button', {name:'Verify with server',exact:true}).click();
  await expect(page.locator('.tun-receipt .tun-badge')).toHaveText('Completed');
  expect((await selectedOperation(page)).id).toBe(oid);
  const board = await page.request.get('/api/board', {headers:{Authorization:`Bearer ${tokens().operator}`}});
  expect((await board.json()).posts.filter((p:{id:string})=>p.id===oid)).toHaveLength(1);
});

test('provider absence remains unknown after verification and does not enable retry', async ({ page }) => {
  await connect(page); await approve(page);
  await page.getByLabel('Local failure scenario').selectOption('before-write');
  await page.getByRole('button', {name:'Execute authorized action',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Outcome unknown — inspect this operation');
  await page.getByRole('button', {name:'Verify with server',exact:true}).click();
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Execute authorized action',exact:true})).toBeDisabled();
});

test('server revocation defeats a stale authorized browser', async ({ page, browser }) => {
  await connect(page); await approve(page);
  const other = await browser.newPage({ baseURL: 'http://127.0.0.1:4180' });
  try {
    await connect(other);
    await other.getByRole('button',{name:'Revoke write permission',exact:true}).click();
    await expect(other.getByRole('button',{name:'Restore write permission',exact:true})).toBeVisible();
    // First page still has enabled controls based on its old snapshot.
    await page.getByRole('button',{name:'Execute authorized action',exact:true}).click();
    await expect(page.locator('.operation-state')).toHaveText('Authorized — not executed');
    await expect(page.locator('.tun-receipt')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Execute authorized action',exact:true})).toBeDisabled();
    expect((await selectedOperation(page)).state).toBe('authorized');
  } finally {
    await other.request.post('/api/session/permission',{headers:{Authorization:`Bearer ${tokens().operator}`},data:{canWrite:true}});
    await other.close();
  }
});

test('separate withdrawal requires approval and preserves the original receipt', async ({ page }) => {
  await connect(page); await approve(page);
  const original = (await selectedOperation(page)).id;
  await page.getByRole('button',{name:'Execute authorized action',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Provider returned — not verified');
  await page.getByRole('button',{name:'Verify with server',exact:true}).click();
  await page.getByRole('button',{name:'Prepare separate withdrawal',exact:true}).click();
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await page.getByRole('button',{name:'Authorize local withdrawal',exact:true}).click();
  await page.getByRole('button',{name:'Execute authorized action',exact:true}).click();
  await expect(page.locator('.operation-state')).toHaveText('Provider returned — not verified');
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
  await page.getByRole('button',{name:'Verify with server',exact:true}).click();
  await expect(page.locator('.tun-receipt')).toContainText('The original history is retained.');
  const all = await page.request.get('/api/snapshot',{headers:{Authorization:`Bearer ${tokens().operator}`}});
  expect((await all.json()).operations.find((o:{id:string})=>o.id===original).receipt).not.toBeNull();
});

test('local host stays usable at 320px with named controls', async ({ page }) => {
  await page.setViewportSize({width:320,height:900});
  await connect(page); await prepare(page);
  await page.evaluate(axe.source);
  const violations = await page.evaluate(async () => (await (window as any).axe.run()).violations);
  expect(violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Authorize local publication',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.operation-state')).toHaveText('Authorized — not executed');
  await expect(page.locator('.tun-receipt')).toHaveCount(0);
});
