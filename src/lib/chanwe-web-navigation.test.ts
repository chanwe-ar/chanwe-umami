import { getAllByRole, getByRole, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

beforeAll(async () => {
  await import('./chanwe-web-navigation.mjs');
});
beforeEach(() => {
  document.body.innerHTML = '';
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          name: 'Ana',
          email: 'ana@example.test',
          photo: 'data:image/png;base64,YWJj',
          jobTitle: 'Consultant',
          roles: ['Consultant'],
          access: ['Calendar'],
        }),
      ),
  );
  delete window.__CHANWE_DESKTOP__;
});
function mount(extra: Record<string, unknown> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const navigation = window.ChanweWebNavigation;
  if (!navigation) throw new Error('Navigation adapter did not initialize');
  const destroy = navigation.mount(host, {
    locale: 'en',
    logoutHref: '/auth/logout',
    getTheme: () => 'light',
    onTheme: vi.fn(),
    onLocale: vi.fn(),
    ...extra,
  });
  return { host, destroy, user: userEvent.setup() };
}
test('the app grid and avatar stay visible while utilities live under one trigger', async () => {
  const { host, destroy, user } = mount();
  expect(getByRole(host, 'link', { name: 'Apps' })).toHaveAttribute(
    'href',
    'https://espacios.chanwe.ar/',
  );
  expect(getByRole(host, 'button', { name: 'Account' })).toBeVisible();
  expect(queryByRole(host, 'menu')).not.toBeInTheDocument();
  await user.click(getByRole(host, 'button', { name: 'Options' }));
  expect(getAllByRole(host, 'menuitem')).toHaveLength(4);
  expect(getByRole(host, 'menuitem', { name: 'Sign out' })).toHaveAttribute('href', '/auth/logout');
  await user.keyboard('{Escape}');
  expect(queryByRole(host, 'menu')).not.toBeInTheDocument();
  expect(getByRole(host, 'button', { name: 'Options' })).toHaveFocus();
  destroy();
});
test('language expansion remains open and delegates the choice to the provider', async () => {
  const onLocale = vi.fn();
  const { host, destroy, user } = mount({ onLocale });
  await user.click(getByRole(host, 'button', { name: 'Options' }));
  await user.click(getByRole(host, 'menuitem', { name: 'Language · EN' }));
  expect(getAllByRole(host, 'menuitemradio')).toHaveLength(4);
  await user.click(getByRole(host, 'menuitemradio', { name: 'Italiano' }));
  expect(onLocale).toHaveBeenCalledWith('it');
  expect(queryByRole(host, 'menu')).not.toBeInTheDocument();
  destroy();
});
test('a provider preference failure stays visible instead of claiming success', async () => {
  const { host, destroy, user } = mount({ onTheme: () => Promise.reject(new Error('provider')) });
  await user.click(getByRole(host, 'button', { name: 'Options' }));
  await user.click(getByRole(host, 'menuitem', { name: 'Dark theme' }));
  expect(getByRole(host, 'alert')).toHaveTextContent('Could not save the change.');
  destroy();
});
test('desktop does not mount or replace native controls', () => {
  window.__CHANWE_DESKTOP__ = { engine: 'electron' };
  const { host, destroy } = mount();
  expect(host).toBeEmptyDOMElement();
  destroy();
});

test('account preview uses the photo and self summary, then links to Espacios Cuenta', async () => {
  const { host, destroy, user } = mount();
  await user.click(getByRole(host, 'button', { name: 'Account' }));
  const dialog = getByRole(host, 'dialog', { name: 'Account' });
  expect(dialog).toHaveTextContent('ana@example.test');
  expect(dialog).toHaveTextContent('Consultant');
  expect(dialog).toHaveTextContent('Calendar');
  expect(getByRole(dialog, 'link', { name: 'Go to profile' })).toHaveAttribute(
    'href',
    'https://espacios.chanwe.ar/?tab=profile',
  );
  expect(host.querySelector('img')).toHaveAttribute('src', 'data:image/png;base64,YWJj');
  await user.keyboard('{Escape}');
  expect(queryByRole(host, 'dialog')).not.toBeInTheDocument();
  expect(getByRole(host, 'button', { name: 'Account' })).toHaveFocus();
  destroy();
});
