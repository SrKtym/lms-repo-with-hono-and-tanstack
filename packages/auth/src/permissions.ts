import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	userAc,
} from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

export const roles = {
	admin: ac.newRole(adminAc.statements),
	professor: ac.newRole(userAc.statements),
	student: ac.newRole(userAc.statements),
};
