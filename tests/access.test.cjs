const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadSource(path, imports, globals = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: imports, ...globals });
  return exports;
}

const { WorkspaceModes } = loadSource('src/_constants/workspaceModes.ts', () => ({}));
const routes = loadSource('src/app/routeConfig.ts', name => name === '_constants/workspaceModes' ? { WorkspaceModes } : ({}));
const work = { key: 'work:a', mode: WorkspaceModes.Work, organizationId: 'a', permissions: [] };
const patient = { key: 'patient', mode: WorkspaceModes.Patient, permissions: [] };
const platform = { key: 'platform', mode: WorkspaceModes.Platform, permissions: [] };

test('work navigation keeps restricted pages visible but denies opening them', () => {
  const entries = routes.default.filter(row => row.modes.includes(WorkspaceModes.Work)).flatMap(row => row.children ?? [row]);
  assert.ok(entries.some(row => row.path === '/ehr/patient-ehrs'));
  assert.ok(entries.some(row => row.path === '/organization/access-roles'));
  assert.equal(routes.canOpenPath('/ehr/patient-ehrs', work), false);
  assert.equal(routes.canOpenPath('/organization/access-roles', work), false);
  assert.equal(routes.canOpenPath('/organization/your-organization', work), true);
});

test('one account can have different permissions at two organizations', () => {
  const a = { ...work, permissions: ['clinical-records.read'] };
  const b = { ...work, key: 'work:b', organizationId: 'b' };
  assert.equal(routes.canOpenPath('/ehr/patient-ehrs', a), true);
  assert.equal(routes.canOpenPath('/ehr/patient-ehrs', b), false);
});

test('clinical actions require a grant and a selected assignment', () => {
  const clinician = { ...work, permissions: ['clinical-records.write', 'encounters.start'] };
  assert.equal(routes.canOpenPath('/ehr/create', clinician), false);
  assert.equal(routes.canOpenPath('/encounter', clinician), false);
  assert.equal(routes.canOpenPath('/ehr/create', { ...clinician, practitionerRoleId: 'assignment' }), true);
});

test('patient history needs no organization grant and cannot open staff pages', () => {
  assert.equal(routes.canOpenPath('/ehr/your-ehrs', patient), true);
  assert.equal(routes.canOpenPath('/ehr/patient-ehrs', patient), false);
  assert.equal(routes.canOpenPath('/patient/view', patient), false);
  assert.equal(routes.canOpenPath('/appointments/create', patient), true);
});

test('platform administration does not open clinical pages', () => {
  assert.equal(routes.canOpenPath('/organization/add', platform), true);
  assert.equal(routes.canOpenPath('/ehr/patient-ehrs', platform), false);
  assert.equal(routes.canOpenPath('/ehr/prescriptions/view/record', platform), false);
});

test('direct detail URLs use the same permission boundary', () => {
  assert.equal(routes.canOpenPath('/organization/edit/a', work), false);
  assert.equal(routes.canOpenPath('/appointments/view/booking', work), false);
  assert.equal(routes.canOpenPath('/ehr/prescriptions/view/record', work), false);
  assert.equal(routes.canOpenPath('/account/edit', work), true);
});

test('API calls capture the workspace and support query cancellation', async () => {
  let selected = 'work:a';
  const requests = [];
  const hook = loadSource('src/_hooks/_api/useQueryFunction.ts', name => {
    if (name === 'react') return { useState: () => [false, () => {}] };
    if (name === '_context/_workspace/workspaceContext') return { useWorkspace: () => ({ workspace: { key: selected } }) };
    if (name === '_utils/requestApi') return { requestApi: async (options, key, signal) => { requests.push({ options, key, signal }); return { isSuccess: true, data: [] }; } };
    return {};
  });
  const first = hook.default().createQueryFunction({ path: '/Patient/Me', method: 'GET', accessToken: 'test-token' });
  selected = 'work:b';
  const second = hook.default().createQueryFunction({ path: '/Patient/Me', method: 'GET', accessToken: 'test-token' });
  const controller = new AbortController();
  await first({ signal: controller.signal });
  await second();
  assert.equal(requests[0].key, 'work:a');
  assert.equal(requests[1].key, 'work:b');
  controller.abort();
  assert.equal(requests[0].signal.aborted, true);
});

function createHookHarness(path, imports, globals = {}) {
  const slots = [];
  const effects = [];
  let cursor = 0;
  const react = {
    createContext: () => ({ Provider: Symbol('Provider') }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect) {
      const index = cursor++;
      if (!(index in slots)) { slots[index] = true; effects.push(effect); }
    },
  };
  const jsx = (type, props) => ({ type, props });
  const module = loadSource(path, name => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    return imports(name);
  }, globals);
  return {
    effects,
    render(name, props = {}) { cursor = 0; return module[name](props); },
  };
}

const tick = () => new Promise(resolve => setImmediate(resolve));

function userHarness(savedToken, handler) {
  const storage = new Map(savedToken ? [['accessToken', savedToken]] : []);
  const requests = [];
  const user = { id: 'account', personId: 'person', firstName: 'Sam' };
  const harness = createHookHarness('src/_context/_user/userContext.tsx', name => {
    if (name === '_utils/requestApi') return { requestApi: async options => {
      requests.push(options);
      if (handler) return handler(options);
      return { isSuccess: true, data: options.path === '/Users/Login' ? { accessToken: 'new-token', user } : user };
    } };
    if (name === '@/constants') return { API_PATHS: { login: '/Users/Login', getUser: '/Users/GetUser' } };
    if (name === '@tanstack/react-query') return { useQueryClient: () => ({ cancelQueries: async () => {}, clear() {} }) };
    return {};
  }, { localStorage: {
    getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key),
  } });
  const context = () => harness.render('UserProvider').props.value;
  context();
  return { context, effects: harness.effects, requests, storage };
}

function workspaceHarness(choices, handler) {
  const requests = [];
  const listeners = new Map();
  let clears = 0;
  const harness = createHookHarness('src/_context/_workspace/workspaceContext.tsx', name => {
    if (name === '_utils/requestApi') return { requestApi: async (options, key) => {
      requests.push({ options, key });
      if (handler) return handler(options, key);
      return { isSuccess: true, data: options.path === '/Workspace' ? choices : choices.find(row => row.key === key) };
    } };
    if (name === '@tanstack/react-query') return { useQueryClient: () => ({ cancelQueries: async () => {}, clear() { clears++; } }) };
    return {};
  }, { window: { setInterval() { return 1; }, clearInterval() {}, addEventListener(name, fn) { listeners.set(name, fn); }, removeEventListener(name) { listeners.delete(name); } } });
  const context = () => harness.render('WorkspaceStateProvider', { token: 'token' }).props.value;
  context();
  return { context, effects: harness.effects, requests, listeners, clears: () => clears };
}

test('login uses its returned basic user and does not call GetUser again', async () => {
  const auth = userHarness();
  await auth.context().loginUser({ email: 'test@example.test', password: 'test' });
  assert.equal(auth.context().isLoggedIn, true);
  assert.equal(auth.context().user.id, 'account');
  assert.deepEqual(auth.requests.map(row => row.path), ['/Users/Login']);
});

test('restoring a login loads only the basic user', async () => {
  const auth = userHarness('saved-token');
  auth.effects[0]();
  await tick();
  assert.equal(auth.context().accessToken, 'saved-token');
  assert.deepEqual(auth.requests.map(row => row.path), ['/Users/GetUser']);
});

test('logout prevents a pending login from restoring the account', async () => {
  let finish;
  const auth = userHarness(undefined, () => new Promise(resolve => { finish = resolve; }));
  const pending = auth.context().loginUser({});
  auth.context().logout();
  finish({ isSuccess: true, data: { accessToken: 'old', user: { id: 'old' } } });
  await pending;
  assert.equal(auth.context().isLoggedIn, false);
  assert.equal(auth.storage.get('accessToken'), undefined);
});

test('each sole workspace opens directly by loading its current details', async () => {
  for (const only of [patient, platform, work]) {
    const state = workspaceHarness([only]);
    state.effects[0]();
    await tick();
    assert.equal(state.context().workspace.key, only.key);
    assert.equal(state.context().isLoading, false);
    assert.deepEqual(state.requests.map(row => row.options.path), ['/Workspace', '/Workspace/Current']);
    assert.equal(state.requests[1].key, only.key);
  }
});

test('several workspaces keep the chooser open and load only the chosen details', async () => {
  const state = workspaceHarness([work, patient]);
  state.effects[0]();
  await tick();
  assert.equal(state.context().workspace, undefined);
  assert.equal(state.requests.length, 1);
  await state.context().selectWorkspace('patient');
  assert.equal(state.context().workspace.key, 'patient');
  assert.equal(state.requests.length, 2);
  assert.equal(state.requests[1].key, 'patient');
});

test('an account without workspaces stays on the no-access screen', async () => {
  const state = workspaceHarness([]);
  state.effects[0]();
  await tick();
  assert.equal(state.context().workspace, undefined);
  assert.equal(state.context().workspaces.length, 0);
  assert.equal(state.context().isLoading, false);
});

test('a slow selection cannot overwrite a newer workspace', async () => {
  const pending = new Map();
  const state = workspaceHarness([], (options, key) => new Promise(resolve => pending.set(key, resolve)));
  const first = state.context().selectWorkspace('work:a');
  await tick();
  const second = state.context().selectWorkspace('patient');
  await tick();
  pending.get('patient')({ isSuccess: true, data: patient });
  await second;
  pending.get('work:a')({ isSuccess: true, data: work });
  await first;
  assert.equal(state.context().workspace.key, 'patient');
});

test('refreshing changed grants clears cached data and updates the current workspace', async () => {
  let grants = ['patients.read'];
  const state = workspaceHarness([work], async options => ({ isSuccess: true, data: options.path === '/Workspace' ? [work] : { ...work, permissions: grants } }));
  state.effects.forEach(effect => effect());
  await tick();
  const previous = state.context().workspaceVersion;
  grants = [];
  await state.listeners.get('focus')();
  assert.equal(state.context().workspace.permissions.length, 0);
  assert.ok(state.context().workspaceVersion > previous);
  assert.ok(state.clears() >= 2);
});

test('query results preserve false and zero without copying them into another state', () => {
  for (const value of [false, 0]) {
    const hook = loadSource('src/_hooks/_api/useAppQuery.ts', name => {
      if (name === '_context/_workspace/workspaceContext') return { useWorkspace: () => ({ workspace: work }) };
      if (name === '@tanstack/react-query') return { useQuery: options => { assert.equal(options.enabled, false); return { data: { data: value }, isFetching: false }; } };
      if (name === './useQueryFunction') return { default: () => ({ createQueryFunction() {} }) };
      return {};
    });
    assert.equal(hook.default({ path: '/test', method: 'GET' }, false).data, value);
  }
});

test('HTTP requests encode filters and include the captured token and workspace', async () => {
  let request;
  const api = loadSource('src/_utils/requestApi.ts', name => name === '@/constants' ? { API_ENDPOINT: 'https://example.test/api/v1' } : {}, {
    URL, Headers, Request, fetch: async value => { request = value; return new Response(JSON.stringify({ isSuccess: true, data: false })); },
  });
  const response = await api.requestApi({ path: '/test', method: 'GET', accessToken: 'token', queryParams: { name: 'Sam & Pat', omit: undefined } }, 'work:a');
  assert.equal(response.data, false);
  assert.equal(new URL(request.url).searchParams.get('name'), 'Sam & Pat');
  assert.equal(new URL(request.url).searchParams.has('omit'), false);
  assert.equal(request.headers.get('X-Workspace'), 'work:a');
  assert.equal(request.headers.get('Authorization'), 'Bearer token');
});

test('server errors keep their useful description', async () => {
  const api = loadSource('src/_utils/requestApi.ts', name => name === '@/constants' ? { API_ENDPOINT: 'https://example.test/api/v1' } : {}, {
    URL, Headers, Request, fetch: async () => new Response(JSON.stringify({ isSuccess: false, error: { title: 'Request failed', description: 'Choose a location in your workspace.' } }), { status: 400 }),
  });
  await assert.rejects(api.requestApi({ path: '/test', method: 'GET' }), /Choose a location in your workspace/);
});

function element(tree, type) {
  if (!tree) return undefined;
  if (Array.isArray(tree)) return tree.map(child => element(child, type)).find(Boolean);
  if (tree.type === type) return tree;
  return element(tree.props?.children, type);
}

function selectorHarness(selected = work) {
  const switched = [];
  let loggedOut = false;
  const harness = createHookHarness('src/_components/organization/workspaceSelector.tsx', name => {
    if (name === '_context') return { useUser: () => ({ accessToken: 'token', logout: () => { loggedOut = true; } }), useWorkspace: () => ({
      workspace: selected, workspaces: [work, patient],
      selectWorkspace: async key => { switched.push(key); }, logout: () => { loggedOut = true; },
    }) };
    if (name === '@/components/input') return { SelectInput: 'SelectInput' };
    if (name === '@/components/buttons') return { SecondaryButton: 'SecondaryButton' };
    if (name === '@/components/popup/confirmationDialog') return { default: 'ConfirmationDialog' };
    return {};
  });
  return { render: () => harness.render('default'), switched, loggedOut: () => loggedOut };
}

test('switching waits for confirmation, and cancelling preserves the workspace', () => {
  const selector = selectorHarness();
  element(selector.render(), 'SelectInput').props.onSelect('patient');
  assert.equal(selector.switched.length, 0);
  element(selector.render(), 'ConfirmationDialog').props.onClose();
  assert.equal(selector.switched.length, 0);
  assert.equal(element(selector.render(), 'SelectInput').props.selected, 'work:a');
  element(selector.render(), 'SelectInput').props.onSelect('patient');
  element(selector.render(), 'ConfirmationDialog').props.onConfirm();
  assert.equal(selector.switched[0], 'patient');
});

test('logout waits for confirmation, and cancelling keeps the user signed in', () => {
  const selector = selectorHarness();
  element(selector.render(), 'SecondaryButton').props.onClick();
  assert.equal(selector.loggedOut(), false);
  element(selector.render(), 'ConfirmationDialog').props.onClose();
  assert.equal(selector.loggedOut(), false);
  element(selector.render(), 'SecondaryButton').props.onClick();
  element(selector.render(), 'ConfirmationDialog').props.onConfirm();
  assert.equal(selector.loggedOut(), true);
});

test('an initial workspace choice and an unchanged selection need no switch confirmation', () => {
  const initial = selectorHarness(null);
  element(initial.render(), 'SelectInput').props.onSelect('patient');
  assert.equal(initial.switched[0], 'patient');
  assert.equal(element(initial.render(), 'ConfirmationDialog'), undefined);
  const selected = selectorHarness();
  element(selected.render(), 'SelectInput').props.onSelect('work:a');
  assert.equal(element(selected.render(), 'ConfirmationDialog'), undefined);
});

function elements(tree, type) {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}

test('an organization administrator can add practitioners without clinical permissions', () => {
  const harness = createHookHarness('src/app/organization/add-members/page.tsx', name => {
    if (name === '_context') return { useUser: () => ({ accessToken: 'token' }), useWorkspace: () => ({
      accessToken: 'token', workspace: work, user: { organizationManagerProfile: { organizationId: 'a' } },
      hasPermission: permission => permission === 'members.manage',
    }) };
    if (name === '@/hooks') return { useQueryFunction: () => ({ createQueryFunction() {}, isLoading: false }), useAppQuery: () => ({ data: [], isLoading: false }) };
    if (name === '@/components/organization/addUserForm') return { default: 'AddUserForm' };
    if (name === '@/components/input') return { RadioInput: 'RadioInput' };
    return {};
  });
  element(harness.render('default'), 'RadioInput').props.onChange('Practitioner assignment');
  const view = harness.render('default');
  assert.equal(element(view, 'fieldset').props.disabled, false);
  assert.equal(element(view, 'AddUserForm').props.userType, 'practitionerRole');
});

test('role management can edit clinical roles without holding their clinical permissions', () => {
  const harness = createHookHarness('src/app/organization/access-roles/page.tsx', name => {
    if (name === '_context') return { useUser: () => ({ accessToken: 'token' }), useWorkspace: () => ({
      accessToken: 'token', workspace: work, hasPermission: permission => permission === 'roles.manage',
    }) };
    if (name === '@/hooks') return {
      useQueryFunction: () => ({ createQueryFunction() {}, isLoading: false }),
      useAppQuery: options => ({ data: options.path === '/Workspace/Roles'
        ? [{ id: 'clinical-role', name: 'Clinician', permissions: ['clinical-records.read'] }]
        : ['roles.manage', 'clinical-records.read'], isLoading: false }),
    };
    if (name === '_utils/access') return { permissionLabels: { 'clinical-records.read': 'Read medical records' } };
    if (name === '@/components/input') return { CheckBoxInput: 'CheckBoxInput', Form: 'Form', TextInput: 'TextInput' };
    if (name === '@/components/buttons') return { SecondaryButton: 'SecondaryButton' };
    return {};
  });
  let view = harness.render('default');
  const edit = elements(view, 'SecondaryButton').find(button => button.props.buttonText === 'Edit Role');
  assert.equal(edit.props.disabled, false);
  edit.props.onClick();
  view = harness.render('default');
  const permissions = element(view, 'CheckBoxInput');
  assert.equal(permissions.props.disabled, false);
  assert.equal(permissions.props.disabledItems, undefined);
  assert.ok(permissions.props.checkedItems.includes('clinical-records.read'));
});

test('organization administrator management is restricted to platform mode', () => {
  assert.equal(routes.canOpenPath('/organization/admins', platform), true);
  assert.equal(routes.canOpenPath('/organization/admins', work), false);
  assert.equal(routes.canOpenPath('/organization/admins', patient), false);
});


function staffCreationHarness(restricted, canManage = true, roles = [{ id: 'nursing', name: 'Nursing', permissions: ['clinical-records.read'] }]) {
  const requests = [];
  const workspace = { ...work, isLocationRestricted: restricted };
  const locations = [{ id: 'root', name: 'Clinic' }, { id: 'child', name: 'Room' }];
  const harness = createHookHarness('src/app/organization/add-members/page.tsx', name => {
    if (name === '_context') return { useUser: () => ({ accessToken: 'token' }), useWorkspace: () => ({ workspace, hasPermission: permission => canManage && permission === 'members.manage' }) };
    if (name === '@/hooks') return {
      useAppQuery: (options, enabled) => { assert.equal(enabled, canManage); return { data: options.path === '/Workspace/MemberRoles' ? roles : locations, isLoading: false }; },
      useQueryFunction: () => ({ isLoading: false, createQueryFunction: options => async () => { requests.push(options); return { isSuccess: true, data: {} }; } }),
    };
    if (name === '@/constants') return { API_PATHS: { addPractitionerRole: '/Organization/AddPractitionerRole', addOrganizationMember: '/Organization/AddOrganizationMember' } };
    if (name === '@/components/input') return { SelectInput: 'SelectInput', RadioInput: 'RadioInput', CheckBoxInput: 'CheckBoxInput' };
    if (name === '@/components/organization/addUserForm') return { default: 'AddUserForm' };
    if (name === '@/components/misc') return { AppNotification: 'AppNotification' };
    return {};
  });
  return { render: () => harness.render('default'), requests };
}

test('location managers can open staff creation and only choose their returned locations', () => {
  const state = staffCreationHarness(true);
  const view = state.render();
  assert.equal(element(view, 'fieldset').props.disabled, false);
  const picker = element(view, 'SelectInput');
  assert.equal(picker.props.required, true);
  assert.deepEqual(Array.from(picker.props.options, row => row.key), ['root', 'child']);
  assert.equal(picker.props.selected, '');
});

test('restricted staff creation requires a location before sending a request', async () => {
  const state = staffCreationHarness(true);
  await element(state.render(), 'AddUserForm').props.onFormSubmit({ organizationId: 'a' });
  assert.equal(state.requests.length, 0);
  assert.equal(element(state.render(), 'AppNotification').props.notification.type, 'error');
});

test('both practitioner and ordinary staff creation send the selected location', async () => {
  for (const ordinary of [false, true]) {
    const state = staffCreationHarness(true);
    element(state.render(), 'SelectInput').props.onSelect('child');
    if (!ordinary) element(state.render(), 'RadioInput').props.onChange('Practitioner assignment');
    await element(state.render(), 'AddUserForm').props.onFormSubmit({ organizationId: 'a', personalInformation: {} });
    assert.equal(state.requests[0].payload.locationId, 'child');
    assert.equal(state.requests[0].path, ordinary ? '/Organization/AddOrganizationMember' : '/Organization/AddPractitionerRole');
  }
});

test('unrestricted managers can choose all organization locations', async () => {
  const state = staffCreationHarness(false);
  const picker = element(state.render(), 'SelectInput');
  assert.equal(picker.props.required, false);
  assert.equal(picker.props.selected, 'all');
  assert.equal(picker.props.options[0].key, 'all');
  await element(state.render(), 'AddUserForm').props.onFormSubmit({ organizationId: 'a' });
  assert.equal(state.requests[0].payload.locationId, null);
});

test('location access alone does not allow managing staff', () => {
  const state = staffCreationHarness(true, false);
  assert.equal(element(state.render(), 'fieldset').props.disabled, true);
  assert.equal(element(state.render(), 'SelectInput').props.disabled, true);
});


test('staff creation starts with generic membership and no selected access roles', () => {
  const state = staffCreationHarness(false);
  const view = state.render();
  assert.equal(element(view, 'RadioInput').props.selectedItem, 'Member');
  assert.equal(element(view, 'AddUserForm').props.userType, 'organizationMember');
  assert.equal(element(view, 'CheckBoxInput').props.checkedItems.length, 0);
  assert.equal(element(view, 'CheckBoxInput').props.disabled, false);
  assert.equal(element(view, 'CheckBoxInput').props.disabledItems, undefined);
});

test('members and practitioner titles get only explicitly selected access roles', async () => {
  for (const practitioner of [false, true]) {
    for (const selected of [[], ['nursing']]) {
      const state = staffCreationHarness(false);
      element(state.render(), 'CheckBoxInput').props.onChange(selected);
      if (practitioner) element(state.render(), 'RadioInput').props.onChange('Practitioner assignment');
      await element(state.render(), 'AddUserForm').props.onFormSubmit({ organizationId: 'a', roleName: 'Nurse' });
      assert.deepEqual(Array.from(state.requests[0].payload.accessRoleIds), selected);
      assert.equal(state.requests[0].path, practitioner ? '/Organization/AddPractitionerRole' : '/Organization/AddOrganizationMember');
      assert.equal(element(state.render(), 'CheckBoxInput').props.checkedItems.length, 0);
    }
  }
});

test('clearing staff creation also clears access role selections', () => {
  const state = staffCreationHarness(false);
  element(state.render(), 'CheckBoxInput').props.onChange(['nursing']);
  element(state.render(), 'AddUserForm').props.onClear();
  assert.equal(element(state.render(), 'CheckBoxInput').props.checkedItems.length, 0);
});

test('staff can be added without permissions when no access roles exist', async () => {
  const state = staffCreationHarness(false, true, []);
  assert.equal(element(state.render(), 'fieldset').props.disabled, false);
  await element(state.render(), 'AddUserForm').props.onFormSubmit({ organizationId: 'a' });
  assert.equal(state.requests[0].payload.accessRoleIds.length, 0);
});


test('account access does not require a selected workspace', () => {
  assert.equal(routes.canOpenPath('/account', undefined), true);
  assert.equal(routes.canOpenPath('/account/edit', undefined), true);
});

test('refresh after activation opens a sole new patient workspace', async () => {
  const available = [];
  const state = workspaceHarness(available);
  state.effects[0](); await tick();
  available.push(patient);
  await state.context().refreshWorkspaces();
  assert.equal(state.context().workspace.key, 'patient');
});

test('activation refresh preserves a selected work workspace and adds patient mode', async () => {
  const available = [work];
  const state = workspaceHarness(available);
  state.effects[0](); await tick();
  available.push(patient);
  await state.context().refreshWorkspaces();
  assert.equal(state.context().workspace.key, 'work:a');
  assert.equal(state.context().workspaces.length, 2);
});

function patientFormHarness(mode, failRefresh = false, failRequest = false) {
  const requests = [];
  let refreshes = 0;
  const values = { firstName: 'Sam', lastName: 'Patient', email: 'sam@example.test', password: 'SyntheticTest1!', confirmPassword: 'SyntheticTest1!', birthDate: '2000-01-01', gender: 'Unknown' };
  const harness = createHookHarness('src/_components/patient/patientAccessForm.tsx', name => {
    if (name === '@tanstack/react-form') return { useForm: options => ({ Field: 'Field', handleSubmit: () => options.onSubmit({ value: values }), getFieldValue: key => values[key] }) };
    if (name === '_context') return { useUser: () => ({ accessToken: 'token' }), useWorkspace: () => ({ refreshWorkspaces: async () => { refreshes++; if (failRefresh) throw new Error('Unavailable'); } }) };
    if (name === '_utils/requestApi') return { requestApi: async (...args) => { requests.push(args); if (failRequest) throw new Error('Please sign in instead.'); return { isSuccess: true, data: {} }; } };
    if (name === '@/components/input') return { Form: 'Form' };
    if (name === '@/components/misc') return { AppNotification: 'AppNotification' };
    if (name === 'next/link') return { default: 'Link' };
    return {};
  });
  return { render: () => harness.render('default', { mode }), requests, refreshes: () => refreshes };
}

test('public signup sends patient details and confirmation without a token or workspace', async () => {
  const state = patientFormHarness('signup');
  await element(state.render(), 'Form').props.action();
  const [options, workspace] = state.requests[0];
  assert.equal(options.path, '/Users/RegisterPatient');
  assert.equal(options.accessToken, undefined);
  assert.equal(workspace, undefined);
  assert.equal(options.payload.confirmPassword, 'SyntheticTest1!');
  assert.equal(options.payload.personalInformation.email, 'sam@example.test');
  assert.equal(options.payload.organizationId, undefined);
  assert.equal(state.refreshes(), 0);
  assert.equal(element(state.render(), 'Link').props.href, '/login');
});

test('enablement sends only patient details with the current token and refreshes workspaces', async () => {
  const state = patientFormHarness('enable');
  await element(state.render(), 'Form').props.action();
  const [options, workspace] = state.requests[0];
  assert.equal(options.path, '/Patient/EnableAccess');
  assert.equal(options.accessToken, 'token');
  assert.equal(workspace, undefined);
  assert.deepEqual(Object.keys(options.payload).sort(), ['birthDate', 'gender']);
  assert.equal(state.refreshes(), 1);
});

test('a workspace refresh failure does not report a successful activation as failed', async () => {
  const state = patientFormHarness('enable', true);
  await element(state.render(), 'Form').props.action();
  assert.equal(element(state.render(), 'AppNotification').props.notification.title, 'Patient access is enabled');
  assert.equal(element(state.render(), 'Form'), undefined);
});

test('a rejected signup keeps the form and shows the API error', async () => {
  const state = patientFormHarness('signup', false, true);
  await element(state.render(), 'Form').props.action();
  assert.ok(element(state.render(), 'Form'));
  assert.equal(element(state.render(), 'AppNotification').props.notification.description, 'Please sign in instead.');
});

function appShell(pathname, isLoggedIn) {
  const harness = createHookHarness('src/app/layout.tsx', name => {
    if (name === '_context') return { useUser: () => ({ isLoggedIn, user: {} }), useWorkspace: () => ({ workspaces: [], workspaceVersion: 0 }) };
    if (name === '@tanstack/react-query') return { QueryClient: class {}, QueryClientProvider: 'QueryClientProvider' };
    if (name === 'next/navigation') return { usePathname: () => pathname };
    if (name === 'next/link') return { default: 'Link' };
    if (name === './login/page') return { default: 'Login' };
    if (name === '@/approuteConfig') return { default: [], canOpenPath: () => true };
    return {};
  });
  const root = harness.render('default', { children: 'Page content' });
  function find(tree) {
    if (!tree) return;
    if (Array.isArray(tree)) return tree.map(find).find(Boolean);
    if (tree.type?.name === 'AppLayout') return tree;
    return find(tree.props?.children);
  }
  return find(root).type({ children: 'Page content' });
}

test('the app shell shows public signup instead of replacing it with login', () => {
  assert.equal(appShell('/signup', false).props.children, 'Page content');
  assert.equal(appShell('/patient/add', false).type, 'Login');
});

test('the account page remains reachable for a login with no workspaces', () => {
  const shell = appShell('/account', true);
  assert.equal(shell.type, 'main');
  assert.ok(shell.props.children.includes('Page content'));
});
