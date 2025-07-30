import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-gray-800 border-gray-700",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
            socialButtonsBlockButtonText: "text-white",
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-400",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-gray-700 border-gray-600 text-white",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            footerActionLink: "text-blue-400 hover:text-blue-300",
            identityPreviewText: "text-gray-400",
            identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
          }
        }}
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
}