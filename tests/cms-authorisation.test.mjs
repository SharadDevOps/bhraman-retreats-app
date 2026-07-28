import test from "node:test";
import assert from "node:assert/strict";
import { isRoleAllowed } from "../src/lib/cms-validation.mjs";

test("content editors can manage content entities", () => {
  assert.equal(isRoleAllowed("CONTENT_EDITOR", ["CONTENT_EDITOR", "SUPER_ADMIN"]), true);
});

test("booking managers cannot edit content entities", () => {
  assert.equal(isRoleAllowed("BOOKING_MANAGER", ["CONTENT_EDITOR", "SUPER_ADMIN"]), false);
});

test("booking managers can manage enquiries", () => {
  assert.equal(isRoleAllowed("BOOKING_MANAGER", ["BOOKING_MANAGER", "SUPER_ADMIN"]), true);
});

test("super admins can manage both content and enquiries", () => {
  assert.equal(isRoleAllowed("SUPER_ADMIN", ["CONTENT_EDITOR", "SUPER_ADMIN"]), true);
  assert.equal(isRoleAllowed("SUPER_ADMIN", ["BOOKING_MANAGER", "SUPER_ADMIN"]), true);
});

test("guest and unknown roles are denied", () => {
  assert.equal(isRoleAllowed("GUEST", ["CONTENT_EDITOR", "SUPER_ADMIN"]), false);
  assert.equal(isRoleAllowed("OWNER", ["SUPER_ADMIN"]), false);
});
