import { passkey } from "@better-auth/passkey";
import { db } from "@lms-repo/db";
import * as schema from "@lms-repo/db/schema/auth";
import { env } from "@lms-repo/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor } from "better-auth/plugins";

const authConfig = {
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: true,
		resetPasswordTokenExpiresIn: 3600, // 1 hour
		// async sendResetPassword({user, url}) {
		//     await resend.emails.send({
		//         from: 'onboarding@resend.dev',
		//         to: user.email,
		//         subject: 'パスワードの変更',
		//         react: ResetPasswordEmail({
		//             email: user.email,
		//             url
		//         }),
		//     });
		// },
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 3600,
		// async sendVerificationEmail({user, url}) {
		//     const redirectUrl = new URL(url);
		//     redirectUrl.searchParams.set('callbackURL', '/two-factor');
		//     await resend.emails.send({
		//         from: 'onboarding@resend.dev',
		//         to: user.email,
		//         subject: '新規ログインの確認',
		//         react: ConfirmSignUpEmail({
		//             email: user.email,
		//             url: redirectUrl.toString()
		//         }),
		//     });
		// }
	},
	user: {
		// deleteUser: {
		//     enabled: true,
		//     async sendDeleteAccountVerification({user, url}) {
		//         await resend.emails.send({
		//             from: 'onboarding@resend.dev',
		//             to: user.email,
		//             subject: 'アカウント削除の確認',
		//             react: DeleteAccountEmail({
		//                 email: user.email,
		//                 url
		//             }),
		//         });
		//     },
		// }
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none" as const,
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		admin(),
		twoFactor({
			// otpOptions: {
			//     async sendOTP({user, otp}) {
			//         await resend.emails.send({
			//             from: 'onboarding@resend.dev',
			//             to: user.email,
			//             subject: 'OTP認証',
			//             react: OtpNotificationEmail({
			//                 email: user.email,
			//                 otpCode: otp
			//             }),
			//         });
			//     },
			// },
			skipVerificationOnEnable: true,
		}),
		passkey(),
	],
	socialProviders: {
		// github: {
		//     clientId: serverEnv.GITHUB_CLIENT_ID,
		//     clientSecret: serverEnv.GITHUB_CLIENT_SECRET
		// },
		// google: {
		//     clientId: serverEnv.GOOGLE_CLIENT_ID,
		//     clientSecret: serverEnv.GOOGLE_CLIENT_SECRET
		// },
		// twitter: {
		//     clientId: serverEnv.TWITTER_CLIENT_ID,
		//     clientSecret: serverEnv.TWITTER_CLIENT_SECRET
		// }
	},
};

export const auth = betterAuth(authConfig);

export type Session = typeof auth.$Infer.Session;
