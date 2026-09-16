import { describe, expect, it } from "bun:test";
import { ac, roles } from "./permissions";

describe("権限・ロール設定", () => {
	it("アクセスコントロールが定義されている", () => {
		expect(ac).toBeDefined();
		expect(typeof ac).toBe("object");
	});

	it("ロールが定義されている", () => {
		expect(roles).toBeDefined();
		expect(typeof roles).toBe("object");
	});

	it("adminロールが存在する", () => {
		expect(roles.admin).toBeDefined();
	});

	it("professorロールが存在する", () => {
		expect(roles.professor).toBeDefined();
	});

	it("studentロールが存在する", () => {
		expect(roles.student).toBeDefined();
	});

	it("すべてのロールにステートメントが含まれている", () => {
		const roleKeys = Object.keys(roles);
		roleKeys.forEach((roleKey) => {
			const role = roles[roleKey as keyof typeof roles];
			expect(role).toBeDefined();
			expect(typeof role).toBe("object");
		});
	});
});
