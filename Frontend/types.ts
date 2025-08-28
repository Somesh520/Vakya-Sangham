// src/navigation/types.ts

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  OTPVerification: { email: string };
  DateOfBirth: undefined;
  AboutYou: { dateOfBirth: string };
  SkillLevel: undefined;
  GetStarted: undefined;
  EditProfile: { preferredLanguage?: string } | undefined;
  StudentHome: undefined;
  TeacherHome: undefined;
  AdminHome: undefined;
 ForgotPassword: undefined;             // ✅ Is line ko add karo
  ResetPassword: { token: string }; 
};