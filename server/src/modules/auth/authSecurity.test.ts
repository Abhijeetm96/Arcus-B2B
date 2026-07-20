import assert from 'node:assert';
import { test, describe } from 'node:test';
import { containsScriptOrHtmlTags, LoginSchema, RegisterSchema, logSecurityViolation, getSecurityLogs } from './authSecurity';

describe('Authentication Security Audit & Input Validation', () => {

  test('containsScriptOrHtmlTags detects script, HTML, and inline event triggers', () => {
    assert.strictEqual(containsScriptOrHtmlTags('Abhijeet Mohanty'), false);
    assert.strictEqual(containsScriptOrHtmlTags('Arcus Construction Pvt Ltd'), false);
    assert.strictEqual(containsScriptOrHtmlTags('https://arcus.com'), false);

    assert.strictEqual(containsScriptOrHtmlTags('<script>alert("XSS")</script>'), true);
    assert.strictEqual(containsScriptOrHtmlTags('<iframe src="javascript:alert(1)"></iframe>'), true);
    assert.strictEqual(containsScriptOrHtmlTags('<img src="x" onerror="alert(1)">'), true);
    assert.strictEqual(containsScriptOrHtmlTags('javascript:void(0)'), true);
    assert.strictEqual(containsScriptOrHtmlTags('<b>Bold Name</b>'), true);
  });

  test('LoginSchema rejects malformed or script-injected credentials', () => {
    const validLogin = LoginSchema.safeParse({
      email: 'admin@arcus.com',
      password: 'Password123!',
    });
    assert.strictEqual(validLogin.success, true);

    const scriptEmail = LoginSchema.safeParse({
      email: '<script>alert(1)</script>@arcus.com',
      password: 'Password123!',
    });
    assert.strictEqual(scriptEmail.success, false);

    const invalidEmailFormat = LoginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
    });
    assert.strictEqual(invalidEmailFormat.success, false);
  });

  test('RegisterSchema enforces strict field rules and rejects HTML in text fields', () => {
    const validRegister = RegisterSchema.safeParse({
      name: 'Abhijeet Mohanty',
      email: 'user@arcus.com',
      phone: '+919876543210',
      password: 'Password123!',
      role: 'Individual',
      city: 'Bangalore',
      state: 'Karnataka',
    });
    assert.strictEqual(validRegister.success, true);
    if (validRegister.success) {
      assert.strictEqual(validRegister.data.phone, '9876543210');
    }

    const scriptName = RegisterSchema.safeParse({
      name: 'Abhijeet <script>alert(1)</script>',
      email: 'user@arcus.com',
      phone: '9876543210',
      password: 'Password123!',
      role: 'Individual',
    });
    assert.strictEqual(scriptName.success, false);

    const weakPassword = RegisterSchema.safeParse({
      name: 'Abhijeet Mohanty',
      email: 'user@arcus.com',
      phone: '9876543210',
      password: 'short',
      role: 'Individual',
    });
    assert.strictEqual(weakPassword.success, false);
  });

  test('logSecurityViolation records attack attempts and sanitizes sensitive payload fields', () => {
    logSecurityViolation(
      '/api/auth/login',
      '192.168.1.50',
      'XSS_LOGIN_INJECTION_ATTEMPT',
      'Script tag detected in password',
      { email: 'attacker@evil.com', password: '<script>doBad()</script>' }
    );

    const logs = getSecurityLogs();
    assert.strictEqual(logs.length > 0, true);

    const lastLog = logs[0];
    assert.strictEqual(lastLog.endpoint, '/api/auth/login');
    assert.strictEqual(lastLog.ip, '192.168.1.50');
    assert.strictEqual(lastLog.reason, 'XSS_LOGIN_INJECTION_ATTEMPT');
    assert.strictEqual(lastLog.payloadSummary?.password, '[REDACTED]');
    assert.strictEqual(lastLog.payloadSummary?.email, 'attacker@evil.com');
  });

});
